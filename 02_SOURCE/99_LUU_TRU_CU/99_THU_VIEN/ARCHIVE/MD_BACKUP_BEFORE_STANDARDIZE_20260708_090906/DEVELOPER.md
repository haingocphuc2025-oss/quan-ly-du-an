# 📋 CÔNG VIỆC — NHÀ THẦU THI CÔNG (Codex/AI Code)

**Vai trò:** Code writer — thi công phần mềm theo SPEC đã duyệt.

**KHÔNG nghiên cứu. KHÔNG đổi SPEC.**

---

## 🔴 VIỆC ĐANG LÀM

| # | Tính năng | Trạng thái | Deadline | SPEC tham chiếu |
|---|-----------|------------|----------|-----------------| 
| 1 | **Forms** | 🟡 Bắt đầu code | Tự do | ./SPEC/forms/spec.md |
| 2 | **Publish Report** | 🟡 Bắt đầu code | Tự do | ./SPEC/publish-report/spec.md |
| 3 | **Automation MVP** | 🟡 Bắt đầu code | Tự do | ./SPEC/automation/spec.md |
| 4 | **Column Types hoàn thiện** (format số/ngày/tiền) | 🟡 Bắt đầu code | Tự do | ./SPEC/column-types/spec.md |
| 5 | **Conditional Formatting + Saved Filter** | 🟡 Bắt đầu code | Tự do | ./SPEC/conditional-formatting/spec.md |
| 6 | **Contact Column** | 🔴 Bắt đầu code | Tự do | ./SPEC/contact-column/spec.md |

---

## ✅ ĐÃ HOÀN THÀNH (Ban QLDA duyệt 07/07/2026)

| # | Tính năng | Version | File tham chiếu | Trạng thái |
|---|-----------|---------|-----------------|------------|
| 1 | **Template Project** | v18 | — | ✅ **ĐẠT (v18)** |
| 2 | **Duplicate Sheet** | v18 | — | ✅ **ĐẠT (v18)** |
| 3 | **Column Visibility (Grid)** | v18 | — | ✅ **ĐẠT (v18)** |
| 4 | **Conditional Formatting (cơ bản)** | v18 | — | ✅ **ĐẠT (v18)** |
| 5 | **Symbols Column + Multi-select Dropdown** | v18 | — | ✅ **ĐẠT (v18)** |
| 6 | **Bulk Edit** | v18 | — | ✅ **ĐẠT (v18)** |
| 7 | **Contact Column** | v19 | ./SPEC/contact-column/spec.md | ✅ **ĐÃ DUYỆT BAN QLDA** 07/07/2026 |

---

## 📋 QUY TRÌNH LÀM VIỆC (BẮT BUỘC)

