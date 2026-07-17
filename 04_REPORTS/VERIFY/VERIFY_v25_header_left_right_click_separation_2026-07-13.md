# VERIFY v25: Header Left/Right Click Separation

Ngay: 2026-07-13
Ket qua: PASS

## Dieu chinh
- Click trai tren header cot chi chon cot.
- Double-click tren header cot moi mo Column Properties.
- Click nut `...` tren header cot mo Column actions.
- Chuot phai tren header/o du lieu van mo menu ngu canh.

## Kiem tra ky thuat
- `node --check work\v25_inline.js`: PASS.
- 4 ban HTML dong bo cung checksum sau khi sua.
