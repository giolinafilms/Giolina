import assert from 'node:assert/strict';
import {oauthHeader,seal,unseal,readUrl,handleSmugMug} from '../smugmug.js';
const origin='https://giolina.dawn-math-f4b1.workers.dev';
// Public OAuth 1.0 example vector; never real GioLina credentials.
const vector={SMUGMUG_API_KEY:'dpf43f3p2l4k3l03',SMUGMUG_API_SECRET:'kd94hf93k423kf44'};
const signed=await oauthHeader('http://photos.example.net/photos?file=vacation.jpg&size=original',vector,
 {token:'nnch734d00sl2jdk',secret:'pfkkdhi9sl3r4s00'},{},{nonce:'kllo9940pd9333jh',timestamp:'1191242096'});
assert.ok(signed.includes('oauth_signature="tR3%2BTy81lMeYAr%2FFid0kMTYa%2FWM%3D"'));
const env={SMUGMUG_API_KEY:'fictional-test-key',SMUGMUG_API_SECRET:'fictional-test-secret'};
const session={kind:'access',token:'fictional-token',secret:'fictional-token-secret',csrf:'test-csrf',expires:Date.now()+60000};
const encrypted=await seal(session,env,origin);
assert.ok(!encrypted.includes(session.token));assert.deepEqual(await unseal(encrypted,env,origin),session);
assert.equal(await unseal(encrypted,env,'https://other.example'),null);
assert.equal(await unseal(encrypted.slice(0,-2)+'xx',env,origin),null);
assert.equal(await unseal(await seal({...session,expires:0},env,origin),env,origin),null);
for(const path of ['/api/v2!authuser','/api/v2/node/ABC!children?start=101&count=100','/api/v2/album/ABC!images','/api/v2/image/ABC-0!sizedetails'])assert.ok(readUrl(path));
for(const path of ['https://evil.example/','//evil.example/api/v2!authuser','/api/v2/node/ABC!unlock','/api/v2/album/ABC!images?_method=DELETE','/api/v2/image/ABC?APIKey=test','/api/v2/node/ABC!children?count=100000','/api/v2/upload'])assert.throws(()=>readUrl(path));
const request=(action,body,opts={})=>new Request(origin+'/__smugmug/'+action,{method:'POST',headers:{Origin:opts.origin||origin,'Content-Type':'application/json',Cookie:'__Host-gl-smug='+encrypted},body:JSON.stringify({csrf:session.csrf,...body})});
assert.equal((await handleSmugMug(new Request(origin+'/__smugmug/status'),{})).status,200);
assert.equal((await handleSmugMug(request('read',{path:'/api/v2!authuser'},{origin:'https://evil.example'}),env)).status,403);
assert.equal((await handleSmugMug(request('read',{csrf:'wrong',path:'/api/v2!authuser'}),env)).status,403);
assert.equal((await handleSmugMug(new Request(origin+'/__smugmug/read',{method:'POST',headers:{Origin:origin},body:'{}'}),env)).status,401);
assert.equal((await handleSmugMug(request('read',{path:'/api/v2/node/ABC!unlock'}),env)).status,400);
const originalFetch=globalThis.fetch;let calls=[];
globalThis.fetch=async(url,options)=>{
 calls.push({url:String(url),method:options.method});
 if(String(url).includes('getRequestToken'))return new Response('oauth_token=fictional-request&oauth_token_secret=fictional-request-secret');
 if(String(url).includes('getAccessToken'))return new Response('oauth_token=fictional-access&oauth_token_secret=fictional-access-secret');
 return Response.json({Response:{User:{Name:'Test Account',NickName:'test',Uris:{Node:{Uri:'/api/v2/node/ROOT'}}}}});
};
try{
 const start=await handleSmugMug(request('start',{}),env);assert.equal(start.status,200);
 const data=await start.json();const auth=new URL(data.authorizationUrl);
 assert.equal(auth.searchParams.get('Permissions'),'Read');assert.equal(auth.searchParams.get('Access'),'Full');
 const pending=start.headers.get('Set-Cookie').split(';')[0];
 const complete=await handleSmugMug(new Request(origin+'/__smugmug/complete',{method:'POST',headers:{Origin:origin,Cookie:pending},body:JSON.stringify({csrf:session.csrf,verifier:'123456'})}),env);
 assert.equal(complete.status,200);assert.equal((await complete.json()).account.Name,'Test Account');
 assert.ok(complete.headers.get('Set-Cookie').includes('HttpOnly; Secure; SameSite=Strict'));
 assert.ok(calls.every(call=>call.method==='GET'));
 assert.ok(!complete.headers.get('Set-Cookie').includes('fictional-access'));
 globalThis.fetch=async()=>new Response('sensitive-upstream-body',{status:401});
 const failure=await handleSmugMug(request('read',{path:'/api/v2!authuser'}),env);
 assert.ok(!(await failure.text()).includes('sensitive-upstream-body'));
}finally{globalThis.fetch=originalFetch;}
console.log('SmugMug checks passed: OAuth vector, encrypted sessions, expiry/tampering, read allowlist, CSRF/origin gates, mocked read-only authorization, redacted failures.');
