import {createHash} from 'node:crypto';
import {JSDOM} from 'jsdom';
export const fingerprint=ids=>createHash('sha256').update(ids.join('\n')).digest('hex');
export function verifySelection(photos,count,expected){
 const unique=[...new Map(photos.map(p=>[p.id,p])).values()];
 if(unique.length!==count||fingerprint(unique.map(p=>p.id))!==expected)throw Error('Original portfolio selection changed or incomplete; refusing to publish');
 return unique;
}
export function parseFeed(xml){
 let dom;try{dom=new JSDOM(xml,{contentType:'text/xml'});}catch{throw Error('Invalid image feed');}
 const doc=dom.window.document;
 if(!doc.querySelector('rss > channel')){dom.window.close();throw Error('Invalid image feed');}
 const photos=[...doc.querySelectorAll('item')].map(item=>{
  const id=item.querySelector('link')?.textContent.match(/\/i-([^/]+)/)?.[1];
  const sizes=[...item.getElementsByTagNameNS('http://search.yahoo.com/mrss/','content')].map(e=>({src:e.getAttribute('url'),width:Number(e.getAttribute('width')),height:Number(e.getAttribute('height')),type:e.getAttribute('type')})).filter(m=>m.type?.startsWith('image/')&&m.width>0&&m.height>0&&/^https:\/\/(?:clients\.giolinafilms\.com|[^/]*smugmug\.com)\//.test(m.src));
  if(!id||!sizes.length)throw Error('Image feed record missing usable media');
  // Use published web derivatives, never construct image paths or request originals.
  const natural=sizes.filter(s=>!/(?:\/Ti\/|\/Th\/)/.test(s.src));
  if(!natural.length)throw Error('Image feed supplies thumbnails only');
  const choose=target=>[...natural].sort((a,b)=>Math.abs(Math.max(a.width,a.height)-target)-Math.abs(Math.max(b.width,b.height)-target))[0];
  const small=choose(600),large=choose(1280);
  return {id,src:small.src,width:small.width,height:small.height,large:large.src,largeWidth:large.width,largeHeight:large.height};
 });
 const next=[...doc.getElementsByTagNameNS('http://www.w3.org/2005/Atom','link')].find(e=>e.getAttribute('rel')==='next')?.getAttribute('href')||null;
 dom.window.close();return {photos,next};
}
