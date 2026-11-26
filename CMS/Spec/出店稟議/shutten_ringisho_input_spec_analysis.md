**Phân tích requirement: 出店稟議 - màn hình nhập**

Nguồn chính: `出店稟議_画面.xlsm`, sheet `入力画面`; tham chiếu ô Excel là địa chỉ trên sheet này. Chỉ ghi nhận hành vi có căn cứ trong nguồn; mục chưa rõ được lưu ở Q&A. Tài liệu này phục vụ chuẩn bị testcase theo `templates/testcase/testcase_template_inputscreen.xlsx`, **không phải testcase**.

## 1. Tổng quan ticket/tài liệu

| Thuộc tính | Giá trị từ nguồn | Căn cứ |
|---|---|---|
| Loại tài liệu | 画面機能要件定義書 (định nghĩa yêu cầu chức năng màn hình) | B3 |
| Hệ thống | xx管理システム; ID A01 | B6, L6 |
| Subsystem | 出店稟議書; ID XX01 | N6, V6 |
| Chức năng | 出店稟議; ID F_IF_D_0001 | X6, AM6 |
| Mục tiêu ghi trong spec | 出店稟議書決裁を行う (thực hiện phê duyệt tờ trình mở cửa hàng) | C10 |
| Ticket ID, type, priority, status, sprint, assignee | Không có trong tài liệu | Không ghi nhận |
| Bối cảnh bổ sung từ user | Đây là thiết kế cho **app mới** (chưa có hệ thống đang chạy để đối chiếu hành vi thực tế) | Thông tin do user cung cấp khi giao việc |
| Chất lượng nguồn | B2 là công thức `#REF!`; không dùng làm căn cứ nghiệp vụ | B2 |

## 2. User story

Là người tham gia quy trình tờ trình mở cửa hàng (vai trò cụ thể chưa nêu), tôi cần xem/điền thông tin trên màn hình 出店稟議 và gửi đơn để phục vụ quyết裁. Đây là cách diễn đạt lại mục tiêu ở C10 và sự kiện `申請` ở BN25:BU25, **không xác nhận** quyền truy cập hoặc kết quả sau gửi.

| Vai trò | Nhu cầu | Mục đích | Căn cứ |
|---|---|---|---|
| Người tham gia quy trình (chưa xác định cụ thể) | Xem/điền thông tin và mở modal 申請 | Phục vụ quyết裁 tờ trình mở cửa hàng | C10, BU25 |

## 3. Phạm vi áp dụng

| Khu vực | Phạm vi xác nhận được | Căn cứ |
|---|---|---|
| Màn hình 入力画面 | Bảng 28 mục dữ liệu có tên, thuộc tính bắt buộc/chỉnh sửa/sao chép/kiểu/độ dài | BN52:BT80 |
| Sự kiện màn hình | Khởi tạo, chọn 業態欄, chọn 承認者, chọn 開発者, 申請 | BN20:BU25 |
| Master/người dùng | Có gọi popup 業態マスタ và danh sách người dùng; khởi tạo đọc 各種承認者マスタ | BU21:BU24 |
| Ngoài phạm vi xác nhận | Workflow duyệt, lưu nháp, màn hình sau submit, trạng thái đơn, API, thông báo lỗi | Không có định nghĩa tương ứng |

## 4. Acceptance criteria - phân tích chi tiết

### 4.1. Sự kiện được mô tả

| ID phân tích | Trigger trong nguồn | Hành vi được nêu | Căn cứ | Giới hạn thông tin |
|---|---|---|---|---|
| AC-01 | 初期表示 (hiển thị lần đầu) | Tự lấy giá trị từ 各種承認者マスタ | BN21:BU21 | Chưa chỉ rõ ánh xạ field, điều kiện, lỗi master |
| AC-02 | 業態欄選択 | Hiển thị popup 業態マスタ | BN22:BU22 | Không có mục 業態 trong bảng 28 field |
| AC-03 | 承認者選択 | Hiển thị danh sách người dùng | BN23:BU23 | Không nói field nào nhận giá trị |
| AC-04 | 開発者選択 | Hiển thị danh sách người dùng | BN24:BU24 | Không nói có phải 開発関係者 hay không |
| AC-05 | 申請 | Hiển thị modal 申請 | BN25:BU25 | Không xác định validation, xác nhận cuối, lưu hay đổi trạng thái |

