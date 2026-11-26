// Cập nhật sheet "2.Test Scenario List" cho workflow 海外汎用稟議書 (ar_010): 2 luồng CEO決裁 (SC-2) và TCO決裁 (SC-3).
// Giữ layout file hiện có (header dòng 5, dữ liệu từ dòng 6, 10 cột A-J). Case thêm/sửa được tô màu + ghi chú ở cột J.
const ExcelJS = require('exceljs');
const path = require('path');

const FILE = path.resolve(__dirname, '..', '..', '..', 'CMS', 'Testcase', 'IM_Workflow_海外汎用稟議書_Pre-UAT_Test_20261117.xlsx');
const HEADER_ROW = 5;
const FIRST = HEADER_ROW + 1;

const NAMES = { 1: '申請者', 2: '関係部門', 3: '各社COO', 4: '各国COO', 5: '受付', 6: '関係者', 7: '担当者', 8: '部門長', 9: '管理本部', 10: 'TCO', 11: '秘書室', 12: '決裁者' };
const FLOWS = [
  { d: 2, label: 'Doc 海外汎用_CEO', max: 12, pg: [5, 11, 12],
    done: 'Approved thành công lần lượt các step và tạo ra bản ghi 完了. Gửi mail 完了 TO đến 申請者, user node (trừ node hisho, ketsaisha). Mail CC đến user 関係者, 共有先' },
  { d: 3, label: 'Doc 海外汎用_TCO', max: 10, pg: [5],
    done: 'Approved thành công lần lượt các step và tạo ra bản ghi 完了. Gửi mail 完了 TO đến 申請者, user node. Mail CC đến user 関係者, 共有先' },
];

// Quy tắc 差戻し: node 2~5 và 6 (関係者) → 1; node 7~10 → node 6; node 11, 12 giữ quy tắc cũ của file (→ 受付 5)
const retTarget = (n) => (n <= 6 ? 1 : n <= 10 ? 6 : 5);
const RULE_NOTE = (n) => (n === 6 ? 'Quy tắc: node 6 差戻し → về node 1' : n >= 7 && n <= 10 ? 'Quy tắc: node 7~10 差戻し → về node 6' : '');

const tok = (n, kn) => (n === 6 ? Array.from({ length: kn }, (_, i) => `6.${i + 1}`).join('→') : String(n));
const seq = (f, { skip = [], kn = 2, to = f.max } = {}) => {
  const out = [];
  for (let n = 1; n <= to; n++) {
    if (skip.includes(n) || (n === 6 && kn === 0)) continue;
    out.push(tok(n, kn));
  }
  return out.join('→');
};
// path đến node n; riêng node 6 dừng ở 6.1
const upto = (f, n) => (n === 6 ? seq(f, { to: 5 }) + '→6.1' : seq(f, { to: n }));
const retText = (n) => {
  const t = retTarget(n);
  return t === 1 ? '差戻し thành công về user 申請者 và gửi mail thông báo 差戻し'
    : t === 6 ? '差戻し thành công về node 6 (関係者) và gửi mail thông báo 差戻し'
      : '差戻し thành công về user 受付 và gửi mail thông báo 差戻し';
};
const retArrow = (n) => (retTarget(n) === 6 ? '差戻し→6, 6.1 差戻し→1' : retTarget(n) === 5 ? '差戻し→5 差戻し→1' : '差戻し→1');
const retStep = (n) => `差戻し→${retTarget(n)}`;
const REAPPLY = '再申請 bản ghi thành công và gửi mail 承認依頼 đến user tiếp theo (giữ nguyên 申請No. ban đầu)';
const SYO = 'User 1: Syounin thành công, done bản ghi';
const ERR = '1 user báo lỗi, 1 user Approve thành công, done bản ghi';

