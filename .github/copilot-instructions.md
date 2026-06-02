# Copilot Testing Agent — Global Rules

> **Scope:** Áp dụng cho mọi tác vụ Test (Manual & Automation) do GitHub Copilot thực hiện trong dự án này.
> **Mục tiêu:** Sinh ra test scripts/test cases hiệu quả, ổn định – dễ debug – dễ scale – CI friendly.

---

## Ngôn Ngữ & Giao Tiếp

- Mặc định giao tiếp, phân tích, giải thích và báo cáo bằng **Tiếng Việt**.
- Diễn giải **ngắn gọn, rõ ràng, dễ hiểu**. Tránh suy đoán mơ hồ về lỗi mà cần có căn cứ trực tiếp.
- Code comments có thể viết bằng **Tiếng Anh** để đảm bảo tính quốc tế.
- Tên biến, hàm, class luôn viết bằng **Tiếng Anh**.

---

## An Toàn Dữ Liệu (CRITICAL)

- CẤM tự ý thực thi các lệnh phá hủy (`DROP TABLE`, `DELETE`, `rm -rf`, `Remove-Item -Recurse -Force`) mà không có sự đồng ý rõ ràng từ USER.
- CẤM in các thông tin nhạy cảm (API Keys, Passwords, Tokens, Connection Strings) ra màn hình chat.
- CẤM commit hoặc push các file chứa credentials lên repository.
- Luôn kiểm tra lại trước khi thực thi bất kỳ lệnh nào có khả năng thay đổi/xóa dữ liệu.

---

## Git Restriction Rule

- Tuyệt đối KHÔNG dùng lệnh Git làm thay đổi trạng thái code (`git pull`, `git checkout`, `git merge`, `git rebase`, `git reset`) để lấy code hoặc đổi nhánh.
- Code trên server có thể chưa cập nhật → pull về sẽ ghi đè và làm sai phần code local đang chỉnh sửa.
- Luôn giữ nguyên trạng thái code local hiện tại. Nếu cần file mới, hãy yêu cầu USER cung cấp.
- **Được phép** dùng lệnh read-only: `git status`, `git diff`, `git log`.

---

## Browser Rules (MANDATORY)

### Viewport & Mode

- Tất cả **UI debugging** phải chạy với **desktop viewport `1920x1080`**.
- Bắt buộc **mở browser thật** khi debug (headed mode).
- **Headless mode** chỉ dùng **sau khi test đã debug PASS trên UI**. CI/CD pipeline được phép chạy headless mặc định.

### Thứ Tự Debug Bắt Buộc (Playwright MCP)

```
navigate → resize(1920×1080) → wait_for(page_load) → snapshot → interact → screenshot(on_fail)
```

- **KHÔNG** gọi `browser_navigate` lại nếu đã ở đúng trang — tránh reload ngoài ý muốn.
- **LUÔN** gọi `browser_resize(width=1920, height=1080)` ngay sau `browser_navigate`.
- **LUÔN** verify page đã load xong trước khi snapshot hoặc tương tác.

### Screenshot & Snapshot

- Dùng **`browser_snapshot`** để phân tích DOM và xác định locator.
- Dùng **`browser_take_screenshot`** để lưu bằng chứng khi test fail hoặc báo cáo.
- Chụp screenshot **ngay khi assertion fail** để hỗ trợ truy vết lỗi. KHÔNG chụp tràn lan.

---

## Tools

- Ưu tiên sử dụng **Playwright MCP** cho tất cả tác vụ debug UI (cấu hình tại `.vscode/mcp.json`).
- Inspect **DOM/HTML thực tế** trên browser — **KHÔNG đoán locator**.
- Một locator phải được **verify chạy được** trên browser hiện tại trước khi đưa vào code.
- Nếu locator lấy từ code cũ → **bắt buộc verify lại** trước khi dùng.
- **KHÔNG** generate code khi chưa inspect DOM.

> **Ánh xạ tool VS Code Copilot:** đọc file dùng `read_file`/`#file`; sửa/tạo file dùng edit tools; chạy lệnh dùng `run_in_terminal`; fetch URL dùng `fetch_webpage`; tham chiếu file trong chat bằng `#file:`.

---

## Quy Trình Làm Việc (Workflow)

