# QUY TRINH THI CONG

## 1. Nhan viec

- Chi nhan spec trong `../01_SPEC/01_DA_DUYET/`.
- Moi dot chi co mot spec chinh va mot output version.
- Ghi spec, baseline, output va trang thai vao `TRANG_THAI.md`.

## 2. Chuan bi

- Doc spec va chi nap cac file code lien quan.
- Xac nhan baseline ton tai va khong sua truc tiep baseline.
- Liet ke tieu chi chap nhan, test case va phu thuoc truoc khi code.
- Neu spec mau thuan hoac thieu quyet dinh quan trong: dung thi cong va tra lai cho buoc duyet.

## 3. Thi cong

- Tao output moi trong `02_SAN_PHAM_DON_FILE/STAGING` tu baseline da chot.
- Chi sua trong pham vi spec.
- Khong tu them tinh nang, khong quay lai huong ky thuat cu neu spec khong yeu cau.
- Moi thay doi backend phai ghi ro co can deploy lai hay khong.

## 4. Kiem tra cua nha thau

- Kiem tra cu phap/build phu hop voi codebase.
- Chay tat ca test case trong spec.
- Kiem tra luong chinh, loi, du lieu rong va hoi quy tinh nang cu.
- Voi giao dien web: console khong co loi va kiem tra tren trinh duyet thuc.
- Ghi ket qua PASS/FAIL; khong ghi PASS neu chua chay.

## 5. Ban giao

Tao mot file trong `03_BAN_GIAO/` theo `MAU_BAN_GIAO.md`, kem:

- Duong dan san pham staging.
- Baseline va output version.
- Tom tat file/ham da thay doi.
- Bang ket qua test co bang chung.
- Loi con ton tai va pham vi chua lam.
- Yeu cau deploy/migration neu co.

## 6. Nghiem thu

- Nguoi nghiem thu test doc lap theo tieu chi chap nhan.
- `DAT`: tat ca tieu chi bat buoc dat, khong co loi nghiem trong, bang chung day du.
- `KHONG DAT`: ghi test case loi, ket qua thuc te va cach tai hien; tra lai staging, khong nang baseline.

## 7. Phat hanh baseline

Chi sau nghiem thu dat:

1. Copy san pham da nghiem thu sang `02_SAN_PHAM_DON_FILE/VERSIONS/vNN_baseline.*`.
2. Cap nhat `TRANG_THAI.md`.
3. Cap nhat changelog/release note cua codebase neu co.
4. Giu staging va bien ban de truy vet.

## Definition of Done

- Dung spec da duyet.
- Tat ca tieu chi chap nhan va test bat buoc dat.
- Khong co loi console/build nghiem trong.
- Co ban giao va bang chung.
- Da nghiem thu dat.
- Baseline va trang thai da cap nhat.
