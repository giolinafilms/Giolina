// Hold the existing still image while only the homepage background prepares.
const heroFrame = document.querySelector('.gl-hero-video iframe[data-hero-start="5"]');
const hero = heroFrame?.closest('.gl-hero');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (heroFrame && window.Vimeo?.Player && !reducedMotion) {
 const heroPlayer = new window.Vimeo.Player(heroFrame);
 const firstPaint = performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint');
 const remainingHold = Math.max(0, 5000 - (performance.now() - (firstPaint?.startTime ?? performance.now())));
 const hold = new Promise(resolve => setTimeout(resolve, remainingHold));
 let seeking = false;
 let started = false;
 const skipOpening = () => {
  if (seeking) return Promise.resolve();
  seeking = true;
  return heroPlayer.setCurrentTime(5).finally(() => { seeking = false; });
 };
 // Seek/prebuffer behind the still, then pause until the hold has elapsed.
 const prepared = heroPlayer.ready().then(skipOpening).then(() => heroPlayer.pause());
 Promise.all([hold, prepared]).then(async () => {
  await skipOpening();
  started = true;
  await heroPlayer.play();
 }).catch(() => { started = false; hero.classList.remove('gl-hero-video-visible'); });
 // Reveal only after the playback clock advances beyond the requested start.
 // Slow/blocked playback keeps the photograph instead of exposing a spinner.
 heroPlayer.on('timeupdate', ({seconds}) => {
  if (!started || seeking) return;
  if (seconds < 4.8) { skipOpening().catch(() => {}); return; }
  if (seconds > 5.02) hero.classList.add('gl-hero-video-visible');
 });
 heroPlayer.on('bufferstart', () => hero.classList.remove('gl-hero-video-visible'));
 heroPlayer.on('error', () => hero.classList.remove('gl-hero-video-visible'));
}
