---
description: "[Automation Workflow - Bước 2/6] AI tự mở browser (MCP), inspect DOM thật và thu thập bảng locators từ Manual Test Cases."
name: automation-step-2-ui-recon
agent: agent
tools: ['codebase', 'editFiles', 'runCommands', 'fetch', 'search', 'usages']
---

# Workflow Automation — Bước 2: Phân Tích & Điều Tra UI (Analysis & UI Recon)

> **BẮT BUỘC (MANDATORY SKILL):** Nạp skill **`qa-automation-engineer`** + **`ui-debug-agent`** trước khi bắt đầu.
> Gửi prompt này **SAU KHI** đã hoàn thành [Bước 1 — Context & Role-play](01_context_and_roleplay.prompt.md). Tiếp theo: [Bước 3 — POM Design](03_pom_design.prompt.md).

## ⚠️ Nguyên tắc thực thi

- **DOM Recon First:** TUYỆT ĐỐI không đoán selector — chỉ lấy từ DOM thật.
- Browser chạy **viewport 1920x1080** (headed mode khi debug).
- Output bằng **Tiếng Việt**.

## Thông tin cần thu thập (hỏi user nếu chưa có)

- **URL:** môi trường test (VD: `https://dev.crm.system.local/login`).
- **Tài khoản Test:** user/password.
- **Trình duyệt:** Chrome / Firefox / Edge (mặc định Chromium).
- **Manual Test Cases:** danh sách TC cần tự động hóa.

## Nhiệm vụ

Dùng **công cụ trình duyệt** (Playwright MCP / Selenium MCP):

1. **Mở browser** với URL đã cung cấp (resize 1920x1080).
2. **Điều hướng** theo từng bước trong Test Cases.
3. **Thu thập locators** bằng cách đọc Accessibility Tree và inspect DOM attributes: `id`, `data-testid`, `name`, `aria-label`, `role`, `placeholder`. TUYỆT ĐỐI không đoán.
4. **Ưu tiên locator** theo thứ tự (tham khảo `.github/instructions/locator-strategy.instructions.md`):
   - Playwright: `getByRole` > `getByLabel` > `getByPlaceholder` > `getByTestId` > CSS > XPath
   - Selenium: `id` > `data-testid` > `name` > `cssSelector` > `xpath`
5. **Trả kết quả** dưới dạng bảng:

| Page | Element | Locator Type | Locator Value | Fallback Locator |
|------|---------|-------------|---------------|------------------|

> ⏸️ **CHECKPOINT:** Dừng lại sau khi hoàn thành bảng locators để user review trước khi sang Bước 3.
