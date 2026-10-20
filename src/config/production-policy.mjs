import {mainPagePaths,analytics} from './site.mjs';
const publicPages=new Set([...mainPagePaths,'/photography/wedding-collection/','/weddings/the-park-savoy-florham-park/','/weddings/gargiulos-brooklyn/','/weddings/laurita-winery-new-egypt/','/weddings/stroudsmoor-stroudsburg/','/weddings/boscobel-garrison/']);
const seoFiles=new Set(['/robots.txt','/sitemap.xml','/video-sitemap.xml']);
export function productionPolicy(url,env={}) {
 const production=url.origin==='https://giolinafilms.com';
 return {
  index:production&&env.GIOLINA_INDEXING_ENABLED==='true'&&(publicPages.has(url.pathname)||seoFiles.has(url.pathname)),
  analytics:production&&env.GIOLINA_ANALYTICS_ENABLED==='true'&&publicPages.has(url.pathname)
 };
}
export function applyProductionHtml(response,policy) {
 if(!policy.index&&!policy.analytics)return response;
 const rewriter=new HTMLRewriter();
 if(policy.index)rewriter.on('meta[name="robots"]',{element(e){e.setAttribute('content','index, follow');}});
 if(policy.analytics){
  rewriter.on('#gl-analytics-config',{element(e){e.setInnerContent(JSON.stringify({...analytics,enabled:true}),{html:true});}});
  rewriter.on('head',{element(e){e.append('<script src="/production-analytics.js" defer></script>',{html:true});}});
 }
 return rewriter.transform(response);
}
