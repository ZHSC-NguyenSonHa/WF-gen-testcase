// =============================================================================
// testcase_builder.js — Reusable QA testcase Excel builder (style-cloned từ mẫu Push)
// -----------------------------------------------------------------------------
// Engine chung cho MỌI file testcase. Mỗi feature chỉ cần 1 file data nhỏ rồi gọi
// generateTestcase(config). Toàn bộ màu sắc / border / font được CLONE trực tiếp từ
// file mẫu Push nên không bao giờ bị mất format khi regenerate.
//
// Dùng:
//   const { generateTestcase } = require('./testcase_builder');
//   await generateTestcase({ functionName, creator, createDate, release, devices,
//                            sheetPrefix, guiSections, logicSections, output });
// =============================================================================

const ExcelJS = require('./node_modules/exceljs');

// --- Mặc định toàn cục (có thể override qua config) --------------------------
const DEFAULTS = {
  // Template chuẩn (canonical) — luôn tồn tại trong repo, dùng để clone style.
  template: 'C:\\Users\\Z03479\\Desktop\\manual_test\\Q\\Q\\Test Result\\1.0.0(Thư viện)\\App\\Base noti\\【APP】_Push.xlsx',
  templateSheet: 'Home_GUI',
  devices: ['iOS', 'Android'],
  team: 'Zapp',
  subCols: ['First', 'Date', 'Last', 'Date', 'Tester'],
  colWidths: { no: 5, testObject: 24, subTestObject: 28, testType: 9, input: 50, output: 55, result: 8, memo: 20, status: 12 },
};

const GRAY = 'FFC0C0C0';
const GRAY2 = 'FFBFBFBF';
const WHITE = 'FFFFFFFF';
const FONT = { name: 'Times New Roman', size: 12, color: { argb: 'FF000000' } };

const colLetter = (n) => { let s = ''; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };

// --- Style capture: clone style thật từ file mẫu ----------------------------
function captureStyles(ws) {
  const cloneStyle = (cell) => JSON.parse(JSON.stringify(cell.style || {}));
  return {
    gray:    cloneStyle(ws.getCell('A2')),  // label xám, trái, có border
    grayC:   cloneStyle(ws.getCell('A8')),  // header xám bold center
    subHdr:  cloneStyle(ws.getCell('G9')),  // sub-header xám center
    banner:  cloneStyle(ws.getCell('G7')),  // banner 'Test Result'
    whiteV:  cloneStyle(ws.getCell('E1')),  // value trắng, trái
    whiteC:  cloneStyle(ws.getCell('A11')), // trắng center (cột No)
    whiteL:  cloneStyle(ws.getCell('B11')), // trắng trái wrap (text data)
    section: cloneStyle(ws.getCell('A10')), // dòng tiêu đề section
    result:  cloneStyle(ws.getCell('G11')), // cột kết quả (hồng)
    memo:    cloneStyle(ws.getCell('Q11')), // cell memo / status
  };
}

function makeStyleCell(S) {
  return function styleCell(cell, { fillArgb, bold = false, center = false, role } = {}) {
    let base;
    if (role) base = S[role];
    else if (fillArgb === GRAY || fillArgb === GRAY2) base = center ? S.grayC : S.gray;
    else base = center ? S.whiteC : S.whiteL;
    cell.style = JSON.parse(JSON.stringify(base || {}));
    if (bold) cell.font = { ...(cell.font || {}), bold: true };
  };
}

// Style TẤT CẢ cell trong vùng (rồi merge) — đảm bảo border đủ 4 cạnh.
// Excel chỉ vẽ viền merge từ các cạnh ngoài của cell con; nếu chỉ style anchor
// thì viền phải/dưới bị mất → phải style mọi cell trước khi merge.
function styleRange(ws, styleCell, r1, c1, r2, c2, opts, value) {
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) styleCell(ws.getCell(r, c), opts);
  }
  if (value !== undefined) ws.getCell(r1, c1).value = value;
  if (r1 !== r2 || c1 !== c2) ws.mergeCells(r1, c1, r2, c2);
}

