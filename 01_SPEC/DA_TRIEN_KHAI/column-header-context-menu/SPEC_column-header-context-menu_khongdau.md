# SPEC: Column Header Context Menu (Menu ngu canh cot)

Ngay tao: 2026-07-13
Trang thai: NEW
Tham chieu: Smartsheet column header dropdown menu (anh chup cot "Hang muc")

## Pham vi
Menu hien ra khi click vao bieu tuong dropdown/mui ten tren header cua mot cot trong grid view.

## 1. Nhom Chen/Xoa cot
| Muc | Hanh vi |
|---|---|
| Insert Column Left | Them cot moi ben trai cot hien tai, mac dinh kieu Text, ten mac dinh "Column X" |
| Insert Column Right | Them cot moi ben phai cot hien tai, tuong tu |
| Delete Column | Xoa cot va toan bo du lieu trong cot do, co confirm dialog truoc khi xoa |

## 2. Nhom Dat ten / Mo ta
| Muc | Hanh vi |
|---|---|
| Rename Column | Inline edit ten cot truc tiep tren header |
| Edit Column Description | Mo popup nhap mo ta cot, hien thi dang tooltip icon (i) canh ten cot khi hover |

## 3. Nhom Du lieu
| Muc | Hanh vi |
|---|---|
| Filter... | Mo panel loc du lieu theo gia tri cua cot nay, ap dung cho toan bang |
| Sort Rows... | Sap xep toan bang theo cot nay (tang dan A-Z / giam dan Z-A) |

## 4. Nhom Khoa / An
| Muc | Hanh vi |
|---|---|
| Lock Column | Khoa cot, khong cho sua du lieu; hien thi icon khoa tren header; van xem duoc noi dung |
| Freeze Column | Cot dung yen khi scroll ngang bang (tuong tu freeze pane trong Excel) |
| Hide Column | An cot khoi grid; co nut/menu "Show hidden columns" de hien lai |

## 5. Cau hinh cot
| Muc | Hanh vi |
|---|---|
| Edit Column Properties... | Doi loai cot: Text, Dropdown (single/multi-select co gan mau, vi du nhu cot "Hang muc" trong anh mau), Date, Contact, Checkbox, Number |

## Dieu chinh pham vi theo yeu cau nguoi dung
- Show Gantt - giu lai trong menu cot.
- Edit Project Settings - giu lai trong menu cot.

## Ghi chu
- Anh tham chieu goc: menu cot "Hang muc" trong Smartsheet, dropdown gia tri co mau (Hop dong - phap ly, Thanh toan...)
