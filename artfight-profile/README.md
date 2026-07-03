# Exocorpse ArtFight Profile Pack

This folder contains the current official Exocorpse ArtFight profile design plus
version snapshots for previewing, comparing, and copying older packs.

## Current Files

- `inline-html.html` - paste this into an ArtFight profile field when you do not
  have Supporter CSS.
- `supporter-css.html` - paste this into the ArtFight profile field if you have
  Supporter custom CSS.
- `supporter-profile.css` - paste this into the ArtFight Supporter custom CSS
  field when using `supporter-css.html`.
- `preview.html` - standalone local browser preview.

## Versions

- Current root files - character-list design with heavier borders, captionless
  gallery tiles, and ArtFight-style character cards.
- `versions/2026-06-28-personality-shrine` - archived personality-forward
  shrine board design.
- `versions/2026-06-28-shrine-board` - archived shrine-board design.
- `versions/2026-06-28-gallery-wall` - archived gallery-wall design.
- `versions/manifest.json` - version metadata used by `/artfight-profile`.

Selecting an archived version in the preview app lets you inspect, copy, and
download that older pack without changing the current files.

## Image Setup

ArtFight profile images must use public HTTPS URLs. Upload the images you want
to use to ArtFight, Imgur, File Garden, or another stable image host, then
replace these placeholders:

- `REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_HEADER`
- `REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_MAIN_PORTRAIT`
- `REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_PAGEDOLL`
- `REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_FENRYS`
- `REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_MORRIS`
- `REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_DECOR_01`
- `REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_DECOR_02`
- `REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_DECOR_03`
- `REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_MOOD_01`
- `REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_MOOD_02`
- `REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_MOOD_03`
- `REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_MOOD_04`
- `REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_GALLERY_01`
- `REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_GALLERY_02`
- `REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_GALLERY_03`
- `REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_GALLERY_04`
- `REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_GALLERY_05`
- `REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_GALLERY_06`
- `REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_GALLERY_07`
- `REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_GALLERY_08`

Also replace `REPLACE_WITH_ARTFIGHT_USERNAME` with the real ArtFight username.
The character list currently uses the main portrait, Fenrys, Morris, and decor
image placeholders.

## ArtFight Usage

1. If you do not have Supporter CSS, use `inline-html.html`.
2. If you have Supporter CSS, use `supporter-css.html` and
   `supporter-profile.css`.
3. Replace all image placeholders with public HTTPS image URLs.
4. Use `/artfight-profile` to compare versions, preview either export mode, and
   copy/download the code.

The ArtFight-facing files avoid JavaScript and local file paths. The CSS version
is scoped under `.exo-af`.
