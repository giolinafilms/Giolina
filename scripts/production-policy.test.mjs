import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {build} from 'esbuild';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {JSDOM} from 'jsdom';
import {productionPolicy} from '../src/config/production-policy.mjs';
test('production switches fail closed on preview, private paths and malformed values',()=>{
 const flags={GIOLINA_INDEXING_ENABLED:'true',GIOLINA_ANALYTICS_ENABLED:'true'};
 for(const url of ['https://preview.test/','http://giolinafilms.com/','https://www.giolinafilms.com/','https://giolinafilms.com/admin/','https://giolinafilms.com/events/','https://giolinafilms.com/qa/public-polish/'])assert.deepEqual(productionPolicy(new URL(url),flags),{index:false,analytics:false});
 assert.deepEqual(productionPolicy(new URL('https://giolinafilms.com/'),{}),{index:false,analytics:false});
 assert.deepEqual(productionPolicy(new URL('https://giolinafilms.com/'),{GIOLINA_INDEXING_ENABLED:true}),{index:false,analytics:false});
});
test('real Worker applies independent flags only to successful public production responses',async()=>{
 const bundle=await build({entryPoints:['worker.js'],bundle:true,write:false,format:'esm',platform:'browser',target:'es2022'});
 const html='<html><head><meta name="robots" content="noindex, nofollow"><script id="gl-analytics-config" type="application/json">{"measurementId":"G-KD1ES061DH","enabled":false}</script></head><body>Approved page</body></html>';
 // Locked local workerd supports September 25; deployment remains September 30.
 const options=bindings=>convertV4MiniflareOptions({workers:[{name:'release-test',modules:true,script:bundle.outputFiles[0].text,compatibilityDate:'2026-09-25',bindings,serviceBindings:{ASSETS:async r=>new Response(html,{status:new URL(r.url).searchParams.has('missing')?404:200,headers:{'Content-Type':'text/html','ETag':'original'}})}}]});
 const mf=new Miniflare(options({GIOLINA_INDEXING_ENABLED:'true',GIOLINA_ANALYTICS_ENABLED:'true'}));
 try{
  for(const [host,path,active] of [['giolinafilms.com','/',true],['preview.test','/',false],['giolinafilms.com','/qa/public-polish/',false],['giolinafilms.com','/?missing',false]]){
   const r=await mf.dispatchFetch('https://'+host+path),body=await r.text();
   assert.equal(r.headers.get('X-Robots-Tag'),active?'index, follow':'noindex, nofollow');assert.equal(body.includes('content="index, follow"'),active);assert.equal(body.includes('/production-analytics.js'),active);
   if(active){assert(body.includes('"enabled":true'));assert.equal(r.headers.get('ETag'),null);assert.equal(r.headers.get('Cache-Control'),'no-store');}
  }
  const robots=await mf.dispatchFetch('https://giolinafilms.com/robots.txt');assert((await robots.text()).includes('Sitemap: https://giolinafilms.com/sitemap.xml'));
  const redirect=await mf.dispatchFetch('https://giolinafilms.com/contact-us/?x=1',{redirect:'manual'});assert.equal(redirect.status,301);assert(redirect.headers.get('Location').endsWith('/contact-us-2/?x=1'));
  const privateResponse=await mf.dispatchFetch('https://giolinafilms.com/admin/');assert.equal(privateResponse.status,503);assert.equal(privateResponse.headers.get('X-Robots-Tag'),'noindex, nofollow');assert(!(await privateResponse.text()).includes('/production-analytics.js'));
  for(const [flags,index,analytics] of [[{},false,false],[{GIOLINA_INDEXING_ENABLED:'true'},true,false],[{GIOLINA_ANALYTICS_ENABLED:'true'},false,true]]){
   await mf.setOptions(options(flags));const r=await mf.dispatchFetch('https://giolinafilms.com/'),body=await r.text();
   assert.equal(r.headers.get('X-Robots-Tag'),index?'index, follow':'noindex, nofollow');assert.equal(body.includes('content="index, follow"'),index);assert.equal(body.includes('/production-analytics.js'),analytics);
  }
 }finally{await mf.dispose();}
});
const script=readFileSync('public/production-analytics.js','utf8');
function browser(url,enabled){const dom=new JSDOM('<title>GioLina Films</title><script id="gl-analytics-config" type="application/json">'+JSON.stringify({measurementId:'G-KD1ES061DH',enabled})+'</script><a href="/contact-us-2/">Inquire</a><input name="email" value="private@example.test">',{url,runScripts:'outside-only'});dom.window.eval(script);return dom;}
test('analytics does not load without production authorization',()=>{
 for(const [url,enabled] of [['https://giolinafilms.com/',false],['https://preview.test/',true],['https://giolinafilms.com/admin/',true],['http://giolinafilms.com/',true]]){const d=browser(url,enabled);assert.equal(d.window.dataLayer,undefined);assert.equal(d.window.document.querySelector('script[src]'),null);d.window.close();}
});
test('one sanitized page view and contact intent, no false lead or personal fields',()=>{
 const d=browser('https://giolinafilms.com/?email=private@example.test#secret',true),w=d.window;w.eval(script);
 w.document.querySelector('a').dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));
 const calls=w.dataLayer.map(a=>[...a]);assert.equal(calls.filter(a=>a[1]==='page_view').length,1);assert.equal(calls.filter(a=>a[1]==='contact_intent').length,1);assert(!/private@|secret|generate_lead|form_submit/.test(JSON.stringify(calls)));assert.equal(calls.find(a=>a[1]==='page_view')[2].page_location,'https://giolinafilms.com/');assert.equal(w.document.querySelectorAll('script[src]').length,1);d.window.close();
});
