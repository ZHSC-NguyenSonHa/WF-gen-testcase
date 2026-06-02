---
description: "[Automation Workflow - Bước 5/6] Sinh test script hoàn chỉnh, tự chạy và self-fix loop đến khi PASS."
mode: agent
tools: ['codebase', 'editFiles', 'runCommands', 'search', 'usages', 'testFailure']
---

# Workflow Automation — Bước 5: Sinh Mã Automation (Script Generation)

> **BẮT BUỘC (MANDATORY SKILL):** Nạp skill **`qa_automation_engineer`** trước khi bắt đầu.
> Gửi prompt này **SAU KHI** đã review POM (Bước 3) và Data (Bước 4). Tiếp theo: [Bước 6 — Review & Refactor](06_review_and_refactor.prompt.md).
> Tham khảo rules theo framework: `.github/instructions/playwright.instructions.md`, `selenium.instructions.md`, `appium.instructions.md`.

## ⚠️ Nguyên tắc thực thi

- ⛔ TUYỆT ĐỐI không dùng `Thread.sleep()`, `page.waitForTimeout()`, `time.sleep()`.
- ✅ Mỗi test case độc lập (test independence). Output bằng **Tiếng Việt**.

## Yêu cầu

### 1. Cấu trúc code
- Import và khởi tạo Page classes (Bước 3), dùng Data Generator (Bước 4).
- Chia code theo pattern **Arrange → Act → Assert**.

### 2. Assertions
- **BẮT BUỘC** có assertion ở cuối mỗi test case, xen kẽ ở bước quan trọng.

```typescript
// Playwright
await expect(page.getByText('Đăng nhập thành công')).toBeVisible();
await expect(page).toHaveURL(/dashboard/);
```

```java
// Selenium/TestNG
Assert.assertTrue(dashboardPage.isDisplayed(), "Dashboard should be visible after login");
Assert.assertEquals(driver.getTitle(), "Dashboard");
```

### 3. Smart Waits
- Playwright: auto-waiting + `expect().toBeVisible()`.
- Selenium: `WebDriverWait` + `ExpectedConditions`.

### 4. Test Independence
- Setup/teardown rõ ràng (`beforeEach`/`afterEach` hoặc `@BeforeMethod`/`@AfterMethod`).
- Test data unique mỗi lần chạy.

### 5. Self-fix Loop (BẮT BUỘC)
Sau khi sinh code, AI **phải tự chạy test**:
1. Execute test bằng terminal.
2. Nếu **PASS** → DONE, sang Bước 6.
3. Nếu **FAIL** → đọc error log → phân tích root cause → sửa code → chạy lại.
4. Lặp đến khi PASS ổn định.
5. **KHÔNG hỏi user** trong quá trình self-fix (trừ khi phát hiện business rule không rõ, hoặc sau 5 vòng auto-heal).
