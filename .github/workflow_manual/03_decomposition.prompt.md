---
description: "[Manual Workflow - Bước 3/6] Phân rã hệ thống thành Module/Sub-module, mô tả chức năng và sơ đồ phụ thuộc."
name: manual-step-3-decomposition
agent: agent
tools: ['codebase', 'editFiles', 'fetch', 'search', 'usages']
---

# Workflow Manual — Bước 3: Phân Rã Hệ Thống (Decomposition)

> **BẮT BUỘC (MANDATORY SKILL):** Nạp skill **`rbt-manual-testing`** trước khi bắt đầu.
> Gửi prompt này **SAU KHI** đã trả lời hết Q&A ở [Bước 2 — Analysis & QnA](02_analysis_and_qna.prompt.md). Tiếp theo: [Bước 4 — Traceability](04_traceability.prompt.md).

## ⚠️ Nguyên tắc thực thi

- Giả định các yêu cầu đã được làm rõ qua Q&A ở Bước 2. Output bằng **Tiếng Việt** (Markdown, có thể dùng bảng hoặc tree diagram).

## Yêu cầu output

### 1. Phân rã Module (Feature Mapping)
Chia tính năng thành Module và Sub-module cụ thể. Gợi ý phạm vi phân rã (chọn 1 hoặc kết hợp):
- **Theo cụm UI:** Header, Sidebar, Data Table, Form nhập liệu, Popup, Dialog...
- **Theo luồng tác vụ:** Flow tạo mới, chỉnh sửa, xóa, tìm kiếm...
- **Theo đối tượng:** Quản lý User, Product, Order...

### 2. Mô tả chức năng
Với mỗi Module/Sub-module: tên module (ngắn gọn, rõ nghĩa), mô tả chức năng (1-2 câu), các thành phần UI chính.

### 3. Sơ đồ phụ thuộc (Dependencies)
Chỉ ra sự phụ thuộc và dữ liệu tương tác giữa các Module. VD: "Data Table" phụ thuộc dữ liệu từ "Form Đăng ký"; "Chi tiết Khách hàng" phụ thuộc "Danh sách Khách hàng".

> Sau khi hoàn thành, sẵn sàng sang Bước 4 (Traceability & Gap Analysis).
