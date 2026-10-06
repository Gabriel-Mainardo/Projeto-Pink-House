import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { build } from 'esbuild';
import { mergeVerificationRecords } from '../shared/reliability.mjs';

const empty = () => ({ companion_id: 'professional', reliability_score: 0 });
const tasks = [
  { email_verified: true },
  { profile_completed: true },
  { document_status: 'pending', document_front_url: 'submitted-document' },
  { photo_verified: true, photo_status: 'approved', verification_photos: ['submitted-photo'] },
  { video_status: 'pending', verification_video_url: 'submitted-video' },
  { media_comparison_status: 'pending', media_comparison_video_url: 'submitted-comparison' },
];
const percentages = [0, 17, 33, 50, 67, 83, 100];

const bundle = await build({
  entryPoints: ['netlify/functions/public-reliability-scores.js'],
  bundle: true, platform: 'node', format: 'cjs', write: false,
  external: ['@supabase/supabase-js'], logLevel: 'silent',
});
let rows = [];
const chain = {
  select() { return this; }, in() { return this; }, order() { return this; },
  then(resolve) { resolve({ data: rows, error: null }); },
};
const context = {
  exports: {}, console,
  process: { env: { SUPABASE_URL: 'https://test.invalid', SUPABASE_SERVICE_ROLE_KEY: 'test-only' } },
  require(name) {
    assert.equal(name, '@supabase/supabase-js');
    return { createClient: () => ({ from: () => chain }) };
  },
};
vm.runInNewContext(bundle.outputFiles[0].text, context);
const handler = context.exports.handler;
async function publicScore(records) {
  rows = records;
  const result = await handler({ httpMethod: 'POST', body: JSON.stringify({ companion_ids: ['professional', 'without-tasks'] }) });
  assert.equal(result.statusCode, 200);
  assert.equal(result.headers['Cache-Control'], 'no-store');
  const payload = JSON.parse(result.body);
  assert.equal(payload.scores['without-tasks'], 0);
  assert.deepEqual(Object.keys(payload).sort(), ['scores', 'success']);
  return payload.scores.professional;
}

test('Each completed task gives identical dashboard/public percentages, including 67%', async () => {
  let verification = empty();
  for (let count = 0; count <= tasks.length; count++) {
    if (count) verification = { ...verification, ...tasks[count - 1] };
    assert.equal(mergeVerificationRecords([verification]).reliability_score, percentages[count]);
    assert.equal(await publicScore([verification]), percentages[count]);
  }
});

test('Empty pending defaults and a gesture selfie alone do not grant points', async () => {
  const verification = { ...empty(), document_status: 'pending', photo_status: 'pending', video_status: 'pending', media_comparison_status: 'pending', verification_photos: ['gesture-selfie::submitted'] };
  assert.equal(mergeVerificationRecords([verification]).reliability_score, 0);
  assert.equal(await publicScore([verification]), 0);
});

test('Rejected submissions stop counting; reviewed submissions preserve their percentage', async () => {
  for (const [field, urlField] of [['document', 'document_front_url'], ['video', 'verification_video_url'], ['media_comparison', 'media_comparison_video_url']]) {
    for (const [status, verified, expected] of [['pending', false, 17], ['rejected', false, 0], ['approved', true, 17]]) {
      const verification = { ...empty(), [`${field}_status`]: status, [`${field}_verified`]: verified, [urlField]: 'submitted' };
      assert.equal(mergeVerificationRecords([verification]).reliability_score, expected);
      assert.equal(await publicScore([verification]), expected);
    }
  }
});

test('Legacy duplicate rows consolidate tasks without double counting or losing older submissions', async () => {
  const records = [
    { ...empty(), email_verified: true, profile_completed: true },
    { ...empty(), document_status: 'pending', document_front_url: 'submitted' },
    { ...empty(), photo_status: 'approved', verification_photos: ['submitted'] },
    { ...empty(), email_verified: true },
  ];
  assert.equal(mergeVerificationRecords(records).reliability_score, 67);
  assert.equal(await publicScore(records), 67);
  records.unshift({ ...empty(), document_status: 'rejected', document_front_url: 'submitted' });
  assert.equal(mergeVerificationRecords(records).reliability_score, 50);
  assert.equal(await publicScore(records), 50);
});

