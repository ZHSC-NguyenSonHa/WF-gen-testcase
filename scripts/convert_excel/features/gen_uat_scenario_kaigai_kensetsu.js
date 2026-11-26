// Cập nhật sheet "2.Test Scenario List" cho workflow 海外建設稟議書書 (ar_010):
// 2 luồng: 役員決裁 (SC-1, 8 node) và 統括部長決裁 (SC-2, 6 node). Chỉ sửa case sai / thêm case thiếu / đánh dấu case đề xuất xóa.
// Quy ước 差戻し theo spec của app này (đã giả định đúng): node 2~4 → node 1 (申請者); node 5 (関係者) trở đi → node 4 (担当者).
const ExcelJS = require('exceljs');
const path = require('path');

const FILE = path.resolve(__dirname, '..', '..', '..', 'CMS', 'Testcase', 'IM_Workflow_海外建設稟議書書_Pre-UAT_Test_20261119.xlsx');
const HEADER_ROW = 5;
const FIRST = HEADER_ROW + 1;

const QNOTE = 'Chờ Qna nên giả định là gửi đến user 担当者';
const DONE = 'Approved thành công lần lượt các step và tạo ra bản ghi 完了. Gửi mail 完了 TO đến  申請者, user node . Mail CC đến user 関係者, 共有先';
const SKIP_REASON = 'Spec sheet 1 chỉ ghi node 関係者 có thể bỏ trống/skip; node này không có ghi chú skip (là node duyệt cuối) → Chờ xác nhận';
const PG_VIEW_F = 'User 2 open thành công bản ghi user 1 đã phê duyệt từ LIST ALL\nUser 1, 2 open URL bản ghi đã phê duyệt rồi (từ mail request) thì hiển thị URL ko có quyền tương tác (do bản ghi đã được phê duyệt rồi)';
const COND_F = (n) => `Khi còn user kankei chưa 承認: status chưa chuyển sang 統括部長待ち, 統括部長 không nhận mail 承認依頼.\nSau khi user kankei cuối cùng 承認: status chuyển 統括部長待ち và gửi mail 承認依頼 đến 統括部長`;

