import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const page = JSON.parse(fs.readFileSync(new URL('../docs/venue-drafts/jacques-reception-center-middletown.json', import.meta.url)));
const doc = new JSDOM(page.content).window.document;

test('Jacques inactive draft contains ten accessible photographs and no film', () => {
  assert.equal(page.path, '/weddings/jacques-reception-center-middletown/');
  assert.equal(doc.querySelectorAll('h1').length, 1);
  const links = [...doc.querySelectorAll('[data-photo-viewer-link]')];
  assert.equal(links.length, 10);
  assert.equal(new Set(links.map(a => a.href)).size, 10);
  for (const a of links) {
    assert(a.getAttribute('aria-label'));
    assert(a.querySelector('img').alt);
    assert(a.querySelector('img').getAttribute('width'));
    assert(a.querySelector('img').getAttribute('height'));
  }
  assert.equal(doc.querySelectorAll('iframe, video, [data-film-title]').length, 0);
  assert(!/mediazilla|vimeo/i.test(page.content));
});

test('Jacques inactive draft retains venue-specific metadata', () => {
  assert.match(page.title, /Jacques Reception Center Wedding Photography/);
  const seo = new JSDOM(page.seo.join('\n')).window.document;
  assert.match(seo.querySelector('meta[name="description"]').content, /Elaina and James/);
  assert.equal(seo.querySelector('meta[property="og:url"]').content, 'https://giolinafilms.com' + page.path);
});
