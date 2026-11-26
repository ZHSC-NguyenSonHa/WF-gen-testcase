**Phân tích requirement: PDF一覧画面 (màn hình danh sách PDF)**

Nguồn duy nhất: 1 ảnh chụp màn hình do user cung cấp (không kèm spec document, không có ticket liên quan). Toàn bộ nội dung dưới đây chỉ ghi nhận những gì quan sát trực tiếp được trên ảnh; mọi hành vi không nhìn thấy (filter mở rộng, phân quyền, validation) được đưa vào QnA thay vì suy đoán. Tài liệu phục vụ chuẩn bị testcase theo `templates/testcase/testcase_template_Listall.xlsx`, **không phải testcase**.

## Spec tổng quan

### Thông tin tài liệu

| Thuộc tính | Giá trị | Căn cứ |
|---|---|---|
| Loại màn hình | 一覧画面 (List screen) | Tiêu đề "一覧画面" trên ảnh |
| Tên màn hình | PDF一覧画面 | Breadcrumb "PDF一覧"; heading "PDF一覧画面" |
| Nguồn phân tích | 1 ảnh chụp màn hình, không kèm tài liệu spec hay ticket | Toàn bộ nội dung user cung cấp |
| Ticket ID/Type/Priority/Sprint | Không có | Không xuất hiện trong ảnh |
| Related tickets/mockup khác | Không có | Chỉ có 1 ảnh duy nhất |

### Mô tả layout

| Khu vực | Nội dung quan sát được |
|---|---|
| Breadcrumb | "PDF一覧" |
| Tiêu đề trang | "一覧画面" |
| Tab điều hướng | 2 tab: "PDF一覧" (đang active) và "アプリケーション画面" |
| Tiêu đề khối nội dung | "PDF一覧画面" (bold) |
| Vùng công cụ phía trên bảng | Chỉ có 1 control: "詳細検索" (Tìm kiếm chi tiết) kèm icon kính lúp và chevron thu/mở — **không thấy nút tạo mới, CSV xuất, hay xóa như các màn hình danh sách khác (vd 申請書一覧)** |
| Bảng dữ liệu | 10 cột, 10 dòng dữ liệu hiển thị trong ảnh |
| Phân trang | "< 1 ページ目 >" — đang ở trang 1 |
| Checkbox chọn dòng | Không có cột checkbox trong ảnh (khác với mẫu 申請書一覧 ở template, vốn có checkbox để CSV xuất/xóa hàng loạt) |

### Danh sách cột dữ liệu (header bảng)

| # | Tên cột | Loại nội dung quan sát được | Ghi chú |
|---|---|---|---|
| 1 | 編集 | Icon hành động (bút chì) trên từng dòng | Chưa rõ hành vi khi bấm |
| 2 | 参照 | Icon hành động (xem/tham chiếu) trên từng dòng | Chưa rõ hành vi khi bấm |
| 3 | 件名 | Text, vd "1. 改装の件（1,000千円以下）" | Giống nhau ở cả 10 dòng trong ảnh |
| 4 | アプリ名 | Text, 2 giá trị luân phiên: "出店稟議書", "建設 新店 発注 稟議書" | Có thể là tên loại ứng dụng nguồn sinh PDF |
| 5 | 対象件名 | Text dài, bị cắt bởi "…", vd "TKE202510-003 SK堺原山台（サ…", "[8991][DATA OLD] HATCHIU_20…" | Độ dài thực tế và nội dung đầy đủ chưa xác định |
| 6 | 申請者ID | Text, luôn là "テスト0008" trong toàn bộ 10 dòng | Có thể do dữ liệu test hoặc do scope hiển thị chỉ record của user đăng nhập |
| 7 | No | Mã, bị cắt, 2 dạng tiền tố quan sát được: "SK202607-0…", "TAG202604…" | Tiền tố có thể tương ứng loại アプリ名 (SK ~ 出店稟議書, TAG ~ 建設新店発注稟議書) — chưa xác nhận |
| 8 | 状態 | Text, 5 giá trị quan sát được: "PDF作成待ち", "PDF添付済", "PDFエラー", "PDFリカバリ待ち", "PDF添付待ち" | Chưa rõ đây có phải toàn bộ enum trạng thái hay chỉ là tập con xuất hiện trong dữ liệu mẫu |
| 9 | 最終更新日 | Ngày giờ, định dạng "yyyy-mm-dd hh:mm", vd "2026-07-21 18:59" | Có vẻ đang sort giảm dần theo cột này (trừ dòng cuối "2026-07-20 18:59" lặp lại ngày của dòng 2) |
| 10 | 最終更新者 | Text, luôn là "テスト0008" | Cùng giá trị với 申請者ID ở mọi dòng trong ảnh |

