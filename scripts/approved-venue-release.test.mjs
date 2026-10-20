import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {productionPolicy} from '../src/config/production-policy.mjs';
const slugs=['gargiulos-brooklyn','laurita-winery-new-egypt','stroudsmoor-stroudsburg','boscobel-garrison'];
const ids=['799295947','263901273','425184212','gjx8Km0Irn'];
const blocked=['the-venetian-garfield','giando-on-the-water-brooklyn','naninas-in-the-park-belleville','the-rockleigh','buttonwood-manor-matawan'];
const flags={GIOLINA_INDEXING_ENABLED:'true',GIOLINA_ANALYTICS_ENABLED:'true'};
test('exact approved venue release preserves films, metadata, sitemap and public discovery',()=>{
 for(const [i,slug] of slugs.entries()){
  const path='/weddings/'+slug+'/';const h=readFileSync('dist'+path+'index.html','utf8');const d=new JSDOM(h).window.document;
  assert.equal(d.querySelectorAll('h1').length,1);assert.equal(d.querySelector('link[rel=canonical]').href,'https://giolinafilms.com'+path);
  assert(d.querySelector('meta[name=description]').content);assert.equal(d.querySelectorAll('[data-film-title]').length,1);assert(h.includes(ids[i]));
  assert(!d.querySelector('[data-photo-viewer-link],.gv-watch-link,.gv-film-heading span'));
  for(const s of d.querySelectorAll('script[type="application/ld+json"]'))JSON.parse(s.textContent);
  for(const img of d.querySelectorAll('.gv-story img'))assert(existsSync('public'+img.getAttribute('src')));
  for(const a of d.querySelectorAll('.gv-story a[href^="/"]'))assert(existsSync('dist'+a.getAttribute('href')+'index.html'));
  for(const f of ['dist/sitemap.xml','dist/video-sitemap.xml','dist/cinematography/index.html','dist/photography/index.html','dist/photography/wedding-collection/index.html'])assert(readFileSync(f,'utf8').includes(path),f);
  assert.deepEqual(productionPolicy(new URL('https://giolinafilms.com'+path),flags),{index:true,analytics:true});
  assert.deepEqual(productionPolicy(new URL('https://preview.test'+path),flags),{index:false,analytics:false});
 }
 for(const slug of blocked){assert(!existsSync('dist/weddings/'+slug+'/index.html'));assert(!readFileSync('dist/sitemap.xml','utf8').includes(slug));}
 for(const slug of ['vanderbilt-at-south-beach','island-chateau','arianas-south'])assert(!existsSync('dist/sweet-sixteen/'+slug+'/index.html'));
 assert.equal((readFileSync('dist/sitemap.xml','utf8').match(/<loc>/g)||[]).length,15);
 assert.equal((readFileSync('dist/video-sitemap.xml','utf8').match(/<video:video>/g)||[]).length,54);
});
test('new venue routes retain affirmative consent and a single sanitized page view',()=>{
 for(const slug of slugs){
  const w=new JSDOM('<footer></footer><script id="gl-analytics-config" type="application/json">{"enabled":true,"privacyApproved":true,"measurementId":"G-KD1ES061DH"}</script>',{url:'https://giolinafilms.com/weddings/'+slug+'/?private=test',runScripts:'outside-only'}).window;
  w.eval(readFileSync('public/analytics-consent.js','utf8'));w.eval(readFileSync('public/production-analytics.js','utf8'));
  assert.equal(w.document.querySelector('script[src]'),null);assert.equal(w.dataLayer,undefined);
  w.document.querySelector('[data-analytics-accept]').click();w.eval(readFileSync('public/production-analytics.js','utf8'));
  assert.equal(w.dataLayer.filter(x=>x[1]==='page_view').length,1);assert(!JSON.stringify(w.dataLayer).includes('private=test'));w.close();
 }
});
