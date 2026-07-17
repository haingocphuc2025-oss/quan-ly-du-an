# SPEC v27: Home/Recents overview and attachment preview readiness

Trang thai: DA_TRIEN_KHAI
Ngay: 15/07/2026

## Muc tieu

1. Trang chu va Gan day dung cung bo cuc overview hien co:
   - Cot trai: danh sach du an.
   - Vung giua: danh sach file cua du an dang chon.
   - Cot phai: thong tin chia se.
2. Gan day uu tien cac du an vua duoc mo/thao tac.
3. Nut mat trong Attachments chi xem khi file da san sang.

## Pham vi

- Ap dung cho v27.
- Khong doi giao dien muc Du an, Grid, Report hoac Dashboard.
- Khong doi cau truc du lieu sheet/report.

## Hanh vi Trang chu

- Hien tat ca du an.
- Giu du an dang xem neu con hop le; neu khong thi chon du an dau tien.
- Chon dong du an cap nhat danh sach file va panel chia se.

## Hanh vi Gan day

- Luu toi da 10 du an vua mo.
- Moi lan mo Workspace, Sheet, Report hoac Dashboard thi dua du an len dau.
- Neu chua co lich su, dung thu tu du an hien tai de man hinh khong rong.
- Chon dong du an cap nhat danh sach file va panel chia se.

## Hanh vi Attachments

- Co URL local hop le: nut mat mo file local.
- Co URL Drive/view/preview: nut mat mo preview.
- Dang luu local hoac dang upload Drive ma chua co URL: nut mat disabled, tooltip "Dang tai len".
- Upload loi/mat link: nut mat disabled, tooltip noi ro file chua co link xem.
- Ten file khong duoc mo preview khi file chua san sang.
- Download/xoa hang loat giu nguyen.

## Tieu chi chap nhan

1. Bam Trang chu thay danh sach du an + file cua du an dang chon + panel chia se.
2. Bam Gan day thay cung bo cuc va du an vua mo nam dau.
3. Mo Sheet/Report/Dashboard roi quay lai Gan day thi du an do nam dau.
4. File dang upload khong hien alert "chua co link" khi bam mat; nut mat bi disabled.
5. File co link xem van preview binh thuong.
6. Muc Du an va cac view khac khong bi thay doi.
7. Toan bo test v27 PASS.

## Ket qua trien khai

- Home va Recents dung chung overview du an/file/chia se.
- Recents luu toi da 10 du an.
- Attachment preview disabled khi file chua co URL xem.
- Test: 35/35 PASS.
- Baseline SHA-256: 8E51E7AB04F3AF0426D5B7B97AB955FC78410601A8301A6662C03CE97FC00B86.
- Kiem tra hinh anh truc tiep chua chay duoc do browser runtime bi loi Windows sandbox helper.