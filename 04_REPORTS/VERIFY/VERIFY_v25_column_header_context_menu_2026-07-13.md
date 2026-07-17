# VERIFY v25: Column Header Context Menu

Ngay: 2026-07-13
Ket qua: PASS

## Da kiem tra
- Menu header cot giu lai Show Gantt va Edit Project Settings theo yeu cau nguoi dung.
- Rename Column chuyen sang sua ten inline tren header va luu vao cau hinh cot.
- Edit Column Description mo popup nhap/xoa mo ta, hien icon `i` va tooltip tren header.
- Freeze Column co tac dung sticky khi scroll ngang, hien dau trang thai tren header.
- Lock/Hide/Insert/Delete/Filter/Sort/Properties van giu luong hien co.

## Kiem tra ky thuat
- `node --check work\v25_inline.js`: PASS.
- 4 ban HTML da dong bo cung checksum SHA256: `4CACB5ADFD360E9D5157738F72C5C3A4D095E0373BD2721529E5F4A69F84808C`.
- App localhost `127.0.0.1:8766` va helper `127.0.0.1:8780` dang listen.