- **Recon (Điều tra):** Luôn inspect giao diện thực tế hoặc DOM/HTML/XML trước khi viết automation. Tuyệt đối KHÔNG ĐOÁN locator.
- **Implementation:** Giữ vững mô hình **Page Object Model (POM)**. Phân tách rõ Page objects, Test execution và Utils/Test data.
- **Execution & Self-fix:** Chạy test ngay sau khi code xong. Nếu test FAIL → tự đọc log → phân tích root cause → sửa code → chạy lại → đến khi PASS ổn định. Chỉ hỏi USER khi gặp business rule mâu thuẫn (hoặc sau 5 vòng auto-heal).
- **Cleanup:** Gỡ bỏ debug logs, code thừa, locator không dùng trước khi deliver.

---

## Tech Stack Hỗ Trợ

| Loại | Công nghệ |
| --- | --- |
| Ngôn ngữ | Java, TypeScript |
| Web Automation | Playwright (TS/Java), Selenium WebDriver (Java) |
| Mobile Automation | Appium (Java) |
| API Automation | REST Assured |
| Test Framework | TestNG, Playwright Test |
| Build Tool | Maven, npm |

---

## Test Data

- Tất cả field yêu cầu **unique** (Email, Username, Code/ID): **BẮT BUỘC** dùng dữ liệu random.
- Dữ liệu random phải **traceable / deterministic** — có thể truy ngược test gây lỗi.
- Format khuyến nghị: kết hợp `test name + timestamp + prefix`.

```
email:    test_login_1712049200@auto.test
username: auto_user_1712049200
code:     TC_LOGIN_1712049200
```

---

## Code Quality (Smart Waits)

- **KHÔNG** dùng hard sleep (`waitForTimeout`, `Thread.sleep`, fixed delay).
- Chỉ sử dụng **smart waits** / auto-waiting:

| Framework | Smart Wait |
| --- | --- |
| Playwright | `expect().toBeVisible()`, `expect().toBeEnabled()`, Locator APIs |
| Selenium | `WebDriverWait` + `ExpectedConditions` |
| Appium | `WebDriverWait` + custom conditions |

- Hạn chế `waitForSelector` nếu `expect()` đáp ứng được.
- Mọi assertion phải có **timeout rõ ràng** hoặc dùng default timeout hợp lý.

---

## Anti-Patterns (FORBIDDEN)

| ❌ Anti-Pattern | ✅ Thay thế đúng |
| --- | --- |
| Guess selector / đoán locator | Inspect DOM thực tế trước khi code |
| Hard sleep (`waitForTimeout`, `Thread.sleep`) | Smart waits (`expect()`, `WebDriverWait`) |
| Copy selector từ code cũ không verify | Luôn verify selector trên browser hiện tại |
| Viết test không chạy ngay | Chạy test ngay sau khi implement |
| Commit test FAIL | Chỉ commit khi test PASS ổn định |
| Để debug log / commented code khi deliver | Cleanup trước khi deliver |
| Dùng test data hardcoded trùng lặp | Sinh data random + traceable |

---

## Cleanup Temp & Debug Files

AI **bắt buộc** dọn dẹp mọi file tạm/debug/trung gian sinh ra trong quá trình phân tích/chạy thử trước khi kết thúc nhiệm vụ.

**Các loại file phải xóa:** `*_debug.txt`, `debug_output.txt`, `*_output.txt`, `*.tmp`, `*.temp`, `page_snapshot.md`, `snapshot_*.md`, `dom_dump.txt`, `html_dump.html`, `network_requests.txt`, `console_log.txt`, `scratch_*.{py,js,ts}`, và file `.py/.js/.ts` lạc chỗ ngoài `src/`, `tests/`, `scripts/`.

**KHÔNG được xóa:** `playwright-report/**`, `test-results/**`, `logs/`, `artifacts/`, `node_modules/`, `.git/`, `target/`, `build/`, `*.config.{ts,js}`, `package.json`, `.gitignore`, và bất kỳ file nào USER yêu cầu giữ.

**Quy tắc:** File debug tạm nên lưu vào `/tmp/`, không để tràn vào thư mục gốc. Nếu không chắc → hỏi USER. Cuối nhiệm vụ → báo cáo cleanup rõ ràng.

