---
description: "[Automation Workflow - Bước 4/6] Thiết kế Test Data Strategy — sinh class Data Generator unique + traceable, không hardcode."
name: automation-step-4-test-data
agent: agent
tools: ['codebase', 'editFiles', 'fetch', 'search', 'usages']
---

# Workflow Automation — Bước 4: Chiến Lược Dữ Liệu (Test Data Strategy)

> **BẮT BUỘC (MANDATORY SKILL):** Nạp skill **`qa-automation-engineer`** + **`test-data-generator`** trước khi bắt đầu.
> Gửi prompt này **SAU KHI** đã review POM ở [Bước 3 — POM Design](03_pom_design.prompt.md). Tiếp theo: [Bước 5 — Script Generation](05_script_generation.prompt.md).

## ⚠️ Nguyên tắc thực thi

- ❌ KHÔNG hardcode data cho trường unique; KHÔNG dùng data trùng lặp giữa các test.
- ✅ Data unique mỗi lần chạy, traceable, hỗ trợ parallel không conflict.
- Tham khảo `.github/instructions/automation.instructions.md`. Output bằng **Tiếng Việt**.

## Yêu cầu

### 1. Class sinh dữ liệu (Data Generator)
Viết class Utils/Helper generate dữ liệu tự động, dùng **Faker** (JS/TS), **JavaFaker** (Java) hoặc UUID. Mỗi hàm sinh 1 loại data.

### 2. Format traceable (truy vết được)

```
[Prefix]_[TestName]_[Timestamp]_[Random]
```

Ví dụ:
```
Email:    auto_createCustomer_20260402_A3F2@test.com
Username: auto_login_20260402_7B4D
Code:     KH-20260402-A3F2
Phone:    09[random 8 digits]
```

### 3. Data cho từng loại test

| Loại Test | Yêu cầu Data | Ví dụ |
|-----------|-------------|-------|
| **Happy Path** | Data hợp lệ, format đúng | `valid_email@test.com`, `Test@12345` |
| **Negative** | Data sai format, thiếu field | `invalid-email`, `""`, `null` |
| **Boundary** | Data tại ranh giới min/max | `"A"` (1 char), `"A"*256` (vượt max) |

### 4. Tích hợp vào project

```typescript
// Playwright
import { DataGenerator } from '../utils/data-generator';
const testData = DataGenerator.createCustomer();
```

```java
// Selenium/Java
import utils.DataGenerator;
String email = DataGenerator.generateEmail("createCustomer");
```

> Sau khi sinh xong Data Generator, sẵn sàng sang Bước 5 (Script Generation).
