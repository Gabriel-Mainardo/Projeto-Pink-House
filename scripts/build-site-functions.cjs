const fs = require('node:fs');
const path = require('node:path');
const { build } = require('esbuild');

// The VPS serves the existing Netlify handlers through a small HTTP adapter.
// Convert their CommonJS entry filenames before bundling in this ESM project.
const work = path.resolve('.site-functions-build');
fs.mkdirSync(path.join(work, 'source'), { recursive: true });
const names = ['admin-send-message', 'admin-verification-queue', 'check-email-suppression', 'public-reliability-scores'];
for (const name of names) {
  fs.copyFileSync(`netlify/functions/${name}.js`, path.join(work, `source/${name}.cjs`));
}
fs.writeFileSync(path.join(work, 'server.cjs'), `
const http = require('node:http');
const handlers = {
${names.map((name) => `  '${name}': require('./source/${name}.cjs').handler,`).join('\n')}
};
const server = http.createServer(async (request, response) => {
  const name = new URL(request.url, 'http://localhost').pathname.split('/').pop();
  const handler = handlers[name];
  if (!handler) { response.writeHead(404).end(); return; }
  try {
    const chunks = [];
    for await (const chunk of request) {
      chunks.push(chunk);
      if (Buffer.concat(chunks).length > 1024 * 1024) { response.writeHead(413).end(); return; }
    }
    const result = await handler({ httpMethod: request.method, headers: request.headers, body: Buffer.concat(chunks).toString('utf8'), path: request.url });
    response.writeHead(result.statusCode || 200, result.headers || {});
    response.end(result.body || '');
  } catch (error) {
    console.error('Function request failed:', error);
    response.writeHead(500, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'Internal server error' }));
  }
});
server.listen(3000, '0.0.0.0');
`);
build({ entryPoints: [path.join(work, 'server.cjs')], bundle: true, platform: 'node', target: 'node22', format: 'cjs', outfile: path.join(work, 'bundle.cjs') }).catch(() => process.exit(1));
