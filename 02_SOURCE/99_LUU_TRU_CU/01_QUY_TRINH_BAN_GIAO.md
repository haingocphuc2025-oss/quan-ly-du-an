# 📋 QUY TRÌNH BÀN GIAO SẢN PHẨM — AI SOFTWARE FACTORY v1.0

**Phiên bản:** 2.0 | **Ngày hiệu lực:** 07/07/2026  
**Vị trí lưu trữ:** `E:\My Drive\DU AN WED QUAN LY\QUY_TRINH_BAN_GIAO_SAN_PHAM.md` hoặc `G:\My Drive\DU AN WED QUAN LY\QUY_TRINH_BAN_GIAO_SAN_PHAM.md` (tùy ổ có sẵn trên máy)

---

## 🎯 MỤC ĐÍCH

Quy trình này định nghĩa **các bước bàn giao sản phẩm** giữa các vai trò trong dự án, đảm bảo:
- ✅ **Rõ ràng trách nhiệm** — ai bàn giao, ai nhận, ai xác nhận
- ✅ **Đầy đủ tài liệu** — mỗi lần bàn giao phải có biên bản + file kèm
- ✅ **Truy xuất được** — lưu trữ tại thư mục dự án, có version history
- ✅ **Tự động hóa tối đa** — giảm họp hành, tăng tốc độ
- ✅ **Nguyên tắc tự động** — đọc → tự làm → tự test → tự bàn giao, KHÔNG hỏi nhiều
- ✅ **Làm C — bàn giao E/G** — code/test trên C, bàn giao sản phẩm lên E hoặc G

---

## 🏗️ SƠ ĐỒ LUỒNG BÀN GIAO

``` 
┌──────────────┐       ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  Tư vấn      │ ── 1 ──▶  Ban QLDA    │ ── 2 ──▶  SPEC_MOI_   │ ── 3 ──▶  Nhà thầu    │
│  Thiết kế    │  SPEC   │  (Claude)    │  Duyệt  │  DUYET/      │  CODE   │  Thi công    │
│  (Research)  │  ▶     │              │  ▶     │  (Nhận việc) │  ▶     │  (Quan)      │
└──────────────┘       └──────────────┘       └──────────────┘       └──────┬───────┘
                                                                              │
                                                                              │ 4
                                                                              ▼
                                                                       ┌──────────────┐
                                                                       │  Giám sát    │
                                                                       │  Nghiệm thu  │
                                                                       │  (QA)        │
                                                                       └──────┬───────┘
                                                                              │
                                                                              │ 5
                                                                              ▼
                                                                       ┌──────────────┐
                                                                       │  Triển khai   │
                                                                       │  (Quân)      │
                                                                       └──────────────┘
```

---

## ⚡ NGUYÊN TẮC CHUNG — Tự động hóa & Ổ đĩa bàn giao

### 🔄 NGUYÊN TẮC TỰ ĐỘNG HÓA — KHÔNG HỎI NHIỀU

Tư vấn Thiết kế và Nhà thầu Thi công làm việc **hoàn toàn tự động**, tuân thủ quy trình sau:

```
📋 QUY TRÌNH TỰ ĐỘNG CHO TƯ VẤN & NHÀ THẦU

1️⃣ ĐỌC → Đọc Design Main, SPEC, tài liệu dự án (trong thư mục)
2️⃣ HIỂU → Nếu chưa rõ thì đọc lại, không hỏi
3️⃣ LÀM → Tự triển khai theo SPEC
4️⃣ TEST → Tự kiểm tra localhost, console sạch
5️⃣ BÀN GIAO → Điền biên bản, copy file staging
6️⃣ BÁO → Gửi thông báo 1 lần duy nhất: "Đã bàn giao"
7️⃣ SỬA (nếu cần) → Nhận feedback, sửa, bàn giao lại
```

**Quy tắc vàng:**
- ✅ **Chỉ hỏi khi BỊ CHẶN CỨNG** — lỗi kỹ thuật không fix được, SPEC mâu thuẫn
- ✅ **Không hỏi "làm thế nào"** — tự tìm giải pháp, tự quyết định
- ✅ **Không hỏi "đã ok chưa"** — làm xong → test → bàn giao, không cần confirm trước
- ✅ **Bàn giao 1 lần duy nhất** khi xong TẤT CẢ việc trong đợt, không bàn giao lẻ
- ❌ **Cấm hỏi:** "Em làm thế này được không?", "Anh xem giúp em...", "SPEC này sao?"

