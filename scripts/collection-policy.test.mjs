import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
test('policy moves retained images, removes only explicit hashes and applies stable exact-set order',async()=>{
 assert.ok(existsSync('scripts/collection-policy.mjs'),'Missing reconciled collection policy');
 const {applyPolicy,photoHash}=await import('./collection-policy.mjs');
 const input=[{slug:'details',photos:[{id:'keep'},{id:'move'},{id:'remove'}],originalCount:3,addedCount:0},{slug:'family',photos:[{id:'other'}],originalCount:1,addedCount:0}];
 const policy={photoIdHashes:[photoHash('remove')],moves:[{photoIdHash:photoHash('move'),from:'details',to:'family'}],order:{details:[photoHash('keep')],family:[photoHash('move'),photoHash('other')]}};
 const out=applyPolicy(input,policy);assert.deepEqual(out.map(c=>c.photos.map(p=>p.id)),[['keep'],['move','other']]);assert.deepEqual(out.map(c=>c.originalCount),[1,2]);assert.deepEqual(applyPolicy(input,policy),out);
 assert.deepEqual(input[0].photos.map(p=>p.id),['keep','move','remove']);
 assert.throws(()=>applyPolicy(input,{...policy,order:{...policy.order,family:[photoHash('other')]}}),/order/i);
 assert.throws(()=>applyPolicy(input,{...policy,moves:[{photoIdHash:photoHash('move'),from:'details',to:'absent'}]}),/category/i);
 const duplicate=[{slug:'details',photos:[{id:'move'}]},{slug:'family',photos:[{id:'move'}]}];
 const merged=applyPolicy(duplicate,{photoIdHashes:[],moves:policy.moves});
 assert.deepEqual(merged.map(c=>c.photos.map(p=>p.id)),[[],['move']]);
});
