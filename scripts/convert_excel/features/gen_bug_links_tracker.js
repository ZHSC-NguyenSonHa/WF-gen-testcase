// =============================================================================
// gen_bug_links_tracker.js — Tổng hợp link bug theo Version & App
// Creator: QuynhNT | Date: 2026-07-22
// Output: Release/Bug_Links_Tracker.xlsx
// Mục đích: Lưu nhanh link tới các bug report, phân nhóm theo Version và App.
//           KHÔNG phải file log bug — chỉ là bảng tham chiếu link.
// =============================================================================

'use strict';

const path    = require('path');
const ExcelJS = require('exceljs');

const OUTPUT_FILE = path.resolve(__dirname, '../../../Release/Bug_Links_Tracker.xlsx');

// ─── Các version release hiện tại ─────────────────────────────────────────────
const VERSIONS = [
  { ver: '1.0.0' },
  { ver: '1.0.1' },
  { ver: '1.0.2' },
  { ver: '1.0.3' },
  { ver: '1.0.4' },
  { ver: '1.0.5' },
  { ver: '7.2.0' },
  { ver: '7.4.0' },
];

// ─── Màu nền xen kẽ theo version (8 màu pastel) ───────────────────────────────
const VER_COLORS = [
  'FFF2CC', // vàng nhạt
  'E2EFDA', // xanh lá nhạt
  'DDEBF7', // xanh dương nhạt
  'FCE4D6', // cam nhạt
  'EAD1DC', // hồng nhạt
  'D9EAD3', // xanh mint nhạt
  'CFE2F3', // xanh sky nhạt
  'F4CCCC', // đỏ nhạt
];

// Màu đậm hơn của cùng nhóm màu (cho hàng tiêu đề version)
const VER_HDR_COLORS = [
  'FFD966', // vàng
  'A9D18E', // xanh lá
  '9DC3E6', // xanh dương
  'F4B183', // cam
  'C9A0DC', // tím/hồng
  '93C47D', // xanh mint
  '76A5AF', // xanh sky
  'E06666', // đỏ
];

// ─── Màu App ──────────────────────────────────────────────────────────────────
const APP_COLOR = {
  'iOS App':     '0070C0',
  'Android App': '375623',
  'CMS':         '7030A0',
};

// ─── Hằng số layout ───────────────────────────────────────────────────────────
const HDR_BG  = '243F60';   // nền header cột
const HDR_FG  = 'FFFFFF';
const NUM_BLANK_PER_VER = 10;  // số hàng trống sẵn cho mỗi version

// ─── Style helpers ────────────────────────────────────────────────────────────
const thin = (hex = 'BFBFBF') => ({ style: 'thin', color: { argb: 'FF' + hex } });
const med  = (hex = HDR_BG)   => ({ style: 'medium', color: { argb: 'FF' + hex } });

function cellBorder(type = 'thin') {
  const s = type === 'medium' ? med() : thin();
  return { top: s, left: s, bottom: s, right: s };
}

function setHeader(cell, text, bgHex, fgHex = 'FFFFFF', size = 10, bold = true) {
  cell.value = text;
  cell.font  = { name: 'Calibri', size, bold, color: { argb: 'FF' + fgHex } };
  cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + bgHex } };
  cell.alignment = { horizontal: 'center', vertical: 'middle' };
  cell.border = cellBorder('medium');
}

function setBody(cell, value, bgHex, opt = {}) {
  cell.value = value ?? '';
  cell.font  = { name: 'Calibri', size: 10, ...(opt.font || {}) };
  cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + bgHex } };
  cell.alignment = { vertical: 'middle', horizontal: opt.align || 'left', ...(opt.alignment || {}) };
  cell.border = cellBorder('thin');
}

// ─── Định nghĩa cột (4 cột gọn) ──────────────────────────────────────────────
//   A        B       C                   D
//   App      STT     Link Bug            Ghi chú
const COLS = [
  { key: 'app',   header: 'App',      width: 15, align: 'center' },
  { key: 'stt',   header: 'STT',      width: 6,  align: 'center' },
  { key: 'link',  header: 'Link Bug', width: 70, align: 'left'   },
  { key: 'note',  header: 'Ghi chú',  width: 35, align: 'left'   },
];

// ─── Dữ liệu mẫu (2-3 hàng để minh hoạ cách dùng) ───────────────────────────
// Cấu trúc: { ver, app, stt, link, note }
const SAMPLES = [
  { ver: '1.0.1', app: 'iOS App',     stt: 1, link: 'https://jira.example.com/browse/APP-101', note: 'Edge-to-Edge layout vỡ trên iPhone 15 Pro' },
  { ver: '1.0.1', app: 'Android App', stt: 2, link: 'https://jira.example.com/browse/APP-102', note: '' },
  { ver: '1.0.2', app: 'Android App', stt: 1, link: 'https://jira.example.com/browse/APP-110', note: 'Firebase crash on Android 14' },
  { ver: '7.4.0', app: 'Android App', stt: 1, link: 'https://jira.example.com/browse/APP-201', note: 'Màn hình coupon sáng không đúng spec' },
  { ver: '7.4.0', app: 'CMS',         stt: 2, link: 'https://jira.example.com/browse/CMS-55',  note: 'Popup type mới không preview được' },
];

