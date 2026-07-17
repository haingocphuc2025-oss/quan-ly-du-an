# VERIFY v25 - column-unhide

Ngay: 2026-07-14
Baseline: 02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/v25_baseline.html
SHA-256: 24129B4DD44F7F06B55EA45BBBB0293859670D6F7523C7C86800EF3EF4292D44

## Ket qua
- PASS: Sheet/Grid menu cot co Show all columns va tung cot dang an de hien lai dung vi tri.
- PASS: Workspace Navigator header co nut ... va ho tro right-click de mo menu cot.
- PASS: Cot Name luon hien va khong co option hide.
- PASS: Cot Last Update co option Hide Column.
- PASS: Khi Last Update bi an, menu tren header con lai hien Show all columns va muc Last Update de hien lai.
- PASS: Trang thai an/hien duoc giu bang workspaceNavigatorHiddenCols trong session panel.
- PASS: 4 ban HTML dong bo cung checksum: VERSIONS, STAGING, BANDIAO, apps-script.
- PASS: node --check work\v25_inline_check.js.

## Ghi chu
- Can refresh tab dang mo de nap HTML moi truoc khi test thu cong tren browser.



