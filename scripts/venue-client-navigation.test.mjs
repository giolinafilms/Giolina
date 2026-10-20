import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {renderVenueStory} from '../src/content/venue-story.mjs';
const stories=JSON.parse(readFileSync('src/content/venue-stories.json'));
const find=key=>stories.find(s=>s.pageFile.includes(key));
test('client cards land on separate named event sections with the correct films and photographs',()=>{
 for(const [key,ids,names,films,counts] of [
  ['vanderbilt',['gabby','gina-marie'],['Gabby','Gina Marie'],['723528961','https://mediazilla.com/ttnbvY81xe'],[1,1]],
  ['giando',['alexandria-james','selena-dashmir'],['Alexandria & James','Selena & Dashmir'],['https://mediazilla.com/fAkBCNBFRB','842690557'],[0,0]]
 ]){
  const dom=new JSDOM(renderVenueStory(find(key)));const d=dom.window.document;
  const cards=[...d.querySelectorAll('.gv-client-card')];assert.equal(cards.length,2);
  cards.forEach((a,i)=>{
   assert.equal(a.getAttribute('href'),'#'+ids[i]);assert.equal(a.textContent.trim(),names[i]);
   assert(a.querySelector('img').alt);const section=d.getElementById(ids[i]);assert(section);
   const film=section.querySelector('[data-vimeo-id],[data-mediazilla-src]');assert.equal(film.dataset.vimeoId??film.dataset.mediazillaSrc,films[i]);
   const photos=[...section.querySelectorAll('[data-photo-viewer-link]')];assert.equal(photos.length,counts[i]);
   for(const p of photos)assert(p.querySelector('img').alt.startsWith(names[i]));
  });
  const allIds=[...d.querySelectorAll('[id]')].map(e=>e.id);assert.equal(new Set(allIds).size,allIds.length);
  assert.equal(d.querySelectorAll('h1').length,1);dom.window.close();
 }
});
test('multi-client renderer refuses unassigned photos instead of mixing events',()=>{
 const s=structuredClone(find('vanderbilt'));delete s.photos[0].eventId;
 assert.throws(()=>renderVenueStory(s),/event/i);
});
test('only the two approved caption experiments display three selected captions',()=>{
 for(const s of stories){const dom=new JSDOM(renderVenueStory(s));const captions=dom.window.document.querySelectorAll('figcaption');
 assert.equal(captions.length,/venetian|liberty-house/.test(s.pageFile)?3:0);dom.window.close();}
});
test('Vanderbilt lightbox stays within the selected event and returns focus on close',()=>{
 const dom=new JSDOM(renderVenueStory(find('vanderbilt')),{url:'https://preview.test',runScripts:'outside-only'});const w=dom.window;
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
 w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new w.Event('close'));};
 w.eval(readFileSync('public/venue-event-viewer.js','utf8'));
 const trigger=w.document.querySelector('#gabby [data-photo-viewer-link]');trigger.click();
 const dialog=w.document.querySelector('dialog');assert(dialog.getAttribute('aria-label').includes('Gabby'));
 w.document.querySelector('[aria-label="Next photo"]').click();assert(dialog.querySelector('img').src.includes('sweet-gabby-photo'));
 w.document.querySelector('[aria-label="Close photo"]').click();assert.equal(w.document.activeElement,trigger);
 w.document.querySelector('#gina-marie [data-photo-viewer-link]').click();assert(dialog.querySelector('img').src.includes('sweet-gina-marie-photo'));dom.window.close();
});
