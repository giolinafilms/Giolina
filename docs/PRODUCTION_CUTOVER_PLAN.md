# GioLina production cutover plan — NOT EXECUTED

Prepared 3 October 2026. Preview-only preparation. Recommendation: **NOT READY** until the gates below are closed. No DNS, production deployment, Search Console, email, Google Workspace, HoneyBook or SmugMug configuration was changed.

## Verified project and preview

- Repository: https://github.com/giolinafilms/Giolina ; GitHub default branch: `main` (verified through repository API).
- Active working/preview branch: `preview/homepage-photography-rotation`.
- Worker: `giolina`; native Preview: `preview-homepage-photography-rotation`.
- Exact preview: https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev/ .
- Visual correction checkpoint: `2a9e320cc85acaf03bd56f3babf4f1cd8b2796fd`, build/check passed, Cloudflare build succeeded, hosted titles and unmuted playback/close cleanup verified.
- Redirect checkpoint: `90d6d35dd32cd5d2dd6f86499086a173e6b2b802`, Cloudflare build succeeded; the three added redirects and exact destination bytes were verified on the hosted preview. This plan's final commit is recorded in Git history and the final user report. A commit cannot contain its own resulting hash; freeze the final reported SHA as the launch baseline.
- Current canonical origin: `https://giolinafilms.com`; do not silently change it to giolina.co.
- Native branch Previews are separate from the Worker's active production deployment. Do not treat the old root workers.dev deployment as the current reviewed site.

## Launch gates / remaining blockers

1. Real iPhone/Android portrait and tablet visual QA for all nine pages; this browser has no supported mobile viewport. Long Cinema/Photography full-page captures timed out; Cinema lower sections were subsequently reviewed through normal scrolling. Photography lower sections and rotating-image states still need final manual review.
2. Separately authorized Contact test with actual receipt and scheduler check; endpoint remains `https://formspree.io/f/xbglbbpo`. No test email was sent in preparation.
3. Resolve duplicate Nicole & Philip wedding-film cards (Vimeo 425185852 / MediaZilla XDcajHQdhs); approve Frank portrait, two missing RTG poster/title identities (102347867 / 87439618), and cyan contrast treatment. Authentic RTG image logo is unavailable; silver text wordmark is currently used.
4. Decide retain/redirect/retire legacy services*, schedule-a-meeting*, bianca-bobby*, completed-lead and old post/archive/preview pages. All 22 current WordPress sitemap page URLs are accounted for, but several retained pages are empty or unfinished. Compare Search Console indexed URLs and server logs separately; sitemap coverage alone cannot prove all historical URLs are covered.
5. Implement and review **production-only** indexing and GA4. Preview currently has unconditional HTML and Worker noindex directives; analytics ID G-KD1ES061DH is stored but inactive and no operational GA4 delivery is proven. Simply merging the current branch will not produce an indexable, tracked production site.
6. Verify Cloudflare account/zone/build settings in the authenticated dashboard. Available access here verified GitHub checks and public DNS, not private Cloudflare configuration or complete registrar DNS exports. Confirm actual production branch before any merge. GitHub's `main` default is not proof Cloudflare listens to `main`.
7. Obtain complete current registrar zone export, DNSSEC/DS status, Cloudflare-assigned nameservers and permissions. Public DNS lookups are not a full inventory of DKIM selectors, SPF helper records, SRV, CAA or third-party validation records. Never rely only on a Cloudflare quick scan.

## Production domains and DNS baseline

Read-only public DNS queries on this date returned:

| Host / record | Current value | Planned treatment after separate launch approval |
| --- | --- | --- |
| giolinafilms.com NS | ns53.domaincontrol.com / ns54.domaincontrol.com | Full Cloudflare zone setup requires registrar delegation to the exact two assigned Cloudflare nameservers; names not yet available/verified |
| giolinafilms.com A | 160.153.0.49; TTL 600 | Preserve origin value for the route-based launch/rollback; import into Cloudflare, web record becomes proxied |
| www.giolinafilms.com CNAME | giolinafilms.com; TTL 3600 | Preserve target, make web record proxied |
| giolina.co NS | ns01.domaincontrol.com / ns02.domaincontrol.com | Untouched |
| giolina.co A | 3.33.251.168 and 15.197.225.128 | Untouched; current HTTP forwarding could not be verified because the network proxy returned 502 |
| www.giolina.co CNAME | giolina.co | Untouched |
| clients.giolina.co CNAME | ssl.honeybook.com; TTL 600 | Entire hostname and giolina.co zone untouched; no Worker route, wildcard rule, proxy change or DNS migration |

