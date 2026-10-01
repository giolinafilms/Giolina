import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
for(const name of ['portfolio-2','video-portfolio']){
 const file=`src/content/pages/${name}.json`;
 const page=JSON.parse(readFileSync(file,'utf8'));
 const ids=[...page.content.matchAll(/data-vimeo-id="(\d+)"/g)].map(m=>m[1]);
 const closing='<section class="gl-film-closing" aria-labelledby="gl-film-closing-heading"><p class="gl-film-closing-eyebrow">Your next chapter</p><h2 id="gl-film-closing-heading">Let us tell your love story.</h2><p>Tell us about your wedding and the moments you want to remember.</p><a href="/contact-us-2/">Inquire about your film</a></section>';
 const quiz=page.content.indexOf('TAKE THE QUIZ');
 if(quiz!==-1){
  const start=page.content.lastIndexOf('<section',quiz);
  const end=page.content.indexOf('</section>',quiz)+10;
  assert(start>=0&&end>start);
  page.content=page.content.slice(0,start)+closing+page.content.slice(end);
 }
 page.content=page.content.replace(/<section[^>]*data-id="c71e3fe"[^>]*>[\s\S]*?<\/section>/,'');
 assert(page.content.includes('gl-film-closing'));
 assert(!/TAKE THE QUIZ|Is that you\?/.test(page.content));
 assert.deepEqual([...page.content.matchAll(/data-vimeo-id="(\d+)"/g)].map(m=>m[1]),ids);
 writeFileSync(file,JSON.stringify(page,null,2)+'\n');
}
