// Accept only a supplied MediaZilla embed URL. Never derive IDs or share links.
const mediazillaTriggers = document.querySelectorAll('[data-mediazilla-src]');
if (mediazillaTriggers.length) {
 const dialog = document.createElement('dialog');
 dialog.className = 'gl-film-dialog';
 dialog.setAttribute('aria-labelledby', 'gl-mediazilla-title');
 dialog.innerHTML = '<div class="gl-film-toolbar"><h2 id="gl-mediazilla-title">Wedding film</h2><button type="button" class="gl-film-close">Close film</button></div><div class="gl-film-screen"></div>';
 document.body.append(dialog);
 const screen = dialog.querySelector('.gl-film-screen');
 const close = dialog.querySelector('.gl-film-close');
 let opener;
 mediazillaTriggers.forEach(trigger => trigger.addEventListener('click', event => {
  let source;
  try { source = new URL(trigger.dataset.mediazillaSrc); } catch { return; }
  if (source.protocol !== 'https:' || !/^(?:[a-z0-9-]+\.)*mediazilla\.com$/i.test(source.hostname)) return;
  event.preventDefault(); opener = trigger;
  const title = trigger.dataset.filmTitle || 'GioLina wedding film';
  dialog.querySelector('h2').textContent = title;
  const frame = document.createElement('iframe');
  frame.src = source.href; frame.title = title;
  frame.allow = 'autoplay; fullscreen; picture-in-picture'; frame.allowFullscreen = true;
  screen.style.aspectRatio = trigger.dataset.filmAspect === '12/5' ? '12/5' : '16/9';
  screen.replaceChildren(frame);
  dialog.showModal(); document.body.classList.add('gl-film-open'); close.focus();
 }));
 close.addEventListener('click', () => dialog.close());
 dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
 dialog.addEventListener('close', () => {
  screen.replaceChildren(); document.body.classList.remove('gl-film-open'); opener?.focus();
 });
}
