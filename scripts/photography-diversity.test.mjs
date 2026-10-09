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
 for(const [name,selectors] of [['index',['.gl-home-intro-photograph img','.gl-experience img']],['portfolio',['.gl-photo-spread img']]]){
  for(const selector of selectors)assert.notEqual(current(name).querySelector(selector).src,previous(name).querySelector(selector).src);
 }
 for(const selector of ['.gl-photo-intro','.gl-photo-gallery'])assert.equal(current('portfolio').querySelector(selector).outerHTML,previous('portfolio').querySelector(selector).outerHTML);
 const img=current('portfolio').querySelector('.gl-photo-spread img');assert.equal(img.parentElement.getAttribute('href'),img.getAttribute('src'));
});
test('accepted pages and film identities remain byte for byte unchanged',()=>{
 for(const name of ['experience-2','about-us','sweet-sixteen','portfolio-2'])assert.equal(readFileSync(path(name),'utf8'),execFileSync('git',['show',`${baseline}:${path(name)}`],{encoding:'utf8'}));
 const a=current('contact-us-2'),b=previous('contact-us-2');assert.equal(a.querySelector('form').outerHTML,b.querySelector('form').outerHTML);
});
test('new display catalogue is sanitized and every asset resolves',()=>{
 const photos=JSON.parse(readFileSync('src/content/marketing-display-additions.json'));
 assert.equal(photos.length,7);
 for(const p of photos){assert.deepEqual(Object.keys(p).sort(),['alt','height','id','src','width']);assert.match(p.src,/^\/portfolio-media\/recent-[a-f0-9]+-large\.webp$/);assert.ok(existsSync(`public${p.src}`));assert.ok(p.width>0&&p.height>0);}
 assert.equal(current('index').querySelectorAll('img[src*="recent-17cc59b0b34f4ec0"],img[data-src*="recent-17cc59b0b34f4ec0"]').length,0);
});
