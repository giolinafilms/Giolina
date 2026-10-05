import {createRemoteJWKSet,jwtVerify} from 'jose';
export async function verifyIdentity(token,env,keys){
 const issuer='https://'+env.CRM_ACCESS_TEAM;
 const {payload}=await jwtVerify(token,keys,{issuer,audience:env.CRM_ACCESS_AUD,algorithms:['RS256'],requiredClaims:['exp','iat','sub','email'],maxTokenAge:'24h'});
 const allowed=env.CRM_ADMIN_EMAILS.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
 if(typeof payload.email!=='string'||!allowed.includes(payload.email.toLowerCase()))return null;
 return {subject:payload.sub,email:payload.email,organizationId:'giolina-preview',role:'admin'};
}
export async function authenticate(request,env){
 if(!env.CRM_ORIGIN||new URL(request.url).origin!==env.CRM_ORIGIN||!new URL(request.url).hostname.endsWith('.workers.dev'))return null;
 if(env.CRM_STAGE!=='preview'||!env.CRM_ACCESS_TEAM||!env.CRM_ACCESS_AUD||!env.CRM_ADMIN_EMAILS)return null;
 if(!/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(env.CRM_ACCESS_TEAM))return null;
 const token=request.headers.get('Cf-Access-Jwt-Assertion');if(!token||token.length>16000)return null;
 try{
  const issuer='https://'+env.CRM_ACCESS_TEAM;
  const keys=createRemoteJWKSet(new URL(issuer+'/cdn-cgi/access/certs'));
  return await verifyIdentity(token,env,keys);
 }catch{return null;}
}
