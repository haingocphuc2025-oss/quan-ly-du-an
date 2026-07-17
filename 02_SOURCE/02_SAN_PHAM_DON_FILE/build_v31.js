const fs = require('fs');
const path = require('path');

const modulesDir = 'E:/My Drive/03_DU_AN_PHAN_MEM/DU AN WED QUAN LY/02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/v31_baseline_modules';
const outputPath = 'E:/My Drive/03_DU_AN_PHAN_MEM/DU AN WED QUAN LY/02_SOURCE/02_SAN_PHAM_DON_FILE/STAGING/giao-dien-desktop-don-gian_v31_quan.html';

// Read manifest
const manifest = JSON.parse(fs.readFileSync(path.join(modulesDir, 'manifest.json'), 'utf8'));
const indexHtml = fs.readFileSync(path.join(modulesDir, 'index.html'), 'utf8');

// Read and inline CSS
let cssContent = '';
for (const cssFile of manifest.css) {
    const filePath = path.join(modulesDir, cssFile);
    if (fs.existsSync(filePath)) {
        cssContent += fs.readFileSync(filePath, 'utf8') + '\n';
    } else {
        console.error('WARN: CSS not found:', cssFile);
    }
}

// Read and inline JS
let jsContent = '';
for (const jsFile of manifest.js) {
    const filePath = path.join(modulesDir, jsFile);
    if (fs.existsSync(filePath)) {
        jsContent += fs.readFileSync(filePath, 'utf8') + '\n';
    } else {
        console.error('WARN: JS not found:', jsFile);
    }
}

// Replace external CSS links with inline
let output = indexHtml;
output = output.replace(/<link rel="stylesheet" href="css\/[^"]+\.css">\n?/g, '');
output = output.replace('</head>', `<style>\n${cssContent}</style>\n</head>`);

// Replace external JS script tags with inline
output = output.replace(/<script src="js\/[^"]+\.js"><\/script>\n?/g, '');
output = output.replace('</body>', `<script>\n${jsContent}</script>\n</body>`);

// Update version badge from v30 to v31
output = output.replace(
    /<span class="brand-sub">[^<]+<\/span>\s*<\/div>\s*<\/div>\s*<span class="brand-version"[^>]*>v30<\/span>/,
    '<span class="brand-sub">Giao diện thao tác nhanh</span>\n </div>\n </div>\n <span class="brand-version" title="Số phiên bản file — dùng để biết đang mở đúng bản mới nhất chưa">v31</span>'
);

fs.writeFileSync(outputPath, output, 'utf8');
const sizeBytes = Buffer.byteLength(output, 'utf8');
console.log(`✅ Built v31 staging: ${outputPath}`);
console.log(`   Size: ${(sizeBytes / 1024).toFixed(0)} KB`);
