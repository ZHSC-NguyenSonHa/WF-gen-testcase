# Copilot Testing Agent — Global Rules

> **Scope:** Mọi tác vụ Test (Manual & Automation) trong dự án. Quy tắc chi tiết tự động nạp qua `applyTo` trong `.github/instructions/`.

## Ngôn Ngữ & Giao Tiếp

- Giao tiếp / báo cáo: **Tiếng Việt**, ngắn gọn, có căn cứ — không suy đoán mơ hồ.
- Code comments: Tiếng Anh. Tên biến/hàm/class: **Tiếng Anh**.

## An Toàn Dữ Liệu (CRITICAL)

- CẤM lệnh phá huỷ (`DROP TABLE`, `DELETE`, `rm -rf`, `Remove-Item -Recurse -Force`) khi chưa được USER duyệt.
- CẤM in / commit credentials (`.env`, `service-account.json`, `.xray_token`, API Keys, Tokens, Connection Strings).
- Kiểm tra kỹ trước khi thực thi lệnh có khả năng thay đổi dữ liệu.

## Git Restriction

- KHÔNG dùng lệnh đổi state (`git pull/checkout/merge/rebase/reset`) — code server có thể chưa cập nhật, pull về sẽ ghi đè.
- Nếu cần file mới → yêu cầu USER cung cấp.
- **Được phép:** `git status`, `git diff`, `git log` (read-only).

## Tools

- Ưu tiên **Playwright MCP** (`.vscode/mcp.json`) cho debug UI.
- Inspect DOM/HTML thực — **KHÔNG đoán locator**. Locator từ code cũ phải verify lại trước khi dùng.
- KHÔNG generate code khi chưa inspect DOM.
- Custom file tools (`read_file`, `grep_search`...) ưu tiên hơn terminal `cat/grep/find`.

## Quy Trình Làm Việc

1. **Recon:** inspect UI/DOM/XML thực tế trước khi viết automation.
2. **Implementation:** Tuân thủ POM. Xem `automation.instructions.md` cho chi tiết.
3. **Self-fix loop:** chạy test → đọc log → sửa → chạy lại đến khi PASS. Chỉ hỏi USER khi business rule mâu thuẫn (hoặc sau 5 vòng auto-heal).
4. **Cleanup:** gỡ debug logs / commented code / unused locators trước khi deliver.

## Tech Stack

| Loại | Công nghệ |
|---|---|
| Web Automation | Playwright (TS/Java), Selenium WebDriver (Java) |
| Mobile Automation | Appium (Java) |
| API Automation | REST Assured |
| Test Framework | TestNG, Playwright Test |
| Build Tool | Maven, npm |

## Anti-Patterns (FORBIDDEN)

| ❌ | ✅ |
|---|---|
| Đoán locator | Inspect DOM thực, verify trên browser |
| `Thread.sleep` / `waitForTimeout` | Smart waits (`expect()`, `WebDriverWait`) |
| Copy locator từ code cũ chưa verify | Verify lại trên browser hiện tại |
| Viết test không chạy ngay | Chạy + self-fix đến khi PASS ổn định |
| Commit test FAIL | Chỉ commit khi PASS ≥ 2 lần liên tiếp |
| Debug log / commented code khi deliver | Cleanup |
| Test data hardcoded trùng lặp | Random + traceable |

## Cleanup Temp & Debug Files

**Phải xoá khi xong nhiệm vụ:** `*_debug.txt`, `debug_output.txt`, `*_output.txt`, `*.tmp`, `*.temp`, `page_snapshot.md`, `snapshot_*.md`, `dom_dump.txt`, `html_dump.html`, `network_requests.txt`, `console_log.txt`, `scratch_*.{py,js,ts}`, file `.py/.js/.ts` lạc chỗ ngoài `src/`, `tests/`, `scripts/`.

**KHÔNG xoá:** `playwright-report/**`, `test-results/**`, `logs/`, `artifacts/`, `node_modules/`, `.git/`, `target/`, `build/`, `*.config.*`, `package.json`, `.gitignore`, file USER yêu cầu giữ.

File debug tạm → `/tmp/`, không tràn root. Không chắc → hỏi USER.

## Definition of Done

