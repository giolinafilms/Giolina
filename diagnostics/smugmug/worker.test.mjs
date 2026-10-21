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


test('owner page is public but never exposes runtime configuration or credentials', async () => {
  const r = await worker.fetch(new Request(url + '/'), env);
  assert.equal(r.status, 200);
  assert.match(r.headers.get('content-type'), /text\/html/);
  const html = await r.text();
  assert.match(html, /GioLina Films — SmugMug Diagnostic/);
  assert.match(html, /type="password"/);
  assert.match(html, /Check Readiness/);
  for (const secret of Object.values(env)) assert.ok(!html.includes(secret));
  assert.match(r.headers.get('content-security-policy'), /connect-src 'self'/);
  assert.match(r.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  assert.equal(r.headers.get('cache-control'), 'no-store, private');
  assert.equal(r.headers.get('referrer-policy'), 'no-referrer');
  assert.equal(r.headers.get('set-cookie'), null);
  assert.equal((await worker.fetch(new Request(url + '/?token=secret'), env)).status, 404);
  assert.equal((await worker.fetch(new Request(url + '/', {method:'POST'}), env)).status, 405);
});

test('browser readiness requires same origin, custom header and no cookies; no CORS', async () => {
  const good = { Origin: url, 'Sec-Fetch-Site': 'same-origin', 'X-Readiness-Request': 'owner-v1' };
  const r = await worker.fetch(req('/readiness', 'GET', good), {...env, RUN_GATE:{}});
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('access-control-allow-origin'), null);
  const state = await r.json();
  assert.equal(state.credentialsWellFormed, true);
  assert.equal(state.actionEnabled, false);
  assert.equal(state.runConfigured, false);
  assert.equal(state.selectedApplicationConfirmed, false);
  for (const bad of [
    { ...good, Origin:'https://evil.invalid' }, { ...good, Origin:'null' },
    { ...good, 'Sec-Fetch-Site':'cross-site' }, { ...good, 'Sec-Fetch-Site':'same-site' },
    { ...good, 'X-Readiness-Request':'' }, { ...good, Cookie:'x=y' }
  ]) assert.equal((await worker.fetch(req('/readiness','GET',bad),env)).status,403);
  assert.equal((await worker.fetch(new Request(url+'/readiness',{headers:good}),env)).status,401);
  assert.equal((await worker.fetch(req('/readiness','OPTIONS',good),env)).status,405);
  // Existing non-browser bearer clients still work; browser diagnostic POST stays forbidden.
  assert.equal((await worker.fetch(req('/readiness'),env)).status,200);
  assert.equal((await worker.fetch(req('/diagnostic','POST',good),env)).status,403);
});

