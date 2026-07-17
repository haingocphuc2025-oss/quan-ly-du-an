# VERIFY v25 - Sheet column insert delete actions

Ngay: 2026-07-13
Ket qua: PASS

## Noi dung da kiem

- Insert Column Left tai cot 4: so cot tang, header moi la `Cot moi`.
- Cot cu dich sang phai, du lieu va config/style/filter/sort/hidden/frozen dich theo.
- Delete cot cu sau insert: so cot giam, config/style/hidden bi xoa dung.
- Render sau insert/delete khong loi.

## Ky thuat

- `node --check work\v25_inline.js`: PASS.
- 4 ban HTML v25 dong bo checksum: `8BB024A5A393FA67E7D5CC81FF8EA8E4EB23A98FB305090F86FBC69C52BAEB86`.
