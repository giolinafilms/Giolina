import {adminProposalPreview,adminPackagePreview} from './proposal-share.mjs';
import {authenticate} from './auth.mjs';
import {api,json} from './api.mjs';
import {shell,locked} from './shell.mjs';
import {client,styles} from './assets.mjs';
export function privatePath(path){return /^\/(admin|portal)(\/|$)/.test(path)||/^\/api\/(admin|portal)(\/|$)/.test(path);}
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; frame-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",'X-Frame-Options':'DENY'};
function lockedResponse(request){const nonce=crypto.randomUUID();const h={...headers,'Content-Type':'text/html;charset=utf-8','Content-Security-Policy':"default-src 'none'; style-src 'nonce-"+nonce+"'; img-src 'self'; frame-ancestors 'none'; base-uri 'none'"};return new Response(request.method==='HEAD'?null:locked.replaceAll('__ENTRY_NONCE__',nonce),{status:503,headers:h});}
function response(body,type,status=200){return new Response(body,{status,headers:{...headers,'Content-Type':type}});}
export async function handlePrivate(request,env){
 const path=new URL(request.url).pathname;if(!privatePath(path))return null;
 const user=await authenticate(request,env);
 if(!user){if(path.startsWith('/api/'))return response(JSON.stringify({error:'Private workspace authentication required.'}),'application/json',401);return lockedResponse(request);}
 if(!env.CRM_DB)return lockedResponse(request);
 if(path.startsWith('/api/portal'))return response(JSON.stringify({error:'Client sign-in and client API access are not enabled in Phase 1.'}),'application/json',501);
 if(path.startsWith('/api/admin/')){try{const result=await api(request,env,user,path.slice('/api/admin/'.length));const h=new Headers(result.headers);for(const [k,v]of Object.entries(headers))h.set(k,v);return new Response(result.body,{status:result.status,headers:h});}catch{return response(JSON.stringify({error:'Private operation could not be completed.'}),'application/json',500);}}
 if(!['GET','HEAD'].includes(request.method))return response('Method not allowed','text/plain',405);
 const template=path.match(/^\/admin\/packages\/([^/]+)\/preview$/);if(template)return adminPackagePreview(request,env,template[1]);
 const proposal=path.match(/^\/admin\/proposals\/([^/]+)\/preview$/);if(proposal)return adminProposalPreview(request,env,proposal[1]);
 if(path==='/admin/app.js')return response(request.method==='HEAD'?null:client,'text/javascript;charset=utf-8');
 if(path==='/admin/app.css')return response(request.method==='HEAD'?null:styles,'text/css;charset=utf-8');
 if(/^\/admin\/(dashboard\/|leads\/|contacts\/|projects\/|services\/|packages\/|proposals\/|contracts\/|invoices\/|calendar\/|messages\/|templates\/|files\/|automations\/|client-portal\/|settings\/)?$/.test(path)||/^\/portal\/$/.test(path))return response(request.method==='HEAD'?null:shell,'text/html;charset=utf-8');
 if(path==='/admin'||path==='/portal')return new Response(null,{status:308,headers:{...headers,Location:path+'/'}});
 return response('Private route not found','text/plain',404);
}
