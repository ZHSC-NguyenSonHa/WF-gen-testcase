# Excel Converter Script

Convert file Markdown chứa bảng Test Cases (có cột `TC ID`) sang Excel `.xlsx` có format đẹp.

## Cài đặt

```bash
cd scripts/convert_excel
npm install
```

## Cách dùng

```bash
# Từ thư mục gốc project
node scripts/convert_excel/md_to_xlsx.js <input.md> [output.xlsx]
```

- Nếu không truyền `output.xlsx`, file output được tạo cùng thư mục, cùng tên với input (đuôi `.xlsx`).
- Script tự nhận diện bảng Markdown có cột `TC ID`.

## Tính năng output

| Tính năng | Mô tả |
|-----------|-------|
| Column widths | Tự set độ rộng phù hợp từng cột |
| Freeze panes | Cố định dòng header khi cuộn |
| AutoFilter | Bộ lọc tự động trên header |
| Line breaks | `<br>` chuyển thành xuống dòng trong cell |
| Clean text | Tự xóa emoji, backtick markdown |
