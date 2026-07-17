# TASK FULL: Import Excel nhiều Sheet → v31 (Complete Implementation)

## Spec
📄 `01_SPEC/NEW/import-excel-multi-sheet/spec.md`

## Baseline Modules
- Source: `02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/v31_baseline_modules/`
- Target output: `STAGING/giao-dien-desktop-don-gian_v31_quan.html`

## Current State (Codex previously wrote)
- `js/import-excel.js` — có sheet picker, mapping, report cơ bản
- `css/import-excel.css` — styling đầy đủ
- Manifest thiếu `import-excel.css`

## FULL ACCEPTANCE CRITERIA

### AC1: Read multi-sheet workbook ✅ (done)
### AC2: Select 1/multiple/all sheets ✅ (done)
### AC3: **Header Row Picker** ❌ MISSING
### AC4: Column Mapping (auto-match + dropdown) ✅ (done)
### AC5: **Filter `_rowIndex` & `_attachments`** ✅ (done - verify logic)
### AC6: **4 Modes: Append / Update / Upsert / Skip Duplicate** ⚠️ Replace→Update
### AC7: **Validate: required, date format, type, skip empty, duplicate key** ❌ MISSING
### AC8: **Progress bar** ❌ MISSING
### AC9: **Report per sheet** ⚠️ Basic report only
### AC10: **Undo batch** ❌ MISSING
### AC11: Regression tests PASS

---

## DETAILED TASK LIST (Execute sequentially)

### TASK 1: Fix Foundation Bugs
- [ ] Add `import-excel.css` to manifest.json CSS array
- [ ] Fix `getImportableColumns` filter logic (remove `col.index > 1`)
- [ ] Rename mode "replace" → "update" (only mapped cols, protect `_attachments`)
- [ ] Add z-index to modal (109001 > overlay 109000)
- [ ] Fix SYSTEM_COLUMNS check in mapping UI

### TASK 2: Header Row Picker
- [ ] Add header row selector dropdown (Row 1, 2, 3, 4, 5) in sheet selector dialog
- [ ] Use selected header row for column names & data start row
- [ ] Preview shows rows after header

### TASK 3: Per-Sheet Import Flow
- [ ] When multiple sheets selected: process each sheet with its own mapping dialog
- [ ] Store mapping per sheet
- [ ] Validate each sheet independently
- [ ] Generate report per sheet
- [ ] Optional: "Merge sheets with same structure" checkbox (if headers match)

### TASK 4: Validate Layer
- [ ] Required fields: mark columns as required (user config or first N cols)
- [ ] Date format check: DD/MM/YYYY or DD-MM-YYYY
- [ ] Type check: number columns accept numbers only
- [ ] Skip empty rows: rows where all mapped cols are empty
- [ ] Duplicate key detection based on selected key column

### TASK 5: Progress Bar + Undo Batch
- [ ] Progress bar modal during import (per sheet + overall)
- [ ] Snapshot `sheet.cells` before import using `createSheetUndoSnapshot`
- [ ] Undo button in report modal → `pushSheetSnapshotUndo(snapshot)`

### TASK 6: Key Column Selector
- [ ] In mapping dialog (or separate step): dropdown to select key column for Upsert/Skip
- [ ] Default: first importable column
- [ ] Used for duplicate detection & upsert matching

### TASK 7: Build & Test
- [ ] Build single-file HTML from modules → `STAGING/giao-dien-desktop-don-gian_v31_quan.html`
- [ ] Run `BANDIAO/tests/*.test.js` (Node + Playwright)
- [ ] Manual test: import 3-sheet Excel file

---

## FILES TO MODIFY

| File | Action |
|------|--------|
| `VERSIONS/v31_baseline_modules/js/import-excel.js` | Rewrite completely |
| `VERSIONS/v31_baseline_modules/css/import-excel.css` | Update if needed |
| `VERSIONS/v31_baseline_modules/manifest.json` | Add import-excel.css |
| `STAGING/giao-dien-desktop-don-gian_v31_quan.html` | Build output |

---

## CONSTRAINTS
- Keep existing export (XLSX) working
- Keep single-sheet import as fallback
- Use `loadSheetJS()` for XLSX
- Vietnamese UI
- All changes in v31 baseline modules
- Output HTML to STAGING

---

## HOW TO RUN
1. Read current v31 modules
2. Implement each task sequentially
3. After all: build HTML (can use simple concat script or manual)
4. Run tests
5. Report diff + test results