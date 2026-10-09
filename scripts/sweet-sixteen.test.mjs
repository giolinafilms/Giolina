import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const page=JSON.parse(readFileSync('src/content/pages/sweet-sixteen.json','utf8'));
test('Sweet Sixteen has a real photo collection without hidden wedding placeholders',()=>{
 const doc=new JSDOM(page.content).window.document;
 assert.equal(doc.querySelectorAll('[data-placeholder-source]').length,0);
 const photos=[...doc.querySelectorAll('#sweet-photography [data-sweet-photo]')];
 assert(photos.length>=8,'At least eight authentic photographs');
 assert.equal(new Set(photos.map(a=>a.href)).size,photos.length);
 for(const a of photos){assert(a.href.startsWith('/sweet-media/'));const i=a.querySelector('img');assert.equal(i.getAttribute('loading'),'lazy');assert(+i.width>0&&+i.height>0);assert(existsSync('public'+i.getAttribute('src')));}
 assert(!readFileSync('public/sweet-sixteen-refinement.css','utf8').includes('Emergency: suspend'));
});
test('Sweet Sixteen preserves its five films and supplied presentation destinations',()=>{
 const doc=new JSDOM(page.content).window.document;
 assert.deepEqual([...doc.querySelectorAll('[data-film-title]')].map(x=>[x.dataset.filmTitle,x.dataset.vimeoId||x.dataset.mediazillaSrc]),[['Gianna','793523768'],['Gabby','723528961'],['Gina Marie','https://mediazilla.com/ttnbvY81xe'],['Julia','https://mediazilla.com/8baRrhNAed'],['Julianna','385087191']]);
 for(const u of ['https://mediazilla.com/62aYiGyhwV','https://clients.giolinafilms.com/GabriellasUn-Sweet16'])assert(doc.querySelector(`a[href="${u}"]`));
});
test('Sweet Sixteen viewer opens, navigates, reports image failure and restores focus',()=>{
 assert(existsSync('public/sweet-sixteen-viewer.js'),'Dedicated page viewer exists');
 const dom=new JSDOM(page.content,{url:'https://preview.test/sweet-sixteen/',runScripts:'outside-only'});
 const w=dom.window;
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
 w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
 w.eval(readFileSync('public/sweet-sixteen-viewer.js','utf8'));
 const links=[...w.document.querySelectorAll('[data-sweet-photo]')];links[0].click();
 const dialog=w.document.querySelector('dialog[aria-label="Sweet Sixteen photography viewer"]');assert(dialog.open);
 const img=dialog.querySelector('img');assert.equal(img.src,links[0].href);
 dialog.querySelector('[data-next]').click();assert.equal(img.src,links[1].href);
 dialog.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowLeft'}));assert.equal(img.src,links[0].href);
 img.dispatchEvent(new w.Event('error'));assert.equal(dialog.querySelector('[role=status]').hidden,false);
 img.dispatchEvent(new w.Event('load'));assert.equal(dialog.querySelector('[role=status]').hidden,true);
 dialog.querySelector('[data-close]').click();assert(!dialog.open);assert(!img.hasAttribute('src'));assert.equal(w.document.activeElement,links[0]);
 dom.window.close();
});
test('Sweet Sixteen catalogue exposes only display fields and staged opaque WebPs',()=>{
 const photos=JSON.parse(readFileSync('src/content/sweet-sixteen-photos.json','utf8'));
 const allowed=new Set(['id','order','category','alt','src','large','width','height','largeWidth','largeHeight']);
 assert.equal(new Set(photos.map(p=>p.id)).size,photos.length);
 for(const [index,p]of photos.entries()){
  assert(Object.keys(p).every(k=>allowed.has(k)));assert.match(p.id,/^s16-[a-f0-9]{16}$/);assert.equal(p.order,index);assert.equal(p.category,'sweet-sixteen');
  assert.equal(p.src,`/sweet-media/${p.id}-small.webp`);assert.equal(p.large,`/sweet-media/${p.id}-large.webp`);
  for(const url of [p.src,p.large]){const bytes=readFileSync('public'+url);assert(bytes.length>32,'Nonempty image '+url);assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.equal(bytes.readUInt32LE(4)+8,bytes.length,'Complete WebP '+url);}assert(Math.max(p.width,p.height)<=640);assert(Math.max(p.largeWidth,p.largeHeight)<=1600);
  assert(page.content.includes(p.src)&&page.content.includes(p.large));
 }
});
