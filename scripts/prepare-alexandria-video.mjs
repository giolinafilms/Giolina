import {readFileSync,writeFileSync} from 'node:fs';
const slot='<div class="gl-review-video-slot" role="img" aria-label="Vimeo promo placeholder for Alexandria"><span class="gl-review-video-mark" aria-hidden="true">▷</span><span>Alexandria’s wedding film</span><small>Vimeo promo coming soon</small></div>';
const update=(file,fn)=>{const p=JSON.parse(readFileSync(file,'utf8'));fn(p);writeFileSync(file,JSON.stringify(p,null,2)+'\n');};
for(const name of ['index','homepage-preview'])update(`src/content/pages/${name}.json`,p=>{
 p.content=p.content.replace(/<figure><img[^>]*src="\/assets\/3d91295ab040c4f4.png"[^>]*><\/figure>/,slot);
});
for(const name of ['client-reviews','reviews'])update(`src/content/pages/${name}.json`,p=>{
 p.content=p.content.replace(/<article class="gl-review-card" id="alexandria-2024"([\s\S]*?)<\/article>/,(match,body)=>{
  const heading=body.match(/<div class="gl-review-person">([\s\S]*?)<\/div>/)?.[1];
  const quote=body.match(/<blockquote>[\s\S]*?<\/blockquote>/)?.[0];
  if(!heading||!quote)return match;
  return `<article class="gl-review-card gl-review-with-film" id="alexandria-2024" aria-labelledby="name-alexandria-2024">${slot}<div class="gl-review-copy"><div class="gl-review-person">${heading}</div>${quote}</div></article>`;
 });
});
update('src/content/review-collection.json',p=>{const alex=p.reviews.find(r=>r.id==='alexandria-2024');alex.media={type:'vimeo',videoId:null,status:'awaiting-client-link'};});
