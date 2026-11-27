---
description: Sinh Test Scenario List (UAT) cho workflow phê duyệt Intra-mart theo file IM_Workflow_*_Pre-UAT_Test.xlsx — sheet "1.Workflow Overview" làm tiền đề để sinh sheet "2.Test Scenario List".
agent: agent
tools: ['codebase', 'editFiles', 'runCommands', 'fetch', 'search', 'usages', 'vscode_askQuestions']
---

> **BẮT BUỘC (MANDATORY SKILLS):**
> - Nạp và đọc kỹ skill **`format-testcase-uat-scenario`** (`.github/skills/format-testcase-uat-scenario/SKILL.md`) — toàn bộ cấu trúc sheet, quy ước ID/Path/Priority tuân theo skill này.
> - Template gốc: `templates/testcase/IM_Workflow_建設稟議（新店）_Pre-UAT_Test_20260928.xlsx`.
> - Ghi file Excel bằng `exceljs` tại `scripts/convert_excel/node_modules` (clone style từ dòng mẫu).

# Workflow: Sinh Test Scenario List (UAT) từ Workflow Overview

## Nguyên tắc thực thi

- Thực hiện tuần tự, **2 checkpoint PHẢI dừng chờ user duyệt**: sau khi lập xong sheet 1, và sau khi liệt kê scenario (trước khi ghi Excel).
- Sheet 1 (`1.Workflow Overview`) là **tiền đề**; mọi scenario ở sheet 2 phải truy vết được về node / loại Path ở sheet 1.
- Thu thập nhiều thông tin cùng lúc bằng **1 lần gọi `vscode_askQuestions`** (nhiều questions), không hỏi rời rạc.
- Không tự bịa node, status, điều kiện skip. Thiếu thông tin → hỏi user.
- Mỗi app/workflow là nghiệp vụ riêng: không áp quy tắc app khác; mọi tên node trong sheet 2 phải có trong sheet 1 (không có `作成者` nếu sheet 1 không có); case có node không tồn tại → sửa sang node đúng hoặc đánh dấu **đề xuất xóa** (đỏ); case "Non {node}" không có căn cứ → **đề xuất xóa**, không tự xóa.
- Khi cập nhật file có sẵn: backup → chỉ sửa chỗ sai → tô xanh (thêm) / vàng (sửa) / đỏ (đề xuất xóa) + ghi chú lý do → đánh lại ID. Giả định Q&A phải ghi vào cột Ghi chú theo yêu cầu user.
- Tất cả output bằng **Tiếng Việt** (giữ nguyên thuật ngữ Nhật: 申請, 差戻し, 引戻し, 取止め, 再申請, 却下, 関係者…).

## Các bước

### Bước 1: Thu thập thông tin
Hỏi 1 lần (`vscode_askQuestions`):
- `workflow` — Tên Workflow + Workflow ID + phiên bản + môi trường
- `spec` — Spec / ảnh flow / bảng 承認者 (danh sách node, status, action, node nào có thể skip, nhánh 関係者 bắt đầu/kết thúc ở đâu)
- `docs` — Các document hoặc luồng (vd: 発注/支払, hoặc CEO決裁/TCO決裁) — mỗi doc/luồng có bộ scenario riêng
- `returnRule` — Đích của 差戻し theo từng node
- `skipNodes` — Node có thể bỏ trống/skip
- `pgNodes` — Node là PG và node là user thường
- `features` — Có import / auto shinsei / copy không
- `mailRule` — Node nào không nhận mail 承認依頼; người nhận mail 完了
- `creator` — Người tạo template
- `folder` — Folder đích để lưu file `.xlsx`

Nếu user đưa file đã có sheet 2 → dùng **Chế độ cập nhật file có sẵn** trong skill (backup, giữ layout, tô màu case thêm/sửa).

### Bước 2: Lập sheet 1 — Workflow Overview
1. Điền thông tin workflow, bảng Node (No, Node Name JP, Status, Action, Ghi chú/Điều kiện chuyển), bảng Loại Path cần cover.
2. Trình bày nội dung sheet 1 dạng bảng markdown.
3. **CHECKPOINT 1:** chờ user duyệt/chỉnh node và loại Path.

### Bước 3: Suy ra danh sách Scenario (sheet 2)
1. Áp dụng "Bản đồ Loại Path → Scenario" trong skill cho **từng document**.
2. Thêm scenario "Non {node}" cho mỗi node có thể skip, và `A-xx`, `O-xx` nếu phù hợp.
3. Gán Scenario ID, tên, Path (ký hiệu theo No node), kết quả kỳ vọng, Priority.
4. Trình bày bảng scenario + bảng truy vết (loại Path / node → Scenario ID).
5. **CHECKPOINT 2:** chờ user duyệt danh sách.

### Bước 4: Xuất Excel
1. Copy template, cập nhật sheet 1 và sheet 2 theo skill (công thức `=ROW()-13` / `=ROW()-4`, dropdown Status cột J/M, freeze pane A5).
2. Lưu: `IM_Workflow_{tên workflow}_Pre-UAT_Test_{yyyymmdd}.xlsx` vào folder đích.
3. Đọc lại file để xác nhận: số dòng, ID không trùng, công thức, dropdown, freeze pane.
4. Chạy checklist cuối trong skill và báo cáo: số scenario theo document, scenario nào ở mức Low/[NEGATIVE], điểm còn giả định.
