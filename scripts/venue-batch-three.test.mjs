import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const stories=JSON.parse(readFileSync('src/content/venue-stories.json'));
test('Giando preserves two distinct films and owner-corrected event coverage without invented photos',()=>{
 const s=stories.find(s=>s.venue==='Giando on the Water');
 assert.equal(s.coverage,'photo-video');assert(s.photographyPending);assert.equal(s.photos.length,0);
 assert.deepEqual(s.films.map(f=>f.coverage),['video-only','photo-video']);
 assert.deepEqual(s.films.map(f=>f.id),['fAkBCNBFRB','842690557']);
 const p=JSON.parse(readFileSync('src/content/pages/'+s.pageFile));const d=new JSDOM(p.content).window.document;
 assert.deepEqual([...d.querySelectorAll('.gv-client-heading h2')].map(e=>e.textContent),['Alexandria & James','Selena & Dashmir']);
 assert.equal(d.querySelectorAll('[data-photo-viewer-link]').length,0);
});
test('Stroudsmoor and Boscobel use verified films, local posters and nonindexable canonical previews',()=>{
 const next=stories.slice(11,13);assert.equal(next.length,2);assert.deepEqual(next.map(s=>s.film.id),['425184212','gjx8Km0Irn']);
 for(const s of next){
  assert.equal(s.coverage,'video-only');assert.equal(s.photos.length,0);
  const p=JSON.parse(readFileSync('src/content/pages/'+s.pageFile));const d=new JSDOM(readFileSync('dist'+p.path+'index.html')).window.document;
  assert.equal(d.querySelectorAll('h1').length,1);assert.equal(d.querySelector('meta[name=robots]').content,'noindex, nofollow');
  assert.equal(d.querySelector('link[rel=canonical]').href,'https://giolinafilms.com'+p.path);
  assert(!d.querySelector('script[src*="production-analytics"]'));assert(!d.querySelector('[data-photo-viewer-link]'));
  assert(!readFileSync('public/sitemap.xml','utf8').includes(p.path));assert(!readFileSync('dist/video-sitemap.xml','utf8').includes(p.path));
  assert(existsSync('public'+s.film.poster));
  for(const el of d.querySelectorAll('script[type="application/ld+json"]'))JSON.parse(el.textContent);
  for(const a of d.querySelectorAll('.gv-story a[href^="/"]'))assert(existsSync('dist'+a.getAttribute('href')+'index.html'));
 }
});