### 📁 QUY TẮC Ổ ĐĨA — Làm C, Bàn giao E/G

#### 🎯 Nguyên tắc

```
┌─────────────────────────────────────────────────────────────┐
│                    QUY TẮC Ổ ĐĨA                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   💻 LÀM VIỆC (C:)     🚀 BÀN GIAO (E: hoặc G:)           │
│   ┌──────────────┐      ┌────────────────────────────┐     │
│   │ Code, test,   │ ──▶  │ SPEC, staging, baseline,   │     │
│   │ nháp, thử     │      │ biên bản, tài liệu chính   │     │
│   │ nghiệm        │      │ thức của dự án             │     │
│   └──────────────┘      └────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### ✅ Quy tắc chi tiết

| Hoạt động | Ổ đĩa | Đường dẫn mẫu | Ghi chú |
|-----------|-------|---------------|---------|
| Code, test, nháp | `C:` | `C:\Users\trinh\code\...` | Thoải mái, không giới hạn |
| Lưu SPEC hoàn chỉnh | `E:` hoặc `G:` | `E:\My Drive\DU AN WED QUAN LY\02_TU_VAN_THIET_KE\...` | File chính thức |
| Lưu staging code | `E:` hoặc `G:` | `E:\My Drive\DU AN WED QUAN LY\03_NHA_THAU_THI_CONG\STAGING\...` | Chờ nghiệm thu |
| Lưu baseline | `E:` hoặc `G:` | `E:\My Drive\DU AN WED QUAN LY\05_THI_CONG\BASELINE\...` | Đã nghiệm thu |
| Biên bản bàn giao | `E:` hoặc `G:` | `E:\My Drive\DU AN WED QUAN LY\03_NHA_THAU_THI_CONG\BAN_GIAO.md` | Bắt buộc |
| Tài liệu dự án | `E:` hoặc `G:` | `E:\My Drive\DU AN WED QUAN LY\...` | Tất cả file .md |

#### 🧭 Cách xác định ổ đĩa mặc định

```
🧭 THUẬT TOÁN CHỌN Ổ ĐĨA:

Bước 1: Kiểm tra ổ E:\ có tồn tại không?
  ├─ CÓ  → dùng E:\My Drive\DU AN WED QUAN LY\  ✅ (ưu tiên)
  └─ KHÔNG → sang Bước 2

Bước 2: Kiểm tra ổ G:\ có tồn tại không?
  ├─ CÓ  → dùng G:\My Drive\DU AN WED QUAN LY\  ✅
  └─ KHÔNG → báo lỗi "Không tìm thấy ổ đĩa dự án"

📌 MẶC ĐỊNH: ưu tiên E: trước, G: sau
📌 Khi hỏi người dùng "bàn giao ở đâu?" → trả lời "E hoặc G tùy máy"
```

#### 📝 Script kiểm tra ổ đĩa tự động

```bash
# Kiểm tra ổ E: và G:
if [ -d "E:/My Drive/DU AN WED QUAN LY" ]; then
  echo "✅ Dùng ổ E:"
  PROJECT_ROOT="E:/My Drive/DU AN WED QUAN LY"
elif [ -d "G:/My Drive/DU AN WED QUAN LY" ]; then
  echo "✅ Dùng ổ G:"
  PROJECT_ROOT="G:/My Drive/DU AN WED QUAN LY"
else
  echo "❌ Không tìm thấy ổ dự án!"
  exit 1
