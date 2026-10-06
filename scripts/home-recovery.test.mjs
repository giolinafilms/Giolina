import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const home=JSON.parse(readFileSync('src/content/pages/index.json')).content;
test('full homepage retains recovered sections and current deferred hero',()=>{
 for(const text of ['From our clients','Bianca &amp; Bobby','Enjoy your day.','We are GioLina Films.','something beautiful.','data-hero-src=','data-selected-portfolio-images']) assert.ok(home.includes(text),text);
 assert.equal((home.match(/<h1\b/g)||[]).length,1);
 assert.ok(!home.includes('href="/events/"'));
 assert.ok(!home.includes('<iframe src='),'restored review does not load an idle player');
 assert.ok(home.indexOf('<h3>Cinematography')<home.indexOf('<h3>Photography'));
});
