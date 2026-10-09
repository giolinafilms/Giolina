# GioLina photography publication workflow

Use the existing GitHub repository and native Cloudflare preview build. Do not introduce R2 or another hosting platform without a demonstrated requirement and authorization. Photography publication does not authorize production or DNS changes.

1. Recover the latest remote branch, deployed build and private approval/selection records. Preserve newer work and existing approved page designs. Check restrictions and withdrawn-photo lists before selecting.
2. Obtain only authorized photographs from their verified SmugMug galleries or previously approved supplied files. Never invent URLs or identifiers. Do not change originals, gallery permissions or authentication.
3. Inspect candidates visually; then inspect selected display-size images for focus, expression, composition, duplicate poses and watermarks. Reuse approved selections. Verify the event type from source records and actual images.
4. Generate sRGB-oriented WebP display derivatives: ordinarily a 640px thumbnail and a display enlargement up to 1600px on the long edge, without upscaling. Quality 84 is a starting point; inspect results. Do not publish RAW or full-resolution delivery originals. Strip EXIF/XMP and other unnecessary metadata.
5. Give every photograph an opaque random public ID and filenames. Keep source names, source URLs, client/gallery identifiers, provenance, authorizations and review evidence in a private checkpoint outside Git.
6. Public catalogue fields are limited to opaque ID, approved asset paths, dimensions, category, order, generic alt text and necessary rendering metadata. Validate allowed fields and local file existence. Source photographs may visually contain event lettering; never derive public identifiers from it.
7. Use natural image proportions, responsive thumbnails, reserved dimensions and lazy loading. Load enlargements on demand. Keep existing film/presentation destinations intact.
8. Run catalogue/image validation, relevant regression tests, build and route/SEO checks. Confirm protected pages and configuration are unchanged. Review the exact publication diff and obtain any required platform approval. Never retry an unchanged rejected payload or use another route to bypass a denial.
9. Commit and publish only authorized code, documentation, sanitized catalogue and display derivatives to the existing preview branch. Confirm the matching native Cloudflare build succeeds.
10. Open the deployed preview and verify images, viewer open/next/previous/close, keyboard behavior, mobile navigation, films and CTAs. Inspect 390, 430, 768, 1024 and 1440px rendered layouts when supported. Separate code tests, rendered browser checks and physical-device acceptance in the report.

Frank reviews the final preview. Production cutover remains separately authorized. Never change DNS, mail, client portals, live client galleries or originals as part of image publication.