fi
```

---

## 📦 1. BÀN GIAO THIẾT KẾ — Tư vấn Thiết kế → Nhà thầu

### 🎯 Mục đích
Chuyển giao **SPEC thiết kế** từ Tư vấn sang Nhà thầu để tiến hành code.

### 📋 Các bước thực hiện

|| Bước | Người thực hiện | Hành động | Đầu ra | File lưu |
|------|---------------|--------|--------|----------|
| 1️⃣ | Tư vấn Thiết kế | Hoàn thành SPEC cho từng feature | File SPEC chi tiết | `02_TU_VAN_THIET_KE/SPEC_NEW/<feature>/spec.md` |
| 2️⃣ | Tư vấn Thiết kế | Điền biên bản bàn giao | Biên bản SPEC | `02_TU_VAN_THIET_KE/BAN_GIAO.md` |
| 3️⃣ | Tư vấn Thiết kế | Báo Ban QLDA duyệt SPEC | Thông báo | — |
| 4️⃣ | Ban QLDA (Claude) | Duyệt SPEC → xác nhận | Duyệt / Từ chối | `SO_NGHIEM_THU.md` |
| 5️⃣ | Tư vấn Thiết kế | **Sau duyệt:** chuyển SPEC_NEW/ → SPEC_QL_DA_DUYET/ + copy sang `01_BAN_QLDA/SPEC_MOI_DUYET/` + xóa rỗng SPEC_NEW/ | 3 bản SPEC | `02_TU_VAN_THIET_KE/SPEC_QL_DA_DUYET/` + `01_BAN_QLDA/SPEC_MOI_DUYET/` |
| 6️⃣ | Ban QLDA (Claude) | **📍 Nhà thầu nhận việc tại `01_BAN_QLDA/SPEC_MOI_DUYET/`** — chọn 1-5 specs code | Cập nhật danh sách việc | `03_NHA_THAU_THI_CONG/CONG_VIEC.md` |

### 📝 Biên bản bàn giao SPEC (mẫu)

```markdown
### BIÊN BẢN BÀN GIAO SPEC — v[version]

| Mục | Nội dung |
|-----|----------|
| **Ngày bàn giao** | DD/MM/YYYY |
| **Người bàn giao** | Tư vấn Thiết kế |
| **Người nhận** | Nhà thầu Thi công (Quan) |
| **Danh sách SPEC** | 1. Forms, 2. Publish Report, 3. Automation, ... |
| **Tổng số file SPEC** | X files |
| **File Design Main** | `01_BAN_QLDA/DESIGN_MAIN.md` |
| **Ghi chú** | Các lưu ý đặc biệt về implementation |
| **Chữ ký nhận** | ✅ Nhà thầu đã nhận và hiểu rõ SPEC |
```

### ❌ Điều kiện từ chối bàn giao SPEC
- SPEC thiếu mô tả API (request/response)
- Thiếu UI mockup / wireframe
- Thiếu test cases tối thiểu (3+ / feature)
- File Design Main không được cập nhật

---

## 💻 2. BÀN GIAO CODE — Nhà thầu → Ban QLDA + Giám sát

### 🎯 Mục đích
Chuyển giao **code staging** từ Nhà thầu lên Ban QLDA để nghiệm thu.

### 📋 Các bước thực hiện

| Bước | Người thực hiện | Hành động | Đầu ra | File lưu |
|------|---------------|--------|--------|----------|
| 1️⃣ | Nhà thầu (Quan) | Code xong TẤT CẢ việc trong đợt giao | Code hoàn chỉnh | `03_NHA_THAU_THI_CONG/FRONTEND/` + `BACKEND/` |
| 2️⃣ | Nhà thầu (Quan) | Test localhost: `node --check`, `python -m http.server 8000` | Kết quả test | Console log |
| 3️⃣ | Nhà thầu (Quan) | Copy file staging vào thư mục `STAGING/` tại **E: hoặc G:** | File staging | `E/G:\DU AN WED QUAN LY\03_NHA_THAU_THI_CONG\STAGING\...` |
| 4️⃣ | Nhà thầu (Quan) | Điền biên bản bàn giao (5 mục bắt buộc) | Biên bản | `03_NHA_THAU_THI_CONG/BAN_GIAO.md` |
| 5️⃣ | Nhà thầu (Quan) | Cập nhật CONG_VIEC.md → đánh dấu xong | Task list | `03_NHA_THAU_THI_CONG/CONG_VIEC.md` |
| 6️⃣ | Nhà thầu (Quan) | Báo Ban QLDA kiểm tra | Thông báo | Slack / Discord |
| 7️⃣ | Ban QLDA (Claude) | Kiểm tra sơ bộ (file, biên bản, syntax) | OK / Trả về | — |
| 8️⃣ | Giám sát (QA) | Chạy test suite theo SPEC | Kết quả QA | `04_GIAM_SAT_NGHIEM_THU/BIEN_BAN_NGHIEM_THU.md` |

### 📝 5 MỤC BẮT BUỘC TRONG BIÊN BẢN BÀN GIAO CODE

```markdown
### BIÊN BẢN BÀN GIAO — v[N]

