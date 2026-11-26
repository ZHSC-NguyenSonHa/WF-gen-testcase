// Sinh lại sheet "2.Test Scenario List" cho workflow 標準(各社)稟議書 (3 luồng: CEO決裁 / TCO決裁 / 各社COO決裁)
// dựa trên sheet "1.Workflow Overview". Giữ nguyên layout 10 cột (A-J) của file.
const ExcelJS = require('exceljs');
const path = require('path');

const FILE = path.resolve(__dirname, '..', '..', '..', 'CMS', 'Testcase', 'IM_Workflow_標準(各社)稟議書_Pre-UAT_Test_20261117.xlsx');

// order: thứ tự node theo sheet 1; 'K' = nhánh 関係者 (kNo.1, kNo.2…)
const FLOWS = [
  { d: 2, label: 'CEO決裁', kNo: 5, order: [1, 2, 3, 4, 'K', 6, 7, 8, 9, 10],
    names: { 1: '申請者', 2: '上長', 3: '部門長', 4: 'COO', K: '関係者', 6: '管理部', 7: 'TCO', 8: '担当役員', 9: '秘書室', 10: '決裁者' } },
  { d: 3, label: 'TCO決裁', kNo: 5, order: [1, 2, 3, 4, 'K', 6, 7],
    names: { 1: '申請者', 2: '上長', 3: '部門長', 4: 'COO', K: '関係者', 6: '管理部', 7: 'TCO' } },
  { d: 4, label: '各社COO決裁', kNo: 4, order: [1, 2, 3, 'K', 5],
    names: { 1: '申請者', 2: '上長', 3: '部門長', K: '関係者', 5: 'COO' } },
];

const DONE = 'Approved thành công lần lượt các step và tạo ra bản ghi 完了. Gửi mail 完了 đến 申請者, all user node cc user share và kankeisha';
const RET = (n) => `差戻し thành công về user 申請者 (node 1) và gửi mail thông báo 差戻し (từ ${n})`;
const REAPPLY = '再申請 bản ghi thành công và gửi mail 承認依頼 đến user tiếp theo (giữ nguyên 申請No. ban đầu)';

const tok = (f, k, kn) => (k === 'K' ? Array.from({ length: kn }, (_, i) => `${f.kNo}.${i + 1}`).join('→') : String(k));
// Chuỗi path từ node 1 đến node key (inclusive). Nếu key = 'K' thì dừng ở kNo.1
const upto = (f, key, { skip = [], kn = 2 } = {}) => {
  const out = [];
  for (const k of f.order) {
    if (skip.includes(k)) continue;
    if (k === 'K' && kn === 0) continue;
    if (k === key) { out.push(k === 'K' ? `${f.kNo}.1` : String(k)); break; }
    out.push(tok(f, k, kn));
  }
  return out.join('→');
};
const full = (f, o = {}) => f.order.filter((k) => !(o.skip || []).includes(k) && !(k === 'K' && o.kn === 0)).map((k) => tok(f, k, o.kn === undefined ? 2 : o.kn)).join('→');
const rows = [];
const mk = (f) => {
  let n = 0;
  return (name, p, exp, pri, note = '') => rows.push([f.label, `SC-${f.d}-${String(++n).padStart(2, '0')}`, name, p, exp, pri, note]);
};

