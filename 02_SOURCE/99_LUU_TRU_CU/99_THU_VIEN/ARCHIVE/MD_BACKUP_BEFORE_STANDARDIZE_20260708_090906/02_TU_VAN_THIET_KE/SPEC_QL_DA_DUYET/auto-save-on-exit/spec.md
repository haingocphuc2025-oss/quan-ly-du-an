# SPEC: Auto-Save On Exit (Tự động lưu khi thoát trang)

> **Trạng thái:** 🟢 **Đã duyệt** — Ban QLDA ký duyệt 07/07/2026
> **Version:** v1.0
> **Ngày tạo:** 2026-07-07
> **Người viết:** Phuc (AI Assistant)
> **Dự án:** QLDA — Sprint 2 v19 (Feature: Auto-Save On Exit)

---

## 0. Tóm tắt thay đổi (Summary)

| Mục | Nội dung |
|-----|----------|
| **Vấn đề** | Hiện tại **CHƯA CÓ** auto-save khi user đóng tab / reload / chuyển tab / lock screen mobile. Dữ liệu đang chờ debounce (1.2s sheet / 0.6s cell) sẽ **MẤT HOÀN TOÀN**. |
| **Giải pháp** | Thêm **3 event listeners** (`beforeunload`, `visibilitychange`, `pagehide`) flush ngay lập tức dữ liệu đang chờ → dùng `navigator.sendBeacon()` (reliable khi unload) + `fetch` POST (khi tab hidden). |
| **Phạm vi** | Chỉ sửa file **`03_NHA_THAU_THI_CONG/FRONTEND/giao-dien-desktop-don-gian_v18_baseline.html`** (baseline v18, 5580 dòng). Không đụng Apps Script backend. |
| **Baseline** | v18 (5580 dòng) — đã có sẵn `scheduleSheetDataSave()`, `saveSheetDataToWebApp()`, `callSheetFactoryPost_()`. |
| **Target** | v19+ (sau khi duyệt SPEC này). |

---

## 1. Bối cảnh & Vấn đề (Context & Problem)

### 1.1 Cơ chế save hiện tại (Baseline v18)

| Hàm | Trigger | Delay | Gửi đi đâu | Nội dung |
|-----|---------|-------|------------|----------|
| `scheduleSheetDataSave(sheet)` | Mọi thay đổi: edit cell, format, indent, collapse, attachment, sort, filter... | **1.2s debounce** | Apps Script Web App (`action: 'savesheet'`) | Toàn bộ `cells[]` + `rowMeta` + `attachments` + `cellStyles` → lưu file `data.json` lên Google Drive |
| `scheduleCellSave(sheet, row, col, value)` | Edit 1 ô (khi có `googleSheetId`) | **0.6s debounce** | Apps Script Web App (`action: 'setdata'`) | Ghi 1 ô vào **Google Sheet thật** |

**Vấn đề:** Cả 2 đều dùng `setTimeout` debounce. Nếu user **đóng tab / F5 / chuyển tab / lock screen mobile** trước khi timer kịp chạy → **data mất sạch**.

### 1.2 Các scenario mất data thực tế

| Scenario | Hiện tại | Mong muốn |
|----------|----------|-----------|
| Edit cell → ngay lập tức bấm đóng tab (✕) | ❌ Mất data | ✅ Lưu xong rồi mới đóng |
| Edit cell → bấm F5 reload | ❌ Mất data | ✅ Lưu xong rồi mới reload |
| Edit cell → click sang tab khác (tab hidden) | ❌ Mất data nếu < 1.2s | ✅ Flush ngay khi tab hidden |
| Mobile: edit → lock screen / bấm home | ❌ Mất data | ✅ Flush trên `pagehide` |
| Browser crash / kill process | ❌ Mất data | ⚠️ Không thể cứu (không phải scope SPEC này) |

---

## 2. Yêu cầu chức năng (Functional Requirements)

