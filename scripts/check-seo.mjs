import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import worker from '../worker.js';
import redirects from '../src/config/redirects.mjs';
import {canonicalOrigin,analytics,mainPagePaths} from '../src/config/site.mjs';

const titles=new Set(),descriptions=new Set();
for(const path of mainPagePaths){
 const html=readFileSync('dist'+(path==='/'?'/index.html':path+'index.html'),'utf8');
 if(!path.startsWith('/events/'))assert(!/href="\/events(?:\/|\")/.test(html),`retired Events link ${path}`);
 for(const label of ['Main navigation','Mobile navigation','Footer navigation']){
  const nav=html.match(new RegExp(`<nav[^>]*aria-label="${label}"[^>]*>([\\s\\S]*?)</nav>`))?.[1];
  if(nav){assert(!/>Events</.test(nav),`Events absent from ${label} ${path}`);assert(nav.includes('href="/client-reviews/"'),`Reviews retained in ${label} ${path}`);assert(nav.indexOf('>Cinematography<')<nav.indexOf('>Photography<'),`Film before photo in ${label} ${path}`);}
 }
 const title=html.match(/<title>(.*?)<\/title>/s)?.[1];
 assert(title&&!titles.has(title),`title ${path}`);titles.add(title);
 const meta=[...html.matchAll(/<meta\b[^>]*>/g)].map(m=>Object.fromEntries([...m[0].matchAll(/([\w:-]+)="([^"]*)"/g)].map(a=>[a[1],a[2]])));
 const desc=meta.filter(m=>m.name==='description');
 assert(desc.length===1&&desc[0].content&&!descriptions.has(desc[0].content),`description ${path}`);descriptions.add(desc[0].content);
 assert(!/quiz|lorem ipsum/i.test(desc[0].content),`stale description ${path}`);
 assert(!/temporary-photo-\d+\.svg|\$____|lorem ipsum/i.test(html),`unfinished public gallery/pricing ${path}`);
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
// Guard the new film catalog against stale source/title metadata and broken assets.
const videoSitemap=readFileSync('dist/video-sitemap.xml','utf8');
assert(videoSitemap.includes('xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"'));
const decodeXml=value=>value.replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&quot;','"').replaceAll('&apos;',"'");
let videoCount=0;
for(const [path,count] of [['/portfolio-2/',28],['/sweet-sixteen/',5],['/ready-to-go-productions/',17]]){
 const html=readFileSync('dist'+path+'index.html','utf8');
 const schemas=[...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].map(match=>JSON.parse(match[1]));
 const catalogs=schemas.filter(schema=>schema['@type']==='ItemList');assert.equal(catalogs.length,1);
 const catalog=catalogs[0];assert.equal(catalog.numberOfItems,count);assert.equal(catalog.itemListElement.length,count);
 const sources=new Set(),ids=new Set();
 for(const {item,position} of catalog.itemListElement){
  assert.equal(item['@type'],'MediaObject');assert(position>0);assert(item.name&&item.description&&item.thumbnailUrl);
  assert(!/— film \d+/.test(item.name));assert(!item.uploadDate&&!item.duration,'unverified film dates/durations');
  const source=item.contentUrl??item.embedUrl;assert(source&&!sources.has(source));sources.add(source);
  assert(!ids.has(item['@id']));ids.add(item['@id']);
  for(const url of [item.thumbnailUrl,item.contentUrl].filter(Boolean))if(url.startsWith(canonicalOrigin+'/assets/'))assert(existsSync('dist'+new URL(url).pathname));
 }
 const entry=[...videoSitemap.matchAll(/<url>(.*?)<\/url>/gs)].map(match=>match[1]).find(value=>value.includes(`<loc>${canonicalOrigin+path}</loc>`));assert(entry);
 const videos=[...entry.matchAll(/<video:video>(.*?)<\/video:video>/gs)];assert.equal(videos.length,count);videoCount+=count;
 videos.forEach((video,index)=>{
  const item=catalog.itemListElement[index].item;
  for(const [tag,expected] of [['title',item.name],['description',item.description],['thumbnail_loc',item.thumbnailUrl],[item.contentUrl?'content_loc':'player_loc',item.contentUrl??item.embedUrl]]){
   assert.equal(decodeXml(video[1].match(new RegExp(`<video:${tag}>(.*?)</video:${tag}>`,'s'))?.[1]??''),expected);
  }
 });
}
assert.equal(videoCount,50);
assert(!videoSitemap.includes(canonicalOrigin+'/events/'),'Deferred Events excluded from video sitemap');
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