| Mục | Nội dung |
|-----|----------|
| **Ngày bàn giao** | DD/MM/YYYY |
| **1. vN + số dòng** | v[N] — X.XXX dòng (từ v[N-1]/Y.YYY). Staging: `STAGING/giao-dien-desktop-don-gian_v[N]_quan.html` |
| **2. Hàm/đoạn thêm/sửa** | **Sửa:** `functionName()` (mô tả). **Mới:** `newFunction()` (mô tả). |
| **3. Test trên localhost:8000** | TC-01: ... → PASS. TC-02: ... → PASS. ... |
| **4. Console** | ✅ 0 lỗi JS (kiểm tra X lần) |
| **5. Cam kết phạm vi** | ✅ Đúng SPEC — không thêm/bớt — không phá feature cũ |
```

### ❌ Điều kiện từ chối bàn giao code
- Thiếu 1 trong 5 mục bắt buộc
- Console có lỗi JS
- Code không pass test cơ bản (node --check)
- File staging không đúng tên quy định
- Chưa code xong TẤT CẢ việc trong đợt giao

---

## ✅ 3. BÀN GIAO NGHIỆM THU — Giám sát → Ban QLDA

### 🎯 Mục đích
Xác nhận sản phẩm **ĐẠT** hoặc **KHÔNG ĐẠT** sau khi QA kiểm tra.

### 📋 Các bước thực hiện

| Bước | Người thực hiện | Hành động | Đầu ra | File lưu |
|------|---------------|--------|--------|----------|
| 1️⃣ | Giám sát (QA) | Chạy test cases theo SPEC trên staging | Kết quả test | `04_GIAM_SAT_NGHIEM_THU/BIEN_BAN_NGHIEM_THU.md` |
| 2️⃣ | Giám sát (QA) | Kiểm tra console log, kiểm tra feature hoạt động | Báo cáo QA | `04_GIAM_SAT_NGHIEM_THU/BAO_CAO_QA.md` |
| 3️⃣ | Giám sát (QA) | So sánh với Design Main SPEC | Đối chiếu | `01_BAN_QLDA/DESIGN_MAIN.md` |
| 4️⃣ | Giám sát (QA) | Kết luận: **ĐẠT** / **KHÔNG ĐẠT** | Quyết định | `04_GIAM_SAT_NGHIEM_THU/BIEN_BAN_NGHIEM_THU.md` |
| 5️⃣ | Ban QLDA (Claude) | Nếu ĐẠT → copy đè baseline | Baseline mới | `05_THI_CONG/BASELINE/` |
| 6️⃣ | Ban QLDA (Claude) | Cập nhật sổ nghiệm thu | Sổ nghiệm thu | `01_BAN_QLDA/SO_NGHIEM_THU.md` |
| 7️⃣ | Ban QLDA (Claude) | Cập nhật dashboard | Project status | `PROJECT_OPERATION_CENTER.md` |

### 📝 Quy tắc nghiệm thu

```
🎯 ĐẠT (PASS)
├── ✅ Tất cả test cases pass
├── ✅ Console sạch (0 lỗi)
├── ✅ Đúng SPEC (không thêm/bớt)
├── ✅ Feature cũ không bị ảnh hưởng (regression)
└── ✅ File staging + biên bản đầy đủ

🔴 KHÔNG ĐẠT (FAIL)
├── ❌ Có test case FAIL
├── ❌ Console có lỗi JS
├── ❌ Feature cũ bị hỏng
└── ❌ Thiếu biên bản / file staging
```

### 📝 Biên bản nghiệm thu (mẫu)

```markdown
### BIÊN BẢN NGHIỆM THU — v[N]

