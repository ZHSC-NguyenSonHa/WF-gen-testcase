---
description: "[Manual Workflow - Bước 4/6] Xây Traceability Matrix, Gap Analysis và High-Level Test Scenarios để đảm bảo độ bao phủ."
mode: agent
tools: ['codebase', 'editFiles', 'search']
---

# Workflow Manual — Bước 4: Đảm Bảo Độ Bao Phủ (Traceability & Gap Analysis)

> **BẮT BUỘC (MANDATORY SKILL):** Nạp skill **`rbt_manual_testing`** trước khi bắt đầu.
> Gửi prompt này **SAU KHI** đã review phân rã ở [Bước 3 — Decomposition](03_decomposition.prompt.md). Tiếp theo: [Bước 5 — RBT & TC Generation](05_rbt_and_tc_generation.prompt.md).

## ⚠️ Nguyên tắc thực thi

- Output bằng **Tiếng Việt**, dạng bảng Markdown.
- Đây là **điểm chốt chặn nhân sự (Human Checkpoint)** — tester cần tự đánh giá rủi ro (Risk Assessment) cho từng Module.

## Nhiệm vụ

### 1. Traceability Mapping
Map từng Module/Sub-module/Rule logic với một mã yêu cầu định danh (`REQ-01`, `REQ-02`...).

| REQ ID | Module | Mô tả Yêu cầu |
|--------|--------|----------------|

### 2. Gap Analysis
Cross-check tài liệu gốc xem có thông tin nào bị **thiếu** trong danh sách phân rã: chức năng chưa map, điều kiện đầu vào chưa liệt kê, business rule bị bỏ sót. **Nếu phát hiện thiếu sót, báo cáo cụ thể.**

### 3. High-Level Test Scenarios
Liệt kê kịch bản kiểm thử cấp High-Level cho từng Module (mỗi scenario 1 câu mô tả cốt lõi). Trọng tâm gợi ý: Security/Phân quyền, UI Validation, Business Logic, Data Integrity, Error Handling.

| REQ ID | Module | Scenario ID | Mô tả Scenario |
|--------|--------|-------------|-----------------|

> ⏸️ **CHECKPOINT:** SAU KHI hoàn thành, dừng lại để user review danh sách scenarios (bổ sung/xác nhận) trước khi sang Bước 5.
