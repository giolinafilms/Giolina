// Vimeo's iframe message protocol, limited to this frame. No automatic embeds.
function createHeroPlayer(frame) {
 const origin = 'https://player.vimeo.com';
 const callbacks = new Map();
 const listeners = new Map();
 let resolveReady, rejectReady;
 const ready = new Promise((resolve, reject) => { resolveReady = resolve; rejectReady = reject; });
 // Keep accepting a late ready event on slow connections.
 const readyTimeout = setTimeout(() => frame.closest('.gl-hero').dataset.videoState = 'waiting-for-vimeo', 15000);
 const send = (method, value) => frame.contentWindow?.postMessage({method, ...(value === undefined ? {} : {value})}, origin);
 const call = (method, value) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => { callbacks.delete(method); reject(new Error('Hero player timed out')); }, 10000);
  callbacks.set(method, {resolve, reject, timer});
  send(method, value);
 });
 window.addEventListener('message', event => {
  if (event.source !== frame.contentWindow || event.origin !== origin) return;
  let data = event.data;
  if (typeof data === 'string') { try { data = JSON.parse(data); } catch { return; } }
  if (!data || typeof data !== 'object') return;
  if (data.event === 'ready' || data.method === 'ping') {
   clearTimeout(readyTimeout); resolveReady(); return;
  }
  if (data.method && callbacks.has(data.method)) {
   const callback = callbacks.get(data.method); callbacks.delete(data.method);
   clearTimeout(callback.timer); callback.resolve(data.value);
  }
  if (data.event === 'error' && callbacks.has(data.data?.method)) {
   const callback = callbacks.get(data.data.method); callbacks.delete(data.data.method);
   clearTimeout(callback.timer); callback.reject(new Error('Hero playback unavailable'));
  }
  listeners.get(data.event)?.(data.data);
 });
 frame.addEventListener('load', () => send('ping'));
 send('ping');
 return {
  ready: () => ready,
  setCurrentTime: seconds => call('setCurrentTime', seconds),
  pause: () => call('pause'),
  play: () => call('play'),
  on: (event, listener) => {
   listeners.set(event, listener);
   ready.then(() => send('addEventListener', event)).catch(() => {});
  }
 };
}

// Hold the existing still image while only the homepage background prepares.
const heroFrame = document.querySelector('.gl-hero-video iframe[data-hero-start="5"]');
const hero = heroFrame?.closest('.gl-hero');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (hero) hero.dataset.videoState = reducedMotion ? 'reduced-motion' : 'preparing';
if (heroFrame && !reducedMotion) {
 const heroPlayer = createHeroPlayer(heroFrame);
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
 // Native muted autoplay prepares frames behind the poster; never pause it.
 Promise.all([hold, heroPlayer.ready()]).then(async () => {
  hero.dataset.videoState = 'seeking-start';
  await skipOpening();
  started = true;
  hero.dataset.videoState = 'starting';
  await heroPlayer.play();
 }).catch(() => { started = false; hero.dataset.videoState = 'playback-error'; hero.classList.remove('gl-hero-video-visible'); });
 // Reveal only after the playback clock advances beyond the requested start.
 // Slow/blocked playback keeps the photograph instead of exposing a spinner.
 heroPlayer.on('timeupdate', ({seconds}) => {
  if (!started || seeking) return;
  if (seconds < 4.8) { skipOpening().catch(() => {}); return; }
  if (seconds > 5.02) { hero.classList.add('gl-hero-video-visible'); hero.dataset.videoState = 'playing'; }
 });
 heroPlayer.on('bufferstart', () => hero.classList.remove('gl-hero-video-visible'));
 heroPlayer.on('error', () => { hero.dataset.videoState = 'playback-error'; hero.classList.remove('gl-hero-video-visible'); });
}
