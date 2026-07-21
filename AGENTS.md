# CHE DO TU DONG MOT LENH

Nguoi dung chi can neu muc tieu. He thong tu nghien cuu, lap spec, thi cong, kiem tra, sua lap va ban giao.

## DIEU PHOI

- Tu tao/cap nhat spec trong `01_SPEC/NEW/`, tao task va chuyen vai tro.
- Khong yeu cau nguoi dung duyet spec hoac giao task trung gian.
- Chi hoi khi thieu quyet dinh nghiep vu, can quyen moi, co nguy co mat du lieu, hoac da that bai 5 vong.

## TIET KIEM NGU CANH VA LAM RO YEU CAU

- Khong doc lai toan bo du an theo mac dinh. Doc dung thu tu: trang thai/ban giao hien tai -> spec lien quan -> knowledge graph hoac module lien quan -> test lien quan.
- Tai them file chi khi co bang chung pham vi anh huong; uu tien diff va ket qua tim kiem muc tieu thay cho HTML/log day du.
- Truoc khi code, neu yeu cau co tu hai cach hieu tro len va lua chon lam thay doi hanh vi, du lieu, format, mapping, acceptance criteria hoac pham vi, dung de hoi lai mot cau ngan gon.
- Cau hoi phai neu cach hieu hien tai, quyet dinh con thieu va cac lua chon cu the. Khong hoi lai thong tin co the xac minh tu spec, code, test hoac bao cao hien co.
- Khi tiep tuc mot tinh nang/phien ban, tai su dung ho so ban giao va chi doc phan thay doi. Sau ban giao, cap nhat trang thai/bao cao de Codex khac co the tiep tuc ma khong nghien cuu lai tu dau.
- Quy trinh chi tiet xem `.agents/RULES.md` va `.agents/WORKFLOW.md`.

## VAI TRO SPEC

- Nghien cuu yeu cau, code va tai lieu tham chieu.
- Xac dinh muc tieu, pham vi, ngoai pham vi, acceptance criteria va test case.
- Tao revision moi khi spec thieu; khong sua code trong vai tro SPEC.
- Chi chuyen sang `DA_TRIEN_KHAI` sau PASS, regression va nang baseline.

## VAI TRO THI CONG

- Code theo revision spec dang khoa trong `01_SPEC/NEW/`.
- Khong sua spec trong cung luot thi cong.
- Tao staging, chay test va lap ban giao.
- Spec sai/thieu thi tra ve SPEC; code sai thi tao FIX.

## NGUON SU THAT

- Spec: `01_SPEC/`.
- Code/baseline/staging: `02_SOURCE/`.
- Task: `03_TASKS/`.
- Bao cao: `04_REPORTS/`.
- Dieu phoi: `.agents/`.

Trang thai spec chi co `NEW` va `DA_TRIEN_KHAI`. Uu tien knowledge graph MCP khi tim code.
