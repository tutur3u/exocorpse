# Admin upload and Drive file policy

Upload signing requires a valid admin session and validates declared purpose,
MIME type, extension, size and path before requesting a create-only signed URL.
Overwrite requests are rejected. CMS uploads and Drive uploads use random UUID
suffixes, so another upload of the same filename creates a different object.
Names without a Latin stem keep their extension and use `upload-<uuid>`, for
example `画像.png` becomes `upload-<uuid>.png`.

CMS purposes come from `scripts/exocorpse-cms-schema.ts`. Raster images are
allowed where the collection supports image assets or markdown. Audio, video,
and documents require those collection asset types. CMS paths have exactly three
segments: `purpose/entry-slug/filename`.

Drive uploads stay under `drive/root`. New filenames and new folder or rename
names use strict character checks. Existing paths use structural checks instead,
so parentheses, ampersands, apostrophes, brackets and non-Latin names remain
accessible. Existing paths reject empty segments, `..`, percent encodings,
backslashes, control and format characters, and paths outside `drive/root`.
The empty listing path remains available for the project overview.

## Accepted Drive files

The MIME type and extension must match a pair in `src/lib/upload-policy.ts` or
`src/lib/upload-media.ts`. `application/octet-stream` is accepted only for the
listed download extensions, not arbitrary filenames.

| Use                    | Extensions                                                                                       | Behavior                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Raster images          | png, jpg, jpeg, webp, avif, gif                                                                  | Inline when the response MIME also matches                                        |
| Audio                  | mp3, ogg, oga, wav, m4a                                                                          | Inline when the response MIME also matches; m4a accepts audio/mp4 and audio/x-m4a |
| Video                  | mp4, webm, ogv                                                                                   | Inline when the response MIME also matches                                        |
| Documents              | pdf, doc, docx, xls, xlsx, ppt, pptx, csv, json, txt                                             | Download only                                                                     |
| Archives               | zip, 7z, rar, tar, gz, tgz, bz2, xz                                                              | Download only                                                                     |
| Art and other binaries | psd, psb, clip, kra, ora, blend, fbx, obj, stl, afdesign, afphoto, ase, aseprite, procreate, bin | Download only                                                                     |

HTML, SVG, XML, XHTML and script MIME types are rejected. Their extensions are
also excluded from the `application/octet-stream` allowlist.
The signing metadata limit is 50 MiB, or 10 MiB for `application/pdf` and
`text/plain`. That limit applies to the declared MIME type.

## Drive responses

Drive previews use image, audio or video elements for allowlisted media. Other
files have a download link. Files pass through an authenticated streaming
response with `X-Content-Type-Options: nosniff`,
`Content-Security-Policy: sandbox; default-src 'none'` and private no-store
caching. Non-media and forced downloads use `Content-Disposition: attachment`
and `application/octet-stream`. Historical HTML and SVG objects also download
as attachments.

The response forwards range headers, drops `Content-Length` and counts streamed
bytes. A declared response length over 50 MiB fails before streaming starts.
If an undeclared or incorrect length exceeds the cap after headers are sent,
the stream errors and cancels the upstream body. It cannot change the already
sent response status to 413.

Storage URLs require an exact HTTPS origin, no credentials and no redirect
following. The known Supabase signed-object origin is enabled by default. R2
installations configure their exact origin through the server-only
`EXOCORPSE_STORAGE_ORIGIN` variable.

## Residual storage risk and platform follow-up

The application validates declared metadata. Storage does not enforce the
content type or size through the current signed upload URL, so its holder can
upload other bytes or declare another stored MIME type. Drive serves those
objects through the attachment or restricted media response above. CMS images
are rendered through image elements, but their storage URLs remain directly
reachable, and the CMS asset route redirects to storage without adding these
Drive response headers. This PR does not close the storage-layer gap.

The Tuturuuu platform follow-up is to configure bucket MIME allowlists and size
limits. R2 signing must bind content type and length. Object registration can
also verify stored MIME, size and magic bytes before publishing a CMS asset.
Authenticated provider uploads and browser acceptance remain release checks.

## Verification

Run `bun test src/lib/upload-preview-security.test.ts`, `bun run check` and
`bun run build`. The focused suite covers the original security cases, legacy
names, a 6 MiB file that starts streaming before completion, the byte cap,
download-only types, unique names and the m4a alias. The streaming test is local
and does not establish deployed Vercel behavior.
