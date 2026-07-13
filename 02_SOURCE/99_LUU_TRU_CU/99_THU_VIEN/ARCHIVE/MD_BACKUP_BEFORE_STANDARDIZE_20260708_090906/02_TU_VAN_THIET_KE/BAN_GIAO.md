# 📋 BIÊN BAN BÀN GIAO — TƯ VẤN THIẾT KẾ → BAN QLDA

**Quy tắc:** Mỗi SPEC 1 biên bản, 5 mục bắt buộc. Thiếu 1 mục = không nhận bàn giao.

---

## 1. Contact Column + Người phụ trách

| Mục | Nội dung |
|-----|----------|
| **Ngày bàn giao** | 07/07/2026 |
| **1. SPEC Feature** | `<feature>` — file: `../02_TU_VAN_THIET_KE/SPEC_QL_DA_DUYET/contact-column/spec.md` |
| **2. Tóm tắt giải pháp** | Thêm Contact Column (type: CONTACT_LIST) để lưu {name, email}, picker UI, validation, automation recipient integration, form prefill, và multi-contact support. |
| **3. Phụ thuộc** | Nâng cấp Column Types (SHEET_COLUMN_CONFIG), Apps Script backend, Form prefill capability. |
| **4. Test case đề xuất** | Test single contact picker, multi-contact, form prefill, automation email, import CSV. |
| **5. Cam kết** | ✅ SPEC đầy đủ chi tiết, tuân thủ Smartsheet/Apps Script, sẵn sàng cho nhà thầu code v19. |

---

## 2. Forms

| Mục | Nội dung |
|-----|----------|
| **Ngày bàn giao** | 07/07/2026 |
| **1. SPEC Feature** | `<feature>` — file: `../02_TU_VAN_THIET_KE/SPEC_QL_DA_DUYET/forms/spec.md` |
| **2. Tóm tắt giải pháp** | Xây dựng Forms builder cho sheet: field types, validation, submit -> thêm row, prefill, file upload, email notification. |
| **3. Phụ thuộc** | Column Types (bắt buộc), OAuth apps script, form prefill, file upload. |
| **4. Test case đề xuất** | Test form rendering, validation, submit, prefill, file upload. |
| **5. Cam kết** | ✅ SPEC chi tiết đầy đủ, khả thi, tuân thủ quy định. |

---

## 3. Publish Report

| Mục | Nội dung |
|-----|----------|
| **Ngày bàn giao** | 07/07/2026 |
| **1. SPEC Feature** | `<feature>` — file: `../02_TU_VAN_THIET_KE/SPEC_QL_DA_DUYET/publish-report/spec.md` |
| **2. Tóm tắt giải pháp** | Publish Report an toàn: embed sheet data, bảo mật qua password/domain/role, xuất PDF/HTML, caching, khả năng embed. |
| **3. Phụ thuộc** | Column Types, OAuth apps script, authentication library, scheduler. |
| **4. Test case đề xuất** | Test access control, export, permission assignment, report update. |
| **5. Cam kết** | ✅ SPEC đầy đủ, bảo mật, tuân thủ. |

---

## 4. Automation

| Mục | Nội dung |
|-----|----------|
| **Ngày bàn giao** | 07/07/2026 |
| **1. SPEC Feature** | `<feature>` — file: `../02_TU_VAN_THIET_KE/SPEC_QL_DA_DUYET/automation/spec.md` |
| **2. Tóm tắt giải pháp** | Automation engine: workflow builder, triggers (onEdit, schedule, form), actions (email, sheet update), task assignment, notification center. |
| **3. Phụ thuộc** | Column Types, OAuth apps script, email service, scheduler. |
| **4. Test case đề xuất** | Test workflow creation, execution, notification, task assignment, logging. |
| **5. Cam kết** | ✅ SPEC chi tiết, thực thi được, tuân thủ. |

---

## 5. Column Types

| Mục | Nội dung |
|-----|----------|
| **Ngày bàn giao** | 07/07/2026 |
| **1. SPEC Feature** | `<feature>` — file: `../02_TU_VAN_THIET_KE/SPEC_QL_DA_DUYET/column-types/spec.md` |
| **2. Tóm tắt giải pháp** | Custom Column Types: mở rộng type, validation, formatter, formula, custom types cho project-specific data. |
| **3. Phụ thuộc** | OAuth apps script, column management, validation engine, formula. |
| **4. Test case đề xuất** | Test standard type creation, custom type, validation, formula, inheritance. |
| **5. Cam kết** | ✅ SPEC đầy đủ, khả thi, tuân thủ. |

---

## 6. Conditional Formatting

