# Google Sheets Integration Scripts

Bộ script Node.js để đọc/ghi Google Sheets, dùng bởi skill `google-sheet-integration`.

## Setup

1. **Tạo Service Account** trên Google Cloud Console → bật Google Sheets API.
2. Tải file JSON key → đổi tên `service-account.json` → đặt vào thư mục này.
3. Copy `../.env.example` → `../.env`, điền:
   ```env
   GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./google_sheet/service-account.json
   GOOGLE_SPREADSHEET_ID=<id-from-spreadsheet-url>
   ```
4. **Share Spreadsheet** với email `client_email` trong file JSON (quyền Editor).
5. Cài dependencies:
   ```bash
   cd scripts/integrations
   npm install
   ```

## Commands

```bash
# Verify connection
node sheet_auth.js --verify
node sheet_auth.js --verify --sheet "Login"

# Read
node sheet_reader.js --list
node sheet_reader.js --sheet "Test Cases"
node sheet_reader.js --sheet "Sheet1" --range "A1:G50"
node sheet_reader.js --sheet "Requirements" --format md
node sheet_reader.js --batch "Test Cases,Requirements,Test Data"

# Write
node sheet_writer.js --sheet "Results" --file ./results.json
node sheet_writer.js --sheet "Results" --append --row "TC_001,PASS,2025-01-01,QA-Bot"
node sheet_writer.js --sheet "Results" --clear --range "A2:E1000"
```

## Output

File output (.json/.md) lưu trong `scripts/integrations/output/` (đã gitignored).

## Bảo mật

- KHÔNG commit `service-account.json` hoặc `.env` (đã trong `.gitignore`).
- KHÔNG in credentials ra console.
