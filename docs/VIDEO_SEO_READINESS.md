# Video search readiness — preview checkpoint, October 4, 2026

The film catalog is generated at build time from the existing visible card labels,
poster sources and Love in a Minute data. No additional browser scripts or provider
requests are introduced. Playback, lazy loading and media inventory are unchanged.

## Verified metadata

| Canonical page | Catalog entries |
| --- | ---: |
| `/portfolio-2/` — wedding reel, client films, Love in a Minute and anniversary edits | 27 |
| `/sweet-sixteen/` | 5 |
| `/ready-to-go-productions/` | 17 |

Each page has one ItemList of MediaObject entries: public name, factual collection
description, exact poster URL, selected player's embed URL or the actual local MP4
URL. Unique source-based identifiers prevent same-name films becoming one entity.
`/video-sitemap.xml` supplies the same 49 entries using Google's video sitemap
extension. Required title, description, thumbnail and content/player locations are
present. Unknown publication dates, durations and interaction counts are omitted.
The ordinary sitemap, robots policy and canonical domain are unchanged. No sitemap
has been submitted or advertised as production-ready.

## Why no speculative VideoObject markup

Google's VideoObject feature requires a true first-publication `uploadDate`.
The workspace does not provide verified publication dates for this inventory.
Commit dates, file timestamps and dates in film names are not publication dates.
MediaObject catalog markup does not claim VideoObject rich-result eligibility.
The video sitemap supports discovery without requiring invented dates.

The preserved RTG cards for Vimeo `102347867` and `87439618` still use neutral
posters and generic public labels. They are excluded from the SEO catalog until
real public titles and representative thumbnails are available; they remain on
the page and in the playback inventory.

## Production verification still required

- Keep the preview's noindex protection until separately authorized launch.
- Confirm production page, local MP4 and thumbnail URLs return publicly accessible
  responses at `https://giolinafilms.com`, including byte-range requests for MP4s.
- Recheck external thumbnails and Vimeo/MediaZilla availability and crawl access.
- Lazy modal gallery pages are not dedicated watch pages. Google may not index
  every secondary film; metadata and a sitemap do not guarantee video results.
- Obtain real public first-publication dates before enabling VideoObject markup.
- Validate production sitemap and rendered metadata after cutover; only then
  consider separately authorized Search Console submission. No Google changes
  are part of this checkpoint.

References: [Google video sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps)
and [VideoObject requirements](https://developers.google.com/search/docs/appearance/structured-data/video).
