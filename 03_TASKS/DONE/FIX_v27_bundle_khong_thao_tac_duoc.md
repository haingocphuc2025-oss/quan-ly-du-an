# FIX - V27 bundle khong thao tac duoc

Ngay: 2026-07-16
Trang thai: DONE

## Loi

Bundle dung JavaScript `String.replace()` voi noi dung module lam replacement string. Chuoi `USD:'$'` bi hieu thanh replacement token `$'`, chen Report script vao giua `api.js` va lam dung JavaScript.

## Sua

- Dung callback replacement khi ghep CSS/JS.
- Them test giu nguyen ky tu dollar.
- Loai bo khai bao `escapeHtml` trung.
- Build lai MODULES_V27, VERSIONS, STAGING, BANDIAO va Apps Script.
- Them cache-busting vao RUN_V27.bat.

## Xac minh

- Node regression: 12/12 PASS.
- Chrome runtime: 0 errors, app started, click project mo detail.