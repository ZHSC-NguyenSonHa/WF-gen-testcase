---
name: format-testcase-uat-scenario
description: Skill tạo Test Scenario List (UAT) cho workflow phê duyệt Intra-mart theo file IM_Workflow_*_Pre-UAT_Test.xlsx — đọc sheet "1.Workflow Overview" (node, status, action, loại Path cần cover) để sinh sheet "2.Test Scenario List" (mỗi scenario = 1 đường đi Path trong workflow).
argument-hint: "Spec/ảnh workflow (danh sách node, status, điều kiện skip, kankei), tên + ID workflow, các document (発注/支払...), output folder, release/version"
---

# Format Testcase — UAT Scenario theo Workflow Overview

## Mục tiêu

Sinh file Excel UAT cho nghiệp vụ workflow (Intra-mart) theo mẫu  
`templates/testcase/IM_Workflow_建設稟議（新店）_Pre-UAT_Test_20260928.xlsx`.

Skill chỉ bao phủ 2 sheet:

| Sheet | Vai trò |
|-------|---------|
| `1.Workflow Overview` | **Tiền đề**: mô tả workflow, danh sách node, các loại Path bắt buộc phải cover |
| `2.Test Scenario List` | **Kết quả**: mỗi dòng = 1 scenario = 1 đường đi (Path) trong workflow, suy ra từ sheet 1 |

> Sheet `0.Hướng dẫn sử dụng`, `3.Test Case Detail`, `UIUX_Checklist` nằm ngoài phạm vi skill này.  
> Khác với `format-testcase-workflow` (testcase chi tiết từng Input/Output theo node), skill này thiết kế ở mức **scenario/path** cho Business User UAT.

---

## Quy trình bắt buộc: Sheet 1 → Sheet 2

1. Thu thập thông tin workflow (spec, ảnh flow, master 承認者) → điền **sheet 1**.
2. Đánh số node ở sheet 1 (cột No). **Số node này chính là ký hiệu dùng trong cột Path của sheet 2.**
3. Với mỗi **loại Path** ở mục 3 sheet 1 → sinh ≥ 1 scenario ở sheet 2.
4. Với mỗi node có điều kiện skip/optional (ghi trong cột "Ghi chú / Điều kiện chuyển") → sinh scenario "Non <node>".
5. Rà soát bằng checklist cuối file này, đảm bảo mọi dòng ở sheet 1 đều có scenario tương ứng ở sheet 2 (traceability).

6. Với mỗi **button/chức năng riêng của node** ghi trong cột "Ghi chú / Điều kiện chuyển" (vd đính kèm file `ファイル添付`, chọn file merge `添付ファイル選択`, chọn ngày `決裁日入力`) → sinh scenario riêng (dùng chức năng, kết hợp, 引戻し sau khi dùng, biến thể). Chỗ spec chưa mô tả → viết theo giả định và ghi Ghi chú "cần xác nhận spec".

---

## Sheet 1 — `1.Workflow Overview`

Cột A–F (rộng 22 / 39 / 49 / 18 / 53 / 15). Font Cambria; không hiện gridlines.

| Dòng | Nội dung |
|------|----------|
| 1 | Tiêu đề (merge A1:F1): `INTRA-MART WORKFLOW TEST - BUSINESS USER UAT TEMPLATE` — Cambria 14 đậm, màu `1F4E79`, căn giữa |
| 2 | Phụ đề (merge A2:F2): `Workflow {N} Nodes → Test Scenario & Test Case Design` |
| 4 | Header mục (merge): `1. Thông tin Workflow` — nền `D6EAF8`, đậm |
| 5–10 | Cặp nhãn (cột A, đậm) – giá trị (cột B): `Tên Workflow`, `Workflow ID`, `Phiên bản`, `Môi trường`, `Người tạo Template`, `Ngày tạo` |
| 12 | Header mục (merge): `2. Danh sách {N} Nodes & Kankei users - {số doc} docs {tên doc}` |
| 13 | Header bảng (nền `1F4E79`, chữ trắng đậm, border thin): `No` / `Node Name (JP)` / `Status WF tương ứng` / `Action WF` / `Ghi chú / Điều kiện chuyển` |
| 14… | Mỗi node 1 dòng. Cột A dùng công thức `=ROW()-13` |
| sau bảng node (+2) | Header mục (merge): `3. Các loại Path cần cover (bắt buộc)` |
| tiếp theo | Header bảng: `No` / `Loại Path` / `Mô tả`; mỗi loại Path 1 dòng |

