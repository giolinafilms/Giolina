// All portfolio films open in the site, with native keyboard/focus handling.
const filmTriggers = document.querySelectorAll('[data-vimeo-id]');
if (filmTriggers.length) {
 const dialog = document.createElement('dialog');
 dialog.className = 'gl-film-dialog';
 dialog.setAttribute('aria-labelledby', 'gl-film-title');
 dialog.innerHTML = '<div class="gl-film-toolbar"><h2 id="gl-film-title">Wedding film</h2><button type="button" class="gl-film-close">Close film</button></div><div class="gl-film-screen"></div><p class="gl-film-hint">Use the player’s fullscreen control for a larger view.</p>';
 document.body.append(dialog);
 const screen = dialog.querySelector('.gl-film-screen');
 const close = dialog.querySelector('.gl-film-close');
 let opener;
 filmTriggers.forEach(trigger => trigger.addEventListener('click', event => {
  const id = trigger.dataset.vimeoId;
  if (!/^\d+$/.test(id)) return;
  event.preventDefault(); opener = trigger;
  const title = trigger.dataset.filmTitle || 'GioLina wedding film';
  dialog.querySelector('h2').textContent = title;
  const frame = document.createElement('iframe');
  frame.src = `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1&title=0&byline=0&portrait=0`;
  frame.title = title; frame.allow = 'autoplay; fullscreen; picture-in-picture';
  frame.allowFullscreen = true;
  screen.replaceChildren(frame);
  dialog.showModal(); document.body.classList.add('gl-film-open'); close.focus();
 }));
 close.addEventListener('click', () => dialog.close());
 dialog.addEventListener('click', event => { if(event.target === dialog) dialog.close(); });
 dialog.addEventListener('close', () => {
  screen.replaceChildren(); // Stop sound/playback immediately, including Escape close.
  document.body.classList.remove('gl-film-open'); opener?.focus();
 });
}
