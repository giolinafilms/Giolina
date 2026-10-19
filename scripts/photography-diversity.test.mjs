import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {JSDOM} from 'jsdom';
const baseline='523c988d8b9b142755cfd3369c7dc715854590e9';
const path=n=>`src/content/pages/${n}.json`;
const document=text=>new JSDOM(JSON.parse(text).content).window.document;
const current=n=>document(readFileSync(path(n),'utf8'));
const previous=n=>document(execFileSync('git',['show',`${baseline}:${path(n)}`],{encoding:'utf8'}));
test('requested placements change while the photography opening and montage stay intact',()=>{
 for(const [name,selectors] of [['index',['.gl-home-intro-photograph img']],['portfolio',['.gl-photo-spread img']]]){
  for(const selector of selectors)assert.notEqual(current(name).querySelector(selector).src,previous(name).querySelector(selector).src);
 }
 for(const selector of ['.gl-photo-intro','.gl-photo-gallery'])assert.equal(current('portfolio').querySelector(selector).outerHTML,previous('portfolio').querySelector(selector).outerHTML);
 const img=current('portfolio').querySelector('.gl-photo-spread img');assert.equal(img.parentElement.getAttribute('href'),img.getAttribute('src'));
});
test('editorial updates preserve production films, links, quotations and forms',()=>{
 const production='c852da0ec272e954803e29c9cd408174174c656b';
 for(const name of ['index','about-us','experience-2','portfolio-2','sweet-sixteen','ready-to-go-productions','contact-us-2']){
  const now=current(name),before=document(execFileSync('git',['show',`${production}:${path(name)}`],{encoding:'utf8'}));
  for(const selector of ['iframe','[data-vimeo-id]','[data-mediazilla-src]','video','source','blockquote','form']){
   assert.deepEqual([...now.querySelectorAll(selector)].map(e=>e.outerHTML),[...before.querySelectorAll(selector)].map(e=>e.outerHTML),`${name}: ${selector}`);
  }
  const links=doc=>[...doc.querySelectorAll('a[href]:not([data-sweet-photo])')].map(e=>e.getAttribute('href'));
  assert.deepEqual(links(now),links(before),`${name}: links`);
 }
 assert.equal(readFileSync(path('client-reviews'),'utf8'),execFileSync('git',['show',`${production}:${path('client-reviews')}`],{encoding:'utf8'}));
});
test('new display catalogue is sanitized and every asset resolves',()=>{
 const photos=JSON.parse(readFileSync('src/content/marketing-display-additions.json'));
 assert.equal(photos.length,7);
 for(const p of photos){assert.deepEqual(Object.keys(p).sort(),['alt','height','id','src','width']);assert.match(p.src,/^\/portfolio-media\/recent-[a-f0-9]+-large\.webp$/);assert.ok(existsSync(`public${p.src}`));assert.ok(p.width>0&&p.height>0);}
 assert.equal(current('index').querySelectorAll('img[src*="recent-17cc59b0b34f4ec0"],img[data-src*="recent-17cc59b0b34f4ec0"]').length,0);
});
