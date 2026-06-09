# QA Automation Kit — HSC Zapp

Repository chứa **Copilot customization files** (instructions, prompts, skills) phục vụ tác vụ QA Manual & Automation Testing trong VS Code.

> **Quy ước giao tiếp:** Tiếng Việt. **Code/comment/biến:** Tiếng Anh. Xem [.github/copilot-instructions.md](.github/copilot-instructions.md) để biết quy tắc đầy đủ.

---

## Cấu trúc Repository

```
Zapp_folder_test/
├── .github/
│   ├── copilot-instructions.md       # Global rules cho mọi tác vụ test
│   ├── instructions/                 # Auto-load theo applyTo (Playwright/Selenium/Appium…)
│   ├── prompts/                      # Slash commands /generate_*
│   ├── workflow_automation/          # Prompt chuyên cho automation
│   ├── workflow_manual/              # Prompt chuyên cho manual test
│   └── skills/                       # 12 skill (kebab-case folder)
├── scripts/
│   ├── convert_excel/                # MD test cases → .xlsx
│   └── integrations/                 # Jira/Xray + Google Sheets scripts
├── plans/
│   └── manual/01-06/                 # 6 prompt.txt cho FULL RBT (copy-paste vào ChatGPT)
├── Release/                          # Release notes & artifacts (per version)
├── Test Result/                      # Test execution evidence
└── .vscode/
    └── mcp.json                      # Playwright MCP server config
```

---

## Setup nhanh

### 1. Cài Node.js ≥ 16

### 2. Setup integration scripts (tùy chọn — chỉ khi dùng Jira/Xray/Sheets)

```bash
cd scripts/integrations
cp .env.example .env       # Điền credentials
npm install
```

### 3. Setup Excel converter (tùy chọn)

```bash
cd scripts/convert_excel
npm install
```

### 4. Cài Playwright MCP (tùy chọn — cho UI debug)

`.vscode/mcp.json` đã có sẵn config. Khi mở workspace lần đầu, VS Code sẽ prompt cài.

---

## Slash Commands (Copilot Chat)

Gõ `/` trong Copilot Chat để xem danh sách. Nhóm chính:

| Command | Mục đích |
|---|---|
| `/analyze_requirement_document` | Phân tích requirement (spec/.doc) |
| `/generate_manual_testcases_rbt` | Sinh manual TC theo AI-RBT 6 bước (FULL) |
| `/generate_automation_from_testcases` | Manual TC → automation script |
| `/generate_automation_framework` | Thiết kế automation framework |
| `/generate_locator` | Sinh locator ổn định |
| `/generate_test_data` | Sinh test data unique + traceable |
| `/generate_cross_module_test_plan` | Cross-module test matrix |
| `/generate_combinatorial_test_data` | Combinatorial data |
| `/generate_api_tests_from_swagger` | API tests từ Swagger |
| `/analyze_flaky_tests` | Phân tích flaky tests |

### Workflow đa-bước (`workflow_manual/`, `workflow_automation/`)

Gõ `/manual-` hoặc `/automation-` trong Copilot Chat để xem dropdown:

| Manual (FULL RBT 6 bước) | Automation (6 bước + 1 one-click) |
|---|---|
| `/manual-step-1-context` | `/automation-step-1-context` |
| `/manual-step-2-analysis-qna` | `/automation-step-2-ui-recon` |
| `/manual-step-3-decomposition` | `/automation-step-3-pom` |
| `/manual-step-4-traceability` | `/automation-step-4-test-data` |
| `/manual-step-5-rbt-tcgen` | `/automation-step-5-script` |
| `/manual-step-6-template-mapping` | `/automation-step-6-review` |
|  | `/automation-one-click` (chạy hết 6 bước tự động) |

Xem đầy đủ: [.github/copilot-instructions.md](.github/copilot-instructions.md#tham-chiếu-prompt-files-slash-commands)

---

## Tech Stack

| Loại | Công nghệ |
|---|---|
| Web Automation | Playwright (TS/Java), Selenium WebDriver (Java) |
| Mobile Automation | Appium (Java) |
| API Automation | REST Assured |
| Test Framework | TestNG, Playwright Test |
| Build Tool | Maven, npm |

---

## Bảo mật (CRITICAL)

- KHÔNG commit `.env`, `service-account.json`, `.xray_token` (đã `.gitignore`).
- KHÔNG in API keys / passwords ra console.
- KHÔNG dùng `git pull/checkout/merge/rebase/reset` — chỉ dùng read-only Git.

Xem chi tiết tại [.github/copilot-instructions.md](.github/copilot-instructions.md).

---

## Đóng góp

Khi thêm/sửa skill hoặc prompt:
- Skill folder phải kebab-case, `name:` trong frontmatter phải khớp folder name (lowercase + hyphen).
- Prompt frontmatter dùng `agent:`, `description:`, `tools:` — KHÔNG dùng `mode:` (Antigravity legacy).
- Test slash command sau khi tạo bằng cách gõ `/<filename>` trong Copilot Chat.