// --- Build 1 sheet testcase (GUI hoặc Logic) --------------------------------
function buildTcSheet(ws, opts) {
  const { funcName, testType, sections, devices, subCols, colWidths, meta, styleCell } = opts;
  const NCOL = 6 + devices.length * subCols.length + 2; // +2 cho Memo, Status

  let total = 0; sections.forEach(s => total += s.rows.length);
  const DATA_START = 11;
  const DATA_END = DATA_START + total + sections.length + 10;
  const firstCols = devices.map((_, di) => colLetter(7 + di * subCols.length));
  const lastCols = devices.map((_, di) => colLetter(7 + di * subCols.length + 2));
  const countMark = (cols, mark) => ({ formula: cols.map(c => `COUNTIF($${c}$${DATA_START}:$${c}$${DATA_END},"${mark}")`).join('+') });
  const totalF = () => ({ formula: `COUNTIF($D$${DATA_START}:$D$${DATA_END},"${testType}")` });

  // Info block trái (A:D label / E value) + summary phải (F label / G First / H Last)
  const leftLabels = ['Function name', 'Creator', 'Create Date', 'Tester', 'Fist time test date', 'Final time test date'];
  const leftValues = [funcName, meta.creator, meta.createDate, '', '', ''];
  const rightLabels = ['', 'Total test case', 'OK', 'NG', 'Pending', 'Skip'];
  const marks = [null, null, 'OK', 'NG', '△', '-'];
  for (let r = 1; r <= 6; r++) {
    styleRange(ws, styleCell, r, 1, r, 4, { fillArgb: GRAY }, leftLabels[r - 1]);
    styleRange(ws, styleCell, r, 5, r, 5, { fillArgb: WHITE }, leftValues[r - 1]);
    if (r === 1) {
      styleRange(ws, styleCell, 1, 6, 1, 6, { fillArgb: GRAY }, '');
      styleRange(ws, styleCell, 1, 7, 1, 7, { fillArgb: GRAY2, center: true, bold: true }, 'First');
      styleRange(ws, styleCell, 1, 8, 1, 8, { fillArgb: GRAY2, center: true, bold: true }, 'Last');
    } else {
      styleRange(ws, styleCell, r, 6, r, 6, { fillArgb: GRAY }, rightLabels[r - 1]);
      const firstVal = (r === 2) ? totalF() : countMark(firstCols, marks[r - 1]);
      const lastVal = (r === 2) ? totalF() : countMark(lastCols, marks[r - 1]);
      styleRange(ws, styleCell, r, 7, r, 7, { fillArgb: WHITE, center: true }, firstVal);
      styleRange(ws, styleCell, r, 8, r, 8, { fillArgb: WHITE, center: true }, lastVal);
    }
  }

  // Row 7: banner Test Result — tách MỖI device 1 banner (bám mẫu Push)
  devices.forEach((_, di) => {
    const base = 7 + di * subCols.length;
    styleRange(ws, styleCell, 7, base, 7, base + subCols.length - 1, { fillArgb: GRAY, center: true, bold: true }, 'Test Result(テスト結果)');
  });
  // Memo & Status headers (merge dọc rows 7-9)
  styleRange(ws, styleCell, 7, NCOL - 1, 9, NCOL - 1, { fillArgb: GRAY, center: true, bold: true }, 'Memo');
  styleRange(ws, styleCell, 7, NCOL, 9, NCOL, { fillArgb: GRAY, center: true, bold: true }, 'Status');

  // Row 8-9: header cố định
  const fixedHdr = ['No', 'Test Object', 'Sub Test Object', 'Test Type', 'Input(Condition)', 'Output(Expect result)'];
  fixedHdr.forEach((h, i) => { styleRange(ws, styleCell, 8, i + 1, 9, i + 1, { fillArgb: GRAY, center: true, bold: true }, h); });
  devices.forEach((d, di) => {
    const base = 7 + di * subCols.length;
    styleRange(ws, styleCell, 8, base, 8, base + subCols.length - 1, { fillArgb: GRAY, center: true, bold: true }, d);
    subCols.forEach((sc, k) => { styleRange(ws, styleCell, 9, base + k, 9, base + k, { fillArgb: GRAY, center: true }, sc); });
  });

  // Data: section title + rows, merge Test Object trùng trong cùng cụm
  let no = 1; let r = 10;
  sections.forEach(sec => {
    styleRange(ws, styleCell, r, 1, r, NCOL, { role: 'section', bold: true }, sec.title);
    r++;
    let i = 0;
    while (i < sec.rows.length) {
      const startR = r; const to = sec.rows[i].to; let j = i;
      while (j < sec.rows.length && sec.rows[j].to === to) {
        const row = sec.rows[j];
        for (let c = 1; c <= NCOL; c++) {
          if (c >= 7 && c <= NCOL - 2) styleCell(ws.getCell(r, c), { role: 'result' });
          else if (c > NCOL - 2) styleCell(ws.getCell(r, c), { role: 'memo' });
          else styleCell(ws.getCell(r, c), { fillArgb: WHITE, center: (c === 1 || c === 4) });
        }
        ws.getCell(r, 1).value = no++;
        ws.getCell(r, 2).value = (j === i) ? to : '';
        ws.getCell(r, 3).value = row.sub;
        ws.getCell(r, 4).value = testType;
        ws.getCell(r, 5).value = row.input;
        ws.getCell(r, 6).value = row.output;
        r++; j++;
      }
      if (j - i > 1) ws.mergeCells(startR, 2, r - 1, 2);
      i = j;
    }
  });

  // Column widths
  ws.columns.forEach((col, idx) => {
    if (idx === 0) col.width = colWidths.no;
    else if (idx === 1) col.width = colWidths.testObject;
    else if (idx === 2) col.width = colWidths.subTestObject;
    else if (idx === 3) col.width = colWidths.testType;
    else if (idx === 4) col.width = colWidths.input;
    else if (idx === 5) col.width = colWidths.output;
    else if (idx === NCOL - 2) col.width = colWidths.memo;
    else if (idx === NCOL - 1) col.width = colWidths.status;
    else col.width = colWidths.result;
  });
  ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 9 }];
  return total;
}

