import { handleSmugMug } from './smugmug-request-token.js';
import { officialProof } from './smugmug-official-proof.js';
export default {
 async fetch(request, env) {
  const url=new URL(request.url);
  if(url.pathname==='/__smugmug/official-proof')return officialProof(request,env);
  if(url.pathname.startsWith('/__smugmug/')) {
   const discovery=await handleSmugMug(request,env);
   if(discovery)return discovery;
  }
  if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
  const response=await env.ASSETS.fetch(request);
  const headers=new Headers(response.headers);
  headers.set('X-Content-Type-Options','nosniff');
  headers.set('Referrer-Policy','strict-origin-when-cross-origin');
  // Preview gate: remove only in separately approved production configuration.
  headers.set('X-Robots-Tag','noindex, nofollow');
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
 }
};