test('Visible public scores refresh after tasks, focus and timer, and retain values on temporary failure', async () => {
  const hookBundle = await build({
    entryPoints: ['src/hooks/useReliabilityScores.ts'], bundle: true, platform: 'node', format: 'cjs', write: false,
    external: ['react', '../services/verificationService'], logLevel: 'silent',
  });
  let effect, cleanup, state = {}, nextScores = { professional: 50 }, calls = 0, tick;
  let deferNext = false, pendingResponse;
  const window = new EventTarget();
  window.setInterval = (callback) => { tick = callback; return 1; };
  window.clearInterval = () => { tick = null; };
  const document = new EventTarget();
  document.visibilityState = 'visible';
  const hookContext = {
    module: { exports: {} }, window, document, console,
    require(name) {
      if (name === 'react') return {
        useEffect: (callback) => { effect = callback; },
        useState: () => [state, (update) => { state = update(state); }],
      };
      return { getReliabilityScoresBatch: async () => {
        calls++;
        if (deferNext) {
          deferNext = false;
          return new Promise((resolve) => { pendingResponse = resolve; });
        }
        return nextScores;
      } };
    },
  };
  vm.runInNewContext(hookBundle.outputFiles[0].text, hookContext);
  hookContext.module.exports.useReliabilityScores(['professional']);
  cleanup = effect();
  await new Promise(setImmediate);
  assert.equal(state.professional, 50);
  nextScores = { professional: 67 };
  window.dispatchEvent(new Event('pinkhouse:reliability-changed'));
  await new Promise(setImmediate);
  assert.equal(state.professional, 67);
  nextScores = { professional: 83 };
  window.dispatchEvent(new Event('focus'));
  await new Promise(setImmediate);
  assert.equal(state.professional, 83);
  nextScores = {};
  await tick();
  assert.equal(state.professional, 83);
  document.visibilityState = 'hidden';
  const before = calls;
  await tick();
  assert.equal(calls, before);
  document.visibilityState = 'visible';
  nextScores = { professional: 100 };
  document.dispatchEvent(new Event('visibilitychange'));
  await new Promise(setImmediate);
  assert.equal(state.professional, 100);
  deferNext = true;
  const inFlight = tick();
  nextScores = { professional: 83 };
  window.dispatchEvent(new Event('pinkhouse:reliability-changed'));
  pendingResponse({ professional: 67 });
  await inFlight;
  await new Promise(setImmediate);
  assert.equal(state.professional, 83, 'A task during an in-flight request must queue a fresh read');
  cleanup();
  assert.equal(tick, null);
});

test('RLS fallback does not overwrite other professionals with zero after a public API failure', async () => {
  const serviceBundle = await build({
    entryPoints: ['src/services/verificationService.ts'], bundle: true, platform: 'node', format: 'cjs', write: false,
    external: ['../lib/supabase', '@supabase/supabase-js'], logLevel: 'silent',
    define: { 'import.meta.env.VITE_SUPABASE_URL': '"https://test.invalid"', 'import.meta.env.VITE_SUPABASE_ANON_KEY': '"test-only"' },
  });
  rows = [{ ...empty(), ...tasks[0], ...tasks[1], ...tasks[2], ...tasks[3] }];
  const serviceContext = {
    module: { exports: {} }, console,
    fetch: async () => ({ ok: false }),
    require: () => ({ supabase: { from: () => chain } }),
  };
  vm.runInNewContext(serviceBundle.outputFiles[0].text, serviceContext);
  const result = await serviceContext.module.exports.getReliabilityScoresBatch(['professional', 'hidden-by-rls']);
  assert.equal(result.professional, 67);
  assert.equal(Object.hasOwn(result, 'hidden-by-rls'), false);
});