// --- Build sheet Summary (bám layout mẫu Push: lề cột A, label B:F, value G:N) ---
function buildSummary(ws, opts) {
  const { meta, devices, sheetMeta, styleCell } = opts;
  const LBL_C1 = 2, LBL_C2 = 6;   // label  B:F
  const VAL_C1 = 7, VAL_C2 = 14;  // value  G:N
  const NUM_C1 = 7;               // cột số đầu tiên (Detail)

  // ■ Common information ------------------------------------------------------
  ws.getCell('A1').value = '■ Common information';
  ws.getCell('A1').font = { ...FONT, bold: true };
  const common = [
    ['Function name / Screen name', meta.functionName],
    ['Update PIC', meta.creator],
    ['Create duration', meta.createDate],
    ['Reviewer', ''],
    ['Execute PIC', ''],
    ['Test execute duration', ''],
    ['Test device', devices.join(', ')],
    ['OS type / Browser name', '-'],
    ['OS / browser version', '-'],
    ['Team', meta.team],
  ];
  let r = 2;
  common.forEach(([k, v]) => {
    styleRange(ws, styleCell, r, LBL_C1, r, LBL_C2, { fillArgb: GRAY }, k);
    styleRange(ws, styleCell, r, VAL_C1, r, VAL_C2, { fillArgb: WHITE }, v);
    r++;
  });
  r++; // dòng trống

  // Tính trước vị trí Detail để Total SUM tham chiếu (forward ref hợp lệ trong Excel)
  const nTotalItems = 4; // Total test case, OK, NG, Pending
  const rTotalHdr = r;                       // ■ Total summary
  const rTotalFirst = rTotalHdr + 1;         // dòng item đầu
  const rDetailHdr = rTotalFirst + nTotalItems + 1; // ■ Detail summary (cách 1 dòng trống)
  const rDetailTableHdr = rDetailHdr + 1;
  const detailStart = rDetailTableHdr + 1;
  const detailEnd = detailStart + sheetMeta.length - 1;

  // ■ Total summary -----------------------------------------------------------
  ws.getCell(rTotalHdr, 1).value = '■ Total summary';
  ws.getCell(rTotalHdr, 1).font = { ...FONT, bold: true };
  const colL = (n) => colLetter(n);
  const totItems = [
    ['Total test case', NUM_C1],     // G của Detail
    ['OK', NUM_C1 + 1],              // H
    ['NG', NUM_C1 + 2],              // I
    ['Pending', NUM_C1 + 3],         // J
  ];
  r = rTotalFirst;
  totItems.forEach(([k, cIdx]) => {
    styleRange(ws, styleCell, r, LBL_C1, r, LBL_C2, { fillArgb: GRAY }, k);
    styleRange(ws, styleCell, r, VAL_C1, r, VAL_C2, { fillArgb: WHITE, center: true },
      { formula: `SUM(${colL(cIdx)}${detailStart}:${colL(cIdx)}${detailEnd})` });
    r++;
  });

  // ■ Detail summary ----------------------------------------------------------
  ws.getCell(rDetailHdr, 1).value = '■ Detail summary';
  ws.getCell(rDetailHdr, 1).font = { ...FONT, bold: true };
  // header: Sheet name / Function name (B:F) | Total | OK | NG | Pending | Tester
  styleRange(ws, styleCell, rDetailTableHdr, LBL_C1, rDetailTableHdr, LBL_C2, { fillArgb: GRAY, center: true, bold: true }, 'Sheet name / Function name');
  ['Total', 'OK', 'NG', 'Pending', 'Tester'].forEach((h, i) =>
    styleRange(ws, styleCell, rDetailTableHdr, NUM_C1 + i, rDetailTableHdr, NUM_C1 + i, { fillArgb: GRAY, center: true, bold: true }, h));
  r = detailStart;
  sheetMeta.forEach(m => {
    styleRange(ws, styleCell, r, LBL_C1, r, LBL_C2, { fillArgb: WHITE }, `${m.sheet} (${m.func})`);
    const nums = [
      { formula: `'${m.sheet}'!G2` },
      { formula: `'${m.sheet}'!G3` },
      { formula: `'${m.sheet}'!G4` },
      { formula: `'${m.sheet}'!G5` },
      meta.creator,
    ];
    nums.forEach((v, i) => styleRange(ws, styleCell, r, NUM_C1 + i, r, NUM_C1 + i, { fillArgb: WHITE, center: (i <= 3) }, v));
    r++;
  });

  // Cột: A lề mỏng, B:F label, G:N value
  ws.getColumn(1).width = 3;
  [2, 3, 4, 5, 6].forEach(c => ws.getColumn(c).width = 14);
  [7, 8, 9, 10, 11, 12, 13, 14].forEach(c => ws.getColumn(c).width = 11);
}

