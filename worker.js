import {publicPortal} from './admin/client-portal.mjs';
import {publicDocument} from './admin/documents.mjs';
import {publicProposal} from './admin/proposal-share.mjs';
import {handlePrivate} from './admin/router.mjs';
import redirects from './src/config/redirects.mjs';

export default {
 async fetch(request, env) {
  const portalResponse=await publicPortal(request,env);if(portalResponse)return portalResponse;
  const documentResponse=await publicDocument(request,env);if(documentResponse)return documentResponse;
  const proposalResponse=await publicProposal(request,env);if(proposalResponse)return proposalResponse;
  const privateResponse=await handlePrivate(request,env);
  if(privateResponse)return privateResponse;
  const url=new URL(request.url);
  if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
  const target=redirects[url.pathname] || redirects[url.pathname.endsWith('/') ? url.pathname : url.pathname+'/'];
  if(target)return new Response(null,{status:301,headers:{Location:new URL(target+url.search,url.origin).href,'X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'}});
  const response=await env.ASSETS.fetch(request);
  const headers=new Headers(response.headers);
  headers.set('X-Content-Type-Options','nosniff');
  headers.set('Referrer-Policy','strict-origin-when-cross-origin');
  // Preview gate: remove only in separately approved production configuration.
  headers.set('X-Robots-Tag','noindex, nofollow');
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
 }
};
