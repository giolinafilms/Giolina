// The supplied family film follows the existing click-created portfolio modal pattern.
const trigger = document.querySelector('[data-family-film]');
if (trigger) {
 const dialog = document.createElement('dialog');
 dialog.className = 'gl-film-dialog gl-family-dialog';
 dialog.setAttribute('aria-labelledby', 'gl-family-film-title');
 dialog.innerHTML = '<div class="gl-film-toolbar"><h2 id="gl-family-film-title">Giovanni &amp; Michaelina</h2><button type="button" class="gl-film-close">Close film</button></div><div class="gl-film-screen"></div>';
 document.body.append(dialog);
 const screen = dialog.querySelector('.gl-film-screen');
 function unload(container) {
  const video = container.querySelector('video');
  if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
  container.replaceChildren();
 }
 function close() { unload(screen); dialog.close(); }
 trigger.addEventListener('click', () => {
  document.querySelectorAll('.gl-film-dialog[open]').forEach(active => {
   const oldScreen = active.querySelector('.gl-film-screen, .gl-short-screen');
   if (oldScreen) unload(oldScreen);
   if (active !== dialog) active.close();
  });
  unload(screen);
  const video = document.createElement('video');
  video.controls = true; video.playsInline = true; video.preload = 'none';
  video.muted = false; video.volume = 1;
  video.poster = '/assets/giovanni-michaelina-poster.jpg';
  video.src = '/assets/giovanni-michaelina.mp4';
  screen.append(video);
  if (!dialog.open) dialog.showModal();
  document.body.classList.add('gl-film-open');
  video.play().catch(() => {});
  dialog.querySelector('.gl-film-close').focus();
 });
 dialog.querySelector('.gl-film-close').addEventListener('click', close);
 dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
 dialog.addEventListener('cancel', () => unload(screen));
 dialog.addEventListener('close', () => {
  unload(screen);
  if (!document.querySelector('.gl-film-dialog[open]')) {
   document.body.classList.remove('gl-film-open'); trigger.focus();
  }
 });
}
