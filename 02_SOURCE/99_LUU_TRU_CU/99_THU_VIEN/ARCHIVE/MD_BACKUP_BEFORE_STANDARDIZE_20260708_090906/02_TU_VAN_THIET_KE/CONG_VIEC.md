# 📋 CÔNG VIỆC — TƯ VẤN THIẾT KẾ (AI Research)

**Vai trò:** Nghiên cứu Smartsheet/Apps Script, phân tích, viết SPEC, đề xuất giải pháp, bàn giao SPEC cho Ban QLDA.
**KHÔNG code.**

---

## 🔴 VIỆC ĐANG LÀM

| # | Tính năng | Trạng thái | Dự kiến xong | Ghi chú |
|---|-----------|------------|--------------|---------|
| 1 | **Contact Column** | ✅ HOÀN THÀNH SPEC + ĐÃ DUYỆT | 07/07/2026 | ✅ Lưu tại SPEC_QL_DA_DUYET/, copy SPEC_MOI_DUYET/, SPEC_NEW/ đã xóa |
| 2 | **Forms** | ✅ HOÀN THÀNH SPEC + ĐÃ DUYỆT | 07/07/2026 | ✅ Lưu tại SPEC_QL_DA_DUYET/, copy SPEC_MOI_DUYET/, SPEC_NEW/ đã xóa |
| 3 | **Publish Report** | ✅ HOÀN THÀNH SPEC + ĐÃ DUYỆT | 07/07/2026 | ✅ Lưu tại SPEC_QL_DA_DUYET/, copy SPEC_MOI_DUYET/, SPEC_NEW/ đã xóa |
| 4 | **Automation** | ✅ HOÀN THÀNH SPEC + ĐÃ DUYỆT | 07/07/2026 | ✅ Lưu tại SPEC_QL_DA_DUYET/, copy SPEC_MOI_DUYET/, SPEC_NEW/ đã xóa |
| 5 | **Column Types** | ✅ HOÀN THÀNH SPEC + ĐÃ DUYỆT | 07/07/2026 | ✅ Lưu tại SPEC_QL_DA_DUYET/, copy SPEC_MOI_DUYET/, SPEC_NEW/ đã xóa |
| 6 | **Conditional Formatting** | ✅ HOÀN THÀNH SPEC + ĐÃ DUYỆT | 07/07/2026 | ✅ Lưu tại SPEC_QL_DA_DUYET/, copy SPEC_MOI_DUYET/, SPEC_NEW/ đã xóa |
| 7 | **Copy/Cut/Paste Multiple Cells/Rows** | ✅ HOÀN THÀNH SPEC + ĐÃ DUYỆT | 07/07/2026 | ✅ Lưu tại SPEC_QL_DA_DUYET/, copy SPEC_MOI_DUYET/, SPEC_NEW/ đã xóa |
| 8 | **Auto-Save On Exit** | ✅ HOÀN THÀNH SPEC + ĐÃ DUYỆT | 07/07/2026 | ✅ Lưu tại SPEC_QL_DA_DUYET/, copy SPEC_MOI_DUYET/, SPEC_NEW/ đã xóa |
| 9 | **Keyboard Shortcuts** | ✅ HOÀN THÀNH SPEC + ĐÃ DUYỆT | 07/07/2026 | ✅ Lưu tại SPEC_QL_DA_DUYET/, copy SPEC_MOI_DUYET/, SPEC_NEW/ đã xóa |
| 10 | **Default Row Height & Text Wrap** | 🟡 ĐANG VIẾT SPEC | 07/07/2026 | 🔴 Lưu tại SPEC_NEW/default-row-height-wrap/, chờ Ban QLDA duyệt |
| 11 | **Clear Sheet All Data** | 🟡 ĐANG VIẾT SPEC | 07/07/2026 | 🔴 Lưu tại SPEC_NEW/clear-sheet-all-data/, chờ Ban QLDA duyệt |

---

## ✅ ĐÃ HOÀN THÀNH (Thiết kế Consultant SOP)

| # | SPEC | File SPEC | Số phiên bản |
|---|------|-----------|----------------|
| 1 | Contact Column + Người Phụ Trách | ./SPEC_QL_DA_DUYET/contact-column/spec.md | v19 |
| 2 | Forms | ./SPEC_QL_DA_DUYET/forms/spec.md | v19 |
| 3 | Publish Report | ./SPEC_QL_DA_DUYET/publish-report/spec.md | v19 |
| 4 | Automation | ./SPEC_QL_DA_DUYET/automation/spec.md | v19 |
| 5 | Column Types | ./SPEC_QL_DA_DUYET/column-types/spec.md | v19 |
| 6 | Conditional Formatting | ./SPEC_QL_DA_DUYET/conditional-formatting/spec.md | v19 |
| 7 | Copy/Cut/Paste Multiple Cells/Rows | ./SPEC_QL_DA_DUYET/copy-cut-paste/spec.md | v19 |
| 8 | Auto-Save On Exit | ./SPEC_QL_DA_DUYET/auto-save-on-exit/spec.md | v19 |
| 9 | Keyboard Shortcuts | ./SPEC_QL_DA_DUYET/keyboard-shortcuts/spec.md | v19 |

---

## 📋 QUY TRÌNH LÀM VIỆC (BẮT BUỘC)

