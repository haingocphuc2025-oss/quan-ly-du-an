# Hướng dẫn kết nối Telegram với Hermes Agent (Phuc)

*Lưu ý: Hermes Agent = Phuc (đã đổi tên 04/07/2026)*

---

## 1. Điều kiện tiên quyết

- Đã cài đặt Hermes Agent trên máy tính (Windows/Linux/Mac)
- Đã có tài khoản Telegram và bot token (từ [@BotFather](https://t.me/BotFather))
- File cấu hình `config.yaml` và `auth.json` nằm đúng thư mục

---

## 2. Các bước kết nối

### Bước 1: Bật Telegram Bridge trong config

Mở file cấu hình Hermes (thường ở `~/.hermes/config.yaml` hoặc theo đường dẫn profile), đảm bảo có:

```yaml
bridges:
  telegram:
    enabled: true
    bot_token: "bot_token_của_bạn"
```

### Bước 2: Chạy Hermes với Telegram

Khởi động Hermes Agent ở chế độ có bridge:

```bash
hermes run
```

Hoặc nếu chạy bằng script `run.bat` trên Windows:
```bat
run.bat
```

### Bước 3: Lấy mã ghép nối (Pairing Code)

Khi Hermes khởi động, nếu chưa ghép nối Telegram, bạn sẽ thấy thông báo:

```
Hi~ I don't recognize you yet!
Here's your pairing code: XXXXXXXX
Ask the bot owner to run:
hermes pairing approve telegram XXXXXXXX
```

Copy mã **XXXXXXXX** (8 ký tự chữ hoa + số).

### Bước 4: Approve mã ghép nối

Mở **terminal/command prompt** và chạy lệnh:

```bash
hermes pairing approve telegram XXXXXXXX
```

Trong đó `XXXXXXXX` là mã ghép nối từ Bước 3.

### Bước 5: Xác nhận kết nối

- Sau khi approve thành công, Telegram bot sẽ gửi tin nhắn xác nhận
- Bạn đã có thể chat với Hermes Agent (Phuc) qua Telegram
- Nếu chưa thấy bot phản hồi, hãy mở Telegram và tìm `@BotUsername_của_bạn` → nhấn **Start**

---

## 3. Cấu hình nâng cao

### Username tùy chỉnh (tên hiển thị)

Thêm vào `config.yaml`:

```yaml
bridges:
  telegram:
    enabled: true
    bot_token: "..."
    username: "Phuc"   # tên hiển thị trên Telegram
```

### Chat ID (nhắn tin cố định)

Nếu muốn bot chỉ trả lời ở 1 chat cụ thể:

```yaml
bridges:
  telegram:
    enabled: true
    bot_token: "..."
    allowed_chat_ids:
      - 8966121987   # Chat ID của Quân
```

### Tắt ghép nối (không cần pairing code)

```yaml
bridges:
  telegram:
    enabled: true
    bot_token: "..."
    no_pairing: true  # bỏ qua bước ghép nối
```

---

## 4. Xử lý sự cố thường gặp

| Vấn đề | Nguyên nhân | Giải pháp |
|--------|------------|-----------|
| Bot không phản hồi | Chưa approve pairing | Chạy `hermes pairing approve telegram ...` |
| Mã ghép nối hết hạn | Bot đã chạy lâu, mã cũ hết | Khởi động lại Hermes để lấy mã mới |
| "Bot token không hợp lệ" | Token sai hoặc hết hạn | Tạo bot mới từ @BotFather |
| "Chat ID không được phép" | allowed_chat_ids không chứa chat của bạn | Thêm chat ID vào config, hoặc xoá dòng allowed_chat_ids |
| Lỗi "403 Forbidden" | Bot chưa được khởi động trong chat đó | Gõ `/start` vào chat với bot trước |

---

## 5. Thông tin Telegram của Quân

| Thông tin | Giá trị |
|-----------|---------|
| Bot username | `@Phuchai12345_bot` |
| Chat ID | `8966121987` |
| Bot token | *(trong `auth.json` / `config.yaml`)* |

---

*Cập nhật lần cuối: 04/07/2026 — Phuc*