| Mục | Nội dung |
|-----|----------|
| **Ngày bàn giao** | 07/07/2026 |
| **1. SPEC Feature** | `<feature>` — file: `../02_TU_VAN_THIET_KE/SPEC_QL_DA_DUYET/conditional-formatting/spec.md` |
| **2. Tóm tắt giải pháp** | Conditional Formatting: rule builder cho styling cells dựa trên giá trị, formula, trigger, dynamic, caching. |
| **3. Phụ thuộc** | OAuth apps script, conditional API, formula engine, UI framework. |
| **4. Test case đề xuất** | Test rule creation, application, update, multiple rules, removal. |
| **5. Cam kết** | ✅ SPEC chi tiết, khả thi, tuân thủ. |

---

## 📋 TÓM TẮT

✅ **Tất cả 9 SPEC files ĐÃ DUYỆT & SẴN SÀNG** — Design Consultant hoàn thành SOP 07/07/2026 (v1.4):

- **Tạo SPEC files** (9 features: Contact Column, Forms, Publish Report, Automation, Column Types, Conditional Formatting, Auto-Save On Exit, Copy/Cut/Paste, Keyboard Shortcuts)
- **Bàn giao cho Ban QLDA** (Biên bản bàn giao 5 mục)
- **Ban QLDA ĐÃ DUYỆT** → Đã chuyển SPEC từ `SPEC_NEW/` → `SPEC_QL_DA_DUYET/` + copy sang `01_BAN_QLDA/SPEC_MOI_DUYET/` + xóa rỗng `SPEC_NEW/`
- **Nhà thầu ĐANG CODE v19** (9 features theo SO_GIAO_VIEC.md)

---

## 📁 Trạng thái file hiện tại

```
|02_TU_VAN_THIET_KE/
├── CONG_VIEC.md      ← Updated (SPEC_QL_DA_DUYET/ 9 SPEC, SPEC_NEW/ chỉ còn Copy/Cut/Paste)
├── BAN_GIAO.md       ← Biên bản bàn giao 5 mục (9 SPEC)
├── SPEC_NEW/         ← Copy/Cut/Paste (đang viết)
└── SPEC_QL_DA_DUYET/ ← **9 SPEC 🟢 ĐÃ DUYỆT** (bản gốc)
    ├── contact-column/
    ├── forms/
    ├── publish-report/
    ├── automation/
    ├── column-types/
    ├── conditional-formatting/
    ├── auto-save-on-exit/
    ├── keyboard-shortcuts/
    └── copy-cut-paste/

01_BAN_QLDA/
└── SPEC_MOI_DUYET/   ← **9 SPEC 🟢 ĐÃ DUYỆT** (copy cho Ban QLDA quản lý)
```

---

## 9. Keyboard Shortcuts

| Mục | Nội dung |
|-----|----------|
| **Ngày bàn giao** | 07/07/2026 |
| **1. SPEC Feature** | `<feature>` — file: `../02_TU_VAN_THIET_KE/SPEC_QL_DA_DUYET/keyboard-shortcuts/spec.md` |
| **2. Tóm tắt giải pháp** | Triển khai 34 phím tắt chuẩn Smartsheet/Excel: Navigation (Arrow, Tab, Enter, Home/End), Cell Editing (F2, Escape, Delete, printable char), Clipboard (Ctrl+C/X/V), Undo/Redo (Ctrl+Z/Y), Selection (Ctrl+A), Global (Ctrl+F, B, I, U), Page (PageUp/Down), Nav History (Alt+Arrow), Row Ops (Ctrl+Shift+=/-, indent/outdent). 1 global `keydown` router + 1 cell-level handler, không conflict browser shortcuts, không override native input. |
| **3. Phụ thuộc** | **BẮT BUỘC:** Copy/Cut/Paste SPEC (cho Ctrl+C/X/V). **KHUYẾN NGHỊ:** Undo/Redo Stack SPEC (cho Ctrl+Z/Y). Baseline v18 `moveActiveSheetCell()`, `startEditingCell()`, `commitEditingCell()`, `cancelEditingCell()`, `toggleCellStyleFlag()`, `getActiveSheet()`, `navBack()`, `navForward()`. Không cần OAuth mới. |
| **4. Test case đề xuất** | TC-01: Arrow down 3 rows; TC-02: Arrow right + Tab; TC-03: Enter commit + down; TC-04: Escape cancel edit; TC-05: F2 enter edit; TC-06: Delete clears cell; TC-07: Printable char starts edit; TC-08: Ctrl+F focus search; TC-09: Ctrl+B bold; TC-10: Home/End nav; TC-11: Tab wrap next row; TC-12: Printable char while editing; TC-13: Ctrl+Arrow không chặn browser; TC-14: Ctrl+B/I/U; TC-15: Printable char in input. |
| **5. Cam kết** | ✅ SPEC đầy đủ chi tiết (15 test cases), tuân thủ Smartsheet/Excel, không conflict browser shortcuts, sẵn sàng cho nhà thầu code v19. |

---

## 10. Auto-Save On Exit

