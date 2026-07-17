# UI SPEC – Menu File > Export kiểu Smartsheet

## 1. Mục tiêu

Xây dựng menu File dạng dropdown nhiều cấp, trong đó mục Export mở submenu bên phải.

Giao diện cần giống ảnh tham chiếu:
- Menu chính mở bên dưới nút File.
- Mục Export có nền hover/xám nhạt và biểu tượng mũi tên sang phải.
- Submenu Export xuất hiện bên phải, lệch xuống theo đúng vị trí của dòng Export.
- Hai menu có bo góc nhẹ, nền trắng, bóng đổ và đường phân cách giữa các nhóm chức năng.

## 2. Cấu trúc component

```
TopNavigation
└── FileMenuTrigger
    └── FileDropdownMenu
        ├── MenuGroup_Create
        │   ├── CreateNewMenuItem
        │   ├── ImportMenuItem
        │   └── OpenMenuItem
        │
        ├── Divider
        │
        ├── MenuGroup_Save
        │   ├── SaveMenuItem
        │   ├── SaveAsNewMenuItem
        │   ├── SaveAsTemplateMenuItem
        │   ├── RenameMenuItem
        │   └── RefreshMenuItem
        │
        ├── Divider
        │
        ├── MenuGroup_Sharing
        │   ├── ShareMenuItem
        │   ├── SendAsAttachmentMenuItem
        │   └── EmailSharedUsersMenuItem
        │
        ├── ExportMenuItem
        │   └── ExportSubmenu
        │       ├── SectionLabel_DataShuttle
        │       ├── ExportSmartsheetAttachment
        │       ├── ExportOneDriveSharePoint
        │       ├── ExportGoogleDrive
        │       ├── ExportBox
        │       ├── LearnMore
        │       ├── Divider
        │       ├── SectionLabel_ExportFile
        │       ├── ExportExcel
        │       ├── ExportPDF
        │       ├── ExportGanttPNG
        │       ├── ExportMicrosoftProject
        │       └── ExportGoogleSheets
        │
        ├── PrintMenuItem
        ├── Divider
        ├── DeleteMenuItem
        ├── Divider
        ├── ViewActivityLogMenuItem
        └── PropertiesMenuItem
```

## 3. Nút mở menu File

### Hiển thị
- Nhãn: **File**
- Vị trí: thanh điều hướng phía trên cùng.
- Chiều cao: khoảng **44px**.
- Padding ngang: **16px**.
- Font size: **16px**.
- Font weight: **400**.
- Màu chữ: **#3d3d3d**.

### Khi active:
- Nền: **#e4e4e4**
- Bo góc: **3px 3px 0 0**

### Hành vi
- Click vào File: Mở menu chính. Click lại: Đóng menu.
- Click ra ngoài: Đóng toàn bộ menu và submenu.
- Nhấn Esc: Đóng submenu trước. Nhấn lần nữa đóng menu chính.

## 4. Menu chính FileDropdownMenu

### Kích thước
- width: **342px**
- max-height: **calc(100vh - 80px)**
- overflow-y: auto

### Vị trí
```
position: absolute;
top: 100%;
left: 0;
z-index: 1000;
```
Menu nằm sát dưới nút File, cách khoảng 2px.

### Giao diện
```
background: #ffffff;
border-radius: 6px;
box-shadow:
  0 2px 8px rgba(0, 0, 0, 0.14),
  0 8px 24px rgba(0, 0, 0, 0.08);
padding: 10px 0;
border: 1px solid rgba(0, 0, 0, 0.06);
```

## 5. Menu item dùng chung

### Kích thước
```
height: 46px;
padding: 0 20px 0 24px;
display: flex;
align-items: center;
gap: 14px;
```

### Typography
```
font-family: Arial, sans-serif;
font-size: 16px;
font-weight: 400;
line-height: 1;
color: #333333;
```

### Hover
```
background: #eeeeee;
```

### Selected hoặc submenu đang mở
```
background: #e8e8e8;
font-weight: 500;
```

### Disabled
```
color: #929292;
cursor: default;
```

Các mục disabled trong ảnh: **Save** (khi dữ liệu chưa thay đổi).

## 6. Bố cục từng menu item

Mỗi menu item có thể gồm ba vùng: `[Icon] [Label........................] [Shortcut hoặc Arrow]`

```css
.menu-item-icon {
  width: 26px;
  min-width: 26px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.menu-item-label {
  flex: 1;
  white-space: nowrap;
}

.menu-item-shortcut {
  color: #666666;
  margin-left: 20px;
  white-space: nowrap;
}

.menu-item-arrow {
  width: 16px;
  display: flex;
  justify-content: flex-end;
}
```

## 7. Nội dung menu chính

### Nhóm 1 – Tạo và mở
| ID | Nhãn | Bên phải | Submenu |
|----|------|---------|---------|
| file-create-new | Create New... | Mũi tên xuống nhỏ | Có thể có |
| file-import | Import | Mũi tên phải | Có |
| file-open | Open... | Ctrl + / | Không |

Sau nhóm này có divider.

