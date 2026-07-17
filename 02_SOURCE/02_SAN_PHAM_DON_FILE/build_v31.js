const fs = require('fs');
const path = require('path');

const defaultModulesDir = path.join(__dirname, 'VERSIONS', 'v31_baseline_modules');
const defaultOutputPath = path.join(__dirname, 'STAGING', 'giao-dien-desktop-don-gian_v31_quan.html');

function insertBefore(source, marker, content) {
    const markerIndex = source.indexOf(marker);
    if (markerIndex === -1) {
        throw new Error(`Build marker not found: ${marker}`);
    }
    return source.slice(0, markerIndex) + content + source.slice(markerIndex);
}

function readManifestFiles(modulesDir, files, kind) {
    return files.map((relativePath) => {
        const filePath = path.join(modulesDir, relativePath);
        if (!fs.existsSync(filePath)) {
            throw new Error(`${kind} module not found: ${relativePath}`);
        }
        return fs.readFileSync(filePath, 'utf8');
    }).join('\n');
}

function buildBundle(options = {}) {
    const modulesDir = options.modulesDir || defaultModulesDir;
    const outputPath = options.outputPath || defaultOutputPath;
    const manifest = JSON.parse(fs.readFileSync(path.join(modulesDir, 'manifest.json'), 'utf8'));
    const indexHtml = fs.readFileSync(path.join(modulesDir, manifest.index || 'index.html'), 'utf8');
    const cssContent = readManifestFiles(modulesDir, manifest.css, 'CSS')
        .replace(/<\/style/gi, '<\\/style');
    const jsContent = readManifestFiles(modulesDir, manifest.js, 'JavaScript')
        .replace(/<\/script/gi, '<\\/script');

    let output = indexHtml
        .replace(/<link rel="stylesheet" href="css\/[^\"]+\.css">\r?\n?/g, '')
        .replace(/<script src="js\/[^\"]+\.js"><\/script>\r?\n?/g, '');

    // Positional insertion preserves $', $& and other replacement tokens in source code.
    output = insertBefore(output, '</head>', `<style>\n${cssContent}\n</style>\n`);
    output = insertBefore(output, '</body>', `<script>\n${jsContent}\n</script>\n`);
    output = output.replace(
        /(<(?:span|div) class="brand-version"[^>]*>)[^<]*(<\/(?:span|div)>)/,
        (_match, openTag, closeTag) => `${openTag}v31${closeTag}`
    );

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, output, 'utf8');
    return { output, outputPath, manifest };
}

if (require.main === module) {
    const result = buildBundle();
    const sizeBytes = Buffer.byteLength(result.output, 'utf8');
    console.log(`Built v31 staging: ${result.outputPath}`);
    console.log(`Size: ${(sizeBytes / 1024).toFixed(0)} KB`);
}

module.exports = { buildBundle, insertBefore, readManifestFiles };
