import {readFileSync,writeFileSync} from 'node:fs';
const root='src/content/pages/';
const read=name=>JSON.parse(readFileSync(root+name+'.json','utf8'));
const save=(name,page)=>writeFileSync(root+name+'.json',JSON.stringify(page,null,2)+'\n');
const filmButton=(id,title)=>`<button type="button" data-vimeo-id="${id}" data-film-title="${title}"><span>Play film</span></button>`;
const filmPreview=(id,title)=>`<div class="gl-film-preview"><iframe src="https://player.vimeo.com/video/${id}?muted=1&amp;title=0&amp;byline=0&amp;portrait=0&amp;dnt=1" title="${title} preview" loading="lazy" tabindex="-1" aria-hidden="true"></iframe>${filmButton(id,title)}</div>`;
// Preserve the approved homepage and opening film; add photographs and playable stories.
for(const name of ['index','homepage-preview']){
 const page=read(name);
 if(!page.content.includes('gl-ballroom')){
  const marker='<div class="gl-detail-pair">';
  page.content=page.content.replace(marker,'<figure class="gl-ballroom"><img src="/assets/cb99e1db42a51c75.jpg" width="2560" height="1707" loading="lazy" alt="A bride and groom sharing a dip and kiss beneath a domed ballroom ceiling"><figcaption>A day to remember</figcaption></figure>\n'+marker);
  const stories=`<section class="gl-home-stories" aria-labelledby="gl-stories-title"><h2 id="gl-stories-title">In motion. In a moment.</h2><div class="gl-story-grid"><article>${filmPreview('548643452','GioLina wedding film')}<h3>Cinematography</h3><p>Revisit the voices, the movement, and the feeling of your day.</p><a class="gl-text-link" href="/portfolio-2/">View the films</a></article><article><figure><img src="/assets/7353475231731939.jpg" width="2560" height="1707" loading="lazy" alt="A wedding couple together beside the waterfront"></figure><h3>Photography</h3><p>The quiet glances and beautiful moments, held in a photograph.</p><a class="gl-text-link" href="/portfolio/">Explore the photographs</a></article></div></section>`;
  page.content=page.content.replace('<section class="gl-section gl-review">',stories+'\n<section class="gl-section gl-review">');
  page.content=page.content.replace('<figure><img src="/assets/690ef6c3e99444cd.png"','<figure class="gl-film-poster"><img src="/assets/690ef6c3e99444cd.png"');
  page.content=page.content.replace('alt="Bianca and Bobby on their wedding day"></figure>','alt="Bianca and Bobby on their wedding day">'+filmButton('328842441','Bianca &amp; Bobby')+'</figure>');
 }
 page.content=page.content.replace('data-vimeo-id="548643452" data-film-title="Bianca &amp; Bobby"','data-vimeo-id="328842441" data-film-title="Bianca &amp; Bobby"');
 save(name,page);
}
// Keep the original montage and all 12 video IDs; replace outgoing start link.
for(const name of ['portfolio-2','video-portfolio']){
 const page=read(name);
 page.content=page.content.replace(/<div class="elementor-wrapper elementor-open-inline">\s*(<iframe[^>]+src="https:\/\/player\.vimeo\.com\/video\/(\d+)[^>]*><\/iframe>)\s*<\/div>/g,(_,frame,id)=>`<div class="elementor-wrapper elementor-open-inline gl-film-preview">${frame.replace('allow="clipboard-write"','allow="autoplay; fullscreen; picture-in-picture" loading="lazy" tabindex="-1" aria-hidden="true"')}${filmButton(id,'GioLina wedding film')}</div>`);
 page.content=page.content.replace(/href="https:\/\/vimeo.com\/548643452"/g,'href="#watch-films" data-vimeo-id="548643452" data-film-title="GioLina wedding film"');
 save(name,page);
}
// Reuse the complete existing photo gallery, excluding identifiable Jen/Mike portraits.
const source=read('portfolio').content;
const links=[...source.matchAll(/<a[^>]+class="e-gallery-item[^>]+>[\s\S]*?<\/a>/g)].map(m=>({
 href:m[0].match(/href="([^"]+)/)?.[1],title:m[0].match(/data-elementor-lightbox-title="([^"]+)/)?.[1]||''
})).filter(p=>p.href);
const excluded=new Set(['/assets/d0d37b0888caf8df.jpg','/assets/acc2c78575cd512d.jpg']);
const photos=links.filter(p=>!excluded.has(p.href));
const gallery=photos.map((p,i)=>`<a class="e-gallery-item" href="${p.href}" data-elementor-lightbox-title="Wedding photograph ${i+1}" aria-label="Open wedding photograph ${i+1}"><img src="${p.href}" loading="lazy" alt="${p.href==='/assets/2ca0b2f49902936d.jpg'?'Wedding rings':p.href==='/assets/5b571a210b952d2d.jpg'?'Wedding cake beneath fireworks':'A moment from the GioLina wedding photography collection'}"></a>`).join('\n');
const content=`<div class="gl-photo-page"><section class="gl-photo-intro"><div><p class="gl-photo-eyebrow">GioLina photography</p><h1>Beautiful moments.<br>Honestly captured.</h1><p>Our style is emotive, filled with bright and natural imagery, and focused on the real essence of each event.</p><a class="gl-photo-link" href="#photographs">View the photographs</a></div><figure><img src="/assets/299da5e07f2f4921.jpg" width="1707" height="2560" alt="A bride and groom sharing a close embrace" fetchpriority="high"></figure></section><figure class="gl-photo-spread"><img src="/assets/cb99e1db42a51c75.jpg" width="2560" height="1707" alt="A wedding couple beneath a sweeping ballroom dome" loading="lazy"><figcaption>The big feelings. The little details.</figcaption></figure><section id="photographs" class="gl-photo-gallery" aria-label="Wedding photography portfolio">${gallery}</section><section class="gl-photo-close"><h2>Let us tell your love story.</h2><a href="/contact-us-2/">Inquire about photography</a></section></div>`;
for(const name of ['portfolio','photography','photography-portfolio']){
 const page=read(name);page.content=content;save(name,page);
}
