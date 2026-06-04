#!/usr/bin/env node
// Fetch Jira issues (single, by JQL, by project, by epic) and export as JSON or Markdown.
// Usage:
//   node jira_fetcher.js --issue PROJ-123 [--format md|json]
//   node jira_fetcher.js --project PROJ [--type Story] [--max 20]
//   node jira_fetcher.js --jql "project = PROJ AND status = 'To Do'"
//   node jira_fetcher.js --epic PROJ-10 --format md

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { loadEnv, requireEnv, parseArgs, adfToText, jiraAuthHeader } = require('./utils');

loadEnv();
requireEnv(['JIRA_BASE_URL']);

const args = parseArgs(process.argv);
const baseUrl = process.env.JIRA_BASE_URL.replace(/\/$/, '');
const headers = { ...jiraAuthHeader(), Accept: 'application/json' };
const format = (args.format || 'json').toLowerCase();
const outDir = args.out || path.resolve(__dirname, '..', 'output');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function http(url, params = {}) {
  try {
    const res = await axios.get(url, { headers, params });
    return res.data;
  } catch (err) {
    const status = err.response?.status;
    const data = err.response?.data;
    console.error(`[jira_fetcher] HTTP ${status} - ${err.message}`);
    if (data) console.error(JSON.stringify(data, null, 2));
    process.exit(1);
  }
}

function issueToObject(issue) {
  const f = issue.fields || {};
  return {
    key: issue.key,
    summary: f.summary,
    type: f.issuetype?.name,
    status: f.status?.name,
    priority: f.priority?.name,
    assignee: f.assignee?.displayName,
    reporter: f.reporter?.displayName,
    description: typeof f.description === 'string' ? f.description : adfToText(f.description),
    labels: f.labels || [],
    created: f.created,
    updated: f.updated,
    url: `${baseUrl}/browse/${issue.key}`,
  };
}

function toMarkdown(issues) {
  const lines = ['# Jira Requirements\n'];
  for (const i of issues) {
    lines.push(`## [${i.key}] ${i.summary}\n`);
    lines.push(`- **Type:** ${i.type} | **Status:** ${i.status} | **Priority:** ${i.priority || 'N/A'}`);
    lines.push(`- **Assignee:** ${i.assignee || 'Unassigned'} | **Reporter:** ${i.reporter || 'N/A'}`);
    lines.push(`- **URL:** ${i.url}`);
    if (i.labels?.length) lines.push(`- **Labels:** ${i.labels.join(', ')}`);
    lines.push('\n### Description\n');
    lines.push(i.description?.trim() || '_(no description)_');
    lines.push('\n---\n');
  }
  return lines.join('\n');
}

async function fetchIssue(key) {
  const data = await http(`${baseUrl}/rest/api/3/issue/${key}`);
  return [issueToObject(data)];
}

async function fetchByJql(jql, max = 50) {
  const data = await http(`${baseUrl}/rest/api/3/search`, { jql, maxResults: max });
  return (data.issues || []).map(issueToObject);
}

async function fetchByProject(projectKey, type, max = 50) {
  let jql = `project = ${projectKey}`;
  if (type) jql += ` AND issuetype = "${type}"`;
  jql += ' ORDER BY created DESC';
  return fetchByJql(jql, max);
}

async function fetchEpicChildren(epicKey, max = 100) {
  // Try Cloud-style first; fall back to "Epic Link" custom field for older Jira
  const jql = `parent = ${epicKey} OR "Epic Link" = ${epicKey}`;
  return fetchByJql(jql, max);
}

(async () => {
  let issues = [];
  let label = '';

  if (args.issue) {
    issues = await fetchIssue(args.issue);
    label = args.issue;
  } else if (args.jql) {
    issues = await fetchByJql(args.jql, parseInt(args.max || '50', 10));
    label = 'jql';
  } else if (args.epic) {
    issues = await fetchEpicChildren(args.epic, parseInt(args.max || '100', 10));
    label = `epic_${args.epic}`;
  } else if (args.project) {
    issues = await fetchByProject(args.project, args.type, parseInt(args.max || '50', 10));
    label = `project_${args.project}`;
  } else {
    console.error('Usage: --issue KEY | --project KEY | --jql "..." | --epic KEY');
    process.exit(1);
  }

  console.log(`[jira_fetcher] Fetched ${issues.length} issue(s).`);

  const ts = Date.now();
  if (format === 'md') {
    const out = path.join(outDir, `jira_${label}_${ts}.md`);
    fs.writeFileSync(out, toMarkdown(issues), 'utf8');
    console.log(`[jira_fetcher] Saved Markdown -> ${out}`);
  } else {
    const out = path.join(outDir, `jira_${label}_${ts}.json`);
    fs.writeFileSync(out, JSON.stringify(issues, null, 2), 'utf8');
    console.log(`[jira_fetcher] Saved JSON -> ${out}`);
  }
})();
