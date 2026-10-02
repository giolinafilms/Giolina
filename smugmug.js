import {script,style} from './smugmug-ui.js';
// Discovery only. API credentials come exclusively from Cloudflare runtime Secrets.
// OAuth tokens live in an authenticated encrypted HttpOnly cookie, never in source,
// localStorage, logs, query strings on this Worker, or a public/shared account binding.
const BASE = '/__smugmug/';
const COOKIE = '__Host-gl-smug';
const API = 'https://api.smugmug.com';
const encoder = new TextEncoder();
const headers = {
 'Cache-Control': 'no-store, private', 'X-Robots-Tag': 'noindex, nofollow',
 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer',
 'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'"
};
const encode = value => encodeURIComponent(value).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
const b64 = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json = (body, status = 200, cookie) => new Response(JSON.stringify(body), {
 status, headers: {...headers, 'Content-Type': 'application/json', ...(cookie ? {'Set-Cookie': cookie} : {})}
});
export async function oauthHeader(url, env, session = {}, extra = {}, fixed = {}) {
 const target = new URL(url);
 const fields = {oauth_consumer_key: env.SMUGMUG_API_KEY, oauth_nonce: fixed.nonce || crypto.randomUUID(),
  oauth_signature_method: 'HMAC-SHA1', oauth_timestamp: fixed.timestamp || String(Math.floor(Date.now()/1000)),
  oauth_version: '1.0', ...(session.token ? {oauth_token: session.token} : {}), ...extra};
 const pairs = [...target.searchParams, ...Object.entries(fields)].map(([k,v]) => [encode(k),encode(v)]);
 pairs.sort((a,b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0);
 const normal = pairs.map(pair => pair.join('=')).join('&');
 const input = 'GET&' + encode(target.origin + target.pathname) + '&' + encode(normal);
 const key = await crypto.subtle.importKey('raw', encoder.encode(encode(env.SMUGMUG_API_SECRET) + '&' + encode(session.secret || '')),
  {name:'HMAC',hash:'SHA-1'},false,['sign']);
 fields.oauth_signature = b64(await crypto.subtle.sign('HMAC', key, encoder.encode(input)));
 return 'OAuth ' + Object.entries(fields).map(([k,v]) => `${encode(k)}="${encode(v)}"`).join(', ');
}
async function cookieKey(env) {
 const key = await crypto.subtle.importKey('raw', encoder.encode(env.SMUGMUG_API_SECRET), 'HKDF', false, ['deriveKey']);
 return crypto.subtle.deriveKey({name:'HKDF', hash:'SHA-256', salt:encoder.encode('giolina-smug-discovery-v1'),
  info:encoder.encode(env.SMUGMUG_API_KEY)}, key, {name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
export async function seal(session, env, origin) {
 const iv = crypto.getRandomValues(new Uint8Array(12));
 const body = await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:encoder.encode(origin)},
  await cookieKey(env),encoder.encode(JSON.stringify(session)));
 return b64(iv) + '.' + b64(body);
}
export async function unseal(value, env, origin) {
 try {
  if(!value || value.length > 3800) return null;
  const [iv,body] = value.split('.');
  const plain = await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(iv),additionalData:encoder.encode(origin)},await cookieKey(env),unb64(body));
  const session = JSON.parse(new TextDecoder().decode(plain));
  return session.expires > Date.now() ? session : null;
 } catch { return null; }
}
function cookie(value, age = 43200) { return `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`; }
async function sessionFor(request, env) {
 const value = request.headers.get('Cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
 return unseal(value,env,new URL(request.url).origin);
}
async function same(a,b) {
 if(typeof a !== 'string' || typeof b !== 'string') return false;
 const key=await crypto.subtle.importKey('raw',encoder.encode('giolina-csrf-constant-time-check'),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);
 return crypto.subtle.verify('HMAC',key,await crypto.subtle.sign('HMAC',key,encoder.encode(a)),encoder.encode(b));
}
async function boundedText(response, max) {
 const reader=response.body?.getReader(); if(!reader) return '';
 let size=0; const parts=[];
 while(true) {const {done,value}=await reader.read(); if(done)break; size+=value.byteLength;
  if(size>max){await reader.cancel();throw new Error('response_limit');} parts.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const p of parts){bytes.set(p,offset);offset+=p.length;}
 return new TextDecoder().decode(bytes);
}
async function oauthRequest(endpoint,env,session,extra) {
 const url=API+'/services/oauth/1.0a/'+endpoint;
 let response;
 try {response=await fetch(url,{method:'GET',headers:{Accept:'application/x-www-form-urlencoded',Authorization:await oauthHeader(url,env,session,extra)},redirect:'manual',signal:AbortSignal.timeout(20000)});}catch(error){if(['TimeoutError','AbortError'].includes(error.name))throw error;throw new Error('oauth_network_failed');}
 if(response.status>=300 && response.status<400){const error=new Error('oauth_redirect');error.status=response.status;throw error;}
 if(!response.ok) {const error=new Error('oauth_failed');error.status=response.status;throw error;}
 const fields=new URLSearchParams(await boundedText(response,16384));
 if(!fields.get('oauth_token') || !fields.get('oauth_token_secret')){const error=new Error('oauth_response_invalid');error.status=response.status;throw error;}
 return {token:fields.get('oauth_token'),secret:fields.get('oauth_token_secret')};
}
// Narrow read allowlist. No upload host, write HTTP method, unlocking operation,
// arbitrary URL, API-key query parameter, expansion or method-override accepted.
export function readUrl(path) {
 if(typeof path!=='string' || path.length>1500 || !path.startsWith('/api/v2'))throw new Error('path_rejected');
 const url=new URL(path,API);
 const allowed=/^\/api\/v2(?:!authuser|\/(?:user\/[A-Za-z0-9_.-]+(?:!albums)?|node\/[A-Za-z0-9]+(?:!(?:children|album))?|album\/[A-Za-z0-9]+(?:!images|\/image\/[A-Za-z0-9]+(?:-\d+)?(?:!(?:sizes|sizedetails|metadata))?)?|image\/[A-Za-z0-9]+(?:-\d+)?(?:!(?:sizes|sizedetails|metadata))?))\/?$/;
 if(url.origin!==API || !allowed.test(url.pathname))throw new Error('path_rejected');
 for(const [key,value] of url.searchParams) {
  if(!['start','count'].includes(key) || !/^\d+$/.test(value) || (key==='count' && (+value<1 || +value>100)) || (key==='start' && (+value<1 || +value>10000000)))throw new Error('path_rejected');
 }
 if(!url.searchParams.has('count'))url.searchParams.set('count','100');
 return url;
}
async function read(path,env,session) {
 const url=readUrl(path);
 const response=await fetch(url,{method:'GET',headers:{Accept:'application/json',Authorization:await oauthHeader(url,env,session)},redirect:'error',signal:AbortSignal.timeout(20000)});
 if(!response.ok) {const error=new Error('smug_read_failed');error.status=response.status;throw error;}
 return JSON.parse(await boundedText(response,4*1024*1024));
}
function page(csrf,bindings,host) {
 const configured=Object.values(bindings).every(Boolean);
 const missing=Object.keys(bindings).filter(name=>!bindings[name]);
 const runtime=Object.entries(bindings).map(([name,present])=>`<li><code>${name}</code>: ${present?'available':'not available in this deployment'}</li>`).join('');
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GioLina — archive discovery</title><link rel="stylesheet" href="${BASE}ui.css"><script src="${BASE}ui.js" defer></script></head><body><main><h1>SmugMug archive discovery</h1><p>Read-only connection. This tool does not change the archive or website photographs.</p><p id="status" role="status">${configured?'Both runtime secrets are available. Ready for read-only authorization.':'Authorization cannot start: '+esc(missing.join(', '))+' is not available to this deployment.'}</p><p>Current deployment: <code>${esc(host)}</code></p><ul id="runtime-bindings">${runtime}</ul><p ${configured?'hidden':''}>Cloudflare Preview secrets and the main workers.dev deployment have separate bindings. Open the Preview deployment that has your saved secrets; no credential re-entry is needed here.</p><form id="connect" method="post" action="${BASE}start"><input type="hidden" name="csrf" value="${esc(csrf)}"><button ${configured?'':'disabled'}>Prepare read-only authorization</button></form><section id="authorize" hidden><p><a id="authorization" target="_blank" rel="noopener noreferrer">Open SmugMug authorization</a></p><p>Approve read-only access in SmugMug, then return here and enter its six-digit verification code. Do not enter your API key or secret.</p><form id="verify"><label>Verification code <input name="verifier" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required autocomplete="off"></label><button>Connect account</button></form></section><section id="discovery" hidden><button id="inventory">Inventory folders and galleries</button><button id="images" hidden>Inventory all image metadata</button><button id="download" hidden>Download inventory JSON</button><button id="disconnect">End this session</button><pre id="summary"></pre><p>Inventory stays in this browser session. Download the JSON to keep or share the results. The export contains metadata and accessible media URLs, never credentials or OAuth tokens.</p></section></main></body></html>`;
}
export async function handleSmugMug(request,env) {
 const url=new URL(request.url);
 if(!url.pathname.startsWith(BASE))return null;
 if([BASE+'ui.js',BASE+'ui.css'].includes(url.pathname) && request.method==='GET') {
  const isScript=url.pathname===BASE+'ui.js';
  return new Response(isScript?script:style,{headers:{...headers,'Content-Type':isScript?'text/javascript; charset=utf-8':'text/css; charset=utf-8'}});
 }
 if(url.protocol!=='https:' && !['localhost','127.0.0.1'].includes(url.hostname))return json({error:'https_required'},400);
 const configured=!!(env.SMUGMUG_API_KEY && env.SMUGMUG_API_SECRET);
 if(url.pathname===BASE+'status' && request.method==='GET') {
  const session=configured?await sessionFor(request,env):null;
  return json({configured:{SMUGMUG_API_KEY:!!env.SMUGMUG_API_KEY,SMUGMUG_API_SECRET:!!env.SMUGMUG_API_SECRET},
   connected:session?.kind==='access',...(session?.kind==='access'?{account:session.account}:{})});
 }
 if(url.pathname===BASE && request.method==='GET') {
  const existing=configured?await sessionFor(request,env):null;
  const csrf=existing?.csrf || crypto.randomUUID();
  const initial={kind:'initial',csrf,expires:Date.now()+15*60000};
  return new Response(page(csrf,{SMUGMUG_API_KEY:!!env.SMUGMUG_API_KEY,SMUGMUG_API_SECRET:!!env.SMUGMUG_API_SECRET},url.hostname),{headers:{...headers,'Content-Type':'text/html; charset=utf-8',
   ...(configured&&!existing?{'Set-Cookie':cookie(await seal(initial,env,url.origin),900)}:{})}});
 }
 if(!configured)return json({error:'runtime_secrets_missing'},503);
 if(!['start','complete','read','disconnect'].some(x=>url.pathname===BASE+x))return json({error:'not_found'},404);
 if(request.method!=='POST')return json({error:'method_not_allowed'},405);
 if(request.headers.get('Origin')!==url.origin)return json({error:'origin_rejected'},403);
 const session=await sessionFor(request,env);
 if(!session)return json({error:'session_expired'},401);
 let body;try {body=JSON.parse(await boundedText(request,4096));}catch{return json({error:'invalid_request'},400);}
 if(!await same(session.csrf,body.csrf))return json({error:'csrf_rejected'},403);
 try {
  if(url.pathname===BASE+'disconnect')return json({connected:false},200,cookie('',0));
  if(url.pathname===BASE+'start') {
   const credentials=await oauthRequest('getRequestToken',env,{}, {oauth_callback:'oob'});
   const next={...credentials,kind:'request',csrf:session.csrf,expires:Date.now()+5*60000};
   const auth=new URL(API+'/services/oauth/1.0a/authorize');
   auth.searchParams.set('oauth_token',credentials.token);auth.searchParams.set('Access','Full');auth.searchParams.set('Permissions','Read');
   return json({authorizationUrl:auth.href},200,cookie(await seal(next,env,url.origin),300));
  }
  if(url.pathname===BASE+'complete') {
   if(session.kind!=='request' || !/^\d{6}$/.test(body.verifier || ''))return json({error:'verification_code_required'},400);
   const credentials=await oauthRequest('getAccessToken',env,session,{oauth_verifier:body.verifier});
   const result=await read('/api/v2!authuser',env,credentials);
   const user=result.Response?.User;
   if(!user?.Uris?.Node?.Uri)throw new Error('account_not_confirmed');
   const account={Name:user.Name,NickName:user.NickName,Uri:user.Uri,WebUri:user.WebUri,rootNode:user.Uris.Node.Uri};
   const next={...credentials,kind:'access',csrf:session.csrf,expires:Date.now()+12*60*60000,account};
   return json({connected:true,account},200,cookie(await seal(next,env,url.origin)));
  }
  if(session.kind!=='access')return json({error:'authorization_required'},401);
  return json(await read(body.path,env,session));
 } catch(error) {
  // Never expose upstream bodies, URLs, credentials or tokens in logs/errors.
  const rejected=error.message==='path_rejected';
  if(['TimeoutError','AbortError'].includes(error.name))return json({error:'smugmug_timeout'},504);
  return json({error:rejected?'read_path_rejected':'smugmug_request_failed',...(['oauth_network_failed','oauth_redirect','oauth_response_invalid'].includes(error.message)?{stage:error.message}:{}),...(error.status?{upstreamStatus:error.status}:{})},rejected?400:502);
 }
}
