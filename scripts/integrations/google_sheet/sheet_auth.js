#!/usr/bin/env node
// Verify Google Sheets connection.
// Usage:
//   node sheet_auth.js --verify [--sheet "Login"]

const { loadEnv, parseArgs, getSheetsClient, requireSpreadsheetId } = require('./utils');

loadEnv();
const args = parseArgs(process.argv);

(async () => {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = requireSpreadsheetId(args);
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const tabs = (meta.data.sheets || []).map(s => s.properties.title);
    console.log(`[sheet_auth] OK — Spreadsheet: "${meta.data.properties.title}"`);
    console.log(`[sheet_auth] Sheets: ${tabs.join(', ')}`);
    if (args.sheet) {
      if (!tabs.includes(args.sheet)) {
        console.error(`[sheet_auth] Sheet "${args.sheet}" KHÔNG tồn tại`);
        process.exit(2);
      }
      console.log(`[sheet_auth] Sheet "${args.sheet}" tồn tại ✓`);
    }
  } catch (err) {
    console.error(`[sheet_auth] FAIL: ${err.message}`);
    process.exit(1);
  }
})();
