# Excel Converter Scripts

Convert / sinh file Excel test case từ 2 nguồn dữ liệu khác nhau. Xem skill chi tiết: [`.github/skills/excel-converter/SKILL.md`](../../.github/skills/excel-converter/SKILL.md).

## Cài đặt

```bash
cd scripts/convert_excel
npm install
```

## 2 modes

| Mode | Script | Input | Output |
|---|---|---|---|
| **FLAT** | `md_to_xlsx.js` | Markdown bảng phẳng (cột `TC ID`) | 1 sheet phẳng, freeze + AutoFilter |
| **TEMPLATE** | `testcase_builder.js` (engine) + `gen_<feature>.js` (data) | File data JS có cấu trúc | `Summary` + `<prefix>_GUI` + `<prefix>_LOGIC` (clone style/border/font/formula từ `templates/testcase/app-testcase-template.xlsx`) |

## FLAT mode — `md_to_xlsx.js`

```bash
node scripts/convert_excel/md_to_xlsx.js <input.md> [output.xlsx]
```

- Tự nhận diện bảng có cột `TC ID`
- Format: column widths, freeze header, AutoFilter, `<br>` → newline, xoá emoji

## TEMPLATE mode — `testcase_builder.js` + `features/gen_<feature>.js`

### Bước 1: Copy skeleton từ `examples/` sang `features/`

```powershell
Copy-Item examples/gen_testcase.template.js features/gen_<feature>.js
```

### Bước 2: Sửa file `features/gen_<feature>.js`

- Đổi `FUNCTION_NAME`, `CREATOR`, `CREATE_DATE`, `RELEASE`, `SHEET_PREFIX`
- Điền `guiSection` + `logicSections` (chia ĐÚNG theo số mục spec)
- Row format: `{ to: 'Test Object', sub: 'Sub Test Object', input: '[Tiền điều kiện] ...\n1. ...', output: '1. ...' }`
- Các row liên tiếp cùng `to` sẽ tự merge cột Test Object

### Bước 3: Chạy

```bash
node scripts/convert_excel/features/gen_<feature>.js "Test Result/<release>/App/<folder>/【APP】<FeatureName>.xlsx"
```

### Example reference

- `examples/gen_popup_claim.js` — Popup Claim v7.4.0 (7 GUI + 28 Logic TC)

## Cấu trúc

```
scripts/convert_excel/
├── md_to_xlsx.js              # Engine (FLAT mode)
├── testcase_builder.js        # Engine (TEMPLATE mode, Copy+Fill)
├── examples/                  ← Skeleton + reference (KHÔNG sửa trực tiếp)
│   ├── gen_testcase.template.js   # Skeleton để copy
│   └── gen_popup_claim.js         # Example đầy đủ
├── features/                  ← QA team add gen_<feature>.js vào đây
├── package.json               # deps: xlsx (FLAT) + exceljs (TEMPLATE)
└── README.md

templates/testcase/             ← Canonical templates (repo root)
├── app-testcase-template.xlsx
└── README.md
```

## Troubleshooting

| Lỗi | Cách xử lý |
|---|---|
| `Cannot find module 'exceljs'` | `cd scripts/convert_excel && npm install` |
| `Cannot find module 'xlsx'` | `cd scripts/convert_excel && npm install` |
| `npm install` báo 407 Proxy Auth | Set proxy credentials trên máy local (KHÔNG cung cấp qua chat) |
| `Source sheet "Home_GUI" not found` | Template `templates/testcase/app-testcase-template.xlsx` bị thiếu hoặc đổi tên sheet — kiểm tra README template |
| File output bị khoá (đang mở Excel) | Đóng Excel hoặc đổi tên output |
