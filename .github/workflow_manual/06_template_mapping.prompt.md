---
description: "[Manual Workflow - Bước 6/6] Chuẩn hóa toàn bộ test cases vào bảng Markdown chuẩn, xuất Artifact để import Excel/Jira/TestRail/Xray."
mode: agent
tools: ['codebase', 'editFiles', 'search']
---

# Workflow Manual — Bước 6: Chuẩn Hóa Format (Template Mapping)

> **BẮT BUỘC (MANDATORY SKILL):** Nạp skill **`rbt_manual_testing`** trước khi bắt đầu.
> Gửi prompt này **SAU KHI** đã review Test Cases ở [Bước 5 — RBT & TC Generation](05_rbt_and_tc_generation.prompt.md). Đây là bước cuối.

## ⚠️ Nguyên tắc thực thi

- Output bằng **Tiếng Việt**, dạng **Artifact** (file `.md`).
- Có thể convert sang Excel bằng skill **`excel_converter`** (`scripts/convert_excel/md_to_xlsx.js`).

## Nhiệm vụ

Chuẩn hóa toàn bộ Test Cases ở Bước 5 vào bảng Markdown chuẩn (phù hợp copy/paste sang Excel hoặc import Jira/Zephyr/Xray/TestRail).

### Bảng chuẩn

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data |

### Quy tắc lập bảng

**TC ID:** format thống nhất `[DỰ_ÁN]_[MODULE]_TC_[SỐ]` (VD: `CRM_CUST_TC_001`), tăng dần liên tục, không nhảy số.

**Test Steps & Expected Result:** PHẢI đánh số thứ tự; dùng `<br>` để xuống dòng trong cell.
```
1. Mở trang Login<br>2. Nhập email: test@mail.com<br>3. Nhập password: Test@123<br>4. Click "Đăng nhập"
```

### Quy tắc TUYỆT ĐỐI
- ❌ KHÔNG bỏ sót/rút gọn bất kỳ Test Case nào đã sinh ở Bước 5.
- ❌ KHÔNG tự ý gộp/merge các Test Case khác nhau.
- ✅ Nếu bảng quá dài → chia **Part 1, Part 2...** và hỏi user trước khi tiếp.

## Output
Xuất kết quả dạng **Artifact** (file `.md`) để copy vào Excel/Google Sheets hoặc import Jira/TestRail/Xray. Nếu tổng số Test Cases > 30, chia artifact nhiều phần và hỏi "Tiếp tục Part X?" trước khi sinh tiếp.