- ✅ **Code:** xoá debug logs / commented code / unused imports / hardcoded waits & data.
- ✅ **POM:** Page/Test/Utils tách bạch, locator trong Page class, naming nhất quán.
- ✅ **Test quality:** PASS ≥ 2 lần liên tiếp UI headed; assertion có message; mỗi test độc lập; data động + traceable.
- ✅ **File output:** đúng vị trí; không file thừa; `.env` không có credentials thật.
- ✅ **Báo cáo:** PASS/FAIL/SKIP; TC implement & TC skip (lý do); known issues.

## Customization File Authoring

Khi tạo/sửa `.prompt.md`, `.instructions.md`, `SKILL.md`:

- **Prompt frontmatter:** dùng `agent: agent` — TUYỆT ĐỐI không `mode:` (Antigravity legacy).
- **Skill `name:`:** kebab-case + lowercase + KHỚP tên folder cha.
- **Slash command discoverability:** prompt phải nằm trong folder khai báo ở `.vscode/settings.json` → `chat.promptFilesLocations`.
- **Tools array:** chỉ tool VS Code chuẩn — `codebase`, `editFiles`, `runCommands`, `fetch`, `search`, `usages`, `testFailure`.

## References

### Instructions (auto-load qua `applyTo`)

- [automation.instructions.md](instructions/automation.instructions.md) — POM, Smart Waits, Test Data, Assertions, Naming, Browser viewport
- [locator-strategy.instructions.md](instructions/locator-strategy.instructions.md) — Thứ tự ưu tiên locator
- [playwright.instructions.md](instructions/playwright.instructions.md) — Đặc thù Playwright (semantic locator)
- [selenium.instructions.md](instructions/selenium.instructions.md) — Đặc thù Selenium
- [appium.instructions.md](instructions/appium.instructions.md) — Đặc thù Appium mobile

### Skills (`.github/skills/`)

| Skill | Vai trò |
|---|---|
| `qa-automation-engineer` | Master skill automation |
| `rbt-manual-testing` | Master skill manual (QUICK + FULL RBT) |
| `requirements-analyzer` | Phân tích requirements từ website/tài liệu |
| `ui-debug-agent` | Inspect UI/DOM, thu thập locators |
| `smart-locator-agent` | Sinh locator ổn định |
| `locator-healer-agent` | Sửa locator hỏng |
| `test-data-generator` | Sinh test data unique, traceable |
| `flaky-test-analyzer` | Phân tích & fix flaky tests |
| `framework-architect` | Thiết kế automation framework |
| `excel-converter` | Markdown TC → `.xlsx` |
| `google-sheet-integration` | Đọc/ghi Google Sheets |

### Slash Commands

**`.github/prompts/`** — single-step:

| Command | Mô tả |
|---|---|
| `/analyze_requirement_document` | Phân tích requirement (spec/.doc) |
| `/generate_manual_testcases_rbt` | Manual TC theo AI-RBT 6 bước (FULL) |
| `/generate_automation_from_testcases` | Manual TC → automation |
| `/generate_automation_framework` | Thiết kế framework |
| `/generate_locator` | Sinh locator |
| `/generate_test_data` | Sinh test data |
| `/generate_cross_module_test_plan` | Cross-module test matrix |
| `/generate_combinatorial_test_data` | Combinatorial data |
| `/generate_api_tests_from_swagger` | API tests từ Swagger |
| `/analyze_flaky_tests` | Phân tích flaky |

**`.github/workflow_manual/` + `.github/workflow_automation/`** — multi-step (gõ `/manual-` hoặc `/automation-`):

| Manual (FULL RBT 6 bước) | Automation (6 bước + One-Click) |
|---|---|
| `/manual-step-1-context` | `/automation-step-1-context` |
| `/manual-step-2-analysis-qna` | `/automation-step-2-ui-recon` |
| `/manual-step-3-decomposition` | `/automation-step-3-pom` |
| `/manual-step-4-traceability` | `/automation-step-4-test-data` |
| `/manual-step-5-rbt-tcgen` | `/automation-step-5-script` |
| `/manual-step-6-template-mapping` | `/automation-step-6-review` |
|   | `/automation-one-click` (chạy tự động hết 6 bước) |
