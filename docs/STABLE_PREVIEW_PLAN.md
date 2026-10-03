# GioLina stable review URL — pending DNS approval

Current authoritative build target: existing `giolina` Worker, native Preview named `preview-homepage-photography-rotation`, Git branch `preview/homepage-photography-rotation`.
Current stable branch address: https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev/ . Future branch builds update this same address; do not use the stale root Worker address for review.

Desired review address: https://preview.giolinafilms.com/ . No DNS, domain binding, redirect or new Worker has been created.

## Lowest-risk permanent review entry (approval required)

A permanent review link can redirect to the current branch Preview, preserving the path and query. The browser address changes to workers.dev after the redirect; this option is an entry link, not a proxy under the custom hostname.

Exact proposed DNS record in the giolinafilms.com zone:

| Type | Name | Value | Proxy | TTL |
| --- | --- | --- | --- | --- |
| A | preview | 192.0.2.0 | Proxied | Auto |

The address is Cloudflare's documented reserved placeholder for an originless redirect. A DNS record alone does not establish the review site.

Proposed Cloudflare Single Redirect, restricted to `http.host eq "preview.giolinafilms.com"`:
- destination expression: `concat("https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev", http.request.uri.path)`
- preserve query string: true
- status: 302 (avoid permanent caching while the review target may evolve)
- do not match apex, www, email or client hosts

Check the zone for an existing `preview` record/rule before activation; never overwrite an existing record without review.

## If the browser must stay at preview.giolinafilms.com

Do not use a bare CNAME to workers.dev: DNS alone does not bind the hostname to the native branch Preview. A separate, explicitly approved routing/alias design is needed. Do not attach the custom hostname directly to the giolina root Worker because it serves a different/stale deployment.

Cloudflare native Preview custom domains produce `<preview-name>.<configured-domain>`, not the configured domain itself. Attaching `preview.giolinafilms.com` would produce an extra Preview subdomain, not the requested exact address. This pass does not modify the production domain's bindings or create a competing Worker.

Official references:
- https://developers.cloudflare.com/workers/previews/custom-domains/
- https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
