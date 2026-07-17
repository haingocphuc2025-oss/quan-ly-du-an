# SPEC: Grid row and columns fix

Ngay tao: 2026-07-13
Trang thai: DA_TRIEN_KHAI

## Muc tieu
Sua Grid view de bo cot checkbox chon dong va cot cham mau mac dinh, dong thoi render checkbox cot du lieu kieu o vuong chuan.

## Pham vi
- Chi ap dung Grid view trong 02_SAN_PHAM_DON_FILE.
- Khong doi Report/Dashboard.
- Khong doi cau truc du lieu luu tru; chi doi render/interaction Grid.

## Yeu cau
1. Bo han cot checkbox chon dong o dau moi hang trong Grid view.
2. Bo han cot cham mau xanh/cam/xam khoi Grid view mac dinh.
3. Checkbox trong cot du lieu, vi du Loai ho so neu cot duoc dat type checkbox, phai hien o vuong co vien.
4. Khi checked: nen xanh duong #2563EB, dau tick trang.
5. Khi unchecked: vien xam nhat, nen trong/nhat.

## Acceptance criteria
- Grid view khong con cot checkbox chon dong.
- Grid view khong con cot cham mau.
- Checkbox du lieu hien thanh o vuong that va toggle duoc.
- Toolbar/Undo/Redo v25 tiep tuc hoat dong.
