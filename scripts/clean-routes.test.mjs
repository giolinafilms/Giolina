import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker.js';
const moves={'/portfolio/':'/photography/','/portfolio-2/':'/cinematography/','/client-reviews/':'/reviews/','/experience-2/':'/experience/','/contact-us-2/':'/contact/','/contact-us/':'/contact/','/video-portfolio/':'/cinematography/','/photography-portfolio/':'/photography/'};
test('old page URLs redirect permanently without losing queries',async()=>{
 for(const [old,target] of Object.entries(moves))for(const method of ['GET','HEAD'])for(const path of [old,old.slice(0,-1)]){
 const response=await worker.fetch(new Request('https://preview.test'+path+'?source=legacy',{method}),{ASSETS:{fetch:async()=>new Response('asset')}});
 assert.equal(response.status,301,path);assert.equal(response.headers.get('location'),'https://preview.test'+target+'?source=legacy');
 }
});

test('obsolete Services URL redirects directly to the homepage before serving legacy content',async()=>{
 for(const origin of ['https://preview.test','https://giolinafilms.com'])for(const path of ['/services-2-2/','/services-2-2'])for(const method of ['GET','HEAD'])for(const query of ['', '?source=legacy&campaign=wedding%20films']){
  const response=await worker.fetch(new Request(origin+path+query,{method}),{
   ASSETS:{fetch:async()=>{throw new Error('Obsolete Services content must not be served');}}
  });
  assert.equal(response.status,301);
  assert.equal(response.headers.get('location'),origin+'/'+query);
 }
});

test('published pages use clean navigation, canonical metadata and preserve content',async()=>{
 const {readFileSync,readdirSync}=await import('node:fs');
 const {publishedPages}=await import('../src/config/public-paths.mjs');
 const originals=readdirSync('src/content/pages').filter(p=>p.endsWith('.json')).map(p=>JSON.parse(readFileSync('src/content/pages/'+p,'utf8')));
 const pages=publishedPages(originals);
 assert.equal(new Set(pages.map(p=>p.path)).size,pages.length);
 for(const path of ['/photography/','/cinematography/','/reviews/','/experience/','/contact/']){
 const html=readFileSync('dist'+path+'index.html','utf8');
 assert.ok(html.includes('href="https://giolinafilms.com'+path+'"'));
 for(const old of ['/portfolio/','/portfolio-2/','/client-reviews/','/experience-2/','/contact-us-2/'])assert.ok(!html.includes('href="'+old+'"'),old);
 assert.ok(html.includes('noindex, nofollow'));
 }
 const {JSDOM}=await import('jsdom');
 for(const [source,target] of [['portfolio','photography'],['portfolio-2','cinematography'],['client-reviews','reviews'],['experience-2','experience'],['contact-us-2','contact']]){
 const before=new JSDOM(JSON.parse(readFileSync('src/content/pages/'+source+'.json','utf8')).content).window.document;
 const after=new JSDOM(readFileSync('dist/'+target+'/index.html','utf8')).window.document.querySelector('main');
 const media=d=>[...d.querySelectorAll('img,video,source,iframe,[data-vimeo-id],[data-mediazilla-src]')].map(e=>[e.tagName,...['src','srcset','data-vimeo-id','data-mediazilla-src'].map(a=>e.getAttribute(a))]);
 assert.deepEqual(media(after),media(before),source+' approved media');
 }
});

