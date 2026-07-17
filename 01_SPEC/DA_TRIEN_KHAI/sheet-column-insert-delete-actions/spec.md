# SPEC - Sheet column insert delete actions

Ngay: 2026-07-13
Trang thai: DA_TRIEN_KHAI

## Muc tieu

Menu cot trong Sheet/Repost phai insert va delete cot duoc that su.

## Pham vi

- Bo sung ham dich tham chieu cot khi insert/delete.
- Dich cau hinh cot, kieu cot, format, wrap, hidden/locked/frozen/filter/sort va cell styles.
- Luu backup sau thao tac insert/delete.
- Khong cho insert/delete cot he thong 0-1.

## Acceptance Criteria

- Insert Column Left/Right tang so cot va them header `Cot moi`.
- Delete Column giam so cot va khong bi loi JS.
- Sau insert/delete, render lai va save backup PASS.
- `node --check work/v25_inline.js` PASS.
- 4 ban HTML v25 dong bo checksum `8BB024A5A393FA67E7D5CC81FF8EA8E4EB23A98FB305090F86FBC69C52BAEB86`.
