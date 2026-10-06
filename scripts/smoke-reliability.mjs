import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { mergeVerificationRecords } from '../shared/reliability.mjs';

// Read only completion flags and presence of submissions; never return private
// documents, videos, e-mails or phone numbers in test output.
const records = readFileSync(process.argv[2], 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
const ids = [...new Set(records.map((record) => record.companion_id))];
const response = await fetch('https://www.pinkhousebr.com/.netlify/functions/public-reliability-scores', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ companion_ids: ids }),
});
assert.equal(response.status, 200);
assert.equal(response.headers.get('cache-control'), 'no-store');
const { success, scores } = await response.json();
assert.equal(success, true);
for (const id of ids) assert.equal(scores[id], mergeVerificationRecords(records.filter((record) => record.companion_id === id)).reliability_score, `Public score differs for ${id}`);
assert(Object.values(scores).includes(67), 'Expected existing four-task profiles to display 67%');
console.log(`PASS: ${ids.length} production profiles have matching dashboard/public scores. Percentages: ${[...new Set(Object.values(scores))].sort().join(', ')}. No records changed.`);
