// Preview-only, per-visit provider choice. No analytics-consent or provider setting changes.
(() => {
 if(location.origin !== 'https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev' || location.pathname !== '/qa/video-player-comparison/') return;
 for(const group of document.querySelectorAll('[data-inline-provider]')){
  const screen=group.querySelector('.inline-screen'),load=group.querySelector('[data-inline-load]'),remove=group.querySelector('[data-inline-remove]'),status=group.querySelector('[data-inline-status]');
  const poster=screen.querySelector('img').cloneNode(true);
  load.addEventListener('click',()=>{
   if(screen.querySelector('iframe'))return;
   const src=screen.dataset.playerSrc;
   if(!['https://player.vimeo.com/video/799295947?dnt=1&autoplay=0','https://mediazilla.com/gjx8Km0Irn'].includes(src))return;
   // Stop other test players so comparisons never play over one another.
   document.querySelectorAll('[data-inline-remove]:not([hidden])').forEach(b=>b.click());
   document.querySelectorAll('.gl-film-dialog[open] .gl-film-close').forEach(b=>b.click());
   const frame=document.createElement('iframe');frame.src=src;frame.title=screen.dataset.playerTitle;frame.allow='fullscreen; picture-in-picture';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';
   screen.replaceChildren(frame);load.hidden=true;remove.hidden=false;status.textContent='Inline player loaded. Use its playback controls.';remove.focus();
  });
  remove.addEventListener('click',()=>{screen.replaceChildren(poster.cloneNode(true));load.hidden=false;remove.hidden=true;status.textContent='Inline player removed. This does not delete provider cookies.';load.focus();});
 }
 document.querySelectorAll('[data-vimeo-id],[data-mediazilla-src]').forEach(b=>b.addEventListener('click',()=>document.querySelectorAll('[data-inline-remove]:not([hidden])').forEach(r=>r.click())));
})();
