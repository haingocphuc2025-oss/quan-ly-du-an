---
version: 50.0
date: 2026-08-08
author: Quan (spec gốc ai-panel-v27) · Claude (điều chỉnh cho v49 + thi công)
baseline: v49 (SHA dae8b75) — thi công qua v50 → v53
status: 🟢 Đã thi công (v53) — chờ cài khoá + deploy Web App để kiểm chứng vòng gọi Gemini thật
---

# v50: Panel trợ lý AI (Gemini) bên phải

> Kế thừa spec gốc `ai-panel-v27` (08/08/2026). Mục 1 ghi rõ 3 điều chỉnh so với bản gốc —
> **đọc mục đó trước** nếu bạn đang cầm bản spec cũ trong tay.

## 0. Tóm tắt

| Mã | Hạng mục | Mức | Trạng thái |
|----|----------|-----|-----------|
| AC1 | Panel đẩy bảng thu hẹp, không đè; đóng thì giãn lại | 🔴 P0 | ✅ Đạt |
| AC2 | Kéo giãn 280–640px, nhớ độ rộng qua localStorage | 🔴 P0 | ✅ Đạt |
| AC3 | Thanh ngữ cảnh cập nhật theo vùng chọn | 🔴 P0 | ✅ Đạt |
| AC4 | Câu hỏi thuần → trả lời text, không ghi dữ liệu | 🔴 P0 | ✅ Đạt |
| AC5 | Lệnh sửa → bảng xem trước cũ/mới | 🔴 P0 | ✅ Đạt |
| AC6 | Bấm Hủy → không đổi một ô nào | 🔴 P0 | ✅ Đạt |
| AC7 | Bấm Duyệt → ghi đúng; Undo 1 lần hoàn tác cả lô | 🔴 P0 | ✅ Đạt |
| AC8 | API key không xuất hiện trong HTML gửi về trình duyệt | 🔴 P0 | ✅ Đạt |
| AC9 | JSON sai định dạng → báo lỗi, không ghi | 🔴 P0 | ✅ Đạt |
| — | Vòng gọi Gemini thật (cần khoá + deploy) | 🔴 P0 | ⏸ **Chưa kiểm chứng** |

## 1. Ba điều chỉnh so với spec gốc `ai-panel-v27`

Spec gốc viết trước khi khảo sát codebase. Ba điểm sau **đã đổi khi thi công**, có lý do:

### 1.1 Baseline: v25 → **v49**

Spec gốc ghi baseline `02_SAN_PHAM_DON_FILE/VERSIONS/v25_baseline.html`.

| | Dòng | Kích thước | Ngày |
|---|---|---|---|
| v25_baseline | 10.621 | 438 KB | 17/07/2026 |
| **v49** | **19.037** | **809 KB** | 07/08/2026 |

v25 **không có**: `V46_TEMPLATES`, `REPOST_CARRY_FORWARD`, `workspace-browse-table`, `collectDashStatusStats` — tức thiếu hệ template, Repost, bảng duyệt và toàn bộ lớp dữ liệu Dashboard. Viết trên v25 xong sẽ **không merge được** về dòng đang phát hành.

### 1.2 Màu chủ đạo: tím `#5A43D7` → **cam `#E0552F`**

Spec gốc yêu cầu tím "đồng bộ toàn app". Nhưng **v47 đã loại bỏ hoàn toàn màu tím này** khi thống nhất palette ấm — trong v49 `#5A43D7` xuất hiện **0 lần**, `#E0552F` xuất hiện **25 lần**. Làm theo spec gốc sẽ tái tạo đúng vấn đề v47 vừa sửa.

Chữ trên nền nhạt dùng sắc đậm `#9C3516` để đạt tương phản AA.

### 1.3 Quan hệ với nút "AI nhanh" cũ: **thay thế**, không thêm mới

App đã có nút `ssAiBtn` → `openSheetAiModal`. Nhưng hàm đó **không gọi AI**: nó chỉ hiện dữ liệu vùng chọn trong `<textarea readonly>` kèm nút "Sao chép nội dung" để người dùng tự dán sang công cụ AI bên ngoài.

Panel mới **thay thế** nó (`bind('ssAiBtn', toggleAiPanel)`), tránh hai lối vào AI song song.

## 2. Bố cục UI

| Hạng mục | Quy định | Thi công |
|---|---|---|
| Vị trí | Cố định bên phải, đẩy bảng thu hẹp | `<aside class="ai-panel">` là anh em của `.sheet-grid-wrap` trong `.sheet-work-area` |
| Độ rộng | Mặc định 360px | biến CSS `--ai-panel-width` |
| Giới hạn kéo | 280–640px | `aiSetWidth()` kẹp hai đầu |
| Ghi nhớ | localStorage | khoá `aiPanelWidth` |
| Đóng/mở | Nút AI trên toolbar sheet | `toggleAiPanel()` |
| Animation | trượt ngắn 150ms | `@keyframes aiSlideIn .15s` |

