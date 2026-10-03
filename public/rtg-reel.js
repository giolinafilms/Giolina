// Poster browsing only. The shared click-to-play architecture owns all players.
const track = document.querySelector('.gl-production-body #rtg-reel-track');
if (track) {
 const cards = [...track.children];
 const previous = document.querySelector('[data-rtg-prev]');
 const next = document.querySelector('[data-rtg-next]');
 const position = document.querySelector('[data-rtg-position]');
 const current = () => cards.reduce((best, card, i) => Math.abs(card.offsetLeft - track.scrollLeft) < Math.abs(cards[best].offsetLeft - track.scrollLeft) ? i : best, 0);
 const update = () => {
  position.textContent = `${current() + 1} / ${cards.length}`;
  previous.disabled = track.scrollLeft < 2;
  next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
 };
 const move = delta => {
  const index = Math.max(0, Math.min(cards.length - 1, current() + delta));
  track.scrollTo({left: cards[index].offsetLeft, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
 };
 previous.addEventListener('click', () => move(-1));
 next.addEventListener('click', () => move(1));
 track.addEventListener('keydown', event => {
  if (event.target !== track || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1);
 });
 track.addEventListener('scroll', update, {passive: true});
 new ResizeObserver(update).observe(track);
 update();
}
