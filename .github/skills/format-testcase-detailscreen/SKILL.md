---
name: format-testcase-detailscreen
description: Skill tạo và chuẩn hóa manual testcase cho template testcase_template_Detailscreen.xlsx (màn hình chi tiết/view-edit).
argument-hint: "Đường dẫn spec hoặc ảnh màn hình detail, output folder, release/version"
---

# Format Testcase Detail Screen

## Mục tiêu

Sinh bộ testcase cho màn hình chi tiết theo template [templates/testcase/testcase_template_Detailscreen.xlsx](templates/testcase/testcase_template_Detailscreen.xlsx).

## Phạm vi

Dùng cho màn hình xem/sửa thông tin chi tiết:
- Field read-only
- Field editable
- Metadata (created/updated by, time)
- Action Update, Back, Delete (nếu có)

## Input tối thiểu

1. Spec hoặc ảnh màn hình detail
2. Rule phân quyền edit/view
3. Điều kiện dữ liệu trước khi vào detail
4. Output path

## Quy tắc bắt buộc

1. Tách testcase theo cụm: Display, Edit, State, Permission.
2. Có case read-only không cho chỉnh sửa.
3. Có case cập nhật thành công và dữ liệu được persist.
4. Có case cập nhật thất bại khi input sai rule.
5. Có case đồng bộ dữ liệu List <-> Detail sau update.

## Cấu trúc output

1. Summary
2. GUI Display
3. Detail Logic
4. Permission and Audit

## Checklist nhanh

- Đủ case hiển thị dữ liệu cũ
- Đủ case update với dữ liệu hợp lệ/không hợp lệ
- Đủ case kiểm tra updated timestamp/user
- Đủ case role không đủ quyền
