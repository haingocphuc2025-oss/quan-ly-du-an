# 📋 DEPLOY LOG — NHẬT KÝ TRIỂN KHAI

**Người ghi:** Quân / Deploy AI
**Mục đích:** Ghi chi tiết kỹ thuật từng lần deploy/rollback để truy vết

---

## 📝 MẪU LOG MỖI LẦN DEPLOY/ROLLBACK

*(Copy block này cho mỗi lần)*

---

### DEPLOY v[N] — DD/MM/YYYY HH:MM

| Thông tin | Chi tiết |
|-----------|----------|
| **Hành động** | DEPLOY / ROLLBACK |
| **Version** | v[N] |
| **Người thực hiện** | Quân / Deploy AI |
| **Baseline nguồn** | `../03_NHA_THAU_THI_CONG/STAGING/giao-dien-desktop-don-gian_v[N]_quan.html` |
| **Backup trước deploy** | `BACKUP/giao-dien-desktop-don-gian_v[N-1]_backup_YYYYMMDD.html` |

---

#### CÁC BƯỚC THỰC HIỆN

| Bước | Lệnh / Thao tác | Kết quả |
|------|-----------------|---------|
| 1 | `clasp push` / Apps Script UI deploy | ✅/❌ |
| 2 | Cập nhật deployment version | ✅/❌ |
| 3 | Test URL production | ✅/❌ |
| 4 | Kiểm tra console production | ✅/❌ |
| 5 | Verify OAuth/Auth | ✅/❌ |

---

#### KẾT QUẢ

| Chỉ số | Giá trị |
|--------|---------|
| **Deployment ID** | `<deployment-id>` |
| **Script ID** | `<script-id>` |
| **URL Production** | `https://script.google.com/macros/s/<SCRIPT_ID>/exec` |
| **Trạng thái** | ✅ Thành công / ❌ Thất bại |

---

#### GHI CHÚ / VẤN ĐỀ

- ...

---

### ROLLBACK v[N] → v[N-1] — DD/MM/YYYY HH:MM

| Thông tin | Chi tiết |
|-----------|----------|
| **Lý do rollback** | ... |
| **Version rollback từ** | v[N] |
| **Version rollback về** | v[N-1] |
| **File backup dùng** | `BACKUP/giao-dien-desktop-don-gian_v[N-1]_backup_YYYYMMDD.html` |

---

#### CÁC BƯỚC ROLLBACK

| Bước | Lệnh / Thao tác | Kết quả |
|------|-----------------|---------|
| 1 | Deploy baseline v[N-1] từ backup | ✅/❌ |
| 2 | Cập nhật deployment version | ✅/❌ |
| 3 | Test URL production | ✅/❌ |

---

#### KẾT QUẢ ROLLBACK

| Chỉ số | Giá trị |
|--------|---------|
| **Trạng thái** | ✅ Thành công / ❌ Thất bại |
| **URL Production sau rollback** | `https://script.google.com/macros/s/<SCRIPT_ID>/exec` |

---

## 📜 LỊCH SỬ DEPLOY/ROLLBACK

| Ngày | Hành động | Version | Trạng thái | Deployment ID | Ghi chú |
|------|-----------|---------|------------|---------------|---------|
| 07/07/2026 | DEPLOY | v18 | ✅ | `<pending>` | Chờ deploy OAuth |
| 04/07/2026 | DEPLOY | v17 | ✅ | `<old-id>` | Baseline v17 |

---

## 📌 LƯU Ý

- Mỗi lần deploy/rollback phải ghi log này
- Backup file HTML baseline trước khi deploy
- DEPLOY_LOG này + RELEASE_NOTE.md = bằng chứng đầy đủ