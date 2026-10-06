import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import worker from '../worker.js';
import {mainPagePaths} from '../src/config/site.mjs';
import {videoCatalog} from '../src/content/video-seo.mjs';
test('approved Home navigation returns while Events stays deferred and out of sitemaps',()=>{
 const header=readFileSync('src/components/SiteHeader.astro','utf8');assert(header.includes("label: 'Home', href: '/'") );assert(header.indexOf("label: 'Cinematography'")<header.indexOf("label: 'Photography'"));assert(!header.includes("label: 'Events'"));assert(!mainPagePaths.some(p=>p.startsWith('/events/')));assert(!readFileSync('public/sitemap.xml','utf8').includes('/events/'));assert.deepEqual(videoCatalog({path:'/events/corporate/',content:''}),[]);
});
test('retired proposal screenshot URLs never expose static evidence',async()=>{
 for(const path of ['/qa/proposal-mobile-2026-10-05/','/qa/proposal-mobile-2026-10-05/phone-hero.jpg'])for(const method of ['GET','HEAD']){const res=await worker.fetch(new Request('https://preview.test'+path,{method}),{ASSETS:{fetch(){throw Error('Private evidence requested from assets');}}});assert.equal(res.status,404);assert.equal(res.headers.get('Cache-Control'),'no-store');}assert(!existsSync('public/qa/proposal-mobile-2026-10-05/phone-hero.jpg'));assert(!existsSync('docs/evidence/phase2/phone-hero-crop.jpg'));
});
