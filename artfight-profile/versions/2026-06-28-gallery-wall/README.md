# Exocorpse ArtFight Profile Pack

This folder contains multiple versions of the official Exocorpse ArtFight profile design.

## Files

- `inline-html.html` - paste this into an ArtFight profile field when you do not have Supporter CSS. It uses inline styles only.
- `supporter-css.html` - paste this into the ArtFight profile field if you have Supporter custom CSS.
- `supporter-profile.css` - paste this into the ArtFight Supporter custom CSS field when using `supporter-css.html`.
- `preview.html` - local browser preview. This is the only file that references local repo images.

## Image Setup

ArtFight profile images must use public HTTPS URLs. Upload the images you want to use to ArtFight, Imgur, File Garden, or another stable image host, then replace these placeholders:

- `REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_HEADER`
- `REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_MAIN_PORTRAIT`
- `REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_FENRYS`
- `REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_MORRIS`
- `REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_GALLERY_01`
- `REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_GALLERY_02`
- `REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_GALLERY_03`
- `REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_GALLERY_04`
- `REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_GALLERY_05`
- `REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_GALLERY_06`
- `REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_GALLERY_07`
- `REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_GALLERY_08`

The local preview uses these repo images:

- `../public/background-image.webp`
- `../public/LykoTwins.webp`
- `../public/boot/Fenrys.webp`
- `../public/boot/Morris.webp`
- `../public/artfight-profile/gallery-preview/*.webp`

## ArtFight Usage

1. If you do not have Supporter CSS, use `inline-html.html`.
2. If you have Supporter CSS, use `supporter-css.html` and `supporter-profile.css`.
3. Replace `REPLACE_WITH_ARTFIGHT_USERNAME` with the real ArtFight username.
4. Replace all image placeholders with public HTTPS image URLs.

The ArtFight-facing files avoid JavaScript and local file paths. The CSS version is scoped under `.exo-af` so it should not intentionally restyle unrelated page elements.
