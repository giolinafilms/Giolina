'use strict';
const dialog=document.querySelector('#film'),player=document.querySelector('#player');
function stop(){player.replaceChildren();}
document.querySelectorAll('[data-film]').forEach(button=>button.addEventListener('click',()=>{stop();const iframe=document.createElement('iframe');iframe.src=button.dataset.film;iframe.title='GioLina example film';iframe.allow='autoplay; fullscreen; picture-in-picture';iframe.referrerPolicy='no-referrer';iframe.allowFullscreen=true;player.append(iframe);dialog.showModal();}));
document.querySelector('#close-film').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',stop);dialog.addEventListener('cancel',stop);dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
