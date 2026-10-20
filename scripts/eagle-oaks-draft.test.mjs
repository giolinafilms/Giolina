import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const page = JSON.parse(fs.readFileSync(new URL('../docs/venue-drafts/eagle-oaks-farmingdale.json', import.meta.url)));
const manifest = JSON.parse(fs.readFileSync(new URL('../docs/venue-drafts/eagle-oaks-media-integrity.json', import.meta.url)));
const doc = new JSDOM(page.content).window.document;

test('Eagle Oaks draft contains ten mapped accessible photographs and no film', () => {
  const links = [...doc.querySelectorAll('[data-photo-viewer-link]')];
  assert.equal(links.length, 10);
  assert.equal(new Set(links.map(a => a.href)).size, 10);
  assert.equal(new Set(links.map(a => a.querySelector('img').alt)).size, 10);
  for (const a of links) {
    assert(a.getAttribute('aria-label'));
    assert(a.querySelector('img').alt);
    assert(a.querySelector('img').getAttribute('width'));
    assert(a.querySelector('img').getAttribute('height'));
    assert(manifest.files.some(f => f.path === 'public' + a.getAttribute('href')));
  }
  assert.equal(doc.querySelectorAll('iframe, video, [data-film-title]').length, 0);
  assert(!/mediazilla|vimeo/i.test(page.content));
});

test('Eagle Oaks draft retains client attribution and venue-specific metadata', () => {
  assert.equal(page.path, '/weddings/eagle-oaks-farmingdale/');
  assert.equal(doc.querySelectorAll('h1').length, 1);
  assert.match(doc.querySelector('h1').textContent, /MaryKate & Mark/);
  assert.match(page.title, /Eagle Oaks Golf & Country Club Wedding Photography/);
  const seo = new JSDOM(page.seo.join('\n')).window.document;
  assert.match(seo.querySelector('meta[name="description"]').content, /MaryKate and Mark/);
  assert.equal(seo.querySelector('meta[property="og:url"]').content, 'https://giolinafilms.com' + page.path);
});
