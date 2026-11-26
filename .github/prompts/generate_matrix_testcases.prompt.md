---
description: Sinh testcase dạng Matrix cho mobile app (iOS/Android) theo chuẩn file mẫu Scan QR vé đợi — phân tích FN, thiết kế dimensions, tổ hợp điều kiện, ký hiệu 〇●, theo dõi multi-device.
agent: agent
tools: ['codebase', 'editFiles', 'runCommands', 'fetch', 'search', 'usages', 'vscode_askQuestions']
---

> **BẮT BUỘC (MANDATORY SKILLS):**
> - Nạp và đọc kỹ skill **`testcase-matrix`** (`.github/skills/testcase-matrix/SKILL.md`) — toàn bộ quy trình thiết kế matrix tuân theo skill này.
> - Khi thiết kế dimensions: đọc [`.github/skills/testcase-matrix/references/dimension-design.md`]
> - Khi viết block FN: dùng template tại [`.github/skills/testcase-matrix/assets/fn-block-template.md`]
> - Trước khi submit: chạy qua [`.github/skills/testcase-matrix/references/quality-checklist.md`]

# Workflow: Sinh Testcase Matrix cho Mobile App

Workflow này tạo **testcase dạng Matrix** theo chuẩn file mẫu `【APP】Scan QR vé đợi giấy tại Home_done.xlsx` — mỗi function (FN) là 1 block độc lập với dimensions × test cases, ký hiệu `〇` (condition), `●` (expected result), theo dõi First/Last time per device.

> [!NOTE]
> Output là file **Markdown** (`.md`) chuẩn matrix, có thể convert sang Excel thủ công hoặc bằng script.
> Nếu cần TC dạng danh sách truyền thống → dùng `/generate_manual_testcases_rbt`.

## ⚠️ Nguyên tắc thực thi

- **BẮT BUỘC chạy tuần tự** 5 bước, KHÔNG gộp
- **3 checkpoints PHẢI dừng** chờ user:
  - Bước 1 — thu thập thông tin ban đầu
  - Bước 2 — duyệt danh sách FN và dimensions
  - Bước 3 — review TC selection trước khi viết full
- Tất cả output bằng **Tiếng Việt** (trừ UI text/button giữ nguyên tiếng Nhật)
- Expected result luôn ghi UI text **chính xác từ design spec** (tiếng Nhật nguyên bản)

## 💬 Cách hỏi user (BẮT BUỘC)

Mỗi khi cần thu thập nhiều thông tin, **BẮT BUỘC** dùng **1 lần gọi `vscode_askQuestions`** — KHÔNG hỏi từng câu rời rạc qua text message.

---

## Các Bước Thực Hiện

### Bước 1 — Khởi tạo & Thu thập thông tin

1. **Dùng `vscode_askQuestions` hỏi 1 lần** tất cả thông tin sau:
   - `feature` — Tên tính năng / màn hình cần test (free text, vd: `Scan QR Home`, `Popup Claim`)
   - `description` — Mô tả ngắn feature + mục tiêu kiểm thử (free text)
   - `docs` — Tài liệu: path spec, link Figma, PDF, hoặc paste text trực tiếp
   - `release` — Release tag (options: `7.4.0`, `1.0.5`, `7.2.0`, `1.0.0`, hoặc free text)
   - `devices` — Devices sẽ test (multi-select options: `iPhone XS`, `iPhone 11`, `Pixel 7a`, `Xperia XZ3`, `Galaxy A30`, hoặc free text)
   - `creator` — Tên người tạo (free text, vd: `QuynhNT`)
   - `output_folder` — Folder lưu file kết quả, ví dụ `Test Result/7.4.0/App/Base QR Scan` (free text)

2. Đọc kỹ tài liệu, xác nhận hiểu scope + tóm tắt bằng 3–5 dòng

3. **Chờ user xác nhận** → sang Bước 2

---

### Bước 2 — Phân tích FN & Thiết kế Dimensions

> Đây là bước tư duy cốt lõi. Dành thời gian phân tích đủ trước khi viết TC.

**2a. Tách feature thành danh sách FN:**

Mỗi FN = 1 mục tiêu kiểm tra độc lập. Đặt tên theo format:
```
FN1: Xác nhận [hành vi] khi [điều kiện]
FN2: Xác nhận xử lí [đối tượng] theo [tiêu chí]
FN3: Xác nhận trạng thái [đối tượng] khi [sự kiện]
```

Phân loại rõ:
- **GUI function** (layout, label, vị trí) → đưa vào sheet GUI riêng (list style), KHÔNG đưa vào matrix
- **Logic function** (state, flow, validation, integration) → đưa vào matrix block

**2b. Với mỗi FN logic, thiết kế dimensions theo thứ tự ưu tiên:**

```
1. Pre-condition / Feature flag   (vd: enable_flag=0/1)
2. User state                     (vd: Chưa login / Đã login)
3. System permission              (vd: Chưa cấp quyền camera / Đã cấp)
4. Main input object              (vd: Loại QR code, Trạng thái vé đợi)
5. External dependency            (vd: Internet, Server)
6. Current context / screen state (vd: Đang có webview / Không có)
```

Với mỗi dimension, liệt kê đầy đủ values + áp dụng:
- **EP (Equivalence Partitioning):** Nhóm cùng hành vi kỳ vọng
- **BVA (Boundary Value Analysis):** Thêm giá trị biên khi có constraint số
- **State Transition:** Liệt kê đủ trạng thái và chuyển đổi

