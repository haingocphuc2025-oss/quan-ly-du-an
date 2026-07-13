# HƯỚNG DẪN DỰ ÁN — DU AN WED QUAN LY (AI Software Factory v1.0)

**Mục đích:** Kiến trúc tổng quan + quy tắc vận hành + trạng thái hạ tầng — ít đổi. **Đọc file này TRƯỚC TIÊN** khi mở lại dự án ở máy/phiên bất kỳ.

---

## 📂 CẤU TRÚC THƯ MỤC (6 vai trò + 1 kho dữ liệu)

| Folder | Vai trò | Người phụ trách |
|--------|---------|-----------------|
| `00_CHU_DAU_TU/` | Yêu cầu, quyết định chiến lược, duyệt baseline/release | **Quân (Chủ đầu tư)** |
| `01_BAN_QLDA/` | Điều phối, giao việc, kiểm tra, nghiệm thu, báo cáo | **Claude (Ban QLDA)** |
| `02_TU_VAN_THIET_KE/` | Nghiên cứu Smartsheet/Apps Script, viết SPEC, bàn giao SPEC | **AI Research (Tư vấn thiết kế)** |
| `03_NHA_THAU_THI_CONG/` | Code, refactor, fix bug, test localhost, bàn giao staging | **Codex/AI Code (Nhà thầu thi công)** |
| `04_GIAM_SAT_NGHIEM_THU/` | Test, regression, review code, so SPEC/Planning, nghiệm thu | **Claude + Playwright (Giám sát)** |
| `05_TRIEN_KHAI/` | Deploy, Backup, Release, Rollback | **Quân / Deploy AI (Triển khai)** |
| `99_THU_VIEN/` | Smartsheet, Apps Script, Google, NotebookLM, Reference, Archive | **Kho dữ liệu (không phải người)** |

**File dashboard quan trọng nhất:** `PROJECT_OPERATION_CENTER.md` (ở root)

---

## 🔄 LUỒNG CHUẨN (Standard Flow)

```
Ý tưởng → 00_CHU_DAU_TU/YEU_CAU.md
    │
    ▼
Ban QLDA → 01_BAN_QLDA/SO_GIAO_VIEC.md (giao 02_TU_VAN_THIET_KE)
    │
    ▼
Tư vấn thiết kế → 02_TU_VAN_THIET_KE/CONG_VIEC.md → research → SPEC_NEW/ → BAN_GIAO.md
    │
    ▼
Ban QLDA duyệt SPEC → ký duyệt BAN_GIAO.md
    │
    ▼
Tư vấn chuyển SPEC_NEW/ → SPEC_QL_DA_DUYET/ + copy sang 01_BAN_QLDA/SPEC_MOI_DUYET/ + xóa rỗng SPEC_NEW/
    │
    ▼
Nhà thầu nhận việc tại 01_BAN_QLDA/SPEC_MOI_DUYET/ → chọn 1-5 specs code v19
    │
    ▼
Nhà thầu thi công → 03_NHA_THAU_THI_CONG/CONG_VIEC.md → code FRONTEND/BACKEND → STAGING/ + BAN_GIAO.md
    │
    ▼
Giám sát nghiệm thu → 04_GIAM_SAT_NGHIEM_THU/TEST_CASE + PLAYWRIGHT → so SPEC/Planning → BIEN_BAN_NGHIEM_THU.md
    │
    ▼
ĐẠT → Triển khai → 05_TRIEN_KHAI/RELEASE_NOTE.md + DEPLOY_LOG.md + BACKUP/
    │
    ▼
Hoàn thành
```

---

## 📋 QUY TRÌNH NGHIỆM THU (BẮT BUỘC)

### Bước 1 — Nhà thầu nộp "Biên bản bàn giao" (`03_NHA_THAU_THI_CONG/BAN_GIAO.md`)
**5 mục bắt buộc** (thiếu 1 mục = trả lại ngay):
1. **vN + số dòng** — version thực, số dòng file, đường dẫn local + STAGING
2. **Hàm/đoạn thêm/sửa** — tên hàm, dòng bắt đầu-kết thúc thật trong file
3. **Test localhost:8000** — từng thao tác + kết quả quan sát được (cấm "chắc chạy được")
4. **Console** — ✅ 0 lỗi JS (số lần kiểm tra)
5. **Cam kết phạm vi** — đúng SPEC, không thêm/bớt, không phá feature cũ

