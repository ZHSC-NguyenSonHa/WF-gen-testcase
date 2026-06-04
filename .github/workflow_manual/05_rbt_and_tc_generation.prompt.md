---
description: "[Manual Workflow - Bước 5/6] Sinh test case chi tiết theo Risk-Based Testing với field-level validation và test design techniques."
name: manual-step-5-rbt-tcgen
agent: agent
tools: ['codebase', 'editFiles', 'fetch', 'search', 'usages']
---

# Workflow Manual — Bước 5: Sinh Test Case Chi Tiết (RBT & TC Generation)

> **BẮT BUỘC (MANDATORY SKILL):** Nạp skill **`rbt-manual-testing`** trước khi bắt đầu.
> Gửi prompt này **SAU KHI** đã review scenarios ở [Bước 4 — Traceability](04_traceability.prompt.md). Tiếp theo: [Bước 6 — Template Mapping](06_template_mapping.prompt.md).

## ⚠️ Nguyên tắc thực thi

- Áp dụng **Risk-Based Testing (RBT)**. Output bằng **Tiếng Việt**.
- Nếu scenarios quá nhiều → sinh test case **từng Module một**.

## Yêu cầu cho mỗi Test Case

### 1. Đánh giá rủi ro (Risk Assessment)
- **High Risk:** nghiệp vụ cốt lõi, tiền/bảo mật → test kỹ, nhiều TC.
- **Medium Risk:** quan trọng nhưng không critical → test vừa phải.
- **Low Risk:** tính năng phụ → test cơ bản, happy path.

### 2. Cấu trúc Test Case
Mỗi TC đủ: Module/Sub-module, Test Case Title, Pre-conditions, Test Steps (đánh số), Expected Results (đánh số), Test Data, Priority, Risk Level.

### 3. Quy tắc Test Data — PHẢI CỤ THỂ
```
❌ SAI: "Nhập email hợp lệ"          ✅ ĐÚNG: "Nhập email: test_customer_01@domain.com"
❌ SAI: "Nhập số điện thoại sai"      ✅ ĐÚNG: "Nhập SĐT: abc123xyz (chữ thay vì số)"
❌ SAI: "Nhập tên quá dài"            ✅ ĐÚNG: "Nhập tên: [256 ký tự 'A'] (vượt giới hạn 255)"
```

### 4. Phạm vi bao phủ
Happy Path, Negative Path, Boundary Values (min, max, min-1, max+1), Edge Cases (timeout, mất kết nối, concurrent access). Bổ sung: phân quyền, responsive/multi-browser, performance (1000+ records).

### 5. Field-Level Validation (BẮT BUỘC)
1. Liệt kê **tất cả input fields** trên form/UI.
2. Sinh validation TC riêng cho **TỪNG trường** theo đặc tính (type, required, min/max, format, unique).
3. **KHÔNG gộp** validation nhiều trường vào 1 test case.

| Loại Field | Validation cần test |
|---|---|
| **Text** | Required · Min/Max length · Whitespace-only · Ký tự đặc biệt (`<>&"'`) · XSS (`<script>`) · SQL injection (`' OR 1=1--`) · Unicode/Emoji · Leading/trailing spaces |
| **Email** | Format hợp lệ · Thiếu `@`/domain · Nhiều `@` · Max length · Case sensitivity · Email trùng (nếu unique) |
| **Phone** | Chỉ số · Prefix (`+84`, `0`) · Min/Max length · Chữ xen lẫn · Dấu `-`, `.`, space |
| **Date / DateTime** | Format · Ngày không tồn tại (`31/02`) · Năm nhuận · Quá khứ/tương lai · Min/Max · Timezone |
| **Number / Currency** | Min/Max · Số âm · Số 0 · Thập phân · Ký tự không phải số · Overflow · Leading zeros |
| **Dropdown / Select** | Default · Tất cả options · Option disabled · Required |
| **Checkbox / Radio** | Default · Check/Uncheck · Required · Nhóm radio (chỉ 1) |
| **File Upload** | File type · Max size · File rỗng · Tên file ký tự đặc biệt · Multiple files |
| **Password** | Min/Max length · Ký tự đặc biệt · Hoa/thường · Số · Copy-paste · Hiện/ẩn · Confirm |
| **Textarea** | Max length · Line breaks · HTML tags · Character counter |

### 6. Test Design Techniques
- **Equivalence Partitioning:** chia data thành nhóm tương đương, test 1 đại diện/nhóm.
- **Boundary Value Analysis (BVA):** test min, min±1, max, max±1.
- **Decision Table:** khi logic nhiều điều kiện (AND/OR) → liệt kê tổ hợp → kết quả.
- **State Transition:** đối tượng nhiều trạng thái (workflow, order status) → test transition hợp lệ + không hợp lệ.

> Chọn kỹ thuật phù hợp cho từng Module/Field dựa trên đặc tính dữ liệu và logic nghiệp vụ.