Both apex domains currently publish Google Workspace MX records: priority 1 aspmx.l.google.com, 5 alt1.aspmx.l.google.com, 5 alt2.aspmx.l.google.com, 10 alt3.aspmx.l.google.com, 10 alt4.aspmx.l.google.com. Preserve every value and priority. Existing SPF TXT uses `include:dc-aa8e722993._spfm.<domain> ~all`; preserve that TXT **and its supporting DNS records**, all DKIM/DMARC records, Google verification TXT and every other mail/service record from the complete export. Do not replace SPF with a guessed Google-only string. No email account/routing changes.

Eventual routing scope for this plan is **giolinafilms.com and www.giolinafilms.com only**. giolina.co/www.giolina.co forwarding is a separate unresolved decision; clients.giolina.co is always excluded. No guessed Worker IP or bare CNAME to workers.dev is required.

## Exact launch procedure — future, approval required

### A. Prepare an approved release without domain routing

1. Freeze the final verified preview SHA and record the present active production Worker version/deployment ID, current WordPress origin, registrar export, Cloudflare settings/rules and database/files backup. Keep WordPress hosting and GoDaddy zone intact for rollback.
2. In GitHub, create a release branch from that SHA. Make only separately approved launch preparation changes: conditional HTML robots metadata, hostname-restricted production Worker indexing policy, production robots with `Sitemap: https://giolinafilms.com/sitemap.xml`, actual GA4 integration/consent handling, and approved outstanding redirects/content corrections. Preview builds must retain noindex and inactive tracking; the GA4 loader must additionally check the approved public hostname so the root workers.dev release does not send production events. Do not remove preview protections globally.
3. Production policy must allow indexing only on the approved HTTPS canonical production host; other workers.dev/preview hosts continue returning noindex. Keep canonical URLs, internal routes, contact/scheduler destinations and mail links unchanged.
4. Run `npm ci`, `npm run build`, `npm run check`; explicitly test both preview-protected and production-indexable configurations, redirects/404, query preservation and asset streaming. Production configuration needs its own reviewed checks; today's checker intentionally requires preview noindex.
5. In Cloudflare **Workers & Pages → giolina → Settings → Build**, confirm repository `giolinafilms/Giolina`, root directory (repository root), build command and branch controls. Intended shared build command after implementing the reviewed release script: `npm run build:deploy`; deploy command `npx wrangler deploy`. The proposed build script must inspect Cloudflare’s `WORKERS_CI_BRANCH`, set `GIOLINA_DEPLOY_TARGET=production` only for the explicitly approved production branch, and default every other/local/unknown branch to protected preview. These are proposed implementation steps, not existing scripts/switches. Do not set a global production build flag: the shared build command also runs for preview branches. Set Preview command `npx wrangler preview`, with preview build target/default protected. Confirm production branch `main` in Branch control, or document/approve the existing different branch before proceeding.
6. Open and approve a GitHub PR from the release branch to that confirmed production branch. Merge only after launch authorization and the gates above. Wait for the matching Cloudflare check to succeed; record the active Worker version ID and release SHA. Do not add apex/www routes in the PR so a merge alone cannot change public routing. Verify root Worker release content before public routing; non-production hostname remains noindex.

### B. Move DNS authority while retaining WordPress service