// Execute the delivered browser script against a minimal DOM, with forbidden
// storage/logging APIs throwing. Fetch is synthetic and never reaches the network.
import { runInNewContext } from 'node:vm';
import { ownerJs } from './owner-page.mjs';
function browserHarness(send) {
  const handlers = {}, windows = {}, documents = {};
  const elements = Object.fromEntries(['readiness-form','diagnostic-password','check','status','results'].map(id=>[id,{value:'',disabled:false,textContent:'',children:[],addEventListener:(name,fn)=>{handlers[name]=fn;},replaceChildren(){this.children=[];},appendChild(x){this.children.push(x);}}]));
  const deny = new Proxy({}, {get(){throw new Error('storage/logging forbidden');}});
  const document = {visibilityState:'visible',getElementById:id=>elements[id],createElement:()=>({textContent:''}),addEventListener:(name,fn)=>{documents[name]=fn;}};
  runInNewContext(ownerJs,{document,window:{addEventListener:(name,fn)=>{windows[name]=fn;}},fetch:send,AbortController,setTimeout,clearTimeout,console:deny,localStorage:deny,sessionStorage:deny});
  return {elements,document,windows,documents,submit:()=>handlers.submit({preventDefault(){}})};
}
const readinessFixture = { service:'giolina-smugmug-diagnostic',bindings:{SMUGMUG_API_KEY:true,SMUGMUG_API_SECRET:true,RUN_GATE:true},credentialsWellFormed:true,actionEnabled:false,selectedApplicationConfirmed:false,runConfigured:false,authenticationTested:false };
test('browser UI handles bearer internally, uses no storage and clears password before request', async () => {
  let calls=0; let h;
  h=browserHarness(async(path,options)=>{
    calls++; assert.equal(path,'/readiness'); assert.equal(options.method,'GET');
    assert.equal(options.headers.Authorization,'Bearer '+access);
    assert.equal(options.credentials,'omit'); assert.equal(options.redirect,'error');
    assert.equal(options.mode,'same-origin'); assert.equal(options.cache,'no-store');
    assert.equal(h.elements['diagnostic-password'].value,'');
    return Response.json(readinessFixture);
  });
  h.elements['diagnostic-password'].value=access;
  await h.submit(); assert.equal(calls,1);
  assert.match(h.elements.status.textContent,/Readiness checks passed/);
  assert.equal(h.elements.results.children.length,7);
  assert.equal(h.elements['diagnostic-password'].value,'');
  assert.ok(!JSON.stringify(h.elements).includes(access));
  assert.equal(h.elements.check.disabled,false);
});
test('browser errors never echo server credentials and never automatically retry', async () => {
  for(const reply of [()=>new Response('secret-token',{status:401}),()=>new Response('secret-token',{status:500}),()=>{throw new Error('secret-token');},()=>Response.json({...readinessFixture,service:'secret-token'})]) {
    let calls=0;const h=browserHarness(async()=>{calls++;return reply();});
    h.elements['diagnostic-password'].value=access;await h.submit();
    assert.equal(calls,1);assert.ok(!JSON.stringify(h.elements).includes('secret-token'));
    assert.equal(h.elements['diagnostic-password'].value,'');assert.equal(h.elements.check.disabled,false);
  }
});
test('browser hides no unsafe setup and makes no request for invalid password', async()=>{
  let calls=0;const h=browserHarness(async()=>{calls++;return Response.json({...readinessFixture,actionEnabled:true});});
  h.elements['diagnostic-password'].value='bad';await h.submit();assert.equal(calls,0);
  h.elements['diagnostic-password'].value=access;await h.submit();assert.equal(calls,1);
  assert.match(h.elements.status.textContent,/needs attention/);
});
test('page exit and hidden state abort in-flight readiness and clear credentials/results', async()=>{
  let finish;let signal;const h=browserHarness(async(_,opts)=>{signal=opts.signal;return new Promise(r=>{finish=r;});});
  h.elements['diagnostic-password'].value=access;const pending=h.submit();
  h.document.visibilityState='hidden';h.documents.visibilitychange();assert.equal(signal.aborted,true);
  finish(Response.json(readinessFixture));await pending;
  assert.equal(h.elements.results.children.length,0);assert.equal(h.elements['diagnostic-password'].value,'');
  for(const name of ['pagehide','pageshow']){h.elements['diagnostic-password'].value=access;h.windows[name]();assert.equal(h.elements['diagnostic-password'].value,'');}
});

