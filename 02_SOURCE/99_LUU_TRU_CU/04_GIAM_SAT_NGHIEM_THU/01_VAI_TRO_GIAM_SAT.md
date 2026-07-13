# 📋 CÔNG VIỆC — GIÁM SÁT NGHIỆM THU (Claude + Playwright)

**Vai trò:** Test, regression, review code, so SPEC, so Planning, nghiệm thu, trả sửa.

---

## 🔴 VIỆC ĐANG LÀM / CHỜ BÀN GIAO

| # | Tính năng | Trạng thái | SPEC tham chiếu | Test Case |
|---|-----------|------------|-----------------|-----------|
| 1 | Import CSV | ⚪ Chờ bàn giao | `../02_TU_VAN_THIET_KE/SPEC/import-csv/spec.md` | `TEST_CASE/import-csv.md` |
| 2 | Auto-Save On Exit | ⚪ Chờ bàn giao | `../02_TU_VAN_THIET_KE/SPEC/auto-save-on-exit/spec.md` | `TEST_CASE/auto-save-on-exit.md` |
| 3 | Copy/Cut/Paste Multiple Cells | ⚪ Chờ bàn giao | `../02_TU_VAN_THIET_KE/SPEC/copy-cut-paste/spec.md` | `TEST_CASE/copy-cut-paste.md` |

---

## ✅ ĐÃ NGHIỆM THU v19 (07/07/2026)

| # | Tính năng | Version | Ngày | Kết quả | Baseline |
|---|-----------|---------|------|---------|----------|
| 1 | **Conditional Formatting + Saved Filter** | v19 | 07/07/2026 | ✅ **ĐẠT** | v19 baseline |
| 2 | **Column Types (format engine)** | v19 | 07/07/2026 | ✅ **ĐẠT** | v19 baseline |
| 3 | **Publish Report (Report Builder)** | v19 | 07/07/2026 | ✅ **ĐẠT** | v19 baseline |
| 4 | **Forms** | v19 | — | ❌ **CHƯA CODE** (sẽ làm v19.5/v20) | — |
| 5 | **Automation MVP** | v19 | — | ❌ **CHƯA CODE** (sẽ làm v19.5/v20) | — |
| 6 | **Contact Column** | v19 | 07/07/2026 | ✅ **ĐÃ DUYỆT** (trước v19) | — |

---

## ✅ ĐÃ NGHIỆM THU v18

---

## 📋 QUY TRÌNH NGHIỆM THU

1. **Nhận bàn giao** từ Nhà thầu (đọc `../03_NHA_THAU_THI_CONG/BAN_GIAO.md`)
2. **Đọc SPEC** tại `../02_TU_VAN_THIET_KE/SPEC/<feature>/spec.md`
3. **Đọc Planning** tại `../01_BAN_QLDA/PLANNING.md`
4. **Review code** — diff so với baseline, kiểm tra 5 mục bàn giao
5. **Chạy test case thủ công** (theo `TEST_CASE/<feature>.md`)
6. **Chạy Playwright test** (theo `PLAYWRIGHT/test-<feature>.spec.ts`)
7. **So khớp SPEC** — từng tiêu chí nghiệm thu trong SPEC
8. **So khớp Planning** — đúng scope, đúng ưu tiên, không phá feature cũ
9. **Viết BIÊN BAN NGHIỆM THU** vào `BIEN_BAN_NGHIEM_THU.md`
10. **Kết quả**: ✅ ĐẠT → báo Ban QLDA copy baseline | 🔄 TRẢ SỬA → ghi lý do, trả Nhà thầu

---

## 🎯 TIÊU CHÍ NGHIỆM THU (THEO SPEC + PLANNING)

| Tiêu chí | Mô tả |
|----------|-------|
| **Đúng SPEC** | Tất cả test case trong SPEC PASS |
| **Đúng Planning** | Scope đúng, ưu tiên đúng, không feature lẻ |
| **Console sạch** | 0 lỗi JS trên localhost:8000 |
| **Không regression** | Tất cả feature cũ vẫn hoạt động |
| **Code quality** | Không hardcode, tuân thủ pattern codebase |
| **File staging đúng chỗ** | `../03_NHA_THAU_THI_CONG/STAGING/giao-dien-desktop-don-gian_v{N}_quan.html` |

---

## 📂 CẤU TRÚC THƯ MỤC

```
04_GIAM_SAT_NGHIEM_THU/
├── CONG_VIEC.md              ← File này
├── BIEN_BAN_NGHIEM_THU.md    ← Kết quả nghiệm thu chi tiết
├── TEST_CASE/                ← Test case thủ công từng feature
│   ├── import-csv.md
│   ├── contact-column.md
│   ├── publish-report.md
│   ├── forms.md
│   └── automation.md
└── PLAYWRIGHT/               ← Script test tự động
    ├── test-import-csv.spec.ts
    ├── test-contact-column.spec.ts
    ├── test-publish-report.spec.ts
    ├── test-forms.spec.ts
    └── test-automation.spec.ts
```

---

## 📝 GHI CHÚ

- Giám sát nghiệm thu = **Claude + Playwright** (không phải người riêng)
- Mỗi feature có 2 layer test: thủ công (TEST_CASE) + tự động (PLAYWRIGHT)
- Kết quả ghi vào `BIEN_BAN_NGHIEM_THU.md` — là bằng chứng duy nhất để duyệt/trả sửa