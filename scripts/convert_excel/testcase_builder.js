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

// --- Build sheet Summary (bám layout mẫu Push: lề cột A, label B:F) ----------
// Chuỗi công thức self-consistent (không bao giờ lệch):
//   Detail  -> tham chiếu '<sheet>'!G2..G6 (First) & H2..H6 (Last) của từng tab.
//   Total   -> SUM xuống các cột của Detail.
// Mỗi tab TC expose: G2/H2=Total test case, G3/H3=OK, G4/H4=NG, G5/H5=Pending,
// G6/H6=Skip (G=First time, H=Last time).
function buildSummary(ws, opts) {
  const { meta, devices, sheetMeta, styleCell } = opts;
  const LBL_C1 = 2, LBL_C2 = 6;   // label  B:F
  const colL = (n) => colLetter(n);

  // ■ Common information (rows 1-11) ------------------------------------------
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
    styleRange(ws, styleCell, r, 7, r, 17, { fillArgb: WHITE }, v); // value G:Q
    r++;
  });

  // --- Khai báo trước hình học để công thức tham chiếu chéo (forward ref OK) --
  // Detail summary cột: G=Created | First[H..L]=Total,OK,NG,Pending,Skip
  //                                 | Last[M..Q]=Total,OK,NG,Pending,Skip
  const CR = 7;                       // Created
  const F = { total: 8, ok: 9, ng: 10, pend: 11, skip: 12 };  // First  H..L
  const L = { total: 13, ok: 14, ng: 15, pend: 16, skip: 17 }; // Last   M..Q

  const rTotalHdr   = 13;             // ■ Total summary
  const rTotalTbl   = 14;             // header bảng (Item | First time | Last time)
  const rTF         = 15;             // dòng item đầu
  // Thứ tự item Total summary -> ánh xạ ra dòng cố định:
  const TI = { total: rTF, tested: rTF + 1, ok: rTF + 2, ng: rTF + 3, pend: rTF + 4, skip: rTF + 5, pTested: rTF + 6, pOK: rTF + 7, pNG: rTF + 8 };
  const rTotalEnd   = TI.pNG;         // = rTF + 8 (= 23)
  const rDetailHdr  = rTotalEnd + 2;  // ■ Detail summary (cách 1 dòng trống)
  const rDetailGrp  = rDetailHdr + 1; // group header
  const rDetailSub  = rDetailHdr + 2; // sub header
  const detailStart = rDetailHdr + 3;
  const detailEnd   = detailStart + sheetMeta.length - 1;

  // ■ Total summary -----------------------------------------------------------
  ws.getCell(rTotalHdr, 1).value = '■ Total summary';
  ws.getCell(rTotalHdr, 1).font = { ...FONT, bold: true };
  // header bảng: Item(B:F) | First time(G) | Last time(H)
  styleRange(ws, styleCell, rTotalTbl, LBL_C1, rTotalTbl, LBL_C2, { fillArgb: GRAY, center: true, bold: true }, 'Item');
  styleRange(ws, styleCell, rTotalTbl, 7, rTotalTbl, 7, { fillArgb: GRAY, center: true, bold: true }, 'First time');
  styleRange(ws, styleCell, rTotalTbl, 8, rTotalTbl, 8, { fillArgb: GRAY, center: true, bold: true }, 'Last time');

  // helper đặt 1 dòng item: label B:F + giá trị First(G) + Last(H)
  const sum = (col) => `SUM(${colL(col)}${detailStart}:${colL(col)}${detailEnd})`;
  const setItem = (rowR, label, firstFormula, lastFormula, isPct) => {
    styleRange(ws, styleCell, rowR, LBL_C1, rowR, LBL_C2, { fillArgb: GRAY }, label);
    styleRange(ws, styleCell, rowR, 7, rowR, 7, { fillArgb: WHITE, center: true }, { formula: firstFormula });
    styleRange(ws, styleCell, rowR, 8, rowR, 8, { fillArgb: WHITE, center: true }, { formula: lastFormula });
    if (isPct) { ws.getCell(rowR, 7).numFmt = '0%'; ws.getCell(rowR, 8).numFmt = '0%'; }
  };
  // số liệu: SUM xuống Detail
  setItem(TI.total, 'Total test case', sum(F.total), sum(L.total));
  setItem(TI.tested, 'Tested', `G${TI.ok}+G${TI.ng}+G${TI.pend}+G${TI.skip}`, `H${TI.ok}+H${TI.ng}+H${TI.pend}+H${TI.skip}`);
  setItem(TI.ok, 'OK', sum(F.ok), sum(L.ok));
  setItem(TI.ng, 'NG', sum(F.ng), sum(L.ng));
  setItem(TI.pend, 'Pending', sum(F.pend), sum(L.pend));
  setItem(TI.skip, 'Skip', sum(F.skip), sum(L.skip));
  // tỉ lệ %
  setItem(TI.pTested, '% Tested', `IF(G${TI.total}=0,"-",G${TI.tested}/G${TI.total})`, `IF(H${TI.total}=0,"-",H${TI.tested}/H${TI.total})`, true);
  setItem(TI.pOK, '% OK', `IF(G${TI.tested}=0,"-",G${TI.ok}/G${TI.tested})`, `IF(H${TI.tested}=0,"-",H${TI.ok}/H${TI.tested})`, true);
  setItem(TI.pNG, '% NG', `IF(G${TI.tested}=0,"-",G${TI.ng}/G${TI.tested})`, `IF(H${TI.tested}=0,"-",H${TI.ng}/H${TI.tested})`, true);

  // ■ Detail summary ----------------------------------------------------------
  ws.getCell(rDetailHdr, 1).value = '■ Detail summary';
  ws.getCell(rDetailHdr, 1).font = { ...FONT, bold: true };
  // group header (merge dọc 2 dòng): Sheet name/Function name | Created | First time | Last time
  styleRange(ws, styleCell, rDetailGrp, LBL_C1, rDetailSub, LBL_C2, { fillArgb: GRAY, center: true, bold: true }, 'Sheet name / Function name');
  styleRange(ws, styleCell, rDetailGrp, CR, rDetailSub, CR, { fillArgb: GRAY, center: true, bold: true }, 'Created');
  styleRange(ws, styleCell, rDetailGrp, F.total, rDetailGrp, F.skip, { fillArgb: GRAY, center: true, bold: true }, 'First time');
  styleRange(ws, styleCell, rDetailGrp, L.total, rDetailGrp, L.skip, { fillArgb: GRAY, center: true, bold: true }, 'Last time');
  // sub header
  const subs = ['Total', 'OK', 'NG', 'Pending', 'Skip'];
  subs.forEach((s, i) => styleRange(ws, styleCell, rDetailSub, F.total + i, rDetailSub, F.total + i, { fillArgb: GRAY, center: true, bold: true }, s));
  subs.forEach((s, i) => styleRange(ws, styleCell, rDetailSub, L.total + i, rDetailSub, L.total + i, { fillArgb: GRAY, center: true, bold: true }, s));
  // dữ liệu từng sheet
  r = detailStart;
  sheetMeta.forEach(m => {
    styleRange(ws, styleCell, r, LBL_C1, r, LBL_C2, { fillArgb: WHITE }, `${m.sheet} (${m.func})`);
    styleRange(ws, styleCell, r, CR, r, CR, { fillArgb: WHITE, center: true }, meta.creator);
    // First time: '<sheet>'!G2..G6
    ['G2', 'G3', 'G4', 'G5', 'G6'].forEach((cell, i) =>
      styleRange(ws, styleCell, r, F.total + i, r, F.total + i, { fillArgb: WHITE, center: true }, { formula: `'${m.sheet}'!${cell}` }));
    // Last time: '<sheet>'!H2..H6
    ['H2', 'H3', 'H4', 'H5', 'H6'].forEach((cell, i) =>
      styleRange(ws, styleCell, r, L.total + i, r, L.total + i, { fillArgb: WHITE, center: true }, { formula: `'${m.sheet}'!${cell}` }));
    r++;
  });

  // Cột: A lề mỏng | B:F label | G Created | H:Q số liệu
  ws.getColumn(1).width = 3;
  [2, 3, 4, 5, 6].forEach(c => ws.getColumn(c).width = 12);
  ws.getColumn(7).width = 12;
  [8, 9, 10, 11, 12, 13, 14, 15, 16, 17].forEach(c => ws.getColumn(c).width = 8);
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
