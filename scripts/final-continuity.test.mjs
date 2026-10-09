import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const page=n=>new JSDOM(JSON.parse(readFileSync(`src/content/pages/${n}.json`)).content).window.document;
test('dedicated marketing rotations contain unique approved photographs',()=>{
 const images=[];
 for(const [name,count] of [['index',4],['experience-2',1],['contact-us-2',1],['about-us',1]]){
  const rotations=page(name).querySelectorAll('[data-rotate-images]');assert.equal(rotations.length,count,name);
  for(const rotation of rotations){assert.ok(rotation.dataset.rotationSet);assert.ok(rotation.querySelector('img.is-current'));
   for(const img of rotation.querySelectorAll('img')){const src=img.getAttribute('src')||img.dataset.src;assert.match(src,/^\/portfolio-media\/recent-.*\.webp$/);assert.ok(existsSync(`public${src}`));images.push(src);}
  }
 }
 assert.equal(new Set(images).size,images.length,'no duplicate photographs across rotations');
 assert.equal(page('about-us').querySelectorAll('[data-rotate-images] img').length,4);
 for(const img of page('contact-us-2').querySelectorAll('[data-rotate-images] img'))assert.ok(+img.height>+img.width,'contact uses vertical photographs');
});
test('About preserves authentic assets and states active television leadership',()=>{
 const d=page('about-us');assert.ok(d.body.textContent.includes('Still actively working in television'));
 assert.ok(d.querySelector('img[src="/assets/frank-control-room-approved.png"]'));assert.ok(d.querySelector('[data-family-film]'));
 assert.equal(d.querySelectorAll('.gl-about-name-logo,.gl-about-foundation-logo').length,0);
 assert.equal(d.querySelector('.gl-about-foundation-grid').children.length,2);
});
test('collection covers are explicit without altering category order and visible totals',()=>{
 const component=readFileSync('src/components/WeddingCollection.astro','utf8');
 assert.ok(component.includes('wedding-collection-covers.json'));assert.ok(component.includes('data-wc-top'));
 assert.ok(!component.includes('data-wc-count'));assert.ok(!component.includes('photos.length} photographs'));
});
test('visible page copy excludes dash punctuation without rewriting technical references',()=>{
 assert.doesNotMatch(readFileSync('public/wedding-collection.css','utf8'),/content\s*:\s*['"][^'"]*[—–]/);
 for(const file of readdirSync('src/content/pages').filter(f=>f.endsWith('.json'))){
  const d=page(file.replace('.json',''));d.querySelectorAll('script,style').forEach(el=>el.remove());
  assert.doesNotMatch(d.body.textContent,/[—–]|\w-\w/,file);
 }
 const d=page('contact-us-2');assert.equal(d.querySelector('form').action,'https://formspree.io/f/xbglbbpo');
 assert.ok(d.querySelector('a[href="https://clients.giolina.co/schedule/61f5ca5de95956002dd1c3d7"]'));
});
test('new collection covers resolve to retained photographs and counts remain intact',()=>{
 const categories=JSON.parse(readFileSync('src/generated/wedding-collection.json'));
 const covers=JSON.parse(readFileSync('src/content/wedding-collection-covers.json'));
 assert.equal(categories.length,9);assert.equal(categories.reduce((n,c)=>n+c.photos.length,0),713);
 assert.equal(new Set(categories.flatMap(c=>c.photos.map(p=>p.id))).size,709);
 for(const [slug,id] of Object.entries(covers))assert.ok(categories.find(c=>c.slug===slug).photos.some(p=>p.id===id));
});
