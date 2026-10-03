# GioLina URL reconciliation — 3 October 2026

Canonical production origin remains https://giolinafilms.com. This document records preview behavior and proposes no DNS change. Compared the current public WordPress page-sitemap.xml (22 page URLs) with all 29 generated replacement routes and the existing redirect configuration. Page URLs were extracted from direct sitemap URL entries, excluding nested image metadata. All 22 page URLs are accounted for. This is sitemap coverage, not a complete Search Console/server-log inventory of historically indexed URLs.

## Current public page map

| Old path on giolinafilms.com | Replacement path | Preview status / decision |
| --- | --- | --- |
| `/` | `/` | 200; preserved |
| `/services-2-2/` | `/services-2-2/` | 200; retained pending content/retirement decision |
| `/bianca-bobby-3/` | `/bianca-bobby-3/` | 200; retained pending content/retirement decision |
| `/schedule-a-meeting-3/` | `/schedule-a-meeting-3/` | 200; retained pending content/retirement decision |
| `/schedule-a-meeting/` | `/schedule-a-meeting/` | 200; retained pending content/retirement decision |
| `/bianca-bobby/` | `/bianca-bobby/` | 200; retained pending content/retirement decision |
| `/services/` | `/services/` | 200; retained pending content/retirement decision |
| `/bianca-bobby-2/` | `/bianca-bobby-2/` | 200; retained pending content/retirement decision |
| `/services-2/` | `/services-2/` | 200; retained pending content/retirement decision |
| `/completed-lead-2/` | `/completed-lead-2/` | 200; retained pending content/retirement decision |
| `/schedule-a-meeting-2/` | `/schedule-a-meeting-2/` | 200; retained pending content/retirement decision |
| `/reviews/` | `/client-reviews/` | 301 → 200 |
| `/photography-portfolio/` | `/portfolio/` | 301 → 200 |
| `/portfolio/` | `/portfolio/` | 200; preserved |
| `/portfolio-2/` | `/portfolio-2/` | 200; preserved |
| `/experience-2/` | `/experience-2/` | 200; preserved |
| `/client-reviews/` | `/client-reviews/` | 200; preserved |
| `/about-us/` | `/about-us/` | 200; preserved |
| `/photography/` | `/portfolio/` | 301 → 200 |
| `/video-portfolio/` | `/portfolio-2/` | 301 → 200 |
| `/contact-us-2/` | `/contact-us-2/` | 200; preserved |
| `/contact-us/` | `/contact-us-2/` | 301 → 200 |

## Additional intended routes

| Path | Status |
| --- | --- |
| `/sweet-sixteen/` | 200 |
| `/ready-to-go-productions/` | 200 |
| `/about-us-2/` | 301 → `/about-us/` |

## XML and original image paths

- `/sitemap_index.xml` and `/page-sitemap.xml` → `/sitemap.xml` (301). Replacement sitemap contains nine main canonical URLs.
- 90 previously mapped original upload paths remain unchanged.
- Restored two actual JPEGs still listed in the live sitemap: `/wp-content/uploads/2023/01/24-tiesto-wedding.jpg` and `/wp-content/uploads/2023/09/112ABCBD-1D0F-4FDA-88AF-C21A2E7883CE_1_105_c-1-e1695099554389.jpeg`. Original URL redirects point to their captured local JPEGs, without changing visible page content.
- The sitemap-listed Elementor placeholder URL maps to its already captured exact local asset; this does not insert a placeholder on any main page.
- Total redirect entries: 101. Existing worker preserves query strings and handles GET/HEAD. Unknown routes remain 404.

## Domain strategy and remaining decisions

Current read-only production HTTP checks: http://giolinafilms.com/ → HTTPS (301); https://www.giolinafilms.com/ → https://giolinafilms.com/ (301); http://www first goes to HTTPS www then apex. Preserve HTTPS non-www as canonical at launch, with explicit host-restricted redirects and path/query preservation. The preview intentionally does not redirect its own hostname to production. giolina.co and www.giolina.co currently returned a network-proxy 502 during inspection; their forwarding destination could not be verified. Do not change that zone or assume a forwarding decision. clients.giolina.co remains ssl.honeybook.com and is excluded from all proposed routing/rules.

