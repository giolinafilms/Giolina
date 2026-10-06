const rate=(value,name)=>{if(!Number.isFinite(value)||value<0||value>100||Math.abs(value*100-Math.round(value*100))>1e-7)throw Error(name+' must be 0–100 percent, with at most two decimal places');return Math.round(value*100);};
// Basis points and integer arithmetic avoid floating-point drift, including large drafts.
const percentage=(cents,basisPoints)=>Number((BigInt(cents)*BigInt(basisPoints)+5000n)/10000n);
export function invoiceTotals(input){
 const subtotalCents=(input.lineItems||[]).reduce((sum,i)=>sum+i.quantity*i.unitPriceCents,0);
 if(!Number.isSafeInteger(subtotalCents)||subtotalCents<0)throw Error('Invoice subtotal is too large');
 const mode=input.discountMode||'fixed';if(!['fixed','percentage'].includes(mode))throw Error('Choose fixed or percentage discount');
 const discountCents=mode==='percentage'?percentage(subtotalCents,rate(input.discountPercent||0,'Discount')):(input.discountCents||0);
 if(!Number.isSafeInteger(discountCents)||discountCents<0||discountCents>subtotalCents)throw Error('Discount exceeds subtotal');
 const taxMode=input.taxMode||'amount';if(!['none','percentage','amount'].includes(taxMode))throw Error('Choose a tax mode');
 const taxCents=taxMode==='none'?0:taxMode==='percentage'?percentage(subtotalCents-discountCents,rate(input.taxRate||0,'Tax')):(input.taxCents||0);
 const amountCents=subtotalCents-discountCents+taxCents;if(!Number.isSafeInteger(taxCents)||taxCents<0||!Number.isSafeInteger(amountCents))throw Error('Invalid invoice tax or total');
 return {subtotalCents,discountCents,taxCents,amountCents};
}
