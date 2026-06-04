// Common utilities for Google Sheets scripts
const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');

function loadEnv() {
  const dotenvPath = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(dotenvPath)) {
    console.error(`[utils] File .env không tồn tại tại: ${dotenvPath}`);
    process.exit(1);
  }
  require('dotenv').config({ path: dotenvPath });
}

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) { args[key] = true; }
      else { args[key] = next; i++; }
    }
  }
  return args;
}

async function getSheetsClient() {
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
  if (!keyPath) {
    console.error('[utils] Thiếu GOOGLE_SERVICE_ACCOUNT_KEY_PATH trong .env');
    process.exit(1);
  }
  const absKey = path.isAbsolute(keyPath) ? keyPath : path.resolve(__dirname, '..', keyPath);
  if (!fs.existsSync(absKey)) {
    console.error(`[utils] Service account file không tồn tại: ${absKey}`);
    process.exit(1);
  }
  const auth = new google.auth.GoogleAuth({
    keyFile: absKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const client = await auth.getClient();
  return google.sheets({ version: 'v4', auth: client });
}

function requireSpreadsheetId(args) {
  const id = args.id || process.env.GOOGLE_SPREADSHEET_ID;
  if (!id) {
    console.error('[utils] Thiếu GOOGLE_SPREADSHEET_ID (.env hoặc --id)');
    process.exit(1);
  }
  return id;
}

function rowsToMarkdown(rows) {
  if (!rows || !rows.length) return '_(empty)_';
  const [header, ...body] = rows;
  const sep = header.map(() => '---');
  const out = [
    `| ${header.join(' | ')} |`,
    `| ${sep.join(' | ')} |`,
    ...body.map(r => `| ${header.map((_, i) => (r[i] || '').toString().replace(/\n/g, '<br>')).join(' | ')} |`),
  ];
  return out.join('\n');
}

module.exports = { loadEnv, parseArgs, getSheetsClient, requireSpreadsheetId, rowsToMarkdown };
