import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {parseFeed,verifySelection} from './wedding-feed.mjs';
import {applyPolicy} from './collection-policy.mjs';
import {verifyStagedImage} from './staged-media.mjs';
const sources=JSON.parse(await readFile('src/content/wedding-collection-sources.json','utf8'));
const additions=JSON.parse(await readFile('src/content/wedding-collection-additions.json','utf8'));
// Fail closed rather than ship references to private derivatives that were not staged.
for(const photo of additions)for(const key of ['src','large']){
 if(photo[key].startsWith('/portfolio-media/'))verifyStagedImage(await readFile('public'+photo[key]),photo[key+'Hash']);
}
const withdrawals=JSON.parse(await readFile('src/content/portfolio-withdrawals.json','utf8'));
async function text(url){
 const u=new URL(url);if(u.protocol!=='https:'||u.hostname!=='clients.giolinafilms.com')throw Error('Unexpected portfolio feed origin');
 const r=await fetch(u,{signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error(`Portfolio source returned ${r.status}`);
 const body=await r.text();if(body.length>6000000)throw Error('Portfolio feed too large');return body;
}
// The optional local snapshot is private input, never a committed asset or a deployment dependency.
const snapshot=process.env.WEDDING_COLLECTION_SNAPSHOT?JSON.parse(await readFile(process.env.WEDDING_COLLECTION_SNAPSHOT,'utf8')):null;
const categories=[];
for(const source of sources){
 let photos=[];
 if(snapshot){
  const c=snapshot.categories.find(c=>c.category===source.name);
  photos=c.photos.map(p=>{
   const available=p.media.filter(m=>!/(?:\/Ti\/|\/Th\/)/.test(m.url));const choose=t=>[...available].sort((a,b)=>Math.abs(Math.max(+a.width,+a.height)-t)-Math.abs(Math.max(+b.width,+b.height)-t))[0];const small=choose(600),large=choose(1280);
   return {id:p.photoId,src:small.url,width:+small.width,height:+small.height,large:large.url,largeWidth:+large.width,largeHeight:+large.height};
  });
 }else{
  const dom=new JSDOM(await text(source.source));const feed=dom.window.document.querySelector('link[type="application/rss+xml"]')?.getAttribute('href');dom.window.close();if(!feed)throw Error('Portfolio RSS feed missing');
  let url=new URL(feed,source.source).href;const visited=new Set();
  while(url){if(visited.has(url)||visited.size>10)throw Error('Invalid feed pagination');visited.add(url);const page=parseFeed(await text(url));photos.push(...page.photos);url=page.next;}
 }
 // Verify the recovered source first, then apply explicit owner withdrawals.
 photos=verifySelection(photos,source.count,source.fingerprint).map((p,i)=>({...p,alt:`${source.name}, wedding portfolio photograph ${i+1}`}));
 const added=additions.filter(p=>p.category===source.slug).map(({category,srcHash,largeHash,...p})=>p);
 categories.push({slug:source.slug,name:source.name,originalCount:photos.length,addedCount:added.length,photos:[...photos,...added]});
 console.log(`${source.name}: ${photos.length} original + ${added.length} additions`);
}
const finalCategories=applyPolicy(categories,withdrawals);
await mkdir('src/generated',{recursive:true});await writeFile('src/generated/wedding-collection.json',JSON.stringify(finalCategories));
