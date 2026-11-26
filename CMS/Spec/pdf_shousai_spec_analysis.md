**Phân tích requirement: PDF詳細画面 (màn hình chi tiết 1 bản ghi PDF)**

Nguồn duy nhất: 1 ảnh chụp màn hình do user cung cấp (không kèm spec document, không có ticket liên quan). Màn hình này được suy đoán là đích đến của action 参照 và/hoặc 編集 từ màn hình PDF一覧 đã phân tích trước đó (`pdf_ichiran_spec_analysis.md`) — No record ("HS202607-031") và cấu trúc field tương đồng xác nhận cùng 1 hệ thống. Toàn bộ nội dung dưới đây chỉ ghi nhận những gì quan sát trực tiếp được trên ảnh; mọi hành vi không nhìn thấy được đưa vào QnA thay vì suy đoán. Tài liệu phục vụ chuẩn bị testcase theo `templates/testcase/testcase_template_Detailscreen.xlsx`, **không phải testcase**.

## Spec tổng quan

### Thông tin tài liệu

| Thuộc tính | Giá trị | Căn cứ |
|---|---|---|
| Loại màn hình | 詳細画面 (Detail screen — view/edit 1 bản ghi) | Layout dạng bảng label/value, có nút 更新/削除 |
| Tên màn hình | Chưa có tiêu đề cố định rõ ràng, chỉ thấy "【アプリ名】" | Heading trên ảnh |
| Nguồn phân tích | 1 ảnh chụp màn hình, không kèm tài liệu spec hay ticket | Toàn bộ nội dung user cung cấp |
| Liên hệ với phân tích trước | Cùng hệ thống với `pdf_ichiran_spec_analysis.md` (PDF一覧画面) — No. và 状態 enum trùng khớp | So sánh dữ liệu 2 ảnh |
| Ticket ID/Type/Priority/Sprint | Không có | Không xuất hiện trong ảnh |

### Mô tả layout

| Khu vực | Nội dung quan sát được |
|---|---|
| Phần trên cùng ảnh | "< 1 ページ目 >" (pagination của màn hình danh sách) — gợi ý màn hình chi tiết có thể mở dưới dạng panel/mở rộng ngay trên cùng trang với danh sách, không chắc là trang riêng biệt |
| Nút điều hướng | "←" (quay lại) ở góc trái |
| Nút hành động | "更新" (Update, nút xanh) và "削除" (Delete, nút đỏ/viền đỏ) ở góc phải |
| Tiêu đề | "【アプリ名】" — hiển thị literal text trong ngoặc vuông, chưa rõ là placeholder hay tên cố định |
| Bảng thông tin | Dạng label (cột trái, nền tối) / value (cột phải), 14 dòng field |
| Field dạng text thuần (read-only, không thấy control nhập) | 件名(マスタ), PDFファイル (trạng thái cảnh báo), 申請者ID (hiển thị tên), 文書URL (link), 種別, 対象件名, 対象リソース, スキーマID, No., ID(マスタ), PDFファイル有無, エラーメール送信 |
| Field dạng radio button (có vẻ editable) | リカバリフラグ (無/有), 状態 (5 lựa chọn) |

### Danh sách field quan sát được

