---
description: Đặc thù Playwright (locator semantic, MCP debug, web-first assertions). Quy tắc chung xem automation.instructions.md.
applyTo: '**/*.{ts,js}'
---

# Quy Tắc Playwright (Đặc Thù)

> Quy tắc chung (POM, Smart Waits, Test Data, Assertions, Browser viewport) đã ở `automation.instructions.md`. File này chỉ chứa **đặc thù Playwright**.

## 1. Workflow Phát Triển & Tìm Element

- Ưu tiên dùng **Playwright MCP** mở browser, tương tác trang đích.
- Inspect DOM thực tế — TUYỆT ĐỐI không suy đoán, không copy mù từ code cũ chưa verify, không dựa URL/tài liệu chưa xác nhận trên UI thật.

## 2. Thứ Tự Ưu Tiên Locator

Playwright cung cấp locator semantic hướng người dùng — **luôn ưu tiên** thay CSS/XPath:

1. `getByRole()` — semantic elements (button, link, heading...)
2. `getByLabel()` — form fields có label
3. `getByPlaceholder()` — inputs có placeholder
4. `getByText()` — text content
5. `getByTestId()` — element có `data-testid`
6. `locator("css")` — fallback

```typescript
// ✅ Đúng — Semantic
page.getByRole('button', { name: 'Đăng nhập' })
page.getByLabel('Email')
page.getByPlaceholder('Nhập mật khẩu')

// ❌ Sai — XPath/CSS thô khi có semantic thay thế
page.locator('//button[@class="btn-login"]')
page.locator('.form-input:nth-child(2)')
```

## 3. Web-First Assertions

```typescript
await expect(locator).toBeVisible();
await expect(locator).toBeEnabled();
await expect(locator).toHaveText('Thành công');
await expect(page).toHaveURL(/dashboard/);
```

Chỉ dùng `waitForSelector()` khi `expect()` không đáp ứng được trường hợp đặc biệt.

## 4. Cấu Trúc Test

Xem template `test.describe + beforeEach` trong `automation.instructions.md` §6.
