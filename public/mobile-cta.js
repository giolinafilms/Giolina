// Avoid competing with focused form controls/virtual keyboards and fullscreen media.
const contactBar = document.querySelector('.gl-mobile-cta');
if (contactBar) {
 const syncContactBar = () => {
  const editing = document.activeElement?.matches('input,textarea,select,[contenteditable="true"]');
  contactBar.hidden = Boolean(editing || document.fullscreenElement || document.querySelector('dialog[open]'));
 };
 document.addEventListener('focusin', syncContactBar);
 document.addEventListener('focusout', () => requestAnimationFrame(syncContactBar));
 document.addEventListener('fullscreenchange', syncContactBar);
 document.addEventListener('webkitbeginfullscreen', () => {contactBar.hidden = true;}, true);
 document.addEventListener('webkitendfullscreen', syncContactBar, true);
 new MutationObserver(syncContactBar).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
 syncContactBar();
}
