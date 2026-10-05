import {catalogCategories} from './catalog.mjs';
export const lifecycle=['New Inquiry','Lead','Consultation','Proposal','Contract','Deposit / Payment Schedule','Booked','Pre-Event','Event','Post-Production','Delivery','Completed'];
export const eventTypes=['Wedding','Sweet Sixteen','Private Event','Corporate','Live Event','Other / Custom'];
export const definitions={
 contacts:{required:['name','email'],fields:{name:'text',email:'email',phone:'text',notes:'long',demo:'boolean',archived:'boolean'}},
 leads:{required:['name','contactId','eventType','status'],fields:{name:'text',contactId:'contact',eventType:'event',eventDate:'date',venue:'text',status:'status',followUpAt:'date',notes:'long',demo:'boolean',archived:'boolean'}},
 projects:{required:['name','contactId','eventType','status'],fields:{name:'text',contactId:'contact',eventType:'event',eventDate:'date',venue:'text',status:'status',packageId:'package',serviceIds:'array',priceCents:'money',notes:'long',deliveryUrl:'url',demo:'boolean',archived:'boolean'}},
 services:{required:['name'],fields:{name:'text',catalogCategory:'catalog-category',active:'boolean',clientDescription:'long',description:'long',inclusions:'long',addOns:'long',notes:'long',category:'text',priceCents:'money',currency:'text',coverageHours:'number',rules:'long',source:'long',sourcePages:'text',reviewRequired:'boolean',conflictGroup:'text',sourceName:'text',sourceDescription:'long',sourcePriceCents:'money',sourceCoverageHours:'number',sourceCategory:'text',archived:'boolean'}},
 packages:{required:['name','serviceIds'],fields:{name:'text',catalogCategory:'catalog-category',active:'boolean',description:'long',clientDescription:'long',notes:'long',serviceIds:'array',optionalServiceIds:'array',priceCents:'money',rules:'long',archived:'boolean'}},
 'appointment-types':{required:['name','durationMinutes'],fields:{name:'text',durationMinutes:'number',bufferMinutes:'number',description:'long',archived:'boolean'}},
 availability:{required:['name','dayOfWeek','startTime','endTime'],fields:{name:'text',dayOfWeek:'weekday',startTime:'time',endTime:'time',blockedDate:'date',notes:'long',archived:'boolean'}},
 appointments:{required:['name','contactId','appointmentTypeId','startAt','endAt'],fields:{name:'text',contactId:'contact',projectId:'project',appointmentTypeId:'appointment-type',startAt:'datetime',endAt:'datetime',status:'appointment-status',notes:'long',demo:'boolean'}},
 templates:{required:['name','subject','body'],fields:{name:'text',subject:'text',body:'long',archived:'boolean'}},
 tasks:{required:['name'],fields:{name:'text',projectId:'project',dueAt:'date',completed:'boolean',notes:'long',demo:'boolean'}},
 proposals:{required:['name','projectId'],fields:{name:'text',projectId:'project',packageId:'package',notes:'long',status:'text'}},
 contracts:{required:['name','projectId'],fields:{name:'text',projectId:'project',notes:'long',status:'text',externalProviderId:'text'}},
 invoices:{required:['name','projectId'],fields:{name:'text',projectId:'project',amountCents:'money',dueAt:'date',status:'text',notes:'long'}},
 messages:{required:['name','projectId'],fields:{name:'text',projectId:'project',subject:'text',body:'long',status:'text'}},
 files:{required:['name','projectId'],fields:{name:'text',projectId:'project',notes:'long',storageKey:'text'}},
 automations:{required:['name'],fields:{name:'text',trigger:'text',templateId:'text',notes:'long',enabled:'boolean'}}
};
export function validate(kind,input){
 const def=Object.hasOwn(definitions,kind)?definitions[kind]:null;if(!def)throw new Error('Unknown record type');
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Expected a record');
 const out={};for(const [key,value]of Object.entries(input)){
  const type=Object.hasOwn(def.fields,key)?def.fields[key]:null;if(!type)throw new Error('Unsupported field: '+key);
  if(value===null||value===''){out[key]=null;continue;}
  if(type==='boolean'){if(typeof value!=='boolean')throw new Error(key+' must be true/false');out[key]=value;continue;}
  if(type==='array'){if(!Array.isArray(value)||value.length>100||value.some(v=>typeof v!=='string'||v.length>160))throw new Error(key+' must contain record IDs');out[key]=value;continue;}
  if(type==='number'||type==='money'){if(typeof value!=='number'||!Number.isFinite(value)||value<0||(type==='money'&&!Number.isSafeInteger(value)))throw new Error(key+' must be a nonnegative '+(type==='money'?'amount in cents':'number'));out[key]=value;continue;}
  if(typeof value!=='string'||value.length>(type==='long'?20000:500))throw new Error('Invalid '+key);
  const s=value.trim();if(!s){out[key]=null;continue;}if(type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s))throw new Error('Invalid email');
  if(type==='url'){const u=new URL(s);if(u.protocol!=='https:')throw new Error('Delivery link must use HTTPS');}
  if(type==='catalog-category'&&!catalogCategories.includes(s))throw new Error('Invalid catalog category');
  if(type==='event'&&!eventTypes.includes(s))throw new Error('Invalid event type');
  if(type==='status'&&!lifecycle.includes(s))throw new Error('Invalid project stage');
  if(type==='appointment-status'&&!['Scheduled','Cancelled','Completed'].includes(s))throw new Error('Invalid appointment status');
  if(type==='weekday'&&!['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].includes(s))throw new Error('Invalid weekday');
  if(type==='date'&&(!/^\d{4}-\d{2}-\d{2}$/.test(s)||!Number.isFinite(Date.parse(s))||new Date(s).toISOString().slice(0,10)!==s))throw new Error('Invalid date');
  if(type==='time'&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(s))throw new Error('Invalid time');
  if(type==='datetime'&&(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(s)||!Number.isFinite(Date.parse(s))))throw new Error('Invalid appointment date');
  out[key]=s;
 }
 for(const key of def.required)if(out[key]===undefined||out[key]===null)throw new Error(key+' is required');
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
 return out;
}