**Quan trọng khi sửa:** panel phải nằm trong `.sheet-work-area` (hàng flex **ngang** chứa lưới), **không** phải con trực tiếp của `.grid-sheet-view` — view đó xếp **dọc**, gắn nhầm sẽ đẩy panel xuống dưới thanh trạng thái. Đây là lỗi đã mắc và sửa khi thi công.

### Chạy ở cả hai view

Panel là **một node duy nhất**, `aiMountPanel()` chuyển nó sang `.sheet-work-area` của view đang mở. Cả `#gridSheetView` lẫn `#reportView` đều có container này. Không nhân đôi panel để khỏi tách đôi state.

## 3. Ngữ cảnh gửi cho AI

| Tình huống | Dữ liệu gửi |
|---|---|
| Có vùng chọn | Chỉ dữ liệu trong vùng + tên và kiểu các cột liên quan |
| Không chọn | Toàn bộ sheet đang mở |
| Quá lớn | Cắt tối đa **300 dòng đầu**, thanh ngữ cảnh cảnh báo `Chỉ gửi 300/1250 dòng đầu` |

Object gửi đi có 8 khoá: `tenSheet`, `cot[]` (`ten`+`kieu`), `duLieu[]` (`o`+`giaTri`), `vungChon`, `tongDongSheet`, `soDongGui`, `biCatBot`, `tongDongVung`.

**Quy ước địa chỉ ô:** cột theo `columnName()`, dòng = chỉ số mảng + 1 (hàng tiêu đề là dòng 1). Hiển thị và ghi lại dùng **cùng** quy ước, nên round-trip luôn khớp.

## 4. Luồng sửa dữ liệu

```
Gõ lệnh → aiChat() → Gemini trả JSON → BẢNG XEM TRƯỚC
                                        ├─ Duyệt → ghi + đẩy 1 action vào undo stack
                                        └─ Hủy   → không ghi gì
```

Bảng xem trước: cột **Ô / Giá trị hiện tại / Giá trị mới**, dòng có thay đổi nền vàng nhạt, quá 50 thay đổi thì hiện 50 dòng đầu + `… và N thay đổi khác`.

### Hai cạm bẫy đã gặp khi thi công

**a) `setSheetCellValue` có thể ghi xong rồi mới ném lỗi ở bước phụ trợ.** Bản đầu để exception văng khỏi vòng lặp nên lô 3 ô **chỉ ghi được 1**. Nay mỗi ô được bọc riêng, và thành công được xác định bằng cách **đọc lại giá trị**, không dựa vào việc "không có exception".

**b) `sheet._undoSnapshot` KHÔNG phải cơ chế undo của lưới.** Đó là của Clear/Carry-Forward; `undoSheetEdit()` không đọc nó. Phải dùng:

```js
pushSheetUndo({ type:'snapshot', projectIndex, folderIndex,
                before: createSheetUndoSnapshot(sheet), after: createSheetUndoSnapshot(sheet) })
```

Một action `snapshot` cho cả lô → **một lần Undo hoàn tác toàn bộ** (AC7). Redo cũng hoạt động.

## 5. Backend

File: `02_SOURCE/02_SAN_PHAM_DON_FILE/BACKEND/AiChat.gs` (tách riêng, giống `baoCaoCaNhan.gs`).

> ⚠️ **Mục này đã đổi ở v52 và v53** — xem §5.1 và §5.2 bên dưới trước khi làm theo bảng.

| Hạng mục | Quy định |
|---|---|
| Điểm vào | `aiChat(prompt, context)` qua `google.script.run` *(v50 — đã thay, xem §5.1)* |
| Model | hằng `AI_MODEL`, mặc định `gemini-2.0-flash` |
| Gọi API | `UrlFetchApp.fetch()` — client **không** gọi thẳng Google |
| Khoá | Script Properties `GEMINI_API_KEY`, không nhúng vào code |
| Ép JSON | `generationConfig.responseMimeType = 'application/json'` |
| Timeout | 30s phía client; server gọi API **đúng 1 lần**, không retry |

Scope `script.external_request` đã có sẵn trong `appsscript.json`, không cần đổi manifest.

### 5.1 v52 — đổi đường truyền: Web App + fetch

Bản v50 gọi `google.script.run`. **Hàm đó chỉ tồn tại khi Apps Script phục vụ trang web.** App này chạy cục bộ (`RUN_V45.bat` mở file trực tiếp, hoặc server local cổng 8155) và từ V45 đã dùng Drive API thẳng từ trình duyệt — nên panel AI của v50 **không bao giờ gọi được backend trong thực tế**.