| # | Tên field | Giá trị trong ảnh | Loại hiển thị | Ghi chú |
|---|---|---|---|---|
| 1 | 件名(マスタ) | "SK202512-035 【発注】[QA] TEST DOC HATCHIU FULL NODE SK 長房（No.2398）" | Text | Nhãn có "(マスタ)" nhưng không thấy control chọn — chỉ hiển thị text |
| 2 | PDFファイル | ⚠ "ファイルがアップロードされていません" | Text cảnh báo | Không thấy nút upload trên màn hình |
| 3 | 申請者ID | 👤 "松下 翔大" | Text + icon | Nhãn ghi "ID" nhưng giá trị hiển thị là họ tên |
| 4 | 文書URL | "https://ariel-ap1.zensho.co.jp/aqua/b441d760-1adc-4dd6-a859-0ab2d582339c/view" | Hyperlink | GUID trong URL trùng với 対象リソース |
| 5 | 種別 | "【発注】" | Text | Cùng kiểu ngoặc vuông như tiêu đề |
| 6 | 対象件名 | "HS-J　札幌菊水元町[新店]　発注の件　【北海道】" | Text | |
| 7 | 対象リソース | "b441d760-1adc-4dd6-a859-0ab2d582339c" | Text (GUID) | Trùng GUID trong 文書URL và nằm trong ID(マスタ) |
| 8 | スキーマID | "LYLUGH2D53" | Text | Là phần đầu của ID(マスタ) |
| 9 | No. | "HS202607-031" | Text | Tiền tố "HS" — khác 2 tiền tố "SK"/"TAG" đã thấy ở màn hình danh sách, xác nhận có nhiều loại ứng dụng hơn |
| 10 | ID(マスタ) | "LYLUGH2D53b441d760-1adc-4dd6-a859-0ab2d582339c" | Text | = スキーマID + 対象リソース nối trực tiếp, không dấu phân cách (xác nhận được từ dữ liệu) |
| 11 | PDFファイル有無 | "2026年07月14日 11:00" | Text (ngày giờ) | **Inconsistency**: nhãn field nghĩa là "có/không có file PDF" nhưng giá trị hiển thị là ngày giờ, không phải有/無 |
| 12 | リカバリフラグ | Radio: 無 / ● 有 | Radio button | Đang chọn "有" |
| 13 | エラーメール送信 | "未送信" | Text | |
| 14 | 状態 | Radio: PDF作成待ち / ● PDF添付待ち / PDF添付済 / PDFリカバリ待ち / PDFエラー | Radio button | Thứ tự 5 giá trị **khớp hoàn toàn** với enum đã xác nhận ở QNA-07 của `pdf_ichiran_spec_analysis.md` — củng cố thêm, không còn là giả định |

### Business rules quan sát được

| # | Quan sát | Diễn giải |
|---|---|---|
| BR-01 | ID(マスタ) = スキーマID + 対象リソース (nối trực tiếp, không dấu phân cách) | Xác nhận bằng phép nối chuỗi khớp chính xác dữ liệu trong ảnh |
| BR-02 | 文書URL chứa cùng GUID với 対象リソース theo pattern `https://ariel-ap1.zensho.co.jp/aqua/{対象リソース}/view` | Suy ra từ so khớp GUID |
| BR-03 | Thứ tự enum 状態 (PDF作成待ち→PDF添付待ち→PDF添付済→PDFリカバリ待ち→PDFエラー) khớp với thứ tự đã xác nhận ở màn hình danh sách | Cross-check giữa 2 màn hình, củng cố độ tin cậy |
| BR-04 | Chỉ 2 field (リカバリフラグ, 状態) hiển thị dạng control có thể thao tác (radio); toàn bộ field còn lại chỉ hiển thị text thuần | Quan sát trực tiếp từ ảnh — chưa chắc chắn 100% vì không thao tác thử được trên ảnh tĩnh |
| BR-05 | リカバリフラグ="有" trong khi 状態="PDF添付待ち" (không phải "PDFエラー" hay "PDFリカバリ待ち") | Có thể gợi ý record này từng lỗi và đã được đánh dấu để xử lý lại, nhưng mối liên hệ giữa 2 field chưa được xác nhận |

### Dependencies/Pattern tham chiếu

| Nguồn tham chiếu | Vai trò |
|---|---|
| `pdf_ichiran_spec_analysis.md` + testcase `【CMS】PDF一覧画面.xlsx` (đã tạo trước) | Cùng hệ thống PDF; dùng để đối chiếu No., 状態 enum, hành vi 編集/参照 (QNA-05, QNA-06 của tài liệu đó) |
| Template `testcase_template_Detailscreen.xlsx` | Yêu cầu tách testcase theo cụm Display/Edit/State/Permission, có case read-only, update thành công/thất bại, đồng bộ List↔Detail |

## QnA

### Danh sách câu hỏi & điểm mơ hồ cần xác nhận