### Business rules quan sát được

| # | Quan sát | Diễn giải |
|---|---|---|
| BR-01 | Dòng dữ liệu luân phiên đều đặn giữa アプリ名="出店稟議書" (state: 作成待ち→添付済→作成待ち→エラー→リカバリ待ち theo thứ tự lùi ngày) và アプリ名="建設 新店 発注 稟議書" (state: 添付済→添付済→エラー→エラー→添付待ち) | Dữ liệu mẫu có thể chỉ phục vụ demo, không chắc phản ánh đúng phân phối trạng thái thực tế |
| BR-02 | Thứ tự dòng theo 最終更新日 giảm dần, trừ dòng cuối cùng (2026-07-20) phá vỡ thứ tự giảm dần tuyệt đối | Cần xác nhận lại sort mặc định có đúng là giảm dần theo 最終更新日 hay dòng cuối là ngoại lệ do dữ liệu test |
| BR-03 | Mỗi dòng có đúng 2 action icon (編集, 参照), không có action nào khác (xóa, tải xuống…) hiển thị trực tiếp trên dòng | Khác với mẫu 申請書一覧 (có checkbox + nút CSV xuất/xóa ở đầu bảng) |

### Dependencies/Pattern tham chiếu từ màn hình tương tự

| Nguồn tham chiếu | Vai trò |
|---|---|
| Template `testcase_template_Listall.xlsx` (sheet 申請書一覧, màn hình khác) | Cho thấy pattern: tab theo role (một role thường thấy thêm tab "アプリケーション画面"), nút 検索 mở rộng filter, nút CSV出力/削除 kèm checkbox, pattern thông báo "表示するデータがありません" khi rỗng | Dùng làm tham chiếu cấu trúc test, **không phải bằng chứng cho PDF一覧** vì là màn hình khác |
| Spec/ticket liên quan đến PDF一覧 | Không có | Không được cung cấp |

## QnA

### Danh sách câu hỏi & điểm mơ hồ cần xác nhận

Tất cả câu hỏi dưới đây ở trạng thái **Chờ trả lời**.