| Mục | Nội dung |
|-----|----------|
| **Ngày nghiệm thu** | DD/MM/YYYY |
| **Version** | v[N] |
| **Người thực hiện** | Giám sát nghiệm thu (QA) |
| **Kết quả test** | X/Y test cases PASS |
| **Console** | ✅ 0 lỗi JS / ❌ Có lỗi |
| **So SPEC** | ✅ Đúng / ❌ Sai |
| **Kết luận** | ✅ ĐẠT / ❌ KHÔNG ĐẠT |
| **Lý do (nếu không đạt)** | ... |
| **Chữ ký QA** | ✅ |
| **Chữ ký Ban QLDA** | ✅ |
```

---

## 🚀 4. BÀN GIAO TRIỂN KHAI — Ban QLDA → Triển khai

### 🎯 Mục đích
Chuyển giao **baseline đã nghiệm thu** cho Triển khai để đưa lên production.

### 📋 Các bước thực hiện

| Bước | Người thực hiện | Hành động | Đầu ra | File lưu |
|------|---------------|--------|--------|----------|
| 1️⃣ | Ban QLDA (Claude) | Xác nhận baseline mới đã sẵn sàng | Baseline | `05_THI_CONG/BASELINE/giao-dien-desktop-don-gian_v[N]_baseline.html` |
| 2️⃣ | Ban QLDA (Claude) | Ghi release note | Ghi chú phát hành | `05_TRIEN_KHAI/RELEASE_NOTE.md` |
| 3️⃣ | Ban QLDA (Claude) | Báo Triển khai (Quân) | Thông báo | Slack / Discord |
| 4️⃣ | Triển khai (Quân) | Deploy lên môi trường production | Deploy | `05_TRIEN_KHAI/DEPLOY_LOG.md` |
| 5️⃣ | Triển khai (Quân) | Kiểm tra production | Verify | — |
| 6️⃣ | Triển khai (Quân) | Báo cáo kết quả deploy | Hoàn thành | `05_TRIEN_KHAI/DEPLOY_LOG.md` |

---

## 🔄 5. BÀN GIAO NGHIÊN CỨU — Tư vấn Thiết kế → Nghiên cứu SPEC mới

### 🎯 Mục đích
Sau khi bàn giao SPEC xong, Tư vấn Thiết kế tiếp tục nghiên cứu tính năng mới.

### 📋 Các bước thực hiện

| Bước | Người thực hiện | Hành động | Đầu ra | File lưu |
|------|---------------|--------|--------|----------|
| 1️⃣ | Tư vấn Thiết kế | Bàn giao SPEC xong cho Nhà thầu | (theo mục 1) | `02_TU_VAN_THIET_KE/BAN_GIAO.md` |
| 2️⃣ | Tư vấn Thiết kế | Cập nhật trạng thái "đã bàn giao" | Cập nhật | `02_TU_VAN_THIET_KE/CONG_VIEC.md` |
| 3️⃣ | Tư vấn Thiết kế | Chuyển sang nghiên cứu tính năng mới | Research | Tài liệu nghiên cứu |
| 4️⃣ | Tư vấn Thiết kế | Tổng hợp báo cáo nghiên cứu | Báo cáo | Thêm vào `01_BAN_QLDA/DESIGN_MAIN.md` |
| 5️⃣ | Tư vấn Thiết kế | Viết SPEC mới cho tính năng tiếp theo | SPEC mới | `02_TU_VAN_THIET_KE/SPEC/<feature-moi>/spec.md` |
| 6️⃣ | Tư vấn Thiết kế | Lặp lại quy trình từ đầu | (vòng lặp) | — |

---

## 🗺️ SƠ ĐỒ TỔNG THỂ — LUỒNG BÀN GIAO ĐẦY ĐỦ

```
          ┌──────────────────────────────────────────────────────┐
          │                    VÒNG LẶP PHÁT TRIỂN               │
          │                                                      │
          ▼                                                      │
 ┌──────────────┐     ┌──────────────┐     ┌──────────────┐      │
 │  Nghiên cứu  │────▶│  Viết SPEC   │────▶│  Duyệt SPEC  │      │
 │  tính năng   │     │  (Tư vấn)    │     │  (Ban QLDA)  │      │
 │  mới         │     │              │     │              │      │
 └──────────────┘     └──────────────┘     └──────┬───────┘      │
                                                   │              │
                                                   ▼              │
                                          ┌──────────────┐       │
                                          │  Giao việc   │       │
                                          │  (Ban QLDA)  │       │
                                          └──────┬───────┘       │
                                                   │              │
                                                   ▼              │
                                          ┌──────────────┐       │
                                          │  Code + Test │       │
                                          │  (Nhà thầu)  │       │
                                          └──────┬───────┘       │
                                                   │              │
                                                   ▼              │
                                          ┌──────────────┐       │
                                          │  Bàn giao    │───────┘ (nếu FAIL)
                                          │  staging     │
                                          └──────┬───────┘
                                                   │
                                                   ▼
                                          ┌──────────────┐
                                          │  Nghiệm thu  │──── (nếu FAIL → quay lại Code)
                                          │  (QA)        │
                                          └──────┬───────┘
                                                   │ (nếu PASS)
                                                   ▼
                                          ┌──────────────┐
                                          │  Triển khai  │
                                          │  (Quân)      │
                                          └──────────────┘
                                                   │
                                                   ▼
                                          ┌──────────────┐
                                          │  ✅ HOÀN      │
                                          │  THÀNH       │
                                          └──────────────┘
