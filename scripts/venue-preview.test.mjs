import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {productionPolicy} from '../src/config/production-policy.mjs';
const cases=[['the-venetian-garfield','331322129',4],['the-park-savoy-florham-park','759600674',0]];
for(const [slug,id,count] of cases){
 test(`${slug}: complete preview metadata, original media and no indexing or tracking`,()=>{
  const path='/weddings/'+slug+'/';const html=readFileSync('dist'+path+'index.html','utf8');const doc=new JSDOM(html).window.document;
  assert.equal(doc.querySelectorAll('h1').length,1);assert.equal(doc.querySelector('meta[name="robots"]').content,'noindex, nofollow');
  assert.equal(doc.querySelector('link[rel="canonical"]').href,'https://giolinafilms.com'+path);
  assert.equal(doc.querySelector('[data-vimeo-id]').dataset.vimeoId,id);assert.equal(doc.querySelectorAll('[data-photo-viewer-link]').length,count);
  if(count)assert(doc.querySelector('link[href="/photography-refinements.css"]'),'Photo viewer requires its established containment stylesheet');
  assert(doc.querySelector('.gl-site-header'));assert(doc.querySelector('.gl-site-footer'));assert(doc.querySelector('.gv-button[href="/contact/"]'));
  for(const im of doc.querySelectorAll('img')){assert(im.alt);assert(im.width>0&&im.height>0);assert(existsSync('public'+im.getAttribute('src')));}
  for(const s of doc.querySelectorAll('script[type="application/ld+json"]'))JSON.parse(s.textContent);
  assert(!html.includes('/production-analytics.js'));assert(!readFileSync('public/sitemap.xml','utf8').includes(path));assert(!readFileSync('dist/video-sitemap.xml','utf8').includes(path));
  for(const origin of ['https://giolinafilms.com','https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev'])assert.deepEqual(productionPolicy(new URL(origin+path),{GIOLINA_INDEXING_ENABLED:'true',GIOLINA_ANALYTICS_ENABLED:'true'}),{index:false,analytics:false});
 });
 test(`${slug}: existing film player opens correct film and releases iframe on close`,()=>{
  const dom=new JSDOM(readFileSync('dist/weddings/'+slug+'/index.html','utf8'),{url:'https://preview.test/',runScripts:'outside-only'});const w=dom.window;
  w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new w.Event('close'));};
  w.eval(readFileSync('public/film-player.js','utf8'));w.document.querySelector('[data-vimeo-id]').click();assert(w.document.querySelector('dialog[open] iframe').src.includes('/video/'+id+'?'));w.document.querySelector('.gl-film-close').click();assert.equal(w.document.querySelector('dialog iframe'),null);dom.window.close();
 });
}
test('Venetian photo viewer opens real selected photo and supports next/close',()=>{
 const dom=new JSDOM(readFileSync('dist/weddings/the-venetian-garfield/index.html','utf8'),{url:'https://preview.test/',runScripts:'outside-only'});const w=dom.window;
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new w.Event('close'));};
 w.eval(readFileSync('public/photography-viewer.js','utf8'));w.document.querySelector('[data-photo-viewer-link]').click();assert(w.document.querySelector('dialog img').src.includes('venetian-staircase'));w.document.querySelector('[aria-label="Next photo"]').click();assert(w.document.querySelector('dialog img').src.includes('evening-portrait'));w.document.querySelector('[aria-label="Close photo"]').click();assert(!w.document.querySelector('dialog img').hasAttribute('src'));dom.window.close();
});
