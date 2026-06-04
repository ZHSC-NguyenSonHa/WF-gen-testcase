---
description: "[Manual Workflow - Bước 2/6] Phân tích yêu cầu: xác định flows, phát hiện điểm mờ (ambiguity) và đặt câu hỏi Q&A có đánh số."
name: manual-step-2-analysis-qna
agent: agent
tools: ['codebase', 'editFiles', 'fetch', 'search', 'usages']
---

# Workflow Manual — Bước 2: Phân Tích Yêu Cầu & Q&A (Analysis & QnA)

> **BẮT BUỘC (MANDATORY SKILL):** Nạp skill **`rbt-manual-testing`** (+ `requirements-analyzer`) trước khi bắt đầu.
> Gửi prompt này **SAU KHI** đã hoàn thành [Bước 1 — Context & Role-play](01_context_and_roleplay.prompt.md). Tiếp theo: [Bước 3 — Decomposition](03_decomposition.prompt.md).

## ⚠️ Nguyên tắc thực thi

- Output bằng **Tiếng Việt**, Markdown có cấu trúc.

## Nhiệm vụ

Dựa trên tài liệu yêu cầu và bối cảnh ở Bước 1, phân tích chi tiết:

### 1. Xác định luồng (Flows)
- **Happy Path:** luồng nghiệp vụ chính.
- **Alternate Paths:** luồng rẽ nhánh hợp lệ.
- **Exception Paths:** luồng ngoại lệ / lỗi (mất kết nối, timeout, sai định dạng, upload quá dung lượng, concurrent access...).

### 2. Phát hiện điểm mờ (Ambiguity Detection)
- **Thiếu sót:** thông tin chưa được đề cập.
- **Mâu thuẫn:** các yêu cầu trái ngược.
- **Chưa rõ ràng:** yêu cầu hiểu được theo nhiều cách.

Gợi ý kiểm tra: độ dài min/max từng trường, timeout API, hành vi khi mất kết nối, quy tắc phân quyền, định dạng đầu vào (email, SĐT, ngày tháng).

### 3. Đặt câu hỏi (Q&A)
Danh sách câu hỏi **có đánh số** (Q1, Q2, Q3...) cho user/PO/BA. Mỗi câu:
- Đánh số rõ ràng.
- Nêu ngữ cảnh tại sao cần hỏi.
- Đề xuất giả định (assumption) nếu không được trả lời.

> ⏸️ **CHECKPOINT:** SAU KHI hoàn thành, dừng lại chờ user trả lời các câu hỏi trước khi sang Bước 3.
