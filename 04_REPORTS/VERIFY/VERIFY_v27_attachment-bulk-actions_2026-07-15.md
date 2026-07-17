# VERIFY v27 - Attachments preview and bulk actions

Date: 2026-07-15
Scope: Attachments panel in Sheet and Report views

## Implemented

- Added a real checkbox for every attachment row.
- Added a select-all checkbox in the toolbar.
- Added a monochrome eye button that reuses the existing attachment preview flow.
- Added Actions menu items for bulk download and bulk delete.
- Bulk delete confirms once, removes files from right to left, syncs the attachment cell, refreshes report badges, schedules save, and removes Drive files when an id is available.
- Existing file-name preview, single-file delete, local files, Drive links, and upload flows remain in place.
- The attachment event path now uses getAttachmentSheet so the same controls work for Sheet and Report sources.

## Verification

- Module tests: 29/29 passed.
- JavaScript syntax: all v27 modules passed.
- Inline baseline syntax: passed.
- Packaged HTML SHA-256: 53BC3F0B98372045F3BA560BD6340A561C347A869C50926FF8378392D180F5B6
- Browser visual check: blocked because the integrated browser runtime exited during setup with the Windows sandbox helper error. No visual PASS is claimed for this step.

## Output

- 02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/v27_baseline.html
- 02_SOURCE/02_SAN_PHAM_DON_FILE/STAGING/giao-dien-desktop-don-gian_v27_quan.html
- 02_SOURCE/02_SAN_PHAM_DON_FILE/BANDIAO/giao-dien-desktop-don-gian_v27_quan.html
- 02_SOURCE/02_SAN_PHAM_DON_FILE/apps-script/Index_v27.html
- 02_SOURCE/02_SAN_PHAM_DON_FILE/MODULES_V27/js/grid.js
- 02_SOURCE/02_SAN_PHAM_DON_FILE/MODULES_V27/css/main.css
- 02_SOURCE/02_SAN_PHAM_DON_FILE/MODULES_V27/tests/v27-attachment-bulk-actions.test.js