// Sửa theo ID cũ. fields: tên cột (d=Name, e=Path, f=Expected, g=Priority, j=Note) + reason.
const MODS = {
  // ===== 役員決裁 (SC-1)
  'SC-1-11': { f: '差戻し thành công về user 申請者 và gửi mail thông báo 差戻し', reason: 'Kết quả kỳ vọng ghi nhầm "受付" (node không có trong app này) → 差戻し từ 担当者 về 申請者' },
  'SC-1-12': { e: '1→2→3→4→5.1 差戻し→4', f: '差戻し thành công về user 担当者 và gửi mail thông báo 差戻し', q: true, reason: 'Thay "?" / "受付" bằng 担当者 (node 4) theo spec giả định' },
  'SC-1-13': { f: '差戻し thành công về user 担当者 và gửi mail thông báo 差戻し', q: true, reason: 'Kết quả kỳ vọng ghi nhầm "受付" → về 担当者 (node 5 trở đi 差戻し về 担当者)' },
  'SC-1-14': { f: '差戻し thành công về user 担当者 và gửi mail thông báo 差戻し', q: true, reason: 'Kết quả kỳ vọng ghi nhầm "受付" → về 担当者' },
  'SC-1-15': { f: '差戻し thành công về user 担当者 và gửi mail thông báo 差戻し', q: true, reason: 'Kết quả kỳ vọng ghi nhầm "受付" → về 担当者' },
  'SC-1-26': { e: '1→2→3→4→5.1 差戻し→4 差戻し→1 取止め', q: true, reason: 'Thay "?" bằng node 4 (担当者); 担当者 差戻し tiếp về 申請者 rồi 取止め' },
  'SC-1-33': { e: '1→2→3→4→5.1 差戻し→4 差戻し→1 再申請', q: true, reason: 'Thay "?" bằng node 4 (担当者); 担当者 差戻し tiếp về 申請者 rồi 再申請' },
  'SC-1-37': { e: '1 tạo bản ghi có 0 kankei→2→3→4 thêm mới 2 user kankei, approve', f: 'Thêm mới thành công 2 user kankei vào luồng WF, gửi mail 承認依頼 đến 2 user kankei (kankei start sau khi 担当者 承認), không gửi mail đến user 統括部長',
    reason: 'Kankei chỉ start sau khi 担当者 承認 → thao tác tại 担当者 (node 4); sửa kết quả (không phải "không gửi mail 担当者")' },
  'SC-1-38': { e: '1 tạo bản ghi có 2 kankei→2→3→4 sửa 1 kankei thành user kankei khác, approve', reason: 'Làm sạch path (thiếu dấu →)' },
  'SC-1-39': { e: '1 tạo bản ghi có 2 kankei→2→3→4 xóa 1 user kankei chưa shounin, thực hiện shounin', f: 'Xóa thành công 1 user kankei trong luồng WF, gửi mail 承認依頼 đến user kankei còn lại. 統括部長 chỉ nhận mail sau khi tất cả user kankei còn lại đã 承認',
    reason: 'Spec: 統括部長 chỉ xử lý được sau khi tất cả 関係者 approve xong → không gửi mail 統括部長 ngay; thao tác tại 担当者' },
  'SC-1-40': { e: '1 Tạo bản ghi có 2 kankei→2→3→4→5.1 thêm 1 kankei, approve→5.2→5.3→6→7→8', reason: 'Làm sạch path ("5->5.1" → 5.1)' },
  'SC-1-41': { e: '1 Tạo bản ghi có 2 kankei→2→3→4→5.1 xóa 5.2 (chưa shounin), approve→6→7→8', f: 'Xóa thành công user kankei khỏi luồng WF, gửi mail 承認依頼 đến 統括部長. Thành công approved lần lượt đến bản ghi 完了. Gửi mail 完了 TO đến 申請者, user node . Mail CC đến user 関係者, 共有先',
    reason: 'Path sai thứ tự node (6 trước 5.1); sau kankei là 統括部長 (node 6) chứ không phải 本部長' },
  'SC-1-43': { e: '1→2→3→4→5.1 (1 kankei approved) → 5.2 (関係者待ち) Không thao tác trong 60 ngày', reason: 'Làm sạch path ("5→5.1" → 5.1)' },
  'SC-1-44': { d: 'PG: Quyền View của user cùng PG 担当者\nUser 1: Approve\nUser 2: Open bản ghi', e: '1→2→3→4 user 1: shounin - user 2: mở bản ghi từ Portal', reason: 'Path thiếu node 4 (担当者) trong khi case là PG 担当者; bỏ dấu " thừa ở tên' },
  'SC-1-45': { d: 'PG: Quyền View của user cùng PG 担当者\nUser 1: Approve\nUser 2: Open bản ghi', e: '1→2→3→4 user 1: Approve - user 2: mở bản ghi từ mail', reason: 'Path thiếu node 4 (担当者); bỏ dấu " thừa ở tên' },
  'SC-1-47': { e: '1→2→3→4 user 1: mở bản ghi-  user 2: mở bản ghi\nCả 2 user cùng chung PG của 4 cùng thực hiện action:\n+ 1 user thực hiện shounin \n+1 user thực hiện sashi ', reason: 'Ghi nhầm "PG của 5" → node 4 (担当者)' },
  'SC-1-50': { d: 'PG: Bất đồng bộ ,  đồng thời 2 user Node 担当者', reason: 'Thiếu Scenario Name' },
  // Node 5 trở đi 差戻し về 担当者 (giả định spec đúng): chỉ bổ sung ghi chú, không đổi nội dung
  'SC-1-27': { q: true, reason: 'Xác nhận 差戻し từ 統括部長 về 担当者 rồi 差戻し về 申請者' },
  'SC-1-28': { q: true, reason: 'Xác nhận 差戻し từ 本部長 về 担当者 rồi 差戻し về 申請者' },
  'SC-1-29': { q: true, reason: 'Xác nhận 差戻し từ 担当役員 về 担当者 rồi 差戻し về 申請者' },
  'SC-1-34': { q: true, reason: 'Xác nhận 差戻し từ 統括部長 về 担当者 rồi 差戻し về 申請者' },
  'SC-1-35': { q: true, reason: 'Xác nhận 差戻し từ 本部長 về 担当者 rồi 差戻し về 申請者' },
  'SC-1-36': { q: true, reason: 'Xác nhận 差戻し từ 担当役員 về 担当者 rồi 差戻し về 申請者' },
  'SC-2-11': { q: true, reason: 'Xác nhận 差戻し từ 統括部長 về 担当者' },
  'SC-2-21': { q: true, reason: 'Xác nhận 差戻し từ 統括部長 về 担当者 rồi 差戻し về 申請者' },
  'SC-2-26': { q: true, reason: 'Xác nhận 差戻し từ 統括部長 về 担当者 rồi 差戻し về 申請者' },
  // ===== 統括部長決裁 (SC-2)
  'SC-2-10': { e: '1→2→3→4→5.1 差戻し→4', f: 'Hệ thống 差戻し thành công về user 担当者 và gửi mail thông báo 差戻し', q: true, reason: 'Thay "?" bằng 担当者 (node 4) theo spec giả định' },
  'SC-2-20': { e: '1→2→3→4→5.1 差戻し→4 差戻し→1 取止め', q: true, reason: 'Thay "?" bằng node 4 (担当者)' },
  'SC-2-25': { e: '1→2→3→4→5.1 差戻し→4 差戻し→1 再申請', q: true, reason: 'Thay "?" bằng node 4 (担当者)' },
  'SC-2-27': { e: '1 tạo bản ghi có 0 kankei→2→3→4 thêm mới 2 user kankei, approve', f: 'Thêm mới thành công 2 user kankei vào luồng WF, gửi mail 承認依頼 đến 2 user kankei (kankei start sau khi 担当者 承認), không gửi mail đến user 統括部長',
    reason: 'Kankei chỉ start sau khi 担当者 承認 → thao tác tại 担当者 (node 4); sửa kết quả' },
  'SC-2-28': { e: '1 tạo bản ghi có 2 kankei→2→3→4 sửa 1 kankei thành user kankei khác, approve', reason: 'Làm sạch path (thiếu dấu →)' },
  'SC-2-29': { e: '1 tạo bản ghi có 2 kankei→2→3→4 xóa 1 user kankei chưa shounin, thực hiện shounin', f: 'Xóa thành công 1 user kankei trong luồng WF, gửi mail 承認依頼 đến user kankei còn lại. 統括部長 chỉ nhận mail sau khi tất cả user kankei còn lại đã 承認',
    reason: 'Spec: 統括部長 chỉ xử lý được sau khi tất cả 関係者 approve xong; thao tác tại 担当者' },
  'SC-2-30': { e: '1 Tạo bản ghi có 2 kankei→2→3→4→5.1 thêm 1 kankei, approve→5.2→5.3→6', reason: 'Làm sạch path ("5->5.1" → 5.1)' },
  'SC-2-31': { e: '1 Tạo bản ghi có 2 kankei→2→3→4→5.1 xóa 5.2 (chưa shounin), approve→6', f: 'Xóa thành công user kankei khỏi luồng WF, gửi mail 承認依頼 đến 統括部長. Thành công approved đến bản ghi 完了. Gửi mail 完了 TO đến 申請者, user node . Mail CC đến user 関係者, 共有先',
    reason: 'Kết quả ghi nhầm gửi mail "本部長" (luồng này không có 本部長) → 統括部長' },
  'SC-2-33': { e: '1→2→3→4→5.1 (1 kankei approved) → 5.2 (関係者待ち) Không thao tác trong 60 ngày', reason: 'Làm sạch path ("5→5.1" → 5.1)' },
  'SC-2-34': { d: 'PG: Quyền View của user cùng PG 担当者\nUser 1: Approve\nUser 2: Open bản ghi', e: '1→2→3→4 user 1: shounin - user 2: mở bản ghi từ Portal', reason: 'Path thiếu node 4 (担当者); bỏ dấu " thừa ở tên' },
  'SC-2-35': { d: 'PG: Quyền View của user cùng PG 担当者\nUser 1: Approve\nUser 2: Open bản ghi', e: '1→2→3→4 user 1: Approve - user 2: mở bản ghi từ mail', reason: 'Path thiếu node 4 (担当者); bỏ dấu " thừa ở tên' },
  'SC-2-37': { e: '1→2→3→4 user 1: mở bản ghi-  user 2: mở bản ghi\nCả 2 user cùng chung PG của 4 cùng thực hiện action:\n+ 1 user thực hiện shounin \n+1 user thực hiện sashi ', reason: 'Ghi nhầm "PG của 5" → node 4 (担当者)' },
  'SC-2-40': { d: 'PG: Bất đồng bộ ,  đồng thời 2 user Node 担当者', reason: 'Thiếu Scenario Name' },
};

