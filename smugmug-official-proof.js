// Independent one-call proof of SmugMug's non-web rauth example.
// No imports from existing auth controllers, sessions or diagnostic helpers.
import { hmacsign } from './vendor/oauth-sign-webcrypto.mjs';
const endpoint='https://secure.smugmug.com/services/oauth/1.0a/getRequestToken';
export async function buildOfficialRequest(env) {
 const params={oauth_consumer_key:env.SMUGMUG_API_KEY,oauth_nonce:crypto.randomUUID(),oauth_signature_method:'HMAC-SHA1',oauth_timestamp:String(Math.floor(Date.now()/1000)),oauth_version:'1.0',oauth_callback:'oob'};
 params.oauth_signature=await hmacsign('GET',endpoint,params,env.SMUGMUG_API_SECRET,'');
 // rauth's GET default is header_auth=False: transmit the signed fields as query parameters.
 const url=new URL(endpoint);url.search=new URLSearchParams(params).toString();
 return new Request(url,{method:'GET',redirect:'manual'});
}
export async function officialProof(request,env) {
 if(new URL(request.url).hostname!=='smugmug-discovery-giolina.dawn-math-f4b1.workers.dev'||request.method!=='GET')return new Response('Not found',{status:404});
 const safe={method:'GET',endpoint,signatureMethod:'HMAC-SHA1',callback:'oob',oauthFieldsLocation:'query',authorizationHeader:'absent',contentType:'absent',requestBody:'none',redirectFollowing:false};
 let result;
 if(!env.SMUGMUG_API_KEY||!env.SMUGMUG_API_SECRET)result={...safe,error:'runtime_secrets_missing'};
 else try {
  const outgoing=await buildOfficialRequest(env);
  const response=await fetch(outgoing,{signal:AbortSignal.timeout(20000)});
  // No response body, signature, credential or token is logged or returned.
  const reader=response.body?.getReader();let raw='',size=0;
  if(reader){const decoder=new TextDecoder();while(true){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>16384){await reader.cancel();throw new Error('large_response');}raw+=decoder.decode(part.value,{stream:true});}}
  const fields=new URLSearchParams(raw);
  if(response.ok){result={...safe,httpStatus:response.status,requestTokenSucceeded:!!fields.get('oauth_token')&&!!fields.get('oauth_token_secret'),error:null};}
  else {const problem=fields.get('oauth_problem');result={...safe,httpStatus:response.status,requestTokenSucceeded:false,error:['signature_invalid','consumer_key_rejected','consumer_key_unknown','timestamp_refused','parameter_absent','token_rejected','permission_denied'].includes(problem)?problem:'request_token_rejected'};}
 } catch {result={...safe,requestTokenSucceeded:false,error:'request_failed'};}
 return new Response(JSON.stringify(result,null,2),{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, private','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff'}});
}