```

---

## 📁 CẤU TRÚC FILE BÀN GIAO — TỔNG QUAN

```
DU AN WED QUAN LY/
├── 📄 QUY_TRINH_BAN_GIAO_SAN_PHAM.md          ← File này (quy trình tổng)
├── 📄 PROJECT_OPERATION_CENTER.md              ← Dashboard trạng thái
│
├── 01_BAN_QLDA/                                 ← Ban Quản Lý Dự Án
│   ├── 📄 DESIGN_MAIN.md                       ← Design Main tổng hợp
│   ├── 📄 SO_GIAO_VIEC.md                      ← Sổ giao việc
│   ├── 📄 SO_NGHIEM_THU.md                     ← Sổ nghiệm thu
│   ├── 📄 CLAUDE_NHIEM_VU.md                   ← Nhiệm vụ Claude
│   └── SPEC_MOI_DUYET/                         ← SPEC đã duyệt — Nhà thầu nhận việc tại đây
│       ├── forms/spec.md
│       ├── publish-report/spec.md
│       └── ...
│
├── 02_TU_VAN_THIET_KE/                          ← Tư vấn Thiết kế
│   ├── 📄 BAN_GIAO.md                          ← Biên bản bàn giao SPEC
│   ├── 📄 CONG_VIEC.md                         ← Việc của Tư vấn
│   ├── SPEC_NEW/                               ← SPEC mới chưa duyệt
│   │   ├── forms/spec.md
│   │   ├── publish-report/spec.md
│   │   └── ...
│   ├── SPEC_QL_DA_DUYET/                       ← SPEC đã duyệt (bản gốc)
│   │   ├── forms/spec.md
│   │   ├── publish-report/spec.md
│   │   └── ...
│   └── ARCHIVE/                                ← SPEC cũ
│
├── 03_NHA_THAU_THI_CONG/                        ← Nhà thầu Thi công
│   ├── 📄 BAN_GIAO.md                          ← Biên bản bàn giao CODE (5 mục)
│   ├── 📄 CONG_VIEC.md                         ← Việc của Nhà thầu
│   ├── FRONTEND/                               ← Code UI
│   ├── BACKEND/                                ← Code Apps Script
│   └── STAGING/                                ← File staging chờ nghiệm thu
│       └── giao-dien-desktop-don-gian_v{N}_quan.html
│
├── 04_GIAM_SAT_NGHIEM_THU/                      ← Giám sát Nghiệm thu
│   ├── 📄 BIEN_BAN_NGHIEM_THU.md               ← Biên bản nghiệm thu
│   └── 📄 BAO_CAO_QA.md                        ← Báo cáo QA chi tiết
│
├── 05_THI_CONG/                                 ← Thi công (Baseline)
│   ├── BASELINE/                               ← Bản đã nghiệm thu
│   │   └── giao-dien-desktop-don-gian_v{N}_baseline.html
│   └── STAGING/                                ← Bản sao staging
│
└── 05_TRIEN_KHAI/                               ← Triển khai
    ├── 📄 DEPLOY_LOG.md                        ← Nhật ký deploy
    └── 📄 RELEASE_NOTE.md                      ← Ghi chú phát hành
```

---

## ✅ TIÊU CHÍ BẮT BUỘC — TỪNG LOẠI BÀN GIAO

### 📐 Bàn giao SPEC (Tư vấn → Nhà thầu)
```
✅ BẮT BUỘC:
   • File SPEC cho từng feature (tối thiểu 3 test cases/feature)
   • DESIGN_MAIN.md được cập nhật
   • Biên bản bàn giao SPEC có chữ ký
   • Ban QLDA đã duyệt
```

### 💻 Bàn giao CODE (Nhà thầu → Ban QLDA)
```
✅ 5 MỤC BẮT BUỘC:
   1. vN + số dòng
   2. Hàm/đoạn thêm/sửa
   3. Test trên localhost:8000 (kết quả cụ thể)
   4. Console sạch (0 lỗi JS)
   5. Cam kết phạm vi (đúng SPEC)
