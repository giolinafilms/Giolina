import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import worker from '../worker.js';
import redirects from '../src/config/redirects.mjs';
import {canonicalOrigin,analytics,mainPagePaths} from '../src/config/site.mjs';

const titles=new Set(),descriptions=new Set();
for(const path of mainPagePaths){
 const html=readFileSync('dist'+(path==='/'?'/index.html':path+'index.html'),'utf8');
 const title=html.match(/<title>(.*?)<\/title>/s)?.[1];
 assert(title&&!titles.has(title),`title ${path}`);titles.add(title);
 const meta=[...html.matchAll(/<meta\b[^>]*>/g)].map(m=>Object.fromEntries([...m[0].matchAll(/([\w:-]+)="([^"]*)"/g)].map(a=>[a[1],a[2]])));
 const desc=meta.filter(m=>m.name==='description');
 assert(desc.length===1&&desc[0].content&&!descriptions.has(desc[0].content),`description ${path}`);descriptions.add(desc[0].content);
 assert(!/quiz|lorem ipsum/i.test(desc[0].content),`stale description ${path}`);
 assert.equal([...html.matchAll(/<h1\b/g)].length,1,`H1 ${path}`);
 const canonicals=[...html.matchAll(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/g)];
 assert.equal(canonicals.length,1);assert.equal(canonicals[0][1],new URL(path,canonicalOrigin).href);
 assert(html.includes('noindex, nofollow'),`preview gate ${path}`);
 assert(!/localhost|127\.0\.0\.1|\/workspace\/|\/tmp\/|workers\.dev|wp-content|wp-json/.test(html),`stale build or WordPress metadata ${path}`);
 const ids=new Set();
 for(const script of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)){
  const schema=JSON.parse(script[1]);assert.equal(schema['@context'],'https://schema.org');
  for(const node of schema['@graph']??[schema]){
   assert(node['@type']);if(node['@id']){assert(!ids.has(node['@id']));ids.add(node['@id']);}
   if(node['@type']==='ImageObject'){assert(existsSync('dist'+new URL(node.contentUrl).pathname));assert(node.width>0&&node.height>0);}
  }
 }
 const configuration=JSON.parse(html.match(/<script[^>]*id="gl-analytics-config"[^>]*>(.*?)<\/script>/s)[1]);
 assert.equal(configuration.measurementId,'G-KD1ES061DH');assert.equal(configuration.enabled,false);
 assert(!/googletagmanager\.com|google-analytics\.com/.test(html),'preview analytics must remain disabled');
}
const sitemap=readFileSync('dist/sitemap.xml','utf8');
const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
assert.deepEqual(urls,mainPagePaths.map(p=>canonicalOrigin+p));
assert.equal(new Set(urls).size,urls.length);
for(const [source,target] of Object.entries(redirects)){
 assert(!redirects[target],`redirect chain ${source}`);
 if(target.startsWith('/assets/'))assert(existsSync('dist'+target));
 for(const method of ['GET','HEAD']){
  const r=await worker.fetch(new Request('https://preview.test'+source+'?qa=1',{method}),{ASSETS:{fetch(){throw Error('redirect used asset binding');}}});
  assert.equal(r.status,301,source);assert.equal(r.headers.get('Location'),'https://preview.test'+target+'?qa=1');
  assert.equal(r.headers.get('X-Robots-Tag'),'noindex, nofollow');
 }
}
const missing=await worker.fetch(new Request('https://preview.test/qa-no-such-page'),{ASSETS:{fetch:async()=>new Response('Missing',{status:404})}});
assert.equal(missing.status,404);
console.log(JSON.stringify({status:'passed',mainPages:mainPagePaths.length,redirects:Object.keys(redirects).length,sitemapUrls:urls.length,analytics:analytics.measurementId,previewTracking:'disabled'},null,2));