### Nhóm 2 – Lưu và làm mới
| ID | Nhãn | Bên phải | Trạng thái |
|----|------|---------|-----------|
| file-save | Save | Ctrl + S | Disabled nếu chưa thay đổi |
| file-save-as-new | Save as New... | | Enabled |
| file-save-template | Save as Template... | | Enabled |
| file-rename | Rename... | | Enabled |
| file-refresh | Refresh | | Enabled |

Sau nhóm này có divider.

### Nhóm 3 – Chia sẻ
| ID | Icon | Nhãn |
|----|------|------|
| file-share | Users | Share... |
| file-send-attachment | Envelope + attachment | Send as Attachment... |
| file-email-shared-users | Envelope | Email Shared Users... |

### Nhóm 4 – Export và Print
| ID | Icon | Nhãn | Bên phải |
|----|------|------|---------|
| file-export | Upload/export | Export | Mũi tên phải |
| file-print | Printer | Print... | |

Export mở submenu cấp hai. Sau Print... có divider.

### Nhóm 5 – Xóa
| ID | Nhãn |
|----|------|
| file-delete | Delete... |

Sau nhóm này có divider.

### Nhóm 6 – Thông tin hệ thống
| ID | Icon | Nhãn |
|----|------|------|
| file-activity-log | Activity circle | View Activity Log... |
| file-properties | Không bắt buộc | Properties... |

## 8. Divider
```css
height: 1px;
background: #d9d9d9;
margin: 9px 22px;
```

## 9. Submenu Export

### Vị trí
Submenu xuất hiện bên phải menu chính, căn tương đối với dòng Export.
```
position: absolute;
left: calc(100% - 14px);
top: var(--export-item-offset);
z-index: 1010;
```

Nếu không đủ không gian bên phải → mở submenu sang bên trái menu chính.

### Kích thước
- width: **446px**
- max-height: **calc(100vh - 90px)**
- overflow-y: auto

### Giao diện
```
background: #ffffff;
border-radius: 6px;
box-shadow:
  0 2px 8px rgba(0, 0, 0, 0.14),
  0 8px 24px rgba(0, 0, 0, 0.10);
padding: 12px 0;
```

## 10. Tiêu đề nhóm trong submenu

```
height: 44px;
padding: 0 22px;
display: flex;
align-items: center;
font-size: 16px;
font-weight: 400;
color: #747474;
```
Tiêu đề nhóm không click được.

## 11. Nhóm Automate offloads with Data Shuttle
| ID | Icon | Nhãn |
|----|------|------|
| export-smartsheet-attachment | Smartsheet logo | Smartsheet Attachment |
| export-onedrive-sharepoint | OneDrive cloud | OneDrive & Sharepoint |
| export-google-drive | Google Drive logo | Google Drive |
| export-box | Box logo | Box |
| export-learn-more | Question mark circle | Learn more |

Item hover: `background: #e7e7e7; border-radius: 4px; margin: 0 12px; padding-left: 10px;`

Chuẩn hóa item submenu:
```
height: 46px;
margin: 0 12px;
padding: 0 10px;
border-radius: 4px;
```

**Learn more**: color `#006dcc`, mở tab mới, đóng menu sau click.

## 12. Nhóm Export file
| ID | Icon | Nhãn | Định dạng |
|----|------|------|---------|
| export-excel | Excel | Export to Microsoft Excel | .xlsx |
| export-pdf | PDF | Export to PDF ... | .pdf |
| export-gantt-png | Image | Export Gantt to Image (PNG) | .png |
| export-ms-project | Microsoft Project | Export to Microsoft Project (XML) | .xml |
| export-google-sheets | Google Sheets | Export to Google Sheets... | Google Sheets |

## 13. Icon
Dùng SVG nội tuyến. Không dùng emoji.

Kích thước: **22x22px**, stroke-width: **1.8**.

Icon dịch vụ (Google Drive, Excel, PDF, Box) dùng màu thương hiệu.

## 14. Trạng thái submenu

- Mở khi: hover Export (100-150ms) hoặc click Export hoặc ArrowRight
- Giữ submenu mở: close delay **250-350ms**, có vùng cầu nối vô hình giữa 2 menu
- Đóng khi: hover item không submenu, click ngoài, ArrowLeft, Esc, click chức năng export

## 15. Hỗ trợ bàn phím
| Phím | Hành vi |
|------|---------|
| Enter | Chọn menu item |
| Space | Chọn menu item |
| ArrowDown | Đi xuống item kế tiếp |
| ArrowUp | Đi lên item trước |
| ArrowRight | Mở submenu |
| ArrowLeft | Đóng submenu |
| Esc | Đóng menu |
| Home | Chọn item đầu tiên |
| End | Chọn item cuối cùng |

Bỏ qua item disabled và section label khi điều hướng.

## 16. Accessibility
- Trigger: `<button aria-haspopup="menu" aria-expanded="true" aria-controls="file-menu">`
- Menu chính: `<div id="file-menu" role="menu">`
- Menu item: `<button role="menuitem">`
- Mục có submenu: `<button role="menuitem" aria-haspopup="menu" aria-expanded="true">`
- Item disabled: `<button role="menuitem" aria-disabled="true">`
- Section label: `<div role="presentation">`