// ─── Build sheet chính ────────────────────────────────────────────────────────
async function buildSheet(wb) {
  const ws = wb.addWorksheet('Bug Links', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 2 }],
    properties: { defaultRowHeight: 20 },
  });

  // ── Thiết lập độ rộng cột ─────────────────────────────────────────────────
  COLS.forEach((c, i) => {
    ws.getColumn(i + 2).width = c.width;  // cột A (idx=1) dành cho Version label
  });
  ws.getColumn(1).width = 10;  // cột A = Version

  // ── Hàng 1: tiêu đề bảng ─────────────────────────────────────────────────
  ws.mergeCells('A1:E1');
  const title = ws.getCell('A1');
  title.value = 'TỔNG HỢP LINK BUG  —  Cập nhật: ' + new Date().toLocaleDateString('vi-VN');
  title.font  = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FF' + HDR_FG } };
  title.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + HDR_BG } };
  title.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 26;

  // ── Hàng 2: header cột ────────────────────────────────────────────────────
  ws.getRow(2).height = 22;
  setHeader(ws.getCell('A2'), 'Version', HDR_BG);
  COLS.forEach((c, i) => {
    setHeader(ws.getCell(2, i + 2), c.header, HDR_BG);
  });

  // ── AutoFilter từ hàng 2 ─────────────────────────────────────────────────
  ws.autoFilter = { from: { row: 2, column: 1 }, to: { row: 2, column: 5 } };

  // ── Dữ liệu: nhóm theo Version ───────────────────────────────────────────
  let currentRow = 3;

  VERSIONS.forEach((v, vIdx) => {
    const bgLight = VER_COLORS[vIdx % VER_COLORS.length];
    const bgDark  = VER_HDR_COLORS[vIdx % VER_HDR_COLORS.length];

    // Lấy các sample thuộc version này
    const sampleRows = SAMPLES.filter(s => s.ver === v.ver);
    const totalRows  = Math.max(sampleRows.length, 1) + NUM_BLANK_PER_VER;
    const startRow   = currentRow;
    const endRow     = currentRow + totalRows - 1;

    // Merge cột A (Version label) cho toàn bộ nhóm
    if (totalRows > 1) {
      ws.mergeCells(`A${startRow}:A${endRow}`);
    }
    const verCell = ws.getCell(`A${startRow}`);
    verCell.value = v.ver;
    verCell.font  = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF1A1A1A' } };
    verCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + bgDark } };
    verCell.alignment = { horizontal: 'center', vertical: 'middle' };
    verCell.border = { top: med(), left: med(), bottom: med(), right: med() };

    // Ghi các hàng trong nhóm
    for (let r = 0; r < totalRows; r++) {
      const rowIdx = currentRow + r;
      const data   = sampleRows[r] || {};
      ws.getRow(rowIdx).height = 20;

      // Cột B: App
      const appCell = ws.getCell(rowIdx, 2);
      const appVal  = data.app || '';
      setBody(appCell, appVal, bgLight, { align: 'center' });
      if (appVal && APP_COLOR[appVal]) {
        appCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF' + APP_COLOR[appVal] } };
      }

      // Cột C: STT
      const sttCell = ws.getCell(rowIdx, 3);
      setBody(sttCell, data.stt || '', bgLight, { align: 'center' });

      // Cột D: Link Bug (hyperlink nếu có)
      const linkCell = ws.getCell(rowIdx, 4);
      if (data.link) {
        linkCell.value = { text: data.link, hyperlink: data.link };
        linkCell.font  = { name: 'Calibri', size: 10, color: { argb: 'FF0563C1' }, underline: true };
        linkCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + bgLight } };
        linkCell.alignment = { vertical: 'middle', horizontal: 'left' };
        linkCell.border = cellBorder('thin');
      } else {
        setBody(linkCell, '', bgLight);
      }

      // Cột E: Ghi chú
      const noteCell = ws.getCell(rowIdx, 5);
      setBody(noteCell, data.note || '', bgLight);
    }

    currentRow += totalRows;
  });

  return ws;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const wb = new ExcelJS.Workbook();
  wb.creator  = 'QuynhNT';
  wb.created  = new Date();
  wb.modified = new Date();

  await buildSheet(wb);

  await wb.xlsx.writeFile(OUTPUT_FILE);
  console.log('✅  Đã tạo:', OUTPUT_FILE);
  console.log('    Cấu trúc: Version (nhóm) | App | STT | Link Bug | Ghi chú');
  console.log('    ' + VERSIONS.length + ' version blocks, mỗi block ' + NUM_BLANK_PER_VER + ' hàng trống sẵn');
}

main().catch(err => {
  console.error('❌  Lỗi:', err.message);
  process.exit(1);
});
