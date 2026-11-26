---
name: format-testcase-listall
description: Skill tạo và chuẩn hóa manual testcase cho template testcase_template_Listall.xlsx (màn hình danh sách/list-all).
argument-hint: "Đường dẫn spec hoặc ảnh màn hình list, output folder, release/version"
---

# Format Testcase List-All Screen

## Mục tiêu

Sinh bộ testcase cho màn hình danh sách theo template [templates/testcase/testcase_template_Listall.xlsx](templates/testcase/testcase_template_Listall.xlsx).

## Phạm vi

Dùng cho màn hình list có filter/search/paging/sort/action:
- Bộ lọc
- Bảng dữ liệu
- Paging
- Sort
- Hành động theo dòng (view/edit/delete/duplicate)

## Input tối thiểu

1. Spec hoặc ảnh màn hình list
2. Rule filter/search/sort/paging
3. Rule hành động theo trạng thái dòng
4. Output path

## Quy tắc bắt buộc

1. Mỗi filter phải có case độc lập và case kết hợp.
2. Có case no data, has data, large data.
3. Có case paging first/next/last và giữ điều kiện filter.
4. Có case sort tăng/giảm cho cột trọng yếu.
5. Có case action theo từng trạng thái record.

## Cấu trúc output

1. Summary
2. GUI List
3. List Logic
4. Action Behavior

## Checklist nhanh

- Có cover toàn bộ cột header
- Có cover filter đơn và tổ hợp
- Có cover paging và sort
- Có cover enable/disable action theo trạng thái