| ID | Yêu cầu | Mức độ | Ghi chú |
|----|---------|--------|---------|
| **FR-01** | **`beforeunload`**: Flush tất cả pending saves **trước khi unload** trang. Dùng `navigator.sendBeacon()` để đảm bảo request đi được dù browser đang hủy tab. | **P0 (Must)** | Không show confirm dialog (không return string). Chỉ flush im lặng. |
| **FR-02** | **`visibilitychange` (hidden)**: Khi tab bị ẩn (`document.visibilityState === 'hidden'`), flush ngay tất cả pending saves. Dùng `fetch` POST (async, non-blocking). | **P0 (Must)** | Cover case: user click tab khác, minimize window, split-screen mobile. |
| **FR-03** | **`pagehide`**: Flush khi page bị unload hoặc vào bfcache (mobile Safari). Kiểm tra `event.persisted` để tránh double-save. | **P0 (Must)** | Cover mobile Safari bfcache. |
| **FR-04** | **Tách hàm `buildSheetSavePayload(sheet)`** từ `saveSheetDataToWebApp()` để có thể tái dùng cho beacon/fetch sync. | **P0 (Must)** | Refactor nhỏ, không thay đổi logic. |
| **FR-05** | **Tách hàm `saveSheetDataToWebApp(sheet)`** trả về `Promise` để `await` được khi cần (visibilitychange, pagehide). | **P0 (Must)** | Hiện tại đã return Promise, chỉ cần tách payload builder. |
| **FR-06** | **Idempotent**: Gọi flush nhiều lần (ví dụ `beforeunload` + `pagehide` cùng lúc) không gây duplicate save / race condition. | **P1 (Should)** | Dùng flag `isFlushing` + clear timers. |
| **FR-07** | **Không block UI**: Flush phải async, không làm treo trang khi user thao tác bình thường. | **P1 (Should)** | `sendBeacon` / `fetch` không await. |
| **FR-08** | **Cell-level saves**: Cũng flush `pendingCellSaveTimers` (setdata) nếu có `googleSheetId`. | **P2 (Nice)** | Cần đọc value hiện tại từ DOM / sheet object. |

---

## 3. Yêu cầu phi chức năng (Non-Functional Requirements)

| ID | Yêu cầu | Chi tiết |
|----|---------|----------|
| **NFR-01** | **Reliability** | `sendBeacon` success rate > 99% trên unload. Fallback `fetch` với `keepalive: true` nếu beacon fail. |
| **NFR-02** | **Performance** | Không thêm overhead khi idle. Listeners passive, chỉ chạy khi có pending timers. |
| **NFR-03** | **Backward compatible** | Không thay đổi API backend (`action: 'savesheet'`, `action: 'setdata'`). Không thay đổi format `data.json` trên Drive. |
| **NFR-04** | **No UI disruption** | Không show alert/confirm, không chặn user thoát trang. |
| **NFR-05** | **Bundle size** | Thêm < 2KB gzipped (chỉ ~50 dòng JS thuần). |

---

## 4. Kiến trúc & Thiết kế (Design)

### 4.1 Sơ đồ luồng dữ liệu (Data Flow)

```
User edit cell
      │
      ▼
scheduleSheetDataSave(sheet) ──1.2s──▶ saveSheetDataToWebApp(sheet) ──POST──▶ Apps Script Web App
      │                                        │
      │                                        ▼
      │                              Google Drive: XayDung-QLDA/<Project>/Du lieu bang/<Sheet>/data.json
      │
      └──▶ scheduleCellSave(sheet, r, c, v) ──0.6s──▶ saveCellViaWebApp(...) ──POST──▶ Google Sheets (real)
```

### 4.2 Thêm Auto-Save On Exit Layer