### Bước 2 — Giám sát nghiệm thu độc lập (Claude + Playwright)
1. Đối chiếu vN + số dòng THẬT với biên bản (Read/đếm lại)
2. Read đúng khoảng dòng khai báo (không grep dò cả file)
3. Test lại Playwright MCP trên `http://localhost:8000`: lặp bước test + tự thử 1-2 case ngoài kịch bản
4. Kiểm tra hồ sơ: bảng phiên bản, cờ, sổ giao việc, nhật ký
5. Ghi kết quả: `✅ ĐÃ NGHIỆM THU` hoặc `❌ TRẢ LẠI: [lý do cụ thể]`

### Bước 3 — Sau nghiệm thu (TỰ ĐỘNG)
- ✅ Đạt → Claude **tự** duyệt đồng bộ baseline, dọn staging, trả cờ 🟢
- ❌ Trả lại → Nhà thầu sửa tiếp trên cờ 🔴, không nhận việc mới
- Quân chỉ can thiệp khi: tranh chấp, vi phạm lần 3, hoặc việc thuộc danh sách "PHẢI chuyển Quân"

---

## ⚙️ QUY TẮC CỨNG (NON-NEGOTIABLE)

| # | Quy tắc |
|---|---------|
| 1 | **TUYỆT ĐỐI KHÔNG** Gantt chart / theo dõi tiến độ dạng thanh thời gian |
| 2 | **1 AI code 1 thời điểm** — cờ 🔴/🟢 |
| 3 | **Chỉ sync baseline sau khi có ✅ nghiệm thu** |
| 4 | **Biên bản bàn giao bắt buộc** trước khi đồng ý nghiệm thu |
| 5 | **Mở dự án = đọc `PROJECT_OPERATION_CENTER.md` trước** — file quan trọng nhất |
| 6 | **Không dùng từ Anh-Việt** như "verify" — nói "kiểm tra" / "chạy thử" |
| 7 | **Giao tiếp tiếng Việt thuần**, tránh tech jargon trừ khi thật sự cần |
| 8 | **Không bao giờ** copy staging vào baseline (G:) nếu chưa được phép |

---

## 🏗️ KIẾN TRÚC KỸ THUẬT

### Frontend
- 1 file HTML/CSS/JS đơn (`FRONTEND/giao-dien-desktop-don-gian_v{N}_quan.html`)
- Giao diện tiếng Việt, kiểu desktop app giả lập Smartsheet/Google Sheets
- Chạy local: `python -m http.server 8000` tại `C:\Users\trinh\Downloads\` → test `http://localhost:8000`

### Backend (Apps Script)
- Project: **"QLDA Sheet Factory Test"**
- Script ID: `1sHPcFvUvursw2ayT5nFqmktz56u9PBVzywOUmzR4PJOJnre5prB8qTho`
- Owner: `haingocphuc2025@gmail.com` (KHÁC tài khoản Cowork `quankimdong@gmail.com`)
- Web App URL: `https://script.google.com/macros/s/AKfycbxDoD9MKJDif9QlBzrw65bu199H34U0Tdi-TgWHiEm1IyCtWEwxArxfp_d_l2Z5odIE6w/exec`
- Actions: `create`, `savefile`/`deletefile`, `savesheet`, `loadsheet`
- **⚠️ CẦN DEPLOY OAUTH** — Web App URL chạy bản cũ, cần Quân deploy bản mới (popup "Ủy quyền truy cập")

### Data Storage
- Drive path: `XayDung-QLDA/<tên dự án>/Du lieu bang/<tên Sheet>/data.json`
- Structure: `cells` + `rowMeta` (song song `level`/`collapsed`) + `attachments` + `savedAt`
- `row._level`/`row._collapsed` là thuộc tính gắn ngoài mảng → **bắt buộc tách ra `rowMeta`** khi JSON.stringify

