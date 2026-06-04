#!/usr/bin/env node
// Read data from Google Sheets.
// Usage:
//   node sheet_reader.js --list
//   node sheet_reader.js --sheet "Test Cases"
//   node sheet_reader.js --sheet "Sheet1" --range "A1:G50"
//   node sheet_reader.js --sheet "Requirements" --format md
//   node sheet_reader.js --batch "Test Cases,Requirements,Test Data"

const fs = require('fs');
const path = require('path');
const { loadEnv, parseArgs, getSheetsClient, requireSpreadsheetId, rowsToMarkdown } = require('./utils');

loadEnv();
const args = parseArgs(process.argv);

(async () => {
  const sheets = await getSheetsClient();
  const spreadsheetId = requireSpreadsheetId(args);
  const format = (args.format || 'json').toLowerCase();
  const outDir = path.resolve(__dirname, '..', 'output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  if (args.list) {
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    for (const s of meta.data.sheets) console.log('-', s.properties.title);
    return;
  }

  const sheetNames = args.batch ? args.batch.split(',').map(s => s.trim()) : [args.sheet];
  if (!sheetNames[0]) {
    console.error('Usage: --sheet <name> | --batch "a,b,c" | --list');
    process.exit(1);
  }

  for (const name of sheetNames) {
    const range = args.range ? `${name}!${args.range}` : name;
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    const rows = res.data.values || [];
    console.log(`[sheet_reader] ${name}: ${rows.length} rows`);
    const ts = Date.now();
    const safeName = name.replace(/[^a-z0-9]/gi, '_');
    if (format === 'md') {
      const out = path.join(outDir, `sheet_${safeName}_${ts}.md`);
      fs.writeFileSync(out, `# ${name}\n\n${rowsToMarkdown(rows)}\n`, 'utf8');
      console.log(`[sheet_reader] Saved -> ${out}`);
    } else {
      const out = path.join(outDir, `sheet_${safeName}_${ts}.json`);
      fs.writeFileSync(out, JSON.stringify(rows, null, 2), 'utf8');
      console.log(`[sheet_reader] Saved -> ${out}`);
    }
  }
})().catch(err => { console.error(`[sheet_reader] FAIL: ${err.message}`); process.exit(1); });
