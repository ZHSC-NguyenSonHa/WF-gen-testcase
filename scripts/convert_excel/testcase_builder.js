// =============================================================================
// testcase_builder.js — Reusable QA testcase Excel builder (COPY+FILL approach)
// -----------------------------------------------------------------------------
// Engine chung cho MỌI file testcase. Mỗi feature chỉ cần 1 file data nhỏ rồi gọi
// generateTestcase(config). Hoạt động theo nguyên tắc Copy+Fill:
//   1. Load canonical template (templates/testcase/app-testcase-template.xlsx)
//   2. Clone Home_GUI thành <prefix>_GUI và <prefix>_LOGIC (giữ NGUYÊN style/border/font/formula)
//   3. Clear data rows cũ (row 10+) trong 2 sheet vừa clone
//   4. Fill data mới vào, sử dụng style của row 10 (section) và row 11 (data) làm anchor
//   5. Update Summary common info + detail rows trỏ tới 2 sheet mới
//   6. Remove các sheet phụ của template gốc
//
// Dùng:
//   const { generateTestcase } = require('./testcase_builder');
//   await generateTestcase({ functionName, creator, createDate, release, devices,
//                            sheetPrefix, guiSection, logicSections, output });
// =============================================================================

const path = require('path');
const ExcelJS = require('exceljs');

// --- Mặc định toàn cục (có thể override qua config) --------------------------
const DEFAULTS = {
  // Canonical template (repo-relative, cross-machine safe)
  template: path.resolve(__dirname, '..', '..', 'templates', 'testcase', 'app-testcase-template.xlsx'),
  templateGuiSheet: 'Home_GUI',
  templateSummarySheet: 'Summary',
  // Sheets phụ của template gốc — sẽ bị remove sau khi clone
  templateExtraSheets: ['Home_GUI', 'Push History_GUI', 'Push detail_GUI', 'Push_FN_Matrix'],
  devices: ['iOS', 'Android'],
  team: 'Zapp',
  // Anchor rows trong template (xem templates/testcase/README.md)
  SECTION_ROW: 10,   // row mẫu cho section title (merged A:R)
  DATA_ROW: 11,      // row mẫu cho 1 data row
  NCOL: 18,          // tổng số cột A-R (2 device × 5 subCol + 6 fixed + 2 memo/status)
};

// =============================================================================
// Helpers
// =============================================================================

// Clone 1 sheet trong cùng workbook (giữ style, formula, merge, view, column width)
function cloneSheet(wb, srcName, destName) {
  const src = wb.getWorksheet(srcName);
  if (!src) throw new Error(`Source sheet "${srcName}" not found in workbook`);
  const dest = wb.addWorksheet(destName);

  if (src.properties) dest.properties = JSON.parse(JSON.stringify(src.properties));
  if (src.views) dest.views = JSON.parse(JSON.stringify(src.views));
  if (src.pageSetup) dest.pageSetup = JSON.parse(JSON.stringify(src.pageSetup));

  // Column widths + styles
  if (src.columns) {
    src.columns.forEach((col, idx) => {
      if (!col) return;
      const nc = dest.getColumn(idx + 1);
      if (col.width != null) nc.width = col.width;
      if (col.hidden) nc.hidden = col.hidden;
      if (col.style) nc.style = JSON.parse(JSON.stringify(col.style));
    });
  }

  // Rows + cells (values + styles + formulas)
  src.eachRow({ includeEmpty: true }, (row, rowNum) => {
    const nr = dest.getRow(rowNum);
    if (row.height != null) nr.height = row.height;
    row.eachCell({ includeEmpty: true }, (cell, colNum) => {
      const nc = nr.getCell(colNum);
      if (cell.formula) {
        nc.value = { formula: cell.formula, result: cell.result };
      } else if (cell.value !== null && cell.value !== undefined) {
        nc.value = cell.value;
      }
      if (cell.style) nc.style = JSON.parse(JSON.stringify(cell.style));
    });
  });

  // Merges (src.model.merges là mảng string vd ["A10:R10","A11:A12"])
  if (src.model && Array.isArray(src.model.merges)) {
    src.model.merges.forEach((m) => {
      try { dest.mergeCells(m); } catch (_) { /* ignore overlap */ }
    });
  }
  return dest;
}

