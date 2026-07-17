# SPEC - Report wrap cells

Ngay: 2026-07-13
Trang thai: DA_TRIEN_KHAI

## Muc tieu

Cho phep o du lieu trong Report/Repost xuong dong khi noi dung dai, tranh bi cat boi dau `...`.

## Pham vi

- Ap dung cho cac o du lieu `.report-editable-cell`.
- Giu header, group va summary dang mot dong de bang van de quet.
- Tang gioi han chieu cao dong Report de wrap co khong gian hien thi.
- Khong doi che do wrap cua Sheet thuong.

## Acceptance Criteria

- Noi dung dai trong Report hien thi nhieu dong khi row height du lon.
- Delete/Backspace nhieu o Report van PASS.
- `node --check work/v25_inline.js` PASS.
- 4 ban HTML v25 dong bo checksum `766D76727BFAF387FA1B9B4D0439868C5F670C72A71A1BFC19CB4096CDE80203`.
