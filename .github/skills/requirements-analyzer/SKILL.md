---
name: requirements-analyzer
description: Kỹ năng phân tích trang web/module và sinh ra tài liệu Yêu cầu (Requirements Document/User Stories) chuẩn mực.
---

# Kỹ năng Phân tích Yêu cầu (Requirements Analyzer)

Kỹ năng này cung cấp các hướng dẫn chi tiết để AI (Copilot) có thể chuyển đổi giao diện UI hoặc cấu trúc DOM/HTML của một trang web thành các tài liệu Yêu cầu rõ ràng, chi tiết, phục vụ trực tiếp cho QA, Tester và Developer.

## 1. Mục tiêu cốt lõi
- Xây dựng tài liệu yêu cầu bám sát thực tế hệ thống đang chạy.
- Đảm bảo tính nhất quán, tính bao quát cho cả Happy Path và Edge Cases (Trường hợp ngoại lệ/báo lỗi).
- Định dạng xuất ra một cách chuyên nghiệp (Sử dụng cấu trúc Artifact).

## 2. Quy trình trích xuất thông tin
Khi được yêu cầu tạo Requirements từ một trang web:
1. **Phân tích Khung giao diện (Layout Analysis):** Xác định các phần Header, Footer, Sidebar, và Nội dung chính (Main Content).
2. **Thu thập Form & Inputs:**
   - Tìm tất cả các trường nhập liệu (`input`, `select`, `textarea`).
   - Ghi nhận thuộc tính `type` (text, email, password, number), `required`, `maxlength`, `minlength`, `pattern`.
3. **Thu thập Các nút tương tác (Buttons/Links/Actions):**
   - Xác định chức năng của từng nút (Save, Submit, Cancel, Delete, Edit).
   - Các cảnh báo, thông báo (Alerts, Toasts, Validation Messages) xuất hiện khi tương tác lỗi.
4. **Trích xuất Luồng công việc (Workflows):**
   - Sự phụ thuộc giữa các thành phần (VD: Nút Submit chỉ enable khi đã tích chọn Checkbox "Tôi đồng ý").

## 3. Cấu trúc Tài liệu Yêu cầu Đầu ra (Output Format)
Tài liệu cần được format theo Markdown chuyên nghiệp hoặc lưu dưới dạng Artifact (`requirements_spec.md`).

**Nội dung bắt buộc phải có:**

### 3.1. Tổng quan (Overview)
Mô tả tóm tắt tính năng và mục đích của trang web/module.

### 3.2. Yêu cầu Chức năng (Functional Requirements)
Chia thành các **User Stories** hoặc **Use Cases**:
- **Tên tính năng** (Ví dụ: Chức năng Đăng nhập)
- **Mô tả:** "Là một người dùng, tôi muốn... để có thể..."
- **Tiêu chí chấp nhận (Acceptance Criteria):** Ghi rõ các điều kiện cần thỏa mãn.

### 3.3. Đặc tả Trường Dữ liệu (Field Specifications)
Đây là phần cốt lõi dành cho Automation Tester:
* Dùng bảng Markdown (*Markdown Table*) để liệt kê:
  - Tên Trường (Label)
  - Loại (Type UI)
  - Validation Rules (Bắt buộc / Mặc định / Giới hạn độ dài).
  - Ghi chú (Notes).

### 3.4. Các luồng xử lý và Báo lỗi (Business Rules & Validations)
Liệt kê chi tiết các Validation Message mong đợi khi người dùng nhập sai dữ liệu.

## 3.5. Xuất Excel bằng `md_to_xlsx_styled.js` — Quy ước heading quyết định số sheet

Script `scripts/convert_excel/md_to_xlsx_styled.js` convert file `.md` → `.xlsx` (header xanh đậm, alternating rows, border, freeze, autofilter). **Số sheet output do heading Markdown quyết định**:

- Script tự xác định **level heading nhỏ nhất** (`#` ít dấu `#` nhất) đang có trong file → level đó là **level tạo sheet mới**.
- Heading **sâu hơn** level đó (vd `###` khi level tạo sheet là `##`) chỉ tạo **tiêu đề section** (dòng bold, merge cell) nằm gộp chung trong sheet của heading cha — KHÔNG tạo sheet riêng.
- Nhiều bảng dưới cùng 1 heading cấp sheet sẽ được xếp chồng (stack) trong cùng 1 sheet, cách nhau 1 dòng trống.

**Mặc định (mỗi mục 1 sheet):** Dùng toàn bộ heading cùng cấp `##` cho mỗi mục lớn → mỗi bảng ra 1 sheet riêng (giữ nguyên hành vi cũ, phù hợp khi cần nhiều sheet chi tiết).

**Khi user yêu cầu gộp/consolidate (vd "chỉ cần 2 sheet: Tổng quan + QnA"):**
- Cấu trúc `.md` chỉ dùng **2 heading `##`** ở mức cao nhất (vd `## Spec tổng quan`, `## QnA`).
- Toàn bộ mục con bên trong (Thông tin tài liệu, Business Rules, Sơ đồ trạng thái...) dùng `###` → tự động gộp thành section trong cùng 1 sheet.
- **Không** đặt heading `#` (H1) ở đầu file nếu không muốn nó bị tính là level tạo sheet — nếu cần tiêu đề tài liệu, dùng text in đậm (`**Tiêu đề**`) thay vì `# Tiêu đề`.

Ví dụ cấu trúc cho output 2-sheet:
```markdown
**📋 Phân Tích Requirement: <Tên màn hình>**

## Spec tổng quan
### Thông tin tài liệu
| ... |
### Business Rules
| ... |

## QnA
### Danh sách câu hỏi & điểm mơ hồ cần xác nhận
| # | Mã | Câu hỏi | Nguy cơ | Mức độ | ... |
```

## 4. Bắt buộc (Strict Rules)
- Luôn viết bằng **Tiếng Việt**.
- Không tự suy diễn các yêu cầu nghiệp vụ phức tạp nếu không có căn cứ từ UI. Nếu thiếu logic, hãy liệt kê chúng vào mục "Câu hỏi/Làm rõ với PO-User".
- Nếu có Playwright MCP, ưu tiên mở browser thật để screenshot/capture giao diện nếu cần.

