# 🏗️ SOP NHÀ THẦU THI CÔNG — Quy trình vận hành chuẩn

> **Vai trò:** Code writer — thi công phần mềm theo SPEC đã duyệt.
> **Nguyên tắc:** KHÔNG nghiên cứu. KHÔNG đổi SPEC. Chỉ code đúng việc được giao.

---

## 🎯 TỔNG QUAN LUỒNG CÔNG VIỆC

```
Ban QLDA (Claude) → giao việc qua CONG_VIEC.md
  → Nhà thầu (Codex/AI Code) → đọc SPEC → Code → Test local
  → Nộp STAGING/ + BAN_GIAO.md + CODE_DIFF.md
  → Ban QLDA → kiểm tra 5 mục + review diff
  → Giám sát nghiệm thu (Claude) → test so SPEC
  → ĐẠT → copy baseline
  → KHÔNG ĐẠT → trả về sửa
```

---

## 📋 QUY TRÌNH CHI TIẾT (8 BƯỚC)

### Bước 1: Đọc CONG_VIEC.md
Mở `03_NHA_THAU_THI_CONG/CONG_VIEC.md` → xem bảng **VIỆC ĐANG LÀM** → đọc đúng SPEC được giao.

### Bước 2: Đọc SPEC
Đọc SPEC tại `01_BAN_QLDA/SPEC_MOI_DUYET/<feature>/spec.md`.
**TUÂN THỦ TUYỆT ĐỐI** — không suy diễn, không thêm bớt.

### Bước 3: Code
Code vào **1 file HTML/JS/CSS duy nhất**: `giao-dien-desktop-don-gian_v{N}_quan.html`

### Bước 4: Test local
```
python -m http.server 8000 → localhost:8000
DevTools Console → Reload 3 lần → ✅ 0 lỗi JS
Từng test case trong SPEC → PASS hết
```

### Bước 5: Nộp staging + Biên bản + **Code Diff**
1. Copy file vào `STAGING/giao-dien-desktop-don-gian_v{N}_quan.html`
2. Cập nhật `BAN_GIAO.md` — đủ 5 mục cho version mới
3. **Tạo `CODE_DIFF.md`** — chỉ paste đoạn code thêm/sửa (xem mục bên dưới)
4. Báo Ban QLDA

### Bước 6–8: Claude kiểm tra → nghiệm thu → cập nhật tracking

---

## 🎯 5 MỤC BẮT BUỘC — BIÊN BẢN BÀN GIAO

| Mục | Nội dung | Ví dụ |
|-----|----------|-------|
| **Ngày bàn giao** | DD/MM/YYYY | 07/07/2026 |
| **1. vN + số dòng** | v{N} — X.XXX dòng (+/- so v{N-1}) | v20 — 6.623 dòng (+155 so v19/6.468) |
| **2. Hàm/đoạn thêm/sửa** | Tên hàm, số dòng cụ thể | initAuth() L1771, saveProject() L1826 |
| **3. Test localhost** | Test case cụ thể + PASS/FAIL | Sign-in Google PASS, save JSON Drive PASS |
| **4. Console** | ✅ 0 lỗi JS — ghi rõ số lần reload | ✅ 0 lỗi JS (3 lần reload) |
| **5. Cam kết phạm vi** | Đúng SPEC — không phá feature cũ | ✅ Đúng SPEC — v19 features giữ nguyên |

> ⚠️ **BAN_GIAO.md phải cập nhật cho từng version.** Nộp v20 mà BAN_GIAO.md vẫn ghi v19 = không nhận.

---

## 📄 CODE_DIFF.md — QUY TẮC REVIEW TIẾT KIỆM TOKEN

> **Lý do:** File HTML v20 ~300KB = ~80,000 tokens nếu đọc toàn bộ.
> Claude **không đọc full file** — chỉ đọc phần thêm/sửa trong `CODE_DIFF.md`.
> Nhà thầu có trách nhiệm paste đúng, đủ các đoạn thay đổi.

### Cấu trúc CODE_DIFF.md

```markdown
# CODE DIFF — v{N}

## 1. HÀM/ĐOẠN MỚI HOÀN TOÀN

### [Tên hàm/feature] — dòng {X}–{Y}
```javascript
// Paste toàn bộ hàm/đoạn mới ở đây
function tenHam() {
  ...
}
```

## 2. HÀM/ĐOẠN SỬA TỪ VERSION CŨ

### [Tên hàm] — dòng {X} — SỬA: [mô tả ngắn thay đổi]
```javascript
// TRƯỚC (v{N-1}):
const DRIVE_API_CLIENT_ID = '';

// SAU (v{N}):
const DRIVE_API_CLIENT_ID = CLIENT_ID; // sync với GIS CLIENT_ID
```

## 3. HTML THÊM/SỬA

### [Mô tả] — khu vực [toolbar / modal / status bar...]
```html
<!-- Paste đoạn HTML thêm/sửa -->
<span id="saveStatus" style="margin-left:12px;font-weight:500;"></span>
```

## 4. ĐOẠN CÓ THỂ ẢNH HƯỞNG FEATURE CŨ

### [Tên hàm/đoạn] — lý do có thể ảnh hưởng
```javascript
// Paste đoạn code có thể va chạm feature cũ
```
```

---

