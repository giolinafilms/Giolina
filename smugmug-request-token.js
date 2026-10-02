import OAuth from './vendor/oauth-1.0a.cjs';
// oauth-1.0a 2.2.6, unmodified upstream source, MIT license in vendor/.
// Request-token proof only. No access-token exchange, archive API or token storage.
const PREVIEW='smugmug-discovery-giolina.dawn-math-f4b1.workers.dev';
const BASE='/__smugmug/';
const TOKEN_URL='https://secure.smugmug.com/services/oauth/1.0a/getRequestToken';
const AUTHORIZE_URL='https://api.smugmug.com/services/oauth/1.0a/authorize';
const COOKIE='__Host-gl-smug-token-test';
const encoder=new TextEncoder();
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const headers={'Cache-Control':'no-store, private','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'"};
export async function requestTokenHeader(env,fixed={}) {
 const oauth=new OAuth({consumer:{key:env.SMUGMUG_API_KEY.trim(),secret:env.SMUGMUG_API_SECRET.trim()},signature_method:'HMAC-SHA1',hash_function:async(base,key)=>{
  const cryptoKey=await crypto.subtle.importKey('raw',encoder.encode(key),{name:'HMAC',hash:'SHA-1'},false,['sign']);
  return btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign('HMAC',cryptoKey,encoder.encode(base)))));
 }});
 // Replace the library's Math.random nonce with a cryptographic nonce.
 oauth.getNonce=()=>fixed.nonce||crypto.randomUUID();
 if(fixed.timestamp)oauth.getTimeStamp=()=>fixed.timestamp;
 const data=oauth.authorize({url:TOKEN_URL,method:'GET',data:{oauth_callback:'oob'}});
 // The library supplies normalization, encoding and header construction. Await
 // the injected Web Crypto hash before giving its result to toHeader().
 data.oauth_signature=await data.oauth_signature;
 return oauth.toHeader(data).Authorization;
}
async function boundedBody(response) {
 const reader=response.body?.getReader();if(!reader)return '';
 const chunks=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>16384){await reader.cancel();throw new Error('response_too_large');}chunks.push(value);}
 const bytes=new Uint8Array(size);let at=0;for(const chunk of chunks){bytes.set(chunk,at);at+=chunk.length;}return new TextDecoder().decode(bytes);
}
async function prepareRequestToken(env) {
 if(!env.SMUGMUG_API_KEY?.trim()||!env.SMUGMUG_API_SECRET?.trim())return {requestTokenSucceeded:false,authUrlGenerated:false,error:'runtime_secrets_missing'};
 try {
  const response=await fetch(TOKEN_URL,{method:'GET',headers:{Accept:'application/x-www-form-urlencoded',Authorization:await requestTokenHeader(env)},redirect:'manual',signal:AbortSignal.timeout(20000)});
  const fields=new URLSearchParams(await boundedBody(response));
  if(!response.ok){
   const problem=fields.get('oauth_problem');
   const allowed=['signature_invalid','consumer_key_rejected','consumer_key_unknown','timestamp_refused','parameter_absent','token_rejected','permission_denied'];
   return {requestTokenSucceeded:false,authUrlGenerated:false,upstreamStatus:response.status,error:allowed.includes(problem)?problem:'request_token_rejected'};
  }
  const token=fields.get('oauth_token'),secret=fields.get('oauth_token_secret');
  if(!token||!secret||fields.get('oauth_callback_confirmed')==='false')return {requestTokenSucceeded:false,authUrlGenerated:false,upstreamStatus:response.status,error:'invalid_request_token_response'};
  const authorization=new URL(AUTHORIZE_URL);authorization.searchParams.set('oauth_token',token);authorization.searchParams.set('Access','Full');authorization.searchParams.set('Permissions','Read');
  // Only the GET start route may send this URL to SmugMug as an HTTPS redirect.
  // It is never rendered in HTML, logged, or returned by the proof-only POST.
  return {requestTokenSucceeded:true,authUrlGenerated:authorization.origin==='https://api.smugmug.com',upstreamStatus:response.status,authorizationUrl:authorization.href};
 }catch(error){return {requestTokenSucceeded:false,authUrlGenerated:false,error:['TimeoutError','AbortError'].includes(error.name)?'request_token_timeout':error.message==='response_too_large'?'response_too_large':'request_token_connection_failed'};}
}
export async function testRequestToken(env) {
 const {authorizationUrl,...result}=await prepareRequestToken(env);
 return result;
}
function page(env,csrf,result) {
 const configured={SMUGMUG_API_KEY:!!env.SMUGMUG_API_KEY?.trim(),SMUGMUG_API_SECRET:!!env.SMUGMUG_API_SECRET?.trim()};
 const ready=Object.values(configured).every(Boolean);
 const summary=result?(result.requestTokenSucceeded?'Request token succeeded. Read-only authorization URL generated. Test complete; no account access requested.':`Request token failed${result.upstreamStatus?' (HTTP '+result.upstreamStatus+')':''}: ${result.error}. Authorization URL was not generated.`):'Ready to test the configured Preview key pair.';
 const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GioLina — SmugMug request-token test</title><style>body{margin:0;background:#f5f4f1;color:#242424;font:16px/1.6 system-ui,sans-serif}main{max-width:760px;margin:48px auto;padding:24px}h1{font:36px/1.2 Georgia,serif}button{padding:12px 18px;border:0;border-radius:4px;background:#166c70;color:white;font:inherit}button:disabled{opacity:.5}p{overflow-wrap:anywhere}@media(max-width:600px){main{margin:12px auto}h1{font-size:28px}}</style></head><body><main><h1>SmugMug request-token test</h1><p>Preview only. Fresh OAuth 1.0a library implementation. No archive reads or changes.</p><ul>${Object.entries(configured).map(([name,value])=>`<li>${name}: ${value?'available':'missing'}</li>`).join('')}</ul><p role="status">${escape(summary)}</p><form method="post" action="${BASE}start"><input type="hidden" name="csrf" value="${escape(csrf)}"><button ${ready?'':'disabled'}>Test request token</button></form><p>Access: Full. Permissions: Read. Callback: oob. Tokens and authorization URLs are not displayed or stored.</p></main></body></html>`;
 return new Response(html,{headers:{...headers,'Content-Type':'text/html; charset=utf-8','Set-Cookie':`${COOKIE}=${csrf}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=300`}});
}
export async function handleSmugMug(request,env) {
 const url=new URL(request.url);
 // Never activate this test on the main worker hostname or a custom domain.
 if(url.hostname!==PREVIEW)return new Response('Not found',{status:404,headers});
 if(request.method==='GET' && url.pathname===BASE)return page(env,crypto.randomUUID());
 if(request.method==='GET' && url.pathname===BASE+'start') {
  const {authorizationUrl,...result}=await prepareRequestToken(env);
  if(authorizationUrl)return new Response(null,{status:303,headers:{...headers,Location:authorizationUrl}});
  // A provider rejection must remain visible and distinguishable from a 404.
  const rendered=page(env,crypto.randomUUID(),result);
  return new Response(rendered.body,{status:502,headers:rendered.headers});
 }
 if(request.method!=='POST'||url.pathname!==BASE+'start')return new Response('Not found',{status:404,headers});
 if(request.headers.get('Origin')!==url.origin)return new Response('Origin rejected',{status:403,headers});
 if(Number(request.headers.get('Content-Length')||0)>2048)return new Response('Request too large',{status:413,headers});
 const body=await request.text();if(body.length>2048)return new Response('Request too large',{status:413,headers});
 const csrf=new URLSearchParams(body).get('csrf');
 const saved=request.headers.get('Cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
 if(!csrf||!saved||csrf!==saved)return new Response('Session expired; reload the test page',{status:403,headers});
 return page(env,crypto.randomUUID(),await testRequestToken(env));
}
