# WORKFLOW MOT LENH

```text
USER_GOAL -> RESEARCH -> SPEC_DRAFT/UPDATE -> SPEC_CHECK -> TASK TODO
-> khoa revision spec -> DOING -> REVIEW -> VERIFY + UI_COMPARE
-> FAIL: CODE_GAP -> FIX; SPEC_GAP -> SPEC_UPDATE; BOTH -> SPEC_UPDATE + FIX
-> REGRESSION -> RELEASE + nang baseline
-> chuyen spec sang DA_TRIEN_KHAI -> TASK DONE -> FINAL_REPORT
```

## Cong chat luong

- Spec co muc tieu, pham vi, ngoai pham vi, acceptance criteria va test case.
- Diff dung pham vi, khong secret, co rollback.
- Test, browser/console neu ap dung va regression deu PASS.
- Baseline, trang thai, spec, task va bao cao dong bo.

Agent duoc tu tao/cap nhat spec NEW, task, staging va bao cao trong pham vi muc tieu. Khong tu pha huy du lieu, deploy ra ngoai, gui thong tin, thay doi quyen truy cap hoac mo rong nghiep vu.

## Cong tiet kiem ngu canh

1. Doc `00_TONG_HOP/README_FIRST.md`, `00_TONG_HOP/TRANG_THAI_HIEN_TAI.md` va ban giao cua phien ban dang lam.
2. Chon dung spec, sau do dung knowledge graph de dinh vi module/ham va test lien quan. Neu khong co graph, dung tim kiem muc tieu.
3. Khong nap toan bo HTML, repo hoac log neu chua co bang chung can thiet; bat dau tu diff va cac doan code lien quan.
4. Neu con nhieu cach hieu co the lam thay doi ket qua nghiep vu, hoi mot cau lam ro truoc khi khoa revision spec va code.
5. Cau hoi mau: `Hien minh hieu la [A]. Con thieu quyet dinh [X]: ban muon [B] hay [C]?`
6. Khong hoi lai neu co the tu xac minh bang spec, code, test hoac report.
7. Sau PASS, cap nhat ban giao/trang thai/report bang tom tat ngan: phien ban, module, quyet dinh, lenh build/test, ket qua va van de con lai.
