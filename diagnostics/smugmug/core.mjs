import { testJs } from './owner-test-page.mjs';
import { ownerHtml, ownerCss, ownerJs } from './owner-page.mjs';
import { hmacsign, rfc3986 } from '../../vendor/oauth-sign-webcrypto.mjs';

export const ENDPOINT = 'https://api.smugmug.com/services/oauth/1.0a/getRequestToken';
const encoder = new TextEncoder();
const securityHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store, private',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'"
};
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: securityHeaders });
const validRun = value => /^[a-zA-Z0-9-]{16,80}$/.test(value || '');
const credentialReady = env => ['SMUGMUG_API_KEY', 'SMUGMUG_API_SECRET'].every(k =>
  typeof env[k] === 'string' && env[k].length > 0 && env[k] === env[k].trim());

// Compare secret tokens with Web Crypto verification, not string equality.
export async function authorized(request, env) {
  const expected = env.DIAGNOSTIC_ACCESS_TOKEN;
  const supplied = request.headers.get('Authorization')?.match(/^Bearer ([A-Za-z0-9_-]{43,128})$/)?.[1];
  if (!/^[A-Za-z0-9_-]{43,128}$/.test(expected || '') || !supplied) return false;
  const key = async value => crypto.subtle.importKey('raw', encoder.encode(value), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
  const challenge = encoder.encode('giolina-smugmug-diagnostic-access-v1');
  const signature = await crypto.subtle.sign('HMAC', await key(expected), challenge);
  return crypto.subtle.verify('HMAC', await key(supplied), signature, challenge);
}

export async function buildRequest(env, now = Date.now(), nonce = crypto.randomUUID()) {
  const parameters = {
    oauth_consumer_key: env.SMUGMUG_API_KEY,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: String(Math.floor(now / 1000)),
    oauth_version: '1.0', oauth_callback: 'oob'
  };
  parameters.oauth_signature = await hmacsign('GET', ENDPOINT, parameters, env.SMUGMUG_API_SECRET, '');
  const authorization = 'OAuth ' + Object.entries(parameters).sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${rfc3986(k)}="${rfc3986(v)}"`).join(', ');
  return new Request(ENDPOINT, {
    method: 'GET', redirect: 'manual',
    headers: { Accept: 'application/x-www-form-urlencoded', Authorization: authorization },
    signal: AbortSignal.timeout(20000)
  });
}

const problems = new Set(['signature_invalid', 'consumer_key_rejected', 'consumer_key_unknown',
  'timestamp_refused', 'parameter_absent', 'token_rejected', 'permission_denied']);

// Fail closed: retain every form field, but disclose only enumerated protocol values.
// Unknown formats are withheld, never echoed. Successful tokens live only in memory.
export function sanitizeBody(raw, contentType) {
  if (!contentType?.toLowerCase().includes('application/x-www-form-urlencoded')) {
    return { body: '[WITHHELD: unrecognized response format]', format: 'withheld', complete: false };
  }
  const fields = new URLSearchParams(raw);
  const clean = new URLSearchParams();
  for (const [name, value] of fields) {
    const safeName = /^(oauth_[a-z_]+|debug_sbs)$/.test(name) ? name : '[REDACTED FIELD NAME]';
    const safe = (name === 'oauth_problem' && problems.has(value)) ||
      (name === 'oauth_callback_confirmed' && ['true', 'false'].includes(value));
    clean.append(safeName, safe ? value : '[REDACTED]');
  }
  return { body: clean.toString(), format: 'form-urlencoded, sanitized and reserialized', complete: true };
}

function redactKnown(value, secrets) {
  let result = value;
  for (const secret of secrets.filter(Boolean)) {
    for (const variant of new Set([secret, encodeURIComponent(secret), rfc3986(secret)])) {
      result = result.split(variant).join('[REDACTED]');
    }
  }
  return result;
}

export function sanitizeHeaders(headers, secrets = []) {
  const safe = new Set(['date', 'content-type', 'content-length', 'server', 'cf-ray', 'x-request-id', 'x-smugmug-request-id']);
  return [...headers].map(([name, value]) => [name,
    safe.has(name.toLowerCase()) ? redactKnown(value.slice(0, 1024), secrets) : '[REDACTED]']);
}

async function readBounded(response) {
  const reader = response.body?.getReader();
  if (!reader) return { text: '', complete: true };
  const chunks = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 65536) { await reader.cancel(); return { text: '', complete: false }; }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return { text: new TextDecoder().decode(bytes), complete: true };
}

export async function capture(env, send = fetch) {
  const request = await buildRequest(env);
  const evidence = {
    application: 'GioLina Films — October 2, 2026 (owner-confirmed configuration)',
    apiKey: '[OWNER TO SUPPLY PRIVATELY TO SMUGMUG SUPPORT]',
    requestUtc: new Date().toISOString(), method: request.method, endpoint: request.url,
    signingHostname: new URL(ENDPOINT).hostname,
    applicationConstructedHeaders: [['accept', request.headers.get('accept')], ['authorization', '[REDACTED OAuth header]']],
    transportObservedRequestHeaders: null,
    transportObservation: 'Not available; runtime-added outbound headers were not observed.',
    redirectPolicy: 'manual', providerReceipt: 'Not independently verified',
    responseReceived: false, accountAuthenticationSucceeded: false
  };
  try {
    const response = await send(request); // Exactly one attempt. No redirects/retries.
    evidence.responseReceived = true;
    evidence.status = response.status;
    // Preserve header names and redirect evidence even if body reading fails.
    evidence.responseHeaders = [...response.headers].map(([name])=>[name,'[REDACTED]']);
    evidence.responseBody = {body:'[WITHHELD: body capture failed]',format:'withheld',complete:false};
    evidence.redirect = {received:response.status >= 300 && response.status < 400,followed:false,
      location:response.headers.has('location')?'[REDACTED: redirect not followed]':null};
    const raw = await readBounded(response);
    const fields = new URLSearchParams(raw.text);
    const secrets = [env.SMUGMUG_API_KEY, env.SMUGMUG_API_SECRET, env.DIAGNOSTIC_ACCESS_TOKEN,
      decodeURIComponent(request.headers.get('authorization').match(/oauth_signature="([^"]+)"/)?.[1] || ''),
      fields.get('oauth_token'), fields.get('oauth_token_secret'), fields.get('oauth_signature'), fields.get('oauth_verifier')];
    evidence.responseHeaders = sanitizeHeaders(response.headers, secrets);
    evidence.correlationIdentifiers = evidence.responseHeaders.filter(([k]) => ['cf-ray', 'x-request-id', 'x-smugmug-request-id'].includes(k));
    evidence.redirect = { received: response.status >= 300 && response.status < 400, followed: false,
      location: response.headers.has('location') ? '[REDACTED: redirect not followed]' : null };
    evidence.responseBody = raw.complete ? sanitizeBody(raw.text, response.headers.get('content-type')) :
      { body: '[WITHHELD: response exceeds 65536-byte limit]', format: 'withheld', complete: false };
    const validForm = raw.complete && evidence.responseBody.format.startsWith('form-urlencoded');
    evidence.result = response.ok && validForm && fields.get('oauth_token') && fields.get('oauth_token_secret') && fields.get('oauth_callback_confirmed') === 'true'
      ? 'request_token_succeeded_only' : response.status === 401 && validForm && fields.get('oauth_problem') === 'signature_invalid'
        ? 'http_401_signature_invalid' : 'other_http_response';
  } catch (error) {
    evidence.result = evidence.status ? 'response_body_capture_failed' : 'connection_or_transport_failure';
    evidence.error = ['TimeoutError', 'AbortError'].includes(error?.name) ? 'timeout_or_abort' : 'transport_error_details_withheld';
    // Never echo error.message: it can contain a URL, signature, or credentials.
  }
  return evidence;
}

// Durable claim survives restarts and closes concurrent/replayed requests.
// Only sanitized owner evidence is persisted. Failures consume authorization too.
export class RunGate {
  constructor(state, env) { this.state = state; this.env = env; }
  async fetch(request) {
    if (new URL(request.url).pathname.startsWith('/owner-test/')) return this.owner(request);
    if (request.method !== 'POST' || this.env.DIAGNOSTIC_ENABLED !== 'true' ||
      this.env.CREDENTIAL_APPLICATION_CONFIRMED !== '2026-10-02' ||
      !validRun(this.env.AUTHORIZED_RUN_ID) || !credentialReady(this.env)) return json({ error: 'disabled' }, 403);
    if (!await authorized(request, this.env)) return json({ error: 'unauthorized' }, 401);
    const claimed = await this.state.storage.transaction(async tx => {
      if (await tx.get('consumed')) return false;
      await tx.put('consumed', true); return true;
    });
    if (!claimed) return json({ error: 'authorization_already_consumed' }, 409);
    return json(await capture(this.env));
  }
  async owner(request) {
    if (!await authorized(request, this.env)) return json({error:'unauthorized'},401);
    // This fixed owner gate is independent of, and cannot enable, the legacy run.
    if (request.method !== 'POST' || this.env.DIAGNOSTIC_ENABLED !== 'false' ||
        this.env.CREDENTIAL_APPLICATION_CONFIRMED !== 'false' || this.env.AUTHORIZED_RUN_ID !== '' ||
        !credentialReady(this.env)) return json({error:'unsafe_configuration'},403);
    const action = new URL(request.url).pathname.split('/').pop();
    const existing = await this.state.storage.get('owner');
    const display = value => value?.state === 'armed' && Date.now() >= value.expiresAt
      ? {...value,state:'expired'} : value || {state:'unarmed'};
    if (action === 'status') return json(display(existing));
    let body;
    try { body = await request.json(); } catch { return json({error:'confirmation_required'},400); }
    if (action === 'arm') {
      if (body?.application !== '2026-10-02' || body?.confirmation !== 'authorize-one-request-token-test')
        return json({error:'confirmation_required'},400);
      const grant = await this.state.storage.transaction(async tx => {
        if (await tx.get('owner')) return null;
        const value = {state:'armed', application:'GioLina Films — October 2, 2026',
          armedUtc:new Date().toISOString(), expiresAt:Date.now()+10*60*1000};
        await tx.put('owner',value); return value;
      });
      return grant ? json(grant) : json({error:'authorization_already_created_no_retry'},409);
    }
    if (action !== 'run' || body?.confirmation !== 'run-one-request-token-test-now')
      return json({error:'confirmation_required'},400);
    const claimed = await this.state.storage.transaction(async tx => {
      const value = await tx.get('owner');
      if (value?.state !== 'armed' || Date.now() >= value.expiresAt) return null;
      const consumed = {...value,state:'consumed', consumedUtc:new Date().toISOString()};
      await tx.put('owner',consumed); return consumed;
    });
    if (!claimed) return json({error:'not_armed_expired_or_consumed_no_retry'},409);
    // Persist consumption BEFORE signing or any outbound request. A crash remains locked.
    // Do not log raw response data. capture() returns only sanitized evidence.
    let evidence;
    try { evidence = await capture(this.env); }
    catch { return json({state:'consumed',error:'attempt_uncertain_no_retry'},503); }
    const completed = {...claimed,state:'completed',evidence};
    await this.state.storage.put('owner',completed);
    return json(completed);
  }

}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.protocol !== 'https:' || !/^giolina-smugmug-diagnostic\.[a-z0-9-]+\.workers\.dev$/.test(url.hostname) || url.search) return json({ error: 'not_found' }, 404);
    if (['/', '/owner.js', '/owner.css', '/test.js'].includes(url.pathname)) {
      if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405);
      const [body, type] = url.pathname === '/' ? [ownerHtml, 'text/html'] : url.pathname === '/owner.js' ? [ownerJs, 'text/javascript'] : url.pathname === '/test.js' ? [testJs, 'text/javascript'] : [ownerCss, 'text/css'];
      return new Response(body, { headers: {
        ...securityHeaders, 'Content-Type': type + '; charset=utf-8',
        'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; form-action 'none'; base-uri 'none'; frame-ancestors 'none'; object-src 'none'",
        'X-Frame-Options': 'DENY', 'Cross-Origin-Resource-Policy': 'same-origin',
        'Cross-Origin-Opener-Policy': 'same-origin', 'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
      } });
    }
    if (['/owner-test/status','/owner-test/arm','/owner-test/run'].includes(url.pathname)) {
      if (!await authorized(request,env)) return json({error:'unauthorized'},401);
      if (request.method !== 'POST' || request.headers.get('Origin') !== url.origin ||
          request.headers.get('Sec-Fetch-Site') !== 'same-origin' || request.headers.has('Cookie') ||
          request.headers.get('X-Owner-Test') !== 'v1' || request.headers.get('Content-Type') !== 'application/json')
        return json({error:'forbidden'},403);
      // Bound input before parsing or forwarding; reject arbitrary endpoints/fields.
      let body;
      try {
        const raw = await readBounded(new Response(request.body));
        if (!raw.complete || raw.text.length > 256) return json({error:'invalid_request'},400);
        body = JSON.parse(raw.text);
        if (!body || Array.isArray(body) || typeof body !== 'object' ||
            Object.keys(body).some(k=>!['application','confirmation'].includes(k))) return json({error:'invalid_request'},400);
      } catch { return json({error:'invalid_request'},400); }
      if (!env.RUN_GATE) return json({error:'durable_gate_unavailable_no_retry'},503);
      try {
        const stub = env.RUN_GATE.get(env.RUN_GATE.idFromName('owner-single-test-v1'));
        return await stub.fetch(new Request('https://run-gate'+url.pathname,{method:'POST',
          headers:{Authorization:request.headers.get('Authorization'),'Content-Type':'application/json'},body:JSON.stringify(body)}));
      } catch { return json({error:'durable_gate_unavailable_no_retry'},503); }
    }
    if (!['/readiness', '/diagnostic'].includes(url.pathname)) return json({ error: 'not_found' }, 404);
    if (!await authorized(request, env)) return json({ error: 'unauthorized' }, 401);
    // Read-only browser access: bearer token plus same-origin/custom-header checks.
    // No CORS is enabled. Non-browser bearer clients remain compatible.
    if (url.pathname === '/readiness') {
      const origin = request.headers.get('Origin');
      const site = request.headers.get('Sec-Fetch-Site');
      if (request.headers.has('Cookie') || (origin !== null && origin !== url.origin) ||
        (site !== null && site !== 'same-origin') ||
        ((origin !== null || site !== null) && request.headers.get('X-Readiness-Request') !== 'owner-v1')) {
        return json({ error: 'forbidden' }, 403);
      }
    }
    if (url.pathname === '/readiness' && request.method === 'GET') return json({
      service: 'giolina-smugmug-diagnostic',
      bindings: { SMUGMUG_API_KEY: !!env.SMUGMUG_API_KEY, SMUGMUG_API_SECRET: !!env.SMUGMUG_API_SECRET, RUN_GATE: !!env.RUN_GATE },
      credentialsWellFormed: credentialReady(env),
      selectedApplicationConfirmed: env.CREDENTIAL_APPLICATION_CONFIRMED === '2026-10-02',
      actionEnabled: env.DIAGNOSTIC_ENABLED === 'true',
      runConfigured: validRun(env.AUTHORIZED_RUN_ID),
      authenticationTested: false
    });
    if (url.pathname !== '/diagnostic' || request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
    if (request.headers.has('Origin') || request.headers.has('Cookie')) return json({ error: 'use_authenticated_non_browser_client' }, 403);
    if (env.DIAGNOSTIC_ENABLED !== 'true' || env.CREDENTIAL_APPLICATION_CONFIRMED !== '2026-10-02' ||
      !validRun(env.AUTHORIZED_RUN_ID) || !credentialReady(env) || !env.RUN_GATE) return json({ error: 'disabled_or_unconfigured' }, 403);
    if (request.headers.get('X-Diagnostic-Run') !== env.AUTHORIZED_RUN_ID) return json({ error: 'run_authorization_mismatch' }, 403);
    try {
      const stub = env.RUN_GATE.get(env.RUN_GATE.idFromName(env.AUTHORIZED_RUN_ID));
      return await stub.fetch(new Request('https://run-gate/claim', { method: 'POST', headers: { Authorization: request.headers.get('Authorization') } }));
    } catch { return json({ error: 'durable_gate_unavailable_no_retry' }, 503); }
  }
};

