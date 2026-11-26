---
name: format_testcase
description: Quy tắc tổ chức testcase GUI/Logic, merge Test Object và chia quan điểm test cho file Excel deliverable (TEMPLATE mode của excel-converter).
argument-hint: "Feature/màn hình cần xuất testcase, output folder, release/version"
---

# Format Testcase — Quy tắc tổ chức GUI / Logic

Skill bổ trợ cho `rbt-manual-testing` và `excel-converter` ở bước xuất Excel deliverable.

## Cấu trúc file Excel

| Sheet | Nội dung |
|-------|----------|
| `Summary` | Tổng hợp kết quả (công thức từ template canonical) |
| `<feature>_GUI` | Test case hiển thị/giao diện |
| `<feature>_LOGIC` | Test case nghiệp vụ, chia theo từng mục trong spec |

## Quy tắc tổ chức

1. **GUI**: kiểm tra layout, label, trạng thái hiển thị/ẩn/disable, placeholder, thứ tự item, format hiển thị.
2. **LOGIC**: chia section theo ĐÚNG số mục trong spec; mỗi mục 1 section title row. Gồm hành vi khi thao tác, validate, điều kiện biên, luồng chuyển màn hình, tương tác API/dữ liệu.
3. **Test Object / Sub Test Object**: các row liên tiếp có cùng Test Object phải đặt cạnh nhau để tự động merge cột Test Object.
4. **Input**: ghi `[Tiền điều kiện]` ở dòng đầu, sau đó các bước đánh số `1. 2. 3.`.
5. **Output**: kết quả mong đợi đánh số tương ứng với các bước.
6. Mỗi row chỉ kiểm tra **một** quan điểm chính; không gộp nhiều kết quả không liên quan vào một row.

## Quan điểm chia test

- Hiển thị mặc định (initial state)
- Nhập liệu hợp lệ / không hợp lệ / biên (min, max, rỗng)
- Phụ thuộc giữa các item (enable/disable, auto-fill)
- Quyền người dùng và trạng thái dữ liệu
- Xử lý lỗi (thông báo, mạng, timeout)
- Luồng điều hướng và trạng thái sau khi quay lại

## Liên quan

- Xuất file: skill [`excel-converter`](../excel-converter/SKILL.md) (TEMPLATE mode, không dùng FLAT cho deliverable cuối).
- Mẫu bảng markdown: [testcase-table-template.md](./assets/testcase-table-template.md)
