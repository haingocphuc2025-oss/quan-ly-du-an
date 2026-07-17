# SPEC - Sheet Report compact wrap spacing

Ngay: 2026-07-13
Trang thai: DA_TRIEN_KHAI

## Muc tieu

Giam khoang cach trong Sheet va Repost/Report khi noi dung wrap, de bang nhin day va gan nhau hon.

## Pham vi

- Giam padding va line-height cua o du lieu Sheet.
- Giam padding va line-height cua o du lieu Report.
- Giu wrap cho noi dung dai.
- Khong doi logic chon nhieu o, Delete/Backspace, source/filter/group.

## Acceptance Criteria

- O Sheet/Repost wrap nhung khong con thua khoang trang lon.
- Row height 24/60 Report van ap dung dung.
- Delete nhieu o Report van PASS.
- `node --check work/v25_inline.js` PASS.
- 4 ban HTML v25 dong bo checksum `16D2B49F03078C063DC87F0E36B3BB420B0E494329B27979F6EE4F708B9E065F`.
