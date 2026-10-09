import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
test('staged image integrity rejects empty, corrupted and unapproved bytes',async()=>{
 assert.ok(existsSync('scripts/staged-media.mjs'),'Missing staged image integrity gate');
 const {verifyStagedImage}=await import('./staged-media.mjs');
 const sample=Buffer.alloc(1024);sample.write('RIFF',0);sample.write('WEBP',8);const hash=createHash('sha256').update(sample).digest('hex');
 assert.doesNotThrow(()=>verifyStagedImage(sample,hash));
 assert.throws(()=>verifyStagedImage(Buffer.alloc(0),hash),/image/i);
 assert.throws(()=>verifyStagedImage(Buffer.from(sample).fill(1,20,21),hash),/image/i);
 assert.throws(()=>verifyStagedImage(sample,undefined),/image/i);
});
