# SPEC - Project save conflict safety V27

Ngay: 2026-07-15
Trang thai: NEW

## Muc tieu

- Khong de tab hoac may co snapshot cu ghi de du lieu project moi hon.
- Ghi file project atomic va giu mot ban `.bak` gan nhat.
- Dong bo source module, package V27 va ban chay BANDIAO.
- Loai bo khai bao `escapeHtml` trung trong `main.js`.

## Quy tac xung dot

- Moi tab co `sessionId` va `sessionSequence` rieng.
- Moi snapshot gui `baseRevision` da doc tu helper.
- Helper chap nhan revision hien tai hoac sequence moi hon cua cung session.
- Helper bo qua request cu/duplicate cua cung session.
- Helper tu choi request stale cua session khac voi HTTP 409 va khong sua file chinh.
- Client chua load xong project khong duoc beacon snapshot mau khi unload.

## Acceptance criteria

1. Tab cu khong ghi de duoc snapshot moi cua tab khac.
2. Save lien tiep trong cung tab khong bi conflict gia.
3. Request den sai thu tu khong ghi lui du lieu.
4. Save thanh cong tang revision va tao `.bak` neu file chinh da ton tai.
5. Ghi file dung temp + `os.replace` trong lock.
6. Node tests, Python tests, syntax checks va browser smoke test PASS.
7. Package MODULES_V27 va BANDIAO khop source theo manifest.

## Test cases

- TC01: session A rev0 save -> revision 1.
- TC02: session B base0 save khi current rev1 -> 409, file chinh giu nguyen.
- TC03: session A sequence 2 voi base0 -> chap nhan va tang revision.
- TC04: session A sequence 1 den muon -> duplicate, khong ghi lui.
- TC05: unload truoc khi load xong -> khong POST `/project`.
- TC06: hai release artifact duoc build tu manifest.