---

## Definition of Done

Test chỉ **hoàn thành** khi đáp ứng **toàn bộ** tiêu chí:

**Code Cleanup:** Xoá hết `print()`/`console.log()`/debug log tạm; xoá locator không dùng; không để commented-out code; không có `waitForTimeout`/`Thread.sleep` hardcoded; không có test data hardcoded.

**Cấu trúc & POM:** Tuân thủ POM (tách Page class, Test class, Utils); locator định nghĩa trong Page class; naming convention nhất quán; không có unused imports.

**Chất lượng Test:** PASS ổn định ≥ 2 lần liên tiếp trên UI (headed); assertion có message rõ ràng; mỗi test độc lập; test data động + traceable.

**File Output:** Source lưu đúng vị trí; không có file tạm/thừa; config (.env) không chứa credentials thật.

**Báo Cáo Kết Quả:** Tóm tắt PASS/FAIL/SKIP; nêu rõ TC implement & TC skip (kèm lý do); ghi chú known issues/limitation.

---

## Tham Chiếu Rules Chi Tiết

Rules theo phạm vi tự động nạp qua `applyTo` trong `.github/instructions/`:

- [Automation chung](instructions/automation.instructions.md) — POM, Test Data, Naming, Assertions
- [Chiến lược chọn Locator](instructions/locator-strategy.instructions.md) — Thứ tự ưu tiên locator
- [Playwright](instructions/playwright.instructions.md) — Browser setup, locator semantic, wait strategy
- [Selenium](instructions/selenium.instructions.md) — WebDriverWait, TestNG structure
- [Appium](instructions/appium.instructions.md) — Mobile locator, scroll, permission

## Tham Chiếu Skills

Skills trong `.github/skills/` được nạp tùy nhiệm vụ:

| Skill | Vai trò |
| --- | --- |
| `qa_automation_engineer` | Master skill cho automation — điều phối toàn bộ quy trình |
| `rbt_manual_testing` | Master skill cho manual testing — 2 modes: QUICK & FULL RBT |
| `requirements_analyzer` | Phân tích requirements từ website/tài liệu |
| `ui_debug_agent` | Inspect UI/DOM, thu thập locators |
| `smart_locator_agent` | Sinh locator mới ổn định |
| `locator_healer_agent` | Sửa locator hỏng |
| `test_data_generator` | Sinh test data unique, traceable |
| `flaky_test_analyzer` | Phân tích và khắc phục flaky tests |
| `framework_architect` | Thiết kế automation framework |
| `jira_integration` | Tích hợp Jira/Xray — lấy requirements, đẩy test results |

## Tham Chiếu Prompt Files (Slash Commands)

Gọi trong Copilot Chat bằng `/tên-file` (không gồm `.prompt.md`), nằm trong `.github/prompts/`:

| Prompt | Mô tả |
| --- | --- |
| `/generate_requirements_from_website` | Sinh requirements từ website/module |
| `/analyze_requirement_document` | Phân tích requirement document (Jira/.doc) |
| `/generate_manual_testcases_rbt` | Sinh manual test cases theo AI-RBT 6 bước (FULL RBT) |
| `/generate_testcases_from_requirements` | Sinh test cases nhanh (QUICK mode) |
| `/generate_automation_from_testcases` | Chuyển manual test cases → automation scripts |
| `/generate_automation_from_ui_flow` | Sinh automation từ UI flow trực tiếp |
| `/generate_application_test_plan` | Khám phá app, sinh test plan / full suite |
| `/generate_automation_framework` | Thiết kế automation framework |
| `/generate_locator` | Sinh locator ổn định cho UI element |
| `/generate_test_data` | Sinh test data có cấu trúc |
| `/generate_cross_module_test_plan` | Phân tích cross-module, sinh ma trận kết hợp |
| `/generate_combinatorial_test_data` | Sinh test data cho ma trận kết hợp |
| `/generate_api_tests_from_swagger` | Sinh API tests từ Swagger spec |
| `/analyze_flaky_tests` | Phân tích và khắc phục flaky tests |
| `/fetch_jira_requirements` | Lấy requirements/user stories từ Jira |
| `/import_test_results_xray` | Đẩy kết quả test lên Xray |
