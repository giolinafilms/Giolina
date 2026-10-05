import {definitions,validate} from './model.mjs';
import {catalogRecord,catalogSeed,catalogCategories} from './catalog.mjs';
export function json(body,status=200){return new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff'}});}
export async function list(db,org,kind){const r=await db.prepare('SELECT id,data,version,created_at,updated_at FROM records WHERE organization_id=? AND kind=? ORDER BY updated_at DESC LIMIT 500').bind(org,kind).all();return r.results.map(r=>{const row={...JSON.parse(r.data),id:r.id,version:r.version,createdAt:r.created_at,updatedAt:r.updated_at};return kind==='services'?catalogRecord(row):row;});}
async function get(db,org,kind,id){const r=await db.prepare('SELECT * FROM records WHERE organization_id=? AND kind=? AND id=?').bind(org,kind,id).first();if(!r)return null;const row={...JSON.parse(r.data),id:r.id,version:r.version};return kind==='services'?catalogRecord(row):row;}
function audit(db,user,action,kind,id){return db.prepare('INSERT INTO audit_events VALUES(?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),user.organizationId,user.email,action,kind,id,new Date().toISOString(),JSON.stringify({}));}
function insert(db,org,kind,id,data){const now=new Date().toISOString();return db.prepare('INSERT INTO records(organization_id,kind,id,data,created_at,updated_at) VALUES(?,?,?,?,?,?)').bind(org,kind,id,JSON.stringify(data),now,now);}
async function references(db,org,data){for(const item of data.lineItems||[]){if(item.sourceKind!=='custom'&&!await get(db,org,item.sourceKind,item.sourceId))throw new Error('Proposal catalog item does not exist');}for(const [field,kind] of Object.entries({contactId:'contacts',projectId:'projects',packageId:'packages',appointmentTypeId:'appointment-types'})){if(data[field]&&!await get(db,org,kind,data[field]))throw new Error('Referenced '+kind+' record does not exist');}const contacts=[...new Set(data.additionalContactIds||[])];if(contacts.length){const result=await db.prepare("SELECT COUNT(*) AS count FROM records WHERE organization_id=? AND kind='contacts' AND id IN (SELECT value FROM json_each(?))").bind(org,JSON.stringify(contacts)).first();if(result.count!==contacts.length)throw new Error('Selected contact does not exist');}const ids=[...new Set([...(data.serviceIds||[]),...(data.optionalServiceIds||[])])];if(ids.length){const result=await db.prepare("SELECT COUNT(*) AS count FROM records WHERE organization_id=? AND kind='services' AND id IN (SELECT value FROM json_each(?))").bind(org,JSON.stringify(ids)).first();if(result.count!==ids.length)throw new Error('Selected service does not exist');}}
async function appointmentLocks(db,org,id,data){
 const statements=[db.prepare('DELETE FROM appointment_locks WHERE organization_id=? AND appointment_id=?').bind(org,id)];
 if(data.status==='Cancelled'||data.status==='Completed')return statements;
 const type=await get(db,org,'appointment-types',data.appointmentTypeId);const start=Date.parse(data.startAt),end=Date.parse(data.endAt),buffer=(type?.bufferMinutes||0)*60000;
 if(end-start>480*60000||end-start<5*60000)throw new Error('Appointments must last 5–480 minutes');
 const localDay=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(start));
 const availability=await list(db,org,'availability');if(availability.some(a=>a.blockedDate===localDay&&!a.archived))throw new Error('That date is blocked');
 const zone='America/New_York',weekday=new Intl.DateTimeFormat('en-US',{timeZone:zone,weekday:'long'}).format(new Date(start));const windows=availability.filter(a=>!a.archived&&!a.blockedDate);if(windows.length){const dateEnd=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(end));const clock=time=>new Intl.DateTimeFormat('en-GB',{timeZone:zone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(time));if(dateEnd!==localDay||!windows.some(a=>a.dayOfWeek===weekday&&a.startTime<=clock(start-buffer)&&a.endTime>=clock(end+buffer)))throw new Error('Appointment and buffer must fit configured availability hours');}
 const minutes=[];for(let slot=Math.floor((start-buffer)/60000);slot<Math.ceil((end+buffer)/60000);slot++)minutes.push(slot);
 statements.push(db.prepare('INSERT INTO appointment_locks(organization_id,minute,appointment_id) SELECT ?,value,? FROM json_each(?)').bind(org,id,JSON.stringify(minutes)));
 return statements;
}
export async function api(request,env,user,path){
 const db=env.CRM_DB,org=user.organizationId;
 if(!db)return json({error:'Private preview database is not connected. No records are stored.'},503);
 if(!['GET','POST','PUT'].includes(request.method))return json({error:'Method not allowed'},405);
 if(request.method!=='GET'){
  if(request.headers.get('Origin')!==new URL(request.url).origin||request.headers.get('X-GioLina-Request')!=='admin'||!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'Invalid request origin or content type'},403);
  if(Number(request.headers.get('Content-Length')||0)>65536)return json({error:'Request too large'},413);
 }
 if(path==='meta'&&request.method==='GET')return json({definitions,catalogCategories,timezone:'America/New_York',stage:'preview',email:user.email});
 if(path.split('?')[0]==='activity'&&request.method==='GET'){const project=new URL(request.url).searchParams.get('project');if(project){if(!await get(db,org,'projects',project))return json({error:'Project not found'},404);const r=await db.prepare("SELECT action,record_kind,record_id,occurred_at FROM audit_events WHERE organization_id=? AND (record_id=? OR record_id IN (SELECT id FROM records WHERE organization_id=? AND json_extract(data,'$.projectId')=?)) ORDER BY occurred_at ASC LIMIT 500").bind(org,project,org,project).all();return json(r.results);}const r=await db.prepare('SELECT action,record_kind,record_id,occurred_at FROM audit_events WHERE organization_id=? ORDER BY occurred_at DESC LIMIT 50').bind(org).all();return json(r.results);}
 if(path==='seed'&&request.method==='POST'){
  if(await db.prepare("SELECT value FROM migration_state WHERE key='catalog-v1'").first())return json({message:'Catalog already imported; existing edits preserved.'});
  const now=new Date().toISOString();
  const operations=[db.prepare("INSERT INTO records(organization_id,kind,id,data,created_at,updated_at) SELECT ?,'services',json_extract(value,'$.id'),json_remove(value,'$.id'),?,? FROM json_each(?)").bind(org,now,now,JSON.stringify(catalogSeed))];
  operations.push(db.prepare("INSERT INTO migration_state VALUES('catalog-v1','imported')"),audit(db,user,'seed-services','services','catalog-v1'));await db.batch(operations);return json({message:'Imported '+catalogSeed.length+' source-backed service versions.'},201);
 }
 if(path==='setup-appointment-types'&&request.method==='POST'){
  const names=['Wedding Consultation','Sweet Sixteen Consultation','General Consultation','Client Meeting','Production Meeting','Custom'];const now=new Date().toISOString();const defaults=names.map((name,i)=>({id:'default-appointment-'+i,name,durationMinutes:30,bufferMinutes:0,description:'Editable private scheduler default; confirm duration and buffers before use.'}));await db.batch([db.prepare("INSERT OR IGNORE INTO records(organization_id,kind,id,data,created_at,updated_at) SELECT ?,'appointment-types',json_extract(value,'$.id'),json_remove(value,'$.id'),?,? FROM json_each(?)").bind(org,now,now,JSON.stringify(defaults)),audit(db,user,'setup-types','appointment-types','defaults')]);return json({message:'Appointment types ready. Existing edits preserved.'});
 }
 const [kind,id,action]=path.split('/');if(!Object.hasOwn(definitions,kind))return json({error:'Not found'},404);
 if(request.method==='GET'){if(id){const record=await get(db,org,kind,id);return json(record||{error:'Not found'},record?200:404);}return json(await list(db,org,kind));}
 const text=await request.text();if(text.length>65536)return json({error:'Request too large'},413);let input;try{input=JSON.parse(text)}catch{return json({error:'Invalid JSON'},400);}
 if(kind==='leads'&&id&&action==='convert'&&request.method==='POST'){
  const lead=await get(db,org,'leads',id);if(!lead)return json({error:'Lead not found'},404);if(lead.archived)return json({error:'This lead was already archived or converted'},409);
  const projectId=crypto.randomUUID();let contactId=lead.contactId;let contactData=null;
  if(contactId&&!await get(db,org,'contacts',contactId))return json({error:'Contact no longer exists'},400);
  if(!contactId){const matched=(await list(db,org,'contacts')).find(c=>!c.archived&&c.email?.toLowerCase()===lead.email?.toLowerCase());contactId=matched?.id||crypto.randomUUID();if(!matched)contactData=validate('contacts',{name:[lead.firstName,lead.lastName].filter(Boolean).join(' ')||lead.name,firstName:lead.firstName||null,lastName:lead.lastName||null,partnerName:lead.partnerName||null,email:lead.email,phone:lead.phone||null,leadSource:lead.leadSource||null,notes:lead.message||lead.notes||null,demo:!!lead.demo});}
  const data=validate('projects',{name:lead.name,contactId,eventType:lead.eventType,eventDate:lead.eventDate||null,venue:lead.venue||null,location:lead.location||null,status:'Consultation',serviceIds:lead.serviceIds||[],notes:[lead.location,lead.message,lead.notes,lead.leadSource?'Lead source: '+lead.leadSource:null].filter(Boolean).join('\n')||null,demo:!!lead.demo});
  const update=db.prepare("UPDATE records SET data=json_set(data,'$.archived',json('true')),version=version+1,updated_at=? WHERE organization_id=? AND kind='leads' AND id=? AND version=?").bind(new Date().toISOString(),org,id,input.version);
  // A failed optimistic update aborts via the CHECK constraint rather than duplicating a project.
  try{await db.batch([db.prepare("INSERT INTO write_guards(token,valid) SELECT ?,COUNT(*) FROM records WHERE organization_id=? AND kind='leads' AND id=? AND version=?").bind(projectId,org,id,input.version),...(contactData?[insert(db,org,'contacts',contactId,contactData),audit(db,user,'created-from-lead','contacts',contactId)]:[]),insert(db,org,'projects',projectId,data),update,audit(db,user,'lead-converted','projects',projectId),db.prepare('DELETE FROM write_guards WHERE token=?').bind(projectId)]);return json({id:projectId,contactId},201);}catch{return json({error:'Lead changed. Reload before converting.'},409);}
 }
 let data;try{data=validate(kind,input.data);if(kind==='services'&&id){const {id:sourceId,...stamped}=catalogRecord({...data,id});data=stamped;}await references(db,org,data)}catch(e){return json({error:e.message},400);}
 if((id&&request.method!=='PUT')||(!id&&request.method!=='POST')||action)return json({error:'Unsupported record action'},405);
 const recordId=id||crypto.randomUUID();
 try{
  let operations=[];
  if(id){const current=await get(db,org,kind,id);if(!current)return json({error:'Not found'},404);if(current.version!==input.version)return json({error:'Record changed. Reload before saving.'},409);
   const guard=crypto.randomUUID();
   operations.push(db.prepare('INSERT INTO write_guards(token,valid) SELECT ?,COUNT(*) FROM records WHERE organization_id=? AND kind=? AND id=? AND version=?').bind(guard,org,kind,id,input.version));
   operations.push(db.prepare('DELETE FROM write_guards WHERE token=?').bind(guard));
   operations.push(db.prepare('UPDATE records SET data=?,version=version+1,updated_at=? WHERE organization_id=? AND kind=? AND id=? AND version=?').bind(JSON.stringify(data),new Date().toISOString(),org,kind,id,input.version));
  }else operations.push(insert(db,org,kind,recordId,data));
  if(kind==='appointments')operations.push(...await appointmentLocks(db,org,recordId,data));
  operations.push(audit(db,user,id?'updated':'created',kind,recordId));await db.batch(operations);
  return json(await get(db,org,kind,recordId),id?200:201);
 }catch(e){return json({error:/UNIQUE|CHECK/.test(e.message)?'Record conflict or appointment already reserved. Reload and try another time.':'Save failed; no change was committed.'},409);}
}