const DELETE = {
  'SC-1-06': 'Non 統括部長: ' + SKIP_REASON,
  'SC-1-07': 'Non 本部長: ' + SKIP_REASON,
  'SC-1-08': 'Non 担当役員: ' + SKIP_REASON,
  'SC-2-06': 'Non 統括部長: ' + SKIP_REASON + ' (và là node duyệt cuối của luồng)',
};

// Thêm mới: chèn sau ID cũ. flow: 1|2
const ins = (flow, name, p, f, g, o = {}) => ({ flow, d: name, e: p, f, g, q: o.q, reason: o.reason || '' });
const ADD = {
  'SC-1-05': [ins(1, 'Happy Path - Phê duyệt bình thường - Non 関係者', '1→2→3→4→6→7→8', DONE, 'Medium', { reason: 'Spec: node 関係者 có thể bỏ trống và được skip trên WF' })],
  'SC-1-15': [
    ins(1, 'Phê duyệt lại sau khi 差戻し về 担当者 (từ 関係者)', '1→2→3→4→5.1 差戻し→4 approve lại→5.1→5.2→6→7→8', '担当者 approve lại thành công và bản ghi tiếp tục phê duyệt lần lượt đến 完了. Gửi mail 承認依頼 đến user tiếp theo ở mỗi bước, gửi mail 完了 khi kết thúc', 'High', { q: true, reason: 'Bổ sung luồng tiếp tục sau 差戻し về 担当者' }),
    ins(1, 'Phê duyệt lại sau khi 差戻し về 担当者 (từ 統括部長)', '1→2→3→4→5.1→5.2→6 差戻し→4 approve lại→5.1→5.2→6→7→8', '担当者 approve lại thành công và bản ghi tiếp tục phê duyệt lần lượt đến 完了. Gửi mail 承認依頼 đến user tiếp theo ở mỗi bước, gửi mail 完了 khi kết thúc', 'High', { q: true, reason: 'Bổ sung luồng tiếp tục sau 差戻し về 担当者' }),
  ],
  'SC-1-36': [ins(1, 'Bắt buộc hoàn thành nhánh 関係者 trước 統括部長', '1 tạo bản ghi có 2 kankei→2→3→4→5.1 approve (5.2 chưa approve)→kiểm tra 統括部長→5.2 approve→6→7→8', COND_F(), 'High', { reason: 'Thiếu case loại Path "Điều kiện đặc biệt" (mục 6 sheet 1)' })],
  'SC-1-43': [ins(1, 'Auto 却下 - Bản ghi tại 担当者 sau 60 ngày', '1→2→3→4 (担当者待ち) Không thao tác trong 60 ngày', 'Hệ thống tự động 却下 bản ghi.', 'Low', { reason: 'Bổ sung Auto 却下 tại user node' })],
  'SC-1-45': [ins(1, 'PG: Quyền View của user cùng PG 担当者 - confirm bản ghi từ LIST ALL', '1→2→3→4 (user 1 phê duyệt, user 2 confirm bản ghi từ list all)→5.1→5.2→6→7→8', PG_VIEW_F, 'High', { reason: 'Thiếu case PG xem bản ghi từ LIST ALL' })],
  'SC-1-50': [ins(1, 'PG: Bất đồng bộ ,  đồng thời 2 user Node 担当者', '1→2→3→4 user 1: mở bản ghi-  user 2: mở bản ghi\nCả 2 user cùng chung PG của 4 cùng thực hiện action:\n+ 1 user thực hiện Hikimodoshi\n+ 1 user thực hiện shounin', '1 user báo lỗi, 1 user Approve thành công, done bản ghi', 'Medium', { reason: 'Bổ sung thao tác đồng thời Hikimodoshi + shounin' })],
  'SC-2-05': [ins(2, 'Happy Path - Phê duyệt bình thường - Non 関係者', '1→2→3→4→6', DONE, 'Medium', { reason: 'Spec: node 関係者 có thể bỏ trống và được skip trên WF' })],
  'SC-2-11': [
    ins(2, 'Phê duyệt lại sau khi 差戻し về 担当者 (từ 関係者)', '1→2→3→4→5.1 差戻し→4 approve lại→5.1→5.2→6', '担当者 approve lại thành công và bản ghi tiếp tục phê duyệt lần lượt đến 完了. Gửi mail 承認依頼 đến user tiếp theo ở mỗi bước, gửi mail 完了 khi kết thúc', 'High', { q: true, reason: 'Bổ sung luồng tiếp tục sau 差戻し về 担当者' }),
    ins(2, 'Phê duyệt lại sau khi 差戻し về 担当者 (từ 統括部長)', '1→2→3→4→5.1→5.2→6 差戻し→4 approve lại→5.1→5.2→6', '担当者 approve lại thành công và bản ghi tiếp tục phê duyệt lần lượt đến 完了. Gửi mail 承認依頼 đến user tiếp theo ở mỗi bước, gửi mail 完了 khi kết thúc', 'High', { q: true, reason: 'Bổ sung luồng tiếp tục sau 差戻し về 担当者' }),
  ],
  'SC-2-26': [ins(2, 'Bắt buộc hoàn thành nhánh 関係者 trước 統括部長', '1 tạo bản ghi có 2 kankei→2→3→4→5.1 approve (5.2 chưa approve)→kiểm tra 統括部長→5.2 approve→6', COND_F(), 'High', { reason: 'Thiếu case loại Path "Điều kiện đặc biệt" (mục 6 sheet 1)' })],
  'SC-2-33': [ins(2, 'Auto 却下 - Bản ghi tại 担当者 sau 60 ngày', '1→2→3→4 (担当者待ち) Không thao tác trong 60 ngày', 'Hệ thống tự động 却下 bản ghi.', 'Low', { reason: 'Bổ sung Auto 却下 tại user node' })],
  'SC-2-35': [ins(2, 'PG: Quyền View của user cùng PG 担当者 - confirm bản ghi từ LIST ALL', '1→2→3→4 (user 1 phê duyệt, user 2 confirm bản ghi từ list all)→5.1→5.2→6', PG_VIEW_F, 'High', { reason: 'Thiếu case PG xem bản ghi từ LIST ALL' })],
  'SC-2-40': [ins(2, 'PG: Bất đồng bộ ,  đồng thời 2 user Node 担当者', '1→2→3→4 user 1: mở bản ghi-  user 2: mở bản ghi\nCả 2 user cùng chung PG của 4 cùng thực hiện action:\n+ 1 user thực hiện Hikimodoshi\n+ 1 user thực hiện shounin', '1 user báo lỗi, 1 user Approve thành công, done bản ghi', 'Medium', { reason: 'Bổ sung thao tác đồng thời Hikimodoshi + shounin' })],
};

