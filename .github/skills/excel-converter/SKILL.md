---
name: excel-converter
description: Skill convert/sinh file Excel testcase từ 2 nguồn — (1) FLAT mode từ Markdown bảng phẳng (preview nhanh) qua scripts/convert_excel/md_to_xlsx.js, (2) TEMPLATE mode từ data JS có cấu trúc (file QA deliverable đúng template Push gốc) qua scripts/convert_excel/testcase_builder.js.
---

# Excel Converter Skill

## Mô tả

Skill này convert dữ liệu test cases sang file Excel `.xlsx`, hỗ trợ **2 modes** riêng biệt cho 2 mục đích khác nhau.

| Mode | Input | Output | Khi dùng |
|---|---|---|---|
| **FLAT** | Markdown table (cột `TC ID`) | `.xlsx` 1 sheet phẳng (col width, freeze, AutoFilter) | Preview nhanh trong khi RBT, chia sẻ Q&A |
| **TEMPLATE** | File data JS (`gen_<feature>.js`) | `.xlsx` chuẩn QA: `Summary` + `<feature>_GUI` + `<feature>_LOGIC` (clone style/border/font/formula từ template canonical) | File deliverable cuối cùng cho QA team |

---

## Khi nào dùng mode nào

### → FLAT mode (`md_to_xlsx.js`)

User yêu cầu:
- "convert md to xlsx", "export markdown to excel"
- Preview nhanh bảng test case trong khi đang viết
- Output trung gian giữa các bước RBT

### → TEMPLATE mode (`testcase_builder.js`)

User yêu cầu:
- "tạo file testcase chuẩn QA", "xuất Excel theo template Push"
- File final cho QA team review/test
- Yêu cầu giữ NGUYÊN màu sắc, border, công thức tính toán theo template
- Output cuối cùng của workflow `/generate_manual_testcases_rbt`

---

## Cấu trúc Script

```
scripts/convert_excel/
├── md_to_xlsx.js              # Engine FLAT mode — Markdown → flat xlsx (1 sheet)
├── testcase_builder.js        # Engine TEMPLATE mode — Copy+Fill (load template + fill data)
├── examples/                  # Skeleton + reference (KHÔNG sửa trực tiếp)
│   ├── gen_testcase.template.js   # SKELETON cho data file mới
│   └── gen_popup_claim.js         # Example đầy đủ (Popup Claim v7.4.0)
├── features/                  # QA team add gen_<feature>.js vào đây
├── package.json               # deps: xlsx (FLAT), exceljs (TEMPLATE)
└── README.md

templates/testcase/
├── app-testcase-template.xlsx # Canonical template (mobile App, 2 device iOS+Android)
└── README.md                  # Mô tả cấu trúc sheet + anchor rows + formula
```

---

## Điều kiện tiên quyết

- **Node.js** ≥ 16
- Cài dependencies (1 lần duy nhất):

```bash
cd scripts/convert_excel
npm install
```

> Nếu `npm install` bị chặn bởi proxy → user tự cấu hình proxy credentials trên máy local, KHÔNG cung cấp credentials qua chat (sẽ đi qua model).

---

## FLAT mode — `md_to_xlsx.js`

### Cách dùng

```bash
# Từ thư mục gốc project
node scripts/convert_excel/md_to_xlsx.js <input.md> [output.xlsx]
```

### Input

File Markdown có bảng với cột `TC ID`:

```markdown
| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------|
| TC_001 | ... | 🔴 High | ... | ... | Step 1<br>Step 2 | ... | Critical | ... |
```

### Output

| Feature | Mô tả |
|---|---|
| 1 sheet phẳng | Tên `Test Cases` |
| Column widths | Tự set theo tên cột |
| Freeze panes | Cố định header |
| AutoFilter | Bộ lọc tự động |
| Line breaks | `<br>` → xuống dòng |
| Clean text | Xoá emoji, backtick |

---

## TEMPLATE mode — `testcase_builder.js`

### Cách dùng (3 bước)

1. **Copy skeleton từ `examples/` sang `features/`:**

   ```powershell
   Copy-Item scripts/convert_excel/examples/gen_testcase.template.js scripts/convert_excel/features/gen_<feature>.js
   ```

2. **Sửa file `features/gen_<feature>.js`:**
   - Đổi `FUNCTION_NAME`, `CREATOR`, `CREATE_DATE`, `RELEASE`, `SHEET_PREFIX`
   - Điền `guiSection` (UI test cases) + `logicSections` (chia ĐÚNG theo số mục trong spec)
   - Mỗi row: `{ to: 'Test Object', sub: 'Sub Test Object', input: '[Tiền điều kiện] ...\n1. ...', output: '1. ...' }`
   - Các row liên tiếp cùng `to` sẽ tự động merge cột Test Object

3. **Chạy** (output theo convention `【APP】<FeatureName>.xlsx` — giống Push gốc trong `Test Result/`):

   ```bash
   node scripts/convert_excel/features/gen_<feature>.js "Test Result/<release>/App/<folder>/【APP】<FeatureName>.xlsx"
   ```

### Engine hoạt động (Copy+Fill)

1. Load `templates/testcase/app-testcase-template.xlsx`
2. Clone sheet `Home_GUI` thành `<prefix>_GUI` và `<prefix>_LOGIC` (giữ NGUYÊN style/border/font/merge/formula)
3. Capture style row 10 (section) + row 11 (data) làm anchor
4. Clear data rows 10+ trong 2 sheet vừa clone
5. Fill data mới, apply style anchor, auto-merge Test Object trùng theo cụm
6. Update Summary common info (rows 2-11) + detail rows (28+) trỏ tới 2 sheet mới
7. Remove sheet phụ của template gốc
8. Save output

### Output

| Sheet | Mô tả |
|---|---|
| `Summary` | Common info + Total summary (SUM column V/W/X/Y/Z) + Detail summary (formula trỏ tới `<sheet>!G2..G6`) |
| `<prefix>_GUI` | Test cases GUI — cột A auto-number qua `=ROW()-10`, cột B merge theo Test Object cụm |
| `<prefix>_LOGIC` | Test cases Logic — chia theo từng mục spec, mỗi mục 1 section title row |

### Override template

Truyền `config.template` để dùng template khác:

```js
await generateTestcase({
  template: path.resolve(__dirname, '../../templates/testcase/web-testcase-template.xlsx'),
  // ...
});
```

---

## Lưu ý cho Agent

- **KHÔNG** tự viết lại logic convert/build — luôn dùng 2 script có sẵn.
- **KHÔNG** sửa trực tiếp `templates/testcase/app-testcase-template.xlsx` (canonical).
- Khi user yêu cầu file deliverable cho QA team → **bắt buộc** dùng TEMPLATE mode.
- Khi chỉ cần preview trung gian → có thể dùng FLAT mode cho nhanh.
- Nếu thiếu `node_modules` → chạy `npm install` trong `scripts/convert_excel/` trước.
- Output bằng **Tiếng Việt**.

## Reference

- Template: [templates/testcase/README.md](../../templates/testcase/README.md)
- Skill bổ trợ: [`format_testcase`](../format_testcase/SKILL.md) — quy tắc tổ chức GUI/Logic, merge Test Object, chia quan điểm test
- Prompt orchestrator: [`generate_manual_testcases_rbt.prompt.md`](../../prompts/generate_manual_testcases_rbt.prompt.md)
