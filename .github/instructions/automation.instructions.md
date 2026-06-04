---
description: Quy tắc QA Automation chi tiết (POM, Browser viewport, Smart Waits, Test Data, Assertions, Naming, Test Independence) — áp dụng mọi automation framework.
applyTo: '**/*.{java,ts,js}'
---

# Quy Tắc QA Automation (Chi Tiết)

> Áp dụng khi mở/sửa file `.java/.ts/.js`. Bổ sung cho `copilot-instructions.md`. Đặc thù framework xem `playwright.instructions.md` / `selenium.instructions.md` / `appium.instructions.md`.

## 1. Page Object Model (POM)

- **Page classes:** locators + methods tương tác UI
- **Test classes:** logic kiểm thử + assertions (chỉ assert TRONG test class)
- **Utils/Test data:** tách riêng (JSON, DataProvider, Faker generator)

## 2. Browser & Viewport (UI Automation)

- **Viewport debug:** `1920x1080` (desktop). Headed mode khi debug, headless cho CI/CD sau khi PASS.
- **Playwright MCP order:** `navigate → resize(1920,1080) → wait_for(load) → snapshot → interact → screenshot(on_fail)`. KHÔNG `browser_navigate` lại nếu đã ở đúng trang.
- **Mobile (Appium):** dùng device viewport thật; xem `appium.instructions.md` §5.

## 3. Smart Waits (BẮT BUỘC)

⛔ **NGHIÊM CẤM:** `Thread.sleep`, `page.waitForTimeout`, `time.sleep`, `setTimeout` cố định.

✅ **Dùng:**

| Framework | Smart Wait |
|---|---|
| Playwright | `await expect(locator).toBeVisible()`, auto-waiting, Locator APIs |
| Selenium | `WebDriverWait` + `ExpectedConditions` |
| Appium | `WebDriverWait` + custom conditions, `UiScrollable` cho scroll |

Mọi assertion phải có **timeout rõ ràng** hoặc dùng default hợp lý.

## 4. Test Data

- Trường unique (Email, Username, Code/ID) **bắt buộc sinh động** — KHÔNG hardcode trùng.
- Format **traceable** truy ngược được:
  ```
  [prefix]_[testName]_[timestamp]_[random]
  Ví dụ: auto_createCustomer_20260402_A3F2@test.com
  ```
- Hỗ trợ parallel: mỗi test method có data riêng, không conflict.
- Dùng UUID, Timestamp, Faker (JS/TS) hoặc JavaFaker.

## 5. Assertions

- Mỗi test case có **ít nhất 1 assertion** ở cuối + assertion xen kẽ ở bước quan trọng.
- Luôn kèm **message mô tả** expected behavior:
  ```java
  Assert.assertTrue(dashboard.isDisplayed(), "Dashboard phải hiển thị sau khi đăng nhập");
  ```
  ```typescript
  await expect(page.getByText('Đăng nhập thành công')).toBeVisible();
  ```

## 6. Test Independence

- Mỗi test case **độc lập** — không phụ thuộc test khác.
- Setup/teardown rõ ràng: `@BeforeMethod/@AfterMethod` (TestNG) hoặc `beforeEach/afterEach` (Playwright).
- Không chia sẻ state giữa các test methods.

### Template TestNG (Selenium + Appium)

```java
public class LoginTest extends BaseTest {

    @BeforeMethod
    public void setUp() { /* navigate, init data */ }

    @Test(groups = {"smoke", "regression"})
    public void testLoginWithValidCredentials() {
        // Arrange
        LoginPage loginPage = new LoginPage(driver);
        String email = DataGenerator.generateEmail("login");

        // Act
        loginPage.login(email, "ValidPass@123");

        // Assert
        DashboardPage dashboard = new DashboardPage(driver);
        Assert.assertTrue(dashboard.isDisplayed(), "Dashboard phải hiển thị");
    }

    @AfterMethod
    public void tearDown() { /* cleanup */ }
}
```

### Template Playwright

```typescript
test.describe('Tên Module', () => {
  test.beforeEach(async ({ page }) => { /* navigate, login */ });

  test('mô tả hành vi', async ({ page }) => {
    // Arrange → Act → Assert
  });
});
```

## 7. Naming Conventions

### Java

| Thành phần | Quy tắc | Ví dụ |
|---|---|---|
| Page/Screen class | PascalCase + `Page` (web) / `Screen` (mobile) | `LoginPage.java`, `HomeScreen.java` |
| Test class | PascalCase + `Test` | `LoginTest.java` |
| Test method | `test` + mô tả hành vi | `testLoginWithValidCredentials()` |
| Locator biến | lowerCamelCase + tên element | `loginButton`, `usernameInput` |
| Utils class | PascalCase + chức năng | `DataGenerator.java`, `WaitHelper.java` |

### TypeScript / Playwright

| Thành phần | Quy tắc | Ví dụ |
|---|---|---|
| Page class | PascalCase + `Page` | `LoginPage.ts` |
| Test file | kebab-case + `.spec.ts` | `login.spec.ts` |
| Test block | `test('mô tả hành vi')` | `test('đăng nhập thành công')` |
| Locator biến | `readonly` lowerCamelCase | `readonly loginButton` |
| Utils | PascalCase hoặc kebab-case | `DataGenerator.ts` |

## 8. Code Quality

- KHÔNG logic trùng lặp — extract helper methods.
- Trước khi deliver: xoá `console.log/System.out.println/print()`, code commented (`//`, `/* */`), unused locators/variables/imports.
- KHÔNG tự xoá file source khi chưa xác nhận user.
- Kiểm tra cấu trúc thư mục trước khi tạo file mới — tránh duplicate.