7. Export the complete GoDaddy giolinafilms.com zone. In Cloudflare **Domains → Onboard a domain**, select giolinafilms.com in the same account as Worker giolina (or inspect the existing pending zone). Import/reconcile every record, including mail/SPF helper/DKIM/DMARC/CAA/SRV/verification and any subdomains. Keep mail/service hosts DNS-only. Do not onboard or change giolina.co.
8. Handle existing DNSSEC/DS according to Cloudflare's documented migration procedure and the recorded original state. Do not guess/remove DS without a controlled approved migration. Obtain the exact assigned nameservers from the zone Overview.
9. At the registrar for giolinafilms.com, replace ns53/ns54.domaincontrol.com with those exact assigned Cloudflare nameservers. This is a future DNS action, not performed here. Wait for active-zone status and confirm full record parity and Google Workspace mail operation before website routing. Enable/reconcile DNSSEC after migration with the correct new DS.
10. Preserve A @=160.153.0.49 and CNAME www=giolinafilms.com. Enable proxy only for these two web records; confirm WordPress still serves correctly through Cloudflare and TLS succeeds with **Full (strict)**. If certificates/origin proxying fail, stop and resolve; do not weaken TLS. Cloudflare manages edge certificates; wait for issuance before cutover. Do not add broad wildcard routing or change unrelated service hosts.

### C. Switch public website routing

11. In **Workers & Pages → giolina → Settings → Domains & Routes → Add → Route**, add exactly `giolinafilms.com/*` and `www.giolinafilms.com/*`, zone giolinafilms.com, to the verified active release. Route-based cutover deliberately retains the old origin record for fast rollback. This plan uses Routes, not Custom Domains; do not mix the two or attach a branch Preview as production.
12. Add a host-restricted Cloudflare Single Redirect for www and non-HTTPS apex: expression `(http.host eq "www.giolinafilms.com") or (http.host eq "giolinafilms.com" and not ssl)`; destination expression `concat("https://giolinafilms.com", http.request.uri.path)`, status 301, preserve query string. Confirm no pre-existing overlapping rule. This must not match giolina.co, clients.giolina.co or previews. Legacy path aliases subsequently use the reviewed Worker map; test resulting hop counts/loops.
13. Verify the release SHA/content, all nine pages, `/portfolio-2/`, old URL map, image destinations, 404 status, HTTPS certificate, canonical/meta/robots/sitemap and GA4 real events. Preserve mail/service tests. Do not cancel WordPress hosting yet.

## Rollback

- Immediate website rollback: remove/disable only the two new Worker routes above; old A/CNAME values still point at WordPress. Restore prior redirect rules if needed. Verify WordPress at apex/www and Contact/scheduler; leave all email and giolina.co records untouched.
- For a later Worker-only regression with a previously verified production release: **giolina → Deployments → previous verified version → Rollback** and route 100% traffic there. Record the version ID; a preview Git SHA is not a rollback-capable production version until actually deployed. Also revert the faulty GitHub release commit/PR so the next build cannot overwrite the rollback.
- If Cloudflare zone/TLS/proxying itself fails: restore the recorded web proxy settings and, if required, GoDaddy nameservers ns53/ns54.domaincontrol.com with the original complete zone and correct DNSSEC/DS state. Nameserver rollback depends on DNS cache propagation and is slower than removing routes. Do not delete either zone or alter mail during recovery.
- Maintain backup of WordPress files/database and the unchanged original hosting until post-launch stability is accepted. Do not roll back to the stale pre-migration root Worker simply because it is available.

## Post-launch checks and Google timing

Immediately check apex/www HTTP→HTTPS redirects, old page/image URLs and query strings, 404s, canonical consistency, absence of production noindex in HTML/headers, preview noindex still present, robots/sitemap, all navigation/footer/external links, contact receipt, scheduler, all player providers/close/switch cleanup, posters/photos, desktop/mobile, GA4 Realtime/DebugView and Google Workspace mail. Monitor Worker errors/404 logs and indexed legacy URL failures daily during the first week.

Only **after** public HTTPS routing, canonical/redirects, indexability and the sitemap are verified and the release is stable: use the existing appropriate Search Console property and submit `https://giolinafilms.com/sitemap.xml`; inspect Home, Cinematography and Photography URLs. This hostname remains the same, so do not use Change of Address for a hosting-only migration. No submission was made in this preparation pass.

## Primary references

- Cloudflare build/branch configuration: https://developers.cloudflare.com/workers/ci-cd/builds/configuration/ and https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/
- Cloudflare Routes: https://developers.cloudflare.com/workers/configuration/routing/routes/
- Full DNS setup and record inventory warnings: https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/
- Worker rollback: https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/
- Google migration guidance: https://developers.google.com/search/docs/crawling-indexing/site-move-no-url-changes
