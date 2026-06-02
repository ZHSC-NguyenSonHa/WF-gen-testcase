---
name: google_sheet_integration
description: Skill tích hợp Google Sheets — đọc test data/test cases và ghi kết quả test automation lên Google Sheets qua script Node.js scripts/integrations/google_sheet.
---

# Google Sheets Integration Skill

## Mô tả

Skill này tích hợp Antigravity Testing Kit với **Google Sheets API** để đọc test data / test cases và ghi kết quả test automation, dùng bộ script Node.js trong `scripts/integrations/google_sheet`.

---

## Khi nào sử dụng

Agent dùng skill này khi user yêu cầu:

- Đọc test data / test cases từ Google Sheets
- Ghi kết quả test automation lên Google Sheets
- Kiểm tra/verify kết nối Google Sheets
- "đọc google sheet", "import test data từ sheet", "ghi kết quả lên google sheet"

Trigger keywords: "google sheet", "spreadsheet", "sheet reader", "sheet writer".

---

## Cấu trúc Scripts

```
scripts/integrations/google_sheet/
├── sheet_auth.js        # Kiểm tra xác thực & kết nối
├── sheet_reader.js      # Đọc dữ liệu từ Google Sheets
├── sheet_writer.js      # Ghi kết quả test lên Google Sheets
├── utils.js             # Hàm utility dùng chung
├── .env.example         # Template biến môi trường
└── package.json         # Dependencies (googleapis, dotenv)
```

---

## Điều kiện tiên quyết

### 1. Cài dependencies

```bash
cd scripts/integrations/google_sheet
npm install
```

### 2. Cấu hình xác thực (Service Account — khuyến nghị)

1. Tạo Google Cloud Project → bật **Google Sheets API**.
2. Tạo **Service Account** → tải file JSON key → đổi tên `service-account.json` → đặt vào `scripts/integrations/google_sheet/`.
3. Tạo `.env` từ `.env.example`:

```env
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./service-account.json
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id-here
```

4. **Share Spreadsheet** cho email Service Account (`client_email` trong file JSON) với quyền **Editor** — nếu không sẽ lỗi `HTTP 403`.

> Phương pháp API Key chỉ đọc được Sheet công khai (read-only), không ghi được.

> ⚠️ **An toàn:** KHÔNG commit `.env`, `service-account.json`. KHÔNG in credentials ra chat.

---

## Cách dùng

### Verify kết nối

```bash
node scripts/integrations/google_sheet/sheet_auth.js --verify
node scripts/integrations/google_sheet/sheet_auth.js --verify --sheet "Login"
```

### Đọc dữ liệu

```bash
# Liệt kê tất cả sheets
node scripts/integrations/google_sheet/sheet_reader.js --list

# Đọc toàn bộ / range / xuất Markdown / batch nhiều sheets
node scripts/integrations/google_sheet/sheet_reader.js --sheet "Test Cases"
node scripts/integrations/google_sheet/sheet_reader.js --sheet "Sheet1" --range "A1:G50"
node scripts/integrations/google_sheet/sheet_reader.js --sheet "Requirements" --format md
node scripts/integrations/google_sheet/sheet_reader.js --batch "Test Cases,Requirements,Test Data"
```

### Ghi kết quả test

```bash
node scripts/integrations/google_sheet/sheet_writer.js --help
```

---

## Lưu ý cho Agent

- Chạy các script qua terminal (`runCommands`), KHÔNG tự viết lại logic gọi API.
- Nếu thiếu `node_modules`, chạy `npm install` trong thư mục `google_sheet` trước.
- Xem chi tiết options đầy đủ tại `scripts/integrations/google_sheet/README.md`.
- Output bằng **Tiếng Việt**.
