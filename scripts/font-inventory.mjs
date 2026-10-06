import fs from 'node:fs';
import path from 'node:path';
import {JSDOM} from 'jsdom';
import redirects from '../src/config/redirects.mjs';
const pages=fs.readdirSync('src/content/pages').filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync('src/content/pages/'+f)));
const typography=/^(font($|-)|line-height$|letter-spacing$|text-transform$)/;
const rows=[],faces=[],sources=new Map();
for(const page of pages){
 const html=fs.readFileSync(path.join('dist',page.path,'index.html'),'utf8'); const dom=new JSDOM(html),doc=dom.window.document;
 const loaded=new Set();
 function sheet(url){
  if(loaded.has(url)||!url.startsWith('/')||!fs.existsSync('public'+url))return;loaded.add(url);
  const css=fs.readFileSync('public'+url,'utf8');for(const m of css.matchAll(/@font-face\s*\{([^}]+)\}/g)){const values={};for(const item of m[1].split(';')){const at=item.indexOf(':');if(at>0)values[item.slice(0,at).trim()]=item.slice(at+1).trim();}faces.push({page:page.path,source:url,...values});}const style=doc.createElement('style');style.textContent=css;doc.head.append(style);
  function walk(rules,condition='all') {for(const rule of rules||[]){
   if(rule.href){const target=rule.href.startsWith('/')?rule.href:path.posix.resolve(path.posix.dirname(url),rule.href);sheet(target);}
   if(rule.cssRules)walk(rule.cssRules,[condition,rule.conditionText||''].filter(Boolean).join(' / '));
   if(!rule.style)continue;
   const values={};for(let i=0;i<rule.style.length;i++){const k=rule.style[i];if(typography.test(k)||k==='src')values[k]=rule.style.getPropertyValue(k)+(rule.style.getPropertyPriority(k)?' !important':'');}
   if(!Object.keys(values).length)continue;
   if(rule.type===5)continue;
   if(!rule.selectorText)continue;
   let els=[];try{els=[...doc.querySelectorAll(rule.selectorText)].filter(e=>!['STYLE','SCRIPT','LINK'].includes(e.tagName));}catch{}
   if(els.length)rows.push({page:page.path,redirect:redirects[page.path]||null,source:url,selector:rule.selectorText,condition,values,sections:[...new Set(els.map(e=>(e.closest('section,article,header,footer,nav')?.getAttribute('aria-label')||e.closest('section,article')?.querySelector('h1,h2,h3')?.textContent||e.closest('header,footer,nav')?.tagName||'Page').trim()))],examples:[...new Set(els.map(e=>e.textContent.replace(/\s+/g,' ').trim().slice(0,100)).filter(Boolean))].slice(0,8)});
  }}
  walk(style.sheet?.cssRules);
 }
 for(const link of doc.querySelectorAll('link[rel="stylesheet"]'))sheet(link.getAttribute('href'));
 sources.set(page.path,[...loaded]);dom.window.close();
}
const result={generatedAt:new Date().toISOString(),basis:'CSS declaration inventory; includes overridden rules. Runtime report supplies computed winners at each viewport. Redirected legacy routes are separately identified.',pages:pages.map(p=>({path:p.path,title:p.title,redirect:redirects[p.path]||null,stylesheets:sources.get(p.path)})),faces,rows};
fs.writeFileSync('public/qa/font-inventory/inventory.json',JSON.stringify(result,null,2)+'\n');
console.log(`${pages.length} page sources; ${rows.length} matching typography rules; ${faces.length} page/font-face registrations`);
