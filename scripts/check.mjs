import {readFileSync,existsSync,readdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import worker from '../worker.js';
const pages=readdirSync('src/content/pages').filter(x=>x.endsWith('.json')).map(x=>JSON.parse(readFileSync('src/content/pages/'+x,'utf8')));
let assets=0;const missingLinks=[];
for(const page of pages){
 const target='dist'+(page.path==='/'?'/index.html':page.path.replace(/\/$/,'')+'/index.html');
 assert(existsSync(target),`missing route ${page.path}`);
 const html=readFileSync(target,'utf8');
 assert(html.includes('noindex, nofollow'),`preview indexing ${page.path}`);
 assert(!/wp-admin|elementor(?:-pro)?\/assets\/js|jquery\.min\.js|admin-ajax\.php/.test(html),`WP runtime ${page.path}`);
 assert(html.includes('rel="canonical"'),`canonical ${page.path}`);
 for(const match of html.matchAll(/(?:src|href|data-thumbnail)="(\/assets\/[^"#?]+)/g)){
  assert(existsSync('dist'+match[1]),`missing asset ${match[1]}`);assets++;
 }
 for(const match of html.matchAll(/href="(\/[^"#?]*\/?)"/g)){
  const u=match[1];if(u.startsWith('/assets/')||u.endsWith('.css'))continue;
  if(!pages.some(p=>p.path===u))missingLinks.push({page:page.path,target:u});
 }
}
assert.equal(missingLinks.length,0,JSON.stringify(missingLinks));
const env={ASSETS:{fetch:async()=>new Response('<h1>Missing</h1>',{status:404})}};
const r=await worker.fetch(new Request('https://preview.test/unknown'),env);
assert.equal(r.status,404);assert.equal(r.headers.get('X-Robots-Tag'),'noindex, nofollow');assert.equal(r.headers.get('X-Content-Type-Options'),'nosniff');
const post=await worker.fetch(new Request('https://preview.test/',{method:'POST'}),env);assert.equal(post.status,405);
console.log(JSON.stringify({status:'passed',routes:pages.length,assetReferences:assets,localLinks:'passed',worker404:'passed',previewHeaders:'passed',unexpectedPost:'blocked',limitations:['visual/mobile QA pending','form delivery disabled','Vimeo playback pending','integration domain permissions pending','live Worker not deployed']},null,2));
