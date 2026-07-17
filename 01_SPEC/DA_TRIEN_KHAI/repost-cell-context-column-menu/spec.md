# SPEC - Repost cell right-click column menu

Ngay: 2026-07-13
Trang thai: DA_TRIEN_KHAI

## Muc tieu

Khi chuot phai vao o du lieu trong Repost/Sheet, hien menu thao tac cot tai vi tri con chuot, tuong tu menu cot tren header.

## Pham vi

- Ap dung cho grid Sheet, bao gom Repost vi Repost la sheet.
- Chuot phai vao o du lieu co cot hop le se chon cot do va mo menu cot.
- Chuot phai tren header van hoat dong nhu hien tai.
- Khong ap dung cho Report.
- Khong doi du lieu mau.
- Dong bo VERSIONS, STAGING, BANDIAO va Apps Script Index.

## Acceptance Criteria

- Chuot phai vao o du lieu Repost mo menu cot.
- Menu hien tai vi tri con chuot, khong bi lech ra ngoai viewport.
- Cot duoc chon/active dung cot cua o vua chuot phai.
- Sheet/Repost van giu cac menu header hien co.
- `node --check work/v25_inline.js` PASS.
- Browser local khong co console error.