// Capture style của các cell trong 1 row (cols 1..NCOL) — dùng làm anchor để fill
function captureRowStyles(ws, rowNum, ncol) {
  const styles = [];
  const row = ws.getRow(rowNum);
  for (let c = 1; c <= ncol; c++) {
    const cell = row.getCell(c);
    styles.push(cell.style ? JSON.parse(JSON.stringify(cell.style)) : {});
  }
  return styles;
}

// Clear toàn bộ row >= startRow (unmerge các vùng merge bị ảnh hưởng + splice rows)
function clearFromRow(ws, startRow) {
  // Unmerge mọi vùng có start row >= startRow
  if (ws.model && Array.isArray(ws.model.merges)) {
    const toRemove = ws.model.merges.slice().filter((m) => {
      const match = String(m).match(/^[A-Z]+(\d+):[A-Z]+\d+$/);
      return match && parseInt(match[1], 10) >= startRow;
    });
    toRemove.forEach((m) => {
      try { ws.unMergeCells(m); } catch (_) { /* ignore */ }
    });
  }
  const lastRow = ws.actualRowCount;
  if (lastRow >= startRow) {
    ws.spliceRows(startRow, lastRow - startRow + 1);
  }
}

// Apply 1 mảng style (đã capture) lên row rowNum
function applyRowStyle(ws, rowNum, styles) {
  const row = ws.getRow(rowNum);
  for (let c = 0; c < styles.length; c++) {
    row.getCell(c + 1).style = JSON.parse(JSON.stringify(styles[c]));
  }
}

// =============================================================================
// Fill logic
// =============================================================================

function updateSheetMetadata(ws, meta, devices) {
  ws.getCell('E1').value = meta.functionName;
  ws.getCell('E2').value = meta.creator;
  ws.getCell('E3').value = meta.createDate;
  // Device names (G8 = device1, L8 = device2) — chỉ override nếu cell tồn tại trong template
  if (devices[0]) ws.getCell('G8').value = devices[0];
  if (devices[1]) ws.getCell('L8').value = devices[1];
}

function fillSheet(ws, sections, testType, anchors) {
  const { sectionStyles, dataStyles, sectionRow, ncol } = anchors;

  // Clear template data rows từ row 10 trở đi
  clearFromRow(ws, sectionRow);

  let r = sectionRow;
  let no = 1;
  let total = 0;
  let firstDataRow = null;
  let lastDataRow = null;

  for (const section of sections) {
    // --- Section title row ---
    applyRowStyle(ws, r, sectionStyles);
    ws.getCell(r, 1).value = section.title;
    try { ws.mergeCells(r, 1, r, ncol); } catch (_) { /* ignore */ }
    r++;

    // --- Data rows (group consecutive same `to` để merge col B) ---
    let i = 0;
    while (i < section.rows.length) {
      const startR = r;
      const currentTo = section.rows[i].to;
      let j = i;
      while (j < section.rows.length && section.rows[j].to === currentTo) {
        const rowData = section.rows[j];
        applyRowStyle(ws, r, dataStyles);
        // Col A: số thứ tự trực tiếp (plain number, không dùng formula để tránh exceljs quirks)
        ws.getCell(r, 1).value = no++;
        ws.getCell(r, 2).value = (j === i) ? currentTo : '';
        ws.getCell(r, 3).value = rowData.sub || '';
        ws.getCell(r, 4).value = testType;
        ws.getCell(r, 5).value = rowData.input || '';
        ws.getCell(r, 6).value = rowData.output || '';
        if (firstDataRow === null) firstDataRow = r;
        lastDataRow = r;
        r++; j++;
        total++;
      }
      if (j - i > 1) {
        try { ws.mergeCells(startR, 2, r - 1, 2); } catch (_) { /* */ }
      }
      i = j;
    }
  }

  // Apply data validations + date format cho TOÀN BỘ data rows
  if (firstDataRow !== null && lastDataRow !== null) {
    applyDataValidations(ws, firstDataRow, lastDataRow);
  }
  return total;
}

