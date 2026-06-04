#!/usr/bin/env node
// Authenticate against Xray Cloud (or verify token Xray Server) and print/save the token.
// Usage:
//   node xray_auth.js              -> Get token and print (truncated)
//   node xray_auth.js --verify     -> Verify token (non-zero exit on failure)
//   node xray_auth.js --save       -> Save raw token to .xray_token (gitignored)

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { loadEnv, requireEnv, parseArgs } = require('./utils');

loadEnv();

const args = parseArgs(process.argv);
const platform = (process.env.XRAY_PLATFORM || 'cloud').toLowerCase();

async function authCloud() {
  requireEnv(['XRAY_CLIENT_ID', 'XRAY_CLIENT_SECRET']);
  try {
    const res = await axios.post('https://xray.cloud.getxray.app/api/v2/authenticate', {
      client_id: process.env.XRAY_CLIENT_ID,
      client_secret: process.env.XRAY_CLIENT_SECRET,
    });
    return typeof res.data === 'string' ? res.data : res.data.token || res.data;
  } catch (err) {
    console.error(`[xray_auth] Cloud auth failed: HTTP ${err.response?.status} ${err.message}`);
    process.exit(2);
  }
}

async function authServer() {
  // Xray Server uses Jira PAT/Basic auth directly when calling endpoints.
  requireEnv(['XRAY_SERVER_BASE_URL']);
  if (!process.env.JIRA_PAT && !(process.env.JIRA_EMAIL && process.env.JIRA_API_TOKEN)) {
    console.error('[xray_auth] Server mode cần JIRA_PAT hoặc JIRA_EMAIL+JIRA_API_TOKEN.');
    process.exit(1);
  }
  // No token to fetch — return a sentinel so callers know auth header is reused
  return 'SERVER_BASIC_OR_PAT';
}

(async () => {
  const token = platform === 'server' ? await authServer() : await authCloud();
  if (args.verify) {
    console.log(`[xray_auth] OK — platform=${platform}`);
    process.exit(0);
  }
  if (args.save) {
    const out = path.resolve(__dirname, '..', '.xray_token');
    fs.writeFileSync(out, String(token), 'utf8');
    console.log(`[xray_auth] Token saved -> ${out}`);
  } else {
    const t = String(token);
    console.log(`[xray_auth] Token: ${t.slice(0, 12)}…${t.slice(-4)} (length=${t.length})`);
  }
})();