| # | Mã | Câu hỏi | Nguy cơ nếu bỏ ngỏ | Mức độ | Căn cứ | Trạng thái |
|---|---|---|---|---|---|---|
| 1 | QNA-01 | Tab "アプリケーション画面" hiển thị nội dung gì, và có hiển thị cho mọi role hay chỉ role đặc quyền (giống pattern ở 申請書一覧)? | Thiếu test coverage cho tab thứ 2 | 🔴 High | Ảnh: 2 tab ở đầu trang | Chờ trả lời |
| 2 | QNA-02 | Phía trên bảng có nút tạo mới / CSV xuất / xóa nào khác ngoài "詳細検索" không, hay ảnh đã cắt mất phần đó? | Bỏ sót toàn bộ nhóm testcase cho action cấp màn hình | 🔴 High | Ảnh chỉ thấy 1 control "詳細検索" | Chờ trả lời |
| 3 | QNA-03 | Khi mở "詳細検索" thì có những field filter nào, field nào bắt buộc/tùy chọn, và filter có thể kết hợp (combine) với nhau không? | Không viết được testcase filter đơn/tổ hợp theo quy tắc bắt buộc của skill list-all | 🔴 High | Ảnh chỉ thấy control ở trạng thái đóng | Chờ trả lời |
| 4 | QNA-04 | Màn hình có hỗ trợ chọn nhiều dòng (checkbox) để thao tác hàng loạt không, hay mỗi dòng chỉ thao tác đơn lẻ qua 編集/参照? | Sai giả định khi thiết kế test cho thao tác hàng loạt | 🟡 Medium | Ảnh không có cột checkbox | Chờ trả lời |
| 5 | QNA-05 | Nút "編集" dẫn tới màn hình/hành vi gì (sửa metadata, re-upload PDF…)? Có bị disable theo một số giá trị 状態 cụ thể không (vd khi đang "PDF作成待ち" chưa có file)? | Không xác định được enable/disable action theo trạng thái — vi phạm quy tắc bắt buộc #5 của skill list-all | 🔴 High | Icon 編集 trên từng dòng | Chờ trả lời |
| 6 | QNA-06 | Nút "参照" dẫn tới đâu (xem preview PDF, trang chi tiết…)? Có bị disable khi chưa có file PDF đính kèm không? | Không viết được expected result cho action 参照 theo từng trạng thái | 🔴 High | Icon 参照 trên từng dòng | Chờ trả lời |
| 7 | QNA-07 | Danh sách đầy đủ các giá trị có thể có của cột "状態" là gì? 5 giá trị quan sát được (PDF作成待ち/PDF添付済/PDFエラー/PDFリカバリ待ち/PDF添付待ち) có phải toàn bộ enum không? | Thiếu case cho các trạng thái không xuất hiện trong ảnh | 🔴 High | Cột 状態 trong bảng | Chờ trả lời |
| 8 | QNA-08 | "対象件名" bị cắt bởi dấu "…" trên UI — có giới hạn hiển thị bao nhiêu ký tự, và có tooltip/hover để xem full text không? | Không viết được test hiển thị đầy đủ/truncate cho cột này | 🟡 Medium | Giá trị cột 対象件名 đều kết thúc bằng "…" | Chờ trả lời |
| 9 | QNA-09 | Sort mặc định của danh sách là theo cột nào, tăng hay giảm dần? Dòng cuối (2026-07-20) phá vỡ thứ tự giảm dần tuyệt đối theo 最終更新日 — đây có phải ngoại lệ do dữ liệu test không? | Viết sai testcase cho sort mặc định | 🟡 Medium | Thứ tự 10 dòng 最終更新日 trong ảnh | Chờ trả lời |
| 10 | QNA-10 | Page size (số dòng/trang) là bao nhiêu? Màn hình tương tự (申請書一覧) dùng 100 dòng/trang — có áp dụng tương tự cho PDF一覧 không? | Không viết được testcase paging chính xác | 🟡 Medium | Phân trang chỉ hiện "1 ページ目", không đủ dữ liệu suy ra page size | Chờ trả lời |
| 11 | QNA-11 | "申請者ID" và "最終更新者" đều là "テスト0008" ở toàn bộ 10 dòng — đây là do dữ liệu test cùng 1 user, hay là business rule chỉ hiển thị record của chính user đang đăng nhập? | Sai giả định phạm vi hiển thị dữ liệu (toàn hệ thống vs cá nhân) | 🔴 High | Giá trị giống nhau ở mọi dòng trong ảnh | Chờ trả lời |
| 12 | QNA-12 | Tiền tố mã ở cột "No" ("SK" cho 出店稟議書, "TAG" cho 建設新店発注稟議書) có phải quy tắc cố định theo アプリ名 không, hay chỉ trùng hợp trong dữ liệu mẫu? | Viết sai điều kiện liên kết giữa 2 cột khi thiết kế test data | 🟢 Low | Quan sát từ 10 dòng dữ liệu | Chờ trả lời |
| 13 | QNA-13 | "PDFエラー" và "PDFリカバリ待ち" khác nhau thế nào về hành vi cho phép thao tác (có nút retry riêng, hay dùng chung 編集/参照)? Nguyên nhân phổ biến gây "PDFエラー" là gì? | Thiếu case xử lý lỗi/phục hồi PDF — rủi ro cao vì đây là 2 trạng thái lỗi/bất thường | 🔴 High | Giá trị 状態 "PDFエラー", "PDFリカバリ待ち" trong ảnh | Chờ trả lời |
| 14 | QNA-14 | Danh sách này hiển thị toàn bộ PDF trong hệ thống hay chỉ PDF liên quan tới user/phòng ban đang đăng nhập? Có phân quyền xem theo role không? | Sai phạm vi test data và test account cho test scope | 🟡 Medium | Không có thông tin phân quyền trong ảnh | Chờ trả lời |