### Cách điền bảng Node (mục 2)

| Cột | Quy tắc |
|-----|---------|
| No | Tự động `=ROW()-13`. Node song song (関係者) dùng **1 dòng** nhưng ở sheet 2 ký hiệu `8.1`, `8.2`, … cho từng user |
| Node Name (JP) | Tên node đúng như hệ thống: `申請者`, `上長`, `部門長`… (chỉ ghi node có thật; `作成者` chỉ xuất hiện nếu workflow có node này) |
| Status WF tương ứng | Status hiển thị khi bản ghi dừng ở node (dạng `〜待ち`). Node kankei không có status riêng → `-` |
| Action WF | `Save / Apply / Re-Apply / Cancel` cho node đầu; `Approve` cho node giữa; `Approve → END` cho node cuối |
| Ghi chú / Điều kiện chuyển | Ai thao tác được gì (承認 / 差戻し). **Bắt buộc ghi rõ**: node có thể bỏ trống/skip, nhánh song song (kankei) bắt đầu & kết thúc ở đâu |

### 9 loại Path chuẩn (mục 3) — tùy workflow có thể bỏ loại không áp dụng

| No | Loại Path | Mô tả |
|----|-----------|-------|
| 1 | Happy Path | Luồng suôn sẻ từ 申請 → 完了 |
| 2 | 差戻し (Return) | Trả về từ các node phê duyệt / user kankei |
| 3 | 引戻し (Pull back) | Người xin/người phê duyệt kéo lại (nếu có) |
| 4 | 取止め (Cancel) | Người xin hủy bản ghi |
| 5 | 再申請 (Reapply) | Xin lại bản ghi bị trả về / tự kéo về |
| 6 | Điều kiện đặc biệt | Ví dụ: bắt buộc hoàn thành nhánh kankei trước node X |
| 7 | Thay đổi user 関係者 | Thêm/sửa/xóa user kankei chưa phê duyệt (khi chưa END nhánh kankei) |
| 8 | Hủy tự động 却下 | Quá N ngày (mặc định 60) không thao tác → tự động hủy |
| 9 | Quyền view bản ghi của node là PG | Node là Program Group: user 1 duyệt, user 2 vẫn xem được bản ghi đã duyệt |

---

## Sheet 2 — `2.Test Scenario List`

Font **Noto Sans JP 10**, màu chữ `374151`, border thin, wrap text, căn trên (top). Freeze pane tại **A5** (cố định 4 dòng đầu). Không hiện gridlines.

| Dòng | Nội dung |
|------|----------|
| 1 | Merge ngang: `TEST SCENARIO LIST - Business User UAT` — đậm, màu `1F4E79`, căn giữa |
| 2 | Merge ngang: `Mỗi Scenario = 1 đường đi (Path) chính trong Workflow` |
| 4 | Header bảng — nền `1F4E79`, chữ trắng đậm, cao 33 |
| 5… | Mỗi scenario 1 dòng, cao tối thiểu 33 (tăng theo số dòng text) |

### Cột (A–N)

