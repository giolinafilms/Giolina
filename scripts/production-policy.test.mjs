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
  const redirect=await mf.dispatchFetch('https://giolinafilms.com/contact-us/?x=1',{redirect:'manual'});assert.equal(redirect.status,301);assert(redirect.headers.get('Location').endsWith('/contact/?x=1'));
  const privateResponse=await mf.dispatchFetch('https://giolinafilms.com/admin/');assert.equal(privateResponse.status,503);assert.equal(privateResponse.headers.get('X-Robots-Tag'),'noindex, nofollow');assert(!(await privateResponse.text()).includes('/production-analytics.js'));
  for(const [flags,index,analytics] of [[{},false,false],[{GIOLINA_INDEXING_ENABLED:'true'},true,false],[{GIOLINA_ANALYTICS_ENABLED:'true'},false,true]]){
   await mf.setOptions(options(flags));const r=await mf.dispatchFetch('https://giolinafilms.com/'),body=await r.text();
   assert.equal(r.headers.get('X-Robots-Tag'),index?'index, follow':'noindex, nofollow');assert.equal(body.includes('content="index, follow"'),index);assert.equal(body.includes('/production-analytics.js'),analytics);
  }
 }finally{await mf.dispose();}
});
const script=readFileSync('public/production-analytics.js','utf8');
function browser(url,enabled){const dom=new JSDOM('<title>GioLina Films</title><script id="gl-analytics-config" type="application/json">'+JSON.stringify({measurementId:'G-KD1ES061DH',enabled,privacyApproved:true})+'</script><a href="/contact/">Inquire</a><footer></footer><input name="email" value="private@example.test">',{url,runScripts:'outside-only'});dom.window.localStorage.setItem('gl-analytics-consent',JSON.stringify({version:1,choice:'accepted',expires:Date.now()+100000}));dom.window.eval(readFileSync('public/analytics-consent.js','utf8'));dom.window.eval(script);return dom;}
test('analytics does not load without production authorization',()=>{
 for(const [url,enabled] of [['https://giolinafilms.com/',false],['https://preview.test/',true],['https://giolinafilms.com/admin/',true],['http://giolinafilms.com/',true]]){const d=browser(url,enabled);assert.equal(d.window.dataLayer,undefined);assert.equal(d.window.document.querySelector('script[src]'),null);d.window.close();}
});
test('one sanitized page view and contact intent, no false lead or personal fields',()=>{
 const d=browser('https://giolinafilms.com/?email=private@example.test#secret',true),w=d.window;w.eval(script);
 w.document.querySelector('a').dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));
 const calls=w.dataLayer.map(a=>[...a]);assert.equal(calls.filter(a=>a[1]==='page_view').length,1);assert.equal(calls.filter(a=>a[1]==='contact_intent').length,1);assert(!/private@|secret|generate_lead|form_submit/.test(JSON.stringify(calls)));assert.equal(calls.find(a=>a[1]==='page_view')[2].page_location,'https://giolinafilms.com/');assert.equal(w.document.querySelectorAll('script[src]').length,1);d.window.close();
});

test('clean public routes share the production and analytics allowlists; aliases stay closed',async()=>{
 const {mainPagePaths}=await import('../src/config/site.mjs');
 const flags={GIOLINA_INDEXING_ENABLED:'true',GIOLINA_ANALYTICS_ENABLED:'true'};
 for(const path of [...mainPagePaths,'/photography/wedding-collection/']){
  assert.deepEqual(productionPolicy(new URL('https://giolinafilms.com'+path),flags),{index:true,analytics:true});
  const dom=browser('https://giolinafilms.com'+path,true);assert.ok(dom.window.dataLayer,path);dom.window.close();
  assert.deepEqual(productionPolicy(new URL('https://prep-production-readiness-giolina.dawn-math-f4b1.workers.dev'+path),flags),{index:false,analytics:false});
 }
 for(const path of ['/portfolio/','/portfolio-2/','/experience-2/','/client-reviews/','/contact-us-2/','/contact-us/']){
  assert.deepEqual(productionPolicy(new URL('https://giolinafilms.com'+path),flags),{index:false,analytics:false});
  const dom=browser('https://giolinafilms.com'+path,true);assert.equal(dom.window.dataLayer,undefined);dom.window.close();
 }
});

