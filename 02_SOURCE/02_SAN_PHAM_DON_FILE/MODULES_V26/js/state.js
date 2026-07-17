const APP_USER_NAME_KEY = 'appUserName';

let DATA = [
 {name:'Đường điện chiếu sáng — Xã Liên Sơn', sub:'Đà Bắc, Phú Thọ', shared:true, owner:'Quân', updated:'30/06/2026', fav:true},
 {name:'Nhà văn hoá thôn 5 — Xã Đông Thành', sub:'Phú Thọ', shared:true, owner:'Quân', updated:'27/06/2026', fav:false},
];

let appUserName = localStorage.getItem(APP_USER_NAME_KEY) || '';

function sampleRowsForArchiveSheet(sheetName){
 const samples = {
  '01_HOP_DONG_PHAP_LY': [
   ['📎','green','1','Hợp đồng - pháp lý','Gói thầu xây lắp','01/HĐ-XL','08/07/2026','Hợp đồng thi công xây dựng công trình','UBND xã','Quân Trinh','15/07/2026','250000000','Đã đủ','Lưu hợp đồng, phụ lục, bảo lãnh'],
   ['📎','yellow','2','Hợp đồng - pháp lý','Bảo lãnh thực hiện hợp đồng','BL-01','09/07/2026','Bảo lãnh thực hiện hợp đồng của nhà thầu','Ngân hàng','Quân Trinh','16/07/2026','12500000','Đang xử lý','Chờ bản gốc']
  ],
  '02_VAT_LIEU_CO_CQ': [
   ['📎','yellow','1','Trình duyệt vật liệu','Xi măng','TDVL-01','08/07/2026','Trình duyệt vật liệu xi măng PCB40','Nhà thầu','Nguyễn Văn Hùng','12/07/2026','','Đang xử lý','Đính kèm catalogue, CO CQ'],
   ['📎','green','2','CO CQ','Thép D10-D16','COCQ-02','09/07/2026','CO CQ thép xây dựng đợt 1','Nhà cung cấp','Nguyễn Văn Hùng','13/07/2026','','Đã đủ','Đã đối chiếu lô hàng']
  ],
  '03_THI_CONG_NGHIEM_THU': [
   ['📎','green','1','Nghiệm thu công việc','Móng tuyến chính','NTCV-01','10/07/2026','Nghiệm thu đào móng và đổ bê tông lót','Tư vấn giám sát','Bùi Văn Toàn','10/07/2026','','Đã nghiệm thu','Có biên bản và ảnh hiện trường'],
   ['📎','yellow','2','Nghiệm thu công việc','Lắp dựng cốt thép','NTCV-02','11/07/2026','Nghiệm thu cốt thép trước khi đổ bê tông','Tư vấn giám sát','Bùi Văn Toàn','11/07/2026','','Cần đối chiếu','Chờ ảnh bổ sung']
  ],
  '04_THANH_TOAN_QUYET_TOAN': [
   ['📎','yellow','1','Thanh toán','Đợt 1','TT-01','15/07/2026','Hồ sơ thanh toán khối lượng hoàn thành đợt 1','Nhà thầu','Quân Trinh','20/07/2026','80000000','Đang xử lý','Đối chiếu bảng khối lượng'],
   ['📎','','2','Quyết toán','Hoàn công','QT-01','','Hồ sơ quyết toán hoàn thành công trình','Nhà thầu','Quân Trinh','','','Chưa có','Tạo sau khi nghiệm thu hoàn thành']
  ],
  '05_TONG_HOP_DOI_CHIEU': [
   ['📎','green','1','Danh mục','Tổng hợp hồ sơ','DM-01','08/07/2026','Danh mục hồ sơ toàn dự án','Ban QLDA','Quân Trinh','15/07/2026','','Đang xử lý','Dùng để kiểm tra thiếu/đủ'],
   ['📎','yellow','2','Đối chiếu','Vật liệu - thanh toán','DC-01','12/07/2026','Đối chiếu vật liệu đã nghiệm thu với hồ sơ thanh toán','Ban QLDA','Quân Trinh','18/07/2026','','Cần đối chiếu','Lọc theo nhóm hồ sơ']
  ],
  'REPOST_CARRY_FORWARD': [
   ['📎','green','1','Báo cáo định kỳ','Cấu trúc giữ lại','RP-01','13/07/2026','Dòng mẫu để thử Repost Carry Forward','Ban QLDA','Quân Trinh','20/07/2026','12500000','Đang xử lý','Dùng nút Carry Forward để giữ cấu trúc'],
   ['📎','yellow','2','Báo cáo định kỳ','Số liệu kỳ này','RP-02','13/07/2026','Dòng mẫu có số liệu sẽ được xử lý khi repost','Nhà thầu','Trần Dũng','20/07/2026','8500000','Cần đối chiếu','Kiểm tra trước khi repost']
  ]
 };
 return samples[sheetName] || samples['05_TONG_HOP_DOI_CHIEU'];
}

