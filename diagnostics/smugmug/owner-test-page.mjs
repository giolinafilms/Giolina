// Public static script. No runtime secrets, cookies, storage or third-party code.
export const testJs = `(() => {
'use strict';
const el = id => document.getElementById(id);
const password = el('test-password');
const confirm = el('test-confirm');
const status = el('test-status');
const report = el('test-report');
const buttons = ['test-refresh','test-arm','test-run'].map(el);
let busy = false, generation = 0, controller = null, state = 'unknown';
function controls() {
  buttons[0].disabled = busy;
  buttons[1].disabled = busy || state !== 'unarmed';
  buttons[2].disabled = busy || state !== 'armed';
  el('test-copy').disabled = !report.textContent;
}
function clear() {
  generation++; password.value = ''; confirm.checked = false;
  if (controller) controller.abort(); controller = null; busy = false;
  state = 'unknown'; report.textContent = ''; controls();
  status.textContent = 'No test runs automatically. Check test status first. Leaving the page never resets a used authorization.';
}
window.addEventListener('pagehide',clear);
window.addEventListener('pageshow',clear);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')clear();});
function display(data) {
  const messages = {
    unarmed:'The test is disabled and unarmed. Only after separate owner authorization, confirm below and arm one test.',
    armed:'One test is armed for ten minutes. Nothing has been sent. Re-enter your diagnostic password, confirm again, then click Run One OAuth Test.',
    expired:'The authorization expired. No new attempt can be armed here. Technical review is required.',
    consumed:'The authorization was consumed. The attempt may still be running or its outcome is uncertain. Do not retry. Check Test Status can retrieve a saved result without sending OAuth.',
    completed:'The attempt is finished and permanently locked against repeat execution.'
  };
  if (!Object.hasOwn(messages,data.state)) throw new Error('unexpected');
  state=data.state; status.textContent=messages[state];
  report.textContent='';
  if(data.evidence && state==='completed') {
    const labels={request_token_succeeded_only:'Request-token step succeeded. This does not prove account authorization or gallery access.',http_401_signature_invalid:'SmugMug request-token response: HTTP 401 / signature_invalid.',other_http_response:'A response was received; request-token success was not established.',connection_or_transport_failure:'Connection or transport failure. Provider receipt is unconfirmed.',response_body_capture_failed:'A response was received, but body capture failed.'};
    status.textContent += ' '+(labels[data.evidence.result] || 'Review the sanitized evidence.');
    report.textContent=JSON.stringify(data.evidence,null,2);
  }
}
async function act(action) {
  if(busy)return;
  if(action!=='status' && !confirm.checked) {status.textContent='Explicit confirmation is required. Nothing was sent.';return;}
  let token=password.value; password.value='';
  if(!/^[A-Za-z0-9_-]{43,128}$/.test(token)){token=null;status.textContent='Enter your existing diagnostic password, with no spaces.';return;}
  const body=action==='arm'?{application:'2026-10-02',confirmation:'authorize-one-request-token-test'}:action==='run'?{confirmation:'run-one-request-token-test-now'}:{};
  const current=++generation; busy=true; confirm.checked=false; controls();
  const active=new AbortController();controller=active;
  const timer=setTimeout(()=>active.abort(),35000);
  status.textContent=action==='run'?'Running the single authorized request. Do not repeat or reload.':'Checking the protected one-use authorization…';
  try {
    const pending=fetch('/owner-test/'+action,{method:'POST',mode:'same-origin',credentials:'omit',redirect:'error',cache:'no-store',signal:active.signal,headers:{Authorization:'Bearer '+token,'X-Owner-Test':'v1','Content-Type':'application/json'},body:JSON.stringify(body)});
    token=null;
    const response=await pending;
    if(current!==generation)return;
    if(response.status===401){state='unknown';status.textContent='Diagnostic password not accepted. Check your saved password.';return;}
    if(!response.ok)throw new Error('unavailable');
    const data=await response.json();if(current!==generation)return;
    display(data);
  }catch{
    if(current===generation){state='unknown';report.textContent='';status.textContent='Outcome not confirmed. No automatic retry was made. Use Check Test Status only; it cannot send OAuth. A consumed authorization stays locked.';}
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
  try{await navigator.clipboard.writeText(report.textContent);status.textContent='Sanitized report copied. Supply the API key separately through your private SmugMug Support conversation.';}
  catch{status.textContent='Clipboard unavailable. Select and copy the sanitized report below.';}
});
clear();
})();`;
