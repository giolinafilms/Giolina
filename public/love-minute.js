const browser = document.querySelector('[data-short-browser]');
if (browser) {
 const films = JSON.parse(document.querySelector('#gl-short-data').textContent);
 const stage = browser.querySelector('[data-short-stage]');
 const poster = stage.querySelector('img');
 const count = browser.querySelector('[data-short-count]');
 const picker = browser.querySelector('select');
 const dialog = document.createElement('dialog');
 dialog.className = 'gl-film-dialog gl-short-dialog';
 dialog.setAttribute('aria-labelledby', 'gl-short-modal-title');
 dialog.innerHTML = '<div class="gl-film-toolbar"><h2 id="gl-short-modal-title"></h2><button type="button" class="gl-film-close">Close film</button></div><div class="gl-short-screen"></div><div class="gl-short-modal-nav"><button type="button" data-short-prev>Previous film</button><button type="button" data-short-next>Next film</button></div>';
 document.body.append(dialog);
 const screen = dialog.querySelector('.gl-short-screen');
 let index = 0;
 let playingIndex = 0;
 const openingCount = picker.options.length;
 function stop() {
  const video = screen.querySelector('video');
  if (video) {
   video.pause();
   video.removeAttribute('src');
   video.load(); // Abort loading before detaching the previous film.
  }
  screen.replaceChildren();
 }
 function dismiss() { stop(); dialog.close(); }
 function select(next) {
  index = (next + openingCount) % openingCount;
  const film = films[index];
  poster.src = film.poster; poster.alt = film.title;
  poster.width = film.width; poster.height = film.height;
  stage.style.setProperty('--gl-short-aspect', `${film.width} / ${film.height}`);
  count.textContent = `${index + 1} / ${openingCount}`;
  stage.setAttribute('aria-label', `Play Film, ${film.title}`);
  picker.value = String(index);
  if (dialog.open) play();
 }
 function play(next = index) {
  playingIndex = next;
  // Tear down every previous portfolio player before creating selected media.
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
  stop();
  const film = films[playingIndex];
  dialog.querySelector('h2').textContent = film.title;
  screen.style.aspectRatio = `${film.width} / ${film.height}`;
  screen.style.width = `min(100%, calc((82dvh - 130px) * ${film.width / film.height}))`;
  if (film.vimeo) {
   const frame = document.createElement('iframe');
   frame.src = `https://player.vimeo.com/video/${film.vimeo}?autoplay=1&muted=0&playsinline=1&loop=0&autopause=1&dnt=1&title=0&byline=0&portrait=0#t=0s`;
   frame.title = film.title; frame.allow = 'autoplay; fullscreen; picture-in-picture'; frame.allowFullscreen = true;
   screen.append(frame);
  } else {
   const video = document.createElement('video');
   video.controls = true; video.playsInline = true; video.preload = 'none';
   video.muted = false; video.defaultMuted = false; video.volume = 1;
   video.poster = film.poster; video.src = film.src;
   screen.append(video);
   if (!dialog.open) dialog.showModal();
   // The viewer explicitly chose Play Film; no videos exist while browsing.
   video.play().catch(() => {});
  }
  if (!dialog.open) dialog.showModal();
  document.body.classList.add('gl-film-open');
  dialog.querySelector('.gl-film-close').focus();
 }
 stage.addEventListener('click', event => { if (Date.now() < suppressClickUntil) { event.preventDefault(); return; } play(); });
 document.querySelectorAll('[data-short-film]').forEach(button => button.addEventListener('click', () => play(Number(button.dataset.shortFilm))));
 function advancePlaying(direction) {
  if (playingIndex < openingCount) select(playingIndex + direction);
  else play(openingCount + (playingIndex - openingCount + direction + films.length - openingCount) % (films.length - openingCount));
 }
 picker.addEventListener('change', () => select(Number(picker.value)));
 browser.querySelector('[data-short-prev]').addEventListener('click', () => select(index - 1));
 browser.querySelector('[data-short-next]').addEventListener('click', () => select(index + 1));
 dialog.querySelector('[data-short-prev]').addEventListener('click', () => advancePlaying(-1));
 dialog.querySelector('[data-short-next]').addEventListener('click', () => advancePlaying(1));
 stage.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
   event.preventDefault(); select(index + (event.key === 'ArrowLeft' ? -1 : 1));
  }
 });
 let gesture = null, suppressClickUntil = 0;
 stage.addEventListener('pointerdown', event => {
  if (event.pointerType !== 'touch' || event.isPrimary === false) return;
  gesture = {id:event.pointerId,x:event.clientX,y:event.clientY,dx:0,dy:0,started:event.timeStamp,axis:null};
  stage.setPointerCapture?.(event.pointerId);
 });
 stage.addEventListener('pointermove', event => {
  if (!gesture || gesture.id !== event.pointerId) return;
  gesture.dx = event.clientX-gesture.x; gesture.dy = event.clientY-gesture.y;
  // Lock intent early: a vertical gesture never becomes a film swipe later.
  if (!gesture.axis && Math.max(Math.abs(gesture.dx),Math.abs(gesture.dy)) > 8) {
   gesture.axis = Math.abs(gesture.dx) > Math.abs(gesture.dy)*1.15 ? 'x' : 'y';
  }
  if (gesture.axis === 'x') {
   poster.style.transform = `translateX(${Math.max(-90,Math.min(90,gesture.dx*.55))}px)`;
  }
 });
 stage.addEventListener('pointerup', event => {
  if (!gesture || gesture.id !== event.pointerId) return;
  const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
  const horizontal=gesture.axis==='x' || (!gesture.axis && Math.abs(dx)>Math.abs(dy)*1.15);
  const elapsed=Math.max(1,event.timeStamp-gesture.started);
  gesture=null; poster.style.transform='';
  if (Math.abs(dx)>12 || Math.abs(dy)>12) suppressClickUntil=Date.now()+500;
  // A short, intentional flick counts; slow deliberate drags need only 24px.
  if (horizontal && (Math.abs(dx)>=24 || (Math.abs(dx)>=14 && Math.abs(dx)/elapsed>=.25))) select(index+(dx<0?1:-1));
 });
 stage.addEventListener('pointercancel', () => {gesture=null;poster.style.transform='';suppressClickUntil=Date.now()+500;});
 dialog.querySelector('.gl-film-close').addEventListener('click', dismiss);
 dialog.addEventListener('click', event => { if (event.target === dialog) dismiss(); });
 dialog.addEventListener('cancel', stop);
 dialog.addEventListener('close', () => {
  // A queued close event must not unload a newly reopened player.
  if (dialog.open) return;
  stop();
  if (!document.querySelector('.gl-film-dialog[open]')) {
   document.body.classList.remove('gl-film-open'); stage.focus();
  }
 });
 select(0);
}
