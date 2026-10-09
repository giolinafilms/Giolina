import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {JSDOM} from 'jsdom';

test('withdrawn portfolio photographs are absent from generated delivery and page placements',async()=>{
 const policy=JSON.parse(await readFile('src/content/portfolio-withdrawals.json','utf8'));
 const blocked=new Set(policy.photoIdHashes);
 const hash=id=>createHash('sha256').update(id).digest('hex');
 const categories=JSON.parse(await readFile('src/generated/wedding-collection.json','utf8'));
 assert.equal(categories.length,9);assert.equal(categories.flatMap(c=>c.photos).length,713);
 assert.equal(blocked.size,42,'32 supported couple exclusions plus 10 explicit/watermarked images');
 assert.deepEqual(categories.map(c=>c.photos.length),[180,137,53,50,55,55,123,37,23]);
 assert.equal(categories.find(c=>c.slug==='details').photos.some(p=>p.id==='gq8WXBh'),false);
 assert.equal(categories.find(c=>c.slug==='bridal-party-family').photos.filter(p=>p.id==='gq8WXBh').length,1);
 // Four pre-existing cross-category presentations remain deliberately intact.
 assert.equal(new Set(categories.flatMap(c=>c.photos.map(p=>p.id))).size,709);
 for(const c of categories){assert.ok(c.photos.length);for(const p of c.photos)assert.equal(blocked.has(hash(p.id)),false);}
 for(const file of await readdir('src/content/pages')){
  const page=await readFile('src/content/pages/'+file,'utf8');
  for(const path of policy.assetPaths)assert.equal(page.includes(path),false,`${file}: withdrawn asset`);
 }
 for(const path of policy.assetPaths)await assert.rejects(access('public'+path));
 for(const file of await readdir('public',{recursive:true})){
  if(!/\.(css|js|json|html|txt)$/.test(file))continue;
  const text=await readFile('public/'+file,'utf8');
  for(const path of policy.assetPaths)assert.equal(text.includes(path),false,`${file}: withdrawn reference`);
 }
 const redirects=await readFile('src/config/redirects.mjs','utf8');
 for(const path of policy.assetPaths)assert.equal(redirects.includes(path),false);
 const page=JSON.parse(await readFile('src/content/pages/portfolio.json','utf8'));
 const dom=new JSDOM(page.content);assert.equal(dom.window.document.querySelectorAll('[data-photo-viewer-link]').length,42);dom.window.close();
});
