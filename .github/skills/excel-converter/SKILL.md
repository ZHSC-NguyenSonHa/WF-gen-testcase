---
name: excel-converter
description: Skill convert file Markdown Test Cases sang Excel (.xlsx) có format đẹp (column widths, freeze panes, AutoFilter, line breaks) bằng script Node.js scripts/convert_excel/md_to_xlsx.js.
---

# Excel Converter Skill

## Mô tả

Skill này convert file **Markdown chứa bảng Test Cases** sang file **Excel (`.xlsx`)** có format đẹp, sẵn sàng chia sẻ — dùng script Node.js `scripts/convert_excel/md_to_xlsx.js`.

---

## Khi nào sử dụng

Agent dùng skill này khi user yêu cầu:

- Convert test cases Markdown sang Excel / `.xlsx`
- Xuất bảng test case ra file Excel để chia sẻ
- "convert md to xlsx", "export test cases to excel", "tạo file excel test case"

---

## Cấu trúc Script

```
scripts/convert_excel/
├── md_to_xlsx.js      # Script chính convert MD → XLSX
├── package.json       # Dependency: xlsx ^0.18.5
└── README.md          # Tài liệu chi tiết
```

---

## Điều kiện tiên quyết

- **Node.js** ≥ 16
- Cài dependencies:

```bash
cd scripts/convert_excel
npm install
```

---

## Cách dùng

```bash
# Từ thư mục gốc project
node scripts/convert_excel/md_to_xlsx.js <input.md> [output.xlsx]
```

**Ví dụ:**

```bash
# Output tự động cùng thư mục, cùng tên (đuôi .xlsx)
node scripts/convert_excel/md_to_xlsx.js requirements/crm/test_cases_crm_login.md

# Chỉ định output path
node scripts/convert_excel/md_to_xlsx.js requirements/crm/test_cases_crm_login.md output/crm_login.xlsx
```

---

## Định dạng Input

File Markdown chứa bảng có cột **`TC ID`** (script tự nhận diện mọi bảng có cột này):

```markdown
| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------|
| TC_001 | ... | 🔴 High | ... | ... | Step 1<br>Step 2 | ... | Critical | ... |
```

> Format input này khớp với output của workflow **`workflow_manual/06_template_mapping`**.

---

## Output

File `.xlsx` với các tính năng:

| Tính năng | Mô tả |
|-----------|-------|
| **Column widths** | Tự set độ rộng phù hợp từng cột |
| **Freeze panes** | Cố định dòng header khi cuộn |
| **AutoFilter** | Bộ lọc tự động trên header |
| **Line breaks** | `<br>` chuyển thành xuống dòng trong cell |
| **Clean text** | Tự xóa emoji, backtick markdown |

---

## Lưu ý cho Agent

- Chạy script qua terminal (`runCommands`), KHÔNG tự viết lại logic convert.
- Nếu thiếu `node_modules`, chạy `npm install` trong `scripts/convert_excel` trước.
- Output bằng **Tiếng Việt**.
