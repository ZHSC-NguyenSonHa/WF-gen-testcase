#!/usr/bin/env node
/**
 * md_to_xlsx.js
 * Convert file Markdown chứa bảng Test Cases (có cột "TC ID") sang Excel (.xlsx).
 * Tính năng: column widths, freeze panes (header), AutoFilter, line breaks (<br>), clean text.
 *
 * Usage:
 *   node scripts/convert_excel/md_to_xlsx.js <input.md> [output.xlsx]
 */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

function fail(msg) {
  console.error('❌ ' + msg);
  process.exit(1);
}

// ---- parse args
const inputPath = process.argv[2];
if (!inputPath) fail('Thiếu đường dẫn input. Cú pháp: node md_to_xlsx.js <input.md> [output.xlsx]');
if (!fs.existsSync(inputPath)) fail('Không tìm thấy file input: ' + inputPath);
const outputPath = process.argv[3] || inputPath.replace(/\.md$/i, '') + '.xlsx';

// ---- clean cell text
function cleanText(s) {
  if (s == null) return '';
  let t = String(s).trim();
  // <br> -> newline
  t = t.replace(/<br\s*\/?>/gi, '\n');
  // bỏ backtick markdown
  t = t.replace(/`/g, '');
  // bỏ emoji thường gặp ở Risk Level / Priority
  t = t.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\uFE0F]/gu, '').trim();
  return t;
}

// ---- parse markdown tables, lấy bảng có cột "TC ID"
function parseMarkdownTables(md) {
  const lines = md.split(/\r?\n/);
  const tables = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1])) {
      // header row + separator row
      const header = splitRow(line);
      const rows = [];
      let j = i + 2;
      while (j < lines.length && /^\s*\|.*\|\s*$/.test(lines[j])) {
        rows.push(splitRow(lines[j]));
        j++;
      }
      tables.push({ header, rows });
      i = j;
    } else {
      i++;
    }
  }
  return tables;
}

function splitRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  // tách theo | nhưng giữ \| escape
  return s.split(/(?<!\\)\|/).map((c) => c.replace(/\\\|/g, '|').trim());
}

// ---- main
const md = fs.readFileSync(inputPath, 'utf8');
const tables = parseMarkdownTables(md);
const tcTable = tables.find((t) => t.header.some((h) => /TC\s*ID/i.test(h)));
if (!tcTable) fail('Không tìm thấy bảng nào có cột "TC ID" trong file Markdown.');

const headers = tcTable.header.map(cleanText);
const aoa = [headers];
for (const row of tcTable.rows) {
  const r = headers.map((_, idx) => cleanText(row[idx] || ''));
  aoa.push(r);
}

// ---- build worksheet
const ws = XLSX.utils.aoa_to_sheet(aoa);

// column widths theo tên cột
const widthMap = {
  'TC ID': 10, 'Module': 18, 'Risk Level': 12, 'Test Title': 34,
  'Pre-Condition': 40, 'Test Steps': 42, 'Expected Result': 48,
  'Priority': 12, 'Test Data': 28,
};
ws['!cols'] = headers.map((h) => ({ wch: widthMap[h] || 20 }));

// wrap text + valign top cho tất cả cell
const range = XLSX.utils.decode_range(ws['!ref']);
for (let R = range.s.r; R <= range.e.r; R++) {
  for (let C = range.s.c; C <= range.e.c; C++) {
    const addr = XLSX.utils.encode_cell({ r: R, c: C });
    if (!ws[addr]) continue;
    ws[addr].s = { alignment: { wrapText: true, vertical: 'top' } };
  }
}

// freeze header row + AutoFilter
ws['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft', state: 'frozen' };
ws['!autofilter'] = { ref: ws['!ref'] };

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Test Cases');
XLSX.writeFile(wb, outputPath);

console.log('✅ Đã tạo file Excel: ' + path.resolve(outputPath));
console.log('   Số test case: ' + (aoa.length - 1));
