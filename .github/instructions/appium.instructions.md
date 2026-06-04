---
description: Đặc thù Appium Mobile (locator native iOS/Android, scroll, mobile lifecycle). Quy tắc chung xem automation.instructions.md.
applyTo: '**/*.java'
---

# Quy Tắc Appium Mobile (Đặc Thù)

> Quy tắc chung (POM/Screen Objects, Smart Waits, Test Data, Assertions, TestNG template) đã ở `automation.instructions.md`. File này chỉ chứa **đặc thù mobile**.

## 1. Thứ Tự Ưu Tiên Locator (Native)

1. `accessibility id` — cross-platform, ổn định nhất
2. `resource-id` (Android) — thuộc tính native
3. `id` — chung
4. `iOS predicate string` — nhanh, chuyên iOS
5. `iOS class chain` — truy vấn cấu trúc iOS
6. `xpath` — cuối cùng (chậm, cấm XPath tuyệt đối)

```java
// ✅ Cross-platform (luôn ưu tiên)
driver.findElement(AppiumBy.accessibilityId("login_button"));

// Android
driver.findElement(AppiumBy.id("com.app.xyz:id/login_button"));

// iOS
driver.findElement(AppiumBy.iOSNsPredicateString("label == 'Login'"));
driver.findElement(AppiumBy.iOSClassChain("**/XCUIElementTypeButton[`label == 'Login'`]"));
```

## 2. Cấm

- XPath tuyệt đối dựa cấu trúc layout (đặc biệt nguy hiểm trên mobile do layout dynamic).
- Truy vấn element off-screen mà không scroll trước.
- Tương tác element disabled mà không kiểm tra trạng thái.
- Hardcode chờ animation.

## 3. Scroll Đến Element

```java
// Android UiScrollable
driver.findElement(AppiumBy.androidUIAutomator(
    "new UiScrollable(new UiSelector().scrollable(true))" +
    ".scrollIntoView(new UiSelector().text(\"Submit\"))"
));
```

## 4. ExpectedConditions cho Mobile

```java
WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
wait.until(ExpectedConditions.visibilityOfElementLocated(
    AppiumBy.accessibilityId("welcome_text")
));
wait.until(ExpectedConditions.elementToBeClickable(
    AppiumBy.accessibilityId("submit_button")
));
```

## 5. Đặc Thù Mobile Testing

- **Screen Objects:** dùng hậu tố `Screen` thay `Page` (`LoginScreen`, `HomeScreen`).
- **Xoay màn hình:** test cả portrait + landscape nếu app hỗ trợ.
  ```java
  driver.rotate(ScreenOrientation.LANDSCAPE);
  ```
- **Background/Foreground:** test khi app chuyển nền rồi quay lại.
  ```java
  driver.runAppInBackground(Duration.ofSeconds(5));
  ```
- **Permission Dialog:** auto-grant trong capabilities Android.
  ```java
  capabilities.setCapability("autoGrantPermissions", true);
  ```
- **Push Notification:** verify bằng Appium notification listener.