---

## 📁 VỊ TRÍ FILE QUAN TRỌNG

| File | Vị trí mới | Ghi chú |
|------|------------|---------|
| Dashboard | `PROJECT_OPERATION_CENTER.md` (root) | **Đọc trước tiên** |
| Yêu cầu CĐT | `00_CHU_DAU_TU/YEU_CAU.md` | Quyết định, duyệt |
| Quyết định CĐT | `00_CHU_DAU_TU/QUYET_DINH.md` | Lịch sử quyết định lớn |
| Sổ giao việc | `01_BAN_QLDA/SO_GIAO_VIEC.md` | Ban QLDA quản lý |
| Sổ nghiệm thu | `01_BAN_QLDA/SO_NGHIEM_THU.md` | Ban QLDA quản lý |
| Kế hoạch | `01_BAN_QLDA/PLANNING.md` | Sprint/roadmap |
| Báo cáo ngày | `01_BAN_QLDA/BAO_CAO_NGAY.md` | Nhật ký điều phối |
| Công việc TƯ VẤN | `02_TU_VAN_THIET_KE/CONG_VIEC.md` | Research task |
| Bàn giao SPEC | `02_TU_VAN_THIET_KE/BAN_GIAO.md` | 5 mục chuẩn |
| SPEC features | `02_TU_VAN_THIET_KE/SPEC_QL_DA_DUYET/<feature>/spec.md` | Chi tiết kỹ thuật (đã duyệt) |
| SPEC mới chờ duyệt | `02_TU_VAN_THIET_KE/SPEC_NEW/<feature>/spec.md` | Chưa duyệt |
| Công việc NHÀ THẦU | `03_NHA_THAU_THI_CONG/CONG_VIEC.md` | Code task + quy trình |
| Bàn giao STAGING | `03_NHA_THAU_THI_CONG/BAN_GIAO.md` | 5 mục chuẩn |
| Frontend code | `03_NHA_THAU_THI_CONG/FRONTEND/` | HTML single-file |
| Backend code | `03_NHA_THAU_THI_CONG/BACKEND/` | Apps Script `.gs` |
| Staging | `03_NHA_THAU_THI_CONG/STAGING/` | Chờ nghiệm thu |
| Test case | `04_GIAM_SAT_NGHIEM_THU/TEST_CASE/` | Thủ công |
| Playwright | `04_GIAM_SAT_NGHIEM_THU/PLAYWRIGHT/` | Tự động |
| Biên bản nghiệm thu | `04_GIAM_SAT_NGHIEM_THU/BIEN_BAN_NGHIEM_THU.md` | Kết quả so SPEC |
| Release note | `05_TRIEN_KHAI/RELEASE_NOTE.md` | Mỗi version |
| Deploy log | `05_TRIEN_KHAI/DEPLOY_LOG.md` | Nhật ký deploy/rollback |
| Thư viện | `99_THU_VIEN/{SMARTSHEET,APPSSCRIPT,GOOGLE,NOTEBOOKLM,REFERENCE,ARCHIVE}/` | Dữ liệu tham khảo |
| SPEC đã duyệt (archive) | `99_THU_VIEN/SPEC_DA_DUYET/` | Bản lưu Ban QLDA |
| SPEC hoàn thành (archive) | `99_THU_VIEN/SPEC_DA_HOAN_THANH/` | Bản lưu Ban QLDA |

---

## 🎯 TRẠNG THÁI HIỆN TẠI (07/07/2026)

