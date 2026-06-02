---
description: "[Automation Workflow - Bước 3/6] Thiết kế kiến trúc Page Object Model từ locators đã thu thập (chưa sinh test script)."
mode: agent
tools: ['codebase', 'editFiles', 'search', 'usages']
---

# Workflow Automation — Bước 3: Thiết Kế Kiến Trúc POM (POM Design)

> **BẮT BUỘC (MANDATORY SKILL):** Nạp skill **`qa_automation_engineer`** trước khi bắt đầu.
> Gửi prompt này **SAU KHI** đã review locators ở [Bước 2 — Analysis & UI Recon](02_analysis_and_ui_recon.prompt.md). Tiếp theo: [Bước 4 — Test Data Strategy](04_test_data_strategy.prompt.md).

## ⚠️ Nguyên tắc thực thi

- ⛔ **CHƯA sinh file Test script** — chỉ thiết kế Page classes.
- Tuân thủ `.github/instructions/automation.instructions.md` (naming conventions, POM structure).
- Output bằng **Tiếng Việt**.

## Yêu cầu

Dựa trên danh sách locators **đã thu thập từ DOM thật** ở Bước 2, thiết kế kiến trúc **Page Object Model (POM)**:

### 1. Định nghĩa Class Page
- Mỗi trang/section là 1 class riêng, tên class mang ngữ nghĩa rõ ràng.
- VD: `LoginPage`, `DashboardPage`, `CustomerFormPage`, `CustomerListPage`.

### 2. Khai báo Locators
- Dùng chính xác locators đã thu thập ở Bước 2 — **không tự thay đổi** trừ khi có lý do.
- Ưu tiên bộ chọn vững chãi: `data-testid`, `id`, `name`, `role`.

```typescript
// Playwright
readonly emailInput = this.page.getByLabel('Email');
readonly submitButton = this.page.getByRole('button', { name: 'Submit' });
```

```java
// Selenium
private final By emailInput = By.id("email");
private final By submitButton = By.cssSelector("button[data-testid='submit-btn']");
```

### 3. Đóng gói Methods
- Đặt tên method theo **hành động nghiệp vụ** (không theo kỹ thuật).
- Mỗi method thực hiện 1 hành động rõ ràng; return `this` hoặc Page tiếp theo (fluent pattern).

```
✅ ĐÚNG: fillCustomerForm(), submitAndVerifySuccess()
❌ SAI:  clickButton(), inputText()
```

### 4. Quy tắc quan trọng
- ✅ Phác thảo cấu trúc file, tên class, locator declarations, method signatures.
- ✅ Có thể viết body method nếu logic rõ ràng.

> ⏸️ **CHECKPOINT:** Trình bày cấu trúc POM để user review kiến trúc trước khi sinh test script ở Bước 5.