| Cột | Tên | Độ rộng | Cách điền |
|-----|-----|---------|-----------|
| A | No | 6 | Công thức `=ROW()-4`, căn giữa |
| B | Đối tượng | 13 | Document/nhóm: `Doc 発注`, `Doc 支払`, `Authorization`, `Other` |
| C | Scenario ID | 12.4 | Xem quy ước ID bên dưới |
| D | Scenario Name | 52 | Ngắn gọn, bắt đầu bằng loại Path (xem quy ước đặt tên) |
| E | Path mô tả (Nodes) | 55 | Chuỗi node dạng `1→2→3→…` (xem ký hiệu Path) |
| F | Kết quả kỳ vọng | 55 | Trạng thái sau cùng + mail gửi cho ai |
| G | Priority | 8.7 | `High` / `Medium` / `Low` |
| H | Tester 1 | 10 | Tên người test (để trống khi mới sinh) |
| I | Test date 1 | 10 | Ngày test (để trống khi mới sinh) |
| J | Status 1 | 12.6 | Dropdown: `Not Start,In Progress,Pass,Fail,Blocked` — mặc định `Not Start` |
| K | Tester 2 | 10 | Vòng test lần 2 |
| L | Test date 2 | 10 | |
| M | Status 2 | 9 | Dropdown như J |
| N | Ghi chú | 16.4 | Bug link, điều kiện đặc biệt |

> Data validation dạng list áp cho **từng ô** J và M của mọi dòng scenario.

### Quy ước Scenario ID

| Loại | Mẫu | Ví dụ |
|------|-----|-------|
| Scenario theo document | `SC-{docNo}-{NN}` (NN 2 chữ số, liên tục trong doc) | `SC-1-01`, `SC-2-15` |
| Phân quyền | `A-{NN}` | `A-01` |
| Chức năng phụ liên quan | `O-{NN}` | `O-01` |

Mỗi document (発注, 支払…) có bộ scenario riêng (docNo 1, 2…) với cấu trúc tương tự.

### Quy ước đặt tên Scenario (cột D)

- Happy Path: `Happy Path - {biến thể}` (tạo từ button / copy / import / save rồi tạo / auto shinsei / full node / Non {node}…)
- Return/Pull/Cancel/Reapply: `差戻し từ {node}`, `引戻し từ {node}`, `取止め bản ghi {trạng thái}`, `再申請 bản ghi bị 差戻し`
- Kankei: `User node thay đổi user 関係者: {thao tác}`, `User kankei thay đổi user 関係者: {thêm/xóa}`
- Tự động hủy: `Auto 却下 - Bản ghi tại {node} sau {N} ngày`; case phủ định gắn tiền tố `[NEGATIVE]`
- PG: `Quyền view bản ghi của node là PG`, `PG: Approve đồng thời, …`

### Ký hiệu Path (cột E)

- Số = **No node** ở sheet 1, nối bằng `→`. Ví dụ full node: `1→2→3→4→5→6→7→8.1→8.2→9→10→11→12→13→14`
- `8.1`, `8.2`… = từng user 関係者 trong nhánh song song
- Node bị skip thì **bỏ số đó khỏi chuỗi** (Non 建設上長 → `1→2→4→…`)
- Hành động đặc biệt ghi ngay sau số node: `4 差戻し→1`, `1 引戻し`, `1 取止め`, `1 再申請`, `3 comment, approved`
- Nhánh kankei kết thúc muộn có thể xen sau node khác (vd `…→8.1→9→10→11→8.2→12`)
- Thao tác của nhiều user ghi trong ngoặc: `(user 1 phê duyệt, user 2 confirm từ list all)`
- Tiền điều kiện đầu path: `1 tạo bản ghi có 2 kankei→2→3…`
- Scenario Authorization/Other có thể nhiều bước: đánh số `1. … 2. …` ở cả E và F tương ứng

### Cách viết Kết quả kỳ vọng (cột F)