| Mục | Nội dung |
|-----|----------|
| **Ngày bàn giao** | 07/07/2026 |
| **1. SPEC Feature** | `<feature>` — file: `../02_TU_VAN_THIET_KE/SPEC_QL_DA_DUYET/auto-save-on-exit/spec.md` |
| **2. Tóm tắt giải pháp** | Tự động lưu dữ liệu khi user đóng tab / reload / chuyển tab / lock screen mobile: thêm 3 event listeners (`beforeunload`, `visibilitychange`, `pagehide`) flush ngay pending saves via `navigator.sendBeacon()` + `fetch(keepalive:true)`. Không thay đổi backend Apps Script. |
| **3. Phụ thuộc** | Baseline v18 `scheduleSheetDataSave()` / `saveSheetDataToWebApp()`, Web App URL. Không cần OAuth mới. |
| **4. Test case đề xuất** | Test TC-01: Edit→Close tab (<500ms); TC-02: Edit→F5; TC-03: Edit→Switch tab; TC-04: Mobile Edit→Lock screen; TC-05: 5 edits→Close. |
| **5. Cam kết** | ✅ SPEC đầy đủ chi tiết, tuân thủ Smartsheet/Apps Script, sẵn sàng cho nhà thầu code v19. |

---

## 8. Copy/Cut/Paste Multiple Cells/Rows (giống Excel)

| Mục | Nội dung |
|-----|----------|
| **Ngày bàn giao** | 07/07/2026 |
| **1. SPEC Feature** | `<feature>` — file: `../02_TU_VAN_THIET_KE/SPEC_QL_DA_DUYET/copy-cut-paste/spec.md` |
| **2. Tóm tắt giải pháp** | Copy/Cut/Paste khối ô & hàng giống Excel: Ctrl+C/Ctrl+X/Ctrl+V, context menu, paste từ Excel (tab-separated), validate theo column type, insert/append hàng tự động, cut-paste di chuyển hàng. |
| **3. Phụ thuộc** | Column Types (SHEET_COLUMN_CONFIG), Undo/Redo stack, Row insert/delete backend, LockService, OAuth deploy. |
| **4. Test case đề xuất** | Test copy/paste range, cut/paste rows, paste từ Excel, validate dropdown/số/ngày, paste vượt hàng, cột read-only, undo, cross-sheet. |
| **5. Cam kết** | ✅ SPEC đầy đủ chi tiết, tuân thủ Smartsheet/Excel behavior, khả thi Apps Script, sẵn sàng cho nhà thầu code v19. |

---

## 9. Default Row Height & Text Wrap (Mặc định độ cao hàng + Tự động xuống dòng)

| Mục | Nội dung |
|-----|----------|
| **Ngày bàn giao** | 07/07/2026 |
| **1. SPEC Feature** | `default-row-height-wrap` — file: `../02_TU_VAN_THIET_KE/SPEC_NEW/default-row-height-wrap/spec.md` |
| **2. Tóm tắt giải pháp** | Thiết lập độ cao hàng mặc định (32/40/48/60px), bật/tắt wrap text toàn sheet hoặc per-column, hàng tự cao khi nội dung wrap nhiều dòng, persist settings per sheet. CSS-driven, ít logic backend. |
| **3. Phụ thuộc** | Column Types (SHEET_COLUMN_CONFIG), Column Resizer (v17), Toolbar, Sheet Settings Storage, OAuth Deploy. |
| **4. Test case đề xuất** | Test default wrap, toggle wrap, row height presets, column override wrap, auto row height, persist reload, multi-sheet settings, column resize reflow. |
| **5. Cam kết** | ✅ SPEC đầy đủ chi tiết, CSS-driven, khả thi Apps Script, sẵn sàng cho nhà thầu code v19. |

---

## 10. Clear Sheet All Data (Nút delete quyền lực xóa mọi dữ liệu + reset date)

| Mục | Nội dung |
|-----|----------|
| **Ngày bàn giao** | 07/07/2026 |
| **1. SPEC Feature** | `clear-sheet-all-data` — file: `../02_TU_VAN_THIET_KE/SPEC_NEW/clear-sheet-all-data/spec.md` |
| **2. Tóm tắt giải pháp** | Nút 🗑 Clear Sheet trên toolbar: modal 3 chế độ (Xóa hết + Reset ngày về hôm nay / Xóa hết giữ ngày / Reset chỉ ngày). Mặc định chọn "Xóa hết + Reset ngày" — dùng cho báo cáo tuần. Snapshot cho Undo, toast xác nhận, animation fade. |
| **3. Phụ thuộc** | Modal system (sheetNameModal), Toolbar, Toast, Undo/Redo stack, LockService. |
| **4. Test case đề xuất** | Test clear+reset dates, clear all, dates only, selective clear, undo, empty sheet, reload persist, multi-sheet isolation, console snapshot backup. |
| **5. Cam kết** | ✅ SPEC đầy đủ chi tiết, modal-driven, tuân thủ Smartsheet/Apps Script, sẵn sàng cho nhà thầu code v19. |

---

**🎯 Trạng thái:** 8 SPEC đã duyệt, Nhà thầu đang code v19 (8 features) — chờ nghiệm thu**
