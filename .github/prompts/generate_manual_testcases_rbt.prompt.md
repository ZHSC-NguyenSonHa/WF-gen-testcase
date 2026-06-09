---
description: Sinh manual test cases chất lượng cao theo quy trình AI-RBT 6 bước (Risk-Based Testing) từ requirements.
agent: agent
tools: ['codebase', 'editFiles', 'runCommands', 'fetch', 'search', 'usages', 'vscode_askQuestions']
---

> **BẮT BUỘC (MANDATORY SKILLS):**
> - Nạp và đọc kỹ skill **`rbt-manual-testing`** (`.github/skills/rbt-manual-testing/SKILL.md`) — dùng **Mode FULL RBT**.
> - Tham khảo skill **`requirements-analyzer`** để phân tích giao diện nếu cần.
> - **Bước 6 (xuất Excel deliverable):** đọc kỹ skill **`format_testcase`** (quy tắc tổ chức GUI/Logic, merge Test Object, chia quan điểm test) + skill **`excel-converter`** (sử dụng TEMPLATE mode qua `scripts/convert_excel/testcase_builder.js`, KHÔNG dùng FLAT mode cho deliverable cuối).
# Workflow: Sinh Manual Test Cases theo AI-RBT Framework (FULL RBT Mode)

Workflow này sử dụng **Mode FULL RBT** của skill `rbt-manual-testing` — quy trình **AI-RBT (AI-Driven Risk-Based Testing)** gồm 6 bước tuần tự để sinh manual test cases từ tài liệu yêu cầu.

> [!NOTE]
> **Luồng này dành cho Copilot (prompt file / slash command).** Agent thực hiện theo hướng dẫn trong skill, KHÔNG cần đọc file prompt.txt.
> Nếu QA team muốn dùng prompt chi tiết hơn (ChatGPT/Claude), hãy copy-paste từng bước từ `plans/manual/01-06/prompt.txt`.

## ⚠️ Nguyên tắc thực thi

- **Mode:** FULL RBT (6 bước tuần tự)
- **BẮT BUỘC chạy tuần tự** từng bước, KHÔNG gộp nhiều bước
- **3 checkpoints PHẢI dừng lại** chờ user phản hồi:
  - Bước 2 (Q&A) — chờ user trả lời câu hỏi
  - Bước 3 (Decomposition) — chờ user duyệt module list
  - Bước 4 (Scenarios) — chờ user review high-level scenarios
- Nếu user chưa cung cấp requirements + release tag + folder đích, hỏi user cung cấp trước khi bắt đầu
- Tất cả output bằng **Tiếng Việt**

## 💬 Cách hỏi user (BẮT BUỘC)

Mỗi khi cần thu thập **nhiều thông tin** từ user (Bước 1, Bước 2, checkpoint Bước 3/4), **BẮT BUỘC** dùng **1 lần gọi `vscode_askQuestions`** với nhiều questions trong cùng array — KHÔNG hỏi từng câu rời rạc qua text message.

- Mỗi question có `header` ngắn (unique), `question` rõ ràng, `message` markdown cho context nếu cần
- Dùng `options` cho câu hỏi có fixed choices (vd: Release tag, Folder đích)
- Dùng `recommended: true` cho default option (vd: release mới nhất)
- Free-text cho câu hỏi mở (vd: mô tả hệ thống, tài liệu)
- Sau khi user trả lời, xác nhận lại ngắn gọn rồi mới sang bước tiếp

## Các bước thực hiện

Thực hiện theo hướng dẫn chi tiết trong skill `rbt-manual-testing` → phần **Mode 2: FULL RBT**.

