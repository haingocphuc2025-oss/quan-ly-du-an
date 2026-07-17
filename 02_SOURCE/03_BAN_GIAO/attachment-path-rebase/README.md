# Bàn giao attachment path rebase

- Code: `02_SOURCE/02_SAN_PHAM_DON_FILE/BANDIAO/local_file_helper.py`
- Tests: `02_SOURCE/02_SAN_PHAM_DON_FILE/BANDIAO/tests/test_local_file_helper.py`
- Verify: `04_REPORTS/VERIFY/VERIFY_attachment-path-rebase_2026-07-15.md`
- Runtime: Local File Helper đã được restart và health check PASS.
- Rollback: bỏ hàm `resolve_attachment_path` và trả endpoint `/open` về kiểm tra `Path(target).resolve()` cũ.
