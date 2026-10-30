# Admin editor drafts and selection

Admin fields keep their live draft while focused. A local echo from the parent
does not replace the field. The latest genuine external value waits until blur;
blur applies it to both the field and the parent draft. Selection offsets are
restored, within the new text bounds, when the user returns to the field.

`useDeferredEditorValue` owns this contract. `DraftInput` and `DraftTextarea`
adapt native and UI-package controls; `AdminMarkdownEditor` adapts the installed
rich editor. Use `onValueChange` for text, and keep React keys independent of the
text and of server IDs assigned by a first save. The plain adapters preserve
native styling through `unstyled` when replacing an existing native control.

Numbers, dates, date/time, JSON and string arrays parse on blur. Structured text
stays raw during typing, including intermediate whitespace and incomplete
syntax. `DraftEdits` marks these local edits immediately so Save is enabled;
clicking Save blurs and commits the field before its click handler runs. Invalid
JSON remains visible with its validation error and counts as unsaved work. Rejected
commits do not settle a draft, and CMS Save refuses to persist until the invalid
field is corrected. Validation clears when accepted or external content actually
replaces the live draft, rather than when a props object changes.

CMS saves retain the editing session and local block keys when the server assigns
IDs. Saved blocks match by server id first, then by submitted array position only
for a new draft with the same block type; duplicate sort orders never share a key.
If the user edits while an explicit save is in flight, its acknowledgment
updates server identity and the saved baseline while retaining newer local text,
block additions and removals. It does not close the editor over those edits.
Explicit entry navigation, create, restore and discard start a new session.
Genuine independent refreshes still follow the pending-on-blur rule.

There is no admin autosave loop. Keep explicit saves. A future autosave must
debounce persistence, bound retries and pass acknowledgments through this draft
contract rather than directly replacing a focused DOM value or rich document.

## Audit

| Surface                                                                        | Fields and handling                                                                                                          |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| AboutContentItemsEditor                                                        | Item titles, subtitles, URLs, icons, colors, ordering; shared plain drafts and rich body                                     |
| AboutSettingsForm                                                              | Hero name/role/location, labels and rich biography; source hydration is deferred per focused control                         |
| AboutFaqEditor                                                                 | Question, subtype text, template textarea and token insertion; shared plain/rich drafts                                      |
| CmsFieldEditor / CmsStructuredFields                                           | Strings, multiline, colors/palettes, soundtrack URL, numbers/dates/date-time, JSON and string arrays; stable definition keys |
| CmsEntryBasics                                                                 | Title/name, slug, summary; raw text drafts                                                                                   |
| CmsEntryEditor                                                                 | Nickname and other inline text; session remains stable across first save                                                     |
| CmsLegacyBlogEditor                                                            | Title, slug, publish date, excerpt and rich body                                                                             |
| CmsPublishingSettings                                                          | Slug and scheduled date/time                                                                                                 |
| CmsBlockEditor / CmsLegacyMarkdownField                                        | Block titles, raw structured content, rich sections; local block keys survive first save                                     |
| CmsConnectionEntryEditor                                                       | Shared rich descriptions and structured fields                                                                               |
| CmsCharacterMediaSettings                                                      | Custom warning and palette/media text                                                                                        |
| CmsCharacterGalleryOverview                                                    | Upload title; file picker remains native                                                                                     |
| CmsRelationEditor / MultiSelect                                                | Local search fields; shared plain control                                                                                    |
| CmsGalleryCharacterTagger / CmsCommissionEntryGallery / CmsBlogEntryGallery    | Local search fields                                                                                                          |
| AdminUserMenu                                                                  | Display name and read-only email; file picker remains native                                                                 |
| AdminTeamManager                                                               | Email-list textarea and member search; normalization happens at submission/filter comparison                                 |
| AdminDriveManager                                                              | Search, file/folder name and rename text; validation stays on save                                                           |
| BlacklistClient                                                                | Local search field                                                                                                           |
| BlacklistForm                                                                  | Already uses uncontrolled React Hook Form registration; no per-key value write-back or refetch reset                         |
| Installed UI Input/Textarea                                                    | Forward props directly; adapters retain their styling/ref behavior                                                           |
| Installed rich/contentEditable editor                                          | All active admin consumers go through AdminMarkdownEditor                                                                    |
| Retained shared MarkdownEditor, ImageUploader, ColorPicker, ColorPalettePicker | No active admin callers; source retained                                                                                     |
| Checkboxes, radio/select, sliders and file pickers                             | Not text selection controls; existing behavior retained                                                                      |

## Regression checks

Run focused Bun tests on an admitted host:

```sh
bun test src/components/shared/DraftTextControl.test.tsx src/components/admin/AdminMarkdownEditor.caret.test.tsx src/components/admin/cms-management/saved-block-keys.test.ts src/components/admin/cms-management/retain-edits-after-save.test.ts src/components/admin/cms-management/CmsSaveCaret.test.tsx
```

Coverage includes middle insertion and both selection endpoints for input,
textarea and rich content, external updates and save-in-flight echoes, parsing
only on blur, subsequent editing of the external value, first-save DOM identity,
Save activation and committing before its click handler, and save acknowledgment
reconciliation through the real CMS workspace hook. Number and date/time controls expose no native text-selection API;
their tests assert focused values, conversion timing and external updates.

The pre-change CMS field implementations fail the string-array, JSON refresh and
first-save identity regressions. Run `bun check` through the host resource queue
for formatting, lint, TypeScript and the full tests. Production builds run in CI.
