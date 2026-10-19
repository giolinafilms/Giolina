import Player from '/vimeo-hero-player.mjs';

// Load immediately; retain the fallback only until playback is advancing.
const frame = document.querySelector('.gl-hero-video iframe[data-hero-start="5"]');
const hero = frame?.closest('.gl-hero');
if (hero && !hero.dataset.videoInitialized && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
 const state = hero.dataset;
 state.videoInitialized = 'true';
 state.videoState = 'initializing';
 frame.src = frame.dataset.heroSrc;
 const player = new Player(frame);
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
  const advancing = previousSeconds !== null && seconds > previousSeconds + .01 && seconds - previousSeconds < 1;
  previousSeconds = seconds;
  if (revealed) {
   if (seconds < 4.8 && !seekPending) void seekOpening();
   return;
  }
  if (advancing) {
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
  // The embed URL requests the approved opening; SDK seek is nonblocking.
  void seekOpening();
 }).catch(error => { state.videoState = 'initialization-error'; recordError(error); });

} else if (hero && !hero.dataset.videoInitialized) {
 hero.dataset.videoState = 'reduced-motion';
}