- Nêu **kết quả cuối** + **mail** (`承認依頼` cho user tiếp theo / `差戻し` / `完了` …) + người nhận (chỉ dùng tên node có trong sheet 1; người nhận mail 完了 lấy theo quy tắc mail user xác nhận, mặc định `all user node cc user share và kankeisha`)
- Happy full node (mặc định): `Approved thành công lần lượt các step và tạo ra bản ghi 完了. Gửi mail 完了 đến all user node cc user share và kankeisha`. Nếu workflow có node KHÔNG nhận mail 承認依頼 (vd 秘書室, 決裁者) → ghi rõ trong kết quả các case đi qua node đó, và không sinh case "mở bản ghi từ mail" cho node đó
- 差戻し/引戻し "về node đầu": ghi đúng tên node đầu ở sheet 1 (vd `申請者 (node 1)`), không dùng `作成者` nếu sheet 1 không có node này
- 再申請: giữ nguyên `申請No.` ban đầu
- Case phủ định: `Bản ghi vẫn giữ nguyên trạng thái …. KHÔNG tự động 却下`
- Nhiều kết quả → mỗi ý 1 dòng (`\n`)

### Quy tắc Priority

| Priority | Áp dụng |
|----------|---------|
| High | Happy Path chính (full node, các cách tạo bản ghi), 差戻し, 引戻し, 再申請, thay đổi kankei, quyền view PG |
| Medium | Happy Path biến thể (Non node), 取止め, copy, các case PG đồng thời, Authorization, Other |
| Low | Auto 却下 và các case [NEGATIVE] phụ thuộc thời gian |

---

## Bản đồ Loại Path → Scenario cần sinh (cho mỗi document)

| Loại Path (sheet 1) | Scenario tối thiểu |
|---------------------|--------------------|
| Happy Path | Tạo từ button; từ copy; từ import; save→edit→tạo; auto shinsei (user create = user 申請者) cả 2 cách tạo; full node (từng cách tạo); **Non {mỗi node skip được}** |
| 差戻し | Từ node thứ 2 (ngay sau node đầu); từ 1 node giữa; từ 関係者 — về node đích user xác nhận (mặc định node đầu ở sheet 1, vd 申請者) |
| 引戻し | Từ node đầu (vd 申請者); từ 1 node phê duyệt (sửa comment rồi approve tiếp) |
| 取止め | Sau 引戻し; sau 差戻し |
| 再申請 | Bản ghi bị 差戻し giữa luồng → 再申請 (giữ 申請No.) |
| Điều kiện đặc biệt | Kankei phải xong trước node chỉ định (nếu spec có) |
| Nhánh kankei song song | Nếu kankei chạy song song với các node chính: dùng thứ tự shounin kankei **xen kẽ ngẫu nhiên** trong **chính các case đã có** (Full node, Non {node}, 差戻し từ 関係者). **Mỗi case chỉ 1 path**, thứ tự khác nhau giữa các case (không trùng); **không** gộp nhiều `Path 1/2/3` trong 1 dòng và **không** tạo case xen kẽ đứng riêng. Kết quả kỳ vọng nêu từng bước: status còn ở node nào, khi nào mới gửi mail cho node sau nhánh kankei |
| Thay đổi 関係者 | 0→N; sửa user; thêm ở node kankei; xóa toàn bộ chưa 承認 — từ cả user node và user kankei |
| Hủy tự động | Có 却下 (tại node kankei sau N ngày); **[NEGATIVE]** không 却下 (bản ghi 差戻し về node đầu, status của node đó ở sheet 1, vd `申請者待ち`) |
| Quyền view PG | List all / URL từ mail; 2 user approve đồng thời; user sau mở bản ghi đã duyệt (Portal vs mail) |
| Ngoài document | `A-01` phân quyền add/remove PG; `O-01` tính năng phụ (list→search→duplicate…) |

---

## Cách sinh file Excel

