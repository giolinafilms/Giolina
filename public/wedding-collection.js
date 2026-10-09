(()=>{
 const root=document.querySelector('[data-wc]');if(!root)return;
 const categories=JSON.parse(root.querySelector('[data-wc-data]').textContent);
 const overview=root.querySelector('[data-wc-overview]'),section=root.querySelector('[data-wc-category]'),grid=root.querySelector('[data-wc-grid]'),title=root.querySelector('[data-wc-title]');
 const viewer=root.querySelector('[data-wc-viewer]'),image=root.querySelector('[data-wc-image]'),error=root.querySelector('[data-wc-error]'),close=root.querySelector('[data-wc-close]');
 let category=null,active=0,trigger=null,swipe=null,openedFromGallery=false;
 const route=(photo)=>'#'+new URLSearchParams({category:category.slug,...(photo?{photo}: {})});
 function show(index){
  active=(index+category.photos.length)%category.photos.length;const p=category.photos[active];error.hidden=true;image.src=p.large;image.alt=p.alt;
  root.querySelector('[data-wc-position]').textContent=`${active+1} / ${category.photos.length} · ${category.name}`;
 }
 function move(step){if(!category)return;show(active+step);history.replaceState(null,'',route(category.photos[active].id));}
 function dismiss(){if(openedFromGallery){history.back();}else if(category){history.replaceState(null,'',route());}viewer.close();}
 function render(){
  const params=new URLSearchParams(location.hash.slice(1));let next=categories.find(c=>c.slug===params.get('category'));
  // Retained photographs may move categories; old links follow the photograph.
  if(params.get('photo')&&!next?.photos.some(p=>p.id===params.get('photo'))){
   const moved=categories.find(c=>c.photos.some(p=>p.id===params.get('photo')));
   if(moved){next=moved;params.set('category',moved.slug);history.replaceState(null,'','#'+params);}
  }
  if(!next){category=null;grid.replaceChildren();section.hidden=true;overview.hidden=false;if(viewer.open)viewer.close();return;}
  overview.hidden=true;section.hidden=false;
  if(category!==next){
   category=next;title.textContent=category.name;const current=root.querySelector('[data-wc-current]');if(current)current.textContent=category.name;grid.replaceChildren();
   const fragment=document.createDocumentFragment();
   for(const p of category.photos){
    const a=document.createElement('a');a.href=route(p.id);a.setAttribute('aria-label','Enlarge '+p.alt);a.dataset.photo=p.id;
    const img=document.createElement('img');img.src=p.src;img.alt=p.alt;img.width=p.width;img.height=p.height;img.loading='lazy';img.decoding='async';
    img.addEventListener('error',()=>{a.classList.add('wc-load-error');a.setAttribute('aria-label','Image unavailable; open photograph to retry');});
    a.append(img);a.addEventListener('click',()=>{trigger=a;openedFromGallery=true;});fragment.append(a);
   }
   grid.append(fragment);title.focus({preventScroll:true});section.scrollIntoView?.({block:"start"});
  }
  const index=category.photos.findIndex(p=>p.id===params.get('photo'));
  if(index>=0){show(index);if(!viewer.open){viewer.showModal();document.body.classList.add('wc-viewer-open');close.focus();}}
  else if(viewer.open)viewer.close();
 }
 close.addEventListener('click',dismiss);root.querySelector('[data-wc-prev]').addEventListener('click',()=>move(-1));root.querySelector('[data-wc-next]').addEventListener('click',()=>move(1));
 viewer.addEventListener('cancel',e=>{e.preventDefault();dismiss();});viewer.addEventListener('click',e=>{if(e.target===viewer)dismiss();});
 viewer.addEventListener('close',()=>{image.removeAttribute('src');document.body.classList.remove('wc-viewer-open');openedFromGallery=false;if(trigger?.isConnected)trigger.focus({preventScroll:true});trigger=null;});
 viewer.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowLeft'?-1:1);}});
 image.addEventListener('error',()=>{error.hidden=false;});image.addEventListener('load',()=>{error.hidden=true;});
 image.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')swipe={x:e.clientX,y:e.clientY,id:e.pointerId};});
 image.addEventListener('pointerup',e=>{if(!swipe||swipe.id!==e.pointerId)return;const dx=e.clientX-swipe.x,dy=e.clientY-swipe.y;swipe=null;if(Math.abs(dx)>50&&Math.abs(dy)<70)move(dx<0?1:-1);});image.addEventListener('pointercancel',()=>swipe=null);
 for(const button of root.querySelectorAll('[data-wc-top]'))button.addEventListener('click',()=>{section.scrollIntoView?.({block:'start'});title.focus({preventScroll:true});});
 window.addEventListener('hashchange',render);render();
})();
