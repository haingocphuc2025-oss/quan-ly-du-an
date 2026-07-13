# 🏗️ BẢNG ĐIỀU PHỐI DỰ ÁN — App QLDA

> **Cập nhật:** 07/07/2026 — Chuyển sang mô hình quản lý kiểu xây dựng

---

## 🚩 CỜ NHÂN SỰ

| AI | Vai trò | Trạng thái | File |
|----|---------|-----------|------|
| **Quân** | Chủ đầu tư | 🟢 Ra yêu cầu, quyết định | `00_CHU_DAU_TU/YEU_CAU.md` |
| **Claude** | Ban QLDA (Giám sát) | 🟢 Điều phối, duyệt, nghiệm thu | `01_BAN_QLDA/*` |
| **Phuc** | Nhà thầu phụ (Nghiên cứu) | 🟢 Rảnh — chờ việc | `02_NHA_THAU_PHU/GIAO_NHAN.md` |
| **Quan đại gia** | Nhà thầu chính (Code) | 🟢 **Rảnh — v18 xong, chờ việc tiếp** | `03_NHA_THAU_CHINH/GIAO_NHAN.md` |

---

## 📂 CẤU TRÚC THƯ MỤC

```
DU AN WED QUAN LY/
│
├── 📋 DIEU_PHOI.md                ← BẠN ĐANG Ở ĐÂY — bảng chỉ dẫn
│
├── 📁 00_CHU_DAU_TU/              ← Chủ đầu tư (Quân)
│   └── YEU_CAU.md                 Ghi lại yêu cầu, quyết định
│
├── 📁 01_BAN_QLDA/                ← Ban QLDA (Claude)
│   ├── HUONG_DAN.md               Quy trình làm việc
│   ├── SO_GIAO_VIEC.md            Sổ giao việc cho từng nhà thầu
│   ├── SO_NGHIEM_THU.md           Sổ nghiệm thu sản phẩm
│   └── CLAUDE_NHIEM_VU.md         Nhiệm vụ của Claude (file cũ)
│
├── 📁 02_NHA_THAU_PHU/            ← Nhà thầu phụ — Research (Phuc)
│   └── GIAO_NHAN.md               📄 1 file duy nhất: giao việc → bàn giao → nghiệm thu
│
├── 📁 03_NHA_THAU_CHINH/          ← Nhà thầu chính — Code (Quan)
│   └── GIAO_NHAN.md               📄 1 file duy nhất: giao việc → bàn giao → nghiệm thu
│
├── 📁 04_HO_SO_THIET_KE/          ← Hồ sơ thiết kế
│   ├── Planning.md                Kế hoạch tính năng chi tiết
│   └── specs/                     Spec kỹ thuật từng tính năng
│
├── 📁 05_THI_CONG/                ← Thi công — code
│   ├── BASELINE/                  File gốc đã nghiệm thu
│   │   └── giao-dien-desktop-don-gian_v17_baseline.html
│   ├── STAGING/                   File chờ nghiệm thu (Quan nộp vào đây)
│   └── apps-script/               Mã nguồn Apps Script
│
├── 📁 06_BAO_CAO_NHAT_KY/         ← Báo cáo, nhật ký
│   └── BAO_CAO_NGAY.md            Nhật ký hàng ngày
│
└── 📁 99_REF/                     ← Tham khảo, lưu trữ
    └── (các file cũ đã dọn vào đây)
```

## 📋 VIỆC ĐANG GIAO

### Nhà thầu chính — Quan (🔴 Đang code)

| # | Tính năng | Trạng thái |
|---|-----------|-----------|
| 1 | Template Project | ✅ **ĐẠT — đã phát hành v18** |
| 2 | Duplicate Sheet | ✅ **ĐẠT — đã phát hành v18** |
| 3 | Column Visibility (Grid) | ✅ **ĐẠT — đã phát hành v18** |
| 4 | Conditional Formatting | ✅ **ĐẠT — đã phát hành v18** |
| 5 | Symbols Column + Multi-select Dropdown | ✅ **ĐẠT — đã phát hành v18** |
| 6 | Bulk Edit | ✅ **ĐẠT — đã phát hành v18** |

### Nhà thầu phụ — Phuc (🟢 Rảnh)

*Chưa có việc — chờ giao.*

---

## 🏗️ QUY TRÌNH LÀM VIỆC (kiểu xây dựng)

```
Chủ đầu tư (Quân)
     │ Ra yêu cầu
     ▼
Ban QLDA (Claude)
     │ Phân tích → Giao việc
     ├──→ Nhà thầu phụ (Phuc): Nghiên cứu → Nộp biên bản 3 mục
     │                           → Claude nghiệm thu ✅/🔄
     └──→ Nhà thầu chính (Quan): Code + Test → Nộp biên bản 5 mục + Staging
                                 → Claude nghiệm thu ✅/🔄
                                     → ✅ Đạt → copy đè BASELINE
```

---

## 🔑 HƯỚNG DẪN NHANH CHO QUÂN (chủ đầu tư)

1. **Muốn xem ai đang làm gì?** → Mở file này — cờ 🔴/🟢 ở đầu bảng
2. **Muốn xem việc cụ thể từng bên?** → `02_NHA_THAU_PHU/GIAO_NHAN.md` hoặc `03_NHA_THAU_CHINH/GIAO_NHAN.md`
3. **Muốn xem sổ nghiệm thu?** → `01_BAN_QLDA/SO_NGHIEM_THU.md`
4. **Muốn ghi yêu cầu mới?** → `00_CHU_DAU_TU/YEU_CAU.md`
5. **Muốn xem code baseline?** → `05_THI_CONG/BASELINE/`
6. **Muốn xem spec tính năng?** → `04_HO_SO_THIET_KE/specs/`