/**
 * Sinh 1 file testcase Excel chuẩn (Summary + <prefix>_GUI + <prefix>_LOGIC).
 * @param {Object} config
 * @param {string} config.functionName  Tên function/feature (vd 'Popup Claim')
 * @param {string} config.creator       Người tạo
 * @param {string} config.createDate    Ngày tạo (yyyy-mm-dd)
 * @param {string} config.release       Release/version
 * @param {string} [config.team]        Team (default 'Zapp')
 * @param {string[]} [config.devices]   Danh sách device (default ['iOS','Android'])
 * @param {string} config.sheetPrefix   Tiền tố sheet (vd 'Popup_Claim' -> Popup_Claim_GUI/LOGIC)
 * @param {Object} config.guiSection    1 section GUI { title, rows:[{to,sub,input,output}] }
 *                 hoặc config.guiSections [section,...]
 * @param {Object[]} config.logicSections Mảng section Logic
 * @param {string} config.output        Đường dẫn file .xlsx output
 * @param {string} [config.template]    File mẫu để clone style (default Push)
 * @returns {Promise<{gui:number, logic:number, output:string}>}
 */
async function generateTestcase(config) {
  const cfg = { ...DEFAULTS, ...config };
  const devices = cfg.devices;
  const subCols = cfg.subCols;
  const colWidths = { ...DEFAULTS.colWidths, ...(cfg.colWidths || {}) };
  const guiSections = cfg.guiSections || (cfg.guiSection ? [cfg.guiSection] : []);
  const logicSections = cfg.logicSections || [];
  if (!cfg.output) throw new Error('generateTestcase: thiếu config.output');
  if (!cfg.sheetPrefix) throw new Error('generateTestcase: thiếu config.sheetPrefix');

  // Clone style từ mẫu
  const tplWb = new ExcelJS.Workbook();
  await tplWb.xlsx.readFile(cfg.template);
  const S = captureStyles(tplWb.getWorksheet(cfg.templateSheet));
  const styleCell = makeStyleCell(S);

  const meta = {
    functionName: cfg.functionName,
    creator: cfg.creator,
    createDate: cfg.createDate,
    release: cfg.release,
    team: cfg.team,
  };

  const wb = new ExcelJS.Workbook();
  const wsSum = wb.addWorksheet('Summary');
  const guiName = `${cfg.sheetPrefix}_GUI`;
  const logicName = `${cfg.sheetPrefix}_LOGIC`;
  const wsGui = wb.addWorksheet(guiName);
  const wsLogic = wb.addWorksheet(logicName);

  const guiTotal = buildTcSheet(wsGui, { funcName: cfg.functionName, testType: 'GUI', sections: guiSections, devices, subCols, colWidths, meta, styleCell });
  const logicTotal = buildTcSheet(wsLogic, { funcName: cfg.functionName, testType: 'Logic', sections: logicSections, devices, subCols, colWidths, meta, styleCell });
  buildSummary(wsSum, {
    meta, devices, styleCell,
    sheetMeta: [
      { sheet: guiName, func: `${cfg.functionName} - GUI`, total: guiTotal },
      { sheet: logicName, func: `${cfg.functionName} - Logic`, total: logicTotal },
    ],
  });

  await wb.xlsx.writeFile(cfg.output);
  return { gui: guiTotal, logic: logicTotal, output: cfg.output };
}

module.exports = { generateTestcase, DEFAULTS };