1. **Nhận việc** từ Ban QLDA (ghi vào bảng "🔴 VIỆC ĐANG LÀM")
2. **Nghiên cứu** Smartsheet/Apps Script/Excel/NotebookLM/master spec
3. **Viết SPEC** chi tiết vào `./SPEC_NEW/<feature>/spec.md`
4. **Điền Biên bản bàn giao 5 mục** vào `BAN_GIAO.md`
5. **Báo Ban QLDA duyệt** → Ban QLDA duyệt → **di chuyển SPEC từ SPEC_NEW/ sang SPEC_QL_DA_DUYET/ + copy sang 01_BAN_QLDA/SPEC_MOI_DUYET/ + xóa rỗng SPEC_NEW/** → Ban QLDA giao Nhà thầu (theo quy trình mới: SPEC duyệt → Nhà thầu chọn 1-5 specs code)
6. Nếu **trả sửa** → lặp lại từ bước 2

---

## 🎯 THÀNH QUẢ BÀN GIAO (5 MỤC BẮT BUỘC)

Each SPEC phải có đủ 5 mục biên bản bàn giao bắt buộc:

| Mục | Nội dung |
|-----|----------|
| **1. Ngày bàn giao** | DD/MM/YYYY |
| **2. SPEC Feature** | `<feature>` — file: `../02_TU_VAN_THIET_KE/SPEC_QL_DA_DUYET/<feature>/spec.md` |
| **3. Tóm tắt giải pháp** | 3-5 dòng: cách làm, API dùng, pattern chính |
| **4. Phụ thuộc** | Cần OAuth? API mới? Feature khác? |
| **5. Test case đề xuất** | 3-5 case chính để Nhà thầu test |
| **6. Cam kết** | ✅ SPEC đầy đủ, đúng Smartsheet/Apps Script, sẵn sàng cho code |

---

## 📁 CẤU TRÚC FILE (THEO SOP v1.4)

```
02_TU_VAN_THIET_KE/
├── CONG_VIEC.md              ← File này
├── BAN_GIAO.md               ← Biên bản bàn giao cho Ban QLDA
├── SOP_TU_VAN_THIET_KE.md    ← SOP Tư vấn thiết kế
├── SPEC_NEW/                 ← SPEC MỚI CHƯA DUYỆT (Tư vấn viết xong, lưu tạm đây chờ duyệt)
│   ├── default-row-height-wrap/
│   │   └── spec.md
│   ├── clear-sheet-all-data/
│   │   └── spec.md
│   └── ...
├── SPEC_QL_DA_DUYET/         ← SPEC ĐÃ DUYỆT (Ban QLDA ký duyệt) — bản gốc
│   ├── contact-column/
│   │   └── spec.md
│   ├── forms/
│   │   └── spec.md
│   ├── publish-report/
│   │   └── spec.md
│   ├── automation/
│   │   └── spec.md
│   ├── column-types/
│   │   └── spec.md
│   ├── conditional-formatting/
│   │   └── spec.md
│   ├── auto-save-on-exit/
│   │   └── spec.md
│   ├── keyboard-shortcuts/
│   │   └── spec.md
│   └── copy-cut-paste/
│       └── spec.md
├── DEVELOPER.md              (Tùy chọn: artifact, ghi chú, script)
└── ARCHIVE/                  ← SPEC cũ, version cũ (nếu cần)
```

---

## 📝 LƯU Ý

- **Ưu tiên:** Design Consultant → Ban QLDA duyệt → Nhà thầu code (chọn 1-5 specs từ **9 features**)
- **Tất cả SPEC format:** .md, UTF-8, tuân thủ spec mẫu ghi trong SOP
- **Version SOP:** 07/07/2026 (v1.4 - Cập nhật quy tắc: sau viết SPEC → tiếp tục nghiên cứu, SPEC_NEW/ không block luồng)
- **SO_GIAO_VIEC.md** → Đã ghi nhận 9 SPEC ✅ ĐÃ DUYỆT, Nhà thầu 🔴 ĐANG LÀM v19

---

## 📤 BÀN GIAO CHO BAN QLDA

**Tư vấn thiết kế (AI Research) đã hoàn thành SPEC files cho 9 features (Contact Column, Forms, Publish Report, Automation, Column Types, Conditional Formatting, Auto-Save On Exit, Keyboard Shortcuts, Copy/Cut/Paste)**

**✅ 9 SPEC ĐÃ DUYỆT — Đã lưu tại `SPEC_QL_DA_DUYET/` + copy `01_BAN_QLDA/SPEC_MOI_DUYET/` — `SPEC_NEW/` chỉ còn Default Row Height & Clear Sheet (đang viết)**

**Nhà thầu đang code v19 (9 features theo SO_GIAO_VIEC.md)**

---

## 📋 KIỂU CỦA CÔNG VIỆC

**🎯 User quyết định hành động tiếp theo:**

| Lựa chọn | Hành động | Kết quả |
|--------|--------|---------|
| **1** | "Bàn giao SPEC cho Ban QLDA" | Cập nhật `BAN_GIAO.md` với 9 biên bản bàn giao 5 mục |
| **2** | "Trở lại Layout cũ COGIV1" | Chỉnh sửa `03_NHA_THAU_THI_CONG/CONG_VIEC.md` |
| **3** | "Kiểm tra Design Consultant SOP" | Hiển thị status files, xác nhận ready cho Ban QLDA |

**⏱️ SẴN SÀNG — Tôi có thể bắt đầu bàn giao SPEC files, chờ bạn quyết định hành động** 🚀