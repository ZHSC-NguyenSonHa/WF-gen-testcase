'use strict';
const fs   = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

function fail(msg) { console.error('ERROR: ' + msg); process.exit(1); }

const inputPath  = process.argv[2];
if (!inputPath) fail('Thieu input. Cu phap: node md_to_xlsx_styled.js <input.md> [output.xlsx]');
if (!fs.existsSync(inputPath)) fail('Khong tim thay file input: ' + inputPath);
const outputPath = process.argv[3] || inputPath.replace(/\.md$/i, '') + '.xlsx';

function cleanText(s) {
  if (s == null) return '';
  let t = String(s);
  t = t.replace(/<br\s*\/?>/gi, '\n');
  t = t.replace(/\*\*/g, '');
  t = t.replace(/`/g, '');
  return t.trim();
}

function splitRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|'))   s = s.slice(0, -1);
  return s.split(/(?<!\\)\|/).map(c => c.replace(/\\\|/g, '|').trim());
}

function safeSheetName(name, used) {
  let n = (name || 'Sheet').replace(/[\\/?*[\]:]/g, ' ').trim().slice(0, 28) || 'Sheet';
  let base = n, i = 2;
  while (used.has(n.toLowerCase())) n = base.slice(0, 25) + ' ' + i++;
  used.add(n.toLowerCase());
  return n;
}

const md    = fs.readFileSync(inputPath, 'utf8');
const lines = md.split(/\r?\n/);

// Pass 1: collect all heading levels to determine which level defines a SHEET.
// The shallowest (smallest #) heading level found becomes the sheet-splitting level;
// any deeper heading acts as an in-sheet section title (grouped into the same sheet).
let minLevel = Infinity;
for (const line of lines) {
  const hm = line.match(/^\s*(#{1,6})\s+(.*)$/);
  if (hm) minLevel = Math.min(minLevel, hm[1].length);
}
if (minLevel === Infinity) minLevel = 2;

let currentSheetHeading   = '';
let currentSectionHeading = '';
const tables = [];
let i = 0;
while (i < lines.length) {
  const line = lines[i];
  const hm   = line.match(/^\s*(#{1,6})\s+(.*)$/);
  if (hm) {
    const level = hm[1].length;
    const text  = cleanText(hm[2]).replace(/^\d+[.)]\s*/, '').trim();
    if (level <= minLevel) {
      currentSheetHeading   = text;
      currentSectionHeading = '';
    } else {
      currentSectionHeading = text;
    }
    i++; continue;
  }
  const isTableLine = l => /^\s*\|.*\|\s*$/.test(l);
  const isSepLine   = l => /^\s*\|?[\s:|-]+\|?\s*$/.test(l);
  if (isTableLine(line) && i + 1 < lines.length && isSepLine(lines[i + 1])) {
    const header = splitRow(line).map(cleanText);
    const rows   = [];
    let j = i + 2;
    while (j < lines.length && isTableLine(lines[j])) {
      rows.push(splitRow(lines[j]).map(cleanText));
      j++;
    }
    tables.push({ sheetHeading: currentSheetHeading, sectionHeading: currentSectionHeading, header, rows });
    i = j;
  } else { i++; }
}

if (!tables.length) fail('Khong tim thay bang Markdown nao trong file.');

// Group tables by sheetHeading, preserving first-seen order.
const sheetOrder = [];
const sheetMap   = new Map();
for (const t of tables) {
  const key = t.sheetHeading || 'Sheet';
  if (!sheetMap.has(key)) { sheetMap.set(key, []); sheetOrder.push(key); }
  sheetMap.get(key).push(t);
}

const HEADER_BG   = '1F4E79';
const HEADER_FG   = 'FFFFFF';
const ROW_ODD     = 'FFFFFF';
const ROW_EVEN    = 'DEEAF1';
const BORDER_CLR  = 'B8CCE4';
const SECTION_BG  = '9DC3E6';
const SECTION_FG  = '1F4E79';

function borderSide(style) {
  return { style: style || 'thin', color: { argb: 'FF' + BORDER_CLR } };
}
const fullBorder = {
  top: borderSide(), bottom: borderSide(),
  left: borderSide(), right: borderSide()
};

(async () => {
  const wb  = new ExcelJS.Workbook();
  wb.creator = 'md_to_xlsx_styled';
  wb.created = new Date();
  const used = new Set();
  let totalRows = 0;

  for (const sheetKey of sheetOrder) {
    const sheetTables = sheetMap.get(sheetKey);
    const ws = wb.addWorksheet(safeSheetName(sheetKey, used), {
      views: [{ state: 'frozen', ySplit: 1 }]
    });

    const maxCols = Math.max(...sheetTables.map(t => t.header.length));
    const colWidths = new Array(maxCols).fill(12);
    for (const t of sheetTables) {
      t.header.forEach((h, idx) => {
        let max = h.length;
        for (const r of t.rows) {
          const val = r[idx] || '';
          for (const seg of val.split('\n')) max = Math.max(max, seg.length);
        }
        colWidths[idx] = Math.min(Math.max(colWidths[idx], max + 3, 12), 65);
      });
    }
    ws.columns = colWidths.map(w => ({ width: w }));

    let firstTableInSheet = true;
    for (const t of sheetTables) {
      if (!firstTableInSheet) ws.addRow([]); // spacer row between tables
      firstTableInSheet = false;

      if (t.sectionHeading) {
        const secRow = ws.addRow([t.sectionHeading]);
        secRow.height = 20;
        ws.mergeCells(secRow.number, 1, secRow.number, Math.max(t.header.length, 1));
        secRow.getCell(1).font      = { bold: true, color: { argb: 'FF' + SECTION_FG }, size: 12 };
        secRow.getCell(1).fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + SECTION_BG } };
        secRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
      }

      const headerRow = ws.addRow(t.header);
      headerRow.height = 22;
      headerRow.eachCell(cell => {
        cell.font      = { bold: true, color: { argb: 'FF' + HEADER_FG }, size: 11 };
        cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + HEADER_BG } };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border    = fullBorder;
      });

      for (let ri = 0; ri < t.rows.length; ri++) {
        const rowData = t.header.map((_, idx) => t.rows[ri][idx] || '');
        const row     = ws.addRow(rowData);
        const bgHex   = ri % 2 === 0 ? ROW_ODD : ROW_EVEN;
        row.eachCell({ includeEmpty: true }, cell => {
          cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + bgHex } };
          cell.alignment = { vertical: 'top', wrapText: true };
          cell.border    = fullBorder;
          cell.font      = { size: 11 };
        });
      }

      ws.autoFilter = undefined; // avoid autofilter conflicts across multiple stacked tables
      totalRows += t.rows.length;
    }

    // Only apply autofilter when the sheet contains a single table (unambiguous range)
    if (sheetTables.length === 1) {
      const only = sheetTables[0];
      const headerRowNum = only.sectionHeading ? 2 : 1;
      ws.autoFilter = {
        from: { row: headerRowNum, column: 1 },
        to:   { row: headerRowNum, column: only.header.length }
      };
    }
  }

  await wb.xlsx.writeFile(outputPath);
  console.log('Done: ' + path.resolve(outputPath));
  console.log('Sheets: ' + sheetOrder.length + ' | Rows: ' + totalRows);
})();