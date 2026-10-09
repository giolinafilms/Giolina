// All portfolio films open in the site, with native keyboard/focus handling.
const filmTriggers = document.querySelectorAll('[data-vimeo-id], [data-native-film]');
if (filmTriggers.length) {
 const dialog = document.createElement('dialog');
 dialog.className = 'gl-film-dialog';
 dialog.setAttribute('aria-labelledby', 'gl-film-title');
 dialog.innerHTML = '<div class="gl-film-toolbar"><h2 id="gl-film-title">Wedding film</h2><button type="button" class="gl-film-close">Close film</button></div><div class="gl-film-screen"></div><p class="gl-film-hint">Use the player’s fullscreen control for a larger view.</p>';
 document.body.append(dialog);
 const screen = dialog.querySelector('.gl-film-screen');
 const close = dialog.querySelector('.gl-film-close');
 function stop() {
  const video = screen.querySelector('video');
  if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
  screen.replaceChildren();
 }
 let opener;
 filmTriggers.forEach(trigger => trigger.addEventListener('click', event => {
  const id = trigger.dataset.vimeoId;
  const nativeSource = trigger.dataset.nativeFilm;
  if (nativeSource ? !/^\/assets\/shorts\/[a-z0-9-]+\.mp4$/.test(nativeSource) : !/^\d+$/.test(id)) return;
  event.preventDefault();
  // Only one portfolio player may remain active, including across providers.
  document.querySelectorAll('.gl-film-dialog[open]').forEach(active => {
   if (active !== dialog) {
    const video = active.querySelector('video');
    if (video) {
     video.pause();
     video.removeAttribute('src');
     video.load(); // Release the old media request and decoded buffers.
    }
    active.querySelector('.gl-film-screen, .gl-short-screen')?.replaceChildren();
    active.close();
   }
  });
  opener = trigger;
  const title = (trigger.dataset.filmTitle || 'GioLina wedding film').replace(/\s*[—–]\s*/g, ', ').replace(/(?<=\w)-(?=\w)/g, ' ');
  dialog.querySelector('h2').textContent = title;
  stop();
  screen.style.aspectRatio = nativeSource ? (trigger.dataset.filmAspect || '16/9') : '16/9';
  if (nativeSource) {
   const video = document.createElement('video');
   video.controls = true; video.playsInline = true; video.preload = 'none';
   video.muted = false; video.defaultMuted = false; video.volume = 1;
   video.poster = trigger.closest('.gl-film-preview')?.querySelector('img')?.src || '';
   video.src = nativeSource;
   screen.append(video);
   dialog.showModal();
   // The explicit tap starts the supplied film with audio; no browsing preload.
   video.play().catch(() => {});
  } else {
   const frame = document.createElement('iframe');
   frame.src = `https://player.vimeo.com/video/${id}?autoplay=1&muted=0&playsinline=1&loop=0&autopause=1&dnt=1&title=0&byline=0&portrait=0#t=0s`;
   frame.title = title; frame.allow = 'autoplay; fullscreen; picture-in-picture';
   frame.allowFullscreen = true;
   screen.replaceChildren(frame);
   dialog.showModal();
  }
  document.body.classList.add('gl-film-open'); close.focus();
 }));
 const stopAndClose = () => { stop(); dialog.close(); };
 close.addEventListener('click', stopAndClose);
 dialog.addEventListener('cancel', stop);
 dialog.addEventListener('click', event => { if(event.target === dialog) stopAndClose(); });
 dialog.addEventListener('close', () => {
  // A queued close event must not unload a newly reopened player.
  if (dialog.open) return;
  stop(); // Stop sound/playback immediately, including Escape close.
  if (!document.querySelector('.gl-film-dialog[open]')) {
   document.body.classList.remove('gl-film-open'); opener?.focus();
  }
 });
}
