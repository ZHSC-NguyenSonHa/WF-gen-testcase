#!/usr/bin/env node
// Import test results to Xray Cloud (Playwright JSON or JUnit XML).
// Usage:
//   node xray_importer.js --format playwright --file ./test-results.json --project PROJ
//   node xray_importer.js --format junit --file ./junit-results.xml --project PROJ [--testplan PROJ-99]

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { loadEnv, requireEnv, parseArgs } = require('./utils');

loadEnv();

const args = parseArgs(process.argv);
const format = (args.format || '').toLowerCase();
const file = args.file;
const project = args.project || process.env.JIRA_PROJECT_KEY;

if (!format || !file || !project) {
  console.error('Usage: --format playwright|junit --file <path> --project <KEY> [--testplan KEY]');
  process.exit(1);
}
if (!fs.existsSync(file)) {
  console.error(`[xray_importer] File không tồn tại: ${file}`);
  process.exit(1);
}

async function getToken() {
  requireEnv(['XRAY_CLIENT_ID', 'XRAY_CLIENT_SECRET']);
  const res = await axios.post('https://xray.cloud.getxray.app/api/v2/authenticate', {
    client_id: process.env.XRAY_CLIENT_ID,
    client_secret: process.env.XRAY_CLIENT_SECRET,
  });
  return typeof res.data === 'string' ? res.data : res.data.token;
}

async function importJunit(token) {
  const xml = fs.readFileSync(file, 'utf8');
  const url = `https://xray.cloud.getxray.app/api/v2/import/execution/junit?projectKey=${project}` +
              (args.testplan ? `&testPlanKey=${args.testplan}` : '');
  const res = await axios.post(url, xml, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/xml' },
  });
  return res.data;
}

async function importPlaywright(token) {
  // Convert Playwright JSON -> Xray "execution import" multipart payload (simplified).
  // For complex needs, switch to the Xray /import/execution endpoint.
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const tests = [];
  const collect = (suites) => {
    for (const s of suites || []) {
      collect(s.suites);
      for (const spec of s.specs || []) {
        for (const t of spec.tests || []) {
          const result = t.results?.[0] || {};
          // Extract Test Key from title like "[PROJ-123] Login should work"
          const m = (spec.title || t.title || '').match(/\[([A-Z][A-Z0-9]+-\d+)\]/);
          if (!m) continue;
          tests.push({
            testKey: m[1],
            status: result.status === 'passed' ? 'PASSED' : result.status === 'skipped' ? 'TODO' : 'FAILED',
            comment: result.error?.message || '',
          });
        }
      }
    }
  };
  collect(data.suites);
  if (!tests.length) {
    console.error('[xray_importer] Không tìm thấy test nào có format [PROJ-123] trong title.');
    process.exit(1);
  }
  const payload = {
    info: { project, summary: `Automation run ${new Date().toISOString()}` },
    tests,
  };
  if (args.testplan) payload.info.testPlanKey = args.testplan;
  const res = await axios.post('https://xray.cloud.getxray.app/api/v2/import/execution', payload, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  return res.data;
}

(async () => {
  try {
    const token = await getToken();
    const out = format === 'junit' ? await importJunit(token) : await importPlaywright(token);
    console.log('[xray_importer] OK', JSON.stringify(out, null, 2));
  } catch (err) {
    console.error(`[xray_importer] FAIL HTTP ${err.response?.status} ${err.message}`);
    if (err.response?.data) console.error(JSON.stringify(err.response.data, null, 2));
    process.exit(1);
  }
})();
