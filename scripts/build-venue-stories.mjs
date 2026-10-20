// Explicitly updates owner-authorized preview stories; never publishes routes to production.
import {readFileSync,writeFileSync} from 'node:fs';
import {renderVenueStory} from '../src/content/venue-story.mjs';
const allowed=new Set(['weddings--the-venetian-garfield.json','weddings--the-park-savoy-florham-park.json','weddings--naninas-in-the-park-belleville.json','weddings--the-rockleigh.json','sweet-sixteen--vanderbilt-at-south-beach.json','sweet-sixteen--island-chateau.json','sweet-sixteen--arianas-south.json']);
const stories=JSON.parse(readFileSync('src/content/venue-stories.json','utf8'));
for (const story of stories) {
 if (!allowed.has(story.pageFile)) throw new Error('New venue routes require separate review');
 const path='src/content/pages/'+story.pageFile;
 const page=JSON.parse(readFileSync(path,'utf8'));
 page.content=renderVenueStory(story);
 writeFileSync(path,JSON.stringify(page,null,2)+'\n');
}
