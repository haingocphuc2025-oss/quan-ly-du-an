# VERIFY v25: Toolbar Grid Smartsheet Style

Ngay: 2026-07-13
Ket qua: PASS

## Da thuc hien
- Grid view co 2 hang toolbar: menu tren cung va thanh cong cu chinh.
- Thanh menu tren gom File, Automation, Forms, Connections, Dynamic View; giua la icon sheet + ten sheet mot dong; phai co Share, AI, More, toggle panel.
- Thanh cong cu chinh gom Save, Print, Undo, Redo, Grid, Filter, Indent/Outdent, Font/Size, B/I/U/S, Fill/Text color, Align, Wrap, Clear Format, Format Painter, Table, Highlight, More.
- Cac nut it dung duoc gom vao More: Sort, Group, Add row, Forms, Publish, Automation, Row height, Search, Merge, Clear data, Repost Date, Carry Forward, Duplicate, Export/Import/Google Sheet.
- Icon toolbar Grid view doi ve don sac/outline, hover xam nhe, nhom ngan bang separator doc.
- Undo/Redo mo rong tu sua cell sang snapshot cho format, clear format, add row va clear data.

## Kiem tra ky thuat
- `node --check work\v25_inline.js`: PASS.
- Khong con duplicate id cho cac nut toolbar chinh.
- 4 ban HTML dong bo cung checksum SHA256: `858E17A4DECD0D3D1A1E910807CF80DC503D7DC2ACA781B8D668819DF5F41C3F`.
- Sau phan hoi nguoi dung "khong thay gi", da fix lai DOM: toolbar moi nam dung trong `gridSheetView`, khong chen vao bang folder Workspace.
