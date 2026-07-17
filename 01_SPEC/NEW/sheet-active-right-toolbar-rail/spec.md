# SPEC: Khôi phục rail công cụ phải và trạng thái sheet đang mở

- Trạng thái: NEW
- Ngày: 2026-07-17
- Baseline thi công: V30 staging
- Nguồn: phản hồi trực tiếp và ảnh chụp màn hình của người dùng

## Mục tiêu

1. Sheet đang mở phải được đánh dấu active trong cây Browse bên trái.
2. Rail công cụ dọc bên phải phải luôn hiện khi làm việc với sheet, gồm Đính kèm, Bình luận, Hoạt động và Thông tin.
3. Bấm Đính kèm trên rail phải mở panel Attachment hiện có; không tạo panel trùng.

## Phạm vi

- Sửa bố cục và trạng thái điều hướng trong file V30 staging.
- Đồng bộ artifact V30 FRONTEND sau khi kiểm thử đạt.
- Không đổi dữ liệu sheet, attachment, upload hoặc lưu dự án.

## Ngoài phạm vi

- Không thiết kế lại toolbar trên cùng.
- Không đổi nội dung hay nghiệp vụ của các modal Bình luận/Hoạt động/Thông tin.
- Không thay đổi kích thước cột dữ liệu.

## Acceptance criteria

- AC1: `rightToolbar` nằm ở root ứng dụng, không nằm trong `topbar`/`screen-list`.
- AC2: rail có vị trí cố định sát phải, bố cục dọc và đủ bốn nút có accessible label.
- AC3: bấm kẹp giấy gọi luồng `openAttachmentPanelFromToolbar()` và mở panel Attachment bên phải.
- AC4: khi `activeSheetContext` tồn tại, cây Browse ưu tiên context này để đánh dấu đúng sheet; context Browse cũ không được lấn át.
- AC5: khi không có sheet đang mở, Browse vẫn dùng `workspaceBrowseFocusContext` để nhớ vị trí cũ.
- AC6: test hồi quy, cú pháp và test V30 hiện có đều PASS.

## Kiểm thử

- Node test kiểm tra cấu trúc DOM/CSS rail và thứ tự ưu tiên active context.
- Chạy toàn bộ `BANDIAO/tests/*.test.js`.
- Kiểm tra browser nếu runtime khả dụng; nếu sandbox browser không hoạt động thì ghi rõ trong báo cáo và dùng test cấu trúc + Playwright/headless hiện có.

## Ranh giới

- Luôn: giữ nguyên các thay đổi người dùng đang có; sửa tối thiểu đúng hai lỗi.
- Hỏi trước: thêm dependency hoặc đổi schema dữ liệu.
- Không bao giờ: xóa dữ liệu/attachment hay ghi đè baseline cũ trước khi regression PASS.