## 17. Hành vi từng chức năng export

### Export to Microsoft Excel
- Thu thập dữ liệu bảng hiện tại
- Giữ thứ tự cột, tên cột
- Giữ dữ liệu: Text, Number, Date, Checkbox, Dropdown
- Sinh file .xlsx
- Tên file: `<TenSheet>_<YYYY-MM-DD_HHmm>.xlsx`

### Export to PDF
- Đóng menu, mở modal cấu hình PDF
- Cho phép chọn: khổ giấy, hướng giấy, vùng xuất, scale, hiện/ẩn Gantt, lặp header, fit width
- Nút: Cancel / Export

### Export Gantt to Image
- Kiểm tra sheet có chế độ Gantt
- Có: xuất PNG. Không: cảnh báo

### Export to Microsoft Project
- Kiểm tra cột: Task Name, Start, Finish, Duration, Predecessors, Assigned To
- Xuất XML tương thích MS Project
- Tải file .xml

### Export to Google Sheets
- Kiểm tra kết nối Google
- Chưa: mở OAuth
- Cho phép chọn: tạo mới / chọn thư mục / đặt tên
- Upload, hiển thị link

## 18. Loading và trạng thái lỗi

- Loading: "Đang chuẩn bị dữ liệu..." / "Đang tạo file..." / "Đang tải file..."
- Không cho click lặp lại
- Thành công: "Xuất dữ liệu thành công."
- Lỗi: "Không thể xuất dữ liệu. Vui lòng thử lại."
- Các lỗi cụ thể: không dữ liệu, dữ liệu quá lớn, không quyền, mất mạng, OAuth hết hạn, không tạo file, browser chặn download

## 19. Responsive
- Desktop: menu hai cấp, submenu ưu tiên phải
- <768px: không submenu nổi, click Export chuyển màn hình menu con, có nút quay lại ← File

## 20. Màu sắc tham chiếu
```css
--menu-bg: #ffffff;
--menu-text: #333333;
--menu-muted-text: #747474;
--menu-hover: #eeeeee;
--menu-active: #e7e7e7;
--menu-divider: #d9d9d9;
--menu-link: #006dcc;
--menu-disabled: #929292;
--menu-shadow: rgba(0, 0, 0, 0.14);
```

## 21. CSS khung tham khảo
```css
.file-dropdown, .export-submenu {
  position: absolute;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,.14), 0 8px 24px rgba(0,0,0,.08);
  padding: 10px 0;
  z-index: 1000;
}
.file-dropdown { width: 342px; }
.export-submenu { width: 446px; z-index: 1010; }
.menu-item {
  width: 100%; height: 46px; padding: 0 20px 0 24px;
  border: 0; background: transparent;
  display: flex; align-items: center; gap: 14px;
  text-align: left; font: 400 16px Arial, sans-serif;
  color: #333; cursor: pointer;
}
.menu-item:hover, .menu-item.is-open, .menu-item.is-selected { background: #eee; }
.menu-item:disabled, .menu-item[aria-disabled="true"] { color: #929292; cursor: default; background: transparent; }
.submenu-item { width: calc(100% - 24px); margin: 0 12px; border-radius: 4px; }
.submenu-item:hover { background: #e7e7e7; }
.menu-divider { height: 1px; margin: 9px 22px; background: #d9d9d9; }
.menu-section-label {
  height: 44px; padding: 0 22px; display: flex; align-items: center;
  color: #747474; font: 400 16px Arial, sans-serif;
}
.menu-icon { width: 26px; min-width: 26px; display: flex; align-items: center; justify-content: center; }
.menu-label { flex: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.menu-shortcut { margin-left: auto; color: #666; white-space: nowrap; }
.menu-arrow { width: 16px; margin-left: auto; }
```

## 22. Dữ liệu cấu hình menu
Xem file `FILE_EXPORT_MENU_DATA.js` cùng thư mục (nếu tách) hoặc nhúng trong HTML.

## 23. Tiêu chí nghiệm thu
1. Menu File mở đúng dưới nút File
2. Menu chính có đủ nhóm và divider
3. Item Export có icon và mũi tên phải
4. Hover Export mở submenu bên phải
5. Submenu không bị đóng khi di chuyển chuột từ menu chính sang submenu
6. Submenu tự đổi hướng nếu sát mép màn hình
7. Item hover có nền xám và bo góc nhẹ
8. Icon, text và shortcut căn thẳng hàng
9. Menu đóng khi click ra ngoài hoặc nhấn Esc
10. Có điều hướng đầy đủ bằng bàn phím
11. Các mục export gọi đúng chức năng tương ứng
12. Có loading, thông báo thành công và xử lý lỗi
13. Không làm dịch chuyển bảng dữ liệu phía sau
14. Menu nằm trên grid, toolbar và Gantt bằng z-index
15. Giao diện đạt độ giống ảnh tham chiếu tối thiểu 90%