for (const f of FLOWS) {
  const add = mk(f);
  const K = f.kNo;
  const isCOO = f.d === 4;

  // ---- Happy Path
  add('Happy Path - Tạo bản ghi', '1 tạo bản ghi', 'Tạo thành công bản ghi, gửi mail 承認依頼 đến user tiếp theo (上長; nếu 上長 trống thì 部門長)', 'High');
  add('Happy Path - Tạo bản ghi từ copy', '1 tạo bản ghi từ copy bản ghi khác', 'Tạo thành công bản ghi từ function copy, gửi mail 承認依頼 đến user tiếp theo', 'Medium');
  add('Happy Path - Save rồi tạo bản ghi từ button trên màn hình', '1 save, edit và tạo bản ghi', 'Save, sửa thành công và tạo thành công bản ghi, gửi mail 承認依頼 đến user tiếp theo', 'High');
  add('Happy Path - Phê duyệt bình thường - Full node', full(f), DONE, 'High');
  add('Happy Path - Phê duyệt bình thường - Non 上長', full(f, { skip: [2] }), DONE, 'Medium');
  add('Happy Path - Phê duyệt bình thường - Non 関係者 (0 kankei)', full(f, { kn: 0 }), DONE, 'Medium');
  if (f.d === 2) {
    add('Happy Path - Phê duyệt bình thường - Non 担当役員', '1→2→3→4→5.1→6→5.2→7→9→10', DONE, 'Medium');
    add('Happy Path - Nhánh 関係者 hoàn thành sau 管理部, TCO (song song)', '1→2→3→4→6→7→5.1→5.2→8→9→10',
      DONE + '\nNhánh 関係者 chạy song song với COO, 管理部, TCO và kết thúc trước 担当役員', 'Medium');
  }
  if (f.d === 3) {
    add('Happy Path - Nhánh 関係者 hoàn thành sau COO, 管理部 (song song)', '1→2→3→4→6→5.1→5.2→7',
      DONE + '\nNhánh 関係者 chạy song song với COO, 管理部 và kết thúc trước TCO', 'Medium');
  }

  // ---- 差戻し (mọi node → 申請者)
  for (const k of f.order.slice(1)) {
    const nm = f.names[k];
    add(`差戻し từ ${nm}`, `${upto(f, k)} 差戻し→1`, RET(nm), 'High');
  }

  // ---- 引戻し
  add('引戻し từ 申請者', '1 tạo bản ghi→1 引戻し', '引戻し thành công về user 申請者', 'High');
  const pull = f.d === 2 ? [4, 6, 'K'] : f.d === 3 ? [6, 'K'] : [3, 'K'];
  for (const k of pull) {
    const nm = k === 'K' ? 'user 関係者' : f.names[k];
    add(`引戻し từ ${f.names[k]}`, `${upto(f, k)} comment, approved→${k === 'K' ? `${K}.1` : k} 引戻し→${k === 'K' ? `${K}.1` : k}`,
      `引戻し thành công về ${nm}. ${nm} có thể chỉnh sửa comment đã input và approve thành công đến user tiếp theo`, 'High');
  }

  // ---- 取止め
  add('取止め bản ghi 引戻し', '1→1 引戻し→1 取止め', 'Hủy thành công bản ghi', 'Medium');
  add('取止め bản ghi bị 差戻し', '1→2→3 差戻し→1 取止め', 'Hủy thành công bản ghi', 'Medium');

  // ---- 再申請
  add('再申請 bản ghi bị 差戻し', '1→2→3 差戻し→1 再申請→2→3', REAPPLY, 'High');
  add('再申請 bản ghi tự 引戻し', '1→1 引戻し→1 再申請→2', REAPPLY, 'High');

  // ---- Điều kiện đặc biệt: hoàn thành nhánh kankei
  if (f.d === 2) {
    add('Bắt buộc hoàn thành nhánh 関係者 trước 担当役員', '1 tạo bản ghi có 2 kankei→2→3→4→5.1 approve→6→7 (5.2 chưa approve)→kiểm tra 担当役員→5.2 approve→8',
      'Khi còn user kankei chưa 承認: status chưa chuyển sang 担当役員待ち, 担当役員 không nhận mail 承認依頼.\nSau khi user kankei cuối cùng 承認: status chuyển 担当役員待ち và gửi mail 承認依頼 đến 担当役員', 'High');
    add('Bắt buộc hoàn thành nhánh 関係者 trước 秘書室 khi không có 担当役員', '1 tạo bản ghi có 2 kankei, 担当役員 không được setting→2→3→4→5.1 approve→6→7 (5.2 chưa approve)→kiểm tra 秘書室→5.2 approve→9',
      'Khi còn user kankei chưa 承認: status chưa chuyển sang 秘書室待ち, 秘書室 không nhận mail 承認依頼.\nSau khi user kankei cuối cùng 承認: status chuyển 秘書室待ち và gửi mail 承認依頼 đến 秘書室', 'High');
  } else if (f.d === 3) {
    add('Bắt buộc hoàn thành nhánh 関係者 trước TCO', '1 tạo bản ghi có 2 kankei→2→3→4→5.1 approve→6 (5.2 chưa approve)→kiểm tra TCO→5.2 approve→7',
      'Khi còn user kankei chưa 承認: status chưa chuyển sang TCO待ち, TCO không nhận mail 承認依頼.\nSau khi user kankei cuối cùng 承認: status chuyển TCO待ち và gửi mail 承認依頼 đến TCO', 'High');
  } else {
    add('Bắt buộc hoàn thành nhánh 関係者 trước COO', '1 tạo bản ghi có 2 kankei→2→3→4.1 approve (4.2 chưa approve)→kiểm tra COO→4.2 approve→5',
      'Khi còn user kankei chưa 承認: status chưa chuyển sang COO待ち, COO không nhận mail 承認依頼.\nSau khi user kankei cuối cùng 承認: status chuyển COO待ち và gửi mail 承認依頼 đến COO', 'High');
  }

  // ---- Thay đổi user 関係者
  const kStart = isCOO ? `4.1→4.2` : `4→${K}.1→${K}.2`;
  const startMail = isCOO ? 'gửi mail 承認依頼 đến 2 user kankei' : 'gửi mail 承認依頼 đến COO và 2 user kankei (kankei start từ status COO待ち)';
  add('User node thay đổi user 関係者: 0 kankei → 2 kankei', `1 tạo bản ghi có 0 kankei→2→3 thêm mới 2 user kankei, approve→${kStart}`,
    `Thêm mới thành công 2 user kankei vào luồng WF, ${startMail}`, 'High');
  add('User node thay đổi user 関係者: sửa thành user kankei khác', `1 tạo bản ghi có 2 kankei→2→3 sửa 1 kankei thành user kankei khác, approve→${kStart}`,
    `Đổi thành công user kankei trong luồng WF, ${startMail}. User kankei được đổi mới nhận mail 承認依頼`, 'High');
  add('User node thay đổi user 関係者: xóa all user kankei', `1 tạo bản ghi có 2 kankei→2→3 xóa 2 kankei, approve→${isCOO ? '5' : '4→6' + (f.d === 2 ? '→7→8→9→10' : '→7')}`,
    `Xóa thành công user kankei khỏi luồng WF, gửi mail 承認依頼 đến COO (không còn nhánh kankei). Approved lần lượt đến bản ghi 完了. Gửi mail 完了 đến 申請者, user node`, 'High');
  const k1 = `${K}.1`;
  const lead = isCOO ? '1 tạo bản ghi có 2 kankei→2→3→4.1' : `1 tạo bản ghi có 2 kankei→2→3→4→${k1}`;
  const tailAfterK = isCOO ? '5' : f.d === 2 ? '6→7→8→9→10' : '6→7';
  add('User kankei thay đổi user 関係者: thêm user kankei', `${lead} thêm 1 kankei, approve→${K}.2→${K}.3→${tailAfterK}`,
    'Thêm thành công user kankei mới vào luồng WF, gửi mail 承認依頼 đến user kankei thêm mới. Approved lần lượt đến bản ghi 完了. Gửi mail 完了 đến 申請者, user node, kankeisha', 'High');
  add('User kankei thay đổi user 関係者: xóa all user kankei chưa shounin', `${lead} xóa 1 kankei chưa shounin, approve→${tailAfterK}`,
    `Xóa thành công user kankei khỏi luồng WF, gửi mail 承認依頼 đến ${isCOO ? 'COO' : '管理部'}. Approved lần lượt đến bản ghi 完了. Gửi mail 完了 đến 申請者, user node`, 'High');
  add('申請者 thay đổi user 関係者 khi 再申請', `1→2→3 差戻し→1 thêm/sửa/xóa user 関係者 rồi 再申請→2→3→${isCOO ? '4.1' : '4→' + k1}`,
    '再申請 thành công với danh sách user 関係者 đã chỉnh sửa, gửi mail 承認依頼 đến user tiếp theo (giữ nguyên 申請No. ban đầu)', 'High');

  // ---- Hủy tự động 却下
  add('[NEGATIVE] Không Auto 却下 - Bản ghi 差戻し về 申請者 sau 60 ngày', '1→2→3 差戻し→1 (申請者待ち) → Không thao tác trong 60 ngày', 'Bản ghi vẫn giữ nguyên trạng thái 申請者待ち. KHÔNG tự động 却下', 'Low');
  add('Auto 却下 - Bản ghi tại 関係者 sau 60 ngày', `${isCOO ? '1→2→3→4.1 (1 kankei approved)→4.2' : `1→2→3→4→${K}.1 (1 kankei approved)→${K}.2`} (関係者待ち) Không thao tác trong 60 ngày`, 'Hệ thống tự động 却下 bản ghi', 'Low');
  if (isCOO) add('Auto 却下 - Bản ghi tại COO sau 60 ngày', '1→2→3→4.1→4.2 (kankei done)→5 (COO待ち) Không thao tác trong 60 ngày', 'Hệ thống tự động 却下 bản ghi', 'Low');
  else add('Auto 却下 - Bản ghi tại 管理部 sau 60 ngày', `1→2→3→4→${K}.1→${K}.2→6 (管理部待ち) Không thao tác trong 60 ngày`, 'Hệ thống tự động 却下 bản ghi', 'Low');

  // ---- Quyền view PG
  if (f.d === 2) {
    add('Quyền view bản ghi của node là PG', '1→2→3→4→5.1→5.2→6 (user 1 phê duyệt, user 2 confirm bản ghi từ list all)→7→8→9 (user 3 phê duyệt, user 4 confirm bản ghi từ list all)→10 (user 5 phê duyệt, user 6 confirm bản ghi từ list all)',
      'User 2 open thành công bản ghi user 1 đã phê duyệt từ LIST ALL\nUser 4 open thành công bản ghi user 3 đã phê duyệt từ LIST ALL\nUser 6 open thành công bản ghi user 5 đã phê duyệt từ LIST ALL\nCác user 1~6 open URL bản ghi đã phê duyệt rồi (từ mail request) thì hiển thị URL không có quyền tương tác (do bản ghi đã được phê duyệt rồi)', 'High', 'Node PG: 管理部, 秘書室, 決裁者');
    add('PG 管理部: Approve đồng thời, user 1 approve trước, user sau mở bản ghi từ Portal', '1→2→3→4→5.1→5.2→6 (user 1: shounin - user 2: mở bản ghi từ Portal)→7',
      'User 1: shounin thành công\nUser 2: Mở bản ghi hiển thị màn hình Detail', 'Medium', 'Node PG: 管理部');
    add('PG 管理部: Approve đồng thời, user 1 approve trước, user sau mở bản ghi từ mail', '1→2→3→4→5.1→5.2→6 (user 1: shounin - user 2: mở bản ghi từ mail)→7',
      'User 1: shounin thành công\nUser 2: Mở bản ghi hiển thị màn hình lỗi, không có quyền thao tác', 'Medium', 'Node PG: 管理部');
    add('PG 管理部: Approve đồng thời, 2 user approve đồng thời', '1→2→3→4→5.1→5.2→6 (user 1: mở bản ghi - user 2: mở bản ghi, 2 user approve đồng thời)→7',
      '1 trong 2 user thành công\n1 user approve thì báo lỗi', 'Medium', 'Node PG: 管理部');
  } else if (f.d === 3) {
    add('Quyền view bản ghi của node là PG', '1→2→3→4→5.1→5.2→6 (user 1 phê duyệt, user 2 confirm bản ghi từ list all)→7',
      'User 2 open thành công bản ghi user 1 đã phê duyệt từ LIST ALL\nCác user 1, 2 open URL bản ghi đã phê duyệt rồi (từ mail request) thì hiển thị URL không có quyền tương tác (do bản ghi đã được phê duyệt rồi)', 'High', 'Node PG: 管理部');
  }
}

