# GioLina Films migration checkpoint

## September 30, 2026 — homepage inquiry and mobile layout

- Resumed from latest source revision e7c9d0d.
- Both desktop and mobile hero buttons now say Inquire and link to /contact-us-2/ in the same tab.
- Added responsive mobile header, hero spacing, photo stacking, uncropped center photo and text sizing fixes. Menu toggles now update accessibility visibility and keyboard link access.
- Preserved latest Vimeo 548643452, font declarations, real photos and complete Alexandria P review.
- Build/check passed: 26 routes plus 404, 915 asset references, internal links and preview protections.
- Verified hosted homepage contains both inquiry destinations. Browser click successfully opened Contact Us. Desktop has no horizontal overflow at 1363px. Hosted responsive CSS matches the updated source.
- Phone-width visual QA remains blocked: available browser controls do not provide viewport emulation. Mobile visual completion is not claimed.
- Vimeo playback is restricted in the verification browser; embed remains unchanged. Preview contact delivery remains disabled and is an outstanding migration gate.
- No production, DNS, email or client-system changes. No production cutover.

Historical recovery notes remain in the existing migration record; this repository checkpoint contains only current website implementation and validation details.

## September 30, 2026 — Bianca & Bobby photo

- User phone screenshot showed the groom cropped off the featured wedding photograph.
- Replaced fixed background sizing/offset with contain, centered positioning and the original 617:683 image aspect ratio. Removed the artificial spacer from this photo container; mobile column uses full available width.
- Original image file unchanged. Build/check passed for all 26 routes and 915 asset references.
- Commit 77558740 deployed: hosted CSS byte-matches source; browser computed background-size contain and aspect-ratio 617/683 at 582.42 by 644.72 pixels, preserving the complete photograph.
- Phone viewport emulation remains unavailable; mobile behavior uses the same uncropped rule. Production and protected systems unchanged.

## September 30, 2026 — featured wedding button

- Removed the entire Learn More button widget from the Bianca & Bobby homepage section, per request. Featured photo, heading and description preserved; other section buttons unchanged.
- Source commit 3d290144. Local build and check passed for 26 routes and 915 asset references.
- Cloudflare preview deployment verification follows this commit; production and protected systems unchanged.

## September 30, 2026 — Experience and closing photos

- User mobile screenshots showed cropped Experience portrait and closing wedding image.
- Experience portrait now uses contain and original 1707:2560 proportions; mobile negative overlap and photo spacers removed, with consistent margins.
- Mobile closing photo now displays fully at original 2560:1707 proportions. Existing Allura headline moved below photograph with dark text on white, preserving faces and readability. Experience Learn More button retained.
- Original photos, latest Vimeo, fonts, complete review and other content unchanged. Build and check passed for all 26 routes and 915 asset references. CSS asset paths checked locally.
- Source commit 6c15f9d6. Native Cloudflare preview deployment verification follows; actual phone viewport verification remains unavailable in this browser. No production or protected-system changes.
- Prior featured-wedding button removal confirmed in hosted HTML and browser after its native deployment.

## September 30, 2026 — featured wedding spacing cleanup

- Previous Experience/closing changes deployed: hosted CSS byte-matched source; Experience portrait computed contain at original 1707:2560 proportions.
- Removed Bianca & Bobby description 'Learn more about this beautiful wedding.' and both empty blue sections adding 300px of mobile padding. Reduced remaining featured section padding and removed text spacer. Uncropped photo, location and names retained.
- Source commits 10f53c3b and fb4a410c. Build/check passed for 26 routes and 915 asset references. Preview verification follows; production and protected systems unchanged.

## September 30, 2026 — Experience page redesign proposal

- Rebuilt /experience-2/ as a scoped editorial page: warm ivory, deep teal, serif/script headings, full real photos, clear three-stage process, Mina's complete existing review, surprise engagement film, native FAQ disclosures and Contact Us invitations.
- Kept page route, header/footer, metadata and canonical. Reused existing image assets and Vimeo 236688446; no generated media or new service promises, packages or turnaround guarantees. Homepage refinements and complete review unchanged.
- FAQ fees/custom proposal language based on existing page. Consultation now links existing scheduler; inquiry calls link /contact-us-2/. Removed redundant old-brand/corporate-event content from this redesigned page; original remains available in Git history and reviews elsewhere.
- Added isolated public/experience.css; mobile columns stack and images use intrinsic dimensions. Build/check passed: 26 routes and 910 asset references. Native details require no extra JavaScript.
- Source commits b9e28704 and ae6a708b. Preview only; final design acceptance remains with user. Previous source version can be restored if page is not wanted. No production, DNS, email or client-system changes.
- Verification: native Cloudflare preview deployment is pending observation at this checkpoint. Phone viewport verification and third-party playback limitations remain as previously recorded.

### Experience redesign hosted verification
- Redesigned page observed on Cloudflare preview with full photos, new typography/layout and preserved complete Mina review. Both images loaded successfully; no desktop horizontal overflow; FAQ expands and displays its answer. Contact Us destinations retained.
- Added scoped header Schedule sizing fix in ca7a8c40. Vimeo engagement player reports connection security restriction in this browser; actual playback not claimed. Phone-width visual QA remains unavailable.
- Homepage spacing cleanup also verified: empty blue sections and descriptive line absent in hosted DOM; section bottom padding 32px.

## September 30, 2026 — decorative font consistency

- User requests readable white Experience statement and consistent elegant fonts going forward.
- 'The best moments are the ones you feel' now explicitly white, including its emphasized word, in Allura script with responsive 48–74px sizing and 1.18 line height. This prevents inherited theme heading color from reducing contrast on deep teal.
- Design preference: Allura is the single decorative/elegant script throughout future GioLina changes, matching current homepage script headings. Keep body and navigation typography readable; avoid introducing additional script families.
- Source commit ac6dab23. Preview deployment verification follows; no production/protected-system changes.

## September 30, 2026 — Instagram link review checkpoint

- Requested review of @giolinafilms for curated website hyperlinks remains incomplete: public profile/grid accessible, but individual posts require sign-in and the chosen authentication flow returns to the login page.
- Existing Instagram profile hyperlinks retained in the site header/footer. No unreviewed posts, captions or media added.
- Experience statement previously verified on preview as white Allura text. Website design/source unchanged in this checkpoint; no production, DNS, email or client-system changes.