### Quy tắc viết CODE_DIFF.md

| Quy tắc | Chi tiết |
|---------|---------|
| **Paste đủ context** | Không paste 1 dòng đơn lẻ — paste toàn bộ hàm hoặc block |
| **Ghi số dòng** | `dòng 1771–1790` để Claude tra cứu nếu cần |
| **Mục 4 bắt buộc** | Liệt kê MỌI đoạn có thể ảnh hưởng feature cũ — kể cả không chắc |
| **Không paste toàn file** | CODE_DIFF.md tối đa ~200 dòng code |
| **Mỗi hàm 1 block** | Không gộp nhiều hàm vào 1 block |

---

### Ví dụ CODE_DIFF.md tốt (v20)

```markdown
# CODE DIFF — v20

## 1. HÀM MỚI HOÀN TOÀN

### initAuth() — dòng 1771–1780
```javascript
function initAuth() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (response) => {
      accessToken = response.access_token;
      onSignedIn();
    }
  });
}
```

### showSaveStatus() — dòng 1782–1789
```javascript
function showSaveStatus(status) {
  const el = document.getElementById('saveStatus');
  if (!el) return;
  const map = { saving: '⏳ Đang lưu...', saved: '✅ Đã lưu', error: '❌ Lỗi lưu' };
  el.textContent = map[status] || '';
  if (status === 'saved') setTimeout(() => { el.textContent = ''; }, 2000);
}
```

## 2. HÀM/ĐOẠN SỬA

### DRIVE_API_CLIENT_ID — dòng 2014 — SỬA: sync với CLIENT_ID thật
```javascript
// TRƯỚC:
const DRIVE_API_CLIENT_ID = '';

// SAU:
const DRIVE_API_CLIENT_ID = CLIENT_ID;
```

## 3. HTML SỬA

### saveStatus span trong sheetStatus — toolbar khu vực bottom
```html
<div class="sheet-status" id="sheetStatus">
  Google Drive API làm lõi · Lưu dữ liệu trực tiếp lên Drive
  <span id="saveStatus" style="margin-left:12px;font-weight:500;"></span>
</div>
```

## 4. ĐOẠN CÓ THỂ ẢNH HƯỞNG FEATURE CŨ

### saveSheetDataToWebApp() — đã redirect sang Drive API
```javascript
// Hàm này giờ gọi savProjectData() thay vì Apps Script
// Có thể ảnh hưởng: Auto-Save, Keyboard Shortcut Ctrl+S
function saveSheetDataToWebApp(sheet) {
  const payload = buildSheetSavePayload(sheet);
  if(!payload) return Promise.resolve();
  return saveProjectData(payload.project, payload);
}
```
```

---

## 🚨 LỖI PHỔ BIẾN — RÚT KINH NGHIỆM

### Lỗi 1: Biến trùng lặp / xung đột
Khi thêm SPEC mới thay thế code cũ → **Ctrl+F tìm biến cũ → đồng bộ hoặc xóa.**
```javascript
// ✅ ĐÚNG
const DRIVE_API_CLIENT_ID = CLIENT_ID;
// ❌ SAI — để rỗng gây confuse
const DRIVE_API_CLIENT_ID = '';
```

### Lỗi 2: Thiếu UI element SPEC yêu cầu
Đối chiếu `id=` trong **Section 4 SPEC** với HTML thực tế trước khi nộp.

### Lỗi 3: BAN_GIAO.md không cập nhật theo version
Nộp version mới = phải viết biên bản mới. Không copy biên bản cũ.

### Lỗi 4: Test bằng file:/// thay vì localhost
`file:///` → Google Sign-In không hoạt động, OAuth bị block.
**Luôn dùng:** `python -m http.server 8000` → `localhost:8000`

---

## ✅ CHECKLIST TRƯỚC KHI NỘP

```
□ Đọc SPEC đủ 6 section (đặc biệt Section 4 Giao diện)?
□ Tất cả id= trong SPEC có element tương ứng trong HTML?
□ Ctrl+F: tìm biến/hàm trùng lặp từ code cũ → đồng bộ hoặc xóa?
□ Test localhost:8000 (KHÔNG dùng file:///) → 0 lỗi JS?
□ Tất cả test case PASS?
□ BAN_GIAO.md đã cập nhật cho version này?
□ CODE_DIFF.md đã viết đủ 4 mục (đặc biệt mục 4)?
□ File đặt đúng tên: giao-dien-desktop-don-gian_v{N}_quan.html?
```

---

## 🚀 LƯU Ý QUAN TRỌNG

| Điều | Mô tả |
|------|-------|
| **Không paste full file** | Claude chỉ đọc CODE_DIFF.md — tiết kiệm ~80,000 tokens |
| **Nộp 1 lần** | Chỉ nộp khi xong TẤT CẢ việc, đã test kỹ |
| **Không tự copy baseline** | Chỉ Ban QLDA/Giám sát mới copy baseline sau khi ký ĐẠT |
| **Console phải sạch** | 0 lỗi JS — điều kiện tiên quyết |
| **Biên bản đúng version** | BAN_GIAO.md phải khớp với version đang nộp |

---

> 📅 Phiên bản: v4.0 — 07/07/2026
> Bổ sung **CODE_DIFF.md** — review diff thay vì đọc full file
