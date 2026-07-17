# LUAT DUNG CODEBASE-MEMORY-MCP

Ap dung cho moi agent (Claude Code, Codex CLI, Hermes...) lam viec voi repo nay.

## Dieu kien
- CHI ap dung khi session co cac tool cua codebase-memory-mcp (vi du: search_code, trace, architecture, impact...).
- Neu KHONG co tool nay: bo qua file nay, doc file thuong nhu quy trinh cu. Khong duoc BLOCKED vi thieu tool.

## Khi CO tool
1. Truoc khi sua code: goi tool graph (architecture / search / trace) de dinh vi ham, thay vi doc tho toan bo file HTML.
2. Sau khi sua xong: chay lai index ("Index this project") de graph cap nhat truoc khi ban giao.
3. Graph chi la cong cu tra cuu CODE. Trang thai du an van theo:
   - `00_TONG_HOP/README_FIRST.md` + `TRANG_THAI_HIEN_TAI.md`
   - `01_SPEC/DANH_MUC_SPEC.md` (vi tri thu muc NEW / DA_TRIEN_KHAI la trang thai chinh thuc)
4. Khong dung ket qua graph de suy doan spec; spec luon lay tu `01_SPEC/`.

## Cai dat (nguoi dung lam, tren Windows)
Xem https://github.com/DeusData/codebase-memory-mcp — chay install.ps1, restart agent, noi "Index this project" tai thu muc repo.
