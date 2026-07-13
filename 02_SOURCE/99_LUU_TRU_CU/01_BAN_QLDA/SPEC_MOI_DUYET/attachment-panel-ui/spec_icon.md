# SPEC PHU: Icon Sheet / Folder / Report — Microsoft 365 Style

**Ngay:** 09/07/2026
**Gan voi SPEC chinh:** attachment-panel-ui/spec.md
**Base:** v23_baseline.html
**Output:** v24_quan.html

---

## 1. MUC TIEU

Thay the icon hien tai (emoji/Unicode don) bang SVG inline chat luong cao, dung mau chuan Microsoft 365. Ap dung cho:
- Danh sach Sheet trong sidebar trai
- Danh sach Folder trong sidebar trai
- Danh sach Report trong sidebar trai
- Icon trong attachment panel (file type icons)

---

## 2. THIET KE ICON

### 2.1 Sheet Icon — xanh la Excel #107C41

```svg
<!-- Sheet icon 24x24 -->
<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <!-- Shadow -->
  <rect x="1" y="2" width="19" height="22" rx="2" fill="rgba(0,0,0,0.1)"/>
  <!-- Body -->
  <rect x="0" y="0" width="19" height="22" rx="2" fill="white" stroke="#D1CFCE" stroke-width="0.5"/>
  <!-- Green header -->
  <rect x="0" y="0" width="19" height="7" rx="2" fill="#107C41"/>
  <rect x="0" y="5" width="19" height="2" fill="#107C41"/>
  <!-- Grid lines horizontal -->
  <line x1="0" y1="11" x2="19" y2="11" stroke="#E1DFDD" stroke-width="0.5"/>
  <line x1="0" y1="15" x2="19" y2="15" stroke="#E1DFDD" stroke-width="0.5"/>
  <line x1="0" y1="19" x2="19" y2="19" stroke="#E1DFDD" stroke-width="0.5"/>
  <!-- Grid lines vertical -->
  <line x1="7" y1="7" x2="7" y2="22" stroke="#E1DFDD" stroke-width="0.5"/>
  <line x1="13" y1="7" x2="13" y2="22" stroke="#E1DFDD" stroke-width="0.5"/>
  <!-- Header text -->
  <text x="9.5" y="5.5" text-anchor="middle" font-family="Segoe UI,sans-serif" font-size="3.5" font-weight="600" fill="white">SHEET</text>
  <!-- Cell fills -->
  <rect x="1" y="8" width="5" height="2.5" rx="0.5" fill="#107C4122"/>
  <rect x="8" y="8" width="4" height="2.5" rx="0.5" fill="#107C4122"/>
  <rect x="1" y="12" width="5" height="2.5" rx="0.5" fill="#E1DFDD"/>
  <rect x="8" y="12" width="4" height="2.5" rx="0.5" fill="#E1DFDD"/>
  <rect x="14" y="12" width="4" height="2.5" rx="0.5" fill="#E1DFDD"/>
</svg>
```

**Dung o dau:** moi dong Sheet trong sidebar trai, tab Sheet trong panel.

---

### 2.2 Folder Icon — vang #FFB900

```svg
<!-- Folder icon 24x24 -->
<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <!-- Tab -->
  <path d="M1,6 Q1,3 4,3 L10,3 L13,6 L23,6" fill="#FFB900" stroke="none"/>
  <!-- Body -->
  <rect x="1" y="5" width="22" height="16" rx="2" fill="#FFB900"/>
  <!-- Top shade -->
  <rect x="1" y="5" width="22" height="3" rx="0" fill="#E6A800"/>
  <!-- Shine -->
  <rect x="3" y="9" width="18" height="1.5" rx="0.75" fill="rgba(255,255,255,0.4)"/>
  <!-- Docs inside -->
  <rect x="5" y="13" width="14" height="1.5" rx="0.75" fill="rgba(255,255,255,0.6)"/>
  <rect x="5" y="16" width="10" height="1.5" rx="0.75" fill="rgba(255,255,255,0.4)"/>
  <rect x="5" y="19" width="12" height="1.5" rx="0.75" fill="rgba(255,255,255,0.3)"/>
</svg>
```

**Dung o dau:** moi dong Folder trong sidebar trai.

---

### 2.3 Report Icon — cam #D83B01

```svg
<!-- Report icon 24x24 -->
<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <!-- Shadow -->
  <rect x="1" y="2" width="19" height="22" rx="2" fill="rgba(0,0,0,0.1)"/>
  <!-- Body -->
  <rect x="0" y="0" width="19" height="22" rx="2" fill="white" stroke="#D1CFCE" stroke-width="0.5"/>
  <!-- Orange header -->
  <rect x="0" y="0" width="19" height="7" rx="2" fill="#D83B01"/>
  <rect x="0" y="5" width="19" height="2" fill="#D83B01"/>
  <!-- Header text -->
  <text x="9.5" y="5.5" text-anchor="middle" font-family="Segoe UI,sans-serif" font-size="3" font-weight="600" fill="white">REPORT</text>
  <!-- Bar chart -->
  <rect x="2" y="16" width="3" height="5" rx="0.5" fill="#D83B0144"/>
  <rect x="2" y="11" width="3" height="10" rx="0.5" fill="#D83B01" opacity="0.7"/>
  <rect x="7" y="14" width="3" height="7" rx="0.5" fill="#D83B0144"/>
  <rect x="7" y="9" width="3" height="12" rx="0.5" fill="#D83B01" opacity="0.5"/>
  <rect x="12" y="15" width="3" height="6" rx="0.5" fill="#D83B0144"/>
  <rect x="12" y="10" width="3" height="11" rx="0.5" fill="#D83B01"/>
  <!-- Baseline -->
  <line x1="1" y1="21.5" x2="18" y2="21.5" stroke="#D83B01" stroke-width="0.8"/>
</svg>
```

