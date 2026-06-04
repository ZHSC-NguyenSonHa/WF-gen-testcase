// Common utilities for Jira/Xray scripts
const path = require('path');
const fs = require('fs');

function loadEnv() {
  const dotenvPath = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(dotenvPath)) {
    console.error(`[utils] File .env không tồn tại tại: ${dotenvPath}`);
    console.error('[utils] Hãy copy .env.example -> .env và điền credentials.');
    process.exit(1);
  }
  require('dotenv').config({ path: dotenvPath });
}

function requireEnv(keys) {
  const missing = keys.filter(k => !process.env[k]);
  if (missing.length) {
    console.error(`[utils] Thiếu biến môi trường: ${missing.join(', ')}`);
    process.exit(1);
  }
}

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        args[key] = true;
      } else {
        args[key] = next;
        i++;
      }
    }
  }
  return args;
}

// Atlassian Document Format -> plain text
function adfToText(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(adfToText).join('');
  let out = '';
  if (node.text) out += node.text;
  if (node.content) out += adfToText(node.content);
  if (node.type === 'paragraph' || node.type === 'heading') out += '\n';
  if (node.type === 'hardBreak') out += '\n';
  return out;
}

function jiraAuthHeader() {
  if (process.env.JIRA_PAT) {
    return { Authorization: `Bearer ${process.env.JIRA_PAT}` };
  }
  const token = Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64');
  return { Authorization: `Basic ${token}` };
}

module.exports = { loadEnv, requireEnv, parseArgs, adfToText, jiraAuthHeader };