### 4.2. Danh mục field phục vụ mapping template input

Giữ nguyên ký hiệu nguồn: `〇` = có, `×` = không, `△` = có điều kiện chưa mô tả, `ー` = không nêu/không áp dụng; **không đổi `ー` thành `×`**. Cột độ dài là `桁数` từ spec, chưa biết tính theo ký tự, byte, số file hay dung lượng. Không có mô tả ở cột BU/BV cho 28 field này.

| No | 項目名 (label nguồn) | 必須 | 編集 | 複製 | 型 | 桁数 | Ô nguồn |
|---|---|---|---|---|---|---|---|
| 1 | 稟議会社略称 | 〇 | × | 〇 | テキスト | 1024 | BN53:BT53 |
| 2 | 帳票名 | ー | × | ー | テキスト | 1024 | BN54:BT54 |
| 3 | 情報区分 | 〇 | 〇 | 〇 | ラジオボタン | ー | BN55:BT55 |
| 4 | 稟議No | ー | × | × | テキスト | 1024 | BN56:BT56 |
| 5 | 申請No | ー | × | × | テキスト | 1024 | BN57:BT57 |
| 6 | 申請日 | ー | × | × | 日付 | 8 | BN58:BT58 |
| 7 | 作成者 | 〇 | × | × | ユーザー | ー | BN59:BT59 |
| 8 | 担当者 | 〇 | 〇 | 〇 | ユーザー | ー | BN60:BT60 |
| 9 | 部門長 | 〇 | 〇 | 〇 | ユーザー | ー | BN61:BT61 |
| 10 | 管理課 | 〇 | × | × | ユーザー | ー | BN62:BT62 |
| 11 | 開発関係者 | × | 〇 | 〇 | ユーザー | ー | BN63:BT63 |
| 12 | 本部長 | 〇 | 〇 | 〇 | ユーザー | ー | BN64:BT64 |
| 13 | 各社COO | 〇 | × | × | ユーザー | ー | BN65:BT65 |
| 14 | 中間HDCOO | 〇 | × | × | ユーザー | ー | BN66:BT66 |
| 15 | 社長室 | △ | × | × | ユーザー | ー | BN67:BT67 |
| 16 | 担当役員 | 〇 | × | × | ユーザー | ー | BN68:BT68 |
| 17 | 秘書室 | 〇 | × | × | PG | ー | BN69:BT69 |
| 18 | 決裁者 | 〇 | × | × | テキスト | 1024 | BN70:BT70 |
| 19 | 会社名 | 〇 | 〇 | 〇 | マスタ | ー | BN71:BT71 |
| 20 | 店舗名 | 〇 | 〇 | 〇 | マスタ | ー | BN72:BT72 |
| 21 | 添付ファイル | 〇 | 〇 | × | ファイル | 50 | BN73:BT73 |
| 22 | 稟議書PDF | 〇 | 〇 | 〇 | ファイル | 1 | BN74:BT74 |
| 23 | 決裁者コメント | × | △ | × | テキスト | 1024 | BN75:BT75 |
| 24 | 担当役員コメント | × | △ | × | テキスト | 1024 | BN76:BT76 |
| 25 | 中間HDCOOコメント | × | △ | × | テキスト | 1024 | BN77:BT77 |
| 26 | 各社COOコメント | × | △ | × | テキスト | 1024 | BN78:BT78 |
| 27 | 関係者コメント | × | △ | × | テキスト | 1024 | BN79:BT79 |
| 28 | 承認者コメント | × | △ | × | テキスト | 1024 | BN80:BT80 |

### 4.3. Quy tắc nhập và trạng thái có thể kết luận