**Dung o dau:** moi dong Report trong sidebar trai, tab Report trong panel.

---

## 3. CAC KICH CO SU DUNG

| Noi dung | Kich co | Ghi chu |
|---------|---------|---------|
| Sidebar danh sach | 20x20 | Kem ten item |
| Attachment panel tab | 16x16 | Trong row file |
| File type icon | 32x32 | Preview file lon |

Thay doi `width` va `height` trong the `<svg>`, `viewBox` giu nguyen `0 0 24 24`.

---

## 4. CAI DAT VAO CODE

### 4.1 Ham tra ve SVG theo loai

```javascript
function getItemIconSVG(type, size = 20) {
  const icons = {
    sheet: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="2" width="19" height="22" rx="2" fill="rgba(0,0,0,0.08)"/>
      <rect x="0" y="0" width="19" height="22" rx="2" fill="white" stroke="#D1CFCE" stroke-width="0.5"/>
      <rect x="0" y="0" width="19" height="7" rx="2" fill="#107C41"/>
      <rect x="0" y="5" width="19" height="2" fill="#107C41"/>
      <line x1="0" y1="11" x2="19" y2="11" stroke="#E1DFDD" stroke-width="0.5"/>
      <line x1="0" y1="15" x2="19" y2="15" stroke="#E1DFDD" stroke-width="0.5"/>
      <line x1="7" y1="7" x2="7" y2="22" stroke="#E1DFDD" stroke-width="0.5"/>
      <line x1="13" y1="7" x2="13" y2="22" stroke="#E1DFDD" stroke-width="0.5"/>
      <rect x="1" y="8" width="5" height="2.5" rx="0.5" fill="#107C4122"/>
      <rect x="8" y="8" width="4" height="2.5" rx="0.5" fill="#107C4122"/>
      <rect x="1" y="12" width="5" height="2.5" rx="0.5" fill="#E1DFDD"/>
      <rect x="8" y="12" width="4" height="2.5" rx="0.5" fill="#E1DFDD"/>
    </svg>`,

    folder: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M1,6 Q1,3 4,3 L10,3 L13,6 L23,6" fill="#FFB900"/>
      <rect x="1" y="5" width="22" height="16" rx="2" fill="#FFB900"/>
      <rect x="1" y="5" width="22" height="3" fill="#E6A800"/>
      <rect x="3" y="9" width="18" height="1.5" rx="0.75" fill="rgba(255,255,255,0.4)"/>
      <rect x="5" y="13" width="14" height="1.5" rx="0.75" fill="rgba(255,255,255,0.5)"/>
      <rect x="5" y="16" width="10" height="1.5" rx="0.75" fill="rgba(255,255,255,0.35)"/>
    </svg>`,

    report: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="2" width="19" height="22" rx="2" fill="rgba(0,0,0,0.08)"/>
      <rect x="0" y="0" width="19" height="22" rx="2" fill="white" stroke="#D1CFCE" stroke-width="0.5"/>
      <rect x="0" y="0" width="19" height="7" rx="2" fill="#D83B01"/>
      <rect x="0" y="5" width="19" height="2" fill="#D83B01"/>
      <rect x="2" y="11" width="3" height="10" rx="0.5" fill="#D83B01" opacity="0.7"/>
      <rect x="7" y="9" width="3" height="12" rx="0.5" fill="#D83B01" opacity="0.5"/>
      <rect x="12" y="10" width="3" height="11" rx="0.5" fill="#D83B01"/>
      <line x1="1" y1="21.5" x2="18" y2="21.5" stroke="#D83B01" stroke-width="0.8"/>
    </svg>`
  };

  return icons[type] || icons['folder'];
}
```

### 4.2 Su dung trong render sidebar

```javascript
// Thay the ky tu ▦ ▤ bang SVG
function renderSidebarItem(item) {
  const icon = getItemIconSVG(item.type, 20);
  return `
    <div class="sidebar-item" data-type="${item.type}">
      <span class="sidebar-icon">${icon}</span>
      <span class="sidebar-name">${item.name}</span>
    </div>
  `;
}
```

```css
.sidebar-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.sidebar-icon svg {
  display: block;
}
```

---

## 5. TEST CASES

| # | Test | Ky vong |
|---|------|---------|
| 1 | Mo sidebar du an | Sheet hien icon xanh la, Folder icon vang, Report icon cam |
| 2 | Icon o kich co 20px | Ro net, khong bi vo |
| 3 | Icon o kich co 16px | Van ro, khong mat chi tiet chinh |
| 4 | Dark mode | Icon van hien thi dung (SVG khong dung CSS var mau) |
| 5 | Zoom 150% | Icon scale dung, khong bi pixel |
| 6 | So sanh voi Excel/Smartsheet | Nhan ra duoc Sheet la xanh la, Folder la vang |

---

## 6. BAN GIAO

- ✅ Thay tat ca ▦ ▤ emoji bang SVG inline
- ✅ Ham `getItemIconSVG(type, size)` — dung chung toan app
- ✅ Test voi ca 3 kich co: 16, 20, 32
- ✅ Khong dung emoji, khong dung font icon — SVG thuan
- ✅ Ghi ro trong CODE_DIFF muc 2: ham nao da sua de su dung icon moi