const rows = [];
const build = (f) => {
  let i = 0;
  const add = (name, p, exp, pri, reason = '') => rows.push({ flow: f.label, id: `SC-${f.d}-${String(++i).padStart(2, '0')}`, name, p, exp, pri, reason });
  const last = f.max;

  // ---- Happy Path
  add('Happy Path - Tạo bản ghi', '1 tạo bản ghi', 'Tạo thành công bản ghi, gửi mail 承認依頼 đến user tiếp theo (関係部門)', 'High');
  add('Happy Path - Tạo bản ghi từ copy', '1 tạo bản ghi từ copy bản ghi khác', 'Tạo thành công bản ghi từ function copy, gửi mail 承認依頼 đến user tiếp theo', 'Medium');
  add('Happy Path - Save nháp rồi tạo bản ghi', '1 save, edit và tạo bản ghi', 'Save, sửa thành công và tạo thành công bản ghi, gửi mail 承認依頼 đến user tiếp theo', 'High');
  add('Happy Path - Phê duyệt bình thường - Full node', seq(f), f.done, 'High');
  add('Happy Path - Phê duyệt bình thường - Non 関係者', seq(f, { kn: 0 }), f.done, 'Medium');
  add('Happy Path - Phê duyệt bình thường - Non 各国COO', seq(f, { skip: [4] }), f.done, 'Medium');
  add('Happy Path - Phê duyệt bình thường - Non 管理本部', seq(f, { skip: [9] }), f.done, 'Medium');
  add('Happy Path - Nhánh 関係者 chạy song song với 部門長, 管理本部 và kết thúc trước TCO',
    `1→2→3→4→5→7→6.1→8→6.2→9→${f.d === 2 ? '10→11→12' : '10'}`, f.done + '\nNhánh 関係者 kết thúc trước status TCO待ち', 'Medium');

  // ---- 差戻し
  for (let n = 2; n <= last; n++) add(`差戻し từ ${NAMES[n]}`, `${upto(f, n)} ${retStep(n)}`, retText(n), 'High', RULE_NOTE(n));

  // ---- 引戻し
  add('引戻し từ 申請者', '1→1 引戻し', '引戻し thành công về user 申請者', 'High');
  add('引戻し từ 受付', '1→2→3→4→5 comment, attach file, approved→5 引戻し→5', '引戻し thành công về user 受付\n- có thể chỉnh sửa comment đã input, attach file và approve thành công đến user tiếp theo', 'High');
  add('引戻し từ 関係者', `${seq(f, { to: 5 })}→6.1 comment, approved→6.1 引戻し→6.1`, '引戻し thành công về user 関係者\n- có thể chỉnh sửa comment đã input và approve thành công đến user tiếp theo', 'High');
  add('引戻し từ 担当者', `${seq(f, { to: 6 })}→7 comment, attach file, approved→7 引戻し→7`, '引戻し thành công về user 担当者\n- có thể chỉnh sửa comment đã input, attach file và approve thành công đến user tiếp theo', 'High');
  add('引戻し từ 管理本部', `${seq(f, { to: 8 })}→9 comment, approved→9 引戻し→9`, '引戻し thành công về user 管理本部\n- có thể chỉnh sửa comment đã input và approve thành công đến user tiếp theo', 'Medium');

  // ---- 取止め
  add('取止め bản ghi 引戻し', '1→1 引戻し→1 取止め', 'Hủy thành công bản ghi', 'Medium');
  add('取止め bản ghi bị 差戻し từ node 受付', `${upto(f, 5)} 差戻し→1 取止め`, 'Hủy thành công bản ghi', 'High');
  add('取止め bản ghi bị 差戻し từ node 関係者', `${upto(f, 6)} 差戻し→1 取止め`, 'Hủy thành công bản ghi', 'High', RULE_NOTE(6));
  add('取止め bản ghi bị 差戻し từ node 担当者', `${upto(f, 7)} ${retArrow(7)} 取止め`, 'Hủy thành công bản ghi', 'High', RULE_NOTE(7));
  if (f.d === 2) add('取止め bản ghi bị 差戻し từ node 秘書室', `${upto(f, 11)} ${retArrow(11)} 取止め`, 'Hủy thành công bản ghi', 'High');
  else add('取止め bản ghi bị 差戻し từ node TCO', `${upto(f, 10)} ${retArrow(10)} 取止め`, 'Hủy thành công bản ghi', 'High', RULE_NOTE(10));

  // ---- 再申請
  add('再申請 bản ghi bị 差戻し từ node 受付', `${upto(f, 5)} 差戻し→1 再申請→2→3→4→5`, REAPPLY, 'High');
  add('再申請 bản ghi bị 差戻し từ node 関係者', `${upto(f, 6)} 差戻し→1 再申請→2→3→4→5→6.1`, REAPPLY, 'High', RULE_NOTE(6));
  add('再申請 bản ghi bị 差戻し từ node 担当者', `${upto(f, 7)} ${retArrow(7)} 再申請→2→3→4→5`, REAPPLY, 'High', RULE_NOTE(7));
  if (f.d === 2) add('再申請 bản ghi bị 差戻し từ node 秘書室', `${upto(f, 11)} ${retArrow(11)} 再申請→2→3→4→5`, REAPPLY, 'Medium');
  else add('再申請 bản ghi bị 差戻し từ node TCO', `${upto(f, 10)} ${retArrow(10)} 再申請→2→3→4→5`, REAPPLY, 'Medium', RULE_NOTE(10));
  add('再申請 bản ghi tự 引戻し', '1→1 引戻し→1 再申請→2', REAPPLY, 'High');

  // ---- Điều kiện đặc biệt
  add('Bắt buộc hoàn thành nhánh 関係者 trước TCO', `1 tạo bản ghi có 2 kankei→2→3→4→5→7→8→9 (6.1 approve, 6.2 chưa approve)→kiểm tra TCO→6.2 approve→10`,
    'Khi còn user kankei chưa 承認: status chưa chuyển sang TCO待ち, TCO không nhận mail 承認依頼.\nSau khi user kankei cuối cùng 承認: status chuyển TCO待ち và gửi mail 承認依頼 đến TCO', 'High');

  // ---- Thay đổi user 関係者
  const tail = f.d === 2 ? '7→8→9→10→11→12' : '7→8→9→10';
  add('User node thay đổi user 関係者: 0 kankei → 2 kankei', '1 tạo bản ghi có 0 kankei→2→3→4→5 thêm mới 2 user kankei, approve→6.1→6.2', 'Thêm mới thành công 2 user kankei vào luồng WF, gửi mail 承認依頼 đến 2 user kankei', 'High');
  add('User node thay đổi user 関係者: sửa thành user kankei khác', '1 tạo bản ghi có 2 kankei→2→3→4→5 sửa 1 kankei thành user kankei khác, approve→6.1→6.2', 'Đổi thành công user kankei vào luồng WF, gửi mail 承認依頼 đến user kankei được đổi mới', 'High');
  add('User node thay đổi user 関係者: xóa 1 kankei', '1 tạo bản ghi có 2 kankei→2→3→4→5 xóa 1 user kankei, approve→6.1', 'Xóa thành công 1 user kankei trong luồng WF, gửi mail 承認依頼 đến user kankei còn lại', 'High');
  add('User node thay đổi user 関係者: xóa all kankei', '1 tạo bản ghi có 2 kankei→2→3→4→5 xóa 2 user kankei, approve→7', 'Xóa thành công 2 user kankei khỏi luồng WF, gửi mail 承認依頼 đến 担当者 (không còn nhánh kankei)', 'High');
  add('User kankei thay đổi user 関係者: thêm user kankei', `1 tạo bản ghi có 2 kankei→2→3→4→5→6.1 thêm 1 kankei, approve→6.2→6.3→${tail}`,
    `Thêm thành công user kankei mới vào luồng WF, gửi mail 承認依頼 đến user kankei thêm mới. Thành công approved lần lượt đến bản ghi 完了. ${f.done.replace('Approved thành công lần lượt các step và tạo ra bản ghi 完了. ', '')}`, 'High');
  add('User kankei thay đổi user 関係者: xóa user kankei chưa shounin', `1 tạo bản ghi có 2 kankei→2→3→4→5→6.1 xóa 6.2 (chưa shounin), approve→${tail}`,
    `Xóa thành công user kankei khỏi luồng WF, gửi mail 承認依頼 đến 担当者. Thành công approved lần lượt đến bản ghi 完了. ${f.done.replace('Approved thành công lần lượt các step và tạo ra bản ghi 完了. ', '')}`, 'High');
  add('申請者 thay đổi user 関係者 khi 再申請', '1→2→3 差戻し→1 thêm/sửa/xóa user 関係者 rồi 再申請→2→3→4→5→6.1', '再申請 thành công với danh sách user 関係者 đã chỉnh sửa, gửi mail 承認依頼 đến user tiếp theo (giữ nguyên 申請No. ban đầu)', 'High');

  // ---- Hủy tự động 却下
  add('[NEGATIVE] Không Auto 却下 - Bản ghi 差戻し về 申請者 sau 60 ngày', '1→2→3→4 差戻し→1 (申請者待ち) → Không thao tác trong 60 ngày', 'Bản ghi vẫn giữ nguyên trạng thái 申請者待ち. KHÔNG tự động 却下', 'Low');
  add('Auto 却下 - Bản ghi tại 関係者 sau 60 ngày', '1→2→3→4→5→6.1 (1 kankei approved)→6.2 (関係者待ち) Không thao tác trong 60 ngày', 'Hệ thống tự động 却下 bản ghi', 'Low');
  add('Auto 却下 - Bản ghi tại 担当者 sau 60 ngày', '1→2→3→4→5→6.1→6.2→7 (担当者待ち) Không thao tác trong 60 ngày', 'Hệ thống tự động 却下 bản ghi', 'Low');

  // ---- Quyền view PG
  const pgNames = f.pg.map((n) => NAMES[n]).join(', ');
  const annotated = Array.from({ length: f.max }, (_, k) => k + 1).map((n) => {
    const t = tok(n, 2);
    const k = f.pg.indexOf(n);
    return k >= 0 ? `${t} (user ${2 * k + 1} phê duyệt, user ${2 * k + 2} confirm bản ghi từ list all)` : t;
  }).join('→');
  add(`Quyền view bản ghi của node là PG (${pgNames})`, annotated,
    f.pg.map((n, k) => `User ${2 * k + 2} open thành công bản ghi user ${2 * k + 1} đã phê duyệt từ LIST ALL`).join('\n') + '\nCác user open URL bản ghi đã phê duyệt rồi (từ mail request) thì hiển thị URL ko có quyền tương tác (do bản ghi đã được phê duyệt rồi)', 'High');
  for (const n of f.pg) {
    const nm = NAMES[n];
    const base = upto(f, n);
    add(`PG ${nm}: User 1 approve, user 2 mở bản ghi từ Portal`, `${base} user 1: shounin - user 2: mở bản ghi từ Portal`, `${SYO}\nUser 2: Có thể view bản ghi, mở bản ghi hiển thị màn hình Detail của bản ghi`, 'Medium');
    add(`PG ${nm}: User 1 approve, user 2 mở bản ghi từ mail`, `${base} user 1: Approve - user 2: mở bản ghi từ mail`, `${SYO}\nUser 2: open URL bản ghi đã phê duyệt rồi (từ mail request) thì hiển thị URL ko có quyền tương tác (do bản ghi đã được phê duyệt rồi)`, 'Medium');
    add(`PG: Bất đồng bộ, đồng thời 2 user Node ${nm}: cùng approve`, `${base} user 1: mở bản ghi - user 2: mở bản ghi\nCả 2 user 1 & 2 đồng thời approve bản ghi`, ERR, 'Medium');
    const conc = (label, extra) => add(`PG: Bất đồng bộ, đồng thời 2 user Node ${nm}: ${label}`,
      `${base} user 1: mở bản ghi - user 2: mở bản ghi\nCả 2 user cùng chung PG của ${n} cùng thực hiện action:\n+ 1 user thực hiện ${extra[0]}\n+ 1 user thực hiện ${extra[1]}`, ERR, 'Medium');
    conc('shounin + sashi', ['shounin', 'sashi']);
    conc('add user share + shounin', ['add user share', 'shounin']);
    if (n === 5) conc('add user kankei + shounin', ['add user kankei', 'shounin']);
    conc('attach file + shounin', ['attach file', 'shounin']);
    conc('Hikimodoshi + shounin', ['Hikimodoshi', 'shounin']);
  }
};
FLOWS.forEach(build);
rows.push({ flow: 'Authorization', id: 'A-01', name: 'Phân quyền và cấp/bỏ quyền cho user', p: '1. Login bằng account admin→Hiển thị màn hình Application→Add user vào マスター保守PG\n2. Remove user khỏi マスター保守PG',
  exp: '1. User được add có quyền nhìn thấy màn hình master. Có thể thao tác tạo/chỉnh sửa/xóa master\n2. User bị remove khỏi PG không còn nhìn thấy màn hình master. Không thể thao tác tạo/chỉnh sửa/xóa master', pri: 'Medium', reason: '' });
