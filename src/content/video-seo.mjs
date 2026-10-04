import {canonicalOrigin} from '../config/site.mjs';

const videoPages = new Set(['/portfolio-2/', '/sweet-sixteen/', '/ready-to-go-productions/', '/events/private-celebrations/', '/events/corporate/', '/events/live-events/', '/events/specialty/', '/events/photo-film/']);
const decode = value => value.replace(/&(?:amp|quot|apos|lt|gt|#39);/g, entity => ({'&amp;':'&','&quot;':'"','&apos;':"'",'&#39;':"'",'&lt;':'<','&gt;':'>'}[entity]));
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(match => [match[1], decode(match[2])]));
const absolute = value => new URL(value, canonicalOrigin).href;

// Build-time metadata only: no provider requests, player creation or media fetching.
// Derive from the same cards and short-film data used by the visible page.
export function videoCatalog(page) {
 if (!videoPages.has(page.path)) return [];
 const films = [];
 const description = title => page.path.startsWith('/events/')
  ? `${title} — a selected event film in the GioLina Events collection.`
  : page.path === '/sweet-sixteen/'
  ? `${title} — a Sweet Sixteen film from GioLina’s photography and cinematography collection.`
  : page.path === '/ready-to-go-productions/'
   ? `${title} — a selected film in the Ready To Go Productions portfolio.`
   : `${title} — a wedding film in the GioLina cinematography collection.`;
 for (const match of page.content.matchAll(/<div class="[^"]*\bgl-film-preview\b[^"]*"[^>]*>([\s\S]*?)<\/div>/g)) {
  const posterTag = match[1].match(/<img\b[^>]*>/)?.[0];
  const triggerTag = match[1].match(/<button\b[^>]*data-film-title[^>]*>/)?.[0];
  if (!posterTag || !triggerTag) continue;
  const poster = attributes(posterTag), trigger = attributes(triggerTag);
  const title = trigger['data-film-title'];
  // These two preserved RTG cards have unavailable public names/real posters.
  if (/Ready To Go Productions — film \d+/.test(title)) continue;
  const embedUrl = trigger['data-vimeo-id'] ? `https://player.vimeo.com/video/${trigger['data-vimeo-id']}` : trigger['data-mediazilla-src'];
  if (embedUrl && poster.src) films.push({name:title, description:description(title), thumbnailUrl:absolute(poster.src), embedUrl});
 }
 const shortData = page.content.match(/<script\b[^>]*id="gl-short-data"[^>]*>([\s\S]*?)<\/script>/)?.[1];
 if (shortData) {
  for (const film of JSON.parse(shortData)) {
   const recap = /recap/i.test(film.src ?? '');
   films.push({name:film.title,
    description:recap ? `${film.title} — an anniversary edit in GioLina’s Love in a Minute collection.` : `${film.title} — a short wedding film in GioLina’s Love in a Minute collection.`,
    thumbnailUrl:absolute(film.poster),
    ...(film.vimeo ? {embedUrl:`https://player.vimeo.com/video/${film.vimeo}`} : {contentUrl:absolute(film.src), encodingFormat:'video/mp4'})});
  }
 }
 const seen = new Set();
 return films.filter(film => {
  const source = film.contentUrl ?? film.embedUrl;
  if (seen.has(source)) return false;
  seen.add(source); return true;
 });
}

export function videoCatalogSchema(page) {
 const films = videoCatalog(page);
 if (!films.length) return [];
 const url = absolute(page.path);
 // MediaObject describes verified media without claiming VideoObject rich-result
 // eligibility. First-publication dates are unknown; never infer them from commits.
 return [{'@context':'https://schema.org', '@type':'ItemList', '@id':url+'#film-catalog',
  name:page.path.startsWith('/events/') ? 'GioLina Events — selected films' : page.path === '/ready-to-go-productions/' ? 'Ready To Go Productions films' : page.path === '/sweet-sixteen/' ? 'Sweet Sixteen films' : 'GioLina wedding films and Love in a Minute',
  numberOfItems:films.length, itemListElement:films.map((film,index) => ({'@type':'ListItem', position:index+1,
   item:{'@type':'MediaObject', '@id':url+'#film-'+encodeURIComponent(film.contentUrl ?? film.embedUrl),
    ...film, isPartOf:{'@id':url}}}))}];
}

export const escapeXml = value => value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[char]));

export function videoSitemap(pages) {
 return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n'+pages.map(page => {
  const films = videoCatalog(page);
  if (!films.length) return '';
  return `<url><loc>${escapeXml(absolute(page.path))}</loc>`+films.map(film =>
   `<video:video><video:thumbnail_loc>${escapeXml(film.thumbnailUrl)}</video:thumbnail_loc><video:title>${escapeXml(film.name)}</video:title><video:description>${escapeXml(film.description)}</video:description>`+
   (film.contentUrl ? `<video:content_loc>${escapeXml(film.contentUrl)}</video:content_loc>` : `<video:player_loc>${escapeXml(film.embedUrl)}</video:player_loc>`)+
   '</video:video>').join('')+'</url>\n';
 }).join('')+'</urlset>\n';
}