```
┌─────────────────────────────────────────────────────────────────┐
│                    BROWSER EVENT LAYER                          │
├─────────────────┬─────────────────────┬─────────────────────────┤
│  beforeunload   │  visibilitychange   │      pagehide           │
│  (tab close,    │  (tab hidden,       │  (mobile unload,        │
│   reload, nav)  │   minimize)         │   bfcache)              │
└────────┬────────┴─────────┬────────────┴───────────┬────────────┘
         │                  │                        │
         ▼                  ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FLUSH CONTROLLER IIFE                            │
│  forceFlushAllPendingSaves()                                    │
│  ├─ clear all pendingSheetDataSaveTimers                        │
│  ├─ clear all pendingCellSaveTimers                             │
│  ├─ buildSheetSavePayload(activeSheet)                          │
│  ├─ navigator.sendBeacon(url, JSON.stringify({action:'savesheet',...})) │
│  └─ (fallback) fetch(url, {method:'POST', keepalive:true, body})│
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Refactor Code Structure (Minimal Diff)

**File:** `giao-dien-desktop-don-gian_v18_baseline.html`  
**Vị trí:** Sau `saveSheetDataToWebApp()` (khoảng dòng 2292), trước `loadSheetDataFromWebApp()`.

```javascript
// ===== 1. TÁCH PAYLOAD BUILDER (mới) =====
function buildSheetSavePayload(sheet) {
  const project = getActiveProjectName();
  if (!project || !sheet || !sheet.name) return null;
  const cells = ensureSheetCells(sheet);
  const rowMeta = cells.map(row => ({
    level: row._level || 0,
    collapsed: !!row._collapsed
  }));
  return {
    project,
    sheetName: sheet.name,
    cells,
    rowMeta,
    attachments: serializeSheetAttachments(sheet),
    cellStyles: ensureCellStyles(sheet)
  };
}

// ===== 2. REFACTOR saveSheetDataToWebApp (giữ nguyên signature, return Promise) =====
function saveSheetDataToWebApp(sheet) {
  const payload = buildSheetSavePayload(sheet);
  if (!payload) return Promise.resolve();
  return callSheetFactoryPost_('savesheet', payload);
}

