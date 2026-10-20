import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {productionPolicy} from '../src/config/production-policy.mjs';
const path='/weddings/the-park-savoy-florham-park/';
test('approved Park Savoy release excludes unapproved Venetian and preserves media and discovery',()=>{
 const html=readFileSync('dist'+path+'index.html','utf8'),d=new JSDOM(html).window.document;
 assert.equal(d.querySelectorAll('h1').length,1);
 assert.equal(d.querySelector('link[rel="canonical"]').href,'https://giolinafilms.com'+path);
 assert.equal(d.querySelector('[data-vimeo-id]').dataset.vimeoId,'759600674');
 assert.equal(d.querySelectorAll('[data-photo-viewer-link],.gv-watch-link,.gv-film-heading span').length,0);
 assert(d.querySelector('a[href="/contact/"]'));
 assert(!html.includes('/weddings/the-venetian-garfield/'));
 assert(!existsSync('dist/weddings/the-venetian-garfield/index.html'));
 const sitemap=readFileSync('dist/sitemap.xml','utf8');assert(sitemap.includes(path));assert(!sitemap.includes('venetian'));
 assert(readFileSync('dist/photography/wedding-collection/index.html','utf8').includes(path));
 assert.equal(productionPolicy(new URL('https://giolinafilms.com'+path),{GIOLINA_INDEXING_ENABLED:'true'}).index,true);
 assert.equal(productionPolicy(new URL('https://preview.test'+path),{GIOLINA_INDEXING_ENABLED:'true'}).index,false);
 assert.equal(productionPolicy(new URL('https://giolinafilms.com/weddings/the-venetian-garfield/'),{GIOLINA_INDEXING_ENABLED:'true'}).index,false);
 assert(readFileSync('dist/cinematography/index.html','utf8').includes('768293139'));
 for(const img of d.images){assert(img.alt);assert(existsSync('public'+img.getAttribute('src')));}
});
test('Park Savoy embedded player opens approved film and releases iframe on close',()=>{
 const dom=new JSDOM(readFileSync('dist'+path+'index.html','utf8'),{url:'https://preview.test',runScripts:'outside-only'}),w=dom.window;
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
 w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new w.Event('close'));};
 w.eval(readFileSync('public/film-player.js','utf8'));w.document.querySelector('[data-vimeo-id]').click();
 assert(w.document.querySelector('dialog iframe').src.includes('/759600674?'));
 w.document.querySelector('.gl-film-close').click();assert.equal(w.document.querySelector('dialog iframe'),null);w.close();
});
