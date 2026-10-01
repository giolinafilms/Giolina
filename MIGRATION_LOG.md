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