Legacy services, scheduling, Bianca/Bobby and completed-lead routes are retained, including some empty/unfinished content. Approve their intended destinations or retirement before launch; no guessed redirects applied. Also review old hello-world, author/category and homepage-preview routes against historical indexed URL data.

## Complete implemented redirect map

| Old path | New path | Status |
| --- | --- | --- |
| `/wp-content/uploads/2023/01/24-tiesto-wedding.jpg` | `/assets/legacy-e72bb4cc0fba288e.jpg` | 301 |
| `/wp-content/uploads/2023/09/112ABCBD-1D0F-4FDA-88AF-C21A2E7883CE_1_105_c-1-e1695099554389.jpeg` | `/assets/legacy-853c148eb8ef4d2d.jpg` | 301 |
| `/wp-content/plugins/elementor/assets/images/placeholder.png` | `/assets/4da4eae846642123.png` | 301 |
| `/video-portfolio/` | `/portfolio-2/` | 301 |
| `/photography/` | `/portfolio/` | 301 |
| `/photography-portfolio/` | `/portfolio/` | 301 |
| `/about-us-2/` | `/about-us/` | 301 |
| `/reviews/` | `/client-reviews/` | 301 |
| `/contact-us/` | `/contact-us-2/` | 301 |
| `/sitemap_index.xml` | `/sitemap.xml` | 301 |
| `/page-sitemap.xml` | `/sitemap.xml` | 301 |
| `/wp-content/uploads/2023/01/0693_Gallo_selects_the_rockleigh_nj_Readytogo.nyc-scaled-1-1024x683.jpg` | `/assets/413670176557b8b3.jpg` | 301 |
| `/wp-content/uploads/2023/01/weddingwirelogo-1024x328.png` | `/assets/41b1a2dbc44d0e67.png` | 301 |
| `/wp-content/uploads/2023/01/giolina-3-e1695097482827-1024x526.png` | `/assets/e845a4337da29ba0.png` | 301 |
| `/wp-content/uploads/2023/01/0724_Gallo_selects_the_rockleigh_nj_Readytogo.nyc-scaled-1-683x1024.jpg` | `/assets/65ce5d2042da3c97.jpg` | 301 |
| `/wp-content/uploads/2023/01/wedding4-855x1024.png` | `/assets/d25ba7ec1f3dd6b8.png` | 301 |
| `/wp-content/uploads/2023/01/TheKnot-logo-regular-1024x535.jpg` | `/assets/228946ec584cbe8d.jpg` | 301 |
| `/wp-content/uploads/2023/01/BCzNs6wQ-1-scaled-1-683x1024.jpeg` | `/assets/488a20d9ab118c02.jpeg` | 301 |
| `/wp-content/uploads/2023/01/0597_Jen_Mike_NJ_Wedding_readytogoproductions.com-scaled-1-683x1024.jpg` | `/assets/6f445311778cad6a.jpg` | 301 |
| `/wp-content/uploads/2023/09/0646_Beck_NJ_wedding_ReadyToGoProductions.com-2-1024x683.jpg` | `/assets/168a955fdeaac3e9.jpg` | 301 |
| `/wp-content/uploads/2023/01/0600_Jen_Mike_NJ_Wedding_readytogoproductions.com-scaled-1-1024x683.jpg` | `/assets/046496f35523472b.jpg` | 301 |
| `/wp-content/uploads/2023/01/302_Gallo_selects_the_rockleigh_nj_Readytogo.nyc-scaled-1-683x1024.jpg` | `/assets/7724ed65c012d254.jpg` | 301 |
| `/wp-content/uploads/2023/01/fxkBiADQ-scaled-1.jpeg` | `/assets/e941428ca2af1172.jpeg` | 301 |
| `/wp-content/uploads/2023/01/0984_Beck_NJ_wedding_ReadyToGoProductions.com-scaled-1.jpg` | `/assets/cb99e1db42a51c75.jpg` | 301 |
| `/wp-content/uploads/2023/01/Stephanie-Danny-5-of-10-scaled-1.jpg` | `/assets/e049c369ab4029b7.jpg` | 301 |
| `/wp-content/uploads/2023/01/181_Gallo_selects_the_rockleigh_nj_Readytogo.nyc-scaled-1.jpg` | `/assets/4671e0df41423a4f.jpg` | 301 |
| `/wp-content/uploads/2023/01/223_Gallo_selects_the_rockleigh_nj_Readytogo.nyc-scaled-1.jpg` | `/assets/995a75f3586a1e21.jpg` | 301 |
| `/wp-content/uploads/2023/01/MER_1055-scaled-1.jpg` | `/assets/8434dc8d16bb070d.jpg` | 301 |
| `/wp-content/uploads/2023/01/0724_Gallo_selects_the_rockleigh_nj_Readytogo.nyc-scaled-1.jpg` | `/assets/f132fd596c7936ef.jpg` | 301 |
| `/wp-content/uploads/2023/09/IMG_3797.jpg` | `/assets/97f97b2cbea39357.jpg` | 301 |
| `/wp-content/uploads/2023/01/wedding-1.png` | `/assets/b8ae98a69f03e909.png` | 301 |
| `/wp-content/uploads/2023/01/weddingvow.png` | `/assets/59a82fb328e9184c.png` | 301 |
| `/wp-content/uploads/2026/01/ALLY_JAMES-1.png` | `/assets/3d91295ab040c4f4.png` | 301 |
| `/wp-content/uploads/2023/01/0802_Gallo_selects_the_rockleigh_nj_Readytogo.nyc-scaled-1.jpg` | `/assets/b603b57563709992.jpg` | 301 |
| `/wp-content/uploads/2023/01/237_Gallo_selects_the_rockleigh_nj_Readytogo.nyc-copy-1-scaled-1.jpg` | `/assets/cefe0daaa70fe868.jpg` | 301 |
| `/wp-content/uploads/2023/01/ck2KqbOA-scaled-1.jpeg` | `/assets/0ef5f485629f16d9.jpeg` | 301 |
| `/wp-content/uploads/2023/01/302_Gallo_selects_the_rockleigh_nj_Readytogo.nyc-scaled-1.jpg` | `/assets/299da5e07f2f4921.jpg` | 301 |
| `/wp-content/uploads/2023/01/237_Gallo_selects_the_rockleigh_nj_Readytogo.nyc-copy-scaled-1.jpg` | `/assets/2487c01449acd020.jpg` | 301 |
| `/wp-content/uploads/2023/01/0724_Gallo_selects_the_rockleigh_nj_Readytogo.nyc-1-1-scaled-1.jpg` | `/assets/b2cd3bafe227736a.jpg` | 301 |
| `/wp-content/uploads/2023/01/biancabobby.png` | `/assets/690ef6c3e99444cd.png` | 301 |
| `/wp-content/uploads/2023/01/0693_Gallo_selects_the_rockleigh_nj_Readytogo.nyc-scaled-1.jpg` | `/assets/132cabf69ffc85cc.jpg` | 301 |
| `/wp-content/uploads/2023/01/weddingring.png` | `/assets/86fefc441f2855ba.png` | 301 |
| `/wp-content/uploads/2023/01/MER_1425-scaled-1.jpg` | `/assets/a8d2288f5f1591bf.jpg` | 301 |
| `/wp-content/uploads/2023/01/R2G_0171-scaled-1.jpg` | `/assets/f78c04ccff386a86.jpg` | 301 |
| `/wp-content/uploads/2023/01/weddingpic.png` | `/assets/d5c736b9d423634c.png` | 301 |
| `/wp-content/uploads/2023/01/0878_Gallo_selects_the_rockleigh_nj_Readytogo.nyc-scaled-1.jpg` | `/assets/e2a4becb01bb4a15.jpg` | 301 |
| `/wp-content/uploads/2023/01/0840_Gallo_selects_the_rockleigh_nj_Readytogo.nyc-scaled-1.jpg` | `/assets/9d28de469d3f3c6b.jpg` | 301 |
| `/wp-content/uploads/2023/01/0600_Jen_Mike_NJ_Wedding_readytogoproductions.com-scaled-1.jpg` | `/assets/5641621a8242e156.jpg` | 301 |
| `/wp-content/uploads/2023/01/302_Gallo_selects_the_rockleigh_nj_Readytogo.nyc-scaled-1-200x300.jpg` | `/assets/b3cbf41ba495c1d0.jpg` | 301 |
| `/wp-content/uploads/2023/01/wedding-1-232x300.png` | `/assets/684672ac96dca54f.png` | 301 |
| `/wp-content/uploads/2023/09/60_details_ReadyToGoPRODUCTIONS.com_New-York_New-Jersey_Wedding_Photographer_JP-5-300x200.jpg` | `/assets/a414c755cb91f030.jpg` | 301 |
| `/wp-content/uploads/2023/09/0036_Jen_Mike_NJ_Wedding_readytogoproductions.com--300x200.jpg` | `/assets/502658ef02f307a2.jpg` | 301 |
| `/wp-content/uploads/2023/01/thumbnail1-300x252.png` | `/assets/655baf2141e1ed1b.png` | 301 |
| `/wp-content/uploads/2023/01/237_Gallo_selects_the_rockleigh_nj_Readytogo.nyc-copy-1-scaled-1-300x200.jpg` | `/assets/e92d8c4b015e6d32.jpg` | 301 |
| `/wp-content/uploads/2023/09/144_ReadyToGoPRODUCTIONS_New-York_New-Jersey_Wedding_Photographer_bridal-prep_-200x300.jpg` | `/assets/0f382d2e1815db87.jpg` | 301 |
| `/wp-content/uploads/2023/01/weddingpic-200x300.png` | `/assets/b14728db1547dcd5.png` | 301 |
| `/wp-content/uploads/2023/01/MER_1055-scaled-1-300x200.jpg` | `/assets/986fa9937d0b48e6.jpg` | 301 |
| `/wp-content/uploads/2023/01/R2G_0171-scaled-1-300x200.jpg` | `/assets/f38abbd61bf46c4b.jpg` | 301 |
| `/wp-content/uploads/2023/09/82_ReadyToGoPRODUCTIONS_New-York_New-Jersey_Wedding_Photographer_groom_prep_-300x200.jpg` | `/assets/27f93a8d1febf19b.jpg` | 301 |
| `/wp-content/uploads/2023/09/0011_Beck_NJ_wedding_ReadyToGoProductions.com--300x200.jpg` | `/assets/5d8abce7e18d678e.jpg` | 301 |
| `/wp-content/uploads/2023/09/32_ReadyToGoPRODUCTIONS_New-York_New-Jersey_Wedding_Photographer_bridal-prep_-300x200.jpg` | `/assets/7ca971657a048122.jpg` | 301 |
| `/wp-content/uploads/2023/01/weddingvow-225x300.png` | `/assets/0f7ee9c2dc1ffc9b.png` | 301 |
| `/wp-content/uploads/2023/09/0038_Jen_Mike_NJ_Wedding_readytogoproductions.com--300x200.jpg` | `/assets/7bc270c5eee6aa20.jpg` | 301 |
| `/wp-content/uploads/2023/09/MER_0066-200x300.jpg` | `/assets/863e52aa07232c47.jpg` | 301 |
| `/wp-content/uploads/2023/01/IMG_3846_Megan-_ReadyToGoProductions.com-wedding-2-1-scaled-1-300x200.jpg` | `/assets/42eefc8891ef25b9.jpg` | 301 |
| `/wp-content/uploads/2023/09/23_details_ReadyToGoPRODUCTIONS.com_New-York_New-Jersey_Wedding_Photographer_JP-131-300x200.jpg` | `/assets/5832c5239d94cecb.jpg` | 301 |
| `/wp-content/uploads/2023/09/IMG_0420_Glendaly_ceremony_ReadyToGoPRODUCTIONS.com_new-York_wedding-200x300.jpg` | `/assets/02d9ad5ccd3ac7b9.jpg` | 301 |
| `/wp-content/uploads/2023/09/196_ReadyToGoPRODUCTIONS_New-York_New-Jersey_Wedding_Photographer_bridal-prep_-200x300.jpg` | `/assets/985b0631daa20fa4.jpg` | 301 |
| `/wp-content/uploads/2023/09/21_details_ReadyToGoPRODUCTIONS.com_New-York_New-Jersey_Wedding_Photographer_JP-133-300x200.jpg` | `/assets/a05fc8e0bb81583e.jpg` | 301 |
| `/wp-content/uploads/2023/01/wedding-300x288.png` | `/assets/51d4600e1d8156ef.png` | 301 |
| `/wp-content/uploads/2023/01/0984_Beck_NJ_wedding_ReadyToGoProductions.com-scaled-1-300x200.jpg` | `/assets/9c80005083bb8366.jpg` | 301 |
| `/wp-content/uploads/2023/01/0878_Gallo_selects_the_rockleigh_nj_Readytogo.nyc-scaled-1-200x300.jpg` | `/assets/298b5f600188d75f.jpg` | 301 |
| `/wp-content/uploads/2023/09/MER_0214-200x300.jpg` | `/assets/cc1309e72013f6e6.jpg` | 301 |
| `/wp-content/uploads/2023/09/2425_Jen_Mike_NJ_Wedding_readytogoproductions.com--200x300.jpg` | `/assets/831f5913b126b996.jpg` | 301 |
| `/wp-content/uploads/2023/01/1124_Jen_Mike_NJ_Wedding_readytogoproductions.com-scaled-1-200x300.jpg` | `/assets/a638ab7e15efe914.jpg` | 301 |
| `/wp-content/uploads/2023/01/fxkBiADQ-scaled-1-200x300.jpeg` | `/assets/e4453d59b3255ca5.jpeg` | 301 |
| `/wp-content/uploads/2023/09/452_ReadyToGoPRODUCTIONS_New-York_New-Jersey_Wedding_Photographer_bridal-party_-200x300.jpg` | `/assets/f5693d63fc53554c.jpg` | 301 |
| `/wp-content/uploads/2023/01/weddingring-225x300.png` | `/assets/168587d53e233f93.png` | 301 |
| `/wp-content/uploads/2023/01/0693_Gallo_selects_the_rockleigh_nj_Readytogo.nyc-scaled-1-300x200.jpg` | `/assets/0449ef5c06c908ea.jpg` | 301 |
| `/wp-content/uploads/2023/01/0597_Jen_Mike_NJ_Wedding_readytogoproductions.com-scaled-1-200x300.jpg` | `/assets/92ba75c0a9b1a3c2.jpg` | 301 |
| `/wp-content/uploads/2023/01/BCzNs6wQ-1-scaled-1.jpeg` | `/assets/f3d8c00fbc0de34d.jpeg` | 301 |
| `/wp-content/uploads/2023/01/1124_Jen_Mike_NJ_Wedding_readytogoproductions.com-scaled-1.jpg` | `/assets/5b571a210b952d2d.jpg` | 301 |
| `/wp-content/uploads/2023/09/MER_0066-scaled.jpg` | `/assets/96e592c7fe974f2a.jpg` | 301 |
| `/wp-content/uploads/2023/01/0597_Jen_Mike_NJ_Wedding_readytogoproductions.com-scaled-1.jpg` | `/assets/d0d37b0888caf8df.jpg` | 301 |
| `/wp-content/uploads/2023/09/MER_0214-scaled.jpg` | `/assets/dde07e4de3c9b51c.jpg` | 301 |
| `/wp-content/uploads/2023/01/thumbnail1.png` | `/assets/6366a32498d3e349.png` | 301 |
| `/wp-content/uploads/2023/09/0036_Jen_Mike_NJ_Wedding_readytogoproductions.com--scaled.jpg` | `/assets/2ca0b2f49902936d.jpg` | 301 |
| `/wp-content/uploads/2023/01/wedding.png` | `/assets/a437107a1d0d2978.png` | 301 |
| `/wp-content/uploads/2023/09/23_details_ReadyToGoPRODUCTIONS.com_New-York_New-Jersey_Wedding_Photographer_JP-131-scaled.jpg` | `/assets/69d6427ed56583a7.jpg` | 301 |
| `/wp-content/uploads/2023/09/21_details_ReadyToGoPRODUCTIONS.com_New-York_New-Jersey_Wedding_Photographer_JP-133-scaled.jpg` | `/assets/316b610b7c81e5a1.jpg` | 301 |
| `/wp-content/uploads/2023/09/0011_Beck_NJ_wedding_ReadyToGoProductions.com--scaled.jpg` | `/assets/ccf02643cefdcf5e.jpg` | 301 |
| `/wp-content/uploads/2023/09/0038_Jen_Mike_NJ_Wedding_readytogoproductions.com--scaled.jpg` | `/assets/94eca36e5e19e6e0.jpg` | 301 |
| `/wp-content/uploads/2023/09/60_details_ReadyToGoPRODUCTIONS.com_New-York_New-Jersey_Wedding_Photographer_JP-5-scaled.jpg` | `/assets/c21fc4aba52dc67a.jpg` | 301 |
| `/wp-content/uploads/2023/09/IMG_0420_Glendaly_ceremony_ReadyToGoPRODUCTIONS.com_new-York_wedding-scaled.jpg` | `/assets/0d24222a3a679640.jpg` | 301 |
| `/wp-content/uploads/2023/09/452_ReadyToGoPRODUCTIONS_New-York_New-Jersey_Wedding_Photographer_bridal-party_-scaled.jpg` | `/assets/e4af9615d9109ffc.jpg` | 301 |
| `/wp-content/uploads/2023/09/144_ReadyToGoPRODUCTIONS_New-York_New-Jersey_Wedding_Photographer_bridal-prep_-scaled.jpg` | `/assets/aa5ff845eeb997a9.jpg` | 301 |
| `/wp-content/uploads/2023/09/2425_Jen_Mike_NJ_Wedding_readytogoproductions.com--scaled.jpg` | `/assets/acc2c78575cd512d.jpg` | 301 |
| `/wp-content/uploads/2023/09/196_ReadyToGoPRODUCTIONS_New-York_New-Jersey_Wedding_Photographer_bridal-prep_-scaled.jpg` | `/assets/ff69cdc39f25c0a6.jpg` | 301 |
| `/wp-content/uploads/2023/09/32_ReadyToGoPRODUCTIONS_New-York_New-Jersey_Wedding_Photographer_bridal-prep_-scaled.jpg` | `/assets/04d9b784dbe54c20.jpg` | 301 |
| `/wp-content/uploads/2023/01/IMG_3846_Megan-_ReadyToGoProductions.com-wedding-2-1-scaled-1.jpg` | `/assets/7353475231731939.jpg` | 301 |
| `/wp-content/uploads/2023/09/82_ReadyToGoPRODUCTIONS_New-York_New-Jersey_Wedding_Photographer_groom_prep_-scaled.jpg` | `/assets/dc1cc8444ad476be.jpg` | 301 |
