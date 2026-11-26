#!/usr/bin/env node
/**
 * md_all_tables_to_xlsx.js
 * Convert MỌI bảng Markdown trong file sang Excel (.xlsx) — mỗi bảng 1 sheet,
 * tên sheet lấy theo heading (##/###) gần nhất phía trên.
 * Dùng cho file QA Regression (cột "ID", nhiều bảng) mà md_to_xlsx.js (cột "TC ID") không nhận.
 *
 * Usage:
 *   node md_all_tables_to_xlsx.js <input.md> [output.xlsx]
 */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

function fail(msg) {
  console.error('❌ ' + msg);
  process.exit(1);
}

const inputPath = process.argv[2];
if (!inputPath) fail('Thiếu input. Cú pháp: node md_all_tables_to_xlsx.js <input.md> [output.xlsx]');
if (!fs.existsSync(inputPath)) fail('Không tìm thấy file input: ' + inputPath);
const outputPath = process.argv[3] || inputPath.replace(/\.md$/i, '') + '.xlsx';

function cleanText(s) {
  if (s == null) return '';
  let t = String(s);
  t = t.replace(/<br\s*\/?>/gi, '\n');
  t = t.replace(/\*\*/g, '');          // bold markdown
  t = t.replace(/`/g, '');             // backtick
  t = t.replace(/\\([\\*_~\[\]()#\-])/g, '$1'); // unescape \* \~ \[ ...
  t = t.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\uFE0F]/gu, '');
  return t.trim();
}

function splitRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  return s.split(/(?<!\\)\|/).map((c) => c.replace(/\\\|/g, '|').trim());
}

function safeSheetName(name, used) {
  let n = (name || 'Sheet').replace(/[\\/?*\[\]:]/g, ' ').trim().slice(0, 28) || 'Sheet';
  let base = n, i = 2;
  while (used.has(n.toLowerCase())) n = (base.slice(0, 25) + ' ' + i++);
  used.add(n.toLowerCase());
  return n;
}

const md = fs.readFileSync(inputPath, 'utf8');
const lines = md.split(/\r?\n/);

let currentHeading = '';
const tables = [];
let i = 0;
while (i < lines.length) {
  const line = lines[i];
  const hm = line.match(/^\s*#{1,6}\s+(.*)$/);
  if (hm) {
    currentHeading = cleanText(hm[1]).replace(/^\d+[.)]?\s*/, '').trim();
    i++;
    continue;
  }
  if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1])) {
    const header = splitRow(line).map(cleanText);
    const rows = [];
    let j = i + 2;
    while (j < lines.length && /^\s*\|.*\|\s*$/.test(lines[j])) {
      rows.push(splitRow(lines[j]).map(cleanText));
      j++;
    }
    tables.push({ heading: currentHeading, header, rows });
    i = j;
  } else {
    i++;
  }
}

if (!tables.length) fail('Không tìm thấy bảng Markdown nào trong file.');

const wb = XLSX.utils.book_new();
const used = new Set();
let totalRows = 0;

for (const t of tables) {
  const aoa = [t.header, ...t.rows.map((r) => t.header.map((_, idx) => r[idx] || ''))];
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // column widths
  ws['!cols'] = t.header.map((h, idx) => {
    let max = String(h).length;
    for (const r of t.rows) {
      const cell = r[idx] || '';
      for (const seg of String(cell).split('\n')) max = Math.max(max, seg.length);
    }
    return { wch: Math.min(Math.max(max + 2, 10), 60) };
  });

  // wrap text + valign top
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) continue;
      ws[addr].s = { alignment: { wrapText: true, vertical: 'top' } };
    }
  }
  ws['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft', state: 'frozen' };
  ws['!autofilter'] = { ref: ws['!ref'] };

  XLSX.utils.book_append_sheet(wb, ws, safeSheetName(t.heading, used));
  totalRows += t.rows.length;
}

XLSX.writeFile(wb, outputPath);
console.log('✅ Đã tạo file Excel: ' + path.resolve(outputPath));
console.log('   Số sheet (bảng): ' + tables.length + ' | Tổng số dòng dữ liệu: ' + totalRows);