```

### ✅ Bàn giao NGHIỆM THU (QA → Ban QLDA)
```
✅ BẮT BUỘC:
   • Biên bản nghiệm thu có kết luận ĐẠT/FAIL
   • Test cases từ SPEC đều được chạy
   • Console log được kiểm tra
   • Regression check (feature cũ không hỏng)
```

### 🚀 Bàn giao TRIỂN KHAI (Ban QLDA → Triển khai)
```
✅ BẮT BUỘC:
   • Baseline đã được copy từ staging đã nghiệm thu
   • Release note ghi rõ thay đổi
   • Deploy log ghi nhận thời gian + kết quả
```

---

## ⏱️ THỜI GIAN MỤC TIÊU CHO MỖI LẦN BÀN GIAO

| Loại bàn giao | Thời gian tối đa | Ghi chú |
|---------------|-----------------|---------|
| SPEC → Nhà thầu | 1 ngày | Sau khi Ban QLDA duyệt |
| CODE → Staging | 1-2 tuần | Tùy độ phức tạp feature |
| Nghiệm thu (QA) | 1-2 ngày | Sau khi nhận staging |
| Triển khai | 1 ngày | Sau khi nghiệm thu ĐẠT |
| Nghiên cứu SPEC mới | Liên tục | Song song với code |

---

## 🚨 XỬ LÝ BÀN GIAO THẤT BẠI

### Khi bàn giao CODE bị từ chối:
```
1. Nhà thầu nhận lý do từ chối (thiếu mục nào, lỗi gì)
2. Sửa lỗi / bổ sung thiếu sót
3. Test lại localhost
4. Bàn giao lại (cập nhật biên bản cũ, KHÔNG tạo mới)
5. Tối đa 3 lần bàn giao lại → báo Ban QLDA xem xét
```

### Khi nghiệm thu KHÔNG ĐẠT:
```
1. QA ghi rõ lý do + test case bị FAIL
2. Trả về Nhà thầu sửa
3. Nhà thầu sửa xong → bàn giao lại
4. QA chạy lại test case bị FAIL + regression
5. Nếu vẫn FAIL → báo Ban QLDA quyết định
```

---

## 📊 THEO DÕI TRẠNG THÁI BÀN GIAO

Trạng thái bàn giao được cập nhật trong `PROJECT_OPERATION_CENTER.md`:

```
🟢 Đã bàn giao — chờ nhận
🟡 Đang xử lý (code/test/duyệt)
🔴 Bàn giao thất bại — đang sửa
✅ Hoàn thành — đã nghiệm thu
⏳ Chờ xử lý
```

---

## ✅ KẾT LUẬN

Quy trình này đảm bảo:

1. **Tất cả bàn giao đều có biên bản + file kèm** — không bàn giao miệng
2. **5 mục bắt buộc cho bàn giao code** — chuẩn hóa toàn bộ
3. **Mỗi vai trò đều biết rõ trách nhiệm** — ai làm gì, giao cho ai
4. **Tự động hóa tối đa** — giảm họp, tăng tốc
5. **Lưu trữ tập trung tại G:\ hoặc E:\** — dễ truy xuất

**Áp dụng cho tất cả các lần bàn giao từ ngày 07/07/2026.**

## 📌 TÓM TẮT 2 NGUYÊN TẮC VÀNG

| # | Nguyên tắc | Nội dung |
|---|-----------|----------|
| 1️⃣ | **Tự động hóa — Không hỏi nhiều** | Đọc → tự làm → tự test → tự bàn giao. Chỉ hỏi khi bị chặn cứng |
| 2️⃣ | **Làm C — Bàn giao E/G** | Code/test/nháp trên C:. Mọi file chính thức, staging, biên bản đặt trên E: hoặc G: (ưu tiên E: trước) |

---

*Tài liệu này được lưu tại:*
- *`E:\My Drive\DU AN WED QUAN LY\QUY_TRINH_BAN_GIAO_SAN_PHAM.md` (ưu tiên nếu có ổ E)*
- *`G:\My Drive\DU AN WED QUAN LY\QUY_TRINH_BAN_GIAO_SAN_PHAM.md` (dự phòng nếu không có E)*
