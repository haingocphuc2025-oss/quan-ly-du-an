const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const test = require('node:test');
const assert = require('node:assert/strict');

const projectDir = path.resolve(__dirname, '..', '..', '..');
const modulesDir = path.resolve(__dirname, '..');
const { buildBundle } = require(path.join(projectDir, 'build_v32.js'));

function extractInlineScripts(html) {
    return [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
        .map((match) => match[1])
        .filter((source) => source.trim());
}

test('V32 single-file bundle preserves JavaScript and parses successfully', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'qlda-v32-'));
    const outputPath = path.join(tempDir, 'v32.html');

    try {
        const { output } = buildBundle({ modulesDir, outputPath });
        const scripts = extractInlineScripts(output);

        assert.equal(scripts.length, 1);
        assert.doesNotThrow(() => new vm.Script(scripts[0], { filename: 'v32-inline.js' }));
        assert.match(output, /USD:'\$'/);
        assert.doesNotMatch(output, /USD:'\s*<\/html>/);
        assert.match(output, /class="brand-version"[^>]*>v32<\/(?:span|div)>/);
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
});

test('V32 bundle contains the complete preserve-template import flow', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(modulesDir, 'manifest.json'), 'utf8'));
    const importSource = fs.readFileSync(path.join(modulesDir, 'js', 'import-excel.js'), 'utf8');

    assert.equal(manifest.version, '32.0.0');
    assert.equal(manifest.output, 'giao-dien-desktop-don-gian_v32_quan.html');
    assert.ok(manifest.css.includes('css/import-excel.css'));
    assert.ok(manifest.js.includes('js/import-excel.js'));

    for (const functionName of [
        'showSheetSelector',
        'worksheetToRows',
        'normalizeImportHeader',
        'buildAutomaticMapping',
        'getUnmappedColumns',
        'applyMappedHeaderLabels',
        'showHeaderRowPicker',
        'showMappingDialog',
        'validateAndStore',
        'executeAllImports',
        'showImportReport',
        'takeUndoSnapshot',
        'pushUndoSnapshot'
    ]) {
        assert.match(importSource, new RegExp(`function\\s+${functionName}\\s*\\(`));
    }

    assert.match(importSource, /\['_rowIndex', '_attachments'\]/);
    assert.match(importSource, /worksheet\?\.\['!merges'\]/);
    assert.match(importSource, /showMappingDialog\(sheet, sheetIndex, sheetName, sheetData, sheetArrayIndex\);/);
    assert.match(importSource, /id="copyExcelHeaders"/);
    assert.match(importSource, /unmappedColumns/);
    assert.match(importSource, /allowedSheetColumns\.has\(sheetCol\)/);
    assert.match(importSource, /!isProtectedSheetColumn\(sheet, colIdx\)/);
    assert.match(importSource, /isProtectedSheetColumn\(sheet, targetColIndex\)/);
    assert.doesNotMatch(importSource, /mapping\[excelColIndex\] = excelColIndex \+ 2/);
    assert.doesNotMatch(importSource, /function\s+applyImportedHeaderSchema\s*\(/);
    assert.doesNotMatch(importSource, /function\s+buildImportedColumnDefinitions\s*\(/);
});

test('all official V32 release artifacts are byte-identical', () => {
    const artifactPaths = [
        path.join(projectDir, 'STAGING', 'giao-dien-desktop-don-gian_v32_quan.html'),
        path.join(projectDir, 'VERSIONS', 'v32_baseline.html'),
        path.join(modulesDir, 'giao-dien-desktop-don-gian_v32_quan.html'),
        path.join(projectDir, 'BANDIAO', 'giao-dien-desktop-don-gian_v32_quan.html'),
        path.join(projectDir, 'FRONTEND', 'giao-dien-desktop-don-gian_v32_quan.html')
    ];
    const expected = fs.readFileSync(artifactPaths[0]);

    for (const artifactPath of artifactPaths) {
        assert.ok(fs.existsSync(artifactPath), `Missing release artifact: ${artifactPath}`);
        assert.deepEqual(fs.readFileSync(artifactPath), expected);
    }
    assert.ok(fs.existsSync(path.join(projectDir, 'RUN_V32.bat')));
    assert.ok(fs.existsSync(path.join(projectDir, 'BANDIAO', 'RUN_V32_LOCALHOST.bat')));
});
