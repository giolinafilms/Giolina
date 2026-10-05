// Browser supplies indices only. Names, quantities, prices and discounts come from
// the fixed published snapshot; this never creates a booking or invoice.
export function selectionTotals(snapshot,selected){
 if(!snapshot.clientSelection)throw new Error('Client selection is not enabled');
 if(!Array.isArray(selected)||selected.length>100||selected.some(i=>!Number.isInteger(i)||i<0||i>=snapshot.items.length)||new Set(selected).size!==selected.length)throw new Error('Invalid offered-item selection');
 const chosen=new Set(selected),groups=new Map();let subtotalCents=0;
 snapshot.items.forEach((item,i)=>{
  if(item.selectionGroup){const group=groups.get(item.selectionGroup)||{count:0,required:false};group.count+=chosen.has(i)?1:0;group.required||=!item.selectionGroupOptional;groups.set(item.selectionGroup,group);}
  if(!item.optional&&!item.selectionGroup&&!chosen.has(i))throw new Error('Included services cannot be removed');
  if(chosen.has(i)&&item.allowedChoices&&!item.allowedChoices.some(n=>chosen.has(n)))throw new Error('This add-on is unavailable for the chosen package');
  if(chosen.has(i))subtotalCents+=item.quantity*item.unitPriceCents;
 });
 if([...groups.values()].some(g=>g.count>1||g.required&&g.count!==1))throw new Error('Choose one offering in required groups, and at most one in optional groups');
 const discountCents=snapshot.discountCents||0;
 if(!Number.isSafeInteger(subtotalCents)||!Number.isSafeInteger(discountCents)||discountCents<0||discountCents>subtotalCents)throw new Error('Selection does not support this discount');
 return {selected,subtotalCents,discountCents,totalCents:subtotalCents-discountCents,summary:snapshot.items.filter((_,i)=>chosen.has(i)).map(i=>({name:i.name,quantity:i.quantity,amountCents:i.quantity*i.unitPriceCents}))};
}
export function defaultSelection(items){const groups=new Set();return items.flatMap((item,i)=>{if(item.selectionGroup){if(groups.has(item.selectionGroup))return [];groups.add(item.selectionGroup);return [i];}return item.optional?[]:[i];});}
