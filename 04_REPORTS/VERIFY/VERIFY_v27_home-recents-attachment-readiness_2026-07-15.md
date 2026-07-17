# VERIFY v27 - Home/Recents and attachment preview readiness

Date: 2026-07-15
Status: PASS for automated regression and packaged contract checks

## Delivered

- Home opens the existing project overview with project list, selected project files, and sharing panel.
- Recents uses the same overview and orders projects using persisted recent activity.
- Opening Workspace, Sheet, Report, or Dashboard moves its project to the top of Recents.
- Recents stores at most 10 valid project indexes and falls back to current project order when history is empty.
- Attachment eye preview is disabled while the file is uploading or has no view link.
- Local and Drive links that are ready still use the existing preview flow.
- Dynamic View remains removed.

## Verification

- Module tests: 35/35 passed.
- Changed JavaScript modules: syntax passed.
- Packaged inline JavaScript: syntax passed.
- Packaged required contracts: passed.
- SHA-256: 0EA186147870F032426AB6F2F84521AA53BC606EC17FEC3A66267433C1A1D8BE.
- Chrome headless runtime verification: Trang chu, Gan day, and Du an all activate the correct rail state; 2 project rows remain rendered; no JavaScript errors.

## Output

- 02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/v27_baseline.html
- 02_SOURCE/02_SAN_PHAM_DON_FILE/STAGING/giao-dien-desktop-don-gian_v27_quan.html
- 02_SOURCE/02_SAN_PHAM_DON_FILE/BANDIAO/giao-dien-desktop-don-gian_v27_quan.html
- 02_SOURCE/02_SAN_PHAM_DON_FILE/apps-script/Index_v27.html
## Navigation startup fix

- Moved shared startup helpers and menu/navigation state before the initial Workspace Browse render.
- Guarded Forms, Publish, Automation, and user-name callbacks until main.js has initialized.
- Restored workspace-navigator.js to UTF-8/LF after packaging verification.
