# VERIFY v25 - Report delete multi selection

Ngay: 2026-07-13
Ket qua: PASS

## Noi dung da kiem

- Tao sheet/report tam trong browser, khong ghi vao backup du lieu that.
- Quet vung 2x2 trong Report, nhan Delete: 4 o nguon tuong ung ve rong, o ngoai vung giu nguyen.
- Quet 2 o trong Report, nhan Backspace: 2 o nguon tuong ung ve rong.
- Khi cell Report dang `contenteditable`, Delete khong kich hoat clear selection.

## Ky thuat

- `node --check work\v25_inline.js`: PASS.
- 4 ban HTML v25 dong bo checksum: `E0B3EFCBBEB4CC129F3684652C7906CB16C2F8FFCCE6986A166805F3ABB48719`.
