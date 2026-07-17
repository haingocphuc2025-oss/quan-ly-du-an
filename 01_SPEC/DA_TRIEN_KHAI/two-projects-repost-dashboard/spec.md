# SPEC — Hai dự án mẫu có Repost và Dashboard

Ngày: 2026-07-13
Trạng thái: DA_TRIEN_KHAI

## Mục tiêu

Rút gọn dữ liệu mẫu của bản v25 để chỉ còn 2 dự án, đồng thời mỗi dự án có sẵn mục Repost và Dashboard trong danh sách hồ sơ.

## Phạm vi

- Danh sách dự án mặc định chỉ giữ 2 dự án đầu.
- Mỗi dự án mặc định có các nhóm hồ sơ chuẩn, thêm:
  - `Repost` dạng sheet để dùng luồng Repost/Carry Forward.
  - `Dashboard` dạng dashboard để mở được màn Dashboard.
- Đồng bộ VERSIONS, STAGING, BANDIAO và Apps Script Index.

## Ngoài phạm vi

- Không đổi quyền chia sẻ Drive.
- Không thêm logic nghiệp vụ dashboard mới ngoài việc có sẵn item dashboard.

## Acceptance Criteria

- Mở app hiển thị `2 dự án`.
- Mỗi dự án mở ra thấy mục `Repost` và `Dashboard`.
- Click `Repost` mở sheet.
- Click `Dashboard` mở màn Dashboard.
- Console browser không có error.
