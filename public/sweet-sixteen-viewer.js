// Page-scoped adaptation of the existing Photography viewer. Display derivatives only.
(()=>{
 const links=[...document.querySelectorAll('[data-sweet-photo]')];if(!links.length)return;
 let active=0,trigger=null,swipe=null;
 const viewer=document.createElement('dialog');viewer.className='gl-sweet-viewer';viewer.setAttribute('aria-label','Sweet Sixteen photography viewer');
 viewer.innerHTML='<header><span data-count aria-live="polite"></span><button type="button" data-close aria-label="Close photograph">Close</button></header><img alt=""><p role="status" hidden>This photograph could not load. Try the next photograph or close and reopen it.</p><nav aria-label="Photograph navigation"><button type="button" data-prev aria-label="Previous photograph">Previous</button><button type="button" data-next aria-label="Next photograph">Next</button></nav>';
 document.body.append(viewer);const image=viewer.querySelector('img'),status=viewer.querySelector('[role=status]'),close=viewer.querySelector('[data-close]');
 function show(index){active=(index+links.length)%links.length;const a=links[active];status.hidden=true;image.src=a.href;image.alt=a.querySelector('img').alt;viewer.querySelector('[data-count]').textContent=`${active+1} / ${links.length}`;}
 links.forEach((a,index)=>a.addEventListener('click',e=>{e.preventDefault();trigger=a;show(index);viewer.showModal();document.body.classList.add('gl-sweet-viewer-open');close.focus();}));
 close.addEventListener('click',()=>viewer.close());viewer.querySelector('[data-prev]').addEventListener('click',()=>show(active-1));viewer.querySelector('[data-next]').addEventListener('click',()=>show(active+1));
 viewer.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();show(active+(e.key==='ArrowLeft'?-1:1));}});
 viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.close();});
 viewer.addEventListener('close',()=>{image.removeAttribute('src');swipe=null;document.body.classList.remove('gl-sweet-viewer-open');trigger?.focus({preventScroll:true});});
 image.addEventListener('load',()=>{status.hidden=true;});image.addEventListener('error',()=>{status.hidden=false;});
 image.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')swipe={x:e.clientX,y:e.clientY,id:e.pointerId};});
 image.addEventListener('pointerup',e=>{if(!swipe||swipe.id!==e.pointerId)return;const dx=e.clientX-swipe.x,dy=e.clientY-swipe.y;swipe=null;if(Math.abs(dx)>50&&Math.abs(dy)<70)show(active+(dx<0?1:-1));});image.addEventListener('pointercancel',()=>swipe=null);
})();
