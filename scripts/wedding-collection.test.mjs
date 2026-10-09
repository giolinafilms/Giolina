import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const modulePath=new URL('./wedding-feed.mjs',import.meta.url);
test('feed importer exists and validates an image feed',async()=>{
 assert.ok(existsSync(modulePath),'Missing collection feed importer');
 const {parseFeed}=await import(modulePath);
 const p=parseFeed('<rss xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom"><channel><atom:link rel="next" href="https://clients.giolinafilms.com/hack/feed.mg?start=100"/><item><link>https://clients.giolinafilms.com/public/i-Abc123</link><media:content url="https://clients.giolinafilms.com/image.jpg" width="600" height="400" type="image/jpeg"/></item></channel></rss>');
 assert.equal(p.photos[0].id,'Abc123');assert.equal(p.photos[0].width,600);assert.match(p.next,/start=100/);
 assert.throws(()=>parseFeed('<html>Access denied</html>'),/feed/i);
});
test('transport overlap does not remove unique selections and changed selection fails',async()=>{
 assert.ok(existsSync(modulePath),'Missing collection feed importer');
 const {verifySelection,fingerprint}=await import(modulePath);
 const photos=[{id:'a'},{id:'b'},{id:'b'},{id:'c'}];
 assert.deepEqual(verifySelection(photos,3,fingerprint(['a','b','c'])).map(p=>p.id),['a','b','c']);
 assert.throws(()=>verifySelection(photos,4,'wrong'),/selection/i);
});
test('Photography presentation retains all 43 photographs with a collection CTA',()=>{
 const page=JSON.parse(readFileSync('src/content/pages/portfolio.json'));
 const doc=new JSDOM(page.content).window.document;
 assert.equal(doc.querySelectorAll('img').length,43);
 assert.ok(doc.querySelector('a[href="/photography/wedding-collection/"]'),'Missing collection CTA');
});
function viewerFixture(){
 const dom=new JSDOM(`<div data-wc><script type="application/json" data-wc-data>${JSON.stringify([{slug:'brides',name:'Brides',photos:[{id:'a',src:'/a.jpg',large:'/a-large.jpg',width:600,height:900,alt:'Bride portrait'},{id:'b',src:'/b.jpg',large:'/b-large.jpg',width:900,height:600,alt:'Bride preparing'}]}])}</script><nav data-wc-overview><a href="#category=brides">Brides</a></nav><section data-wc-category hidden><a data-wc-return href="#">All categories</a><h2 data-wc-title tabindex="-1"></h2><p data-wc-count></p><div data-wc-grid></div></section><dialog data-wc-viewer><button data-wc-close>Close</button><span data-wc-position></span><img data-wc-image><p data-wc-error hidden>Unable to load photo.</p><button data-wc-prev>Previous</button><button data-wc-next>Next</button></dialog></div>`,{url:'https://preview.example/photography/wedding-collection/',runScripts:'outside-only',pretendToBeVisual:true});
 dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};dom.window.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new dom.window.Event('close'));};dom.window.scrollTo=()=>{};
 return dom;
}
test('category/lightbox, keyboard, swipe, history and failed-image feedback',async()=>{
 const path='public/wedding-collection.js';assert.ok(existsSync(path),'Missing category viewer');
 const dom=viewerFixture(),w=dom.window,d=w.document;w.eval(readFileSync(path,'utf8'));
 const hash=value=>new Promise(resolve=>{w.addEventListener('hashchange',()=>setTimeout(resolve,0),{once:true});w.location.hash=value;});
 await hash('category=brides');assert.equal(d.querySelectorAll('[data-wc-grid] a').length,2);assert.equal(d.querySelector('[data-wc-category]').hidden,false);
 await hash('category=brides&photo=a');assert.equal(d.querySelector('dialog').open,true);assert.match(d.querySelector('[data-wc-image]').src,/a-large.jpg$/);
 d.querySelector('[data-wc-next]').click();assert.match(d.querySelector('[data-wc-image]').src,/b-large.jpg$/);
 d.querySelector('dialog').dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));assert.match(d.querySelector('[data-wc-image]').src,/a-large.jpg$/);
 const img=d.querySelector('[data-wc-image]');for(const [type,x] of [['pointerdown',200],['pointerup',80]]){const e=new w.Event(type);Object.assign(e,{pointerType:'touch',clientX:x,clientY:100,pointerId:1});img.dispatchEvent(e);}
 assert.match(img.src,/b-large.jpg$/);img.dispatchEvent(new w.Event('error'));assert.equal(d.querySelector('[data-wc-error]').hidden,false);
 d.querySelector('[data-wc-close]').click();assert.equal(d.querySelector('dialog').open,false);assert.equal(w.location.hash,'#category=brides');
 await hash('category=unknown');assert.equal(d.querySelector('[data-wc-overview]').hidden,false);assert.equal(d.querySelectorAll('[data-wc-grid] a').length,0);
 dom.window.close();
});
test('fresh checkout prepares generated catalogue before dev',()=>{
 const p=JSON.parse(readFileSync('package.json'));assert.match(p.scripts.predev||'',/build-wedding-collection/);
});
test('closing a locally opened photograph restores useful browser back navigation',async()=>{
 const dom=viewerFixture(),w=dom.window,d=w.document;w.eval(readFileSync('public/wedding-collection.js','utf8'));
 const change=fn=>new Promise(resolve=>{w.addEventListener('hashchange',()=>setTimeout(resolve,0),{once:true});fn();});
 await change(()=>w.location.hash='category=brides');
 await change(()=>d.querySelector('[data-wc-grid] a').click());
 d.querySelector('[data-wc-close]').click();
 await new Promise(r=>setTimeout(r,40));
 await new Promise(resolve=>{w.addEventListener('popstate',()=>setTimeout(resolve,0),{once:true});w.history.back();});
 assert.equal(w.location.hash,'');assert.equal(d.querySelector('[data-wc-overview]').hidden,false);
 dom.window.close();
});
