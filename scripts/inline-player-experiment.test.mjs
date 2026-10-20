import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const page=JSON.parse(readFileSync('src/content/pages/qa--video-player-comparison.json'));
const code=readFileSync('public/inline-player-experiment.js','utf8');
const base='https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev';
test('inline experiment does not create provider requests before choice; unloads and isolates players',()=>{
 const w=new JSDOM(page.content,{url:base+page.path,runScripts:'outside-only'}).window;w.eval(code);
 assert.equal(w.document.querySelectorAll('iframe').length,0);assert.equal(w.dataLayer,undefined);
 const groups=w.document.querySelectorAll('[data-inline-provider]');
 groups[0].querySelector('[data-inline-load]').click();let frame=w.document.querySelector('iframe');assert.equal(frame.src,'https://player.vimeo.com/video/799295947?dnt=1&autoplay=0');assert(frame.title);assert(!frame.allow.includes('autoplay'));
 groups[1].querySelector('[data-inline-load]').click();assert.equal(w.document.querySelectorAll('iframe').length,1);assert.equal(w.document.querySelector('iframe').src,'https://mediazilla.com/gjx8Km0Irn');
 groups[1].querySelector('[data-inline-remove]').click();assert.equal(w.document.querySelectorAll('iframe').length,0);assert.equal(w.document.querySelectorAll('.inline-screen img').length,2);assert.equal(w.localStorage.length,0);w.close();
});
test('experiment fails closed on production and other routes',()=>{
 for(const url of ['https://giolinafilms.com'+page.path,base+'/cinematography/']){
 const w=new JSDOM(page.content,{url,runScripts:'outside-only'}).window;w.eval(code);w.document.querySelector('[data-inline-load]').click();assert.equal(w.document.querySelectorAll('iframe').length,0);w.close();}
});
test('experiment is noindex, absent from sitemaps and contains no analytics activation',()=>{
 const html=readFileSync('dist'+page.path+'index.html','utf8');const d=new JSDOM(html).window.document;
 assert.equal(d.querySelector('meta[name=robots]').content,'noindex, nofollow');assert(!d.querySelector('iframe'));assert(!d.querySelector('script[src*="production-analytics"]'));
 for(const f of ['dist/sitemap.xml','dist/video-sitemap.xml'])assert(!readFileSync(f,'utf8').includes(page.path));
});
