import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';
const loader=readFileSync('public/production-analytics.js','utf8');
const consent=existsSync('public/analytics-consent.js')?readFileSync('public/analytics-consent.js','utf8'):'';
function setup({url='https://giolinafilms.com/',enabled=true,privacyApproved=true,saved=null,gpc=false,referrer='https://www.google.com/search?q=private',storageFail=false}={}){
 const d=new JSDOM('<title>GioLina</title><script id="gl-analytics-config" type="application/json">'+JSON.stringify({enabled,privacyApproved,measurementId:'G-KD1ES061DH'})+'</script><footer></footer><a href="/contact-us-2/?email=private">Inquire</a>',{url,referrer,runScripts:'outside-only',virtualConsole:new VirtualConsole()});
 const w=d.window;Object.defineProperty(w.navigator,'globalPrivacyControl',{value:gpc});
 if(saved)w.localStorage.setItem('gl-analytics-consent',JSON.stringify(saved));
 if(storageFail)Object.defineProperty(w,'localStorage',{get(){throw Error('unavailable');}});
 w.eval(consent);w.eval(loader);return w;
}
const calls=w=>(w.dataLayer||[]).map(a=>[...a]);
const choice=(w,value)=>w.document.querySelector('[data-analytics-'+value+']').click();
test('no tag or events before acceptance; decline persists without analytics',()=>{
 const w=setup();assert.equal(w.dataLayer,undefined);assert.equal(w.document.querySelector('script[src]'),null);
 choice(w,'decline');assert.equal(w.dataLayer,undefined);assert.equal(JSON.parse(w.localStorage.getItem('gl-analytics-consent')).choice,'denied');w.close();
});
test('accept loads once with denied ads and sanitized origin; aliases report intent only',()=>{
 const w=setup();choice(w,'accept');w.eval(loader);choice(w,'accept');
 assert.equal(w.document.querySelectorAll('script[src*="googletagmanager"]').length,1);
 assert.equal(calls(w).filter(a=>a[1]==='page_view').length,1);
 assert.equal(calls(w).find(a=>a[1]==='page_view')[2].page_referrer,'https://www.google.com/');
 assert.equal(calls(w).find(a=>a[0]==='consent'&&a[1]==='default')[2].ad_storage,'denied');
 w.document.querySelector('a[href^="/contact-us-2/"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));
 assert.equal(calls(w).filter(a=>a[1]==='contact_intent').length,1);
 assert(!/private|generate_lead|form_submit/.test(JSON.stringify(calls(w))));w.close();
});
test('withdrawal disables tracking, clears GA cookies and never replays prior clicks',()=>{
 const w=setup();choice(w,'accept');w.document.cookie='_ga=123; path=/';w.document.cookie='_ga_KD1ES061DH=456; path=/';
 choice(w,'decline');assert.equal(w['ga-disable-G-KD1ES061DH'],true);assert(!w.document.cookie.includes('_ga'));
 const n=calls(w).filter(a=>a[0]==='event').length;
 w.document.querySelector('a[href^="/contact-us-2/"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));
 assert.equal(calls(w).filter(a=>a[0]==='event').length,n);w.close();
});
test('consent survives reload, expires, and respects GPC, privacy gate and private/preview exclusions',()=>{
 const saved={version:1,choice:'accepted',expires:Date.now()+100000};
 let w=setup({saved});assert.equal(calls(w).filter(a=>a[1]==='page_view').length,1);w.close();
 for(const options of [{saved:{...saved,expires:1}},{saved,gpc:true},{saved,privacyApproved:false},{saved,enabled:false},{saved,url:'https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev/'},{saved,url:'https://giolinafilms.com/admin/'},{saved,url:'https://giolinafilms.com/login/'}]){
  w=setup(options);assert.equal(w.dataLayer,undefined,JSON.stringify(options));w.close();
 }
});
test('private client referrals are blank; unavailable storage fails closed',()=>{
 let w=setup({referrer:'https://clients.giolinafilms.com/private?secret=1'});choice(w,'accept');assert.equal(calls(w).find(a=>a[1]==='page_view')[2].page_referrer,'');w.close();
 w=setup({storageFail:true});choice(w,'accept');assert.equal(w.dataLayer,undefined);w.close();
});

test('decline can be changed to acceptance during the same visit',()=>{
 const w=setup();choice(w,'decline');w.GioLinaConsent.open();choice(w,'accept');assert.equal(calls(w).filter(a=>a[1]==='page_view').length,1);w.close();
});
test('preconsent actions are not replayed; saved preference lasts six months',()=>{
 const w=setup();w.document.querySelector('a[href^="/contact-us-2/"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));choice(w,'accept');
 assert.equal(calls(w).filter(a=>a[1]==='contact_intent').length,0);
 const saved=JSON.parse(w.localStorage.getItem('gl-analytics-consent')),days=(saved.expires-Date.now())/86400000;
 assert(days>179&&days<185);w.close();
});
test('consent revoked in another tab blocks subsequent intent events',()=>{
 const w=setup();choice(w,'accept');w.localStorage.setItem('gl-analytics-consent',JSON.stringify({version:1,choice:'denied',expires:Date.now()+10000}));
 w.dispatchEvent(new w.StorageEvent('storage',{key:'gl-analytics-consent'}));
 const n=calls(w).filter(a=>a[0]==='event').length;w.document.querySelector('a[href^="/contact-us-2/"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));assert.equal(calls(w).filter(a=>a[0]==='event').length,n);assert(w['ga-disable-G-KD1ES061DH']);w.close();
});

// These tests cover our loader, not Google's remotely configured history listener.
test('loader emits one initial view and does not replay views for gallery history changes',()=>{
 const w=setup({url:'https://giolinafilms.com/photography/wedding-collection/?source=test#photo=private'});
 choice(w,'accept');
 w.history.replaceState(null,'','#photo=next');
 w.history.pushState(null,'','#photo=another');
 w.dispatchEvent(new w.PopStateEvent('popstate'));
 w.dispatchEvent(new w.CustomEvent('gl:analytics-consent'));
 const views=calls(w).filter(a=>a[0]==='event'&&a[1]==='page_view');
 assert.equal(views.length,1);
 assert.equal(views[0][2].page_location,'https://giolinafilms.com/photography/wedding-collection/');
 assert.equal(calls(w).find(a=>a[0]==='config')[2].send_page_view,false);
 w.close();
});
test('privacy notice is accessible from consent and its preferences never load analytics',()=>{
 let w=setup();assert.equal(w.document.querySelector('.gl-analytics-choice a').getAttribute('href'),'/privacy/');w.close();
 w=setup({url:'https://giolinafilms.com/privacy/'});choice(w,'accept');assert.equal(w.dataLayer,undefined);assert(w.document.querySelector('.gl-analytics-preferences'));w.close();
 const html=readFileSync('dist/privacy/index.html','utf8');
 assert.match(html,/noindex, nofollow/);assert.match(html,/info@giolina.co/);
 assert.match(html,/formspree.io\/legal\/privacy-policy/);assert.match(html,/honeybook.com\/legal\/privacy/);
 assert(!html.includes('googletagmanager.com'));
});
