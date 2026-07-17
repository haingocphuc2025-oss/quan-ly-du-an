# SPEC: Column Header Context Menu (Menu ngữ cảnh cột)

Ngày tạo: 2026-07-13
Trạng thái: NEW
Tham chiếu: Smartsheet column header dropdown menu (ảnh chụp cột "Hạng mục")

## Phạm vi
Menu hiện ra khi click vào biểu tượng dropdown/mũi tên trên header của một cột trong grid view.

## 1. Nhóm Chèn/Xóa cột
| Mục | Hành vi |
|---|---|
| Insert Column Left | Thêm cột mới bên trái cột hiện tại, mặc định kiểu Text, tên mặc định "Column X" |
| Insert Column Right | Thêm cột mới bên phải cột hiện tại, tương tự |
| Delete Column | Xóa cột và toàn bộ dữ liệu trong cột đó, có confirm dialog trước khi xóa |

## 2. Nhóm Đặt tên / Mô tả
| Mục | Hành vi |
|---|---|
| Rename Column | Inline edit tên cột trực tiếp trên header |
| Edit Column Description | Mở popup nhập mô tả cột, hiển thị dạng tooltip icon (i) cạnh tên cột khi hover |

## 3. Nhóm Dữ liệu
| Mục | Hành vi |
|---|---|
| Filter... | Mở panel lọc dữ liệu theo giá trị của cột này, áp dụng cho toàn bảng |
| Sort Rows... | Sắp xếp toàn bảng theo cột này (tăng dần A-Z / giảm dần Z-A) |

## 4. Nhóm Khóa / Ẩn
| Mục | Hành vi |
|---|---|
| Lock Column | Khóa cột, không cho sửa dữ liệu; hiển thị icon khóa trên header; vẫn xem được nội dung |
| Freeze Column | Cột đứng yên khi scroll ngang bảng (tương tự freeze pane trong Excel) |
| Hide Column | Ẩn cột khỏi grid; có nút/menu "Show hidden columns" để hiện lại |

## 5. Cấu hình cột
| Mục | Hành vi |
|---|---|
| Edit Column Properties... | Đổi loại cột: Text, Dropdown (single/multi-select có gán màu, ví dụ như cột "Hạng mục" trong ảnh mẫu), Date, Contact, Checkbox, Number |

## Loại trừ khỏi phạm vi (theo rule đã chốt)
- Show Gantt — không đưa vào app (rule: không hiển thị Gantt/progress chart trong quản lý dự án)
- Edit Project Settings — thuộc cấp cấu hình dự án, không thuộc menu cột

## Ghi chú
- Ảnh tham chiếu gốc: menu cột "Hạng mục" trong Smartsheet, dropdown giá trị có màu (Hợp đồng - pháp lý, Thanh toán...)
