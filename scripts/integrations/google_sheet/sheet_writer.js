#!/usr/bin/env node
// Write test results to Google Sheets.
// Usage:
//   node sheet_writer.js --sheet "Results" --file ./results.json
//   node sheet_writer.js --sheet "Results" --append --row "TC_001,PASS,2025-01-01,QA-Bot"
//   node sheet_writer.js --sheet "Results" --clear --range "A2:E1000"
//
// JSON file format (array of arrays):
//   [["TC_001","PASS","2025-..."], ["TC_002","FAIL","..."]]

const fs = require('fs');
const { loadEnv, parseArgs, getSheetsClient, requireSpreadsheetId } = require('./utils');

loadEnv();
const args = parseArgs(process.argv);

function help() {
  console.log(`Usage:
  --sheet <name> --file <path.json>          Append rows from JSON file
  --sheet <name> --append --row "a,b,c"      Append a single CSV row
  --sheet <name> --clear --range "A2:E1000"  Clear a range
  --sheet <name> --update --range "A1" --row "a,b,c"  Overwrite at range`);
}

(async () => {
  if (!args.sheet) { help(); process.exit(1); }
  const sheets = await getSheetsClient();
  const spreadsheetId = requireSpreadsheetId(args);
  const sheet = args.sheet;

  if (args.clear) {
    const range = args.range ? `${sheet}!${args.range}` : sheet;
    await sheets.spreadsheets.values.clear({ spreadsheetId, range });
    console.log(`[sheet_writer] Cleared ${range}`);
    return;
  }

  let values = [];
  if (args.file) {
    if (!fs.existsSync(args.file)) {
      console.error(`[sheet_writer] File không tồn tại: ${args.file}`);
      process.exit(1);
    }
    values = JSON.parse(fs.readFileSync(args.file, 'utf8'));
    if (!Array.isArray(values) || !Array.isArray(values[0])) {
      console.error('[sheet_writer] JSON phải là array of arrays.');
      process.exit(1);
    }
  } else if (args.row) {
    values = [args.row.split(',').map(s => s.trim())];
  } else {
    help(); process.exit(1);
  }

  if (args.update) {
    const range = args.range ? `${sheet}!${args.range}` : sheet;
    await sheets.spreadsheets.values.update({
      spreadsheetId, range, valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });
    console.log(`[sheet_writer] Updated ${range} with ${values.length} row(s)`);
  } else {
    await sheets.spreadsheets.values.append({
      spreadsheetId, range: sheet, valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values },
    });
    console.log(`[sheet_writer] Appended ${values.length} row(s) to "${sheet}"`);
  }
})().catch(err => {
  console.error(`[sheet_writer] FAIL: ${err.message}`);
  if (err.errors) console.error(JSON.stringify(err.errors, null, 2));
  process.exit(1);
});
