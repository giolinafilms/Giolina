// Explicitly updates the two reviewed draft pages. Never creates a new route.
import {readFileSync,writeFileSync} from 'node:fs';
import {renderVenueStory} from '../src/content/venue-story.mjs';
const allowed=new Set(['weddings--the-venetian-garfield.json','weddings--the-park-savoy-florham-park.json']);
const stories=JSON.parse(readFileSync('src/content/venue-stories.json','utf8'));
for (const story of stories) {
 if (!allowed.has(story.pageFile)) throw new Error('New venue routes require separate review');
 const path='src/content/pages/'+story.pageFile;
 const page=JSON.parse(readFileSync(path,'utf8'));
 page.content=renderVenueStory(story);
 writeFileSync(path,JSON.stringify(page,null,2)+'\n');
}
