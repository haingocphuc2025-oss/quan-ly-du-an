# SPEC V32 — Import Excel giữ cấu trúc Sheet

Trạng thái: NEW  
Ngày xác nhận dự thảo: 19/07/2026

## 1. Mục tiêu

Nâng V31.3 lên V32 để Import Excel không tự thay đổi cấu trúc và format của Sheet đích. Dòng header Excel chỉ dùng để nhận diện cột; dữ liệu được nhập từ dòng kế tiếp. Người dùng chỉ thay đổi tiêu đề khi chủ động bật tùy chọn tương ứng.

Thành công khi người dùng có thể nhập dữ liệu vào một Sheet mẫu mà vẫn giữ nguyên thứ tự cột, loại cột, độ rộng, format, công thức, conditional formatting và hai cột hệ thống.

## 2. Giả định đã xác nhận

1. Chế độ mặc định là **Giữ cấu trúc Sheet hiện tại**.
2. Không tự sao chép header Excel lên Sheet.
3. Không tự thêm, xóa, đổi thứ tự hoặc đổi loại cột.
4. Không dùng vị trí cột làm fallback âm thầm khi tên header không khớp.
5. Người dùng có thể sửa mapping thủ công trước khi import.
6. Tùy chọn **Sao chép tiêu đề từ Excel** mặc định tắt và chỉ đổi nhãn của các cột đã mapping; không đổi format/loại/độ rộng/thứ tự cột.
7. Cột Excel không mapping được mặc định bị bỏ qua và phải xuất hiện trong báo cáo.

## 3. Phạm vi

### Trong phạm vi

- Đọc `.xlsx` và `.xls`, một hoặc nhiều sheet.
- Chọn dòng header cho từng sheet.
- Auto-map theo tên header đã chuẩn hóa và alias nghiệp vụ.
- Cho phép mapping thủ công bằng dropdown.
- Chỉ ghi dữ liệu từ dòng sau header.
- Giữ nguyên cấu trúc và format Sheet đích.
- Tùy chọn sao chép nhãn header, mặc định tắt.
- Append, Update, Upsert và Skip Duplicate.
- Validation, progress, báo cáo theo sheet và Undo batch.
- Hỗ trợ merged cells như V31.2/V31.3.
- Bảo vệ `_rowIndex`, `_attachments` ở UI, mapping và payload.
- Phát hành artifact V32 và giữ V31.3 làm rollback.

### Ngoài phạm vi

- Sao chép font, màu, border hoặc conditional formatting từ Excel nguồn sang Sheet.
- Tự tạo cấu trúc Sheet mới theo toàn bộ Excel.
- Import macro VBA, hình ảnh, biểu đồ hoặc PivotTable.
- Thay đổi định dạng Sheet đích dựa trên kiểu dữ liệu Excel.

## 4. Luồng người dùng

1. Chọn file Excel.
2. Chọn một/nhiều sheet.
3. Chọn dòng header cho từng sheet.
4. Hệ thống đọc header và đề xuất mapping theo tên/alias.
5. Màn hình mapping hiển thị rõ cột đã map và cột bị bỏ qua.
6. Tùy chọn `Sao chép tiêu đề từ Excel` mặc định tắt.
7. Người dùng chọn chế độ import và khóa đối chiếu.
8. Xem trước, xác nhận và import dữ liệu từ dòng sau header.
9. Báo cáo theo sheet hiển thị số dòng thành công/cập nhật/bỏ qua/lỗi, cột không mapping và trạng thái sao chép header.
10. Undo khôi phục cả dữ liệu và nhãn header nếu người dùng đã bật sao chép tiêu đề.

## 5. Quy tắc mapping

- Chuẩn hóa để so khớp: trim, gộp khoảng trắng, bỏ dấu tiếng Việt khi so sánh, không phân biệt hoa/thường.
- Ưu tiên: tên chính xác → tên chuẩn hóa → alias đã khai báo → người dùng chọn thủ công.
- Không tự map theo vị trí khi tên không khớp.
- Một cột Sheet chỉ được nhận dữ liệu từ một cột Excel trong cùng mapping.
- `_rowIndex` và `_attachments` không bao giờ xuất hiện trong danh sách đích.
- Mapping không hợp lệ phải chặn import và hiển thị lỗi cụ thể.

## 6. Quy tắc giữ cấu trúc/format

Trong chế độ mặc định, import không được thay đổi:

- Mảng định nghĩa cột và thứ tự cột.
- `id`, `type`, `width`, format và rule của cột.
- Dòng header hiện có.
- Công thức và conditional formatting hiện có.
- Hai cột hệ thống và attachment hiện có.

Khi bật `Sao chép tiêu đề từ Excel`:

- Chỉ cập nhật nhãn của các cột nghiệp vụ đã mapping.
- Không cập nhật `id`, `type`, width, style hoặc vị trí cột.
- Cột không mapping không làm thay đổi Sheet.
- Thay đổi nhãn phải nằm trong snapshot Undo.

## 7. Giao diện

- Dùng modal và token giao diện hiện có của V31; không tạo phong cách mới.
- Checkbox có label rõ ràng: `Sao chép tiêu đề từ Excel`.
- Helper text: `Mặc định tắt để giữ nguyên tiêu đề và định dạng Sheet hiện tại.`
- Mapping dropdown dùng phần tử tương tác có label, focus và điều khiển bàn phím.
- Cột bị bỏ qua không chỉ thể hiện bằng màu; phải có chữ `Bỏ qua`.
- Nút xác nhận bị disable khi mapping trùng hoặc không hợp lệ.

## 8. Kiến trúc và tệp

- Nguồn chính: `02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/MODULES_V32/`.
- Module thay đổi: `js/import-excel.js`, `css/import-excel.css`, `manifest.json` nếu cần.
- Test: `02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/MODULES_V32/tests/`.
- Builder: `02_SOURCE/02_SAN_PHAM_DON_FILE/build_v32.js`.
- Artifact: `STAGING/giao-dien-desktop-don-gian_v32_quan.html` và `VERSIONS/v32_baseline.html`.
- Bàn giao: `BANDIAO/giao-dien-desktop-don-gian_v32_quan.html` và `RUN_V32.bat`.

## 9. Lệnh kiểm tra dự kiến

```powershell
node --test VERSIONS\MODULES_V32\tests\*.test.js
node build_v32.js
```

Browser smoke chạy artifact V32 qua localhost với Chrome profile cô lập.

## 10. Chiến lược kiểm thử

### Regression bắt buộc

- Mặc định không gọi luồng áp dụng schema/header tự động.
- Header Excel chỉ dùng mapping; dòng dữ liệu đầu tiên là `headerRow + 1`.
- Sheet giữ nguyên số lượng, thứ tự, type và width cột.
- Cột không mapping bị bỏ qua và có trong report.
- Mapping trùng bị chặn.
- Checkbox sao chép header mặc định tắt.
- Khi bật, chỉ nhãn cột đã mapping thay đổi và Undo khôi phục được.
- `_rowIndex`, `_attachments` không bị map hoặc ghi đè.
- Bốn chế độ import và merged cells tiếp tục PASS.
- Năm artifact V32 byte-identical.

### Browser

- Modal mapping hiển thị đúng ở 1365×900 và 320×800.
- Có thể tab tới checkbox, mapping dropdown và nút xác nhận.
- Không có lỗi JavaScript nghiêm trọng.

## 11. Acceptance Criteria

- AC1: Import mặc định không thay đổi header hoặc cấu trúc Sheet.
- AC2: Không tự mở rộng cột theo Excel.
- AC3: Dữ liệu bắt đầu từ dòng sau header đã chọn.
- AC4: Auto-map theo header/alias; không fallback theo vị trí.
- AC5: Mapping thủ công hoạt động và không cho mapping trùng.
- AC6: Cột không mapping được bỏ qua và báo cáo rõ.
- AC7: `Sao chép tiêu đề từ Excel` mặc định tắt.
- AC8: Khi bật, chỉ đổi nhãn cột đã mapping và có Undo.
- AC9: Giữ nguyên type, width, format, formula, conditional formatting và attachment.
- AC10: Toàn bộ regression V31.3 và test V32 PASS.
- AC11: Browser smoke và kiểm tra bàn phím PASS.
- AC12: Artifact V32 đồng nhất, có release note, verify report và rollback V31.3.

## 12. Biên an toàn

### Luôn làm

- Test đỏ trước khi sửa hành vi.
- Bảo vệ cột hệ thống ở nhiều lớp.
- Giữ snapshot Undo trước mọi ghi dữ liệu/header.
- Báo cáo mọi cột bị bỏ qua.

### Hỏi trước

- Thêm dependency mới.
- Thay đổi định dạng dữ liệu project đã lưu.
- Cho phép Excel tự thay toàn bộ cấu trúc Sheet.

### Không làm

- Thực thi macro hoặc công thức từ file nhập.
- Upload file Excel ra ngoài mặc định.
- Ghi đè attachment hoặc cột hệ thống.
- Âm thầm map theo vị trí khi tên header không khớp.

## 13. Open Questions

Không còn câu hỏi chặn triển khai theo phạm vi đã xác nhận. Mọi mở rộng sao chép format từ Excel nguồn sẽ là spec riêng sau V32.
