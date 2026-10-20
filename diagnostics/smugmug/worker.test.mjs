import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import worker, { ENDPOINT, buildRequest, capture, RunGate, sanitizeBody, sanitizeHeaders } from './core.mjs';
import { generateBase } from '../../vendor/oauth-sign-webcrypto.mjs';
const access = 'a'.repeat(43);
const env = { SMUGMUG_API_KEY: 'fictional-key', SMUGMUG_API_SECRET: 'fictional-secret', DIAGNOSTIC_ACCESS_TOKEN: access };
const url = 'https://giolina-smugmug-diagnostic.example.workers.dev';
const req = (path, method = 'GET', extra = {}) => new Request(url + path, { method, headers: { Authorization: `Bearer ${access}`, ...extra } });
const response = (body, status = 200, extra = {}) => new Response(body, { status, headers: { 'content-type': 'application/x-www-form-urlencoded', ...extra } });

test('single endpoint and independently checked HMAC/encoding', async () => {
  const input = { ...env, SMUGMUG_API_KEY: "key !*'()/+", SMUGMUG_API_SECRET: "secret !*'()/+" };
  const request = await buildRequest(input, 1700000000000, 'fixed-nonce');
  assert.equal(request.url, ENDPOINT); assert.equal(new URL(request.url).hostname, 'api.smugmug.com');
  assert.equal(request.method, 'GET'); assert.equal(request.redirect, 'manual');
  const pairs = Object.fromEntries([...request.headers.get('authorization').matchAll(/(oauth_[a-z_]+)="([^"]*)"/g)].map(m => [m[1], decodeURIComponent(m[2])]));
  const signature = pairs.oauth_signature; delete pairs.oauth_signature;
  assert.equal(pairs.oauth_timestamp, '1700000000'); assert.equal(pairs.oauth_callback, 'oob');
  assert.equal(pairs.oauth_consumer_key, input.SMUGMUG_API_KEY);
  const encode = s => encodeURIComponent(s).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
  const normalized = Object.keys(pairs).sort().map(k => encode(k) + '=' + encode(pairs[k])).join('&');
  const base = ['GET', ENDPOINT, normalized].map(encode).join('&');
  assert.equal(generateBase('GET', ENDPOINT, pairs), base);
  assert.equal(signature, createHmac('sha1', encode(input.SMUGMUG_API_SECRET) + '&').update(base).digest('base64'));
});

test('public/wrong token/missing access configuration cannot see readiness', async () => {
  for (const [request, bindings] of [[new Request(url + '/readiness'), env], [req('/readiness'), {}], [req('/readiness', 'GET', { Authorization: 'Bearer ' + 'b'.repeat(43) }), env]]) {
    const result = await worker.fetch(request, bindings); assert.equal(result.status, 401);
    assert.deepEqual(await result.json(), { error: 'unauthorized' });
  }
});
test('readiness private and offline, diagnostic disabled by default', async () => {
  const original = globalThis.fetch; globalThis.fetch = () => { throw new Error('unexpected outbound request'); };
  try {
    const ready = await worker.fetch(req('/readiness'), env); const body = await ready.json();
    assert.equal(body.actionEnabled, false); assert.equal(body.bindings.SMUGMUG_API_KEY, true);
    assert.ok(!JSON.stringify(body).includes(env.SMUGMUG_API_KEY));
    assert.equal(ready.headers.get('cache-control'), 'no-store, private');
    assert.equal((await worker.fetch(req('/diagnostic', 'POST'), env)).status, 403);
  } finally { globalThis.fetch = original; }
});
test('host, method, query and browser-origin protections', async () => {
  assert.equal((await worker.fetch(new Request('https://giolinafilms.com/readiness'), env)).status, 404);
  assert.equal((await worker.fetch(req('/readiness?token=x'), env)).status, 404);
  assert.equal((await worker.fetch(req('/diagnostic'), env)).status, 405);
  assert.equal((await worker.fetch(req('/diagnostic', 'POST', { Origin: url }), env)).status, 403);
});
test('401 evidence sanitized, timestamp real, one fetch', async () => {
  let calls = 0;
  const evidence = await capture(env, async request => { calls++; assert.equal(request.redirect, 'manual'); return response('oauth_problem=signature_invalid&oauth_token=private-token&debug_sbs=private-base', 401, { 'set-cookie': 'private-cookie', 'x-request-id': 'provider-id' }); });
  assert.equal(calls, 1); assert.equal(evidence.result, 'http_401_signature_invalid');
  assert.ok(Number.isFinite(Date.parse(evidence.requestUtc)));
  assert.equal(evidence.transportObservedRequestHeaders, null);
  assert.equal(evidence.responseBody.complete, true);
  const serialized = JSON.stringify(evidence);
  for (const value of ['private-token', 'private-cookie', 'private-base', env.SMUGMUG_API_KEY, env.SMUGMUG_API_SECRET, access]) assert.ok(!serialized.includes(value));
});
test('success means request token only; tokens never disclosed', async () => {
  const evidence = await capture(env, async () => response('oauth_token=private-token&oauth_token_secret=private-secret&oauth_callback_confirmed=true'));
  assert.equal(evidence.result, 'request_token_succeeded_only');
  assert.equal(evidence.accountAuthenticationSucceeded, false);
  assert.ok(!JSON.stringify(evidence).includes('private-token')); assert.ok(!JSON.stringify(evidence).includes('private-secret'));
});
test('redirects not followed and transport failures never retried or echoed', async () => {
  let calls = 0;
  const evidence = await capture(env, async () => { calls++; return response('', 302, { location: 'https://example.com/?oauth_token=private' }); });
  assert.equal(calls, 1); assert.equal(evidence.redirect.followed, false); assert.ok(!JSON.stringify(evidence).includes('example.com'));
  calls = 0;
  const failed = await capture(env, async () => { calls++; throw new Error('SECRET IN ERROR'); });
  assert.equal(calls, 1); assert.equal(failed.result, 'connection_or_transport_failure');
  assert.ok(!JSON.stringify(failed).includes('SECRET IN ERROR'));
});
test('unknown content and oversize bodies fail closed', async () => {
  assert.equal(sanitizeBody('private-secret', 'text/html').complete, false);
  assert.ok(!JSON.stringify(sanitizeBody('oauth_problem=private-secret&secret=private-secret', 'application/x-www-form-urlencoded')).includes('private-secret'));
  const large = await capture(env, async () => response('x'.repeat(65537)));
  assert.equal(large.responseBody.complete, false);
  assert.deepEqual(sanitizeHeaders(new Headers({ 'x-private': 'secret', 'x-request-id': env.SMUGMUG_API_KEY }), [env.SMUGMUG_API_KEY]), [['x-private', '[REDACTED]'], ['x-request-id', '[REDACTED]']]);
});
test('durable gate consumes before fetch, survives recreation, blocks concurrent/replay attempts', async () => {
  let consumed = false; let chain = Promise.resolve(); let calls = 0;
  const storage = { transaction(fn) { const next = chain.then(() => fn({ get: async () => consumed, put: async (_, value) => { consumed = value; } })); chain = next.catch(() => {}); return next; } };
  const armed = { ...env, DIAGNOSTIC_ENABLED: 'true', CREDENTIAL_APPLICATION_CONFIRMED: '2026-10-02', AUTHORIZED_RUN_ID: 'test-run-123456789' };
  const original = globalThis.fetch;
  globalThis.fetch = async () => { calls++; assert.equal(consumed, true); throw new Error('network failed'); };
  try {
    const gate = new RunGate({ storage }, armed);
    const internal = () => new Request('https://run-gate/claim', { method: 'POST', headers: { Authorization: `Bearer ${access}` } });
    const results = await Promise.all([gate.fetch(internal()), gate.fetch(internal())]);
    assert.deepEqual(results.map(r => r.status).sort(), [200, 409]); assert.equal(calls, 1);
    assert.equal((await new RunGate({ storage }, armed).fetch(internal())).status, 409);
    assert.equal((await new RunGate({ storage }, env).fetch(internal())).status, 403);
    assert.equal((await gate.fetch(new Request('https://run-gate/claim', { method: 'POST' }))).status, 401);
  } finally { globalThis.fetch = original; }
});
test('run identity, application and credential checks prevent dispatch', async () => {
  const armed = { ...env, DIAGNOSTIC_ENABLED: 'true', CREDENTIAL_APPLICATION_CONFIRMED: '2026-10-02', AUTHORIZED_RUN_ID: 'test-run-123456789', RUN_GATE: { idFromName() { throw new Error('must not dispatch'); } } };
  assert.equal((await worker.fetch(req('/diagnostic', 'POST'), armed)).status, 403);
  const request = () => req('/diagnostic', 'POST', { 'X-Diagnostic-Run': armed.AUTHORIZED_RUN_ID });
  assert.equal((await worker.fetch(request(), { ...armed, CREDENTIAL_APPLICATION_CONFIRMED: '2026-10-01' })).status, 403);
  assert.equal((await worker.fetch(request(), { ...armed, SMUGMUG_API_SECRET: ' trailing ' })).status, 403);
});