Chi tiết nguyên tắc: [dimension-design.md](../skills/testcase-matrix/references/dimension-design.md)

**2c. Trình bày bản nháp FN list + dimensions để user duyệt:**

```
FN1: [Tên]
  - Dimension A: [value1, value2, ...]
  - Dimension B: [value1, value2, ...]

FN2: [Tên]
  - Dimension A: [...]
  ...
```

**Dùng `vscode_askQuestions`** với 1 question:
- `header`: `fn_dimensions_review`
- `question`: "Danh sách FN và dimensions đã đúng chưa?"
- `options`: `✅ OK, tiếp tục chọn TC` (recommended), `✏️ Cần sửa FN`, `➕ Cần thêm dimension`

**Chờ user phản hồi** → sang Bước 3

---

### Bước 3 — Chọn Test Cases (Pairwise Selection)

Với mỗi FN, chọn **tổ hợp TC tối thiểu có ý nghĩa** theo nguyên tắc Pairwise:

**Pattern chuẩn:**
```
TC-1 (Normal)   : Pre-conditions OK + input hợp lệ + dependencies OK → happy path
TC-2 (Abnormal) : Pre-conditions OK + input sai / edge case → error handling
TC-3 (Edge)     : Pre-condition bất thường + input hợp lệ → behavior đặc biệt
```

Thường 2–3 TC per FN là đủ. Tránh all-combinations (số lượng bùng nổ).

Trình bày bản nháp dạng bảng để user confirm:

```
| FN | TC | Tổ hợp điều kiện chính | Loại | Expected result tóm tắt |
|----|----|------------------------|------|-------------------------|
| FN1| TC-1 | login=Chưa, camera=OK  | N    | Mở scan QR thành công  |
| FN1| TC-2 | login=Chưa, camera=Không | A  | Hiển thị popup yêu cầu quyền |
```

**Dùng `vscode_askQuestions`** với 1 question:
- `header`: `tc_selection_review`
- `question`: "TC selection có đủ và đúng không?"
- `options`: `✅ OK, viết full matrix` (recommended), `✏️ Cần điều chỉnh TC`, `➕ Thêm TC cho FN...`

**Chờ user phản hồi** → sang Bước 4

---

### Bước 4 — Viết Full Matrix

Sử dụng template: [fn-block-template.md](../skills/testcase-matrix/assets/fn-block-template.md)

Viết lần lượt từng FN block theo cấu trúc 8 section:

```
[A] ◆FNx — Tên chức năng
[B] TC number header:  | TC-1 | TC-2 | ...
[C] 条件/Condition     — 〇 marks
[D] 動作/Action        — 〇 / ① ② marks
[E] 期待結果/Expected  — ● / ❶ ❷ marks
[F] TCタイプ           — N / A
[G] 試験結果           — Device × First/Last time (để trống chờ điền)
[H] コメント           — Bug ID (để trống)
```

**Quy tắc viết expected result:**
- Mô tả đầy đủ: `[màn hình] hiển thị [UI element]\n  Nội dung: [text chính xác]\n  Button: [label]`
- Platform difference: `iOS: ... / AOS: ...`
- UI text / button label giữ nguyên **tiếng Nhật nguyên bản** từ design

**Quy tắc ký hiệu:**
- `〇` — condition value được chọn / action áp dụng
- `●` — expected result kỳ vọng
- `❶ ❷` — expected result cho multi-step action `① ②`
- Mỗi cột TC: đúng 1 `〇` trên mỗi dimension, đúng 1 `●` (hoặc `❶❷`)

---

### Bước 5 — Quality Check & Xuất File

**5a. Self-check theo checklist:**

Chạy qua toàn bộ: [quality-checklist.md](../skills/testcase-matrix/references/quality-checklist.md)

Tự phát hiện và fix ngay các lỗi:
- Cột TC thiếu `〇` trên dimension bắt buộc
- Cột TC thiếu `●` trong expected result
- Expected result không có UI text cụ thể
- Thiếu platform difference (iOS/AOS) khi behavior khác nhau

**5b. Tạo file Markdown output:**

Cấu trúc file output:
```markdown
# Matrix Testcase — [Feature Name]

**Tính năng:** [Feature]
**Tạo bởi:** [Creator]
**Ngày tạo:** [Date]
**Release:** [Release tag]
**Devices:** [Device list]

---

## Summary

| FN ID | Mô tả | Số TC | Loại |
|-------|-------|-------|------|
| FN1   | ...   | 2     | N/A  |
...

---

## GUI Checklist (dạng danh sách)

[Các TC kiểm tra layout/label — viết dạng list ngắn nếu có]

---

## Function Matrix

[Các FN block theo thứ tự FN1, FN2...]
```

**5c. Lưu file:**

Lưu tại đường dẫn do user cung cấp ở Bước 1 (`output_folder`), tên file theo convention:
```
[feature_name]_fn_matrix.md
```

Ví dụ: `Test Result/7.4.0/App/Base QR Scan/scan_qr_home_fn_matrix.md`

---

## Output Cuối Cùng

| Artifact | Nội dung | Định dạng |
|---|---|---|
| File matrix chính | FN1–FNx blocks đầy đủ | `.md` |
| Summary table | FN list + TC count + loại | Trong file md |
| GUI checklist | TC layout/label (nếu có) | Trong file md |

Báo cáo cho user:
- Tổng số FN và TC
- Đường dẫn file đã tạo
- Các điểm cần user điền thêm (device name, ngày test thực tế)