// Apply data validations (dropdowns) + date number format cho data rows.
//   - Result columns G/I/L/N: dropdown "OK,NG,-,△"
//   - Test Type col D: dropdown "GUI,LOGIC" (đã fill vào nhưng vẫn cho dropdown để user sửa dễ)
//   - Status col R: dropdown "Add New,Update,Delete,Reuse,Pending"
//   - Date columns H/J/M/O: validation type=date + numFmt 'yyyy/mm/dd'
//
// Lưu ý: Excel desktop KHÔNG có native date picker per cell.
// Validation type=date chỉ validate input, không hiện picker.
// Khuyến nghị: Ctrl+; để chèn today's date, hoặc cài Office Add-in
// 'Mini Calendar and Date Picker' (Insert > Get Add-ins).
function applyDataValidations(ws, firstRow, lastRow) {
  const colLetter = (n) => {
    let s = '';
    while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
    return s;
  };
  const range = (col) => `${colLetter(col)}${firstRow}:${colLetter(col)}${lastRow}`;

  const RESULT_COLS = [7, 9, 12, 14];   // G, I, L, N
  const DATE_COLS = [8, 10, 13, 15];     // H, J, M, O
  const TYPE_COL = 4;                    // D
  const STATUS_COL = 18;                 // R

  // 1. Result dropdowns
  for (const c of RESULT_COLS) {
    ws.dataValidations.add(range(c), {
      type: 'list',
      allowBlank: true,
      showErrorMessage: true,
      formulae: ['"OK,NG,-,△"'],
    });
  }

  // 2. Test Type dropdown
  ws.dataValidations.add(range(TYPE_COL), {
    type: 'list',
    allowBlank: true,
    formulae: ['"GUI,LOGIC"'],
  });

  // 3. Status dropdown
  ws.dataValidations.add(range(STATUS_COL), {
    type: 'list',
    allowBlank: true,
    showErrorMessage: true,
    formulae: ['"Add New,Update,Delete,Reuse,Pending"'],
  });

  // 4. Date columns: numFmt + date validation (soft — chỉ format hiển thị)
  // LƯU Ý: Excel desktop KHÔNG có native date picker per cell.
  // Recommend: cài Office Add-in "Mini Calendar and Date Picker" (Insert > Get Add-ins),
  // hoặc dùng phím tắt Ctrl+; để chèn ngày hôm nay.
  for (const c of DATE_COLS) {
    for (let row = firstRow; row <= lastRow; row++) {
      const cell = ws.getCell(row, c);
      cell.numFmt = 'yyyy/mm/dd';
    }
    // Dùng Date object (exceljs serialize đúng), không dùng string formula
    ws.dataValidations.add(range(c), {
      type: 'date',
      operator: 'greaterThanOrEqual',
      allowBlank: true,
      showErrorMessage: true,
      errorTitle: 'Sai định dạng',
      error: 'Vui lòng nhập ngày hợp lệ (Ctrl+; để chèn today)',
      formulae: [new Date(2000, 0, 1)],
    });
  }
}

