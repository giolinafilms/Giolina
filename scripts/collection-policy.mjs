import {createHash} from 'node:crypto';
export const photoHash=id=>createHash('sha256').update(id).digest('hex');
export function applyPolicy(input,policy){
 const blocked=new Set(policy.photoIdHashes);
 const categories=input.map(c=>({...c,photos:c.photos.filter(p=>!blocked.has(photoHash(p.id))).map(p=>({...p,_addition:p._addition??p.id.startsWith('recent-')}))}));
 for(const move of policy.moves||[]){
  const from=categories.find(c=>c.slug===move.from),to=categories.find(c=>c.slug===move.to);
  if(!from||!to)throw Error('Move category missing');
  const index=from.photos.findIndex(p=>photoHash(p.id)===move.photoIdHash);
  if(index<0)throw Error('Moved photograph missing');
  const [photo]=from.photos.splice(index,1);
  if(!to.photos.some(p=>p.id===photo.id))to.photos.push(photo);
 }
 for(const c of categories){
  const order=policy.order?.[c.slug];
  if(order){
   const lookup=new Map(c.photos.map(p=>[photoHash(p.id),p]));
   if(order.length!==c.photos.length||new Set(order).size!==order.length||order.some(id=>!lookup.has(id)))throw Error('Invalid exact-set category order');
   c.photos=order.map(id=>lookup.get(id));
  }
  c.addedCount=c.photos.filter(p=>p._addition).length;c.originalCount=c.photos.length-c.addedCount;
  c.photos=c.photos.map(({_addition,...p})=>p);
 }
 return categories;
}
