// Preserve approved source records; publish their clean canonical routes.
export const publicPathMoves = Object.freeze({
  "/portfolio-2/": "/cinematography/",
  "/portfolio/": "/photography/",
  "/client-reviews/": "/reviews/",
  "/experience-2/": "/experience/",
  "/contact-us-2/": "/contact/"
});
export function cleanPublicValue(value) {
 if (typeof value === 'string') {
  for (const [oldPath,newPath] of Object.entries(publicPathMoves)) value=value.replaceAll(oldPath,newPath);
  return value;
 }
 if (Array.isArray(value)) return value.map(cleanPublicValue);
 if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,cleanPublicValue(item)]));
 return value;
}
export function publishedPages(pages) {
 // Historical aliases can contain older copies. The approved source wins.
 const destinations=new Set(Object.values(publicPathMoves));
 return pages.filter(page=>!destinations.has(page.path)).map(cleanPublicValue);
}
