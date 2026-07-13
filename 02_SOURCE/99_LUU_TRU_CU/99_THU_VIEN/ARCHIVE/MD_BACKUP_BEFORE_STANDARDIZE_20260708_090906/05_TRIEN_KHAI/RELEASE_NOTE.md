# 📋 RELEASE NOTE — TRIỂN KHAI

**Người triển khai:** Quân (hiện tại) / Deploy AI (sau này)
**Trách nhiệm:** Deploy, Backup, Release, Rollback

---

## 📦 PHIÊN BẢN ĐÃ RELEASE

| Version | Ngày | Tính năng chính | Trạng thái | Ghi chú |
|---------|------|-----------------|------------|---------|
| v18 | 07/07/2026 | Template, Duplicate, ColVis, CondFmt, Symbols/Multi, BulkEdit (6 features) | ✅ Released | Baseline chính thức |
| v17 | 04/07/2026 | Import CSV, Format Painter lock, Column Types, Favorites | ✅ Released | Baseline trước v18 |

---

## 🚀 QUY TRÌNH DEPLOY

1. **Backup** baseline hiện tại → `BACKUP/giao-dien-desktop-don-gian_v{N}_backup_YYYYMMDD.html`
2. **Deploy** file staging đã nghiệm thu → Apps Script Web App
3. **Verify** deployment URL hoạt động, console sạch
4. **Ghi RELEASE_NOTE** (file này)
5. **Ghi DEPLOY_LOG.md** (chi tiết kỹ thuật)
6. **Rollback plan** sẵn sàng nếu có lỗi

---

## 📝 TEMPLATE RELEASE NOTE MỖI VERSION

*(Copy block này cho mỗi release)*

---

### RELEASE v[N] — DD/MM/YYYY

| Thông tin | Chi tiết |
|-----------|----------|
| **Version** | v[N] |
| **Ngày release** | DD/MM/YYYY |
| **Người deploy** | Quân / Deploy AI |
| **Baseline nguồn** | `../03_NHA_THAU_THI_CONG/STAGING/giao-dien-desktop-don-gian_v[N]_quan.html` |
| **Deploy URL** | `https://script.google.com/macros/s/<SCRIPT_ID>/exec` |
| **Apps Script version** | `<deployment-id>` |

---

#### TÍNH NĂNG MỚI

| Feature | Mô tả | SPEC |
|---------|-------|------|
| ... | ... | `../02_TU_VAN_THIET_KE/SPEC/.../spec.md` |

---

#### THAY ĐỔI / FIX

| Item | Mô tả |
|------|-------|
| ... | ... |

---

#### BREAKING CHANGES

- Không có / Có (liệt kê)

---

#### KIỂM TRA SAU DEPLOY

| Check | Kết quả |
|-------|---------|
| Load URL chính | ✅/❌ |
| Mở sheet grid | ✅/❌ |
| Tính năng mới | ✅/❌ |
| Feature cũ (regression) | ✅/❌ |
| Console | ✅ 0 lỗi / ❌ Có lỗi |
| Auth/OAuth hoạt động | ✅/❌ |

---

#### ROLLBACK PLAN

Nếu có lỗi nghiêm trọng:
1. Deploy lại baseline v[N-1] từ `BACKUP/`
2. Cập nhật DEPLOY_LOG.md với lý do rollback
3. Báo Ban QLDA + Chủ đầu tư

---

## 📌 LƯU Ý

- Mỗi release phải có baseline đã nghiệm thu ĐẠT (xem `../04_GIAM_SAT_NGHIEM_THU/BIEN_BAN_NGHIEM_THU.md`)
- Backup BẮT BUỘC trước khi deploy
- Deploy Log chi tiết ở `DEPLOY_LOG.md`