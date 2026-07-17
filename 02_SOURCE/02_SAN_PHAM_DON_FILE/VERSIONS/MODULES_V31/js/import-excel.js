/**
 * Import Excel Multi-Sheet Module (v31)
 * Hỗ trợ import nhiều sheet từ file .xlsx, .xls
 * Tuân thủ spec: loại trừ _rowIndex và _attachments, header row picker,
 * mapping từng sheet, validate, progress, undo batch, report per sheet
 */

const ImportExcel = (function() {
    'use strict';

    // ============================================
    // SYSTEM COLUMNS - KHÔNG BAO GIỜ IMPORT
    // ============================================
    const SYSTEM_COLUMNS = ['_rowIndex', '_attachments'];

    function isSystemColumn(columnId) {
        return SYSTEM_COLUMNS.includes(columnId);
    }

    function isSystemColumnByLabel(label) {
        if (!label) return false;
        const normalized = label.toString().trim().toLowerCase();
        return normalized === '_rowindex' || normalized === '_attachments' || normalized === 'attachments';
    }

    function isProtectedSheetColumn(sheet, columnIndex) {
        const index = Number(columnIndex);
        if (!Number.isInteger(index) || index <= 1) return true;
        const label = sheet?.cells?.[0]?.[index];
        return isSystemColumn(label) || isSystemColumnByLabel(label);
    }

    function getImportableColumns(sheet) {
        if (!sheet || !sheet.cells || !sheet.cells[0]) return [];
        const header = sheet.cells[0];
        return header.map((name, index) => {
            const config = typeof getColumnConfig === 'function' ? getColumnConfig(index, sheet) : null;
            return {
                index,
                id: name,
                label: name,
                type: config?.type || '',
                importable: index > 1 && !isSystemColumn(name) && !isSystemColumnByLabel(name)
            };
        }).filter(col => col.importable);
    }

    // ============================================
    // STATE
    // ============================================
    let importInput = null;
    let currentWorkbook = null;
    let currentFileName = null;
    let selectedHeaderRow = 0; // 0-based
    let selectedSheets = [];
    let importMode = 'append';
    let keyColumnIndex = null;
    let sheetMappings = {}; // sheetIndex -> {mapping, headerRow, validatedRows, errors}
    let undoSnapshot = null;

    // ============================================
    // UTILITIES
    // ============================================
    function escapeHtml(str) {
        if (str == null) return '';
        const div = document.createElement('div');
        div.textContent = String(str);
        return div.innerHTML;
    }

    function showToast(message, type = 'info') {
        if (typeof toast === 'function') {
            toast(message, type);
        } else {
            alert(message);
        }
    }

    function activeItem() {
        if (typeof getActiveItem === 'function') return getActiveItem();
        if (typeof activeSheetContext !== 'undefined' && activeSheetContext
            && typeof PROJECT_FOLDERS !== 'undefined') {
            const projectIndex = Number(activeSheetContext.projectIndex);
            const folderIndex = Number(activeSheetContext.folderIndex);
            if (Number.isInteger(projectIndex) && Number.isInteger(folderIndex)) {
                return PROJECT_FOLDERS[projectIndex]?.[folderIndex] || null;
            }
        }
        if (typeof window.activeItem === 'object') return window.activeItem;
        return null;
    }

    function persistProject() {
        if (typeof saveAllProjects === 'function') saveAllProjects();
        else if (typeof persistCurrentProject === 'function') persistCurrentProject();
        else if (typeof saveCurrentProjectStateSilently === 'function') saveCurrentProjectStateSilently();
        else if (typeof persistToDrive === 'function') persistToDrive();
    }

    function refreshWorkspace() {
        if (typeof refreshWorkspaceTree === 'function') refreshWorkspaceTree();
        else if (typeof renderWorkspace === 'function') renderWorkspace();
        else if (typeof renderFolderRows === 'function') renderFolderRows();
    }

    function worksheetToRows(worksheet) {
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', raw: false });
        const merges = Array.isArray(worksheet?.['!merges']) ? worksheet['!merges'] : [];

        merges.forEach(range => {
            const startRow = Number(range?.s?.r);
            const startCol = Number(range?.s?.c);
            const endRow = Number(range?.e?.r);
            const endCol = Number(range?.e?.c);
            if (![startRow, startCol, endRow, endCol].every(Number.isInteger)) return;

            const mergedValue = rows[startRow]?.[startCol] ?? '';
            for (let rowIndex = startRow; rowIndex <= endRow; rowIndex += 1) {
                if (!Array.isArray(rows[rowIndex])) rows[rowIndex] = [];
                for (let colIndex = startCol; colIndex <= endCol; colIndex += 1) {
                    if (rows[rowIndex][colIndex] == null || rows[rowIndex][colIndex] === '') {
                        rows[rowIndex][colIndex] = mergedValue;
                    }
                }
            }
        });

        return rows;
    }

    function logActivity(item, action, detail) {
        if (typeof addActivityLog === 'function') {
            addActivityLog(item, action, detail);
        }
    }

    // Undo integration
    function takeUndoSnapshot(sheet) {
        if (typeof createSheetUndoSnapshot === 'function') {
            return createSheetUndoSnapshot(sheet);
        }
        // Fallback: deep clone cells
        return JSON.parse(JSON.stringify(sheet.cells));
    }

    function pushUndoSnapshot(sheet, snapshot, label) {
        if (typeof pushSheetSnapshotUndo === 'function') {
            pushSheetSnapshotUndo(sheet, snapshot, label);
        }
    }

    // ============================================
    // MODAL HELPERS
    // ============================================
    function createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'import-overlay';
        document.body.appendChild(overlay);
        return overlay;
    }

    function createModal(id, body, overlay) {
        const modal = document.createElement('div');
        modal.className = 'import-modal';
        modal.id = id;
        modal.innerHTML = body;
        const host = overlay || document.body;
        host.appendChild(modal);
        if (!overlay) {
            modal.style.position = 'fixed';
            modal.style.top = '50%';
            modal.style.left = '50%';
            modal.style.transform = 'translate(-50%, -50%)';
        }
        modal.style.zIndex = '109001'; // above overlay
        return modal;
    }

    function closeModal(modal, overlay) {
        if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }

    function createProgressModal(title, message) {
        const overlay = createOverlay();
        const body = `
            <div class="import-dialog-header">
                <h3>${escapeHtml(title)}</h3>
            </div>
            <div class="import-progress-section">
                <div class="import-progress-bar-wrap">
                    <div class="import-progress-bar" id="importProgressBar" style="width: 0%"></div>
                </div>
                <div class="import-progress-text" id="importProgressText">${escapeHtml(message)}</div>
                <div class="import-progress-detail" id="importProgressDetail"></div>
            </div>
        `;
        const modal = createModal('import-progress-dialog', body, overlay);
        return { modal, overlay, update: (pct, text, detail) => {
            const bar = modal.querySelector('#importProgressBar');
            const txt = modal.querySelector('#importProgressText');
            const det = modal.querySelector('#importProgressDetail');
            if (bar) bar.style.width = pct + '%';
            if (txt) txt.textContent = text;
            if (det) det.textContent = detail || '';
        }, close: () => closeModal(modal, overlay) };
    }

    // ============================================
    // FILE READING
    // ============================================
    function openImportPicker() {
        if (!importInput) {
            importInput = document.createElement('input');
            importInput.type = 'file';
            importInput.accept = '.xlsx,.xls';
            importInput.style.display = 'none';
            document.body.appendChild(importInput);
            importInput.addEventListener('change', handleFileSelect);
        }
        importInput.click();
    }

    function handleFileSelect(event) {
        const file = event.target.files && event.target.files[0];
        if (file) readExcelFile(file);
        importInput.value = '';
    }

    async function readExcelFile(file) {
        if (!window.XLSX) {
            if (typeof loadSheetJS === 'function') {
                await loadSheetJS();
            }
            if (!window.XLSX) {
                showToast('Excel library unavailable. Please check your internet connection.', 'error');
                return;
            }
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            currentWorkbook = XLSX.read(arrayBuffer, { type: 'array' });
            currentFileName = file.name;
            selectedSheets = [];
            sheetMappings = {};
            selectedHeaderRow = 0;
            showSheetSelector(currentWorkbook);
        } catch (error) {
            showToast('Error reading file: ' + error.message, 'error');
        }
    }

    // ============================================
    // SHEET SELECTOR + HEADER ROW PICKER
    // ============================================
    function showSheetSelector(workbook) {
        const sheetNames = workbook.SheetNames;
        if (sheetNames.length === 0) {
            showToast('No sheets found in file', 'error');
            return;
        }

        const sheetsList = sheetNames.map((name, i) => `
            <label class="import-sheet-item">
                <input type="checkbox" name="importSheet" value="${i}" checked>
                <span class="sheet-name">${escapeHtml(name)}</span>
            </label>
        `).join('');

        const headerRowOptions = [1, 2, 3, 4, 5].map(n => `<option value="${n-1}">Dòng ${n}</option>`).join('');

        const body = `
            <div class="import-dialog-header">
                <h3>Import Excel: ${escapeHtml(currentFileName)}</h3>
                <p class="import-dialog-info">${sheetNames.length} sheet(s) found</p>
            </div>

            <div class="import-sheets-section">
                <label class="import-section-title">
                    <input type="checkbox" id="selectAllSheets" checked>
                    <span>Select sheets to import</span>
                </label>
                <div class="import-sheets-list">${sheetsList}</div>
            </div>

            <div class="import-options-section">
                <label class="import-section-title">Header row (dòng tiêu đề)</label>
                <select class="import-mode-select" id="headerRowSelect">
                    ${headerRowOptions}
                </select>
            </div>

            <div class="import-options-section">
                <label class="import-section-title">Import mode</label>
                <select class="import-mode-select" id="importMode">
                    <option value="append">Append - Thêm dòng mới</option>
                    <option value="update">Update - Cập nhật dòng trùng khóa</option>
                    <option value="upsert">Upsert - Cập nhật hoặc thêm mới</option>
                    <option value="skip">Skip - Bỏ qua trùng lặp</option>
                </select>
            </div>

            <div class="import-dialog-actions">
                <button type="button" class="import-btn secondary" id="importCancel">Hủy</button>
                <button type="button" class="import-btn primary" id="importNext">Tiếp tục →</button>
            </div>
        `;

        const overlay = createOverlay();
        const modal = createModal('import-excel-dialog', body, overlay);

        modal.querySelector('#selectAllSheets').addEventListener('change', (e) => {
            modal.querySelectorAll('input[name="importSheet"]').forEach(cb => cb.checked = e.target.checked);
        });

        modal.querySelector('#headerRowSelect').addEventListener('change', (e) => {
            selectedHeaderRow = parseInt(e.target.value);
        });

        modal.querySelector('#importMode').addEventListener('change', (e) => {
            importMode = e.target.value;
        });

        modal.querySelector('#importCancel').addEventListener('click', () => closeModal(modal, overlay));
        modal.querySelector('#importNext').addEventListener('click', () => {
            const selected = Array.from(modal.querySelectorAll('input[name="importSheet"]:checked'))
                .map(cb => parseInt(cb.value));
            if (selected.length === 0) {
                showToast('Please select at least one sheet', 'error');
                return;
            }
            selectedSheets = selected;
            closeModal(modal, overlay);
            processSelectedSheets(selectedSheets);
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal(modal, overlay);
        });
    }

    // ============================================
    // PER-SHEET PROCESSING
    // ============================================
    function processSelectedSheets(sheetIndexes) {
        const item = activeItem();
        if (!item || (item.type && item.type !== 'grid')) {
            showToast('Import chỉ áp dụng cho Grid Sheet', 'error');
            return;
        }

        // Take undo snapshot BEFORE any import
        undoSnapshot = takeUndoSnapshot(item);

        processNextSheet(0, item);
    }

    function processNextSheet(sheetArrayIndex, sheet) {
        if (sheetArrayIndex >= selectedSheets.length) {
            // All sheets done, execute all imports
            executeAllImports(sheet);
            return;
        }

        const sheetIndex = selectedSheets[sheetArrayIndex];
        const sheetName = currentWorkbook.SheetNames[sheetIndex];
        const worksheet = currentWorkbook.Sheets[sheetName];
        const sheetData = worksheetToRows(worksheet);

        if (sheetData.length === 0) {
            showToast(`Sheet "${sheetName}" is empty`, 'error');
            processNextSheet(sheetArrayIndex + 1, sheet);
            return;
        }

        // Show header row picker for this specific sheet
        showHeaderRowPicker(sheet, sheetIndex, sheetName, sheetData, sheetArrayIndex);
    }

    function showHeaderRowPicker(sheet, sheetIndex, sheetName, sheetData, sheetArrayIndex) {
        const maxHeaderRow = Math.min(sheetData.length - 1, 4);
        const headerOptions = [];
        for (let i = 0; i <= maxHeaderRow; i++) {
            headerOptions.push(`<option value="${i}" ${i === selectedHeaderRow ? 'selected' : ''}>Dòng ${i+1}</option>`);
        }

        // Preview with current header row
        const previewHeaderRow = selectedHeaderRow;
        const previewRows = sheetData.slice(previewHeaderRow + 1, previewHeaderRow + 6);
        const headerCols = sheetData[previewHeaderRow] || [];

        const previewTable = previewRows.map(row => `
            <tr>${headerCols.map((_, i) => `<td>${escapeHtml(row[i] || '')}</td>`).join('')}</tr>
        `).join('');

        const body = `
            <div class="import-dialog-header">
                <h3>Sheet: ${escapeHtml(sheetName)} (${sheetArrayIndex + 1}/${selectedSheets.length})</h3>
                <p class="import-dialog-info">Chọn dòng tiêu đề và xem trước</p>
            </div>

            <div class="import-options-section">
                <label class="import-section-title">Dòng tiêu đề</label>
                <select class="import-mode-select" id="sheetHeaderRowSelect">
                    ${headerOptions.join('')}
                </select>
            </div>

            <div class="import-preview-section">
                <label class="import-section-title">Xem trước (5 dòng đầu)</label>
                <div class="import-preview-table-wrap">
                    <table class="import-preview-table">
                        <thead><tr>${headerCols.map(h => `<th>${escapeHtml(h || '(Empty)')}</th>`).join('')}</tr></thead>
                        <tbody>${previewTable}</tbody>
                    </table>
                </div>
            </div>

            <div class="import-dialog-actions">
                <button type="button" class="import-btn secondary" id="headerBack">← Quay lại chọn sheet</button>
                <button type="button" class="import-btn secondary" id="headerCancel">Hủy</button>
                <button type="button" class="import-btn primary" id="headerNext">Tiếp tục mapping →</button>
            </div>
        `;

        const overlay = createOverlay();
        const modal = createModal('import-header-row-dialog', body, overlay);

        modal.querySelector('#sheetHeaderRowSelect').addEventListener('change', (e) => {
            selectedHeaderRow = parseInt(e.target.value);
            // Reload preview
            closeModal(modal, overlay);
            showHeaderRowPicker(sheet, sheetIndex, sheetName, sheetData, sheetArrayIndex);
        });

        modal.querySelector('#headerBack').addEventListener('click', () => {
            closeModal(modal, overlay);
            showSheetSelector(currentWorkbook);
        });

        modal.querySelector('#headerCancel').addEventListener('click', () => closeModal(modal, overlay));
        modal.querySelector('#headerNext').addEventListener('click', () => {
            closeModal(modal, overlay);
            showMappingDialog(sheet, sheetIndex, sheetName, sheetData, sheetArrayIndex);
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal(modal, overlay);
        });
    }

    // ============================================
    // COLUMN MAPPING
    // ============================================
    function showMappingDialog(sheet, sheetIndex, sheetName, sheetData, sheetArrayIndex) {
        const headerRow = selectedHeaderRow;
        const headerCols = sheetData[headerRow] || [];
        const dataRows = sheetData.slice(headerRow + 1).filter(row => row.some(cell => cell !== ''));
        const previewRows = dataRows.slice(0, 5);
        const importableColumns = getImportableColumns(sheet);

        const mappingRows = headerCols.map((colName, excelColIndex) => {
            const matched = importableColumns.find(c =>
                c.label && colName &&
                c.label.toLowerCase() === colName.toString().toLowerCase()
            );
            return `
                <div class="import-mapping-row">
                    <div class="import-excel-col">
                        <span class="col-index">${excelColIndex + 1}</span>
                        <span class="col-name">${escapeHtml(colName || '(Empty)')}</span>
                    </div>
                    <div class="import-mapping-arrow">→</div>
                    <div class="import-sheet-col">
                        <select class="import-col-select" data-excel-col="${excelColIndex}">
                            <option value="">-- Bỏ qua --</option>
                            ${importableColumns.map(c => `
                                <option value="${c.index}" ${matched && matched.index === c.index ? 'selected' : ''}>
                                    ${escapeHtml(c.label || 'Column ' + c.index)}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>
            `;
        }).join('');

        const previewTable = previewRows.map(row => `
            <tr>${headerCols.map((_, i) => `<td>${escapeHtml(row[i] || '')}</td>`).join('')}</tr>
        `).join('');

        const body = `
            <div class="import-dialog-header">
                <h3>Column Mapping: ${escapeHtml(sheetName)}</h3>
                <p class="import-dialog-info">Sheet ${sheetArrayIndex + 1} of ${selectedSheets.length}</p>
            </div>

            <div class="import-preview-section">
                <label class="import-section-title">Xem trước dữ liệu (5 dòng)</label>
                <div class="import-preview-table-wrap">
                    <table class="import-preview-table">
                        <thead><tr>${headerCols.map(h => `<th>${escapeHtml(h || '(Empty)')}</th>`).join('')}</tr></thead>
                        <tbody>${previewTable}</tbody>
                    </table>
                </div>
            </div>

            <div class="import-mapping-section">
                <label class="import-section-title">Ánh xạ cột (cột _rowIndex, _attachments đã bị ẩn)</label>
                <div class="import-mapping-list">${mappingRows}</div>
            </div>

            <div class="import-options-section" id="keyColumnSection" style="display: none;">
                <label class="import-section-title">Cột khóa (cho Update/Upsert/Skip)</label>
                <select class="import-mode-select" id="keyColumnSelect">
                    <option value="">Tự động (cột đầu tiên)</option>
                    ${importableColumns.map(c => `<option value="${c.index}">${escapeHtml(c.label)}</option>`).join('')}
                </select>
            </div>

            <div class="import-dialog-actions">
                <button type="button" class="import-btn secondary" id="mappingBack">← Quay lại</button>
                <button type="button" class="import-btn secondary" id="mappingCancel">Hủy</button>
                <button type="button" class="import-btn primary" id="mappingNext">Tiếp tục →</button>
            </div>
        `;

        const overlay = createOverlay();
        const modal = createModal('import-mapping-dialog', body, overlay);

        // Show key column selector for update/upsert/skip modes
        const needsKey = ['update', 'upsert', 'skip'].includes(importMode);
        modal.querySelector('#keyColumnSection').style.display = needsKey ? 'block' : 'none';

        modal.querySelector('#mappingBack').addEventListener('click', () => {
            closeModal(modal, overlay);
            showHeaderRowPicker(sheet, sheetIndex, sheetName, sheetData, sheetArrayIndex);
        });

        modal.querySelector('#mappingCancel').addEventListener('click', () => closeModal(modal, overlay));

        modal.querySelector('#mappingNext').addEventListener('click', () => {
            const mapping = {};
            const allowedSheetColumns = new Set(getImportableColumns(sheet).map(col => col.index));
            modal.querySelectorAll('.import-col-select').forEach(select => {
                const excelCol = parseInt(select.dataset.excelCol);
                const sheetCol = parseInt(select.value);
                if (!isNaN(sheetCol) && allowedSheetColumns.has(sheetCol)) mapping[excelCol] = sheetCol;
            });

            if (Object.keys(mapping).length === 0) {
                showToast('Vui lòng ánh xạ ít nhất một cột', 'error');
                return;
            }

            keyColumnIndex = modal.querySelector('#keyColumnSelect').value ?
                parseInt(modal.querySelector('#keyColumnSelect').value) : null;

            closeModal(modal, overlay);
            validateAndStore(sheet, sheetIndex, sheetName, sheetData, mapping, sheetArrayIndex);
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal(modal, overlay);
        });
    }

    // ============================================
    // VALIDATION
    // ============================================
    function validateAndStore(sheet, sheetIndex, sheetName, sheetData, mapping, sheetArrayIndex) {
        const headerRow = selectedHeaderRow;
        const headerCols = sheetData[headerRow] || [];
        const dataRows = sheetData.slice(headerRow + 1).filter(row => row.some(cell => cell !== ''));
        const importableColumns = getImportableColumns(sheet);

        const errors = [];
        const validatedRows = [];
        const keyCol = keyColumnIndex !== null ? keyColumnIndex : (importableColumns[0]?.index || 2);

        // Build existing keys for duplicate detection
        const existingKeys = new Set();
        for (let i = 1; i < sheet.cells.length; i++) {
            const val = sheet.cells[i][keyCol];
            if (val != null && val !== '') existingKeys.add(String(val).trim());
        }

        dataRows.forEach((row, rowIdx) => {
            const rowNum = headerRow + rowIdx + 2; // 1-based Excel row
            const mappedRow = {};
            let hasData = false;

            Object.entries(mapping).forEach(([excelCol, sheetCol]) => {
                const value = row[parseInt(excelCol)] || '';
                mappedRow[sheetCol] = value;
                if (value !== '') hasData = true;
            });

            // Validate
            const rowErrors = [];

            // Skip empty rows
            if (!hasData) {
                return; // skip silently
            }

            // Required fields check (first importable column as required)
            const mappedColumnIndexes = new Set(Object.values(mapping).map(Number));
            const firstMappedImportable = importableColumns.find(col => mappedColumnIndexes.has(col.index));
            if (firstMappedImportable && (mappedRow[firstMappedImportable.index] == null || mappedRow[firstMappedImportable.index] === '')) {
                rowErrors.push(`Cột bắt buộc (${firstMappedImportable.label}) trống`);
            }

            // Date format check (heuristic: columns with "ngày", "date", "thời gian")
            Object.entries(mappedRow).forEach(([colIdx, val]) => {
                const col = importableColumns.find(c => c.index === parseInt(colIdx));
                if (col && val && looksLikeDate(val) && !isValidDateFormat(val)) {
                    rowErrors.push(`Cột ${escapeHtml(col.label)}: định dạng ngày không hợp lệ (cần DD/MM/YYYY)`);
                }
            });

            // Type check: number columns
            Object.entries(mappedRow).forEach(([colIdx, val]) => {
                const col = importableColumns.find(c => c.index === parseInt(colIdx));
                if (col && isNumberColumn(col) && val !== '' && isNaN(Number(val))) {
                    rowErrors.push(`Cột ${escapeHtml(col.label)}: phải là số`);
                }
            });

            // Duplicate key check
            const keyVal = mappedRow[keyCol];
            if (keyVal != null && keyVal !== '' && existingKeys.has(String(keyVal).trim())) {
                if (importMode === 'skip') {
                    rowErrors.push('DUPLICATE_KEY_SKIP'); // special marker
                } else if (importMode === 'update' || importMode === 'upsert') {
                    // OK - will update
                } else {
                    rowErrors.push('Khóa trùng lặp');
                }
            }

            if (rowErrors.length > 0) {
                errors.push({ row: rowNum, errors: rowErrors, data: mappedRow });
            } else {
                validatedRows.push({ rowNum, data: mappedRow });
                if (keyVal != null && keyVal !== '') {
                    existingKeys.add(String(keyVal).trim());
                }
            }
        });

        sheetMappings[sheetIndex] = {
            sheetName,
            mapping,
            headerRow,
            validatedRows,
            errors,
            keyColumn: keyCol
        };

        if (sheetArrayIndex + 1 < selectedSheets.length) {
            // Process next sheet
            processNextSheet(sheetArrayIndex + 1, activeItem());
        } else {
            // All sheets mapped and validated, show summary and execute
            showValidationSummaryAndExecute(activeItem());
        }
    }

    function looksLikeDate(val) {
        const str = String(val).trim();
        return /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(str);
    }

    function isValidDateFormat(val) {
        const str = String(val).trim();
        const match = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
        if (!match) return false;
        const d = parseInt(match[1]);
        const m = parseInt(match[2]);
        let y = parseInt(match[3]);
        if (y < 100) y += 2000;
        return m >= 1 && m <= 12 && d >= 1 && d <= 31;
    }

    function isNumberColumn(column) {
        const label = String(column?.label || '').trim().toLowerCase();
        const textIdentifierLabels = [
            'số văn bản', 'số hiệu', 'mã hồ sơ', 'mã văn bản',
            'document number', 'reference number', 'document id'
        ];
        if (textIdentifierLabels.some(keyword => label.includes(keyword))) return false;
        const type = String(column?.type || '').trim().toLowerCase();
        if (['number', 'numeric', 'currency', 'percent', 'percentage', 'decimal'].includes(type)) return true;
        return ['amount', 'quantity', 'price', 'cost', 'số lượng', 'đơn giá', 'thành tiền', 'giá trị']
            .some(keyword => label.includes(keyword));
    }

    // ============================================
    // VALIDATION SUMMARY + EXECUTE
    // ============================================
    function showValidationSummaryAndExecute(sheet) {
        let totalRows = 0, totalValid = 0, totalErrors = 0, totalSkipped = 0;
        const sheetSummaries = [];

        Object.entries(sheetMappings).forEach(([sheetIndex, info]) => {
            const valid = info.validatedRows.length;
            const err = info.errors.filter(e => !e.errors.includes('DUPLICATE_KEY_SKIP')).length;
            const skipped = info.errors.filter(e => e.errors.includes('DUPLICATE_KEY_SKIP')).length;
            totalRows += valid + err + skipped;
            totalValid += valid;
            totalErrors += err;
            totalSkipped += skipped;
            sheetSummaries.push({
                name: info.sheetName,
                valid, errors: err, skipped
            });
        });

        const body = `
            <div class="import-dialog-header">
                <h3>Validation Summary</h3>
                <p class="import-dialog-info">${selectedSheets.length} sheet(s) ready for import</p>
            </div>

            <div class="import-results" style="margin-bottom: 20px;">
                <div class="import-result-item"><span class="result-label">Total rows</span><span class="result-value">${totalRows}</span></div>
                <div class="import-result-item success"><span class="result-label">Valid</span><span class="result-value">${totalValid}</span></div>
                <div class="import-result-item error"><span class="result-label">Errors</span><span class="result-value">${totalErrors}</span></div>
                <div class="import-result-item skipped"><span class="result-label">Skipped</span><span class="result-value">${totalSkipped}</span></div>
            </div>

            <div style="max-height: 200px; overflow-y: auto; margin-bottom: 20px;">
                ${sheetSummaries.map(s => `
                    <div style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                        <strong>${escapeHtml(s.name)}</strong><br>
                        <span style="color: #059669">✓ ${s.valid}</span>
                        <span style="color: #dc2626; margin-left: 12px">✗ ${s.errors}</span>
                        <span style="color: #6b7280; margin-left: 12px">⊘ ${s.skipped}</span>
                    </div>
                `).join('')}
            </div>

            ${totalErrors > 0 ? `
            <div class="import-error-section">
                <h4>Errors (first 10)</h4>
                <div class="import-error-list">
                    ${Object.entries(sheetMappings).flatMap(([si, info]) =>
                        info.errors.slice(0, 10).map(e => `
                            <div class="import-error-item">
                                <span class="error-sheet">${escapeHtml(info.sheetName)}</span>
                                <span class="error-row">Row ${e.row}</span>
                                <span class="error-msg">${escapeHtml(e.errors.join('; '))}</span>
                            </div>
                        `)
                    ).join('')}
                </div>
            </div>` : ''}

            <div class="import-dialog-actions">
                <button type="button" class="import-btn secondary" id="summaryBack">← Quay lại mapping</button>
                <button type="button" class="import-btn secondary" id="summaryCancel">Hủy</button>
                <button type="button" class="import-btn primary" id="summaryExecute" ${totalValid === 0 ? 'disabled' : ''}>Execute Import</button>
            </div>
        `;

        const overlay = createOverlay();
        const modal = createModal('import-summary-dialog', body, overlay);

        modal.querySelector('#summaryBack').addEventListener('click', () => {
            closeModal(modal, overlay);
            // Go back to last sheet mapping - simplified: just restart
            processSelectedSheets(selectedSheets);
        });

        modal.querySelector('#summaryCancel').addEventListener('click', () => closeModal(modal, overlay));
        modal.querySelector('#summaryExecute').addEventListener('click', () => {
            closeModal(modal, overlay);
            executeAllImports(sheet);
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal(modal, overlay);
        });
    }

    // ============================================
    // EXECUTE IMPORT WITH PROGRESS
    // ============================================
    function executeAllImports(sheet) {
        const progress = createProgressModal('Importing...', 'Preparing...');
        const results = { total: 0, success: 0, updated: 0, skipped: 0, errors: 0 };
        const allErrors = [];

        const sheetEntries = Object.entries(sheetMappings);
        let completed = 0;

        function processSheetEntry(idx) {
            if (idx >= sheetEntries.length) {
                progress.close();
                pushUndoSnapshot(sheet, undoSnapshot, `Import Excel ${currentFileName}`);
                persistProject();
                if (typeof renderGridSheet === 'function') renderGridSheet(sheet);
                refreshWorkspace();
                showImportReport(results, allErrors);
                return;
            }

            const [sheetIndex, info] = sheetEntries[idx];
            progress.update(
                Math.round((completed / sheetEntries.length) * 100),
                `Importing sheet ${idx + 1}/${sheetEntries.length}: ${info.sheetName}`,
                `${info.validatedRows.length} rows`
            );

            const { validatedRows, errors, mapping, keyColumn } = info;
            let sheetSuccess = 0, sheetUpdated = 0, sheetSkipped = 0, sheetErrors = 0;

            validatedRows.forEach((vr, rowIdx) => {
                try {
                    const mappedRow = vr.data;
                    const keyVal = mappedRow[keyColumn];

                    if (importMode === 'update' || importMode === 'upsert') {
                        if (keyVal != null && keyVal !== '') {
                            const existingRowIdx = findRowByKey(sheet, keyColumn, keyVal);
                            if (existingRowIdx >= 0) {
                                // Update existing row (only mapped columns, never _attachments)
                                Object.entries(mappedRow).forEach(([col, val]) => {
                                    const colIdx = parseInt(col);
                                    if (!isProtectedSheetColumn(sheet, colIdx)) {
                                        sheet.cells[existingRowIdx][colIdx] = val;
                                    }
                                });
                                sheetUpdated++;
                                return;
                            }
                        }
                    }

                    if (importMode === 'skip' && keyVal != null && keyVal !== '') {
                        const existingRowIdx = findRowByKey(sheet, keyColumn, keyVal);
                        if (existingRowIdx >= 0) {
                            sheetSkipped++;
                            return;
                        }
                    }

                    // Append new row
                    const newRow = Array(sheet.cells[0].length).fill('');
                    Object.entries(mappedRow).forEach(([col, val]) => {
                        const colIdx = parseInt(col);
                        if (!isProtectedSheetColumn(sheet, colIdx)) {
                            newRow[colIdx] = val;
                        }
                    });
                    // Ensure _attachments is empty array
                    const attachIdx = sheet.cells[0].indexOf('_attachments');
                    if (attachIdx >= 0) newRow[attachIdx] = [];
                    sheet.cells.push(newRow);
                    sheetSuccess++;

                } catch (error) {
                    sheetErrors++;
                    allErrors.push({ sheet: info.sheetName, row: vr.rowNum, error: error.message });
                }
            });

            // Add validation errors to report
            errors.filter(e => !e.errors.includes('DUPLICATE_KEY_SKIP')).forEach(e => {
                allErrors.push({ sheet: info.sheetName, row: e.row, error: e.errors.join('; ') });
            });

            results.total += validatedRows.length + errors.length;
            results.success += sheetSuccess;
            results.updated += sheetUpdated;
            results.skipped += sheetSkipped;
            results.errors += sheetErrors;

            completed++;
            processSheetEntry(idx + 1);
        }

        processSheetEntry(0);
    }

    function findRowByKey(sheet, keyCol, keyVal) {
        const keyStr = String(keyVal).trim();
        for (let i = 1; i < sheet.cells.length; i++) {
            const cellVal = sheet.cells[i][keyCol];
            if (cellVal != null && String(cellVal).trim() === keyStr) return i;
        }
        return -1;
    }

    // ============================================
    // IMPORT REPORT WITH UNDO
    // ============================================
    function showImportReport(results, errors) {
        const errorSection = errors.length > 0 ? `
            <div class="import-error-section">
                <h4>Errors (${errors.length})</h4>
                <div class="import-error-list">
                    ${errors.slice(0, 20).map(e => `
                        <div class="import-error-item">
                            <span class="error-sheet">${escapeHtml(e.sheet)}</span>
                            <span class="error-row">Row ${e.row}</span>
                            <span class="error-msg">${escapeHtml(e.error)}</span>
                        </div>
                    `).join('')}
                    ${errors.length > 20 ? `<div class="import-error-more">... and ${errors.length - 20} more</div>` : ''}
                </div>
                <button type="button" class="import-btn secondary" id="downloadErrors" style="margin-top: 12px;">Tải danh sách lỗi</button>
            </div>
        ` : '';

        const body = `
            <div class="import-dialog-header">
                <h3>Import Complete</h3>
            </div>

            <div class="import-results">
                <div class="import-result-item"><span class="result-label">Total rows</span><span class="result-value">${results.total}</span></div>
                <div class="import-result-item success"><span class="result-label">Imported</span><span class="result-value">${results.success}</span></div>
                ${results.updated > 0 ? `<div class="import-result-item updated"><span class="result-label">Updated</span><span class="result-value">${results.updated}</span></div>` : ''}
                ${results.skipped > 0 ? `<div class="import-result-item skipped"><span class="result-label">Skipped</span><span class="result-value">${results.skipped}</span></div>` : ''}
                ${results.errors > 0 ? `<div class="import-result-item error"><span class="result-label">Errors</span><span class="result-value">${results.errors}</span></div>` : ''}
            </div>

            ${errorSection}

            <div class="import-dialog-actions">
                <button type="button" class="import-btn secondary" id="importUndo">Undo Import</button>
                <button type="button" class="import-btn primary" id="importDone">Done</button>
            </div>
        `;

        const overlay = createOverlay();
        const modal = createModal('import-report-dialog', body, overlay);

        modal.querySelector('#importUndo').addEventListener('click', () => {
            if (undoSnapshot && typeof pushSheetSnapshotUndo === 'function') {
                // Restore from snapshot
                const item = activeItem();
                if (item && item.cells) {
                    item.cells = JSON.parse(JSON.stringify(undoSnapshot));
                    if (typeof renderGridSheet === 'function') renderGridSheet();
                    showToast('Import undone', 'success');
                }
            }
            closeModal(modal, overlay);
        });

        modal.querySelector('#importDone').addEventListener('click', () => closeModal(modal, overlay));

        if (errors.length > 0) {
            modal.querySelector('#downloadErrors').addEventListener('click', () => {
                const csv = 'Sheet,Row,Error\n' + errors.map(e =>
                    `"${e.sheet}",${e.row},"${e.error.replace(/"/g, '""')}"`
                ).join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `import-errors-${Date.now()}.csv`;
                a.click();
                URL.revokeObjectURL(url);
            });
        }

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal(modal, overlay);
        });

        logActivity(activeItem(), 'Imported Excel', `${results.success} rows imported from ${currentFileName}`);
    }

    // ============================================
    // PUBLIC API
    // ============================================
    return {
        open: openImportPicker,
        isSystemColumn: isSystemColumn,
        getImportableColumns: getImportableColumns,
        readExcelFile: readExcelFile
    };
})();

// Auto-register when DOM ready
document.addEventListener('DOMContentLoaded', function() {
    window.openImportPicker = function() {
        ImportExcel.open();
    };
});
