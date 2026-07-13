# Hermes Website Cloner Framework v1.0

Bộ quy trình chuyên dùng cho Hermes hoặc AI coding agent để tái tạo website từ URL, ảnh chụp, Figma hoặc một component tham khảo.

## Mục tiêu

- Khảo sát trước khi code.
- Viết UI/UX spec và design system.
- Chia task nhỏ.
- Giao coding agent triển khai.
- So sánh giao diện bằng browser.
- Sửa lặp đến khi đạt tiêu chí.

## Luồng chính

`Router → Workflow → Skill → Plugin/Tool → Coding Agent → Review → Compare UI → Verify → Fix → Release`

## Khởi động

Hermes đọc theo thứ tự:

1. `00_CONSTITUTION/HERMES_CONSTITUTION.md`
2. `01_ROUTER/ROUTER.md`
3. `03_SKILLS/SKILL_REGISTRY.md`
4. `06_PLUGINS/PLUGIN_REGISTRY.md`
5. Workflow được Router chọn

Xem `docs/QUICK_START.md`.