| Nhóm | Kết luận từ thuộc tính nguồn | Chưa được đặc tả |
|---|---|---|
| Không sửa | Các field có `編集=×` không cho chỉnh sửa theo bảng định nghĩa | Giá trị ban đầu, nguồn lấy, thời điểm cập nhật |
| Có thể sửa | Các field có `編集=〇` được đánh dấu chỉnh sửa được | Widget thực tế, giá trị mặc định, thông báo lỗi |
| Điều kiện | `社長室` có `必須=△`; 6 comment có `編集=△` | Trigger chính xác cho từng điều kiện |
| Sao chép | `複製=〇` ghi nhận ở một số field | Thời điểm/cách mở chức năng sao chép, cách xử lý dữ liệu nhạy cảm |
| Bắt buộc | `必須=〇` là metadata field | Thời điểm validate và lỗi hiển thị chưa có |

## 5. Phụ thuộc

| Nguồn/phụ thuộc | Vai trò được ghi nhận | Trạng thái xác minh |
|---|---|---|
| `06.画面機能要件定義_出店稟議.xlsm` cùng thư mục | Đối chiếu toàn bộ giá trị ô: giống file chính | Không bổ sung quy tắc mới từ ô |
| 各種承認者マスタ | Nguồn tự lấy ở 初期表示 | Chưa có tài liệu mapping master |
| 業態マスタ | Popup khi chọn 業態欄 | Chưa có danh mục/điều kiện chọn |
| ユーザー一覧 | Mở khi chọn 承認者/開発者 | Chưa có lọc/quyền/chọn nhiều |
| Ticket được reference | Không có ID ticket liên quan trong ô dữ liệu | Không có ticket để đọc tiếp |

## 6. Phân tích mockup/screenshot

| Thành phần | Quan sát xác thực | Hạn chế |
|---|---|---|
| Ảnh nhúng trong sheet `入力画面` | Có 1 PNG, 1022 x 972 px, anchor bắt đầu tại C53; sheet ghi vùng layout `B51:BI158` ở BD4 | Chưa đọc trực quan được nội dung PNG trong môi trường hiện tại; không khẳng định bố cục, label, nút hay option từ ảnh |
| Vùng chỉ dẫn item | BD3 ghi `BN53:BX121`; field thực có tên chỉ tại hàng 53-80 | Các dòng 81-121 chỉ có số thứ tự trống, không coi là field |
| Đối chiếu với template testcase | Template có ví dụ `申請書タイトル`, `256`, trong khi spec ghi `帳票名`, `1024` ở field tương ứng ban đầu | Template là mẫu testcase, không phải bằng chứng thay thế spec; cần xác nhận phiên bản/form |

## 7. Các điểm mơ hồ và rủi ro

### 7.1. Q&A log - câu hỏi cần PO/BA xác nhận

Tất cả câu dưới đây có trạng thái **Chờ trả lời**; chưa có phản hồi từ PO/BA. Dùng mã QNA để cập nhật quyết định trước khi viết expected result.