rows.push({ flow: 'Other', id: 'O-01', name: 'Kiểm tra các tính năng phụ liên quan', p: '1 hiển thị màn hình List→Tìm kiếm bản ghi mong muốn từ kết quả trả về của màn hình tìm kiếm→Mở bản ghi tương ứng và tiến hành duplicate→Tạo bản ghi',
  exp: 'Tạo bản ghi thành công', pri: 'Medium', reason: '' });

const flowKey = (b) => String(b || '').replace(/\s/g, '');
const norm = (s) => String(s == null ? '' : s).replace(/[\s"“”]/g, '').toLowerCase();
const width = (s) => [...s].reduce((a, ch) => a + (ch.charCodeAt(0) > 0x2e80 ? 2 : 1), 0);
const lines = (t, w) => String(t).split('\n').reduce((a, l) => a + Math.max(1, Math.ceil(width(l) / (w * 0.9))), 0);
const val = (c) => { const v = c.value; return v && typeof v === 'object' ? (v.richText ? v.richText.map((r) => r.text).join('') : v.text || '') : v; };

(async () => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(FILE);

  const ov = wb.getWorksheet('1.Workflow Overview');
  ov.getCell('A12').value = '2.1 Danh sách 12 Nodes & Kankei users (ワークフロー図（CEO決裁)';
  ov.getCell('A28').value = '2.2 Danh sách 10 Nodes & Kankei users (ワークフロー図（TCO決裁)';
  ov.getCell('C50').value = 'Bắt buộc hoàn thành nhánh kankei (nếu có) trước status TCO待ち';

  const ws = wb.getWorksheet('2.Test Scenario List');
  const old = [];
  for (let r = FIRST; r <= ws.rowCount; r++) {
    const id = val(ws.getCell('C' + r));
    if (!id) continue;
    old.push({ b: flowKey(val(ws.getCell('B' + r))), name: norm(val(ws.getCell('D' + r))), p: norm(val(ws.getCell('E' + r))), exp: norm(val(ws.getCell('F' + r))) });
  }

  const proto = [];
  for (let c = 1; c <= 10; c++) proto.push(JSON.parse(JSON.stringify(ws.getRow(FIRST).getCell(c).style)));
  Object.keys(ws._merges).filter((k) => Number(k.replace(/\D/g, '')) >= FIRST).forEach((k) => {
    const m = ws._merges[k].model;
    ws.unMergeCells(m.top, m.left, m.bottom, m.right);
  });
  ws.dataValidations.model = {};
  for (let r = FIRST; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    row.height = undefined;
    for (let c = 1; c <= 10; c++) { const cell = row.getCell(c); cell.value = null; cell.style = {}; }
  }

  const FILL = { added: 'FFE2EFDA', edited: 'FFFFF2CC' };
  const stat = { added: 0, edited: 0, same: 0 };
  rows.forEach((s, i) => {
    const r = FIRST + i;
    const b = flowKey(s.flow); const nn = norm(s.name); const np = norm(s.p); const ne = norm(s.exp);
    let status = 'added';
    const sameFlow = (o) => o.b === b || /^[AO]-/.test(s.id);
    if (old.some((o) => sameFlow(o) && o.name === nn && o.p === np && o.exp === ne)) status = 'same';
    else if (old.some((o) => sameFlow(o) && (o.p === np || o.name === nn))) status = 'edited';
    stat[status]++;
    const tag = status === 'added' ? '[Thêm mới]' : status === 'edited' ? '[Sửa đổi]' : '';
    const note = [tag, s.reason].filter(Boolean).join(' ');
    const row = ws.getRow(r);
    const vals = [{ formula: `ROW()-${HEADER_ROW}`, result: i + 1 }, s.flow, s.id, s.name, s.p, s.exp, s.pri, null, 'Not Start', note || null];
    vals.forEach((v, c) => {
      const cell = row.getCell(c + 1);
      cell.value = v;
      cell.style = JSON.parse(JSON.stringify(proto[c]));
      if (status !== 'same') cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: FILL[status] } };
    });
    row.getCell(10).alignment = { vertical: 'top', wrapText: true };
    ws.getCell('I' + r).dataValidation = { type: 'list', allowBlank: true, formulae: ['"Not Start,In Progress,Pass,Fail,Blocked"'] };
    const n = Math.max(lines(s.name, 52.5), lines(s.p, 55.5), lines(s.exp, 55.5), lines(note, 16));
    row.height = Math.max(30, n * 14 + 6);
    row.commit();
  });

  // Chú thích màu ở dòng 3
  const legend = (addr, text, argb) => {
    const c = ws.getCell(addr);
    c.value = text;
    c.font = { name: 'Cambria', size: 10, bold: true };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
    if (argb) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
  };
  legend('B3', 'Chú thích màu:', null);
  legend('C3', 'Thêm mới', FILL.added);
  legend('D3', 'Sửa đổi', FILL.edited);

  ws.views = [{ state: 'frozen', ySplit: HEADER_ROW, topLeftCell: `A${FIRST}`, showGridLines: false, activeCell: `A${FIRST}` }];
  await wb.xlsx.writeFile(FILE);
  console.log('Wrote', rows.length, 'scenarios', JSON.stringify(stat));
})();
