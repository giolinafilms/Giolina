# Supplied short-film placement — 2026-10-06

Frank supplied the authentic matching MP4s and explicitly approved these public placements. Uploaded originals remain unchanged outside the repository. Web delivery copies are derived from the entire original films without changing the edit or audio content; H.264 CRF 23 / AAC 128 kbps / fast-start. Existing static short-film architecture is retained, with no new hosting provider or production configuration.

| Couple | Source | Placement | Delivery |
| --- | --- | --- | --- |
| Deanna & Anthony | deanaAnthony_instaCut_v03_published(1).mp4; 213,599,951 bytes; 1920×800; 111.653 seconds | Reviews only | 1280×534 web copy; poster extracted at 30 seconds from the original |
| Lauren & Tommy | 1minuteClientRecap_LaurenTommy_1920x1080_published(2).mp4; 79,071,958 bytes; 1920×1080; 59.059 seconds | Fourth anniversary entry beside Bianca & Bobby, Sara & Phil and Nicole & Philip | Full-resolution web copy; family closing poster extracted at 52 seconds from the original |

The three pre-existing anniversary cards and film sources are unchanged. Deanna is not added to the anniversary or main short browser. Her existing long wedding film in the Cinematography portfolio is preserved; only the Reviews card now plays her supplied short. Lauren's separate existing Reviews/long-film references are unchanged.

The 1920px Deanna delivery trial remained 41,067,151 bytes, exceeding the 25 MiB asset cap. The 1280px copy matches the width used by several existing shorts and retains the complete film. Both final files fit the existing static delivery limit. Source master hosting is still a future production-quality decision if original-resolution Deanna delivery is required; no destination was invented.

Final media inspection:

- deanna-anthony-review: 21,639,488 bytes, 1280×534, 111.658000 seconds
- lauren-tommy-recap: 16,696,543 bytes, 1920×1080, 59.072000 seconds

Source SHA256:
- Deanna: 5d26ec3f74543806e791acd1cc2c59dd68e70d9f2ca36cda7f777e8a4f8666e1
- Lauren: 6e17c7457084011a406a895dbe5374cc4f84d84e792519315ecc172c84d447dc

Player: native short created only after the explicit Play Film tap, controls/inline/audio on. Shared one-player cleanup, close/Escape unload and mobile CTA hiding retained. No autoplay while browsing or preload of films. Posters are actual source frames, not substitutes or screenshots of private proposals.

Source status: Deanna and Lauren supplied/verified. Christina & Danny and Stephanie & Danny authentic shorts remain unresolved. Physical iPhone swipe/audio/video and iPad/Safari footer acceptance remain open. No production, DNS, Admin/CRM data, forms, email, scheduler or integrations changed.

Local mapping/player tests, existing public-polish tests, build and SEO/public route checks pass. Hosted verification follows native preview publication.

## Hosted verification

Commits 1dc5f833497b70ae773f077eff2f0c8e7beefe04 (media/placement/player) and a16dcfc6400804534cc2ad49f423629ea14e2765 (native modal fit) both completed successful native preview builds. Hosted 390×844 and 430×932 checks show no horizontal overflow on Reviews or Cinematography. Both supplied films start from one explicit click, readyState 4, unmuted and actively advancing beyond nine seconds. Only one video/iframe exists; Close removes it completely and restores the mobile CTA. Deanna native video width equals its modal screen width. Desktop 1280×800 is overflow-free and hides the mobile CTA. Lauren’s Next film cycles to the unchanged Bianca source with one active player. All four anniversary names/cards are present. Simulated short swipe remains functional without accidental players. Private screenshot evidence is retained outside Git; no screenshots published. Physical-device acceptance remains open.

Preview: https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev/client-reviews/#deanna-2022 and https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev/portfolio-2/#gl-love-recaps-title .
