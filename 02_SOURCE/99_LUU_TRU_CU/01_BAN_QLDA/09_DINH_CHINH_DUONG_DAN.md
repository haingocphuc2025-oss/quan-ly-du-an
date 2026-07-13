# 📌 ĐÍNH CHÍNH ĐƯỜNG DẪN — BASELINE & STAGING

**Ngày:** 07/07/2026
**Người tạo:** Ban QLDA (Claude)
**Hiệu lực:** File này ghi đè mọi đường dẫn cũ trong QUY_TRINH_BAN_GIAO_SAN_PHAM.md và HUONG_DAN.md

---

## ❌ Đường dẫn SAI (trong các tài liệu cũ)

```
05_THI_CONG/BASELINE/                    ← KHÔNG TỒN TẠI trên Drive
05_THI_CONG/STAGING/                     ← KHÔNG TỒN TẠI trên Drive
```

> Thư mục `05_THI_CONG/` chưa bao giờ được tạo. Tài liệu tham chiếu sai.

---

## ✅ Đường dẫn ĐÚNG (thực tế trên Drive)

| Mục đích | Đường dẫn đúng | Ghi chú |
|----------|----------------|---------|
| **Baseline đã nghiệm thu** | `03_NHA_THAU_THI_CONG/VERSIONS/` | `v18_baseline.html`, `v19_...html` |
| **Staging chờ nghiệm thu** | `03_NHA_THAU_THI_CONG/STAGING/` | `giao-dien-desktop-don-gian_v{N}_quan.html` |
| **Deploy / Apps Script** | `05_TRIEN_KHAI/APPSCRIPT_DEPLOY/` | OAuth, Web App |
| **Backup** | `05_TRIEN_KHAI/BACKUP/` | Bản dự phòng |

---

## 📂 Cấu trúc file thực tế

```
03_NHA_THAU_THI_CONG/
├── STAGING/
│   ├── giao-dien-desktop-don-gian_v17_staging.html  (251KB)
│   ├── giao-dien-desktop-don-gian_v18_quan.html     (251KB)
│   └── giao-dien-desktop-don-gian_v19_quan.html     (272KB) ← staging v19 hiện tại
├── VERSIONS/
│   ├── v18_baseline.html        (251KB) ← baseline v18 ĐÃ NGHIỆM THU
│   └── v19_quan_20260706.html   (272KB) ← v19 copy (⚠️ chưa nghiệm thu chính thức)
```

---

## ⚠️ Lưu ý quan trọng

**Quy tắc promote baseline:**
- Chỉ copy file từ `STAGING/` → `VERSIONS/` **SAU KHI** BIEN_BAN_NGHIEM_THU.md được ký ĐẠT đầy đủ
- File `v19_quan_20260706.html` trong VERSIONS/ hiện được copy trước khi nghiệm thu ký chính thức → trạng thái **không chính thức**
- Khi nghiệm thu v19 được ký ĐẠT → đổi tên thành `v19_baseline.html` để rõ ràng

**Quy tắc đặt tên trong VERSIONS/:**
```
v{N}_baseline.html          ← Đã nghiệm thu chính thức ✅
v{N}_quan_{YYYYMMDD}.html   ← Chưa nghiệm thu hoặc bản làm việc ⏳
```

---

## 📋 Tài liệu cần cập nhật đường dẫn (khi có thời gian)

| File | Đường dẫn sai cần sửa |
|------|-----------------------|
| `QUY_TRINH_BAN_GIAO_SAN_PHAM.md` (root) | `05_THI_CONG/BASELINE/` → `03_NHA_THAU_THI_CONG/VERSIONS/` |
| `QUY_TRINH_BAN_GIAO_SAN_PHAM.md` (root) | `05_THI_CONG/STAGING/` → `03_NHA_THAU_THI_CONG/STAGING/` |
| CONG_VIEC.md cũ (03_NHA_THAU/) | Đã thay thế hôm nay ✅ |