// ===== 3. AUTO-SAVE ON EXIT CONTROLLER (mới - IIFE) =====
(function installAutoSaveOnExit() {
  let isFlushing = false;
  const WEB_APP_URL = SHEET_FACTORY_WEB_APP_URL; // capture const

  function forceFlushAll() {
    if (isFlushing) return Promise.resolve();
    isFlushing = true;

    // 1. Clear & execute sheet-level pending timers
    Object.keys(pendingSheetDataSaveTimers).forEach(key => {
      const timer = pendingSheetDataSaveTimers[key];
      if (timer) window.clearTimeout(timer);
      delete pendingSheetDataSaveTimers[key];
    });

    // 2. Clear cell-level pending timers (cannot easily re-execute without current values)
    //    -> rely on sheet-level full save which includes all cells
    Object.keys(pendingCellSaveTimers).forEach(key => {
      const timer = pendingCellSaveTimers[key];
      if (timer) window.clearTimeout(timer);
      delete pendingCellSaveTimers[key];
    });

    // 3. Save active sheet immediately via beacon
    const sheet = getActiveSheet();
    if (!sheet || !sheet.name || !WEB_APP_URL) {
      isFlushing = false;
      return Promise.resolve();
    }

    const payload = buildSheetSavePayload(sheet);
    if (!payload) {
      isFlushing = false;
      return Promise.resolve();
    }

    const body = JSON.stringify(Object.assign({ action: 'savesheet' }, payload));
    const blob = new Blob([body], { type: 'application/json' });

    // Primary: sendBeacon (most reliable on unload)
    const beaconSent = navigator.sendBeacon && navigator.sendBeacon(WEB_APP_URL, blob);

    // Fallback: fetch with keepalive (if beacon unavailable or failed)
    const promise = beaconSent
      ? Promise.resolve()
      : fetch(WEB_APP_URL, {
          method: 'POST',
          body,
          keepalive: true,
          headers: { 'Content-Type': 'application/json' }
        }).catch(() => {});

    return promise.finally(() => { isFlushing = false; });
  }

  // --- beforeunload: sync flush, no confirm dialog ---
  window.addEventListener('beforeunload', (e) => {
    forceFlushAll(); // fire-and-forget, beacon handles delivery
    // KHÔNG return string → không show "Leave site?" dialog
  });

  // --- visibilitychange: tab hidden ---
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      forceFlushAll(); // async, non-blocking
    }
  });

  // --- pagehide: mobile Safari, bfcache ---
  window.addEventListener('pagehide', (e) => {
    forceFlushAll(); // persisted pages still benefit from flush
  });
})();
```

---

## 5. Kịch bản test (Test Scenarios)

| ID | Scenario | Steps | Expected | Priority |
|----|----------|-------|----------|----------|
| **TC-01** | **Edit → Close tab immediately** | 1. Mở sheet<br>2. Edit 1 ô (ví dụ: "Nội dung" → "Test")<br>3. Ngay lập tức bấm ✕ đóng tab (< 500ms) | Data "Test" xuất hiện trong `data.json` trên Drive khi mở lại | **P0** |
| **TC-02** | **Edit → F5 Reload** | 1. Edit ô<br>2. Bấm F5 ngay | Data giữ nguyên sau reload | **P0** |
| **TC-03** | **Edit → Switch tab** | 1. Edit ô<br>2. Click sang tab khác (tab hidden)<br>3. Quay lại tab QLDA | Data đã lưu, không mất | **P0** |
| **TC-04** | **Mobile: Edit → Lock screen** | 1. Mở trên Chrome mobile<br>2. Edit ô<br>3. Bấm nút nguồn lock screen<br>4. Mở lại | Data giữ nguyên | **P0** |
| **TC-05** | **Multiple rapid edits → Close** | 1. Edit 5 ô liên tiếp trong 1s<br>2. Đóng tab | Tất cả 5 thay đổi đều lưu | **P1** |
| **TC-06** | **No pending saves → Close** | 1. Không edit gì, chỉ mở sheet<br>2. Đóng tab | Không lỗi, không request thừa | **P1** |
| **TC-07** | **Visibility hidden → Visible → Edit → Close** | 1. Edit → switch tab → switch back → edit again → close | Cả 2 lần edit đều lưu | **P1** |
| **TC-08** | **Pagehide (bfcache) restore** | 1. Mobile Safari: edit → home → mở lại từ app switcher (bfcache restore) → edit → close | Data lưu đúng, không duplicate | **P2** |
| **TC-09** | **Network offline → Edit → Close → Online** | 1. Offline mode (DevTools)<br>2. Edit → close<br>3. Online → mở sheet | Data sync khi online (beacon queue) | **P2** |
| **TC-10** | **Cell-level save (googleSheetId) flush** | 1. Sheet có link Google Sheets thật<br>2. Edit ô → close tab<br>3. Mở Google Sheets thật check | Ô đó cập nhật trên Google Sheets | **P2** |

---

## 6. Rủi ro & Mitigation (Risks & Mitigations)

| Rủi ro | Xác suất | Tác động | Mitigation |
|--------|----------|----------|------------|
| `sendBeacon` bị block bởi browser policy (CORB, size > 64KB) | Thấp | Mất data on unload | Payload `data.json` thường < 10KB. Fallback `fetch(keepalive:true)`. |
| Double-save: `beforeunload` + `pagehide` cùng fire | Trung bình | Backend nhận 2 request gần nhau | Backend `savesheet` idempotent (ghi đè file cùng tên). Frontend flag `isFlushing` ngăn double-call. |
| `visibilitychange` fire quá nhiều (tab blink) | Thấp | Spam save request | Chỉ flush khi có pending timers (`Object.keys(pendingSheetDataSaveTimers).length > 0`). |
| `getActiveSheet()` return null khi unload (context đã hủy) | Thấp | Không save được sheet hiện tại | Fallback: iterate `PROJECT_FOLDERS` tìm sheet có `pendingSheetDataSaveTimers[key]`. |
| Apps Script Web App timeout (30s) trên payload lớn | Rất thấp | Save fail | Payload chỉ ~ vài KB. Timeout 45s (code hiện tại). |
| User disable beacon / `keepalive` fetch | Rất thấp | Mất data | Không thể mitigate 100%. Acceptable risk. |

---

## 7. Checklist triển khai (Implementation Checklist)

| Task | Status | Ghi chú |
|------|--------|---------|
| [ ] Tạo file SPEC này tại `SPEC_NEW/auto-save-on-exit/spec.md` | ✅ Done | |
| [ ] Review SPEC với PM / Tech Lead | ⏳ Pending | |
| [ ] Duyệt SPEC → move to `SPEC_QL_DA_DUYET/auto-save-on-exit/spec.md` | ⏳ Pending | |
| [ ] Implement: refactor `buildSheetSavePayload` + `saveSheetDataToWebApp` | ⏳ Pending | Dòng ~2277-2292 |
| [ ] Implement: IIFE `installAutoSaveOnExit()` | ⏳ Pending | Sau `loadSheetDataFromWebApp` hoặc cuối `<script>` |
| [ ] Test manual: TC-01 → TC-05 (P0) | ⏳ Pending | Cần deploy Web App URL |
| [ ] Test manual: TC-06 → TC-10 (P1/P2) | ⏳ Pending | |
| [ ] Fix bugs nếu có | ⏳ Pending | |
| [ ] Move SPEC to `SPEC_DA_HOAN_THANH/` | ⏳ Pending | |
| [ ] Bump version v18 → v19 trong `HUONG_DAN.md` §0.5 | ⏳ Pending | |

---

## 8. Phụ lục: File & Dòng code tham chiếu (baseline v18)

| Hàm / Biến | Dòng (approx) | Ghi chú |
|------------|---------------|---------|
| `SHEET_FACTORY_WEB_APP_URL` | 1657 | Const URL Web App |
| `pendingSheetDataSaveTimers` | 2266 | Object lưu timers |
| `scheduleSheetDataSave(sheet)` | 2267-2275 | Debounce 1.2s |
| `saveSheetDataToWebApp(sheet)` | 2277-2292 | Cần tách payload builder |
| `loadSheetDataFromWebApp(project, sheetName)` | 2295-2316 | Load từ Drive |
| `pendingCellSaveTimers` | 2318 | Object lưu timers cell |
| `scheduleCellSave(sheet, row, col, value)` | 2319-2329 | Debounce 0.6s |
| `getActiveSheet()` | 2091-2095 | Trả về sheet đang mở |
| `getActiveProjectName()` | 2257-2261 | Trả về project name |
| `callSheetFactoryPost_(action, payload)` | 2236-2247 | POST fetch wrapper |
| `serializeSheetAttachments(sheet)` | 1959-1980 | Serialize attachments |
| `ensureSheetCells(sheet)` | 1778-1784 | Ensure cells array |
| `ensureCellStyles(sheet)` | 1796-1799 | Ensure _cellStyles |

---

## 9. Lưu ý triển khai (Dev Notes)

1. **Không thay đổi backend** — Apps Script `luuDuLieuSheet(payload)` đã handle `action: 'savesheet'` OK.
2. **Không dùng `async/await` trong `beforeunload`** — phải sync fire beacon. `forceFlushAll()` return Promise nhưng không await.
3. **`sendBeacon` limit 64KB** — `data.json` ước tính ~5-15KB (60 rows × 19 cols + styles + attachments meta). An toàn.
4. **`keepalive: true` fetch** — Chỉ dùng khi beacon fail / không hỗ trợ. Cũng có giới hạn 64KB.
5. **Cell-level flush (FR-08)** — Phức tạp vì cần đọc value hiện tại từ DOM/sheet object. **Defer to v2** nếu P0-P1 pass. Baseline v18 đã save full sheet bao gồm tất cả cells.
6. **Testing** — Cần `SHEET_FACTORY_WEB_APP_URL` hợp lệ (deploy Apps Script). Test trên Chrome Desktop + Chrome Mobile (Android) + Safari iOS.

---

**END OF SPEC v1.0**

> **Next step:** Review & duyệt SPEC → Move to `SPEC_QL_DA_DUYET/auto-save-on-exit/spec.md` → Assign dev implement.