// Authorization / Other
rows.push(['Authorization', 'A-01', 'Phân quyền và cấp/bỏ quyền cho user', '1. Login bằng account admin→Hiển thị màn hình Application→Add user vào マスター保守PG\n2. Remove user khỏi マスター保守PG',
  '1. User được add có quyền nhìn thấy màn hình master. Có thể thao tác tạo/chỉnh sửa/xóa master\n2. User bị remove khỏi PG không còn nhìn thấy màn hình master. Không thể thao tác tạo/chỉnh sửa/xóa master', 'Medium', '']);
rows.push(['Other', 'O-01', 'Kiểm tra các tính năng phụ liên quan', '1 hiển thị màn hình List→Tìm kiếm bản ghi mong muốn từ kết quả trả về của màn hình tìm kiếm→Mở bản ghi tương ứng và tiến hành duplicate→Tạo bản ghi',
  'Tạo bản ghi thành công', 'Medium', '']);

const width = (s) => [...s].reduce((a, ch) => a + (ch.charCodeAt(0) > 0x2e80 ? 2 : 1), 0);
const lines = (t, w) => String(t).split('\n').reduce((a, l) => a + Math.max(1, Math.ceil(width(l) / (w * 0.9))), 0);

(async () => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(FILE);

  const ov = wb.getWorksheet('1.Workflow Overview');
  ov.getCell('A2').value = 'Workflow 10 Nodes (3 luồng: CEO決裁 / TCO決裁 / 各社COO決裁) → Test Scenario & Test Case Design';
  ov.getCell('A12').value = '2. Danh sách 10 Nodes & Kankei users - CEO決裁 (SC-2)';
  ov.getCell('A26').value = '3. Danh sách 7 Nodes & Kankei users - TCO決裁 (SC-3)';
  ov.getCell('A38').value = '4. Danh sách 5 Nodes & Kankei users - 各社COO決裁 (SC-4)';

  const ws = wb.getWorksheet('2.Test Scenario List');
  const proto = [];
  for (let c = 1; c <= 10; c++) proto.push(JSON.parse(JSON.stringify(ws.getRow(5).getCell(c).style)));
  ws.dataValidations.model = {};
  for (let r = 5; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    row.height = undefined;
    for (let c = 1; c <= 10; c++) { const cell = row.getCell(c); cell.value = null; cell.style = {}; }
  }

  rows.forEach((s, i) => {
    const r = 5 + i;
    const row = ws.getRow(r);
    const vals = [{ formula: 'ROW()-4', result: i + 1 }, s[0], s[1], s[2], s[3], s[4], s[5], null, 'Not Start', s[6] || null];
    vals.forEach((v, c) => { const cell = row.getCell(c + 1); cell.value = v; cell.style = JSON.parse(JSON.stringify(proto[c])); });
    ws.getCell('I' + r).dataValidation = { type: 'list', allowBlank: true, formulae: ['"Not Start,In Progress,Pass,Fail,Blocked"'] };
    const n = Math.max(lines(s[2], 52.5), lines(s[3], 55.5), lines(s[4], 55.5), lines(s[6] || '', 30.8));
    row.height = Math.max(32.25, n * 14 + 6);
    row.commit();
  });
  ws.views = [{ state: 'frozen', ySplit: 4, topLeftCell: 'A5', showGridLines: false, activeCell: 'A5' }];
  await wb.xlsx.writeFile(FILE);
  console.log('Wrote', rows.length, 'scenarios');
})();
