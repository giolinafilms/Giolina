import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {renderVenueStory} from '../src/content/venue-story.mjs';
const stories=JSON.parse(readFileSync('src/content/venue-stories.json','utf8'));
test('coverage contract refuses missing or contradictory media',()=>{
 const both=stories[0];
 assert.throws(()=>renderVenueStory({...both,film:null}),/film/i);
 assert.throws(()=>renderVenueStory({...both,photos:[]}),/photo/i);
 assert.throws(()=>renderVenueStory({...both,coverage:'video-only'}),/photo/i);
 assert.throws(()=>renderVenueStory({...both,coverage:'photo-only'}),/film/i);
});
test('an on-hold event cannot render as a new promotional story',()=>{
 assert.throws(()=>renderVenueStory({...stories[0],publicationStatus:'hold'}),/approval/i);
});
test('photo-only template emits actual photographs without film controls or film claims',()=>{
 const s={...stories[0],coverage:'photo-only',film:null};
 const doc=new JSDOM(renderVenueStory(s)).window.document;
 assert.equal(doc.querySelectorAll('[data-photo-viewer-link]').length,4);
 assert.equal(doc.querySelectorAll('[data-vimeo-id],iframe,.gv-film-section').length,0);
 assert(!doc.querySelector('.gv-kicker').textContent.includes('film'));
});
test('only two reviewed stories are generated and each checked-in page matches the template',()=>{
 assert.equal(stories.length,2);
 for(const s of stories){
  const page=JSON.parse(readFileSync('src/content/pages/'+s.pageFile,'utf8'));
  assert.equal(page.content,renderVenueStory(s));
  const doc=new JSDOM(page.content).window.document;
  assert.equal(doc.querySelectorAll('h1').length,1);
  assert.equal(doc.querySelectorAll('[data-vimeo-id]').length,1);
 }
});
