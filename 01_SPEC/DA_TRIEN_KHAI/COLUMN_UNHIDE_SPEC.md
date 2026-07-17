# COLUMN_UNHIDE_SPEC

**Boi canh:** Panel WORKSPACE_NAVIGATOR (bang Name / Last Update ben phai) da co chuc nang **an (hide) cot** nhung chua co cach **hien lai (unhide)** cot da an -> cot bi mat vinh vien khoi UI cho toi khi reload/reset.

## Yeu cau

| # | Noi dung |
|---|----------|
| 1 | Them entry point de unhide cot da an - click phai header cot bat ky (hoac icon "..." cuoi hang header) -> menu co muc **"Hien tat ca cot"** / liet ke tung cot dang an de bat lai rieng le |
| 2 | Trang thai an/hien cot phai luu theo phien panel (khong mat khi dong/mo lai panel trong cung session) |
| 3 | Khong gioi han so cot co the an - nhung toi thieu giu lai cot **Name** (khong duoc an) |

## UI tham khao

- Giong pattern Smartsheet: click phai header -> "Hide Column" de an; de hien lai - right-click bat ky cot lan can -> "Show Columns" liet ke danh sach cot dang an, tick de hien lai tung cot.

## Acceptance criteria

- [ ] An 1 cot -> cot bien mat khoi bang
- [ ] Right-click header con lai -> thay muc liet ke cot dang an
- [ ] Chon cot trong danh sach -> cot hien lai dung vi tri cu
- [ ] Cot Name luon hien thi, khong co option an

