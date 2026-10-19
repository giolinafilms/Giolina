import {publicPortal} from './admin/client-portal.mjs';
import {publicDocument} from './admin/documents.mjs';
import {publicProposal} from './admin/proposal-share.mjs';
import {handlePrivate} from './admin/router.mjs';
import redirects from './src/config/redirects.mjs';
import {productionPolicy,applyProductionHtml} from './src/config/production-policy.mjs';

export default {
 async fetch(request, env) {
  const portalResponse=await publicPortal(request,env);if(portalResponse)return portalResponse;
  const documentResponse=await publicDocument(request,env);if(documentResponse)return documentResponse;
  const proposalResponse=await publicProposal(request,env);if(proposalResponse)return proposalResponse;
  const privateResponse=await handlePrivate(request,env);
  if(privateResponse)return privateResponse;
  const url=new URL(request.url);
  const policy=productionPolicy(url,env);
  // Retired review evidence stays private, including old cached asset URLs.
  if(url.pathname.startsWith('/qa/proposal-mobile-2026-10-05/'))return new Response('Not found',{status:404,headers:{'X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'}});
  if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
  if(url.pathname==='/robots.txt'&&policy.index)return new Response(request.method==='HEAD'?null:'User-agent: *\nAllow: /\nSitemap: https://giolinafilms.com/sitemap.xml\nSitemap: https://giolinafilms.com/video-sitemap.xml\n',{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}});
  const target=redirects[url.pathname] || redirects[url.pathname.endsWith('/') ? url.pathname : url.pathname+'/'];
  if(target)return new Response(null,{status:301,headers:{Location:new URL(target+url.search,url.origin).href,'X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'}});
  const response=await env.ASSETS.fetch(request);
  const headers=new Headers(response.headers);
  headers.set('X-Content-Type-Options','nosniff');
  headers.set('Referrer-Policy','strict-origin-when-cross-origin');
  const ok=response.status===200;
  headers.set('X-Robots-Tag',policy.index&&ok?'index, follow':'noindex, nofollow');
  const html=headers.get('Content-Type')?.includes('text/html');
  if(ok&&html&&(policy.index||policy.analytics)){
   headers.delete('Content-Length');headers.delete('ETag');headers.set('Cache-Control','no-store');
  }
  const result=new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  return ok&&html&&request.method==='GET'?applyProductionHtml(result,policy):result;
 }
};
