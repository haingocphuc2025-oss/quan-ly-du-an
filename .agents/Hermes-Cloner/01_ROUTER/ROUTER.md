# Router

## Nhận diện yêu cầu

- Có URL công khai → chạy `02_WORKFLOWS/WEBSITE_CLONER.md`, mode `URL`.
- Có ảnh chụp → cùng workflow, mode `SCREENSHOT`.
- Có Figma → cùng workflow, mode `FIGMA`.
- Chỉ clone một component → `02_WORKFLOWS/FEATURE_CLONER.md`.
- Clone vào codebase đang chạy → `02_WORKFLOWS/UPDATE_EXISTING_PROJECT.md`.

## Trình tự tối thiểu

`/context → /clarify → /ui-spec → /extract-design-system → /spec → /plan → /tasks → /build → /review → /compare-ui → /verify → /fix nếu cần → /release`

## Quy tắc

- Không chạy mọi skill nếu không cần.
- Không bỏ `/review`, `/compare-ui`, `/verify`.
- Khi có nhiều mode, tách thành các phase nhưng dùng chung spec và design system.
