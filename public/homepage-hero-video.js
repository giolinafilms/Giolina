// Scope playback adjustments to the homepage background, never portfolio films.
const heroFrame = document.querySelector('.gl-hero-video iframe[data-hero-start="5"]');
if (heroFrame && window.Vimeo?.Player) {
 const heroPlayer = new window.Vimeo.Player(heroFrame);
 let seeking = false;
 const skipOpening = () => {
  if (seeking) return;
  seeking = true;
  return heroPlayer.setCurrentTime(5).catch(() => {}).finally(() => { seeking = false; });
 };
 // The URL fragment is the fallback if the SDK is unavailable.
 heroPlayer.ready().then(skipOpening).catch(() => {});
 // Native looping does not emit ended. Skip the slate when the clock resets.
 heroPlayer.on('timeupdate', ({seconds}) => {
  if (seconds < 4.8) skipOpening();
 });
}
