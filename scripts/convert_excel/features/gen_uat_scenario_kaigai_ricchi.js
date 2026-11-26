// Sinh sheet "2.Test Scenario List" cho workflow 海外立地調査稟議 (ar_012) từ sheet "1.Workflow Overview".
// Node: 1 申請者, 2 関係部門１, 3 関係部門２, 4 関係部門３, 5 COO, 6 担当者, 7 関係者(7.1, 7.2...), 8 部門長, 9 担当役員, 10 決裁者
const ExcelJS = require('exceljs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const SRC = path.join(ROOT, 'CMS', 'Spec', '海外立地', 'IM_Workflow_海外立地調査稟議_Pre-UAT_Test_20261117.xlsx');
const OUT = path.join(ROOT, 'CMS', 'Testcase', 'IM_Workflow_海外立地調査稟議_Pre-UAT_Test_20261123.xlsx');

const DOC = 'Doc 出店稟議';
const FULL = '1→2→3→4→5→6→7.1→7.2→8→9→10';
const DONE = 'Approved thành công lần lượt các step và tạo ra bản ghi 完了. Gửi mail 完了 đến 申請者, all user node cc user share và kankeisha';
const RET_APPLICANT = (n) => `差戻し thành công về user 申請者 và gửi mail thông báo 差戻し (từ ${n})`;
const RET_TANTO = (n) => `差戻し thành công về user 担当者 (không về 申請者) và gửi mail thông báo 差戻し (từ ${n})`;

// [obj, id, name, path, expected, priority, note]
const S = [];
const add = (obj, id, name, p, exp, pri, note = '') => S.push([obj, id, name, p, exp, pri, note]);

// ---- Happy Path
add(DOC, 'SC-1-01', 'Happy Path - Tạo bản ghi', '1 tạo bản ghi', 'Tạo thành công bản ghi, gửi mail 承認依頼 đến user tiếp theo (関係部門１ hoặc user node kế tiếp nếu node bị skip)', 'High');
add(DOC, 'SC-1-02', 'Happy Path - Tạo bản ghi từ copy', '1 tạo bản ghi từ copy bản ghi khác', 'Tạo thành công bản ghi từ function copy, gửi mail 承認依頼 đến user tiếp theo', 'Medium');
add(DOC, 'SC-1-03', 'Happy Path - Save rồi tạo bản ghi từ button trên màn hình', '1 save, edit và tạo bản ghi', 'Save, sửa thành công và tạo thành công bản ghi, gửi mail 承認依頼 đến user tiếp theo', 'High');
add(DOC, 'SC-1-04', 'Happy Path - Phê duyệt bình thường - Full node', FULL, DONE, 'High');
add(DOC, 'SC-1-05', 'Happy Path - Phê duyệt bình thường - Non 関係部門１', '1→3→4→5→6→7.1→7.2→8→9→10', DONE, 'Medium');
add(DOC, 'SC-1-06', 'Happy Path - Phê duyệt bình thường - Non 関係部門２', '1→2→4→5→6→7.1→7.2→8→9→10', DONE, 'Medium');
add(DOC, 'SC-1-07', 'Happy Path - Phê duyệt bình thường - Non 関係部門３', '1→2→3→5→6→7.1→7.2→8→9→10', DONE, 'Medium');
add(DOC, 'SC-1-08', 'Happy Path - Phê duyệt bình thường - Non cả 3 関係部門', '1→5→6→7.1→7.2→8→9→10', DONE, 'Medium');
add(DOC, 'SC-1-09', 'Happy Path - Phê duyệt bình thường - Non 関係者 (0 user kankei)', '1→2→3→4→5→6→8→9→10', DONE, 'Medium');

// ---- 差戻し
add(DOC, 'SC-1-10', '差戻し từ 関係部門１', '1→2 差戻し→1', RET_APPLICANT('関係部門１'), 'High');
add(DOC, 'SC-1-11', '差戻し từ COO', '1→2→3→4→5 差戻し→1', RET_APPLICANT('COO'), 'High');
add(DOC, 'SC-1-12', '差戻し từ 担当者', '1→2→3→4→5→6 差戻し→1', RET_APPLICANT('担当者'), 'High');
add(DOC, 'SC-1-13', '差戻し từ 関係者', '1→2→3→4→5→6→7.1 差戻し→6', RET_TANTO('関係者'), 'High');
add(DOC, 'SC-1-14', '差戻し từ 部門長', '1→2→3→4→5→6→7.1→7.2→8 差戻し→6', RET_TANTO('部門長'), 'High');
add(DOC, 'SC-1-15', '差戻し từ 担当役員', '1→2→3→4→5→6→7.1→7.2→8→9 差戻し→6', RET_TANTO('担当役員'), 'High');
add(DOC, 'SC-1-16', '差戻し từ 決裁者', '1→2→3→4→5→6→7.1→7.2→8→9→10 差戻し→6', RET_TANTO('決裁者'), 'High');
add(DOC, 'SC-1-17', '担当者 phê duyệt lại sau khi bị 差戻し từ 部門長', '1→2→3→4→5→6→7.1→7.2→8 差戻し→6 approve lại→7.1→7.2→8→9→10',
  '担当者 approve lại thành công, luồng tiếp tục đến 完了. Gửi mail 承認依頼 đến user tiếp theo ở mỗi bước, mail 完了 khi kết thúc', 'High');

// ---- 引戻し
add(DOC, 'SC-1-18', '引戻し từ 申請者', '1 tạo bản ghi→1 引戻し', '引戻し thành công về user 申請者', 'High');
add(DOC, 'SC-1-19', '引戻し từ COO', '1→2→3→4→5 comment, approved→5 引戻し→5', '引戻し thành công về user COO. COO có thể chỉnh sửa comment đã input và approve thành công đến user tiếp theo', 'High');
add(DOC, 'SC-1-20', '引戻し từ 担当者', '1→2→3→4→5→6 comment, approved→6 引戻し→6', '引戻し thành công về user 担当者. 担当者 có thể chỉnh sửa comment đã input và approve thành công đến user tiếp theo (kankei chưa được start)', 'High');
add(DOC, 'SC-1-21', '引戻し từ 部門長', '1→2→3→4→5→6→7.1→7.2→8 approved→8 引戻し→8', '引戻し thành công về user 部門長. 部門長 có thể approve lại thành công đến user tiếp theo', 'Medium');

// ---- 取止め
add(DOC, 'SC-1-22', '取止め bản ghi 引戻し', '1→1 引戻し→1 取止め', 'Hủy thành công bản ghi', 'Medium');
add(DOC, 'SC-1-23', '取止め bản ghi bị 差戻し', '1→2→3→4→5→6 差戻し→1 取止め', 'Hủy thành công bản ghi', 'Medium');

// ---- 再申請
add(DOC, 'SC-1-24', '再申請 bản ghi bị 差戻し', '1→2→3→4→5→6 差戻し→1 再申請→2→3→4→5→6', '再申請 bản ghi thành công và gửi mail 承認依頼 đến user tiếp theo (giữ nguyên 申請No. ban đầu)', 'High');
add(DOC, 'SC-1-25', '再申請 bản ghi tự 引戻し', '1→1 引戻し→1 再申請', '再申請 bản ghi thành công và gửi mail 承認依頼 đến user tiếp theo (giữ nguyên 申請No. ban đầu)', 'High');

// ---- Điều kiện đặc biệt
add(DOC, 'SC-1-26', 'Bắt buộc hoàn thành nhánh 関係者 trước 部門長', '1 tạo bản ghi có 2 kankei→2→3→4→5→6→7.1 approve (7.2 chưa approve)→kiểm tra 部門長→7.2 approve→8',
  'Khi còn user kankei chưa 承認: status chưa chuyển sang 部門長待ち, 部門長 không nhận mail 承認依頼.\nSau khi user kankei cuối cùng 承認: status chuyển 部門長待ち và gửi mail 承認依頼 đến 部門長', 'High');

// ---- Thay đổi 関係者
const KNOTE = 'Node 担当者 trở đi mới được thay đổi 関係者';
add(DOC, 'SC-1-27', 'User 担当者 thay đổi user 関係者: 0 kankei → 2 kankei', '1 tạo bản ghi có 0 kankei→2→3→4→5→6 thêm mới 2 user kankei, approve→7.1→7.2→8',
  'Thêm mới thành công 2 user kankei vào luồng WF, gửi mail 承認依頼 đến 2 user kankei. 部門長 chỉ nhận mail sau khi cả 2 user kankei 承認', 'High', KNOTE);
add(DOC, 'SC-1-28', 'User 担当者 thay đổi user 関係者: sửa thành user kankei khác', '1 tạo bản ghi có 2 kankei→2→3→4→5→6 sửa 1 kankei thành user kankei khác, approve→7.1→7.2',
  'Đổi thành công user kankei trong luồng WF, gửi mail 承認依頼 đến user kankei được đổi mới', 'High', KNOTE);
add(DOC, 'SC-1-29', 'User 担当者 thay đổi user 関係者: xóa all user kankei', '1 tạo bản ghi có 2 kankei→2→3→4→5→6 xóa 2 kankei, approve→8',
  'Xóa thành công user kankei khỏi luồng WF, gửi mail 承認依頼 đến 部門長 (bỏ qua nhánh kankei)', 'High', KNOTE);
add(DOC, 'SC-1-30', 'User kankei thay đổi user 関係者: thêm user kankei', '1 tạo bản ghi có 2 kankei→2→3→4→5→6→7.1 thêm 1 kankei, approve→7.2→7.3→8→9→10',
  'Thêm thành công user kankei mới vào luồng WF, gửi mail 承認依頼 đến user kankei thêm mới. Approved lần lượt đến bản ghi 完了. Gửi mail 完了 đến 申請者, user node', 'High');
add(DOC, 'SC-1-31', 'User kankei thay đổi user 関係者: xóa all user kankei chưa shounin', '1 tạo bản ghi có 2 kankei→2→3→4→5→6→7.1 xóa 7.2 (chưa shounin), approve→8→9→10',
  'Xóa thành công user kankei chưa shounin, gửi mail 承認依頼 đến 部門長. Approved lần lượt đến bản ghi 完了. Gửi mail 完了 đến 申請者, user node', 'High');
add(DOC, 'SC-1-32', '[NEGATIVE] Không thay đổi được user 関係者 tại node trước 担当者', '1 tạo bản ghi→2→3→4→5 mở màn hình phê duyệt (kiểm tra vùng 関係者)',
  'Không hiển thị/không thao tác được thêm/sửa/xóa user 関係者 tại các node trước 担当者', 'Medium');

// ---- Hủy tự động 却下
add(DOC, 'SC-1-33', '[NEGATIVE] Không Auto 却下 - Bản ghi 差戻し về 申請者 sau 60 ngày', '1→2→3→4→5→6 差戻し→1 (申請者待ち) → Không thao tác trong 60 ngày',
  'Bản ghi vẫn giữ nguyên trạng thái 申請者待ち. KHÔNG tự động 却下', 'Low');
add(DOC, 'SC-1-34', 'Auto 却下 - Bản ghi tại 関係者 sau 60 ngày', '1→2→3→4→5→6→7.1 (1 kankei approved)→7.2 (関係者待ち) Không thao tác trong 60 ngày', 'Hệ thống tự động 却下 bản ghi', 'Low');
add(DOC, 'SC-1-35', 'Auto 却下 - Bản ghi tại 担当者 sau 60 ngày', '1→2→3→4→5→6 (担当者待ち) Không thao tác trong 60 ngày', 'Hệ thống tự động 却下 bản ghi', 'Low');

// ---- Quyền view PG
const PGNOTE = 'Node PG: 担当者';
add(DOC, 'SC-1-36', 'Quyền view bản ghi của node là PG (担当者)', '1→2→3→4→5→6 (user 1 phê duyệt, user 2 confirm bản ghi từ list all)→7.1→7.2→8→9→10',
  'User 2 open thành công bản ghi user 1 đã phê duyệt từ LIST ALL\nUser 1, 2 open URL bản ghi đã phê duyệt (từ mail request) thì hiển thị URL không có quyền tương tác (do bản ghi đã được phê duyệt rồi)', 'High', PGNOTE);
add(DOC, 'SC-1-37', 'PG 担当者: Approve đồng thời, user 1 approve trước, user sau mở bản ghi từ Portal', '1→2→3→4→5→6 (user 1: shounin - user 2: mở bản ghi từ Portal)→7.1',
  'User 1: shounin thành công\nUser 2: Mở bản ghi hiển thị màn hình Detail', 'Medium', PGNOTE);
add(DOC, 'SC-1-38', 'PG 担当者: Approve đồng thời, user 1 approve trước, user sau mở bản ghi từ mail', '1→2→3→4→5→6 (user 1: shounin - user 2: mở bản ghi từ mail)→7.1',
  'User 1: shounin thành công\nUser 2: Mở bản ghi hiển thị màn hình lỗi, không có quyền thao tác', 'Medium', PGNOTE);
add(DOC, 'SC-1-39', 'PG 担当者: Approve đồng thời, 2 user approve đồng thời', '1→2→3→4→5→6 (user 1: mở bản ghi - user 2: mở bản ghi, 2 user approve đồng thời)→7.1',
  '1 trong 2 user thành công\n1 user approve thì báo lỗi', 'Medium', PGNOTE);

// ---- Authorization / Other
add('Authorization', 'A-01', 'Phân quyền và cấp/bỏ quyền cho user', '1. Login bằng account admin→Hiển thị màn hình Application→Add user vào マスター保守PG\n2. Remove user khỏi マスター保守PG',
  '1. User được add có quyền nhìn thấy màn hình master. Có thể thao tác tạo/chỉnh sửa/xóa master\n2. User bị remove khỏi PG không còn nhìn thấy màn hình master. Không thể thao tác tạo/chỉnh sửa/xóa master', 'Medium');
add('Other', 'O-01', 'Kiểm tra các tính năng phụ liên quan', '1 hiển thị màn hình List→Tìm kiếm bản ghi mong muốn từ kết quả trả về của màn hình tìm kiếm→Mở bản ghi tương ứng và tiến hành duplicate→Tạo bản ghi',
  'Tạo bản ghi thành công', 'Medium');

// Ước lượng chiều cao dòng: ký tự full-width tính 2 đơn vị
const width = (s) => [...s].reduce((a, ch) => a + (ch.charCodeAt(0) > 0x2e80 ? 2 : 1), 0);
const lines = (text, colWidth) => String(text).split('\n').reduce((a, l) => a + Math.max(1, Math.ceil(width(l) / (colWidth * 0.95))), 0);

(async () => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(SRC);

  const ov = wb.getWorksheet('1.Workflow Overview');
  ov.getCell('A2').value = 'Workflow 10 Nodes → Test Scenario & Test Case Design';

  const ws = wb.getWorksheet('2.Test Scenario List');
  const colW = { D: 52.57, E: 55.57, F: 55.57, N: 16.4 };
  const proto = [];
  for (let c = 1; c <= 14; c++) proto.push(JSON.parse(JSON.stringify(ws.getRow(5).getCell(c).style)));

  // File gốc có merge lạ (D29:D30, D55:D56) trong vùng dữ liệu, bỏ đi trước khi ghi
  Object.keys(ws._merges).filter((k) => Number(k.replace(/\D/g, '')) >= 5).forEach((k) => {
    const m = ws._merges[k].model;
    ws.unMergeCells(m.top, m.left, m.bottom, m.right);
  });
  ws.dataValidations.model = {};
  for (let r = 5; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    row.height = undefined;
    for (let c = 1; c <= 14; c++) {
      const cell = row.getCell(c);
      cell.value = null;
      cell.style = {};
    }
  }

  S.forEach((s, i) => {
    const r = 5 + i;
    const row = ws.getRow(r);
    const vals = [{ formula: 'ROW()-4', result: i + 1 }, s[0], s[1], s[2], s[3], s[4], s[5], null, null, 'Not Start', null, null, 'Not Start', s[6] || null];
    vals.forEach((v, c) => {
      const cell = row.getCell(c + 1);
      cell.value = v;
      cell.style = JSON.parse(JSON.stringify(proto[c]));
    });
    ['J', 'M'].forEach((col) => {
      ws.getCell(col + r).dataValidation = { type: 'list', allowBlank: true, formulae: ['"Not Start,In Progress,Pass,Fail,Blocked"'] };
    });
    const n = Math.max(lines(s[2], colW.D), lines(s[3], colW.E), lines(s[4], colW.F), lines(s[6] || '', colW.N));
    row.height = Math.max(33, n * 14 + 6);
    row.commit();
  });

  ws.views = [{ state: 'frozen', ySplit: 4, topLeftCell: 'A5', showGridLines: false, activeCell: 'A5' }];
  await wb.xlsx.writeFile(OUT);
  console.log('Wrote', OUT, 'scenarios:', S.length);
})();
