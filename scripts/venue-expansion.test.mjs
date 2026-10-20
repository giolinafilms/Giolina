import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const stories=JSON.parse(readFileSync('src/content/venue-stories.json')).slice(2,7);
test('five authorized previews preserve exact event/media identities and safe metadata',()=>{
 assert.equal(stories.length,5);
 assert.deepEqual(stories.map(s=>s.photos.length),[5,0,2,1,2]);
 assert.deepEqual(stories.flatMap(s=>s.films.map(f=>f.id)),['425185852','9jzGeDjrO7','723528961','ttnbvY81xe','8baRrhNAed','793523768']);
 for(const s of stories){
  const page=JSON.parse(readFileSync('src/content/pages/'+s.pageFile));
  const doc=new JSDOM(readFileSync('dist'+page.path+'index.html','utf8')).window.document;
  assert.equal(doc.querySelectorAll('h1').length,1);
  assert.equal(doc.querySelector('meta[name=robots]').content,'noindex, nofollow');
  assert.equal(doc.querySelector('link[rel=canonical]').href,'https://giolinafilms.com'+page.path);
  assert.equal(doc.querySelectorAll('[data-photo-viewer-link]').length,s.photos.length);
  assert.equal(doc.querySelectorAll('[data-vimeo-id],[data-mediazilla-src]').length,s.films.length);
  const ids=[...doc.querySelectorAll('[id]')].map(x=>x.id);assert.equal(ids.length,new Set(ids).size);
  for(const img of doc.querySelectorAll('.gv-story img')){assert(img.alt);assert(existsSync('public'+img.getAttribute('src')));}
  assert(!page.content.includes('clients.giolina'));assert(!doc.querySelector('script[src*="production-analytics"]'));
  assert(!readFileSync('public/sitemap.xml','utf8').includes(page.path));
  assert(!readFileSync('dist/video-sitemap.xml','utf8').includes(page.path));
  for(const a of doc.querySelectorAll('.gv-story a[href^="/"]')){const href=a.getAttribute('href');assert(existsSync('public'+href)||existsSync('dist'+href+'index.html'),href);}
 }
 assert(stories[1].photographyPending);assert.equal(stories[1].coverage,'photo-video');
 assert.equal(stories[3].couple,'Julia');
});