test('production config enables only approved indexing and preserves unrelated variables',()=>{
 const config=JSON.parse(readFileSync('wrangler.jsonc','utf8'));
 assert.equal(config.name,'giolina');assert.equal(config.compatibility_date,'2026-09-30');
 for(const key of ['d1_databases','kv_namespaces','r2_buckets','routes','services'])assert.equal(config[key],undefined,key);
 assert.equal(config.assets.binding,'ASSETS');assert.equal(config.previews.vars.CRM_STAGE,'preview');assert.equal(config.previews.d1_databases.length,1);assert.equal(config.previews.d1_databases[0].binding,'CRM_DB'); // Do not duplicate internal configuration identifiers in tests.
 assert.equal(config.keep_vars,true);
 assert.deepEqual(config.vars,{GIOLINA_INDEXING_ENABLED:'true',GIOLINA_ANALYTICS_ENABLED:'false'});
});

test('deployed bindings activate only canonical public pages while preview, private and error responses stay protected',async()=>{
 const config=JSON.parse(readFileSync('wrangler.jsonc','utf8'));
 const {mainPagePaths}=await import('../src/config/site.mjs');
 const {default:redirects}=await import('../src/config/redirects.mjs');
 const bundle=await build({entryPoints:['worker.js'],bundle:true,write:false,format:'esm',platform:'browser',target:'es2022'});
 const html='<html><head><meta name="robots" content="noindex, nofollow"><script id="gl-analytics-config" type="application/json">{"measurementId":"G-KD1ES061DH","enabled":false}</script></head><body>Public page</body></html>';
 const mf=new Miniflare(convertV4MiniflareOptions({workers:[{name:'seo-activation-test',modules:true,script:bundle.outputFiles[0].text,compatibilityDate:'2026-09-25',bindings:config.vars,serviceBindings:{ASSETS:async r=>new Response(html,{status:new URL(r.url).searchParams.has('missing')?404:200,headers:{'Content-Type':'text/html'}})}}]}));
 try{
  for(const path of [...mainPagePaths,'/photography/wedding-collection/']){
   const res=await mf.dispatchFetch('https://giolinafilms.com'+path),body=await res.text();
   assert.equal(res.headers.get('X-Robots-Tag'),'index, follow',path);assert(body.includes('content="index, follow"'));assert(!body.includes('/production-analytics.js'));
   const preview=await mf.dispatchFetch('https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev'+path);
   assert.equal(preview.headers.get('X-Robots-Tag'),'noindex, nofollow');assert((await preview.text()).includes('content="noindex, nofollow"'));
  }
  for(const path of ['/admin/','/api/admin/','/login/','/qa/public-polish/','/not-a-real-page/','/?missing']){
   const res=await mf.dispatchFetch('https://giolinafilms.com'+path);assert.equal(res.headers.get('X-Robots-Tag'),'noindex, nofollow',path);assert(!(await res.text()).includes('/production-analytics.js'));
  }
  for(const path of ['/sitemap.xml','/video-sitemap.xml']){const res=await mf.dispatchFetch('https://giolinafilms.com'+path);assert.equal(res.headers.get('X-Robots-Tag'),'index, follow');}
  const robots=await mf.dispatchFetch('https://giolinafilms.com/robots.txt');const text=await robots.text();assert(text.includes('Allow: /'));assert(text.includes('Sitemap: https://giolinafilms.com/sitemap.xml'));assert(!text.includes('Disallow: /'));
  assert.equal(Object.keys(redirects).length,97);
  for(const [from,to] of Object.entries(redirects)){
   const res=await mf.dispatchFetch('https://giolinafilms.com'+from+'?keep=1',{redirect:'manual'});assert.equal(res.status,301,from);assert.equal(res.headers.get('Location'),'https://giolinafilms.com'+to+'?keep=1');
  }
 }finally{await mf.dispose();}
});
