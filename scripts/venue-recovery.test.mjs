import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const stories=JSON.parse(readFileSync('src/content/venue-stories.json'));
test('recovered photographs have complete WebP payloads and natural proportions',()=>{
 const photos=stories.flatMap(s=>s.photos).filter(p=>p.src.startsWith('/assets/v26-'));
 assert.equal(photos.length,22);assert.equal(new Set(photos.map(p=>p.src)).size,22);
 for(const p of photos){assert(p.naturalRatio);assert(p.alt);for(const file of [p.src,p.small]){const b=readFileSync('public'+file);assert(b.length>100,file);assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');assert.equal(b.readUInt32LE(4)+8,b.length,file);}}
});
test('three recovered venue pages match confirmed coverage and stay preview only',()=>{
 const next=stories.slice(13);assert.equal(next.length,3);
 assert.deepEqual(next.map(s=>s.coverage),['video-only','photo-video','photo-only']);
 assert.deepEqual(next.map(s=>s.film?.id??null),['122910081','Hoq2eguL6',null]);
 assert.deepEqual(next.map(s=>s.photos.length),[0,10,12]);
 for(const s of next){const p=JSON.parse(readFileSync('src/content/pages/'+s.pageFile));const d=new JSDOM(readFileSync('dist'+p.path+'index.html')).window.document;
 assert.equal(d.querySelectorAll('h1').length,1);assert.equal(d.querySelector('meta[name=robots]').content,'noindex, nofollow');assert.equal(d.querySelector('link[rel=canonical]').href,'https://giolinafilms.com'+p.path);
 assert.equal(d.querySelectorAll('[data-photo-viewer-link]').length,s.photos.length);assert.equal(d.querySelectorAll('[data-film-title]').length,s.film?1:0);assert(d.querySelector('.gv-button[href="/contact/"]'));assert(!d.querySelector('figcaption'));assert(!d.querySelector('script[src*="production-analytics"]'));
 assert(!readFileSync('public/sitemap.xml','utf8').includes(p.path));assert(!readFileSync('dist/video-sitemap.xml','utf8').includes(p.path));for(const e of d.querySelectorAll('script[type="application/ld+json"]'))JSON.parse(e.textContent);
 }
});
