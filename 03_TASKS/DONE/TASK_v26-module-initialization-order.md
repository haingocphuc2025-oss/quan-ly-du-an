# FIX: v26 module initialization order

Ngày hoàn tất: 2026-07-15
Trạng thái: DONE

- Sửa 5 lỗi thứ tự khởi tạo/TDZ: APP_USER_NAME_KEY, PROJECT_FOLDERS, DOM listeners, FORMAT_RULE_COLORS và điểm initAuth.
- Bổ sung 5 regression test.
- Không đổi data model hay nghiệp vụ.
- Browser không còn exception JavaScript khởi động; 12/12 test PASS.