1. Copy template `templates/testcase/IM_Workflow_建設稟議（新店）_Pre-UAT_Test_20260928.xlsx` sang output, **giữ nguyên** sheet 0, 3 và `UIUX_Checklist` nếu người dùng không yêu cầu bỏ.
2. Dùng `exceljs` (đã có ở `scripts/convert_excel/node_modules`) — **clone style** từ dòng mẫu (dòng 14 sheet 1; dòng 5 sheet 2), không tự định nghĩa lại font/border.
3. Sheet 1: ghi đè thông tin workflow, xóa bớt/thêm dòng node và dòng Path cho khớp, cập nhật số node trong phụ đề dòng 2 và công thức `=ROW()-13`.
4. Sheet 2: xóa các dòng dữ liệu cũ từ dòng 5, ghi scenario mới, công thức cột A `=ROW()-4`, thêm data validation cột J/M, đặt chiều cao dòng theo nội dung.
5. Lưu tên: `IM_Workflow_{tên workflow}_Pre-UAT_Test_{yyyymmdd}.xlsx`.
6. Mở lại file bằng script đọc để xác nhận: số dòng, ID không trùng, công thức A, dropdown Status, freeze pane.

> Lưu ý exceljs: khi đọc, công thức dùng shared formula; khi ghi hãy gán lại công thức tường minh `{ formula: 'ROW()-4' }` cho từng ô cột A để tránh mất số thứ tự.

## Mỗi app là một nghiệp vụ riêng

- **Không** mang quy tắc của app/workflow này sang app khác (node skip, đích 差戻し, node PG, A-01/O-01, import/auto shinsei…). Mọi quy tắc phải suy từ **sheet 1 của chính file đó** hoặc từ câu trả lời của user.
- **Sheet 1 là nguồn duy nhất về node.** Mọi tên node, số node, status và người nhận mail trong sheet 2 (và sheet 3 nếu có) phải có trong sheet 1; node không có ở sheet 1 (vd `作成者`, `受付`, `本部長`, `建設上長`, `上長/DM`) thì **không mô tả** trong testcase.
- Khi cập nhật file có sẵn, case có tên node không tồn tại trong sheet 1 = copy nhầm từ app khác → **sửa** sang node đúng của sheet 1 (vd `引戻し từ 作成者` → `引戻し từ 申請者` nếu node 1 là 申請者) hoặc **đề xuất xóa** nếu không có node tương đương. Cũng rà các câu mô tả loại Path ở sheet 1 (vd "từ 作成者, 申請者") và sửa cho khớp node thật.
- `A-xx`/`O-xx` chỉ tạo khi workflow thực sự có chức năng phân quyền/tính năng phụ đó; không tự thêm.
- Node chỉ được coi là skip được khi sheet 1 ghi rõ; node duyệt cuối (→ END) không skip. Case "Non {node}" không có căn cứ → đánh dấu **đề xuất xóa**, không tự xóa.

## Giả định theo Q&A (spec còn "Cần Q&A")

Khi sheet 1 ghi "Cần Q&A" nhưng user bảo giả định spec đúng: viết case theo giả định, thay mọi dấu `?`, và ghi cột Ghi chú nội dung user yêu cầu (vd `Chờ Qna nên giả định là gửi đến user 担当者`) cho **tất cả** case bị ảnh hưởng (差戻し, 取止め/再申請 theo sau, approve lại sau 差戻し).

## Chế độ cập nhật file có sẵn — quy ước màu (bổ sung)

- Xanh nhạt `E2EFDA` = thêm mới; vàng nhạt `FFF2CC` = sửa đổi; đỏ nhạt `F8CBAD` + gạch ngang = **đề xuất xóa** (giữ dòng, ghi lý do, chờ user xác nhận). Dòng đề xuất xóa giữ ID cũ dạng `[Xóa] SC-1-06`, không tính vào dãy số.
- Chỉ sửa **đúng chỗ sai** (script khai báo `MODS` theo ID cũ, `ADD` chèn sau ID cũ, `DELETE`); case đúng giữ nguyên chữ của user, không viết lại cả sheet. Sau đó đánh lại ID liên tục theo luồng.
- Mở rộng cột Ghi chú (≈ 42) để đọc được lý do; ghi rõ "ID đã được đánh lại" khi báo user.
- Lỗi hiển nhiên ở sheet 1 (số node trong tiêu đề, tên luồng copy nhầm) được sửa và báo lại.

