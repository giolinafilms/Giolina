// Minimal native interactions; no WordPress, jQuery or Elementor runtime.
for (const toggle of document.querySelectorAll('.elementor-menu-toggle')) {
 toggle.setAttribute('role','button');toggle.setAttribute('tabindex','0');toggle.setAttribute('aria-label','Toggle navigation');toggle.setAttribute('aria-expanded','false');
 const menu=toggle.parentElement.querySelector('.elementor-nav-menu--dropdown');
 const act=()=>{const open=menu?.classList.toggle('migration-open');toggle.setAttribute('aria-expanded',String(Boolean(open)));if(menu){menu.setAttribute('aria-hidden',String(!open));for(const link of menu.querySelectorAll('a'))link.setAttribute('tabindex',open?'0':'-1');}};
 toggle.addEventListener('click',act);toggle.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();act();}});
}
for(const form of document.querySelectorAll('[data-preview-form]'))form.addEventListener('submit',e=>e.preventDefault());
for(const tile of document.querySelectorAll('.e-gallery-image[data-thumbnail]'))tile.style.backgroundImage=`url("${tile.closest('a')?.getAttribute('href') || tile.dataset.thumbnail}")`;
// Third-party widgets require preview-domain validation; no analytics are sent.
if(document.querySelector('.embedsocial-hashtag')){const s=document.createElement('script');s.src='https://embedsocial.com/cdn/ht.js';s.async=true;document.head.append(s);}
const gallery=[...document.querySelectorAll('.e-gallery-item[href^="/assets/"]')];
if(gallery.length){
 const dialog=document.createElement('dialog');dialog.className='migration-lightbox';
 dialog.innerHTML='<button type="button" aria-label="Close photo">Close</button><img alt="Wedding portfolio photograph"><div><button type="button" aria-label="Previous photo">Previous</button><button type="button" aria-label="Next photo">Next</button></div>';
 document.body.append(dialog);let active=0;const buttons=dialog.querySelectorAll('button');
 const show=i=>{active=(i+gallery.length)%gallery.length;const a=gallery[active];dialog.querySelector('img').src=a.href;dialog.querySelector('img').alt=a.dataset.elementorLightboxTitle||'Wedding portfolio photograph';};
 buttons[0].onclick=()=>dialog.close();buttons[1].onclick=()=>show(active-1);buttons[2].onclick=()=>show(active+1);
 gallery.forEach((a,i)=>a.addEventListener('click',e=>{e.preventDefault();show(i);dialog.showModal();}));
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
 dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')show(active-1);if(e.key==='ArrowRight')show(active+1);});
}

// Verified Formspree delivery; show success only when the service accepts it.
for(const form of document.querySelectorAll('[data-contact-form]')){
 const button=form.querySelector('button[type="submit"]');
 const label=button.querySelector('.elementor-button-text');
 const status=form.querySelector('[data-contact-status]');
 // Hosted verification runs before Formspree accepts and emails the inquiry.
 if(form.dataset.humanVerification==='hosted'){
  form.addEventListener('submit',()=>{button.disabled=true;label.textContent='Continue…';});
  window.addEventListener('pageshow',()=>{button.disabled=false;label.textContent='Submit';});
  continue;
 }
 let submitting=false;
 form.addEventListener('submit',async event=>{
  event.preventDefault();
  if(submitting||!form.reportValidity())return;
  submitting=true;button.disabled=true;label.textContent='Sending…';
  status.textContent='Sending your inquiry…';
  try{
   const response=await fetch(form.action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});
   if(!response.ok)throw new Error('Submission not accepted');
   status.textContent='Thank you! Your inquiry has been sent. We’ll be in touch soon.';
   form.reset();
  }catch{
   status.textContent='We couldn’t send your inquiry. Please try again or email info@giolina.co.';
  }finally{
   submitting=false;button.disabled=false;label.textContent='Submit';
  }
 });
}
