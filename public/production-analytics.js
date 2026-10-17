(() => {
 if(location.origin!=='https://giolinafilms.com'||window.__giolinaAnalyticsStarted)return;
 const paths=new Set(['/','/cinematography/','/photography/','/sweet-sixteen/','/reviews/','/experience/','/about-us/','/contact/','/ready-to-go-productions/','/photography/wedding-collection/']);
 if(!paths.has(location.pathname))return;
 let config;try{config=JSON.parse(document.querySelector('#gl-analytics-config')?.textContent||'{}');}catch{return;}
 if(config.enabled!==true||config.measurementId!=='G-KD1ES061DH')return;
 window.__giolinaAnalyticsStarted=true;
 window.dataLayer=window.dataLayer||[];
 window.gtag=function(){window.dataLayer.push(arguments);};
 const page={page_location:location.origin+location.pathname,page_referrer:'',page_title:document.title};
 window.gtag('js',new Date());
 window.gtag('config',config.measurementId,{...page,send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false});
 window.gtag('event','page_view',page);
 const tag=document.createElement('script');tag.async=true;tag.src='https://www.googletagmanager.com/gtag/js?id='+config.measurementId;document.head.append(tag);
 // Intent only, never a successful inquiry or form submission.
 document.addEventListener('click',event=>{
  const link=event.target.closest?.('a[href]');if(!link)return;
  const href=link.getAttribute('href');let method=null;
  if(href?.startsWith('tel:'))method='phone';
  else if(href?.startsWith('mailto:'))method='email';
  else if(href==='/contact/')method='inquiry_page';
  else if(href==='https://clients.giolina.co/schedule/61f5ca5de95956002dd1c3d7')method='scheduler';
  if(method)window.gtag('event','contact_intent',{...page,contact_method:method});
 });
})();