## Workflow có nhiều luồng (CEO決裁 / TCO決裁 / 各社COO決裁…)

Một workflow có thể có nhiều bảng node ở sheet 1 (mục `2.1`, `2.2` hoặc `2`, `3`, `4`).

- Mỗi bảng node = 1 luồng; Scenario ID `SC-{flowNo}-{NN}` với `flowNo` = số mục của bảng đó (hoặc thứ tự luồng), cột B = tên luồng (vd `Doc 海外汎用_CEO`). ID liên tục trong từng luồng, **không copy ID giữa các luồng**.
- Mỗi luồng đánh số node riêng; luồng ngắn (TCO/COO) có thể là luồng dài bỏ bớt node cuối — kiểm tra path không vượt quá số node của luồng.
- `A-xx`, `O-xx` chỉ tạo **1 lần** cho cả file (không lặp trong từng luồng).
- Kiểm tra số node ghi ở tiêu đề mục với số dòng thực tế (hay bị lệch), sửa tiêu đề cho khớp.

## Quy tắc 差戻し / skip / PG — PHẢI xác nhận với user

Sheet 1 thường không ghi đủ. Trước khi sinh scenario, hỏi user (1 lần `vscode_askQuestions`/`ask_user`):

1. **Đích của 差戻し theo từng node** (vd: node 2~5 và 関係者 → 申請者; node 担当者~TCO → node 関係者; 秘書室/決裁者 → 受付). Không mặc định về 作成者/申請者; đích phải là node có trong sheet 1.
2. **Node có thể skip/bỏ trống** (sinh scenario `Non {node}`).
3. **Node là PG** (user cùng PG) và **node là user thường** — chỉ tạo case PG cho node PG.
4. **Có import / auto shinsei / copy không** — chỉ sinh khi workflow có chức năng đó.
5. **Quy tắc mail**: node nào KHÔNG nhận mail 承認依頼 (shounin) — thao tác từ Portal/LIST ALL; người nhận mail 完了 (vd `all user trên node, cc user share và user kankei`). Ghi vào sheet 1 (cột Ghi chú của node) và áp vào kết quả kỳ vọng mọi case liên quan; thêm 1 case "Mail 承認依頼 không gửi đến node X".

Khi 差戻し về node khác 申請者, case 取止め/再申請 phải đi theo chuỗi: `7 差戻し→6, 6.1 差戻し→1 取止め`.

## Case PG — ma trận thao tác đồng thời

Với mỗi node PG, sinh (Priority Medium; case list-all High):

| Case | Kết quả |
|------|---------|
| User 1 approve, user 2 mở bản ghi từ **Portal** | User 2 xem được màn hình Detail |
| User 1 approve, user 2 mở bản ghi từ **mail** | URL không có quyền tương tác (đã duyệt) |
| 2 user cùng approve đồng thời | 1 user báo lỗi, 1 user approve thành công |
| shounin + sashi đồng thời | 1 user báo lỗi, 1 user thành công |
| add user share + shounin | như trên |
| add user kankei + shounin (chỉ node trước khi kết thúc nhánh kankei) | như trên |
| attach file + shounin | như trên |
| Hikimodoshi + shounin | như trên |
| 1 case **list all** gộp mọi node PG (user 1/2, 3/4, …) | User sau mở được bản ghi từ LIST ALL |

## Chế độ cập nhật file có sẵn

Khi user đưa file đã có sheet 2 (đã làm một phần):

