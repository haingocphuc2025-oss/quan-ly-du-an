# Release v28

Ngay: 2026-07-16

## Nguon
- Tao tu v27, hoan thien File menu full implementation.

## Tinh nang
- **File menu full implementation**: Create New, Import, Open, Save, Save as New, Save as Template, Rename, Refresh, Share, Send as Attachment, Email Shared Users, Export, Print, Delete, Activity Log, Properties.
- **Import submenu**: CSV/Excel voi file picker, CSV parser (quoted cell), preview, Append/Replace mode.
- **Export submenu**: Excel, PDF, PNG, Google Sheets voi icon mau.
- **Keyboard navigation**: ArrowDown/Up, ArrowRight (mo submenu), Escape, Enter, Home/End.
- **Hover bridge**: Giu submenu open khi di chuot giua menu chinh va submenu.
- **Toast notification**: Thong bao hanh dong.
- **Modal dialogs**: Create New, Save as Template, Rename, Delete, Share, Properties, Activity Log.
- **No more "Coming soon"**: Tat ca File menu items da co handler.

## File tao/cap nhat
- `VERSIONS/v28_baseline.html` + `v28_baseline_modules/`
- `STAGING/giao-dien-desktop-don-gian_v28_quan.html`
- `BANDIAO/giao-dien-desktop-don-gian_v28_quan.html`
- `RUN_V28_LOCALHOST.bat`

## Verify
- ✅ VERIFY_v28_file_menu — 56/56 Node tests PASS, Chrome headless smoke PASS, 5 artifact same SHA.

## SHA-256
`656430F739EC3170CA5879A33C08E2E116C76BDFFB4A2A257FBD43C0654FC035`
