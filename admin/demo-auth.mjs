// LOCAL DEMO ONLY. Not imported by Worker or browser; never an Access bypass.
import {scrypt as derive,randomBytes,createHash,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(derive),parameters={N:131072,r:8,p:1,maxmem:192*1024*1024};
const random=()=>randomBytes(32).toString('base64url'),digest=value=>createHash('sha256').update(value).digest('hex');
export async function hashPassword(password){
 if(typeof password!=='string'||password.length<15||Buffer.byteLength(password)>1024)throw Error('Use a password of 15–1024 characters/bytes');
 const salt=randomBytes(16).toString('hex'),key=await scrypt(password,salt,64,parameters);return {algorithm:'scrypt',N:parameters.N,r:8,p:1,salt,hash:key.toString('hex')};
}
export async function verifyPassword(password,record){
 if(typeof password!=='string'||Buffer.byteLength(password)>1024||record?.algorithm!=='scrypt'||record.N!==parameters.N||record.r!==8||record.p!==1||!/^([a-f0-9]{32})$/.test(record.salt||'')||!/^([a-f0-9]{128})$/.test(record.hash||''))return false;
 const key=await scrypt(password,record.salt,64,parameters);return timingSafeEqual(key,Buffer.from(record.hash,'hex'));
}
export function allowed(role,capability,realm='admin'){
 if(realm!=='admin')return false;
 if(!['OWNER / ADMIN','STAFF'].includes(role))return false;
 if(['users','roles','integrations','financial-settings','system-settings'].includes(capability))return role==='OWNER / ADMIN';
 return ['workspace','documents','communications','scheduling','tasks'].includes(capability);
}
export async function createDemoAuth({stage,origin,now=()=>Date.now()}={}){
 if(stage!=='local-demo'||!/^https:\/\/localhost(?::\d+)?$/.test(origin||''))throw Error('Authentication demo is local-only');
 const users=new Map(),sessions=new Map(),resets=new Map(),attempts=new Map(),audit=[];
 const dummy=await hashPassword(random()+random());
 const log=(action,id)=>audit.push({action,userId:id||null,simulated:true,occurredAt:new Date(now()).toISOString()});
 const safe=u=>({id:u.id,email:u.email,role:u.role,realm:u.realm,disabled:u.disabled,lastLogin:u.lastLogin||null});
 const revoke=id=>{for(const [key,s]of sessions)if(s.userId===id)sessions.delete(key);};
 function session(token,realm='admin'){
  const key=digest(token||''),s=sessions.get(key),u=s&&users.get(s.userId);
  if(!s||!u||u.disabled||s.realm!==realm||u.realm!==realm||s.expiresAt<=now()||s.idleUntil<=now()){sessions.delete(key);throw Error('Session unavailable');}
  s.idleUntil=Math.min(s.expiresAt,now()+3600000);return {s,u};
 }
 return {
  async createUser({email,password,role='STAFF',realm='admin'}){
   if(!email?.endsWith('@example.test')||users.has(email.toLowerCase())||!(realm==='admin'?['OWNER / ADMIN','STAFF'].includes(role):realm==='client'&&role==='CLIENT'))throw Error('Invalid synthetic account');
   const record=await hashPassword(password),u={id:crypto.randomUUID(),email:email.toLowerCase(),password:record,role,realm,disabled:false};users.set(u.email,u);users.set(u.id,u);log('demo-user-created',u.id);return safe(u);
  },
  async login({email,password,realm='admin',trusted=false,clientKey='local'}){
   const key=digest((email||'').toLowerCase()+'|'+clientKey),bucket=attempts.get(key)||{count:0,until:now()+900000};if(bucket.until<=now()){bucket.count=0;bucket.until=now()+900000;}if(bucket.count>=5)throw Error('Try again later');bucket.count++;attempts.set(key,bucket);
   const u=users.get((email||'').toLowerCase()),verified=await verifyPassword(password,u?.password||dummy);
   if(!verified||!u||u.disabled||u.realm!==realm){log('demo-login-failed',null);throw Error('Unable to sign in');}attempts.delete(key);
   const token=random(),csrf=random(),seconds=trusted?7*86400:86400;u.lastLogin=new Date(now()).toISOString();sessions.set(digest(token),{userId:u.id,realm,csrfHash:digest(csrf),expiresAt:now()+seconds*1000,idleUntil:now()+3600000});log('demo-login',u.id);
   return {user:safe(u),token,csrf,cookie:'__Host-gio-'+realm+'-demo='+token+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age='+seconds,simulated:true};
  },
  authorize(token,capability,{realm='admin',requestOrigin,csrf,write=false}={}){
   const {s,u}=session(token,realm);if(!allowed(u.role,capability,realm))throw Error('Permission denied');if(write&&(requestOrigin!==origin||!csrf||!timingSafeEqual(Buffer.from(s.csrfHash,'hex'),Buffer.from(digest(csrf),'hex'))))throw Error('Invalid request');return safe(u);
  },
  logout(token){const {u}=session(token);sessions.delete(digest(token));log('demo-logout',u.id);},
  disable(ownerToken,id,disabled=true){const owner=this.authorize(ownerToken,'users'),u=users.get(id);if(!u||u.id===owner.id)throw Error('Account unavailable');u.disabled=disabled;revoke(u.id);for(const [key,value]of resets)if(value.userId===u.id)resets.delete(key);log(disabled?'demo-user-disabled':'demo-user-enabled',u.id);},
  setRole(ownerToken,id,role){const owner=this.authorize(ownerToken,'roles');const u=users.get(id);if(!u||u.id===owner.id||u.realm!=='admin'||!['STAFF','OWNER / ADMIN'].includes(role))throw Error('Invalid role');u.role=role;revoke(id);log('demo-role-changed',id);},
  revoke(ownerToken,id){this.authorize(ownerToken,'users');revoke(id);log('demo-sessions-revoked',id);},
  requestReset(email){const u=users.get((email||'').toLowerCase());if(!u||u.disabled)return {message:'If eligible, reset instructions can be prepared.',simulated:true};const token=random();resets.set(digest(token),{userId:u.id,expiresAt:now()+1800000});log('demo-reset-created',u.id);return {token,message:'DEMO reset token created locally. No email sent.',simulated:true};},
  async reset(token,password){const key=digest(token||''),r=resets.get(key),u=r&&users.get(r.userId);if(!r||!u||u.disabled||r.expiresAt<=now())throw Error('Reset unavailable');const passwordRecord=await hashPassword(password);if(!resets.has(key))throw Error('Reset unavailable');resets.delete(key);u.password=passwordRecord;revoke(u.id);for(const [k,v]of resets)if(v.userId===u.id)resets.delete(k);log('demo-password-reset',u.id);},
  users(ownerToken){this.authorize(ownerToken,'users');return [...users.values()].filter((u,i,a)=>a.findIndex(x=>x.id===u.id)===i).map(safe);},
  audit(){return structuredClone(audit);}
 };
}
