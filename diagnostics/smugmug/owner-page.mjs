// Static public assets only. Runtime bindings must never enter these strings.
export const ownerHtml = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GioLina Films — SmugMug Diagnostic</title><link rel="stylesheet" href="/owner.css"><script src="/owner.js" defer></script><script src="/test.js" defer></script></head>
<body><main><p class="eyebrow">GIOLINA FILMS</p><h1>SmugMug Diagnostic</h1><p class="intro">Check the connection setup securely.</p>
<form id="readiness-form" autocomplete="off" method="post"><label for="diagnostic-password">Diagnostic password</label><p id="password-help">Use your existing diagnostic access token. Do not enter your SmugMug API key or secret.</p><input id="diagnostic-password" type="password" autocomplete="off" autocapitalize="none" spellcheck="false" minlength="43" maxlength="128" pattern="[A-Za-z0-9_-]{43,128}" required aria-describedby="password-help"><button id="check" type="submit">Check Readiness</button></form>
<section aria-labelledby="results-heading"><h2 id="results-heading">Readiness results</h2><p id="status" role="status" aria-live="polite">Enter your diagnostic password to check readiness.</p><ul id="results"></ul></section>
<p class="notice">Readiness only. This check does not contact SmugMug, run OAuth or change any settings. A successful check does not mean SmugMug authentication has succeeded.</p><p class="privacy">Your password is used only for this check and is cleared afterward. It is also cleared when you leave this page.</p><section aria-labelledby="test-heading"><h2 id="test-heading">SmugMug Authentication Test</h2>
<p class="notice">GioLina Films — October 2, 2026. After separate owner authorization, this can send one request-token test. It cannot authorize account access or access galleries. Arming does not send a request. A completed, failed or uncertain attempt cannot be repeated here.</p>
<label for="test-password">Diagnostic password for test controls</label><p id="test-help" class="privacy">Use only your existing diagnostic password. Never enter the SmugMug API key or secret. Re-enter the password for each action; it is cleared immediately.</p><input id="test-password" type="password" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="128" aria-describedby="test-help">
<button id="test-refresh" type="button">Check Test Status</button>
<label class="confirmation" for="test-confirm"><input id="test-confirm" type="checkbox"> I have separately authorized ONE request-token test using the October 2, 2026 application. I understand that any attempt consumes the authorization, including failure.</label>
<button id="test-arm" type="button" disabled>Arm One Test — No Request Sent</button><button id="test-run" type="button" disabled>Run One OAuth Test</button>
<p id="test-status" role="status" aria-live="polite">The test is disabled until explicitly armed.</p>
<button id="test-copy" type="button" disabled>Copy Sanitized Support Report</button><pre id="test-report" tabindex="0" aria-label="Sanitized SmugMug support report"></pre></section>
</main></body></html>`;

export const ownerCss = `:root{color-scheme:dark;font-family:Georgia,serif;background:#121313;color:#eee8dd}*{box-sizing:border-box}body{margin:0;padding:clamp(18px,5vw,60px)}main{max-width:660px;margin:0 auto;padding:clamp(22px,5vw,46px);border:1px solid #49473e;border-radius:12px;background:#1b1c1b}.eyebrow{letter-spacing:.18em;font:12px system-ui;color:#d6bc82}h1{font-weight:400;font-size:clamp(26px,5vw,38px);line-height:1.2;margin:16px 0}.intro{color:#d7d2c8}form,section{margin-top:32px}label{display:block;font:600 17px system-ui}#password-help,.notice,.privacy{font:15px/1.65 system-ui;color:#d0cdc5}input,button{display:block;width:100%;font:17px system-ui;border-radius:6px;min-height:48px}input{background:#101110;color:#fff;border:1px solid #888;padding:12px;margin:12px 0 16px}button{background:#dcc18d;color:#19180f;border:0;padding:14px;cursor:pointer;font-weight:600}button:disabled{opacity:.65;cursor:wait}:focus-visible{outline:3px solid #f8dc9c;outline-offset:4px}h2{font-weight:400;font-size:23px}#status,li{font:16px/1.6 system-ui}ul{padding-left:22px}li{margin:8px 0;overflow-wrap:anywhere}.notice{border-top:1px solid #49473e;padding-top:24px;margin-top:32px}.privacy{font-size:13px}#test-heading{border-top:1px solid #49473e;padding-top:24px}.confirmation{font:15px/1.6 system-ui;margin:20px 0;display:flex;gap:12px;align-items:flex-start}.confirmation input{width:22px;min-height:22px;flex-shrink:0;margin:2px 0}#test-arm,#test-run,#test-copy{margin-top:14px}#test-status{font:16px/1.6 system-ui}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:13px/1.6 monospace;max-width:100%}`;

export const ownerJs = `(() => {
'use strict';
const form = document.getElementById('readiness-form');
const input = document.getElementById('diagnostic-password');
const button = document.getElementById('check');
const status = document.getElementById('status');
const results = document.getElementById('results');
let controller = null;
let generation = 0;
function clearSession() {
  generation++;
  input.value = '';
  if (controller) controller.abort();
  controller = null;
  button.disabled = false;
  results.replaceChildren();
  status.textContent = 'Enter your diagnostic password to check readiness.';
}
window.addEventListener('pagehide', clearSession);
window.addEventListener('pageshow', clearSession);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') clearSession(); });
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (button.disabled) return;
  let token = input.value;
  input.value = '';
  results.replaceChildren();
  if (!/^[A-Za-z0-9_-]{43,128}$/.test(token)) {
    token = null;
    status.textContent = 'Enter the existing diagnostic password, with no spaces.';
    return;
  }
  const current = ++generation;
  const active = new AbortController();
  controller = active;
  const timeout = setTimeout(() => active.abort(), 12000);
  button.disabled = true;
  status.textContent = 'Checking readiness…';
  try {
    const pending = fetch('/readiness', {
      method: 'GET', mode: 'same-origin', credentials: 'omit', redirect: 'error', cache: 'no-store',
      headers: { Authorization: 'Bearer ' + token, 'X-Readiness-Request': 'owner-v1' }, signal: active.signal
    });
    token = null;
    const response = await pending;
    if (current !== generation) return;
    if (response.status === 401) {
      status.textContent = 'The diagnostic password was not accepted. Check your saved password. No SmugMug request was made.';
      return;
    }
    if (!response.ok) throw new Error('unavailable');
    const state = await response.json();
    if (current !== generation) return;
    if (state.service !== 'giolina-smugmug-diagnostic' || !state.bindings) throw new Error('unexpected');
    const checks = [
      [state.bindings.SMUGMUG_API_KEY === true && state.bindings.SMUGMUG_API_SECRET === true, 'SmugMug credential bindings are present.', 'A SmugMug credential binding is missing.'],
      [state.credentialsWellFormed === true, 'Credential format checks pass.', 'Credential format checks need attention.'],
      [state.bindings.RUN_GATE === true, 'Single-use authorization binding is present.', 'Single-use authorization binding is missing.'],
      [state.actionEnabled === false, 'Legacy OAuth execution remains disabled.', 'OAuth execution is not confirmed disabled.'],
      [state.selectedApplicationConfirmed === false, 'Application confirmation remains disabled.', 'Application confirmation is not disabled.'],
      [state.runConfigured === false, 'No valid live-run identifier is configured.', 'A live-run identifier is configured.'],
      [state.authenticationTested === false, 'Readiness does not test SmugMug authentication.', 'Authentication state was unexpected.']
    ];
    for (const [ok, pass, fail] of checks) {
      const item = document.createElement('li');
      item.textContent = (ok ? '✓ ' : 'Attention: ') + (ok ? pass : fail);
      results.appendChild(item);
    }
    status.textContent = checks.every(([ok]) => ok)
      ? 'Readiness checks passed. Legacy OAuth remains disabled. Use Check Test Status for the separate one-use owner test; readiness does not establish authentication.'
      : 'Setup needs attention. No SmugMug request was made. Keep OAuth disabled.';
  } catch {
    if (current === generation) status.textContent = 'Readiness could not be confirmed. No automatic retry was made. Your password has been cleared.';
  } finally {
    token = null;
    clearTimeout(timeout);
    if (current === generation) { controller = null; input.value = ''; button.disabled = false; }
  }
});
})();`;
