/**
 * VIỆC RIÊNG — Hàm báo cáo hoàn thành tác vụ (dùng trong Apps Script)
 *
 * Boss giao: Quân Trinh
 * Ngày tạo: 06/07/2026
 * Mục đích: Gửi email thông báo khi hoàn thành 1 tác vụ
 *
 * Cách dùng:
 *   1. Mở script.google.com → New project (hoặc dùng project có sẵn)
 *   2. Paste toàn bộ file này vào Code.gs
 *   3. Gọi: baoCaoHoanTat('Tên tác vụ', 'link-file', 'ghi chú thêm')
 *
 * Yêu cầu OAuth Scopes:
 *   - https://www.googleapis.com/auth/script.send_mail
 *   (Apps Script tự thêm khi chạy lần đầu)
 */

function baoCaoHoanTat(tenTacVu, linkFile, ghiChu) {
  MailApp.sendEmail({
    to: Session.getActiveUser().getEmail(),
    subject: `[Xong] ${tenTacVu}`,
    htmlBody: `
      <b>Tác vụ:</b> ${tenTacVu}<br>
      <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}<br>
      <b>Link file:</b> <a href="${linkFile}">Mở file</a><br>
      <b>Ghi chú:</b> ${ghiChu || '—'}
    `
  });
}

/**
 * Ví dụ test (chạy trong Apps Script editor):
 *
 * function testBaoCaoHoanTat() {
 *   baoCaoHoanTat(
 *     'Fix stray backtick G: v16',
 *     'https://drive.google.com/drive/folders/...',
 *     'Đã fix xong, node --check OK'
 *   );
 * }
 */
