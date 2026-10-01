# GioLina website migration checkpoint

## September 30, 2026 — design and layout

- Homepage buttons say Inquire and link to Contact Us.
- Bianca & Bobby section shows the complete original photo. Removed its Learn More button, description and excess cyan space.
- Homepage Experience portrait and closing photo preserve their full proportions. Latest homepage video, original photos, fonts and full reviews preserved.
- Experience page redesigned with real photos, editorial spacing, process sections, complete review, engagement film, FAQ and inquiry links.
- Allura is the shared elegant script. The Experience statement is white and readable.
- Brand accents use cyan #19B5BC consistently. Contact scheduling control matches Submit; Experience buttons and statement background use the same cyan.
- Contact fields are editable. Contact guidance and scheduling page added.
- Approved reply wording: “Thank you for reaching out to GioLina! We’ve received your inquiry and will be in touch soon. We look forward to hearing more about your day.”
- Automatic reply activation remains pending.

## September 30, 2026 — portrait sizing corrections

- Applied shared phone header sizing across all pages.
- At widths up to 767px, contact fields stack into one column.
- Inputs use a minimum 16px font size to help prevent automatic iPhone focus zoom.
- Bounded card/button widths, border-box sizing and wrapping reduce overflow.
- Source revision a6e55e17 deployed; responsive rules verified in the loaded preview stylesheet.
- Build and checks passed for 26 routes and 910 asset references.
- Desktop preview checked. Actual phone portrait visual confirmation remains pending a user screenshot; available browser controls do not support phone viewport sizing.

## Remaining verification

- Confirm portrait layout against the user's phone screenshot.
- Complete human verification and post-verification submission testing.
- Automatic reply not activated; paid-plan requirement remains unresolved.
- Third-party video playback verification remains limited in the verification browser.
- Production and protected systems unchanged.

This user-approved shortened log contains design changes and test results only.

## September 30, 2026 — homepage photo collage on phones

- User portrait screenshot identified cropped homepage collage images. Original phone styles used fixed background sizes, negative offsets and artificial spacers.
- At phone widths, both collage rows now use two fluid columns with a 16px gap and 24px side margins. Each of the four original images uses centered contain sizing and its own original aspect ratio. Removed photo offsets and spacer heights in those rows only.
- Centered the introductory heading and removed its asymmetric phone padding. Original photos and all other media, fonts, cyan accents and complete reviews preserved; desktop collage styles unchanged.
- Source revision 7eb608e6. Build/check passed for 26 routes and 910 assets. Hosted stylesheet verification follows deployment; actual portrait visual confirmation remains with the user's phone because browser viewport emulation is unavailable.
- Production and protected systems unchanged.

- Hosted collage verification: preview loaded the exact phone grid, contain sizing and four original aspect ratios. All four original photo references retained. Desktop content width equals viewport width at 1348px; no horizontal overflow observed. Phone visual confirmation still pending.


## October 1, 2026 — scheduling interruption recovery

- Reopened existing giolinafilms/Giolina repository and read migration log before work. Main was ee6612f783b4e1729f286a44d05b48f92ff37b0c: the prior consultation move had already been committed and deployed.
- Live preview Contact Us contains one consultation invitation immediately after the contact form: “Ready to talk about your day?”, explanatory text, and “Schedule a consultation”. No duplicate invitation in the contact-info column. Existing cyan button, script heading and card styling retained. No product-source change needed.
- Desktop browser verified rendered placement below Submit, cyan rgb(25,181,188), and no page horizontal overflow at 1363px. Button successfully navigated to /schedule-a-meeting-2/, where the existing client scheduling link is present.
- Live migration.css exactly matches repository source. Phone rules verified: one-column form fields, 16px inputs, full-width consultation button, bounded card widths and wrapping. Actual phone visual QA remains unverified because the available browser has no viewport resize/emulation capability; keyboard zoom did not change innerWidth. Do not claim a mobile visual pass.
- Formspree endpoint and homepage Vimeo ID 548643452 preserved. No form submission, appointment booking, service setting, domain or production cutover performed.


## October 1, 2026 — direct scheduling from Contact Us

- User requested combining consultation scheduling with Contact Us and opening the live scheduler directly. Changed only the consultation button href to https://clients.giolina.co/schedule/61f5ca5de95956002dd1c3d7 in contact-us-2.json; kept the existing invitation below Submit, cyan styling and form intact.
- Source commit bda01487c914b8d3433fd18425b2f3fb58729c52 read back and deployed preview HTML verified. Live browser confirms the consultation button targets the client scheduler directly, without the intermediate meeting page. Same link serves desktop and phones. No booking or contact form submitted.


## October 1, 2026 — Contact Us title and redundant scheduling links

- Removed redundant Schedule anchors beside social icons from Contact Us header and footer only. Preserved consultation button below Submit and direct client scheduler destination.
- Contact Us h1 now uses shared Allura script, normal weight and responsive 48–72px sizing; footer social column fills available width.
- Local Astro build/check passed (26 routes, 910 asset references). Source revisions dd4217f and 2863cbf deployed through existing Cloudflare Git integration.
- Live browser verified no standalone Schedule links, title computed Allura/cursive at 72px, consultation href unchanged and no horizontal overflow at 1363px. Mobile font rule 48px deployed; actual phone visual remains unverified.
- No photo added yet; existing wedding photo recommended for empty area, selection open. Production/domain and service settings unchanged.


## October 1, 2026 — photos under Contact Info

- User authorized temporary photo selection to fill blank area. Reused existing black-and-white wedding photographs 9d28de469d3f3c6b.jpg and 2487c01449acd020.jpg below contact details.
- Two full-proportion images stack at maximum 420px width on desktop; phone rules display two fluid columns. No crops, generated photos, videos, duplicate scheduling links or form changes.
- Source 313a9e1 and 636bf79; local build/check passed (26 routes, 912 asset references). Hosted visual verification follows deployment; phone visual remains unconfirmed.

- Hosted desktop verified: both original photos load at 420px width, stack below Contact Info, retain full proportions, and no horizontal overflow. Consultation remains beside them below form. Phone two-column rules deployed; actual phone visual not claimed.