1. **Backup** file gốc trước khi ghi đè.
2. **Giữ layout hiện có** của sheet 2 (vị trí dòng header, số cột 10/14, font, độ rộng, công thức cột A `=ROW()-{headerRow}`); không ép sang layout template nếu user chọn giữ nguyên. Xác định dòng header bằng cách tìm ô `No`, không giả định dòng 4.
3. Đọc toàn bộ scenario cũ → sửa lỗi (ID trùng, node sai số, tên node cũ, kết quả kỳ vọng sai, case lặp giữa các luồng) → bổ sung case thiếu.
4. **Đánh dấu thay đổi** để user review: tô màu cả dòng (xanh nhạt `E2EFDA` = thêm mới, vàng nhạt `FFF2CC` = sửa đổi), ghi thẻ `[Thêm mới]` / `[Sửa đổi]` + lý do vào cột Ghi chú, thêm chú thích màu ở dòng 3. Case không đổi giữ nguyên, không tô.
5. Bỏ các merge lạ trong vùng dữ liệu của file cũ; xóa dropdown cũ rồi đặt lại cho từng dòng mới; xóa sạch giá trị + style các dòng thừa.
6. Chỉ sửa sheet 1 khi lỗi hiển nhiên (số node ở tiêu đề, mô tả copy nhầm từ workflow khác) và **báo lại** user.
7. Script chạy lại sẽ không còn thấy "bản cũ" để so sánh → luôn chạy lại từ bản backup.
8. Nếu user đã tự chỉnh/review file sau lần sinh trước (màu, chữ, xóa dòng) → **không chạy lại từ backup cũ** (sẽ mất chỉnh sửa của user). Backup bản hiện tại (`*.user_reviewed.xlsx`) rồi sửa trực tiếp đúng ô cần sửa (script tìm theo nội dung ô), tô vàng + ghi `[Sửa đổi]` vào Ghi chú.

---

## Checklist trước khi giao

- [ ] Nhiều luồng: ID theo `SC-{flowNo}-{NN}`, không trùng, A-/O- chỉ 1 lần
- [ ] 差戻し đúng đích theo quy tắc user xác nhận; chuỗi 取止め/再申請 theo sau khớp
- [ ] Case PG chỉ cho node PG; đủ ma trận thao tác đồng thời (bỏ case "mở từ mail" cho node không nhận mail 承認依頼)
- [ ] Rà tên node: mọi tên node/status/người nhận ở sheet 2 (cột D, E, F, J) đều có trong sheet 1; grep các tên không thuộc app (`作成者`, `受付`, `本部長`, `上長/DM`…) = 0
- [ ] Mode cập nhật: đã backup, giữ layout, case thêm/sửa đã tô màu + ghi chú

- [ ] Sheet 1 đủ 3 mục: thông tin workflow, danh sách node, loại Path
- [ ] Số node ở sheet 1 khớp mọi chuỗi Path ở sheet 2 (kể cả `8.1`, `8.2`)
- [ ] Mọi node có ghi chú skip/optional đều có scenario "Non {node}"
- [ ] Mọi loại Path ở sheet 1 có ≥ 1 scenario ở sheet 2
- [ ] Mọi button/chức năng riêng của node nêu ở sheet 1 (đính kèm file, merge file, chọn 決裁日…) có scenario
- [ ] Nhánh kankei song song: mỗi case 1 path xen kẽ riêng, không trùng giữa các case, không nhiều Path trong 1 dòng; không có case auto shinsei/import/copy nếu user xác nhận app không có (user bảo "xóa luôn" thì xóa hẳn dòng, không tô đỏ)
- [ ] Scenario ID liên tục, không trùng, đúng mẫu `SC-/A-/O-`
- [ ] Cột F luôn nêu trạng thái cuối + mail (nếu có)
- [ ] Priority đúng bảng quy tắc; case phủ định gắn `[NEGATIVE]`
- [ ] Status 1/2 có dropdown, mặc định `Not Start`; Tester/Test date để trống
- [ ] Freeze pane A5, border thin, wrap text, font Noto Sans JP 10
