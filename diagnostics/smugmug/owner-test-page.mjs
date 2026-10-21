// Public static script. No runtime secrets, cookies, storage or third-party code.
export const testJs = `(() => {
'use strict';
const el = id => document.getElementById(id);
const password = el('test-password');
const confirm = el('test-confirm');
const report = el('test-report');
const copyHelp = el('test-copy-help');
const messages = {status:el('test-status'),arm:el('test-arm-status'),run:el('test-run-status')};
const buttons = ['test-refresh','test-arm','test-run'].map(el);
let busy = false, generation = 0, controller = null, state = 'unknown', actionsAvailable = false;
function controls() {
  buttons[0].disabled = busy;
  buttons[1].disabled = busy || !actionsAvailable || state !== 'unarmed';
  buttons[2].disabled = busy || !actionsAvailable || state !== 'armed';
  el('test-copy').disabled = !report.textContent;
  copyHelp.textContent = report.textContent ? 'A saved sanitized report is available to copy.' : 'No sanitized OAuth report is available. A status check does not create one. Copy becomes available only when a real attempt has saved evidence.';
}
function show(action,text,focus=false) {
  const target=messages[action]; target.textContent=text;
  if(focus && typeof target.focus==='function') target.focus({preventScroll:true});
  if(focus && typeof target.scrollIntoView==='function') target.scrollIntoView({block:'nearest'});
}
function clear() {
  generation++; password.value = ''; confirm.checked = false;
  if (controller) controller.abort(); controller = null; busy = false;
  state = 'unknown'; actionsAvailable = false; report.textContent = ''; controls();
  show('status','Status not checked. Enter your diagnostic password and click Check Test Status. No test runs automatically.');
  show('arm','Arming is unavailable until status is verified and you separately authorize a live test.');
  show('run','No request runs automatically. A separate authorization is required.');
}
window.addEventListener('pagehide',clear);
window.addEventListener('pageshow',clear);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')clear();});
function display(data,action) {
  const labels = {
    unarmed:'Ready / not armed. No authorization is recorded for this owner test.',
    armed:'Test armed, not consumed. Arming alone sends no OAuth request. The authorization expires ten minutes after arming.',
    expired:'Test authorization expired without consumption. It cannot be rearmed here. Technical review is required.',
    consumed:'Test authorization already used. This is not proof that an OAuth request reached SmugMug. It may still be running or its outcome is unknown. Do not retry.',
    completed:'Test authorization already used. The attempt is finished and locked against repeat execution.'
  };
  if(!data || typeof data!=='object' || !Object.prototype.hasOwnProperty.call(labels,data.state)) throw new Error('unknown_state');
  if(typeof data.ownerActionsAvailable!=='boolean') throw new Error('unexpected_response');
  state=data.state; actionsAvailable=data.ownerActionsAvailable;
  let text=labels[state];
  if(!actionsAvailable && state==='unarmed') text='Not armed. No authorization is recorded for this owner test.';
  if(!actionsAvailable) text+=' Diagnostic configuration blocks arming and execution; the stored authorization state above is still readable.';
  else text+=' Legacy diagnostic configuration remains disabled; this status check does not enable it.';
  report.textContent='';
  if(state==='completed') {
    if(data.evidence && typeof data.evidence==='object' && !Array.isArray(data.evidence)) {
      const results={request_token_succeeded_only:'Request-token step succeeded only; this does not prove account or gallery access.',http_401_signature_invalid:'HTTP 401 / signature_invalid was recorded.',other_http_response:'A response was received; request-token success was not established.',connection_or_transport_failure:'A transport failure was recorded; provider receipt is unconfirmed.',response_body_capture_failed:'A response was received but body capture failed.'};
      if(Object.prototype.hasOwnProperty.call(results,data.evidence.result)) {
        text+=' '+results[data.evidence.result]; report.textContent=JSON.stringify(data.evidence,null,2);
      } else text+=' No recognized sanitized report is available. Do not retry.';
    } else text+=' No saved sanitized report is available. Do not retry.';
  }
  if(action==='status') text+=' This status check cannot arm or run OAuth.';
  show(action,text,true);
}
function failed(action,text) {
  state='unknown';actionsAvailable=false;report.textContent='';
  const safety=action==='status'?' Authorization state is unknown. This status check cannot arm or run OAuth.': ' Authorization may have changed. Use Check Test Status only; do not repeat this action.';
  show(action,text+safety+' No automatic retry was made.',true);
}
function serverError(response,data) {
  const codes={
    unsafe_configuration:'Diagnostic configuration blocks this action.',
    forbidden:'The browser security check rejected this request.',
    origin_mismatch:'The same-origin security check rejected this request.',
    fetch_metadata_rejected:'The browser security metadata check rejected this request.',
    cookie_not_allowed:'The browser security check rejected a cookie-bearing request.',
    csrf_header_missing:'The CSRF security check rejected this request.',
    content_type_rejected:'The request format security check rejected this request.',
    method_not_allowed:'The request method was rejected.',
    invalid_request:'The server rejected the request format.',
    confirmation_required:'Explicit one-test confirmation is required.',
    durable_gate_unavailable_no_retry:'The authorization storage is unavailable; its state could not be read.',
    authorization_already_created_no_retry:'An authorization already exists. Do not arm again.',
    not_armed_expired_or_consumed_no_retry:'Execution was rejected: authorization is absent, expired or already used.',
    attempt_uncertain_no_retry:'The authorization was consumed, but the attempt result was not saved. Do not retry.'
  };
  const code=data && typeof data.error==='string' && Object.prototype.hasOwnProperty.call(codes,data.error)?data.error:null;
  return (code?codes[code]:'Server error while checking the diagnostic.')+' (HTTP '+response.status+(code?'; '+code:'')+').';
}
async function act(action) {
  if(busy)return;
  let token=password.value; password.value='';
  if(typeof password.blur==='function') password.blur();
  if(action!=='status' && !confirm.checked) {token=null;show(action,'Explicit confirmation is required. Nothing was sent.',true);return;}
  if(!/^[A-Za-z0-9_-]{43,128}$/.test(token)){token=null;show(action,'Enter your existing diagnostic password, with no spaces. No request was sent.',true);return;}
  const body=action==='arm'?{application:'2026-10-02',confirmation:'authorize-one-request-token-test'}:action==='run'?{confirmation:'run-one-request-token-test-now'}:{};
  const current=++generation;busy=true;confirm.checked=false;report.textContent='';controls();
  const active=new AbortController();controller=active;let timedOut=false,phase='network';
  const timer=setTimeout(()=>{timedOut=true;active.abort();},action==='status'?12000:35000);
  show(action,action==='status'?'Checking test status… This cannot arm or run OAuth.':action==='arm'?'Checking one-test arming authorization. No OAuth request is sent by arming.':'Running the single authorized request. Do not repeat or reload.',true);
  try {
    const pending=fetch('/owner-test/'+action,{method:'POST',mode:'same-origin',referrerPolicy:'same-origin',credentials:'omit',redirect:'error',cache:'no-store',signal:active.signal,headers:{Authorization:'Bearer '+token,'X-Owner-Test':'v1','Content-Type':'application/json'},body:JSON.stringify(body)});
    token=null;
    const response=await pending;if(current!==generation)return;
    if(response.status===401){failed(action,'Diagnostic password was not accepted (HTTP 401).');return;}
    phase='response';
    let data;
    try{data=await response.json();}catch{if(response.ok)throw new Error('unexpected_response');}
    if(current!==generation)return;
    if(!response.ok){failed(action,serverError(response,data));return;}
    display(data,action);
  }catch(error){
    if(current===generation){
      const text=timedOut?'The '+(action==='status'?'status check':'request')+' timed out.':phase==='network'?'Connection or network error; no readable server response was received.':error?.message==='unknown_state'?'Unknown authorization state in the server response.':'Unexpected or unreadable server response.';
      failed(action,text);
    }
  }finally{
    token=null;clearTimeout(timer);
    if(current===generation){controller=null;busy=false;password.value='';controls();}
  }
}
buttons[0].addEventListener('click',()=>act('status'));
buttons[1].addEventListener('click',()=>act('arm'));
buttons[2].addEventListener('click',()=>act('run'));
el('test-copy').addEventListener('click',async()=>{
  if(!report.textContent)return;
  try{await navigator.clipboard.writeText(report.textContent);copyHelp.textContent='Sanitized report copied. Supply the API key separately through your private SmugMug Support conversation.';}
  catch{copyHelp.textContent='Clipboard unavailable. Select and copy the sanitized report below.';}
});
clear();
})();`;
