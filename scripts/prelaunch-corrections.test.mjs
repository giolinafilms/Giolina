import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const page=n=>new JSDOM(JSON.parse(readFileSync(`src/content/pages/${n}.json`)).content).window.document;
test('homepage ends with a compact CTA after the integrated story rotation',()=>{
 const d=page('index');assert.equal(d.querySelectorAll('.gl-experience,.gl-recognition').length,0);
 assert.equal(d.querySelectorAll('.gl-about [data-rotate-images]').length,1);
 assert.equal(d.querySelectorAll('.gl-closing img,.gl-closing br').length,0);
 assert.equal(d.querySelector('.gl-closing a').getAttribute('href'),'/contact-us-2/');
 assert.ok(!d.body.innerHTML.includes('recent-e546cefadf5e4511'));assert.ok(!d.body.innerHTML.includes('recent-178612cba8a80027'));
});
test('reviews use separate authentic logos and the name highlight occurs once',()=>{
 const d=page('client-reviews');assert.equal(d.querySelectorAll('.gl-review-platform-logo').length,2);
 const a=page('about-us');assert.deepEqual([...a.querySelectorAll('.gl-name-accent')].map(e=>e.textContent),['Gio','lina']);
 assert.equal(a.querySelectorAll('.gl-about-family-caption .gl-name-accent').length,0);
});