| Mã | Câu hỏi cần xác nhận | Nguy cơ nếu bỏ ngỏ | Mức độ | Căn cứ | Trạng thái |
|---|---|---|---|---|---|
| QNA-01 | Đây là form mới hay bản tương ứng với ví dụ trong template? Tên `帳票名` so với `申請書タイトル`, và các giới hạn 1024 so với 256, dùng bản nào? | Sai label/boundary testcase | Cao | BO54/BT54; template C11/H11 | Chờ trả lời |
| QNA-02 | `ー` tại 必須/複製 nghĩa là không áp dụng, không bắt buộc hay chưa xác định? | Sai tiền điều kiện và kỳ vọng copy | Cao | BP54/BP56:BP58, BR54 | Chờ trả lời |
| QNA-03 | Giá trị mặc định của từng field (đặc biệt 稟議会社略称, 帳票名, các số, ngày, 作成者, 決裁者) và thời điểm sinh/cập nhật là gì? | Kỳ vọng khởi tạo không kiểm chứng được | Cao | AC-01; BN53:BT70 | Chờ trả lời |
| QNA-04 | 各種承認者マスタ ánh xạ vào field nào, theo công ty/店舗/業態 nào và xử lý thế nào khi master rỗng/lỗi? | Sai người phê duyệt, không gửi được đơn | Cao | BU21 | Chờ trả lời |
| QNA-05 | Điều kiện nào làm `社長室` bắt buộc? Khi không áp dụng có hiển thị/cho bỏ trống không? | Thiếu nhánh phê duyệt | Cao | BP67=△ | Chờ trả lời |
| QNA-06 | 6 comment `編集=△` được mở theo vai trò và trạng thái nào? Ai được xem/sửa sau submit? | Lộ/sửa comment sai quyền | Cao | BQ75:BQ80 | Chờ trả lời |
| QNA-07 | `業態欄` ở sự kiện chọn nhưng không nằm trong danh sách 28 field: nằm ở đâu, có bắt buộc/copy/giới hạn không? | Bỏ sót field của form | Cao | BU22; BO53:BO80 | Chờ trả lời |
| QNA-08 | `開発者選択` có tương ứng `開発関係者` không? `承認者選択` ánh xạ field nào? Cho chọn một hay nhiều user? | Sai mapping picker | Cao | BU23:BU24; BO59:BO68 | Chờ trả lời |
| QNA-09 | Chọn `会社名`/`店舗名` ảnh hưởng danh sách hoặc giá trị field khác thế nào? Có lọc cửa hàng theo công ty không? | Dữ liệu không nhất quán | Cao | BO71:BO72 | Chờ trả lời |
| QNA-10 | `情報区分` có những option nào, giá trị mặc định, phụ thuộc/quyền xem ra sao? | Không xác định được các nhánh nhập | Trung bình | BO55:BT55 | Chờ trả lời |
| QNA-11 | Độ dài `桁数` áp dụng thế nào cho text, ngày 8, 添付ファイル 50 và 稟議書PDF 1? File giới hạn số lượng, MB hay ký tự tên file? | Boundary và upload sai | Cao | BT53:BT80 | Chờ trả lời |
| QNA-12 | Định dạng ngày `申請日`, timezone và thời điểm lấy ngày là gì? | Sai ngày gần nửa đêm/múi giờ | Trung bình | BO58:BT58 | Chờ trả lời |
| QNA-13 | Loại file, kích thước, số lượng, tính bắt buộc khi gửi, cách xóa/thay thế và xử lý file lỗi của hai mục upload là gì? | Sai kiểm thử file/submit | Cao | BN73:BT74 | Chờ trả lời |
| QNA-14 | Modal `申請` có thành phần, nút xác nhận/hủy, validation, lỗi và kết quả lưu/đổi trạng thái nào? | Không thể xác định AC submit | Cao | BU25 | Chờ trả lời |
| QNA-15 | `複製=〇` hoạt động khi nào? Có copy attachment, thông tin người duyệt, dữ liệu định danh hay reset theo người tạo mới không? | Sao chép dữ liệu sai hoặc nhạy cảm | Cao | BR53:BR80 | Chờ trả lời |
| QNA-16 | Có bản mockup hoặc ảnh màn hình có thể xem được để xác nhận layout, label, popup, modal và khác biệt với bảng item không? | Chưa thể rà soát inconsistency hình/ô | Trung bình | PNG nhúng tại C53 | Chờ trả lời |
| QNA-17 | Có tài liệu phê duyệt/trạng thái, phân quyền, ticket liên quan hoặc phiên bản phát hành áp dụng cho form này không? | Không xác định scope workflow | Trung bình | C10, thiếu metadata | Chờ trả lời |
| QNA-18 | Khi field bắt buộc rỗng hoặc nhập vượt giới hạn, thời điểm chặn và nội dung lỗi hiển thị là gì? | Không thể viết expected result âm tính | Cao | BP/BT53:80, BU25 | Chờ trả lời |
| QNA-19 | Vì đây là app mới chưa có hệ thống hiện hành: 各種承認者マスタ, 業態マスタ, ユーザー一覧 và danh sách công ty/cửa hàng đã có sẵn dữ liệu/API chưa, hay cần xây mới song song? | Không ước lượng được test data và điều kiện tiên quyết môi trường test | Cao | Bối cảnh "app mới" do user cung cấp | Chờ trả lời |

