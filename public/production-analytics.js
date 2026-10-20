(() => {
 if(location.origin!=='https://giolinafilms.com'||window.__giolinaAnalyticsListener)return;
 const paths=new Set(['/','/cinematography/','/photography/','/sweet-sixteen/','/reviews/','/experience/','/about-us/','/contact/','/ready-to-go-productions/','/photography/wedding-collection/','/weddings/the-park-savoy-florham-park/']);
 if(!paths.has(location.pathname))return;
 let config;try{config=JSON.parse(document.querySelector('#gl-analytics-config')?.textContent||'{}');}catch{return;}
 if(config.enabled!==true||config.privacyApproved!==true||config.measurementId!=='G-KD1ES061DH')return;
 window.__giolinaAnalyticsListener=true;
 const permitted=()=>window.GioLinaConsent?.accepted()===true&&navigator.globalPrivacyControl!==true&&!window['ga-disable-'+config.measurementId];
 const start=()=>{
  if(!permitted()||window.__giolinaAnalyticsStarted)return;
  window.__giolinaAnalyticsStarted=true;
  let referrer='';try{const r=new URL(document.referrer);if(['https:','http:'].includes(r.protocol)&&!r.username&&!r.password&&!/(^|\.)giolinafilms\.com$|(^|\.)giolina\.co$/.test(r.hostname))referrer=r.origin+'/';}catch{}
  const page={page_location:location.origin+location.pathname,page_referrer:referrer,page_title:document.title};
  window.dataLayer=window.dataLayer||[];
  window.gtag=function(){window.dataLayer.push(arguments);};
  window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  window.gtag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  window.gtag('js',new Date());
  window.gtag('config',config.measurementId,{...page,send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false});
  window.gtag('event','page_view',page);
  const tag=document.createElement('script');tag.async=true;tag.dataset.glGa='';tag.src='https://www.googletagmanager.com/gtag/js?id='+config.measurementId;document.head.append(tag);
  document.addEventListener('click',event=>{
   if(!permitted())return;
   const link=event.target.closest?.('a[href]');if(!link)return;
   const href=link.getAttribute('href');let method=null;
   if(href?.startsWith('tel:'))method='phone';
   else if(href?.startsWith('mailto:'))method='email';
   else try{
    const target=new URL(href,location.href);
    if(target.origin===location.origin&&['/contact','/contact/','/contact-us','/contact-us/','/contact-us-2','/contact-us-2/'].includes(target.pathname))method='inquiry_page';
    else if(target.origin==='https://clients.giolina.co'&&target.pathname==='/schedule/61f5ca5de95956002dd1c3d7')method='scheduler';
   }catch{}
   if(method)window.gtag('event','contact_intent',{...page,contact_method:method});
  });
 };
 window.addEventListener('gl:analytics-consent',start);start();
})();
