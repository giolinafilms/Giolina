'use strict';
const dialog=document.querySelector('#film'),player=document.querySelector('#player');
function stop(){player.replaceChildren();}
document.querySelectorAll('[data-film]').forEach(button=>button.addEventListener('click',()=>{stop();const iframe=document.createElement('iframe');iframe.src=button.dataset.film;iframe.title='GioLina example film';iframe.allow='autoplay; fullscreen; picture-in-picture';iframe.referrerPolicy='no-referrer';iframe.allowFullscreen=true;player.append(iframe);dialog.showModal();}));
document.querySelector('#close-film').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',stop);dialog.addEventListener('cancel',stop);dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});

if(document.body.dataset.selectionEnabled==='true'){
 const controls=[...document.querySelectorAll('[data-selection-index]')],save=document.querySelector('#save-selection'),status=document.querySelector('#selection-status'),privatePreview=location.pathname.startsWith('/admin/');
 const endpoint=privatePreview?location.pathname.replace('/admin/','/api/admin/').replace(/\/preview$/,'/selection-preview'):location.pathname+'/selection';
 const fmt=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n/100);
 let version=0,included=[],sequence=0,ready=false;
 function summary(data){document.querySelector('#selection-subtotal').textContent=fmt(data.subtotalCents);document.querySelector('#selection-total').textContent=fmt(data.totalCents);const list=document.querySelector('#selection-summary');list.replaceChildren();for(const row of data.summary){const li=document.createElement('li');li.textContent=row.name+' · '+fmt(row.amountCents);list.append(li);}}
 async function call(method='GET',preview=true){const selected=[...included,...controls.filter(c=>c.checked).map(c=>Number(c.dataset.selectionIndex))];const response=await fetch(endpoint,{method,credentials:privatePreview?'same-origin':'omit',headers:method==='GET'?{}:{'Content-Type':'application/json','X-GioLina-Request':privatePreview?'admin':'demo-selection'},...(method==='POST'?{body:JSON.stringify({selected,version,preview})}:{})});const data=await response.json();if(!response.ok)throw new Error(data.error||'Selection unavailable');return data;}
 controls.forEach(c=>c.disabled=true);save.disabled=true;
 if(privatePreview)save.textContent='Admin preview · no selections saved';
 call().then(data=>{version=data.version;included=data.selected.filter(i=>!controls.some(c=>Number(c.dataset.selectionIndex)===i));for(const c of controls){c.checked=data.selected.includes(Number(c.dataset.selectionIndex));c.disabled=false;}summary(data);ready=true;save.disabled=privatePreview;status.textContent='Choose your offered services. This is a DEMO, not an acceptance.';}).catch(err=>{status.textContent=err.message;});
 for(const control of controls)control.addEventListener('change',async()=>{if(!ready)return;const turn=++sequence;save.disabled=true;status.textContent='Updating your summary…';try{const data=await call('POST',true);if(turn!==sequence)return;summary(data);status.textContent='Summary updated. Save your DEMO selections when ready.';save.disabled=privatePreview;}catch(err){if(turn===sequence)status.textContent=err.message;}});
 save.addEventListener('click',async()=>{if(!ready||privatePreview)return;save.disabled=true;controls.forEach(c=>c.disabled=true);try{const data=await call('POST',false);version=data.version;summary(data);status.textContent=data.message;}catch(err){status.textContent=err.message;}finally{controls.forEach(c=>c.disabled=false);save.disabled=false;}});
}
