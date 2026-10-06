import {invoiceTotals} from './invoice-math.mjs';
import {presentationFields,validImage,filmEmbed} from './presentation.mjs';
import {templateCategories} from './templates.mjs';
import {catalogCategories} from './catalog.mjs';
export {projectStages as lifecycle} from './workflow.mjs';
import {projectStages as lifecycle,businessLifecycle} from './workflow.mjs';
export const leadStages=['New','Contacted','Consultation Scheduled','Proposal Needed','Proposal Sent','Follow-Up','Booked','Lost / Declined'];
export const eventTypes=['Wedding','Sweet Sixteen','Private Event','Corporate','Live Event','Other / Custom'];
export const definitions={
 contacts:{required:['name','email'],fields:{name:'text',firstName:'text',lastName:'text',partnerName:'text',email:'email',phone:'text',address:'long',preferredContactMethod:'contact-method',leadSource:'text',importantDates:'long',notes:'long',demo:'boolean',archived:'boolean'}},
 leads:{required:['name','eventType','status'],fields:{name:'text',firstName:'text',lastName:'text',partnerName:'text',email:'email',phone:'text',contactId:'contact',eventType:'event',eventDate:'date',venue:'text',location:'long',serviceIds:'array',leadSource:'text',tags:'text',inquiryDate:'date',projectId:'project',message:'long',lifecycle:'workflow-state',status:'lead-status',followUpAt:'date',assignedFollowUp:'text',notes:'long',demo:'boolean',archived:'boolean'}},
 projects:{required:['name','contactId','eventType','status'],fields:{name:'text',contactId:'contact',additionalContactIds:'contact-array',coverImage:'image',leadSource:'text',tags:'text',eventType:'event',eventDate:'date',venue:'text',location:'long',lifecycle:'workflow-state',status:'status',packageId:'package',serviceIds:'array',priceCents:'money',paymentNotes:'long',proposalStatus:'text',contractStatus:'text',importantDates:'long',nextSteps:'long',notes:'long',deliveryUrl:'url',demo:'boolean',archived:'boolean'}},
 services:{required:['name'],fields:{name:'text',catalogCategory:'catalog-category',active:'boolean',clientDescription:'long',description:'long',inclusions:'long',addOns:'long',notes:'long',category:'text',priceCents:'money',currency:'text',coverageHours:'number',rules:'long',source:'long',sourcePages:'text',reviewRequired:'boolean',conflictGroup:'text',sourceName:'text',sourceDescription:'long',sourcePriceCents:'money',sourceCoverageHours:'number',sourceCategory:'text',...presentationFields,archived:'boolean'}},
 packages:{required:['name','serviceIds'],fields:{name:'text',catalogCategory:'catalog-category',active:'boolean',sortOrder:'number',description:'long',clientDescription:'long',notes:'long',serviceIds:'array',optionalServiceIds:'array',priceCents:'money',rules:'long',...presentationFields,archived:'boolean'}},
 'appointment-types':{required:['name','durationMinutes'],fields:{name:'text',durationMinutes:'number',bufferMinutes:'number',description:'long',location:'text',callType:'text',confirmationEnabled:'boolean',reminderHours:'number',schedulingUrl:'url',archived:'boolean'}},
 availability:{required:['name','dayOfWeek','startTime','endTime'],fields:{name:'text',dayOfWeek:'weekday',startTime:'time',endTime:'time',blockedDate:'date',notes:'long',archived:'boolean'}},
 appointments:{required:['name','contactId','appointmentTypeId','startAt','endAt'],fields:{name:'text',contactId:'contact',projectId:'project',appointmentTypeId:'appointment-type',location:'text',callType:'text',confirmationEnabled:'boolean',reminderHours:'number',startAt:'datetime',endAt:'datetime',status:'appointment-status',notes:'long',demo:'boolean'}},
 templates:{required:['name','subject','body'],fields:{name:'text',category:'template-category',subject:'text',body:'long',templateType:'text',requiredMergeFields:'long',signatureFields:'long',archived:'boolean'}},
 tasks:{required:['name'],fields:{name:'text',projectId:'project',dueAt:'date',completed:'boolean',notes:'long',demo:'boolean'}},
 proposals:{required:['name','lineItems'],fields:{name:'text',projectId:'project',contactId:'contact',leadId:'lead',templateId:'package',clientSelection:'boolean',eventType:'event',clientNames:'text',eventDate:'date',venue:'text',heroImage:'image',introduction:'long',sectionOrder:'section-order',demo:'boolean',lineItems:'line-items',discountCents:'money',notes:'long',status:'proposal-status',archived:'boolean'}},
 contracts:{required:['name','projectId'],fields:{contractTemplateId:'text',body:'long',requiredMergeFields:'long',signatureFields:'long',reviewState:'text',name:'text',contactId:'contact',projectId:'project',packageId:'package',serviceIds:'array',priceCents:'money',paymentSchedule:'schedule',notes:'long',status:'text',signatureStatus:'signature-status',externalProviderId:'text',archived:'boolean'}},
 invoices:{required:['name','projectId','amountCents'],fields:{discountMode:'text',discountPercent:'number',taxMode:'text',taxRate:'number',scheduleComplete:'boolean',name:'text',contactId:'contact',projectId:'project',issueAt:'date',lineItems:'line-items',discountCents:'money',taxCents:'money',amountCents:'money',depositCents:'money',installments:'schedule',paymentHistory:'payment-history',dueAt:'date',status:'text',notes:'long',archived:'boolean'}},
 messages:{required:['name','projectId'],fields:{to:'email',includeSignature:'boolean',signature:'long',documentKind:'text',documentId:'text',documentRevision:'number',name:'text',projectId:'project',subject:'text',body:'long',status:'text'}},
 files:{required:['name','projectId'],fields:{clientVisible:'boolean',clientUrl:'url',name:'text',projectId:'project',notes:'long',storageKey:'text'}},
 automations:{required:['name'],fields:{name:'text',trigger:'text',templateId:'text',notes:'long',enabled:'boolean'}}
};
export function validate(kind,input){
 const def=Object.hasOwn(definitions,kind)?definitions[kind]:null;if(!def)throw new Error('Unknown record type');
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Expected a record');
 const out={};for(const [key,value]of Object.entries(input)){
  const type=Object.hasOwn(def.fields,key)?def.fields[key]:null;if(!type)throw new Error('Unsupported field: '+key);
  if(value===null||value===''){out[key]=null;continue;}
  if(type==='boolean'){if(typeof value!=='boolean')throw new Error(key+' must be true/false');out[key]=value;continue;}
  if(type==='image-list'){if(!Array.isArray(value)||value.length>8||!value.every(validImage))throw new Error('Use up to eight local portfolio image paths');out[key]=value;continue;}
  if(type==='section-order'){if(!Array.isArray(value)||value.length!==3||new Set(value).size!==3||value.some(v=>!['introduction','services','investment'].includes(v)))throw new Error('Invalid proposal sections');out[key]=value;continue;}
  if(type==='schedule'||type==='payment-history'){out[key]=validateFinancialRows(value,type);continue;}
  if(type==='line-items'){out[key]=kind==='invoices'&&Array.isArray(value)&&value.length===0?[]:validateLineItems(value);continue;}
  if(type==='array'||type==='contact-array'){if(!Array.isArray(value)||value.length>100||value.some(v=>typeof v!=='string'||v.length>160))throw new Error(key+' must contain record IDs');out[key]=value;continue;}
  if(type==='number'||type==='money'){if(typeof value!=='number'||!Number.isFinite(value)||value<0||(type==='money'&&!Number.isSafeInteger(value)))throw new Error(key+' must be a nonnegative '+(type==='money'?'amount in cents':'number'));out[key]=value;continue;}
  if(typeof value!=='string'||value.length>(type==='long'?20000:500))throw new Error('Invalid '+key);
  const s=value.trim();if(type==='image'&&!validImage(s))throw new Error('Choose a local /assets/ image path');if(type==='film-url'&&!filmEmbed(s))throw new Error('Use a Vimeo or MediaZilla film URL');if(type==='treatment'&&!['pale-blue','warm-neutral','white'].includes(s))throw new Error('Use pale-blue, warm-neutral or white');if(!s){out[key]=null;continue;}if(type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s))throw new Error('Invalid email');
  if(type==='url'){const u=new URL(s);if(u.protocol!=='https:')throw new Error('Delivery link must use HTTPS');}
  if(type==='contact-method'&&!['Email','Phone','Text','Other'].includes(s))throw new Error('Invalid preferred contact method');
  if(type==='catalog-category'&&!catalogCategories.includes(s))throw new Error('Invalid catalog category');
  if(type==='event'&&!eventTypes.includes(s))throw new Error('Invalid event type');
  if(type==='signature-status'&&!['Not requested','Provider selection pending'].includes(s))throw new Error('Signature provider is not active');
  if(type==='template-category'&&!templateCategories.includes(s))throw new Error('Invalid template category');
  if(type==='proposal-status'&&!['Draft','Ready for review','Accepted (test only)','Declined','Expired'].includes(s))throw new Error('Invalid proposal status');
  if(type==='lead-status'&&![...leadStages,...lifecycle].includes(s))throw new Error('Invalid lead stage');
  if(type==='workflow-state'&&!businessLifecycle.includes(s))throw new Error('Invalid lifecycle');
  if(type==='status'&&!lifecycle.includes(s))throw new Error('Invalid project stage');
  if(type==='appointment-status'&&!['Scheduled','Cancelled','Completed'].includes(s))throw new Error('Invalid appointment status');
  if(type==='weekday'&&!['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].includes(s))throw new Error('Invalid weekday');
  if(type==='date'&&(!/^\d{4}-\d{2}-\d{2}$/.test(s)||!Number.isFinite(Date.parse(s))||new Date(s).toISOString().slice(0,10)!==s))throw new Error('Invalid date');
  if(type==='time'&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(s))throw new Error('Invalid time');
  if(type==='datetime'&&(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(s)||!Number.isFinite(Date.parse(s))))throw new Error('Invalid appointment date');
  out[key]=s;
 }
 if(kind==='invoices'&&out.lineItems?.length){if(out.lineItems.some(i=>i.optional||i.selectionGroup))throw new Error('Invoice lines cannot be optional');Object.assign(out,invoiceTotals(out));}else if(kind==='invoices'&&((out.discountCents||0)||(out.taxCents||0)||(out.discountPercent||0)||(out.taxRate||0)))throw new Error('Add invoice lines before using discounts or tax');
 for(const key of def.required)if(out[key]===undefined||out[key]===null)throw new Error(key+' is required');
 if(kind==='templates'&&out.templateType&&!['email','contract'].includes(out.templateType))throw Error('Invalid template type');
 if(kind==='contracts'&&out.reviewState&&!['Draft','Sent','Viewed','Signed'].includes(out.reviewState))throw Error('Invalid simulated contract state');
 if(['appointments','appointment-types'].includes(kind)&&out.reminderHours!=null&&(!Number.isInteger(out.reminderHours)||out.reminderHours>720))throw Error('Reminder must be 0–720 hours');
 if(kind==='invoices'&&out.scheduleComplete&&(out.installments||[]).reduce((sum,r)=>sum+r.amountCents,0)!==out.amountCents)throw Error('Completed payment schedule must equal invoice total');
 if(kind==='contracts'&&(out.paymentSchedule||[]).reduce((sum,r)=>sum+r.amountCents,0)>(out.priceCents??0))throw new Error('Payment schedule exceeds confirmed contract price');
 if(kind==='invoices'){const paidCents=(out.paymentHistory||[]).reduce((sum,r)=>sum+r.amountCents,0);if(!Number.isSafeInteger(paidCents)||paidCents>out.amountCents||(out.depositCents||0)>out.amountCents||(out.installments||[]).reduce((sum,r)=>sum+r.amountCents,0)>out.amountCents)throw new Error('Payment records exceed the planned total');out.paidCents=paidCents;out.remainingCents=out.amountCents-paidCents;out.paymentState=paidCents===out.amountCents?'Manually recorded as paid':paidCents?'Partial manual payment':'Planned / unpaid';}
 if(kind==='proposals'){if(!out.projectId&&!out.contactId&&!out.leadId)throw new Error('Select a client, lead or project');if(out.clientSelection&&!out.demo)throw new Error('Client selection is DEMO-only');if(out.status==='Accepted (test only)'&&!out.demo)throw new Error('Acceptance is test-only');const totals=proposalTotals(out.lineItems,out.discountCents||0);out.subtotalCents=totals.subtotalCents;out.totalCents=totals.totalCents;}
 if(['leads','projects'].includes(kind)&&out.lifecycle==='Archived')out.archived=true;
 if(kind==='leads'&&!out.contactId&&!out.email)throw new Error('Email or existing contact is required');
 if(kind==='packages'&&(!out.serviceIds?.length||new Set(out.serviceIds).size!==out.serviceIds.length))throw new Error('Choose at least one included service without duplicates');
 if(kind==='packages'&&(out.optionalServiceIds||[]).some(id=>out.serviceIds.includes(id)))throw new Error('A service cannot be included and optional at the same time');
 if(['services','packages'].includes(kind)&&out.active==null)out.active=true;
 if(kind==='appointment-types'&&out.bufferMinutes!=null&&(!Number.isInteger(out.bufferMinutes)||out.bufferMinutes>240))throw new Error('Buffer must be 0–240 whole minutes');
 if(kind==='appointment-types'&&(out.durationMinutes<5||out.durationMinutes>480||!Number.isInteger(out.durationMinutes)))throw new Error('Duration must be 5–480 minutes');
 if(kind==='appointments'&&!out.status)out.status='Scheduled';
 if(kind==='appointments'&&Date.parse(out.endAt)<=Date.parse(out.startAt))throw new Error('Appointment end must follow start');
 if(kind==='availability'&&out.startTime>=out.endTime)throw new Error('Available hours must end after they start');
 if(kind==='automations'&&out.enabled)throw new Error('Automation delivery is disabled in Phase 1');
 if(kind==='messages'&&out.status&&out.status!=='Draft')throw new Error('Messages can only be saved as drafts');
 if(kind==='contracts'&&out.status&&out.status!=='Draft')throw new Error('Legally binding signing is not enabled');
 if(kind==='invoices'&&out.status&&out.status!=='Draft')throw new Error('Live payment processing is not enabled');
 if(kind==='invoices')out.status='Draft';
 return out;
}

export function validateLineItems(items){
 if(!Array.isArray(items)||!items.length||items.length>100)throw new Error('Choose 1–100 proposal line items');
 return items.map(item=>{if(!item||typeof item!=='object'||Array.isArray(item)||Object.keys(item).some(k=>!['name','description','quantity','unitPriceCents','sourceKind','sourceId','optional','selectionGroup','selectionGroupOptional','allowedPackageIds'].includes(k)))throw new Error('Invalid proposal line item');const {name,description='',quantity,unitPriceCents,sourceKind='custom',sourceId=null}=item;if(typeof name!=='string'||!name.trim()||name.length>500||typeof description!=='string'||description.length>20000)throw new Error('Line item needs a name and valid description');if(!Number.isInteger(quantity)||quantity<1||quantity>1000||!Number.isSafeInteger(unitPriceCents)||unitPriceCents<0)throw new Error('Line item quantity and confirmed price are required');if(!['services','packages','custom'].includes(sourceKind)||sourceKind!=='custom'&&(typeof sourceId!=='string'||!sourceId||sourceId.length>160))throw new Error('Invalid catalog reference');if(item.optional!=null&&typeof item.optional!=='boolean')throw new Error('Invalid optional item');if(item.selectionGroup!=null&&(typeof item.selectionGroup!=='string'||item.selectionGroup.length>80))throw new Error('Invalid package choice group');if(item.allowedPackageIds!=null&&(!item.optional||!Array.isArray(item.allowedPackageIds)||item.allowedPackageIds.length>8||item.allowedPackageIds.some(id=>typeof id!=='string'||id.length>160)))throw new Error('Invalid add-on package restrictions');if(item.selectionGroupOptional!=null&&(typeof item.selectionGroupOptional!=='boolean'||!item.selectionGroup))throw new Error('Optional group requires a choice group');if(item.selectionGroup&&item.optional)throw new Error('Package choices and optional add-ons are separate');return {name:name.trim(),description,quantity,unitPriceCents,...(item.selectionGroup?.trim()?{selectionGroup:item.selectionGroup.trim(),selectionGroupOptional:!!item.selectionGroupOptional}:{}),...(item.optional?{optional:true}:{}),...(item.allowedPackageIds?{allowedPackageIds:item.allowedPackageIds}:{}),sourceKind,sourceId:sourceKind==='custom'?null:sourceId};});
}
export function proposalTotals(items,discountCents=0){const groups=new Set();const subtotalCents=items.reduce((sum,item)=>{if(item.optional)return sum;if(item.selectionGroup){if(groups.has(item.selectionGroup))return sum;groups.add(item.selectionGroup);}return sum+item.quantity*item.unitPriceCents;},0);if(!Number.isSafeInteger(subtotalCents)||!Number.isSafeInteger(discountCents)||discountCents<0||discountCents>subtotalCents)throw new Error('Discount must be between zero and the subtotal');return {subtotalCents,totalCents:subtotalCents-discountCents};}

function validateFinancialRows(rows,type){if(!Array.isArray(rows)||rows.length>100)throw new Error('Expected at most 100 payment rows');return rows.map(r=>{if(!r||typeof r!=='object'||Array.isArray(r)||Object.keys(r).some(k=>!(type==='schedule'?['label','dueAt','amountCents']:['date','amountCents','reference']).includes(k)))throw new Error('Invalid payment row');const date=type==='schedule'?r.dueAt:r.date;if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date||!Number.isSafeInteger(r.amountCents)||r.amountCents<0)throw new Error('Payment rows need a valid date and amount');const text=type==='schedule'?r.label:r.reference||'';if(typeof text!=='string'||text.length>500||type==='schedule'&&!text.trim())throw new Error('Invalid payment label/reference');return type==='schedule'?{label:text.trim(),dueAt:date,amountCents:r.amountCents}:{date,amountCents:r.amountCents,reference:text.trim()};});}
