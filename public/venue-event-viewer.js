// Preview venue events keep each client’s photographs in a separate lightbox collection.
const links=[...document.querySelectorAll('[data-photo-viewer-link]')];
if(links.length){
 let photos=[],active=0,trigger,swipe;
 const viewer=document.createElement('dialog');viewer.className='gl-photo-viewer';viewer.setAttribute('aria-label','Wedding photography viewer');
 viewer.innerHTML='<header><span data-photo-count aria-live="polite"></span><button type="button" aria-label="Close photo">Close</button></header><img alt=""><nav aria-label="Photo navigation"><button type="button" aria-label="Previous photo">Previous</button><button type="button" aria-label="Next photo">Next</button></nav>';
 document.body.append(viewer);const image=viewer.querySelector('img'),buttons=viewer.querySelectorAll('button');
 const show=index=>{active=(index+photos.length)%photos.length;const link=photos[active];image.src=link.href;image.alt=link.querySelector('img')?.alt||'Photograph position';viewer.querySelector('[data-photo-count]').textContent=`${active+1} / ${photos.length}`;};
 links.forEach(a=>a.addEventListener('click',event=>{event.preventDefault();trigger=a;const eventSection=a.closest('.gv-client-event');photos=[...new Map([...eventSection.querySelectorAll('[data-photo-viewer-link]')].map(link=>[link.href,link])).values()];viewer.setAttribute('aria-label',eventSection.dataset.eventName+' photography viewer');show(photos.findIndex(p=>p.href===a.href));viewer.showModal();document.body.classList.add('gl-photo-viewer-open');buttons[0].focus();}));
 buttons[0].addEventListener('click',()=>viewer.close());buttons[1].addEventListener('click',()=>show(active-1));buttons[2].addEventListener('click',()=>show(active+1));
 viewer.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();show(active+(e.key==='ArrowLeft'?-1:1));}});
 viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.close();});
 viewer.addEventListener('close',()=>{image.removeAttribute('src');document.body.classList.remove('gl-photo-viewer-open');trigger?.focus({preventScroll:true});});
 image.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')swipe={x:e.clientX,y:e.clientY,id:e.pointerId};});
 image.addEventListener('pointerup',e=>{if(!swipe||e.pointerId!==swipe.id)return;const dx=e.clientX-swipe.x,dy=e.clientY-swipe.y;swipe=null;if(Math.abs(dx)>50&&Math.abs(dy)<70)show(active+(dx<0?1:-1));});
 image.addEventListener('pointercancel',()=>swipe=null);
}
