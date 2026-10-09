import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('addition catalogue contains only opaque public display data',()=>{
 const rows=JSON.parse(readFileSync('src/content/wedding-collection-additions.json','utf8'));
 const allowed=new Set(['id','category','src','large','width','height','largeWidth','largeHeight','alt','srcHash','largeHash']);
 assert.equal(rows.length,68);
 for(const p of rows){
  assert.ok(Object.keys(p).every(k=>allowed.has(k)));
  assert.match(p.id,/^recent-[a-f0-9]+$/);
  for(const k of ['src','large'])assert.match(p[k],/^\/portfolio-media\/recent-[a-f0-9]+-(small|large)\.webp$/);
  assert.doesNotMatch(p.alt,/Kim|Steven|Stephen|Danny|Stephanie|Nicole|Phil|Bianca|Bobby|https?:|SmugMug/i);
 }
});
