# VERIFY v25 - Report apply stored column widths

Ngay: 2026-07-13
Ket qua: PASS

## Noi dung da kiem

- Repost grid `REPOST_CARRY_FORWARD`: set width `sheet:0:5:c4 = 244`, save backup, xoa localStorage, apply snapshot, render lai van 244px.
- Runtime `_selectedRows` sau load backup la `Set`, khong con loi `.has is not a function`.
- Report tam trong browser: set width `251`, render lai `<col>` va `<th>` deu 251px.

## Ky thuat

- `node --check work\v25_inline.js`: PASS.
- 4 ban HTML v25 dong bo checksum: `EC7A477ED757F8397EAF734E90F889AC0221F6493D896EDB84ED500515212172`.