1. **Nhận việc** từ Ban QLDA (ghi vào bảng \"VIỆC ĐANG LÀM\")
2. **Đọc SPEC** tại ./SPEC/<feature>/spec.md
3. **Code** vào 1 file duy nhất:
   - FRONTEND: HTML/JS/CSS single-file → ./FRONTEND/
   - BACKEND: Apps Script .gs → ./BACKEND/
4. **Test localhost:**
   - Copy file sang C:\Users\trinh\Downloads\
   - Chạy node --check kiểm tra syntax
   - Chạy server python -m http.server 8000 (hoặc npx serve)
   - Test đầy đủ trên localhost:8000
5. **Console phải SẠCH** — 0 lỗi JS
6. **Nộp STAGING + Biên bản 1 LẦN DUY NHẤT** khi xong TẤT CẢ việc:
   - File staging → ./STAGING/giao-dien-desktop-don-gian_v{N}_quan.html
   - Biên bản điền vào ./BAN_GIAO.md (5 mục chuẩn)
7. **Chờ Claude nghiệm thu** — KHÔNG tự copy đè baseline

---

## 🎯 TIÊU CHÍ BÀN GIAO (5 MỤC BẮT BUỘC)

| Mục | Nội dung |
|-----|----------|
| **1. vN + số dòng** | v19 — X.XXX dòng (từ v18/5.580). File local + đường dẫn STAGING ./STAGING/giao-dien-desktop-don-gian_v{N}_quan.html |
| **2. Hàm/đoạn thêm/sửa** | **Sửa:** functionName() (mô tả thay đổi). **Mới:** newFunction() (mô tả). — Xem chi tiết diff |
| **3. Test trên localhost:8000** | Test case 1: ... → PASS/FAIL. Test case 2: ... → PASS/FAIL. ... |
| **4. Console** | ✅ 0 lỗi JS (kiểm tra X lần) |
| **5. Cam kết phạm vi** | ✅ Đúng SPEC — không thêm/bớt — không phá feature cũ. File KHÔNG ảnh hưởng G: Apps Script. |

---

## 📁 CẤU TRÚC THƯ MỤC

```
03_NHA_THAU_THI_CONG/
├── CONG_VIEC.md          ← File này
├── BAN_GIAO.md           ← Biên bản bàn giao staging
├── FRONTEND/             ← Code UI (HTML/JS/CSS single-file)
├── BACKEND/              ← Code Apps Script (.gs files)
└── STAGING/              ← File chờ nghiệm thu (nộp vào đây)
```

---

## 📝 GHI CHÚ

- Baseline hiện tại: v18 — 5.580 dòng (trong ../05_THI_CONG/BASELINE/giao-dien-desktop-don-gian_v18_baseline.html)
- **Version v19**: Bump khi nộp staging — gom **6 features cùng lúc** (Forms, Publish, Automation, Column Types, Conditional Formatting, Contact Column)
- File STAGING đặt tên: giao-dien-desktop-don-gian_v19_quan.html
- **OAuth Deploy: QUÂN SẼ TRIỂN KHAI NGAY** (theo quyết định 07/07/2026) — backend Apps Script sẽ sẵn sàng
- Chỉ code việc trong danh sách "VIỆC ĐANG LÀM" — KHÔNG tự ý thêm feature

---

## 📤 BÀN GIAO STAGING — NHÀ THẦU THI CÔNG → BAN QLDA + GIÁM SÁT NGHIỆM THU

**Người bàn giao:** Nhà thầu thi công (Codex/AI Code)
**Người nhận:** Ban QLDA (Claude) + Giám sát nghiệm thu (Claude + Playwright)
**Mục đích:** Nộp sản phẩm code (staging) để nghiệm thu so SPEC/Planning

---

## 📋 QUY TRÌNH BÀN GIAO

1. Code xong TẤT CẢ việc trong danh sách giao → test localhost → console sạch
2. Copy file staging vào ./STAGING/giao-dien-desktop-don-gian_v{N}_quan.html
3. Điền **BIÊN BAN BÀN GIAO** bên dưới (5 mục bắt buộc)
4. Báo Ban QLDA (Claude) kiểm tra
5. Ban QLDA chuyển cho Giám sát nghiệm thu → test so SPEC/Planning
6. Nghiệm thu ĐẠT → Ban QLDA copy đè baseline → cập nhật ./SO_NGHIEM_THU.md
7. Nghiệm thu KHÔNG ĐẠT → trả sửa, lặp lại từ bước 1

---

## 📝 BIÊN BAN BÀN GIAO MẪU

*(Điền đầy đủ 5 mục khi nộp staging)*

---

### BIÊN BAN BÀN GIAO — v[N]

| Mục | Nội dung |
|-----|----------|
| **Ngày bàn giao** | DD/MM/YYYY |
| **1. vN + số dòng** | v[N] — X.XXX dòng (từ v[N-1]/Y.YYY). File local: C:\...\giao-dien-desktop-don-gian_2.html. Staging: ./STAGING/giao-dien-desktop-don-gian_v[N]_quan.html |
| **2. Hàm/đoạn thêm/sửa** | **Sửa:** functionName() (mô tả thay đổi). **Mới:** newFunction() (mô tả). — Xem chi tiết diff |
| **3. Test trên localhost:8000** | Test case 1: ... → PASS/FAIL. Test case  ~ | 
| **4. Console** | ✅ 0 lỗi JS (kiểm tra X lần) |
| **5. Cam kết phạm vi** | ✅ Đúng SPEC — không thêm/bớt — không phá feature cũ. File KHÔNG ảnh hưởng G: Apps Script. |

---

## 📌 LƯU Ý QUAN TRỌNG

- **Nộp 1 lần duy nhất** khi xong TẤT CẢ việc trong đợt giao
- **5 mục bắt buộc** — thiếu 1 mục = không nhận bàn giao
- File STAGING đặt tên chuẩn: giao-dien-desktop-don-gian_v{N}_quan.html
- Baseline chỉ được cập nhật SAU khi Giám sát nghiệm thu ký ĐẠT
- Console phải SẠCH (0 lỗi) — đây là cổng most important

---

## 📋 CÔNG VIỆC — NHÀ THẦU THI CÔNG (Codex/AI Code)

**Vai trò:** Code writer — thi công phần mềm theo SPEC đã duyệt.

**KHÔNG nghiên cứu. KHÔNG đổi SPEC.**

---

## 🔴 VIỆC ĐANG LÀM (Đã giao 07/07/2026)

| # | Tính năng | Trạng thái | Deadline | SPEC tham chiếu |
|---|-----------|------------|----------|-----------------| 
| 1 | **Forms** | 🟡 Bắt đầu code | Tự do | ./SPEC/forms/spec.md |
| 2 | **Publish Report** | 🟡 Bắt đầu code | Tự do | ./SPEC/publish-report/spec.md |
| 3 | **Automation MVP** | 🟡 Bắt đầu code | Tự do | ./SPEC/automation/spec.md |
| 4 | **Column Types hoàn thiện** (format số/ngày/tiền) | 🟡 Bắt đầu code | Tự do | ./SPEC/column-types/spec.md |
| 5 | **Conditional Formatting + Saved Filter** | 🟡 Bắt đầu code | Tự do | ./SPEC/conditional-formatting/spec.md |
| 6 | **Contact Column** | 🔴 Bắt đầu code | Tự do | ./SPEC/contact-column/spec.md |

---

## ✅ ĐÃ HOÀN THÀNH (Ban QLDA duyệt 07/07/2026)

| # | Tính năng | Version | File tham chiếu | Trạng thái |
|---|-----------|---------|-----------------|------------|
| 1 | **Template Project** | v18 | — | ✅ **ĐẠT (v18)** |
| 2 | **Duplicate Sheet** | v18 | — | ✅ **ĐẠT (v18)** |
| 3 | **Column Visibility (Grid)** | v18 | — | ✅ **ĐẠT (v18)** |
| 4 | **Conditional Formatting (cơ bản)** | v18 | — | ✅ **ĐẠT (v18)** |
| 5 | **Symbols Column + Multi-select Dropdown** | v18 | — | ✅ **ĐẠT (v18)** |
| 6 | **Bulk Edit** | v18 | — | ✅ **ĐẠT (v18)** |
| 7 | **Contact Column** | v19 | ./SPEC/contact-column/spec.md | ✅ **ĐÃ DUYỆT BAN QLDA** 07/07/2026 |

---

## 📋 QUY TRÌNH LÀM VIỆC (BẮT BUỘC)

1. **Nhận việc** từ Ban QLDA (ghi vào bảng \"VIỆC ĐANG LÀM\")
2. **Đọc SPEC** tại ./SPEC/<feature>/spec.md
3. **Code** vào 1 file duy nhất:
   - FRONTEND: HTML/JS/CSS single-file → ./FRONTEND/
   - BACKEND: Apps Script .gs → ./BACKEND/
4. **Test localhost:**
   - Copy file sang C:\Users\trinh\Downloads\
   - Chạy node --check kiểm tra syntax
   - Chạy server python -m http.server 8000 (hoặc npx serve)
   - Test đầy đủ trên localhost:8000
5. **Console phải SẠCH** — 0 lỗi JS
6. **Nộp STAGING + Biên bản 1 LẦN DUY NHẤT** khi xong TẤT CẢ việc:
   - File staging → ./STAGING/giao-dien-desktop-don-gian_v{N}_quan.html
   - Biên bản điền vào ./BAN_GIAO.md (5 mục chuẩn)
7. **Chờ Claude nghiệm thu** — KHÔNG tự copy đè baseline

---

## 🎯 TIÊU CHÍ BÀN GIAO (5 MỤC BẮT BUỘC)

| Mục | Nội dung |
|-----|----------|
| **1. vN + số dòng** | v19 — X.XXX dòng (từ v18/5.580). File local + đường dẫn STAGING ./STAGING/giao-dien-desktop-don-gian_v{N}_quan.html |
| **2. Hàm/đoạn thêm/sửa** | **Sửa:** functionName() (mô tả thay đổi). **Mới:** newFunction() (mô tả). — Xem chi tiết diff |
| **3. Test trên localhost:8000** | Test case 1: ... → PASS/FAIL. Test case 2: ... → PASS/FAIL. ... |
| **4. Console** | ✅ 0 lỗi JS (kiểm tra X lần) |
| **5. Cam kết phạm vi** | ✅ Đúng SPEC — không thêm/bớt — không phá feature cũ. File KHÔNG ảnh hưởng G: Apps Script. |

---

## 📁 CẤU TRÚC THƯ MỤC

```
03_NHA_THAU_THI_CONG/
├── CONG_VIEC.md          ← File này
├── BAN_GIAO.md           ← Biên bản bàn giao staging
├── FRONTEND/             ← Code UI (HTML/JS/CSS single-file)
├── BACKEND/              ← Code Apps Script (.gs files)
└── STAGING/              ← File chờ nghiệm thu (nộp vào đây)
```

---

## 📝 GHI CHÚ

- Baseline hiện tại: v18 — 5.580 dòng (trong ../05_THI_CONG/BASELINE/giao-dien-desktop-don-gian_v18_baseline.html)
- **Version v19**: Bump khi nộp staging — gom **6 features cùng lúc** (Forms, Publish, Automation, Column Types, Conditional Formatting, Contact Column)
- File STAGING đặt tên: giao-dien-desktop-don-gian_v19_quan.html
- **OAuth Deploy: QUÂN SẼ TRIỂN KHAI NGAY** (theo quyết định 07/07/2026) — backend Apps Script sẽ sẵn sàng
- Chỉ code việc trong danh sách \"VIỆC ĐANG LÀM\" — KHÔNG tự ý thêm feature

---

## 📤 BÀN GIAO STAGING — NHÀ THẦU THI CÔNG → BAN QLDA + GIÁM SÁT NGHIỆM THU

**Người bàn giao:** Nhà thầu thi công (Codex/AI Code)
**Người nhận:** Ban QLDA (Claude) + Giám sát nghiệm thu (Claude + Playwright)
**Mục đích:** Nộp sản phẩm code (staging) để nghiệm thu so SPEC/Planning

---

## 📋 QUY TRÌNH BÀN GIAO

1. Code xong TẤT CẢ việc trong danh sách giao → test localhost → console sạch
2. Copy file staging vào ./STAGING/giao-dien-desktop-don-gian_v{N}_quan.html
3. Điền **BIÊN BAN BÀN GIAO** bên dưới (5 mục bắt buộc)
4. Báo Ban QLDA (Claude) kiểm tra
5. Ban QLDA chuyển cho Giám sát nghiệm thu → test so SPEC/Planning
6. Nghiệm thu ĐẠT → Ban QLDA copy đè baseline → cập nhật ./SO_NGHIEM_THU.md
7. Nghiệm thu KHÔNG ĐẠT → trả sửa, lặp lại từ bước 1

---

## 📝 BIÊN BAN BÀN GIAO MẪU

*(Điền đầy đủ 5 mục khi nộp staging)*

---

### BIÊN BAN BÀN GIAO — v[N]

| Mục | Nội dung |
|-----|----------|
| **Ngày bàn giao** | DD/MM/YYYY |
| **1. vN + số dòng** | v[N] — X.XXX dòng (từ v[N-1]/Y.YYY). File local: C:\...\giao-dien-desktop-don-gian_2.html. Staging: ./STAGING/giao-dien-desktop-don-gian_v[N]_quan.html |
| **2. Hàm/đoạn thêm/sửa** | **Sửa:** functionName() (mô tả thay đổi). **Mới:** newFunction() (mô tả). — Xem chi tiết diff |
| **3. Test trên localhost:8000** | Test case 1: ... → PASS/FAIL. Test case 2: ... → PASS/FAIL. ... |
| **4. Console** | ✅ 0 lỗi JS (kiểm tra X lần) |
| **5. Cam kết phạm vi** | ✅ Đúng SPEC — không thêm/bớt — không phá feature cũ. File KHÔNG ảnh hưởng G: Apps Script. |

---

## 📌 LƯU Ý QUAN TRỌNG

- **Nộp 1 lần duy nhất** khi xong TẤT CẢ việc trong đợt giao
- **5 mục bắt buộc** — thiếu 1 mục = không nhận bàn giao
- File STAGING đặt tên chuẩn: giao-dien-desktop-don-gian_v{N}_quan.html
- Baseline chỉ được cập nhật SAU khi Giám sát nghiệm thu ký ĐẠT
- Console phải SẠCH (0 lỗi) — đây là cổng most important