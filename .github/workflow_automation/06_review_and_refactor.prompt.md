---
description: "[Automation Workflow - Bước 6/6] Review & refactor code: xóa debug artifacts, kiểm tra quality/stability, sẵn sàng CI/CD."
name: automation-step-6-review
agent: agent
tools: ['codebase', 'editFiles', 'runCommands', 'fetch', 'search', 'usages']
---

# Workflow Automation — Bước 6: Kiểm Duyệt & Tối Ưu (Review & Refactoring)

> **BẮT BUỘC (MANDATORY SKILL):** Nạp skill **`qa-automation-engineer`** trước khi bắt đầu.
> Gửi prompt này **SAU KHI** test đã chạy PASS ở [Bước 5 — Script Generation](05_script_generation.prompt.md). Đây là bước cuối của workflow.

## ⚠️ Nguyên tắc thực thi

- Trả lại phiên bản **Clean Code** cuối cùng, sẵn sàng commit. Output bằng **Tiếng Việt**.

## Nhiệm vụ Refactoring

### 1. Xóa debug artifacts
- Xóa `console.log`, `System.out.println`, `print()` sinh khi debug.
- Xóa code bị comment không còn dùng, biến/locator khai báo nhưng không dùng.

### 2. Kiểm tra code quality
- [ ] Tên biến, method rõ nghĩa?
- [ ] Method nào quá dài cần tách? (>20 dòng)
- [ ] Logic trùng lặp cần extract thành helper?
- [ ] Import statements sạch?

### 3. Kiểm tra test stability
- [ ] Có hard sleep nào lọt qua?
- [ ] Assertions đủ và chính xác?
- [ ] Test data unique mỗi lần chạy?
- [ ] Mỗi test case độc lập?

### 4. CI/CD Readiness

```typescript
// Playwright — gắn tag để chạy selective
test.describe('Login Module', () => {
  test.describe.configure({ mode: 'parallel' });
});
```

```java
// Selenium/Appium TestNG
@Test(groups = {"smoke", "regression"})
public void testLoginSuccess() { ... }
```

### 5. Documentation (tùy chọn)
- Thêm comment cho method phức tạp; cập nhật README nếu thay đổi cấu trúc project.

> Trả lại phiên bản code cuối cùng hoàn thiện nhất (Clean Code), sẵn sàng commit.