v52 chuyển sang đúng cơ chế app đã có sẵn cho Drive:

```
client  fetch → SHEET_FACTORY_WEB_APP_URL  (đọc từ config.local.js)
        POST body: {action:'aichat', prompt, context}
server  doPost → aiChatForWebApp(payload) → {ok, data}
```

`google.script.run` vẫn giữ làm nhánh dự phòng cho ai host UI trong Apps Script.

### 5.2 v53 — xác thực người gọi

Web App **bắt buộc deploy mức "Anyone"**: gửi header `Authorization` sẽ kích hoạt CORS preflight mà Apps Script Web App không trả lời được. Để endpoint không mở toang, token OAuth đi trong **body** và được xác thực phía server.

| Script Property | Tác dụng | Bỏ trống |
|---|---|---|
| `GEMINI_API_KEY` | Khoá Gemini | ❌ bắt buộc |
| `AI_EXPECTED_CLIENT_ID` | Chặn token phát hành cho app khác | ⚠️ không kiểm |
| `AI_ALLOWED_EMAILS` | Danh sách email được phép (phân tách dấu phẩy) | ⚠️ không kiểm |

Client lấy token từ `ensureDriveDirectToken()` — hàm đã tự làm mới khi hết hạn, nên **không thêm bước đăng nhập nào** cho người dùng.

**Quyết định có chủ đích:** scope hiện tại chỉ có `drive`, nên `tokeninfo` có thể **không trả về email**. Nếu đã bật allowlist mà thiếu email thì **từ chối**, không cho qua — cho qua sẽ biến allowlist thành đồ trang trí. Thông báo lỗi chỉ rõ cách khắc phục: thêm scope `userinfo.email` vào `DRIVE_DIRECT_SCOPE` rồi kết nối lại Drive.

### Cài đặt (việc của người vận hành)

1. Dán `AiChat.gs` vào project Apps Script đang chạy backend
2. Thêm nhánh `aichat` vào `doPost` của `Code.gs`
3. **Project Settings → Script Properties**: thêm `GEMINI_API_KEY`, `AI_EXPECTED_CLIENT_ID`, `AI_ALLOWED_EMAILS`
4. **Deploy → New deployment → Web app** · Execute as **Me** · Access **Anyone** → copy URL `/exec`
5. Dán URL vào `sheetFactoryWebAppUrl` trong `config.local.js`
6. Chạy `kiemTraCauHinhAi()` để kiểm — gọi thử một câu, ghi ra Log, **không in khoá**

## 6. Lịch sử hội thoại

Lưu theo từng sheet (`sheet._aiHistory`), tối đa **30 lượt**, đi cùng dữ liệu sheet khi lưu. Có nút 🗑 xóa hội thoại trong header panel.

## 7. Kiểm chứng đã thực hiện

**Phía client** (đo trên origin sạch, viewport 1440×900):

- AC1 — mở: lưới 850→**596px**; đóng: về **850px**; panel không chồng lên lưới; chạy ở **cả** grid và report view
- AC2 — kẹp `200→280`, `900→640`; localStorage giữ đúng giá trị
- AC3 — `A2:D15 (14 dòng × 4 cột)` / `toàn bộ sheet "…" (28 dòng)` / cảnh báo cắt bớt
- AC4/5/6/9 — bơm payload giả vào `aiHandleResponse()`: answer không ghi, edit hiện preview, Hủy giữ nguyên dữ liệu, và **3 dạng JSON sai** đều bị từ chối
- AC7 — ghi 3 ô → **1 undo hoàn tác cả lô** → redo áp lại đúng
- AC8 — quét file: **0** khoá API

**Phía backend:** cú pháp hợp lệ dưới V8; bộ bóc JSON chạy qua **8 payload giả** (answer, edit, JSON bọc ```` ```json ````, địa chỉ ô sai, type lạ, không phải JSON, rỗng, SAFETY block); 8/8 khoá ngữ cảnh khớp giữa client và server.

**Không hồi quy:** report 43/43 · dashboard 10/51/3/66 · lưới 140 ô · kéo-thả, sắp xếp, chọn-nhiều của v48/v49 đều còn nguyên.

## 8. Chưa kiểm chứng

**Vòng gọi Gemini thật.** Môi trường thi công không có backend Apps Script nên `aiChat()` chưa từng được gọi. Client báo lỗi rõ ràng khi thiếu `google.script.run`. Sau khi cài khoá, chạy `kiemTraCauHinhAi()` để thông tuyến.

Nếu tài khoản dùng tên model khác, sửa đúng hằng `AI_MODEL`.

## 9. Ngoài phạm vi

Tự chạy nền · tự sửa không qua duyệt · biểu đồ tiến độ · Gantt.
