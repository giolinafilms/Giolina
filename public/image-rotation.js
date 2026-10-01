// Four temporary frames per area. Sources/dimensions can be replaced independently.
const motion=matchMedia('(prefers-reduced-motion: reduce)');
for(const area of document.querySelectorAll('[data-rotate-images]')){
 const frames=[...area.querySelectorAll('img')];let active=0,timer,visible=false,running=false;
 area.dataset.currentFrame='1';
 const prepare=async image=>{if(!image.src)image.src=image.dataset.src;try{await image.decode();return true;}catch{return false;}};
 const schedule=()=>{clearTimeout(timer);if(!visible||document.hidden||motion.matches)return;timer=setTimeout(advance,4500);};
 const advance=async()=>{
  if(running)return;running=true;const next=(active+1)%frames.length;
  const ready=await prepare(frames[next]);
  if(ready&&visible&&!document.hidden&&!motion.matches){frames[next].classList.add('is-current');frames[active].classList.remove('is-current');active=next;area.dataset.currentFrame=String(active+1);}
  running=false;schedule();
 };
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();if(visible&&!motion.matches)prepare(frames[(active+1)%frames.length]);},{rootMargin:'100px'});observer.observe(area);
 document.addEventListener('visibilitychange',schedule);motion.addEventListener('change',schedule);
}