### 7.2. Rủi ro kiểm thử

| Mã | Rủi ro | Mô tả | Giảm thiểu |
|---|---|---|---|
| RISK-01 | Test theo template thay vì spec | Tên/maxlength ví dụ trong template khác tài liệu đích | Dùng bảng 4.2 làm nguồn; chốt QNA-01 trước khi lập TC |
| RISK-02 | Thiếu nhánh theo quyền/trạng thái | Comment và 社長室 có dấu △ nhưng không có điều kiện | Xin ma trận role/state từ BA trước khi phân nhánh |
| RISK-03 | Dữ liệu master sai/lỗi | Form phụ thuộc nhiều master và user picker; vì là app mới nên không có hệ thống cũ để đối chiếu hành vi mặc định | Chốt ánh xạ, điều kiện lọc và dữ liệu kiểm thử; xác nhận master/API đã sẵn sàng trước khi test (QNA-19) |
| RISK-04 | Không thấy lỗi trong modal/submit | AC chỉ nói mở modal, không mô tả hoàn tất | Chốt validation, kết quả lưu và xử lý lỗi |
| RISK-05 | Sai boundary/file | `桁数` cho file/ngày chưa rõ đơn vị | Xác nhận định nghĩa từng kiểu trước khi viết boundary |
| RISK-06 | Chưa kiểm chứng ảnh layout | PNG nhúng chưa đọc trực quan được | Yêu cầu ảnh xuất riêng hoặc mở trực tiếp trong Excel để đối chiếu |

## 8. Ma trận trạng thái và chuyển tiếp (chưa đầy đủ)

| Trạng thái đầu | Tác động | Kết quả có căn cứ | Trạng thái sau |
|---|---|---|---|
| Mở màn hình | 初期表示 | Lấy dữ liệu từ 各種承認者マスタ | Không nêu |
| Form đang hiển thị | Chọn 業態欄 | Mở popup 業態マスタ | Không nêu |
| Form đang hiển thị | Chọn 承認者/開発者 | Mở ユーザー一覧 | Không nêu |
| Form đang hiển thị | 申請 | Mở modal 申請 | Không nêu; **không suy ra đã gửi** |

## 9. Tóm tắt acceptance criteria (checklist phân tích, không phải TC)

| Mục | Nội dung cần xác nhận | Tình trạng |
|---|---|---|
| AC-01 | 初期表示 đọc 各種承認者マスタ; cần làm rõ field đích | [ ] |
| AC-02 | 業態欄選択 mở 業態マスタ; cần làm rõ field trên form | [ ] |
| AC-03 | 承認者選択 mở ユーザー一覧; cần làm rõ ánh xạ | [ ] |
| AC-04 | 開発者選択 mở ユーザー一覧; cần làm rõ ánh xạ | [ ] |
| AC-05 | 申請 mở modal; cần làm rõ submit hoàn tất | [ ] |
| Field | Mapping `必須/編集/複製/型/桁数` của 28 field; cần xác nhận `△` và `ー` | [ ] |

## 10. Khuyến nghị chuẩn bị kiểm thử

| Ưu tiên | Trọng tâm cần chốt trước khi viết testcase input |
|---|---|
| 1 | Xác nhận phiên bản spec so với các ví dụ đã điền trong template |
| 2 | Chốt ý nghĩa 〇/×/△/ー theo từng cột |
| 3 | Xác nhận 28 field trên màn hình và field 業態 bị thiếu trong bảng |
| 4 | Thu thập điều kiện nhánh 社長室 và quyền comment |
| 5 | Xác định nguồn/default cho field chỉ đọc và master |
| 6 | Xác nhận picker người dùng và quan hệ công ty/cửa hàng |
| 7 | Chốt radio options và các phụ thuộc |
| 8 | Chốt đơn vị/giới hạn `桁数` cho text, ngày và file |
| 9 | Chốt validation, nội dung lỗi và các bước modal 申請 |
| 10 | Đối chiếu ảnh layout đọc được và tài liệu workflow/quyền bổ sung |