### Bước 1: Khởi tạo ngữ cảnh (Context & Role-play)
1. **Dùng `vscode_askQuestions` hỏi 1 lần** tất cả thông tin sau (cần để build path output ở Bước 6):
   - `feature` — Tên dự án / tính năng (free text, vd: `Popup Claim`)
   - `description` — Mô tả hệ thống hiện tại + mục tiêu kiểm thử (free text)
   - `docs` — Tài liệu yêu cầu (path/link Requirements, Figma, PDF...)
   - `release` — Release tag (options: `7.4.0`, `1.0.5`, `7.2.0`, `1.0.0`, hoặc free text)
   - `folder` — Folder đích trong `Test Result/<release>/App/` (options: `Base Popup`, `Base coupon`, `Base Home`, `Base login`, `Base noti`, `Base Search`, hoặc free text)
   - `creator` — Tester / Creator name (free text, vd: `QuynhNT`)
2. Đọc kỹ tài liệu, xác nhận hiểu bối cảnh + tóm tắt scope kiểm thử
3. **Chờ user xác nhận** → sang Bước 2

### Bước 2: Phân tích yêu cầu (Analysis & QnA)
1. Xác định Happy Path, Alternate Paths, Exception Paths
2. Phát hiện Ambiguities (thiếu sót, mâu thuẫn, chưa rõ ràng)
3. **Dùng `vscode_askQuestions` hỏi 1 lần** tất cả câu hỏi Q&A (Q1, Q2, Q3...) — mỗi Ambiguity = 1 question:
   - `header`: `Q1`, `Q2`, `Q3`... (unique)
   - `question`: câu hỏi ngắn gọn
   - `message`: ngữ cảnh + assumption mặc định nếu user skip
   - `options` nếu câu có phương án cụ thể (Y/N, A/B/C), `recommended` cho default
4. **DỪNG LẠI — Chờ user trả lời** → sang Bước 3
   - Nếu user skip câu nào → ghi nhận assumption đó vào test cases

### Bước 3: Phân rã hệ thống (Decomposition)
1. Chia tính năng thành Modules / Sub-modules
2. Mô tả chức năng từng Module + Dependencies giữa chúng
3. **Dùng `vscode_askQuestions`** với 1 question duy nhất:
   - `header`: `decomposition_review`
   - `question`: "Module list đã phù hợp chưa?"
   - `options`: `✅ OK, tiếp tục` (recommended), `✏️ Cần sửa` (kèm freeform yêu cầu)
4. → sang Bước 4

### Bước 4: Đảm bảo độ bao phủ (Traceability)
1. Map Module → mã Yêu cầu (REQ-01, REQ-02...)
2. Cross-check thiếu sót (Gap Analysis), liệt kê High-Level Scenarios
3. **Dùng `vscode_askQuestions`** với 1 question:
   - `header`: `scenarios_review`
   - `question`: "High-level scenarios đã đủ chưa?"
   - `options`: `✅ Đủ, tiếp tục sinh TC chi tiết` (recommended), `✏️ Cần bổ sung` (freeform)
4. → sang Bước 5

### Bước 5: Sinh Test Case chi tiết (RBT & TC Generation)
1. Đánh giá **Risk Level** cho mỗi Module theo rubric `Risk = Impact × Probability`:

   | Impact \ Probability | Low (hiếm) | Medium | High (thường xuyên) |
   |---|---|---|---|
   | **High** (mất tiền/data, security) | Medium | **High** | **High** |
   | **Medium** (UX kém, lỗi nghiệp vụ) | Low | Medium | **High** |
   | **Low** (cosmetic, edge case hiếm) | Low | Low | Medium |

   - **High Risk** → coverage ≥ 90%, đầy đủ Happy + Negative + Boundary + Edge
   - **Medium Risk** → coverage ~ 70%, Happy + Negative chính + 1-2 Boundary
   - **Low Risk** → coverage ~ 40%, Happy path + 1-2 Negative chính
