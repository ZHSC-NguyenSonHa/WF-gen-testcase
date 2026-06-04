---
description: Đặc thù Selenium WebDriver (locator order, ExpectedConditions). Quy tắc chung xem automation.instructions.md.
applyTo: '**/*.java'
---

# Quy Tắc Selenium WebDriver (Đặc Thù)

> Quy tắc chung (POM, Smart Waits, Test Data, Assertions, TestNG template) đã ở `automation.instructions.md`. File này chỉ chứa **đặc thù Selenium**.

## 1. Thứ Tự Ưu Tiên Locator

1. `id` — nhanh nhất, unique nhất
2. `data-testid` / `data-test` / `data-qa` — chuyên cho test
3. `name` — HTML chuẩn
4. `cssSelector` — linh hoạt
5. `xpath` — cuối cùng (cấm XPath tuyệt đối, xem `locator-strategy.instructions.md`)

```java
// ✅ Đúng
driver.findElement(By.id("login-btn"));
driver.findElement(By.cssSelector("button[data-testid='submit-btn']"));

// ❌ Sai — XPath dựa vị trí
driver.findElement(By.xpath("//div[3]/div[2]/form/div[1]/button"));
```

## 2. ExpectedConditions Thường Dùng

```java
WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("profile")));
wait.until(ExpectedConditions.elementToBeClickable(By.id("submit-btn")));
wait.until(ExpectedConditions.textToBePresentInElementLocated(By.id("msg"), "Thành công"));
wait.until(ExpectedConditions.urlContains("/dashboard"));
```

FluentWait cho polling tuỳ chỉnh:

```java
Wait<WebDriver> fluentWait = new FluentWait<>(driver)
    .withTimeout(Duration.ofSeconds(15))
    .pollingEvery(Duration.ofMillis(500))
    .ignoring(NoSuchElementException.class);
```

## 3. Set Viewport

```java
driver.manage().window().setSize(new Dimension(1920, 1080));
```

## 4. TestNG Structure

Xem template trong `automation.instructions.md` §6 (TestNG template).
