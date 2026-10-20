(() => {
 if(window.GioLinaConsent)return;
 const allowedOrigins=['https://giolinafilms.com','https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev'];
 const paths=['/','/cinematography/','/photography/','/sweet-sixteen/','/reviews/','/experience/','/about-us/','/contact/','/ready-to-go-productions/','/photography/wedding-collection/','/weddings/the-park-savoy-florham-park/','/weddings/the-venetian-garfield/','/privacy/'];
 if(!allowedOrigins.includes(location.origin)||!paths.includes(location.pathname))return;
 const key='gl-analytics-consent',id='G-KD1ES061DH';
 let preference=null,revoked=false;
 const read=()=>{try{const p=JSON.parse(localStorage.getItem(key));return p?.version===1&&['accepted','denied'].includes(p.choice)&&Number.isFinite(p.expires)&&p.expires>Date.now()?p:null;}catch{return null;}};
 preference=read();
 const accepted=()=>!revoked&&navigator.globalPrivacyControl!==true&&read()?.choice==='accepted';
 const clearCookies=()=>{
  for(const pair of document.cookie.split(';')){
   const name=pair.split('=')[0].trim();if(!/^_ga(?:_|$)/.test(name))continue;
   for(const domain of ['',location.hostname,'.'+location.hostname])document.cookie=name+'=; Max-Age=0; Path=/; SameSite=Lax'+(domain?'; Domain='+domain:'');
  }
 };
 const panel=document.createElement('section');panel.className='gl-analytics-choice';panel.setAttribute('aria-label','Analytics preferences');
 panel.innerHTML='<p>Allow optional analytics cookies to help us understand how this website is used? Your choice will not affect browsing or inquiries.</p><p><a href="/privacy/">Analytics and inquiry privacy notice</a></p><div class="gl-analytics-actions"><button type="button" data-analytics-accept>Accept Analytics</button><button type="button" data-analytics-decline>Decline</button></div><p data-analytics-status role="status"></p>';
 const status=panel.querySelector('[data-analytics-status]');
 if(navigator.globalPrivacyControl===true){panel.querySelector('[data-analytics-accept]').disabled=true;status.textContent='Your browser’s privacy preference keeps optional analytics off.';}
 panel.hidden=!!preference||navigator.globalPrivacyControl===true;
 const footer=document.querySelector('footer');if(!footer)return;
 const button=document.createElement('button');button.type='button';button.className='gl-analytics-preferences';button.textContent='Analytics Preferences';button.onclick=()=>{panel.hidden=false;panel.querySelector('button:not(:disabled)').focus();};
 footer.append(button,panel);
 const choose=choice=>{
  if(choice==='accepted'&&navigator.globalPrivacyControl===true)return;
  const wasStarted=window.__giolinaAnalyticsStarted===true;
  const expires=new Date();expires.setMonth(expires.getMonth()+6);
  preference={version:1,choice,expires:expires.getTime()};
  try{localStorage.setItem(key,JSON.stringify(preference));}catch{preference=null;status.textContent='Your preference could not be saved. Analytics remains off.';}
  if(choice==='accepted'&&preference&&!wasStarted){revoked=false;window['ga-disable-'+id]=false;}
  if(choice==='denied'||!preference){
   revoked=true;window['ga-disable-'+id]=true;clearCookies();
   document.querySelectorAll('script[data-gl-ga]').forEach(s=>s.remove());
  }
  window.dispatchEvent(new CustomEvent('gl:analytics-consent'));
  if(preference)panel.hidden=true;
  // A new document discards the loaded vendor runtime after withdrawal.
  if(wasStarted&&(choice==='denied'||!preference))location.reload();
 };
 panel.querySelector('[data-analytics-accept]').onclick=()=>choose('accepted');
 panel.querySelector('[data-analytics-decline]').onclick=()=>choose('denied');
 window.GioLinaConsent=Object.freeze({accepted,open:()=>button.click()});
 window.addEventListener('storage',e=>{if(e.key===key&&window.__giolinaAnalyticsStarted&&!accepted()){revoked=true;window['ga-disable-'+id]=true;clearCookies();location.reload();}});
 if(navigator.globalPrivacyControl===true){window['ga-disable-'+id]=true;clearCookies();}
 window.dispatchEvent(new CustomEvent('gl:analytics-consent'));
})();
