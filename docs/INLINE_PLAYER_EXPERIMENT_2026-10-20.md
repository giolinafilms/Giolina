# Preview-only inline video comparison

Route: /qa/video-player-comparison/
Vimeo: existing Francesca & Chris799295947. MediaZilla: existing Jazz & Trevorgjx8Km0Irn. Existing posters and popup players retained beside inline test controls. No provider metadata/privacy edits.

Implementation: no iframe in initial HTML; no third-party request initiated by the experiment script until an explicit per-visit provider choice. No preference saved. Vimeo uses dnt=1 and autoplay=0. MediaZilla uses its existing presentation URL without autoplay. Inline frame reserves16:9 space, has an accessible title and fullscreen controls. Only one inline player stays loaded; opening a baseline player clears inline players. Remove control deletes the iframe but does not claim to delete provider cookies or historical processing. GA4 is neither activated nor used to authorize video processing. Production/private origins fail closed.

Discovery result: this compliant conservative variant still requires a click, so it does not meet automatic iframe-discovery goals. A static immediately loaded iframe would improve discovery but would make provider requests before a visitor choice. Vimeo documents that dnt suppresses session analytics but essential cookies can remain; MediaZilla's equivalent restriction is unverified. Do not claim a complete third-party cookie audit from same-origin DOM access. Current testing verifies our request-creation boundary, not every provider's downstream behavior.

Performance: zero initial external player frames from the experiment; stable frame dimensions; local posters retained. Actual third-party transfer sizes, full cookie behavior, Core Web Vitals and physical mobile behavior require separate measurement. No fabricated Lighthouse score or load-time estimate. Browser layout and playback findings are reported after preview deployment.

SEO: Google says not to depend on user clicks to load videos, and requires indexed prominent watch pages. Preview noindex remains intentional. Existing factual MediaObject metadata and approved production video-sitemap entries are compatible with identifying exact players; full VideoObject markup needs verified publication dates. The gated experiment is not a video-indexing fix and no Search Console indexing success is claimed.

Metadata recommendation: improve descriptive venue/couple titles and concise factual descriptions in place only after owner approval. Preserve IDs, URLs, views, existing embeds and privacy. Benefits are clearer relevance and useful site links; snippets and audience recognition may change, and ranking gains are not guaranteed. Existing detailed before/after proposals remain in VENUE_VIDEO_SEO_RELEASE_2026-10-20.md. No provider metadata changed.

Sources already reviewed:
https://developers.google.com/search/docs/appearance/video
https://developers.google.com/search/case-studies/vimeo-case-study
https://help.vimeo.com/hc/en-us/articles/12426260232977-About-Player-Parameters
https://help.vimeo.com/hc/en-us/articles/26080940921361-Vimeo-Player-Cookies/
https://support.mediazilla.com/en/articles/5479820-how-do-i-embed-mediazilla-videos-or-presentations-on-my-website