const PROJECT_ARCHIVE_GROUPS = [
 {name:'01_HOP_DONG_PHAP_LY', label:'Hợp đồng - pháp lý', fav:false, type:'grid', kind:'folder-sheet', sheetTitle:'Sheet hồ sơ', uploadFolder:'01_HOP_DONG_PHAP_LY'},
 {name:'02_VAT_LIEU_CO_CQ', label:'Vật liệu - CO CQ', fav:false, type:'grid', kind:'folder-sheet', sheetTitle:'Sheet hồ sơ', uploadFolder:'02_VAT_LIEU_CO_CQ'},
 {name:'03_THI_CONG_NGHIEM_THU', label:'Thi công - nghiệm thu', fav:false, type:'grid', kind:'folder-sheet', sheetTitle:'Sheet hồ sơ', uploadFolder:'03_THI_CONG_NGHIEM_THU'},
 {name:'04_THANH_TOAN_QUYET_TOAN', label:'Thanh toán - quyết toán', fav:false, type:'grid', kind:'folder-sheet', sheetTitle:'Sheet hồ sơ', uploadFolder:'04_THANH_TOAN_QUYET_TOAN'},
 {name:'05_TONG_HOP_DOI_CHIEU', label:'Tổng hợp - đối chiếu', fav:false, type:'grid', kind:'folder-sheet', sheetTitle:'Sheet hồ sơ', uploadFolder:'05_TONG_HOP_DOI_CHIEU'}
];

const PROJECT_DEFAULT_ITEMS = PROJECT_ARCHIVE_GROUPS.concat([
 {name:'REPOST_CARRY_FORWARD', label:'Repost', fav:false, type:'grid', kind:'folder-sheet', sheetTitle:'Repost', uploadFolder:'05_TONG_HOP_DOI_CHIEU'},
 {name:'DASHBOARD_TONG_HOP', label:'Dashboard', fav:false, type:'dashboard', kind:'dashboard', updated:new Date().toLocaleDateString('vi-VN')}
]);

let FOLDER_TEMPLATES = [];

var PROJECT_FOLDERS = [];

function buildDemoSheetCells(sampleRows, rowCount = 60){
 const headers = SHEET_COLUMN_CONFIG.map(c => c.label);
 const rows = Array.from({length:rowCount}, () => Array.from({length:headers.length}, () => ''));
 rows[0] = headers;
 sampleRows.forEach((sample, index) => { rows[index + 1] = sample; });
 return rows;
}

var activeProjectIndex = null;

const SHARE_PEOPLE = [
 {name:'Quân', role:'Chủ sở hữu'},
 {name:'Trần Dũng', role:'Người chỉnh sửa'},
 {name:'Bùi Văn Toàn', role:'Người chỉnh sửa'},
 {name:'Lê Văn Lương', role:'Người xem'},
];