const val = (c) => { const v = c.value; return v && typeof v === 'object' ? (v.richText ? v.richText.map((r) => r.text).join('') : (v.text || '')) : v; };
const norm = (s) => String(s == null ? '' : s).replace(/\s+/g, '');
const width = (s) => [...s].reduce((a, ch) => a + (ch.charCodeAt(0) > 0x2e80 ? 2 : 1), 0);
const lines = (t, w) => String(t).split('\n').reduce((a, l) => a + Math.max(1, Math.ceil(width(l) / (w * 0.8))), 0);

(async () => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(FILE);

  // ---- Sheet 1: sửa tiêu đề lệch số node / copy nhầm tên luồng
  const ov = wb.getWorksheet('1.Workflow Overview');
  ov.getCell('A2').value = 'Workflow 2 luồng (統括部長決裁: 6 Nodes / 役員決裁: 8 Nodes) → Test Scenario & Test Case Design';
  ov.getCell('A12').value = '2.1 Danh sách 6 Nodes & Kankei users (ワークフロー図（統括部長決裁)';
  ov.getCell('A22').value = '2.2 Danh sách 8 Nodes & Kankei users (ワークフロー図（役員決裁)';

  const ws = wb.getWorksheet('2.Test Scenario List');
  const old = [];
  for (let r = FIRST; r <= ws.rowCount; r++) {
    const id = val(ws.getCell('C' + r));
    if (!id) continue;
    old.push({ id: String(id), b: String(val(ws.getCell('B' + r))).trim(), d: val(ws.getCell('D' + r)), e: val(ws.getCell('E' + r)), f: val(ws.getCell('F' + r)), g: val(ws.getCell('G' + r)), h: val(ws.getCell('H' + r)), i: val(ws.getCell('I' + r)), j: val(ws.getCell('J' + r)) });
  }
  const flowB = { 1: old.find((o) => /^SC-1-/.test(o.id)).b, 2: old.find((o) => /^SC-2-/.test(o.id)).b };

  // ---- Dựng danh sách cuối
  const out = [];
  const used = new Set();
  const stat = { added: 0, edited: 0, deleted: 0, same: 0 };
  for (const o of old) {
    const row = { ...o, status: 'same', note: o.j || '' };
    if (DELETE[o.id]) {
      row.status = 'deleted'; row.note = '[Đề xuất xóa] ' + DELETE[o.id]; used.add(o.id);
    } else if (MODS[o.id]) {
      const m = MODS[o.id]; used.add(o.id);
      let changed = false;
      for (const k of ['d', 'e', 'f', 'g']) if (m[k] !== undefined && norm(m[k]) !== norm(row[k])) { row[k] = m[k]; changed = true; }
      if (changed || m.q) {
        row.status = 'edited';
        row.note = ['[Sửa đổi]' + (m.q ? ' ' + QNOTE : ''), m.reason].filter(Boolean).join('\n');
      }
    }
    out.push(row);
    for (const a of ADD[o.id] || []) {
      used.add('ADD:' + o.id);
      out.push({ id: '', b: flowB[a.flow], d: a.d, e: a.e, f: a.f, g: a.g, h: null, i: null, j: '', status: 'added', note: ['[Thêm mới]' + (a.q ? ' ' + QNOTE : ''), a.reason].filter(Boolean).join('\n'), flow: a.flow });
    }
  }
  for (const k of [...Object.keys(MODS), ...Object.keys(DELETE), ...Object.keys(ADD)]) {
    if (!old.some((o) => o.id === k)) throw new Error('Không tìm thấy ID cũ: ' + k);
  }

  // ---- Đánh số lại ID theo luồng (case đề xuất xóa giữ ID cũ để đối chiếu)
  const cnt = {};
  for (const r of out) {
    const flow = r.flow || (/^SC-(\d)-/.exec(r.id) || [])[1];
    if (r.status === 'deleted') { r.newId = '[Xóa] ' + r.id; stat.deleted++; continue; }
    cnt[flow] = (cnt[flow] || 0) + 1;
    r.newId = `SC-${flow}-${String(cnt[flow]).padStart(2, '0')}`;
    stat[r.status]++;
  }

  // ---- Ghi lại sheet
  const proto = [];
  for (let c = 1; c <= 10; c++) proto.push(JSON.parse(JSON.stringify(ws.getRow(FIRST).getCell(c).style)));
  Object.keys(ws._merges).filter((k) => Number(k.replace(/\D/g, '')) >= FIRST).forEach((k) => {
    const m = ws._merges[k].model;
    ws.unMergeCells(m.top, m.left, m.bottom, m.right);
  });
  ws.dataValidations.model = {};
  const lastOld = ws.rowCount;
  for (let r = FIRST; r <= Math.max(lastOld, FIRST + out.length); r++) {
    const row = ws.getRow(r);
    row.height = undefined;
    for (let c = 1; c <= 10; c++) { const cell = row.getCell(c); cell.value = null; cell.style = {}; }
  }

  const FILL = { added: 'FFE2EFDA', edited: 'FFFFF2CC', deleted: 'FFF8CBAD' };
  ws.getColumn(10).width = 42;
  out.forEach((s, i) => {
    const r = FIRST + i;
    const row = ws.getRow(r);
    const vals = [{ formula: `ROW()-${HEADER_ROW}`, result: i + 1 }, s.b, s.newId, s.d, s.e, s.f, s.g, s.h, s.i, s.note || null];
    vals.forEach((v, c) => {
      const cell = row.getCell(c + 1);
      cell.value = v;
      cell.style = JSON.parse(JSON.stringify(proto[c]));
      if (s.status !== 'same') cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: FILL[s.status] } };
      if (s.status === 'deleted') cell.font = { ...cell.font, strike: true, color: { argb: 'FF7F7F7F' } };
    });
    row.getCell(10).alignment = { vertical: 'top', wrapText: true };
    ws.getCell('I' + r).dataValidation = { type: 'list', allowBlank: true, formulae: ['"Not Start,In Progress,Pass,Fail,Blocked"'] };
    const n = Math.max(lines(s.d || '', 53), lines(s.e || '', 56), lines(s.f || '', 56), lines(s.note || '', 42));
    row.height = Math.max(30, n * 15 + 6);
    row.commit();
  });

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
  legend('E3', 'Đề xuất xóa (chờ xác nhận)', FILL.deleted);

  ws.views = [{ state: 'frozen', ySplit: HEADER_ROW, topLeftCell: `A${FIRST}`, showGridLines: false, activeCell: `A${FIRST}` }];
  await wb.xlsx.writeFile(FILE);
  console.log('Wrote', out.length, 'rows', JSON.stringify(stat), JSON.stringify(cnt));
})();