Tất cả câu hỏi dưới đây ở trạng thái **Chờ trả lời**.

| # | Mã | Câu hỏi | Nguy cơ nếu bỏ ngỏ | Mức độ | Căn cứ | Trạng thái |
|---|---|---|---|---|---|---|
| 1 | QNA-01 | Màn hình trong ảnh là đích đến của 編集 hay 参照 (hay cả 2 cùng dẫn tới 1 màn hình)? Nếu 参照 cũng ra màn hình này thì user chỉ-xem có bị ẩn nút 更新/削除 và 2 radio button không? | Sai giả định về phân biệt 2 action trong testcase PDF一覧 đã tạo trước đó | 🔴 High | So sánh với QNA-05/QNA-06 đã trả lời ở `pdf_ichiran_spec_analysis.md` | Chờ trả lời |
| 2 | QNA-02 | "件名(マスタ)" có phải field chọn từ master (dropdown/picker) không, hay chỉ hiển thị read-only text lấy từ master? Ảnh không thấy control chọn nào | Sai giả định editable/read-only khi viết testcase Display vs Edit | 🔴 High | Nhãn field có "(マスタ)" nhưng hiển thị dạng text | Chờ trả lời |
| 3 | QNA-03 | "申請者ID" hiển thị tên người ("松下 翔大") thay vì mã ID — đây là field đã join tên từ ID, hay nhãn field bị đặt sai? | Viết sai expected result khi test hiển thị field này | 🟡 Medium | Nhãn ghi "ID" nhưng giá trị là họ tên | Chờ trả lời |
| 4 | QNA-04 | Khi "PDFファイル" chưa có file ("ファイルがアップロードされていません"), màn hình này có cho upload file trực tiếp không, hay việc gắn PDF chỉ do hệ thống tự động (background job) thực hiện? | Không biết có cần viết testcase upload thủ công ở màn hình chi tiết hay không | 🔴 High | Không thấy nút/control upload trong ảnh | Chờ trả lời |
| 5 | QNA-05 | "PDFファイル有無" hiển thị giá trị là ngày giờ ("2026年07月14日 11:00") thay vì 有/無 — đây có phải field bị gắn nhầm label (thực chất là 最終更新日), hay field này có ý nghĩa khác (thời điểm kiểm tra sự tồn tại file gần nhất)? | Viết sai hoàn toàn expected result cho field quan trọng này | 🔴 High | Giá trị không khớp ý nghĩa tên field | Chờ trả lời |
| 6 | QNA-06 | Màn hình danh sách có field "最終更新者" nhưng màn hình chi tiết này không thấy hiển thị lại — có bị thiếu, hay cố ý không hiển thị ở đây? | Thiếu coverage cho metadata audit theo yêu cầu bắt buộc của skill detail-screen | 🟡 Medium | Đối chiếu với cột 最終更新者 ở `pdf_ichiran_spec_analysis.md` | Chờ trả lời |
| 7 | QNA-07 | Xác nhận: chỉ 2 field "リカバリフラグ" và "状態" là editable trên màn hình này; toàn bộ field còn lại (件名, PDFファイル, 申請者ID, 文書URL, 種別, 対象件名, 対象リソース, スキーマID, No., ID(マスタ), エラーメール送信) đều read-only? | Sai phạm vi testcase Display vs Edit theo quy tắc bắt buộc #1 của skill detail-screen | 🔴 High | Chỉ 2 field hiển thị dạng radio control trong ảnh | Chờ trả lời |
| 8 | QNA-08 | Nút "更新" lưu thay đổi cho field nào — chỉ リカバリフラグ/状態, hay còn ảnh hưởng gián tiếp tới field khác (vd đổi 状態 có tự động reset リカバリフラグ không)? | Thiếu case cập nhật thành công/liên đới theo quy tắc bắt buộc #3 | 🔴 High | Không quan sát được hành vi submit từ ảnh tĩnh | Chờ trả lời |
| 9 | QNA-09 | Nút "削除" xóa những gì — chỉ bản ghi này khỏi danh sách, hay xóa luôn file PDF/văn bản liên quan? Có dialog xác nhận trước khi xóa không (tương tự pattern "...を削除してもよろしいでしょうか。" đã thấy ở màn hình khác)? | Thiếu case xác nhận xóa, có thể viết sai mức độ phá hủy dữ liệu | 🔴 High | Không quan sát được hành vi khi bấm nút từ ảnh tĩnh | Chờ trả lời |
| 10 | QNA-10 | Có mối liên hệ ràng buộc nào giữa "リカバリフラグ" và "状態" không (vd chỉ được chọn リカバリフラグ=有 khi 状態=PDFリカバリ待ち hoặc PDFエラー)? Ảnh hiện tại có リカバリフラグ=有 nhưng 状態=PDF添付待ち | Thiếu/sai case validate ràng buộc giữa 2 field khi test Edit | 🟡 Medium | Quan sát giá trị 2 field trong ảnh không "khớp" theo suy luận thông thường | Chờ trả lời |
| 11 | QNA-11 | "エラーメール送信" có editable không hay chỉ read-only? Giá trị đổi thành "送信済" khi nào (tự động khi 状態 chuyển sang PDFエラー, hay do hành động thủ công)? | Thiếu case cho luồng gửi email lỗi | 🟡 Medium | Chỉ thấy giá trị tĩnh "未送信", không rõ cơ chế đổi | Chờ trả lời |
| 12 | QNA-12 | Nút "←" quay lại có giữ nguyên trạng thái filter/trang đang xem ở màn hình danh sách không? | Thiếu case kiểm tra điều hướng giữ context | 🟢 Low | Không quan sát được hành vi điều hướng từ ảnh tĩnh | Chờ trả lời |
| 13 | QNA-13 | Tiêu đề "【アプリ名】" là placeholder sẽ thay bằng tên ứng dụng thực tế (vd "【出店稟議書】"), hay là literal text cố định? | Viết sai expected result cho tiêu đề màn hình | 🟡 Medium | Chuỗi "アプリ名" trùng tên field ở màn hình danh sách, khả năng cao là placeholder | Chờ trả lời |
| 14 | QNA-14 | "< 1 ページ目 >" xuất hiện phía trên ảnh — màn hình chi tiết có phải mở dạng panel/mở rộng ngay trên cùng trang danh sách (không chuyển URL/route), hay đây chỉ là ảnh chụp ghép 2 phần riêng biệt? | Ảnh hưởng cách viết testcase điều hướng (navigate vs expand-in-place) | 🟡 Medium | Vị trí pagination control nằm ngay sát phía trên bảng chi tiết | Chờ trả lời |
| 15 | QNA-15 | Có phân quyền xem/sửa/xóa theo role không (vd chỉ 1 số role mới thấy nút 削除, hoặc chỉ thấy được bản ghi của chính mình)? | Thiếu case Permission theo yêu cầu bắt buộc của skill detail-screen (cụm Permission) | 🔴 High | Không có thông tin phân quyền trong ảnh; đã có tiền lệ câu hỏi tương tự ở `pdf_ichiran_spec_analysis.md` (QNA-14, trả lời: hiển thị toàn bộ hệ thống) | Chờ trả lời |
| 16 | QNA-16 | Khi bấm "更新" mà không thay đổi giá trị nào (giữ nguyên リカバリフラグ/状態 hiện tại), hệ thống có coi là thao tác thành công không, có thông báo gì không? | Thiếu case cập nhật "no-op" | 🟢 Low | Không quan sát được hành vi submit từ ảnh tĩnh | Chờ trả lời |
| 17 | QNA-17 | Sau khi 更新 thành công, màn hình danh sách PDF一覧 có đồng bộ lại ngay giá trị 最終更新日/最終更新者/状態 không (không cần F5 lại trang)? | Thiếu case đồng bộ List↔Detail theo quy tắc bắt buộc #5 của skill detail-screen | 🔴 High | Không quan sát được hành vi đồng bộ từ ảnh tĩnh | Chờ trả lời |
