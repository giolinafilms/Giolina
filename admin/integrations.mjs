// Readiness only: no network client, credentials, delivery or legal/payment mutation.
export const healthStates=['NOT CONFIGURED','CONNECTED','ACTION REQUIRED','ERROR','DISABLED'];
export const integrations=[
 {id:'email',name:'Google Workspace email',operations:['send'],requirements:'OAuth authorization, verified callback, encrypted refresh-token storage; gmail.send scope. Thread IDs and attachments remain associated with the Project.'},
 {id:'calendar',name:'Google Calendar',operations:['create','update','cancel','conflicts'],requirements:'Calendar selection and authorization; calendar.events.owned for owned-calendar writes, calendar.freebusy for conflict queries. Confirm scope fit before activation.'},
 {id:'signature',name:'E-signature — provider not selected',operations:['request','complete','decline','cancel'],requirements:'Signer consent/identity, signing session, immutable signed PDF, certificate/audit trail and verified webhooks.'},
 {id:'payment',name:'Payments — provider not selected',operations:['session','success','failure','refund'],requirements:'Hosted card/ACH collection, integer-cent amounts, installments, receipts, verified webhooks and refund reconciliation. No raw card or bank data.'},
 {id:'identity',name:'Client authentication — provider pending',operations:['invite','activate','reset','revoke','reenable','logout','email-change'],requirements:'Provider-managed passwords, expiring single-use invitations, sessions, password reset, verified email changes and server-side Project grants.'}
].map(i=>({...i,status:'NOT CONFIGURED',enabled:false}));
export function providerAdapter(provider,{mode='live'}={}){
 const definition=integrations.find(i=>i.id===provider);if(!definition)throw Error('Unknown provider');
 if(mode!=='demo')throw Error('Live integrations are disabled; account authorization and approval required');
 return {mode:'demo',async execute(operation,context){
  if(!definition.operations.includes(operation))throw Error('Unsupported operation');
  if(context?.demo!==true||!context.projectId||!context.contactId)throw Error('DEMO Project and Contact context required');
  if(provider==='payment'&&(!Number.isSafeInteger(context.amountCents)||context.amountCents<=0))throw Error('Positive integer-cent payment amount required');
  const failed=context.outcome==='failure';return {simulated:true,provider,operation,projectId:context.projectId,contactId:context.contactId,state:failed?'DEMO FAILED':'DEMO '+operation.toUpperCase(),providerId:'demo-'+crypto.randomUUID(),amountCents:provider==='payment'?context.amountCents:undefined,occurredAt:new Date().toISOString(),deliveryConfirmed:false,legallyBinding:false};
 }};
}
// Future public webhook adapters must verify raw bytes before parsing, and supply this
// trusted envelope internally. There is deliberately no public webhook route today.
export function verifiedEvent(envelope){
 if(envelope?.verified!==true||envelope?.simulated!==true||!/^demo-[a-z0-9-]{8,80}$/.test(envelope.eventId||''))throw Error('Verified DEMO event required');
 return {eventId:envelope.eventId,simulated:true};
}
export async function integrationAPI(request,db,user,path,get){
 const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Robots-Tag':'noindex'}});
 if(path==='integrations'&&request.method==='GET'){
 const exists=await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='integration_demo_events'").first();
 const history=exists?(await db.prepare('SELECT event_id,result FROM integration_demo_events WHERE organization_id=? ORDER BY rowid DESC LIMIT 30').bind(user.organizationId).all()).results.map(r=>({eventId:r.event_id,...JSON.parse(r.result)})):[];
 return reply({integrations,healthStates,liveEnabled:false,history});
 }
 if(path!=='integrations/simulate'||request.method!=='POST')return reply({error:'Not found'},404);
 try{
  if(user.organizationId!=='giolina-preview')throw Error('Preview workspace required');
  const raw=await request.text();if(raw.length>4096)throw Error('Simulation too large');const input=JSON.parse(raw);
  if(Object.keys(input).some(k=>!['provider','operation','projectId','eventId','outcome','amountCents'].includes(k)))throw Error('Unsupported simulation field');
  if(input.outcome!==undefined&&!['success','failure'].includes(input.outcome))throw Error('Invalid simulation outcome');
  const event=verifiedEvent({verified:true,simulated:true,eventId:input.eventId});
  const project=await get(db,user.organizationId,'projects',input.projectId),contact=project&&await get(db,user.organizationId,'contacts',project.contactId);
  if(!project?.demo||project.archived||!contact?.demo||contact.archived||!contact.email?.endsWith('@example.test'))throw Error('Owned synthetic Project and Contact required');
  const adapter=providerAdapter(input.provider,{mode:'demo'});
  await db.batch([db.prepare('CREATE TABLE IF NOT EXISTS integration_demo_events(organization_id TEXT NOT NULL,event_id TEXT NOT NULL,result TEXT NOT NULL CHECK(json_valid(result)),PRIMARY KEY(organization_id,event_id))')]);
  const previous=await db.prepare('SELECT result FROM integration_demo_events WHERE organization_id=? AND event_id=?').bind(user.organizationId,event.eventId).first();
  if(previous){const result=JSON.parse(previous.result);if(result.projectId!==project.id||result.provider!==input.provider||result.operation!==input.operation||result.amountCents!==input.amountCents||result.failed!==(input.outcome==='failure'))throw Error('Event reference already belongs to a different operation');return reply({...result,replayed:true});}
  const result={...await adapter.execute(input.operation,{...input,demo:true,contactId:contact.id}),failed:input.outcome==='failure'};
  const now=new Date().toISOString();
  // Unique key plus atomic batch guarantees retry cannot duplicate audit entries.
  try{await db.batch([db.prepare('INSERT INTO integration_demo_events VALUES(?,?,?)').bind(user.organizationId,event.eventId,JSON.stringify(result)),db.prepare('INSERT INTO audit_events VALUES(?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),user.organizationId,user.email,'demo-integration-'+input.provider+'-'+input.operation,'projects',project.id,now,JSON.stringify({simulated:true,eventId:event.eventId,state:result.state}))]);}catch{ return reply({error:'Concurrent event retry; retry the same reference'},409); }
  return reply(result,201);
 }catch(e){return reply({error:e.message},400);}
}

export const deliveryStates=['DRAFT','QUEUED','SENT','FAILED'];
export function deliveryTransition(current,next,{providerConfirmed=false,simulated=false}={}){
 const transitions={DRAFT:['QUEUED'],QUEUED:['SENT','FAILED'],FAILED:['QUEUED'],SENT:[]};
 if(!transitions[current]?.includes(next))throw Error('Invalid delivery transition');
 if(next==='SENT'&&(!providerConfirmed||simulated))throw Error('Actual provider confirmation required');
 return next;
}
export async function invitationToken({contactId,projectId,now=Date.now(),ttlMs=86400000}){
 if(!contactId||!projectId||!Number.isSafeInteger(ttlMs)||ttlMs<=0||ttlMs>7*86400000)throw Error('Invalid invitation context or expiry');
 const bytes=crypto.getRandomValues(new Uint8Array(32)),token=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));
 return {token,record:{tokenHash:Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join(''),contactId,projectId,expiresAt:new Date(now+ttlMs).toISOString(),usedAt:null,revokedAt:null,simulated:true}};
}
export async function consumeInvitation(record,token,now=Date.now()){
 if(!record?.simulated||record.usedAt||record.revokedAt||Date.parse(record.expiresAt)<=now||!Number.isFinite(Date.parse(record.expiresAt)))throw Error('Invitation unavailable');
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
 if(hash!==record.tokenHash)throw Error('Invitation unavailable');
 return {...record,usedAt:new Date(now).toISOString()};
}

// Names only: callers may surface missing requirements, never secret values.
export function configurationReadiness(provider,env={}){
 const required={email:['GOOGLE_OAUTH_CLIENT_ID','GOOGLE_OAUTH_CLIENT_SECRET','GOOGLE_OAUTH_REDIRECT_URI','INTEGRATION_TOKEN_ENCRYPTION_KEY'],calendar:['GOOGLE_OAUTH_CLIENT_ID','GOOGLE_OAUTH_CLIENT_SECRET','GOOGLE_OAUTH_REDIRECT_URI','INTEGRATION_TOKEN_ENCRYPTION_KEY'],payment:['PAYMENT_API_SECRET','PAYMENT_WEBHOOK_SECRET'],signature:['SIGNATURE_API_SECRET','SIGNATURE_WEBHOOK_SECRET'],identity:['CLIENT_AUTH_SECRET']}[provider];
 if(!required)throw Error('Unknown provider');
 const missing=required.filter(name=>typeof env[name]!=='string'||!env[name].trim());
 return {status:'NOT CONFIGURED',missing,requiresAuthorization:true,liveEnabled:false};
}
export const providerResultFields={
 email:['messageId','threadId','deliveryState','attachmentIds','failureCode'],
 calendar:['eventId','appointmentId','calendarId','revision','conflicts','failureCode'],
 signature:['requestId','signerId','sessionUrl','completedAt','signedDocumentId','certificateId','failureCode'],
 payment:['sessionId','transactionId','invoiceId','installmentId','amountCents','currency','receiptId','refundId','failureCode'],
 identity:['subject','contactId','projectGrants','invitationExpiresAt','sessionExpiresAt','accessState','failureCode']
};
