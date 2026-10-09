import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import worker from '../worker.js';

test('retired portfolio alias retains its redirect without shipping a duplicate client gallery', async()=>{
 const page=JSON.parse(await readFile('src/content/pages/photography-portfolio.json','utf8'));
 assert.ok(!JSON.stringify(page).includes('clients.giolinafilms.com'),'Retired alias must not contain client-gallery links');
 assert.ok(!page.content.includes('data-photo-viewer-link'),'Retired alias must not duplicate photo placements');
 const response=await worker.fetch(new Request('https://preview.test/photography-portfolio/?photo=retained'),{ASSETS:{fetch(){throw Error('Alias must redirect before serving assets');}}});
 assert.equal(response.status,301);
 assert.equal(response.headers.get('location'),'https://preview.test/portfolio/?photo=retained');
});
