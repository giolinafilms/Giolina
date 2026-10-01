import Player from '/vimeo-hero-player.mjs';

// One iframe, native muted autoplay, and a one-way reveal. No pause cycle.
const frame = document.querySelector('.gl-hero-video iframe[data-hero-start="5"]');
const hero = frame?.closest('.gl-hero');
if (hero && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
 const player = new Player(frame);
 const state = hero.dataset;
 state.videoState = 'initializing';
 let holdComplete = false;
 let revealAllowed = false;
 let revealed = false;
 let previousSeconds = null;
 let seekPending = false;
 const recordError = error => { state.videoError = error?.name || 'PlayerError'; };
 const seekOpening = async () => {
  if (seekPending) return;
  seekPending = true;
  try {
   // Seeking is best-effort; missing acknowledgement must not stop autoplay.
   await Promise.race([
    player.setCurrentTime(5),
    new Promise((_, reject) => setTimeout(() => reject(new Error('SeekTimeout')), 2000))
   ]);
   state.videoSeek = 'succeeded';
  } catch (error) { state.videoSeek = 'unavailable'; recordError(error); }
  finally { seekPending = false; }
 };
 player.on('timeupdate', ({seconds}) => {
  const advancing = previousSeconds !== null && seconds > previousSeconds + .01;
  previousSeconds = seconds;
  if (revealed) {
   if (seconds < 4.8 && !seekPending) void seekOpening();
   return;
  }
  if (holdComplete && revealAllowed && !seekPending && advancing && seconds >= 4.8) {
   revealed = true;
   hero.classList.add('gl-hero-video-visible');
   state.videoState = 'playing';
  }
 });
 // Buffering/loop events never restore the poster after successful reveal.
 player.on('error', error => {
  recordError(error);
  if (!revealed) state.videoState = 'player-error';
 });
 const ready = player.ready().then(async () => {
  state.videoReady = 'true';
  await player.setMuted(true);
  state.videoMuted = 'true';
  state.videoPlay = 'requested';
  // A delayed/rejected play promise must not hide advancing native autoplay.
  player.play().then(() => { state.videoPlay = 'succeeded'; })
   .catch(error => { state.videoPlay = 'rejected'; recordError(error); });
  if (!holdComplete) void seekOpening();
 }).catch(error => { state.videoState = 'initialization-error'; recordError(error); });
 const paint = performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint');
 const delay = Math.max(0, 5000 - (performance.now() - (paint?.startTime ?? performance.now())));
 setTimeout(async () => {
  holdComplete = true;
  state.videoHold = 'complete';
  await ready;
  // Best effort to reveal at 00:05 without pausing the running background.
  await seekOpening();
  previousSeconds = null;
  revealAllowed = true;
 }, delay);
} else if (hero) {
 hero.dataset.videoState = 'reduced-motion';
}
