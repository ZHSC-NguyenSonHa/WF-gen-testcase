# Integration Scripts

Scripts Node.js dùng bởi skill `google-sheet-integration`.

## Cấu trúc

```
scripts/integrations/
├── package.json
├── .env.example
├── jira/
│   ├── jira_fetcher.js     # Lấy Jira issues (single, JQL, project, epic)
│   ├── xray_auth.js        # Xác thực Xray Cloud / Server
│   ├── xray_importer.js    # Import results (Playwright/JUnit) lên Xray
│   └── utils.js
├── google_sheet/
│   ├── sheet_auth.js       # Verify connection
│   ├── sheet_reader.js     # Đọc data
│   ├── sheet_writer.js     # Ghi results
│   ├── utils.js
│   └── README.md
└── output/                 # Generated files (gitignored)
```

## Setup nhanh

```bash
cd scripts/integrations
cp .env.example .env       # Điền credentials
npm install
```

## Slash commands liên quan

- (Google Sheets: chạy trực tiếp các script)

> Lưu ý: các prompt `/fetch_jira_requirements` và `/import_test_results_xray` đã được gỡ khỏi repo (hệ thống dùng Backlog, không dùng Jira/Xray). Các script tích hợp bên dưới vẫn giữ để tham khảo.

## Bảo mật

`.env`, `service-account.json`, và `.xray_token` đã gitignored. **KHÔNG** commit credentials.