| Việc | Trạng thái |
|------|------------|
| **Baseline** | **v18 — 5.580 dòng** (Đã nghiệm thu ĐẠT) |
| **6 features v18** | Template, Duplicate, ColVis, CondFmt, Symbols/Multi, Bulk Edit — ✅ ĐẠT |
| **OAuth Apps Script** | 🔴 **CẦN QUÂN DEPLOY NGAY** (quyết định 07/07/2026) |
|| **6 SPEC v19** | Forms, Publish Report, Automation, Column Types, Conditional Formatting, Contact Column — 🟢 **ĐÃ DUYỆT** ||
|| **2 SPEC v19 mới** | Auto-Save On Exit, Copy/Cut/Paste Multiple Cells — 🟢 **ĐÃ DUYỆT (07/07/2026)** ||
|| **Tổng: 8 SPEC v19** | Đã duyệt tại `02_TU_VAN_THIET_KE/SPEC_QL_DA_DUYET/` + copy `01_BAN_QLDA/SPEC_MOI_DUYET/` ||
|| **SPEC_QL_DA_DUYET/** | 8 SPEC bản gốc tại `02_TU_VAN_THIET_KE/SPEC_QL_DA_DUYET/` ||
|| **SPEC_MOI_DUYET/** | 8 SPEC copy tại `01_BAN_QLDA/SPEC_MOI_DUYET/` ||
|| **SPEC_NEW/** | 🔴 Rỗng (đã xóa sau duyệt) ||
|| **Nhà thầu (v19)** | 🔴 **ĐANG CODE 8 FEATURES** (3/6 ĐẠT, Forms+Automation chưa, 2 mới) ||
| **Tư vấn thiết kế** | ✅ Hoàn thành 6 SPEC, bàn giao xong |
| **Giám sát** | ⚪ Chờ bàn giao v19 |
| **Triển khai** | 🔴 Đang deploy OAuth |

---

## 🛠️ CÔNG CỤ TEST

- **Playwright MCP** (Claude dùng) — test `http://localhost:8000` ổn định, không treo/timeout
- **Claude in Chrome** — riêng cho thao tác Smartsheet thật (có cookie đăng nhập)
- **Node syntax check**: `node --check <file>`
- **Local server**: `python -m http.server 8000` (hoặc `npx serve`)

---

## 📝 GHI NHỚ KHI LÀM VIỆC

1. **Đầu phiên MỚI** → đọc `PROJECT_OPERATION_CENTER.md` → hiểu ngay trạng thái 5 vai trò
2. **Trước khi sửa code** → chạy giao thức 3 bước kiểm tra phiên bản (xem `CONG_VIEC.md` nhà thầu)
3. **Test BẮT BUỘC** trên `localhost:8000` — console phải SẠCH (0 lỗi JS)
4. **Xong việc** → nộp biên bản 5 mục → chờ nghiệm thu
5. **Trong lúc chờ nghiệm thu** (cờ 🔴) → KHÔNG ngồi im → làm việc khác KHÔNG đụng file app (viết spec, research, test-kit...)
6. **Cập nhật file `.md` điều phối** (`SO_GIAO_VIEC.md`, `CONG_VIEC.md`, `BAN_GIAO.md`, `BAO_CAO_NGAY.md`) **ngay lập tức** lên Google Drive — các AI khác đọc trực tiếp từ Drive

---

## 🔗 LIÊN KẾT NHANH

- `PROJECT_OPERATION_CENTER.md` — Dashboard compact
- `00_CHU_DAU_TU/YEU_CAU.md` — Yêu cầu + quyết định
- `01_BAN_QLDA/SO_GIAO_VIEC.md` — Việc đang giao/đã giao
- `02_TU_VAN_THIET_KE/BAN_GIAO.md` — SPEC chờ duyệt/đã duyệt
- `03_NHA_THAU_THI_CONG/CONG_VIEC.md` — Task code + quy trình
- `03_NHA_THAU_THI_CONG/BAN_GIAO.md` — Biên bản bàn giao staging
- `04_GIAM_SAT_NGHIEM_THU/BIEN_BAN_NGHIEM_THU.md` — Kết quả nghiệm thu
- `05_TRIEN_KHAI/RELEASE_NOTE.md` — Release note
- `99_THU_VIEN/ARCHIVE/` — File cũ, version cũ

---

**Cập nhật:** 07/07/2026 — Restructure theo AI Software Factory v1.0  
**Người cập nhật:** Claude (Ban QLDA)