import { testJs } from './owner-test-page.mjs';
function testPageHarness(send, timers = {}) {
  const ids=['test-password','test-confirm','test-status','test-arm-status','test-run-status','test-copy-help','test-report','test-refresh','test-arm','test-run','test-copy'];
  const handlers={},windows={},documents={};let copied='';
  const elements=Object.fromEntries(ids.map(id=>[id,{value:'',checked:false,disabled:false,textContent:'',addEventListener:(name,fn)=>{handlers[id]=fn;}}]));
  const deny=new Proxy({},{get(){throw new Error('forbidden storage/logging');}});
  const document={visibilityState:'visible',getElementById:id=>elements[id],addEventListener:(name,fn)=>{documents[name]=fn;}};
  runInNewContext(testJs,{document,window:{addEventListener:(name,fn)=>{windows[name]=fn;}},navigator:{clipboard:{writeText:async value=>{copied=value;}}},fetch:send,AbortController,setTimeout:timers.setTimeout||setTimeout,clearTimeout:timers.clearTimeout||clearTimeout,console:deny,localStorage:deny,sessionStorage:deny});
  return {elements,windows,documents,document,copied:()=>copied,click:id=>handlers[id]()};
}
test('owner UI requires confirmation, sends once, clears secrets and copies only evidence',async()=>{
  let calls=0;let h;const responses=[{state:'unarmed',ownerActionsAvailable:true},{state:'armed',ownerActionsAvailable:true},{state:'completed',ownerActionsAvailable:true,evidence:{result:'http_401_signature_invalid',status:401}}];
  h=testPageHarness(async(path,options)=>{
    calls++;assert.equal(h.elements['test-password'].value,'');assert.equal(options.headers.Authorization,'Bearer '+access);
    assert.equal(options.mode,'same-origin');assert.equal(options.credentials,'omit');assert.equal(options.redirect,'error');
    assert.equal(options.headers['X-Owner-Test'],'v1');assert.equal(options.method,'POST');
    assert.equal(path,['/owner-test/status','/owner-test/arm','/owner-test/run'][calls-1]);
    return Response.json(responses[calls-1]);
  });
  assert.equal(h.elements['test-arm'].disabled,true);assert.equal(h.elements['test-run'].disabled,true);assert.equal(calls,0);
  h.elements['test-password'].value=access;await h.click('test-refresh');assert.equal(calls,1);
  h.elements['test-password'].value=access;await h.click('test-arm');assert.equal(calls,1);
  h.elements['test-password'].value=access;h.elements['test-confirm'].checked=true;await h.click('test-arm');assert.equal(calls,2);assert.equal(h.elements['test-confirm'].checked,false);
  h.elements['test-password'].value=access;h.elements['test-confirm'].checked=true;await h.click('test-run');assert.equal(calls,3);
  assert.equal(h.elements['test-run'].disabled,true);assert.equal(h.elements['test-arm'].disabled,true);
  await h.click('test-copy');assert.equal(JSON.parse(h.copied()).status,401);
  assert.ok(!JSON.stringify(h.elements).includes(access));
  h.windows.pagehide();assert.equal(h.elements['test-report'].textContent,'');assert.equal(h.elements['test-run'].disabled,true);
});
test('owner UI double-click, ambiguous result and reload cannot automatically execute or retry',async()=>{
  let calls=0,finish,signal;
  const h=testPageHarness(async(_,opts)=>{calls++;signal=opts.signal;return new Promise(r=>{finish=r;});});
  h.elements['test-password'].value=access;const pending=h.click('test-refresh');
  await h.click('test-refresh');assert.equal(calls,1);
  h.windows.pagehide();assert.equal(signal.aborted,true);
  finish(Response.json({state:'armed'}));await pending;
  assert.equal(h.elements['test-run'].disabled,true);
  h.windows.pageshow();assert.equal(calls,1);assert.equal(h.elements['test-password'].value,'');
  for(const send of [async()=>new Response('private-secret',{status:500}),async()=>{throw new Error('private-secret');}]) {
    const g=testPageHarness(send);g.elements['test-password'].value=access;await g.click('test-refresh');
    assert.equal(g.elements['test-run'].disabled,true);assert.ok(!JSON.stringify(g.elements).includes('private-secret'));
    assert.match(g.elements['test-status'].textContent,/No automatic retry/);
  }
});
test('owner gate expiration and failed durable storage fail closed before outbound',async()=>{
  const bindings={...env,DIAGNOSTIC_ENABLED:'false',CREDENTIAL_APPLICATION_CONFIRMED:'false',AUTHORIZED_RUN_ID:''};
  const record={state:'armed',expiresAt:0};let writes=0;let outbound=0;
  const tx={get:async()=>record,put:async()=>{writes++;}};
  const gate=new RunGate({storage:{...tx,transaction:async fn=>fn(tx)}},bindings);
  const request=action=>new Request('https://run-gate/owner-test/'+action,{method:'POST',headers:{Authorization:'Bearer '+access},body:JSON.stringify({confirmation:'run-one-request-token-test-now'})});
  const original=globalThis.fetch;globalThis.fetch=async()=>{outbound++;throw new Error('unexpected');};
  try {
    assert.equal((await (await gate.fetch(request('status'))).json()).state,'expired');
    assert.equal((await gate.fetch(request('run'))).status,409);assert.equal(outbound,0);assert.equal(writes,0);
    const broken={...bindings,RUN_GATE:{idFromName:()=>'',get:()=>({fetch:async()=>{throw new Error('storage failure');}})}};
    const r=await worker.fetch(new Request(url+'/owner-test/run',{method:'POST',headers:{Authorization:'Bearer '+access,Origin:url,'Sec-Fetch-Site':'same-origin','X-Owner-Test':'v1','Content-Type':'application/json'},body:JSON.stringify({confirmation:'run-one-request-token-test-now'})}),broken);
    assert.equal(r.status,503);assert.equal(outbound,0);
  }finally{globalThis.fetch=original;}
});

