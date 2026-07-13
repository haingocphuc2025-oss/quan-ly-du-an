# Plugin Guide

Plugin không tự động hoạt động chỉ vì nằm trong thư mục này. Bạn phải:

1. Cài plugin/tool theo README chính thức.
2. Kết nối nó với Hermes hoặc MCP client.
3. Kiểm tra tool có thể gọi được.
4. Cập nhật `PLUGIN_REGISTRY.md` với tên lệnh thực tế.
5. Chạy thử một task nhỏ trước khi dùng trong workflow chính.

Không khai báo plugin là `available` khi chưa test.