// Cập nhật Summary: common info (rows 2-11) + detail rows (28+) trỏ tới sheet mới
// LƯU Ý: HÀM NÀY PHẢI CHẠY TRƯỚC KHI REMOVE CÁC TEMPLATE EXTRA SHEETS,
// nếu không exceljs sẽ tự rewrite mọi formula ref tới sheet đã xoá thành #REF!,
// làm hỏng cả Total summary (rows 15-23) vì chúng ref cột V/W/AB của detail rows.
function updateSummary(ws, meta, devices, sheets) {
  // Common information (giữ template merges, chỉ thay value)
  ws.getCell('G2').value = meta.functionName;
  ws.getCell('G3').value = meta.creator;
  ws.getCell('G4').value = meta.createDate;
  ws.getCell('G8').value = devices.join(', ');
  ws.getCell('G11').value = meta.team || 'Zapp';

  // Capture style row 28 (template's first detail row) làm anchor TRƯỚC khi splice
  const detailStyles = captureRowStyles(ws, 28, 32); // cột A..AF (32 cols)

  // Sửa bổ sung các #REF! cố hữu trong template Total summary
  // (template gốc có I22=IF(I17=0,"-",#REF!/I17) — dọn luôn)
  const cellI22 = ws.getCell('I22');
  if (cellI22.formula && /#REF!/.test(cellI22.formula)) {
    cellI22.value = { formula: `IF(I17=0,"-",I18/I17)`, result: 0 };
  }

  // Unmerge merges trong row 28+ (Detail summary data rows)
  if (ws.model && Array.isArray(ws.model.merges)) {
    ws.model.merges.slice().forEach((m) => {
      const match = String(m).match(/^[A-Z]+(\d+):[A-Z]+\d+$/);
      if (match && parseInt(match[1], 10) >= 28) {
        try { ws.unMergeCells(m); } catch (_) { /* */ }
      }
    });
  }

  // Tìm row cuối hiện có trong Detail summary để biên độ clear/restyle
  let lastDetailRow = 28;
  ws.eachRow({ includeEmpty: false }, (_row, num) => {
    if (num > lastDetailRow) lastDetailRow = num;
  });
  // Bảo đảm có ít nhất bằng số sheets cần fill
  if (lastDetailRow < 27 + sheets.length) lastDetailRow = 27 + sheets.length;

  // Xóa TRIỆT ĐỂ value từ row 28 đến lastDetailRow (spliceRows của exceljs broken)
  for (let num = 28; num <= lastDetailRow; num++) {
    const row = ws.getRow(num);
    row.eachCell({ includeEmpty: false }, (cell) => {
      cell.value = null;
    });
  }

  // Re-apply UNIFORM detailStyles (row 28 anchor) cho TẤT CẢ rows 28..lastDetailRow
  // để border đồng đều, không bị "lỗi thiếu border" do template gốc styling không đều.
  for (let num = 28; num <= lastDetailRow; num++) {
    for (let c = 0; c < detailStyles.length; c++) {
      ws.getRow(num).getCell(c + 1).style = JSON.parse(JSON.stringify(detailStyles[c]));
    }
    // Apply merges B:F + G:K + L:S (Function name span) cho mọi row để border liền mạch
    try { ws.mergeCells(num, 2, num, 6); } catch (_) { /* */ }
    try { ws.mergeCells(num, 7, num, 11); } catch (_) { /* */ }
    try { ws.mergeCells(num, 12, num, 19); } catch (_) { /* */ }
  }

  // Fill 2 detail rows mới cho <prefix>_GUI và <prefix>_LOGIC
  let r = 28;
  for (const s of sheets) {
    // B = Sheet name, G = Function/screen, T = Created Tester, U/AA = First/Last Tester
    ws.getCell(r, 2).value = s.sheet;
    ws.getCell(r, 7).value = s.func;
    ws.getCell(r, 20).value = meta.creator;    // T = Created (Tester)
    ws.getCell(r, 21).value = meta.creator;    // U = First time Tester
    ws.getCell(r, 27).value = meta.creator;    // AA = Last time Tester
    // V/W/X/Y/Z = Total/OK/NG/N-A/Pending (First device)
    ws.getCell(r, 22).value = { formula: `'${s.sheet}'!G2`, result: 0 };
    ws.getCell(r, 23).value = { formula: `'${s.sheet}'!G3`, result: 0 };
    ws.getCell(r, 24).value = { formula: `'${s.sheet}'!G4`, result: 0 };
    ws.getCell(r, 25).value = { formula: `'${s.sheet}'!G6`, result: 0 };
    ws.getCell(r, 26).value = { formula: `'${s.sheet}'!G5`, result: 0 };
    // AB/AC/AD/AE/AF = Total/OK/NG/N-A/Pending (Last device)
    ws.getCell(r, 28).value = { formula: `'${s.sheet}'!H2`, result: 0 };
    ws.getCell(r, 29).value = { formula: `'${s.sheet}'!H3`, result: 0 };
    ws.getCell(r, 30).value = { formula: `'${s.sheet}'!H4`, result: 0 };
    ws.getCell(r, 31).value = { formula: `'${s.sheet}'!H6`, result: 0 };
    ws.getCell(r, 32).value = { formula: `'${s.sheet}'!H5`, result: 0 };
    r++;
  }
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Sinh 1 file testcase Excel chuẩn (Summary + <prefix>_GUI + <prefix>_LOGIC).
 * Copy template canonical rồi fill data mới — giữ NGUYÊN màu/border/font/formula.
 *
 * @param {Object} config
 * @param {string} config.functionName  Tên function/feature (vd 'Popup Claim')
 * @param {string} config.creator       Người tạo
 * @param {string} config.createDate    Ngày tạo (yyyy-mm-dd)
 * @param {string} config.release       Release/version
 * @param {string} [config.team]        Team (default 'Zapp')
 * @param {string[]} [config.devices]   Danh sách device (default ['iOS','Android'])
 * @param {string} config.sheetPrefix   Tiền tố sheet (vd 'Popup_Claim' -> Popup_Claim_GUI/LOGIC)
 * @param {Object} [config.guiSection]  1 section GUI {title, rows:[{to,sub,input,output}]}
 * @param {Object[]} [config.guiSections] Hoặc nhiều section GUI
 * @param {Object[]} config.logicSections Mảng section Logic
 * @param {string} config.output        Đường dẫn file .xlsx output
 * @param {string} [config.template]    File mẫu để clone (default canonical app template)
 * @returns {Promise<{gui:number, logic:number, output:string}>}
 */
async function generateTestcase(config) {
  const cfg = { ...DEFAULTS, ...config };
  const devices = cfg.devices;
  const guiSections = cfg.guiSections || (cfg.guiSection ? [cfg.guiSection] : []);
  const logicSections = cfg.logicSections || [];
  if (!cfg.output) throw new Error('generateTestcase: thiếu config.output');
  if (!cfg.sheetPrefix) throw new Error('generateTestcase: thiếu config.sheetPrefix');
  if (!guiSections.length) throw new Error('generateTestcase: thiếu guiSection/guiSections');
  if (!logicSections.length) throw new Error('generateTestcase: thiếu logicSections');

  // 1. Load template
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(cfg.template);

  const tplGui = wb.getWorksheet(cfg.templateGuiSheet);
  if (!tplGui) throw new Error(`Template sheet "${cfg.templateGuiSheet}" not found in ${cfg.template}`);

  // 2. Capture anchor styles từ template Home_GUI (TRƯỚC mọi modification)
  const sectionStyles = captureRowStyles(tplGui, cfg.SECTION_ROW, cfg.NCOL);
  const dataStyles = captureRowStyles(tplGui, cfg.DATA_ROW, cfg.NCOL);
  const anchors = {
    sectionStyles, dataStyles,
    sectionRow: cfg.SECTION_ROW, ncol: cfg.NCOL,
  };

  // 3. Clone Home_GUI thành 2 sheet mới
  const guiName = `${cfg.sheetPrefix}_GUI`;
  const logicName = `${cfg.sheetPrefix}_LOGIC`;
  const guiWs = cloneSheet(wb, cfg.templateGuiSheet, guiName);
  const logicWs = cloneSheet(wb, cfg.templateGuiSheet, logicName);

  // 4. Fill metadata + data (TRƯỚC khi remove template sheets)
  const meta = {
    functionName: cfg.functionName,
    creator: cfg.creator,
    createDate: cfg.createDate,
    release: cfg.release,
    team: cfg.team || DEFAULTS.team,
  };
  updateSheetMetadata(guiWs, meta, devices);
  const guiTotal = fillSheet(guiWs, guiSections, 'GUI', anchors);
  updateSheetMetadata(logicWs, meta, devices);
  const logicTotal = fillSheet(logicWs, logicSections, 'Logic', anchors);

  // 5. Summary: update common info + detail rows (TRƯỚC khi remove template sheets,
  //    nếu không exceljs sẽ auto-rewrite mọi formula ref → #REF! làm hỏng Total summary)
  const wsSummary = wb.getWorksheet(cfg.templateSummarySheet);
  if (wsSummary) {
    updateSummary(wsSummary, meta, devices, [
      { sheet: guiName, func: `${cfg.functionName} - GUI` },
      { sheet: logicName, func: `${cfg.functionName} - Logic` },
    ]);
  }

  // 6. Remove template's extra sheets (kể cả Home_GUI gốc) — SAU cùng
  cfg.templateExtraSheets.forEach((name) => {
    const ws = wb.getWorksheet(name);
    if (ws) wb.removeWorksheet(ws.id);
  });

  // 7. Save
  await wb.xlsx.writeFile(cfg.output);
  return { gui: guiTotal, logic: logicTotal, output: cfg.output };
}

module.exports = { generateTestcase, DEFAULTS };
