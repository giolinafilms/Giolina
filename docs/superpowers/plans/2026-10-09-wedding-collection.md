# Wedding Collection Implementation Plan

Goal: Extend the existing preview Photography page with the approved nine-category collection, preserving all 688 source selections and the existing 43-image presentation.

Architecture: Build a display-only catalogue from the public curated portfolio feeds; verify recovered category counts and selection fingerprints before generating ignored build assets. No source-photo binaries or private provenance are committed. Reuse approved, already-hosted recent derivatives where selected. The collection uses the existing page shell, category navigation and a dedicated accessible viewer.

Constraints: Preview branch only. Preserve production, client galleries/authentication, Sweet Sixteen correction, navigation, contact workflow and DNS. Private provenance lives outside this repository.

1. Test feed parsing, overlapping pagination, source selection fingerprints and original category totals. Implement build-time catalogue generation that fails on incomplete/mismatched source data.
2. Visually review recovered recent sources and hosted derivatives. Exclude new additions already represented in the original selection. Record provenance privately and approved display assets in a minimal public additions list.
3. Test category selection, history, lightbox next/previous/keyboard/swipe, focus restoration and failure feedback. Implement isolated collection controller and responsive natural-aspect grids.
4. Add Photography CTA below the untouched presentation and the collection page with existing styling and Contact Us route.
5. Validate image responses, build and regression suite. Review changes, push only preview branch, verify deployed page and rendered layouts at 390/430/768/1024/1440 where supported.

Review focus: feed pagination duplicates; unavailable external media; hash/back navigation; long portrait photographs on small screens; accidental private metadata publication.
