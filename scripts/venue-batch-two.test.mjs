import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const stories=JSON.parse(readFileSync('src/content/venue-stories.json'));
test('next wedding batch contains only verified films and correct coverage',()=>{
 const next=stories.slice(7,11);assert.equal(next.length,4);
 assert.deepEqual(next.flatMap(s=>s.films.map(f=>f.id)),['fAkBCNBFRB','842690557','799295947','263901273','d42vD8oAIH']);
 assert.deepEqual(next.map(s=>s.coverage),['photo-video','video-only','video-only','photo-video']);assert(next[3].photographyPending);
 for(const s of next){
  const p=JSON.parse(readFileSync('src/content/pages/'+s.pageFile));const d=new JSDOM(readFileSync('dist'+p.path+'index.html','utf8')).window.document;
  assert.equal(d.querySelectorAll('h1').length,1);assert.equal(d.querySelectorAll('[data-photo-viewer-link]').length,0);
  assert.equal(d.querySelector('meta[name=robots]').content,'noindex, nofollow');assert.equal(d.querySelector('link[rel=canonical]').href,'https://giolinafilms.com'+p.path);
  assert(!d.querySelector('script[src*="production-analytics"]'));assert(!readFileSync('public/sitemap.xml','utf8').includes(p.path));assert(!readFileSync('dist/video-sitemap.xml','utf8').includes(p.path));
  assert.equal(d.querySelectorAll('[data-film-title]').length,s.films.length);
  for(const img of d.querySelectorAll('.gv-story img')){assert(img.alt);assert(existsSync('public'+img.getAttribute('src')));}
  for(const a of d.querySelectorAll('.gv-story a[href^="/"]'))assert(existsSync('dist'+a.getAttribute('href')+'index.html'));
 }
 assert(!stories.some(s=>/Waterside|Palace|Addison|Liberty House/.test(s.venue)));
});
test('Gianna reuse uses the one independently matched current asset without changing the montage',()=>{
 const s=stories.find(s=>s.couple==='Gianna');assert.equal(s.photos.length,2);
 assert.equal(s.photos[1].src,'/sweet-media/s16-11551d4a48a929f1-large.webp');
 assert.equal(JSON.parse(readFileSync('src/content/sweet-sixteen-photos.json')).length,28);
});