test('status UI identifies server, parsing and network failures without claiming an OAuth attempt',async()=>{
  const cases=[
    [()=>Response.json({error:'unauthorized'},{status:401}),/password.*not accepted/i],
    [()=>Response.json({error:'unsafe_configuration'},{status:403}),/configuration/i],
    [()=>Response.json({error:'forbidden'},{status:403}),/security check/i],
    [()=>Response.json({error:'fetch_metadata_rejected'},{status:403}),/browser.*security/i],
    [()=>Response.json({error:'durable_gate_unavailable_no_retry'},{status:503}),/authorization storage.*unavailable/i],
    [()=>new Response('PRIVATE SECRET',{status:502}),/server error.*502/i],
    [()=>new Response('PRIVATE SECRET',{status:200}),/unexpected.*response/i],
    [()=>Response.json({state:'invented'}),/unknown.*state/i],
    [()=>{throw new TypeError('PRIVATE SECRET');},/connection.*network/i]
  ];
  for(const [send,message]of cases){
    let calls=0;const h=testPageHarness(async()=>{calls++;return send();});
    h.elements['test-password'].value=access;await h.click('test-refresh');
    assert.match(h.elements['test-status'].textContent,message);
    assert.match(h.elements['test-status'].textContent,/status check cannot arm or run OAuth/i);
    assert.ok(!JSON.stringify(h.elements).includes('PRIVATE SECRET'));
    assert.equal(calls,1);assert.equal(h.elements['test-password'].value,'');
    assert.equal(h.elements['test-arm'].disabled,true);assert.equal(h.elements['test-run'].disabled,true);
    assert.equal(h.elements['test-copy'].disabled,true);assert.match(h.elements['test-copy-help'].textContent,/no.*report/i);
  }
});
test('status UI distinguishes timeout and missing password and never automatically retries',async()=>{
  let timeout,calls=0;const h=testPageHarness(async(_,options)=>{calls++;return new Promise((_,reject)=>options.signal.addEventListener('abort',()=>reject(new DOMException('aborted','AbortError'))));},{setTimeout:fn=>{timeout=fn;return 1;},clearTimeout:()=>{}});
  await h.click('test-refresh');assert.equal(calls,0);assert.match(h.elements['test-status'].textContent,/enter.*password/i);
  h.elements['test-password'].value=access;const pending=h.click('test-refresh');timeout();await pending;
  assert.match(h.elements['test-status'].textContent,/timed out/i);assert.equal(calls,1);
  assert.equal(h.elements['test-copy'].disabled,true);
});
test('status UI clearly separates unarmed, configuration lock, armed, consumed and completed',async()=>{
  for(const [reply,message,arm,run,copy]of [
    [{state:'unarmed',ownerActionsAvailable:true},/ready.*not armed/i,false,true,true],
    [{state:'unarmed',ownerActionsAvailable:false},/configuration.*blocks/i,true,true,true],
    [{state:'armed',ownerActionsAvailable:true},/armed.*not consumed/i,true,false,true],
    [{state:'consumed',ownerActionsAvailable:true},/already used.*not proof/i,true,true,true],
    [{state:'completed',ownerActionsAvailable:true},/already used.*no.*report/i,true,true,true],
    [{state:'completed',ownerActionsAvailable:true,evidence:{result:'http_401_signature_invalid',status:401}},/already used/i,true,true,false]
  ]){
    const h=testPageHarness(async()=>Response.json(reply));h.elements['test-password'].value=access;await h.click('test-refresh');
    assert.match(h.elements['test-status'].textContent,message);assert.equal(h.elements['test-arm'].disabled,arm);assert.equal(h.elements['test-run'].disabled,run);assert.equal(h.elements['test-copy'].disabled,copy);
  }
});