2. Sinh test cases đầy đủ: Title, Pre-condition, Steps, Expected, Test Data, Priority
3. Áp dụng kỹ thuật: EP, BVA, Decision Table, State Transition
4. **Validation chuyên biệt từng trường (Field-Level Validation):**
   - Liệt kê tất cả input fields trên form/UI đang test
   - Sinh validation TCs **riêng cho TỪNG trường** theo đặc tính riêng
   - Tham chiếu **Bảng Field-Level Validation** trong skill `rbt-manual-testing`
   - **KHÔNG** gộp validation nhiều trường vào 1 TC
5. Bao phủ đầy đủ: Happy Path, Negative, Boundary, Edge Cases
6. Test Data phải cụ thể (không placeholder chung)
7. Nếu quá nhiều → sinh từng Module, hỏi user để tiếp tục

### Bước 6: Chuẩn hóa Format (Template Mapping)

**Đây là bước deliverable cuối cùng.** Bắt buộc xuất **2 artifact**:

1. **Markdown table** (bản preview / chia sẻ nhanh):
   `| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data |`
   - Không được bỏ sót test case nào
   - Xuất dưới dạng Artifact nếu dài

2. **Excel template-mode** (file deliverable cho QA team — đúng màu/border/font/công thức theo template Push):
   - **Bắt buộc** dùng engine `scripts/convert_excel/testcase_builder.js` qua data file `features/gen_<feature>.js`
   - **KHÔNG** dùng `md_to_xlsx.js` (FLAT mode) cho deliverable cuối — chỉ dùng để preview trung gian
   - Quy trình:
     1. Copy `scripts/convert_excel/examples/gen_testcase.template.js` → `scripts/convert_excel/features/gen_<feature>.js`
     2. Sửa metadata (`FUNCTION_NAME`, `CREATOR`, `CREATE_DATE`, `RELEASE`, `SHEET_PREFIX`) — dùng giá trị `release` + `creator` thu được ở Bước 1
     3. Điền `guiSection` (test case GUI) + `logicSections` (chia ĐÚNG số mục theo spec, mỗi mục 1 section.title)
     4. Mỗi row: `{ to, sub, input: '[Tiền điều kiện] ...\n1. ...', output: '1. ...' }` — các row liên tiếp cùng `to` tự merge
     5. **Tên file output theo convention `【APP】<FeatureName>.xlsx`** (giống các file Push gốc trong `Test Result/`)
     6. Chạy: `node scripts/convert_excel/features/gen_<feature>.js "Test Result/<release>/App/<folder>/【APP】<FeatureName>.xlsx"`

3. **Verification (BẮT BUỘC — đừng skip):**
   - File `.xlsx` được tạo thành công, không có error trong stdout
   - Mở lại file bằng `Invoke-Item` (Windows) hoặc `open` (Mac) để visual check
   - Đủ **3 sheet:** `Summary`, `<prefix>_GUI`, `<prefix>_LOGIC`
   - `Summary > Detail summary` có **đúng 2 rows** trỏ tới 2 sheet vừa tạo (không còn `Push detail_GUI` / `Push_FN_Matrix` leftover)
   - `Summary > Total summary` không có cell `#REF!`
   - Sheet `<prefix>_GUI` có đúng số rows = số TC GUI; sheet `<prefix>_LOGIC` có đúng số rows = số TC Logic
   - Báo cáo cho user: số TC GUI / Logic + đường dẫn file

   Tham chiếu skill: [excel-converter](../skills/excel-converter/SKILL.md), [format_testcase](../skills/format_testcase/SKILL.md)
   Template canonical: [templates/testcase/app-testcase-template.xlsx](../../templates/testcase/README.md)

## Output

- Bảng Test Cases Markdown hoàn chỉnh (preview)
- **File Excel deliverable theo template canonical** đặt tại `Test Result/<release>/App/<folder>/【APP】<FeatureName>.xlsx` (đúng màu/border/font/công thức + dropdown OK/NG/-/△ + date format)
- Traceability Matrix
- Danh sách Ambiguities đã giải quyết
- Verification report (3 sheets OK, không #REF!, count TC khớp)
