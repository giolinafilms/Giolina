import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { Miniflare } from 'miniflare';

const config = JSON.parse(await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
const bundle = await build({ entryPoints: [fileURLToPath(new URL('../worker.mjs', import.meta.url))], bundle: true, write: false, format: 'esm', platform: 'browser' });
const script = bundle.outputFiles[0].text;
const root = 'https://giolina-smugmug-diagnostic.example.workers.dev';
const token = 'a'.repeat(43);
const credentials = { SMUGMUG_API_KEY: 'synthetic-key', SMUGMUG_API_SECRET: 'synthetic-secret', DIAGNOSTIC_ACCESS_TOKEN: token };
const run = 'offline-test-1234567890';
const headers = { Authorization: `Bearer ${token}`, 'X-Diagnostic-Run': run };
const armed = { DIAGNOSTIC_ENABLED: 'true', CREDENTIAL_APPLICATION_CONFIRMED: '2026-10-02', AUTHORIZED_RUN_ID: run };
const form = (body, status = 200, extra = {}) => new Response(body, { status, headers: { 'content-type': 'application/x-www-form-urlencoded', ...extra } });

async function fixture({ bindings = {}, upstream = () => form('oauth_problem=signature_invalid', 401), persist } = {}) {
  const calls = [];
  const mf = new Miniflare({
    name: config.name, modules: true, script, compatibilityDate: config.compatibility_date,
    durableObjects: Object.fromEntries(config.durable_objects.bindings.map(b => [b.name, { className: b.class_name, useSQLite: config.migrations.some(m => m.new_sqlite_classes?.includes(b.class_name)) }])),
    durableObjectsPersist: persist || false,
    bindings: Object.fromEntries(Object.entries({ ...config.vars, ...credentials, ...bindings }).filter(([,value])=>value !== undefined)),
    // All Worker outbound fetches terminate here. There is no network fallback.
    outboundService: async request => {
      calls.push({ url: request.url, method: request.method });
      assert.equal(request.url, 'https://api.smugmug.com/services/oauth/1.0a/getRequestToken');
      assert.equal(request.method, 'GET');
      return upstream(request);
    }
  });
  const request = (path, options = {}) => mf.dispatchFetch(root + path, { ...options, headers: { ...headers, ...options.headers } });
  return { mf, calls, request, run: () => request('/diagnostic', { method: 'POST' }) };
}

test('actual workerd/SQLite runtime with network-isolated synthetic OAuth', async t => {
  await t.test('dedicated Wrangler configuration and binding/migration contract', () => {
    assert.equal(config.name, 'giolina-smugmug-diagnostic');
    assert.equal(config.main, 'worker.mjs'); assert.equal(config.compatibility_date, '2026-10-20');
    assert.deepEqual(config.routes, []); assert.equal(config.workers_dev, true);
    assert.equal(config.preview_urls, false); assert.equal(config.observability.enabled, false);
    assert.deepEqual(config.durable_objects.bindings, [{ name: 'RUN_GATE', class_name: 'RunGate' }]);
    assert.deepEqual(config.migrations, [{ tag: 'v1', new_sqlite_classes: ['RunGate'] }]);
    assert.deepEqual(config.vars, { DIAGNOSTIC_ENABLED: 'false', AUTHORIZED_RUN_ID: '', CREDENTIAL_APPLICATION_CONFIRMED: 'false' });
    for (const forbidden of ['assets', 'services', 'kv_namespaces', 'd1_databases', 'r2_buckets', 'env', 'account_id']) assert.equal(config[forbidden], undefined);
  });
  await t.test('protected readiness, bindings, disabled defaults, methods and host', async () => {
    const f = await fixture();
    try {
      assert.equal((await f.mf.dispatchFetch(root + '/readiness')).status, 401);
      assert.equal((await f.request('/readiness', { headers: { Authorization: 'Bearer ' + 'b'.repeat(43) } })).status, 401);
      const ready = await f.request('/readiness'); const state = await ready.json();
      assert.deepEqual(state.bindings, { SMUGMUG_API_KEY: true, SMUGMUG_API_SECRET: true, RUN_GATE: true });
      assert.equal(state.actionEnabled, false); assert.equal(state.selectedApplicationConfirmed, false);
      assert.equal(ready.headers.get('cache-control'), 'no-store, private');
      assert.equal((await f.run()).status, 403);
      assert.equal((await f.request('/diagnostic')).status, 405);
      assert.equal((await f.request('/readiness?token=test')).status, 404);
      assert.equal((await f.mf.dispatchFetch('https://giolinafilms.com/readiness', { headers })).status, 404);
      assert.equal(f.calls.length, 0);
    } finally { await f.mf.dispose(); }
  });
  await t.test('missing credentials and missing access secret fail closed', async () => {
    const f = await fixture({ bindings: { ...armed, SMUGMUG_API_SECRET: '' } });
    try { assert.equal((await f.run()).status, 403); assert.equal(f.calls.length, 0); }
    finally { await f.mf.dispose(); }
    const g = await fixture({ bindings: { DIAGNOSTIC_ACCESS_TOKEN: '' } });
    try { assert.equal((await g.request('/readiness')).status, 401); assert.equal(g.calls.length, 0); }
    finally { await g.mf.dispose(); }
  });
  await t.test('SQLite claim: 12 simultaneous requests, replay and full runtime restart', async () => {
    const persist = await mkdtemp(join(tmpdir(), 'giolina-smugmug-runtime-'));
    let f;
    try {
      f = await fixture({ bindings: armed, persist });
      const results = await Promise.all(Array.from({ length: 12 }, () => f.run()));
      assert.equal(results.filter(r => r.status === 200).length, 1);
      assert.equal(results.filter(r => r.status === 409).length, 11);
      assert.equal(f.calls.length, 1);
      const evidence = await results.find(r => r.status === 200).json();
      assert.equal(evidence.result, 'http_401_signature_invalid');
      assert.equal((await f.run()).status, 409);
      await f.mf.dispose(); f = undefined;
      f = await fixture({ bindings: armed, persist });
      assert.equal((await f.run()).status, 409); assert.equal(f.calls.length, 0);
    } finally { if (f) await f.mf.dispose(); await rm(persist, { recursive: true, force: true }); }
  });
  await t.test('complete sanitized response and successful request-token-only classification', async () => {
    const f = await fixture({ bindings: armed, upstream: () => form('oauth_token=hidden-token&oauth_token_secret=hidden-secret&oauth_callback_confirmed=true&debug_sbs=hidden-base', 200,
      { 'set-cookie': 'hidden-cookie', 'x-private': 'hidden-header', 'x-request-id': 'fixture-id', 'date': 'Tue, 20 Oct 2026 20:00:00 GMT' }) });
    try {
      const r = await f.run(); assert.equal(r.status, 200); const e = await r.json();
      assert.equal(e.result, 'request_token_succeeded_only'); assert.equal(e.accountAuthenticationSucceeded, false);
      assert.equal(e.responseBody.complete, true);
      const fields = new URLSearchParams(e.responseBody.body); assert.equal([...fields].length, 4);
      assert.equal(fields.get('oauth_token'), '[REDACTED]'); assert.equal(fields.get('oauth_callback_confirmed'), 'true');
      assert.equal(e.transportObservedRequestHeaders, null); assert.ok(Number.isFinite(Date.parse(e.requestUtc)));
      assert.equal(e.signingHostname, 'api.smugmug.com');
      assert.ok(e.responseHeaders.some(([k, v]) => k === 'x-request-id' && v === 'fixture-id'));
      assert.ok(e.responseHeaders.some(([k, v]) => k === 'set-cookie' && v === '[REDACTED]'));
      for (const secret of [...Object.values(credentials), 'hidden-token', 'hidden-secret', 'hidden-base', 'hidden-cookie', 'hidden-header']) assert.ok(!JSON.stringify(e).includes(secret));
      assert.equal(f.calls.length, 1); assert.equal((await f.run()).status, 409);
    } finally { await f.mf.dispose(); }
  });
  await t.test('redirect response not followed, no automatic retry', async () => {
    const f = await fixture({ bindings: armed, upstream: () => form('', 302, { location: 'https://unrelated.invalid/?oauth_token=hidden' }) });
    try { const e = await (await f.run()).json(); assert.equal(e.status, 302); assert.equal(e.redirect.followed, false); assert.equal(f.calls.length, 1); assert.ok(!JSON.stringify(e).includes('unrelated.invalid')); assert.equal((await f.run()).status, 409); }
    finally { await f.mf.dispose(); }
  });
  await t.test('503, unknown body and oversized body remain safe and consume authorization', async () => {
    for (const upstream of [() => form('oauth_problem=permission_denied', 503), () => new Response('hidden-unstructured', { headers: { 'content-type': 'text/html' } }), () => form('x'.repeat(65537))]) {
      const f = await fixture({ bindings: armed, upstream });
      try { const e = await (await f.run()).json(); assert.equal(f.calls.length, 1); assert.ok(!JSON.stringify(e).includes('hidden-unstructured')); if (e.status === 200) assert.equal(e.responseBody.complete, false); assert.equal((await f.run()).status, 409); }
      finally { await f.mf.dispose(); }
    }
  });
  await t.test('real fetch timeout consumes durable authorization without retry', async () => {
    const f = await fixture({ bindings: armed, upstream: () => new Promise(resolve => setTimeout(() => resolve(form('delayed=synthetic')), 21000)) });
    try { const e = await (await f.run()).json(); assert.equal(e.result, 'connection_or_transport_failure'); assert.equal(f.calls.length, 1); assert.ok(!JSON.stringify(e).includes('SYNTHETIC transport failure')); assert.equal((await f.run()).status, 409); }
    finally { await f.mf.dispose(); }
  });
  await t.test('wrong run, unconfirmed app and browser request cannot consume/send', async () => {
    const f = await fixture({ bindings: armed });
    try {
      assert.equal((await f.request('/diagnostic', { method: 'POST', headers: { 'X-Diagnostic-Run': 'wrong-run' } })).status, 403);
      assert.equal((await f.request('/diagnostic', { method: 'POST', headers: { Origin: root } })).status, 403);
      assert.equal(f.calls.length, 0);
    } finally { await f.mf.dispose(); }
    const g = await fixture({ bindings: { ...armed, CREDENTIAL_APPLICATION_CONFIRMED: '2026-10-01' } });
    try { assert.equal((await g.run()).status, 403); assert.equal(g.calls.length, 0); }
    finally { await g.mf.dispose(); }
  });
});


test('owner page and same-origin readiness in actual workerd, zero outbound requests', async () => {
  const f = await fixture();
  try {
    const page = await f.mf.dispatchFetch(root + '/');
    assert.equal(page.status, 200);
    assert.match(await page.text(), /Check Readiness/);
    for (const path of ['/owner.js','/owner.css']) {
      const asset = await f.mf.dispatchFetch(root+path);
      assert.equal(asset.status,200);
      assert.equal(asset.headers.get('cache-control'),'no-store, private');
      assert.equal(asset.headers.get('cross-origin-resource-policy'),'same-origin');
      for (const secret of Object.values(credentials)) assert.ok(!(await asset.clone().text()).includes(secret));
    }
    const browser = { Origin:root, 'Sec-Fetch-Site':'same-origin', 'X-Readiness-Request':'owner-v1' };
    assert.equal((await f.mf.dispatchFetch(root+'/readiness',{headers:{'Sec-Fetch-Site':'none'}})).status,401);
    const good = await f.request('/readiness',{headers:browser});
    assert.equal(good.status,200);
    const state = await good.json();
    assert.equal(state.actionEnabled,false); assert.equal(state.runConfigured,false);
    assert.equal(state.selectedApplicationConfirmed,false); assert.equal(state.bindings.RUN_GATE,true);
    for (const changed of [{Origin:'https://evil.invalid'},{Origin:'null'},{'Sec-Fetch-Site':'same-site'},{'Sec-Fetch-Site':'cross-site'},{'X-Readiness-Request':''},{Cookie:'session=synthetic'}]) {
      const r = await f.request('/readiness',{headers:{...browser,...changed}});
      assert.equal(r.status,403); assert.equal(r.headers.get('access-control-allow-origin'),null);
    }
    assert.equal((await f.request('/readiness',{method:'OPTIONS',headers:browser})).status,405);
    assert.equal((await f.request('/diagnostic',{method:'POST',headers:browser})).status,403);
    assert.equal(f.calls.length,0);
  } finally {await f.mf.dispose();}
});

const ownerHeaders = { Origin: root, 'Sec-Fetch-Site': 'same-origin', 'X-Owner-Test': 'v1', 'Content-Type':'application/json' };
const confirmations = { status: {}, arm: { application:'2026-10-02', confirmation:'authorize-one-request-token-test' }, run: { confirmation:'run-one-request-token-test-now' } };
const ownerRequest = (f, action, overrides = {}) => f.request('/owner-test/'+action, { method:'POST', headers:ownerHeaders, body:JSON.stringify(confirmations[action]), ...overrides });
test('owner single-use workflow: strict authorization and durable concurrent execution', async () => {
  const persist = await mkdtemp(join(tmpdir(),'owner-gate-')); let f;
  try {
    f=await fixture({persist});
    assert.equal((await ownerRequest(f,'status')).status,200);
    assert.equal((await (await ownerRequest(f,'status')).json()).state,'unarmed');
    assert.equal((await ownerRequest(f,'run')).status,409);
    for(const changed of [{Authorization:''},{Origin:''},{Origin:'https://evil.invalid'},{'Sec-Fetch-Site':'cross-site'},{'X-Owner-Test':''},{Cookie:'x=y'},{'Content-Type':'text/plain'}]) {
      const r=await ownerRequest(f,'arm',{headers:{...ownerHeaders,...changed}});
      assert.ok([401,403].includes(r.status));
    }
    assert.equal((await ownerRequest(f,'arm',{body:'{}'})).status,400);
    assert.equal(f.calls.length,0);
    const arms=await Promise.all(Array.from({length:8},()=>ownerRequest(f,'arm')));
    assert.equal(arms.filter(r=>r.status===200).length,1);
    assert.equal(arms.filter(r=>r.status===409).length,7);
    assert.equal(f.calls.length,0);
    await f.mf.dispose(); f=await fixture({persist});
    assert.equal((await (await ownerRequest(f,'status')).json()).state,'armed');
    assert.equal((await ownerRequest(f,'run',{body:'{}'})).status,400);
    const runs=await Promise.all(Array.from({length:12},()=>ownerRequest(f,'run')));
    assert.equal(runs.filter(r=>r.status===200).length,1);
    assert.equal(runs.filter(r=>r.status===409).length,11);
    assert.equal(f.calls.length,1);
    const result=await runs.find(r=>r.status===200).json();
    assert.equal(result.state,'completed'); assert.equal(result.evidence.result,'http_401_signature_invalid');
    assert.equal(result.evidence.responseReceived,true);
    await f.mf.dispose();f=await fixture({persist});
    const saved=await (await ownerRequest(f,'status')).json();
    assert.equal(saved.state,'completed');assert.deepEqual(saved.evidence,result.evidence);
    assert.equal((await ownerRequest(f,'arm')).status,409);
    assert.equal((await ownerRequest(f,'run')).status,409);assert.equal(f.calls.length,0);
  } finally { if(f)await f.mf.dispose();await rm(persist,{recursive:true,force:true}); }
});
test('owner failures, redirects and successful tokens consume once and return sanitized evidence', async()=>{
  for(const upstream of [()=>form('oauth_token=private-token&oauth_token_secret=private-secret&oauth_callback_confirmed=true'),()=>form('',302,{location:'https://invalid.example/?secret=x'}),()=>new Response('private-body',{status:503}),()=>{throw new Error('private-error');}]) {
    const f=await fixture({upstream});
    try {
      assert.equal((await ownerRequest(f,'arm')).status,200);
      const r=await ownerRequest(f,'run');assert.equal(r.status,200);
      const e=await r.json();
      for(const secret of [...Object.values(credentials),'private-token','private-secret','private-body','private-error','invalid.example'])assert.ok(!JSON.stringify(e).includes(secret));
      assert.equal((await ownerRequest(f,'run')).status,409);assert.equal(f.calls.length,1);
    }finally{await f.mf.dispose();}
  }
});

test('owner timeout locks authorization; legacy enabled settings cannot authorize owner routes',async()=>{
  const f=await fixture({upstream:()=>new Promise(resolve=>setTimeout(()=>resolve(form('delayed=synthetic')),21000))});
  try {
    assert.equal((await ownerRequest(f,'arm')).status,200);
    const e=await (await ownerRequest(f,'run')).json();
    assert.equal(e.evidence.result,'connection_or_transport_failure');
    assert.equal(e.evidence.responseReceived,false);
    assert.equal((await ownerRequest(f,'run')).status,409);
    assert.equal((await ownerRequest(f,'arm')).status,409);assert.equal(f.calls.length,1);
    assert.equal((await (await ownerRequest(f,'status')).json()).state,'completed');
  }finally{await f.mf.dispose();}
  const g=await fixture({bindings:armed});
  try{assert.equal((await ownerRequest(g,'arm')).status,403);assert.equal(g.calls.length,0);}
  finally{await g.mf.dispose();}
});

test('read-only owner status remains inspectable when execution configuration is locked',async()=>{
  const f=await fixture({bindings:{AUTHORIZED_RUN_ID:undefined}});
  try{
    const r=await ownerRequest(f,'status');assert.equal(r.status,200);const data=await r.json();
    assert.equal(data.state,'unarmed');assert.equal(data.ownerActionsAvailable,false);
    assert.equal(data.configuration.runIdentifierEmpty,false);
    assert.equal((await ownerRequest(f,'arm')).status,403);assert.equal((await ownerRequest(f,'run')).status,403);
    assert.equal(f.calls.length,0);
  }finally{await f.mf.dispose();}
});

test('status preserves stored consumption through configuration changes and repeated reads',async()=>{
  const persist=await mkdtemp(join(tmpdir(),'status-preservation-'));let f;
  try{
    f=await fixture({persist});await ownerRequest(f,'arm');
    const previous=await (await ownerRequest(f,'run')).json();assert.equal(f.calls.length,1);
    await f.mf.dispose();f=await fixture({persist,bindings:{SMUGMUG_API_SECRET:''}});
    for(let i=0;i<3;i++){
      const r=await ownerRequest(f,'status');assert.equal(r.status,200);const data=await r.json();
      assert.equal(data.state,'completed');assert.deepEqual(data.evidence,previous.evidence);
      assert.equal(data.consumedUtc,previous.consumedUtc);assert.equal(data.ownerActionsAvailable,false);
      assert.equal(data.configuration.credentialsWellFormed,false);
      assert.ok(!JSON.stringify(data).includes(credentials.SMUGMUG_API_KEY));
    }
    assert.equal((await ownerRequest(f,'arm')).status,403);assert.equal((await ownerRequest(f,'run')).status,403);
    assert.equal(f.calls.length,0);
  }finally{if(f)await f.mf.dispose();await rm(persist,{recursive:true,force:true});}
});
test('owner status keeps exact browser protections with safe rejection reasons',async()=>{
  const f=await fixture();
  try{
    for(const [changed,reason]of [[{Origin:''},'origin_mismatch'],[{'Sec-Fetch-Site':''},'fetch_metadata_rejected'],[{Cookie:'secret-cookie'},'cookie_not_allowed'],[{'X-Owner-Test':''},'csrf_header_missing'],[{'Content-Type':'text/plain'},'content_type_rejected']]){
      const r=await ownerRequest(f,'status',{headers:{...ownerHeaders,...changed}});
      assert.equal(r.status,403);assert.equal((await r.json()).error,reason);
    }
    const unauthorized=await ownerRequest(f,'status',{headers:{...ownerHeaders,Authorization:''}});
    assert.equal(unauthorized.status,401);assert.deepEqual(await unauthorized.json(),{error:'unauthorized'});
    const state=await (await ownerRequest(f,'status')).json();assert.equal(state.state,'unarmed');
    assert.equal(state.ownerActionsAvailable,true);assert.equal(f.calls.length,0);
  }finally{await f.mf.dispose();}
});
