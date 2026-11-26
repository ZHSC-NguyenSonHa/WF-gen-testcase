# Matrix Testcase — zscan_QRScan

**Tính năng:** zscan_QRScan — Màn hình quét QR (tích điểm + vé đợi số thứ tự)  
**Tạo bởi:** QuynhNT  
**Ngày tạo:** 2026-07-03  
**Release:** 7.4.0  
**Devices:** iPhone XS, iPhone 11, Pixel 7a, Galaxy A30  

---

## Summary

| FN ID | Mô tả | Số TC | Loại |
|-------|-------|-------|------|
| FN1 | Xác nhận trạng thái quyền camera và luồng cấp quyền | 7 | N / A |
| FN2 | Xác nhận xử lý khi quét QR tích điểm | 15 | N / A |
| FN3 | Xác nhận xử lý khi quét QR vé đợi (số thứ tự) | 14 | N / A |
| **Tổng** | | **36** | |

---

## GUI Checklist

*(Từ sheet `zscan_GUI` — kiểm tra layout / label thủ công)*

| No | Màn hình | Sub Test Object | Input (Điều kiện) | Expected Result |
|----|----------|-----------------|-------------------|-----------------|
| 1 | Màn hình xin quyền camera | Layout tổng thể và nút Cài đặt | Mở app, chưa cấp quyền camera → Bấm icon quét QR từ Home | 1. Hiển thị màn hình in-app thông báo cần quyền camera. 2. Có icon minh họa camera. 3. Có text giải thích lý do cần quyền. 4. Có nút「設定する」nổi bật. 5. Không crash, không màn hình trắng |
| 2 | | Nội dung text và encoding | Đang hiển thị màn hình in-app xin quyền camera | 1. Text đúng ngôn ngữ cài đặt thiết bị. 2. Không lỗi encoding, không ký tự ???/chữ vuông. 3. Nút「設定する」đúng label, không bị cắt |
| 3 | Màn hình quét chế độ Tích điểm | Tiêu đề và hướng dẫn | Đã cấp quyền camera. Mở quét từ menu thành viên / Tab Hạng | 1. Tiêu đề:「会員証」2. Hướng dẫn:「レシートのQRコードを読み取ってください」3. KHÔNG hiện「QR読み取り」|
| 4 | | Khung ngắm QR và camera preview | Đang ở màn hình quét chế độ tích điểm, camera đã khởi động | 1. Khung ngắm hình vuông ở trung tâm. 2. Camera phân tích liên tục (preview chạy). 3. Không đen/treo. 4. Không nhãn「QR読み取り」|
| 5 | Màn hình quét chế độ Số thứ tự | Tiêu đề và hướng dẫn | Đã cấp quyền camera. Mở quét từ Home | 1. Tiêu đề:「QR読み取り」2. Hướng dẫn:「受付札、レシートのQRコードを読み取ってください」3. KHÔNG hiện「会員証」|
| 6 | | Khung ngắm QR và camera preview | Đang ở màn hình quét chế độ số thứ tự | 1. Khung ngắm vuông ở trung tâm. 2. Camera phân tích liên tục. 3. Không đen/treo. 4. Không tiêu đề「会員証」|

---

## Function Matrix

### ◆FN1 — Xác nhận trạng thái quyền camera và luồng cấp quyền

| | 条件/動作/期待結果 | Value | TC-1 | TC-2 | TC-3 | TC-4 | TC-5 | TC-6 | TC-7 |
|---|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **条件** | Trạng thái quyền camera | Chưa từng được hỏi | 〇 | 〇 | | | | | |
| | | Đã từ chối 1 lần (có thể hỏi lại) | | | 〇 | 〇 | | | |
| | | Từ chối vĩnh viễn (không hỏi lại) | | | | | 〇 | 〇 | |
| | | Đã cấp, bị thu hồi khi app ở nền | | | | | | | 〇 |
| | Hành động người dùng | Cho phép (popup OS / dialog lần 2) | 〇 | | 〇 | | | | |
| | | Từ chối (popup OS / dialog lần 2) | | 〇 | | 〇 | | | |
| | | Bấm 設定する → cấp thủ công trong Settings → quay lại | | | | | 〇 | | |
| | | Bấm 設定する → không cấp → quay lại | | | | | | 〇 | |
| | | (Quyền bị thu hồi khi app ở nền — không có hành động) | | | | | | | 〇 |
| **動作** | Tap icon quét QR từ Home để mở màn hình quét | | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 |
| **期待結果** | Popup OS xin quyền camera hiển thị.<br>iOS: 「発券用紙、端末のQRコード読取りのため、カメラへのアクセスを許可してください。」<br>AOS: Dialog xin quyền của OS.<br>→ Sau khi Cho phép: Camera khởi động, khung ngắm QR hiển thị, sẵn sàng quét | | ● | | | | | | |
| | Popup OS → Từ chối.<br>Màn hình in-app cần quyền camera hiển thị:<br>・Có icon minh họa camera<br>・Có text giải thích lý do cần quyền<br>・Nút「設定する」nổi bật<br>・Camera KHÔNG khởi động, không crash, không màn hình đen | | | ● | | | | | |
| | Màn hình in-app → Bấm「設定する」.<br>Dialog xin quyền lần 2 hiển thị (KHÔNG mở Settings) → Cho phép.<br>Camera khởi động, khung ngắm QR hiển thị | | | | ● | | | | |
| | Màn hình in-app → Bấm「設定する」→ Dialog lần 2 → Từ chối lần 2.<br>Dialog đóng. Màn hình vẫn ở trạng thái in-app cần quyền.<br>Nút「設定する」vẫn hiện. Camera KHÔNG khởi động | | | | | ● | | | |
| | Màn hình in-app (từ chối vĩnh viễn) → Bấm「設定する」.<br>Mở Cài đặt hệ thống (Settings) — KHÔNG phải dialog.<br>Cấp quyền thủ công → Quay lại app.<br>App tự re-check quyền (onResume / viewDidAppear).<br>Camera khởi động, khung ngắm QR hiển thị | | | | | | ● | | |
| | Màn hình in-app → Bấm「設定する」→ Settings → Không cấp → Quay lại.<br>App re-check: chưa cấp → màn hình in-app vẫn hiển thị.<br>Không tự mở camera, không crash | | | | | | | ● | |
| | App đang foreground với màn hình quét QR mở.<br>Quyền camera bị thu hồi qua Settings khi ở nền → Quay lại app.<br>Màn hình quét tự đóng / dừng.<br>Không crash, không ANR / freeze.<br>App hoạt động bình thường ở màn hình khác | | | | | | | | ● |
| **TCタイプ** | N: Normal / A: Abnormal | | N | A | N | A | N | A | A |
| **試験結果** | iPhone XS — First time | | | | | | | | |
| | iPhone XS — Last time | | | | | | | | |
| | iPhone 11 — First time | | | | | | | | |
| | iPhone 11 — Last time | | | | | | | | |
| | Pixel 7a — First time | | | | | | | | |
| | Pixel 7a — Last time | | | | | | | | |
| | Galaxy A30 — First time | | | | | | | | |
| | Galaxy A30 — Last time | | | | | | | | |
| **Comment** | Bug ID / Ghi chú | | | | | | | | |

---

### ◆FN2 — Xác nhận xử lý khi quét QR tích điểm

> Chế độ quét: Tích điểm (mở từ menu thành viên / Tab Hạng). Quyền camera đã được cấp.

| | 条件/動作/期待結果 | Value | TC-1 | TC-2 | TC-3 | TC-4 | TC-5 | TC-6 | TC-7 | TC-8 | TC-9 | TC-10 | TC-11 | TC-12 | TC-13 | TC-14 | TC-15 |
|---|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **条件** | Trạng thái đăng nhập | Chưa đăng nhập | 〇 | 〇 | 〇 | | | | | | | | | | | | |
| | | Đã đăng nhập | | | | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 |
| | Trạng thái QR code | Rỗng (null) | | | | 〇 | | | | | | | | | | | |
| | | Không có prefix RJP (≠ format `RJP...`) | | | | | 〇 | | | | | | | | | | |
| | | RJP ≤ 71 ký tự (hợp lệ, boundary max) | 〇 | 〇 | 〇 | | | 〇 | | | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 |
| | | RJP > 71 ký tự (vượt giới hạn) | | | | | | | 〇 | | | | | | | | |
| | | URL redirect có nhiều chuỗi RJP (có `amount=RJP...`) | | | | | | | | 〇 | | | | | | | |
| | Kết nối mạng | Kết nối | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | | | 〇 | 〇 | 〇 |
| | | Mất kết nối | | | | | | | | | | | 〇 | 〇 | | | |
| | Server response | Không gọi API | 〇 | 〇 | 〇 | 〇 | 〇 | | 〇 | | | | 〇 | 〇 | | | |
| | | 200 + data (thành công) | | | | | | 〇 | | 〇 | 〇 | | | | | | |
| | | 200 + empty data | | | | | | | | | | 〇 | | | | | |
| | | 503 (server tạm thời lỗi) | | | | | | | | | | | | | 〇 | | |
| | | 500 / -108 (lỗi nghiêm trọng) | | | | | | | | | | | | | | 〇 | |
| | | 401 (session hết hạn) | | | | | | | | | | | | | | | 〇 |
| | Điểm vào màn hình quét | Home (icon QR trên Home) | 〇 | 〇 | | 〇 | 〇 | 〇 | 〇 | 〇 | | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 |
| | | Tab Hạng (menu thành viên) | | | 〇 | | | | | | 〇 | | | | | | |
| **動作** | ①Quét QR code | | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | ① | ① | 〇 | 〇 | 〇 |
| | ②Bấm「閉じる」(popup Lỗi 5 — chưa đăng nhập) | | ② | | | | | | | | | | | | | | |
| | ②Bấm「ログイン」(popup Lỗi 5, từ Home) | | | ② | | | | | | | | | | | | | |
| | ②Bấm「ログイン」(popup Lỗi 5, từ Tab Hạng) | | | | ② | | | | | | | | | | | | |
| | ②Bật mạng → Bấm「リトライ」(sau Lỗi 7) | | | | | | | | | | | | ② | | | | |
| | ②Bấm「キャンセル」(sau popup Lỗi 7) | | | | | | | | | | | | | ② | | | |
| **期待結果** | Popup Lỗi 5: 「この機能はログイン後に使用できるようになります。」<br>Có 2 nút:「閉じる」và「ログイン」<br>→ Bấm「閉じる」: popup đóng, camera tiếp tục phân tích.<br>KHÔNG gọi API | | ● | | | | | | | | | | | | | | |
| | Popup Lỗi 5 → Bấm「ログイン」.<br>Màn hình đăng nhập mở, màn hình quét đóng.<br>Sau đăng nhập thành công (vào từ Home): tải lại Home, có thể hiện dialog đăng nhập thành công | | | ● | | | | | | | | | | | | | |
| | Popup Lỗi 5 → Bấm「ログイン」.<br>Màn hình đăng nhập mở, màn hình quét đóng.<br>Sau đăng nhập thành công (vào từ Tab Hạng): chỉ làm mới điểm/hạng, KHÔNG hiển thị thông báo | | | | ● | | | | | | | | | | | | |
| | Popup Lỗi 1: 「久兵衛屋で発行したQRコードを読取ってください。」<br>Nút OK → popup đóng, camera restart sau 1 giây.<br>KHÔNG gọi API | | | | | ● | | | | | | | | | | | |
| | Popup Lỗi 1: 「久兵衛屋で発行したQRコードを読取ってください。」<br>Nút OK. Camera restart sau 1 giây. KHÔNG gọi API | | | | | | ● | | | | | | | | | | |
| | Không hiển thị popup lỗi validate.<br>Thiết bị beep + rung khi nhận diện QR. Camera dừng phân tích.<br>Gọi API tích điểm thành công.<br>Màn hình quét đóng, chuyển sang kết quả tích điểm (điểm/hạng mới) | | | | | | | ● | | | | | | | | | |
| | Popup Lỗi 2: 「久兵衛屋で発行されたレシートのみ有効です。」<br>Nút OK. Camera restart sau 1 giây. KHÔNG gọi API | | | | | | | | ● | | | | | | | | |
| | Hệ thống tách chuỗi theo「amount=」, lấy phần sau.<br>Phần sau = RJP hợp lệ → gọi API tích điểm thành công.<br>Màn hình quét đóng, kết quả như TC-6.<br>KHÔNG báo Lỗi 1 do nhầm nhiều chuỗi RJP | | | | | | | | | ● | | | | | | | |
| | API thành công. Màn hình quét đóng.<br>Tab Hạng tự làm mới thông tin điểm/hạng (silent update).<br>KHÔNG hiển thị banner, dialog hay thông báo nào. Không crash | | | | | | | | | | ● | | | | | | |
| | API 200 + empty data.<br>Popup lỗi chung「エラー」hiển thị.<br>Có nút「リトライ」và「キャンセル」.<br>Màn hình quét chưa đóng. Kết quả không được xử lý | | | | | | | | | | | ● | | | | | |
| | ❶ Mất mạng → Thiết bị beep + rung. Camera dừng phân tích.<br>Hệ thống thử gọi API → thất bại.<br>Popup Lỗi 7:「端末がインターネットに接続されていません。接続状況を確認してください。」<br>Có nút「リトライ」và「キャンセル」<br>❷ Bật mạng → Bấm「リトライ」: gửi lại request. API 200+data → thành công.<br>Popup đóng, màn hình quét đóng, chuyển kết quả tích điểm | | | | | | | | | | | | ❶❷ | | | | |
| | Đang popup Lỗi 7 → Bấm「キャンセル」.<br>Popup đóng. Camera tiếp tục phân tích, sẵn sàng quét lại.<br>Màn hình quét vẫn mở | | | | | | | | | | | | | ● | | | |
| | API 503.<br>Popup Lỗi 9:「サーバー側で一時的に不具合が発生しています。しばらく時間をおいてから再度お試しください。」<br>Có nút「リトライ」và「キャンセル」 | | | | | | | | | | | | | | ● | | |
| | API 500 / -108.<br>Popup Lỗi 8: hiển thị thông báo lỗi từ server (nếu có) hoặc mặc định.<br>Có nút Retry / Hủy. KHÔNG tự điều hướng sang màn hình khác | | | | | | | | | | | | | | | ● | |
| | API 401 (session hết hạn).<br>Popup Lỗi 10:「エラー」(thông báo lỗi chung hoặc nội dung server gửi kèm).<br>Chỉ có nút「OK」— KHÔNG có nút「ログイン」.<br>Bấm OK: popup đóng, camera tiếp tục. KHÔNG tự nav màn hình đăng nhập.<br>KHÁC Lỗi 5: Lỗi 5=chưa đăng nhập (có nút Login); Lỗi 10=session hết hạn (chỉ OK) | | | | | | | | | | | | | | | | ● |
| **TCタイプ** | N: Normal / A: Abnormal | | A | A | A | A | A | N | A | N | N | A | A | A | A | A | A |
| **試験結果** | iPhone XS — First time | | | | | | | | | | | | | | | | |
| | iPhone XS — Last time | | | | | | | | | | | | | | | | |
| | iPhone 11 — First time | | | | | | | | | | | | | | | | |
| | iPhone 11 — Last time | | | | | | | | | | | | | | | | |
| | Pixel 7a — First time | | | | | | | | | | | | | | | | |
| | Pixel 7a — Last time | | | | | | | | | | | | | | | | |
| | Galaxy A30 — First time | | | | | | | | | | | | | | | | |
| | Galaxy A30 — Last time | | | | | | | | | | | | | | | | |
| **Comment** | Bug ID / Ghi chú | | | | | | | | | | | | | | | | |

---

### ◆FN3 — Xác nhận xử lý khi quét QR vé đợi (số thứ tự)

> Mở từ Home. Quyền camera đã được cấp.

| | 条件/動作/期待結果 | Value | TC-1 | TC-2 | TC-3 | TC-4 | TC-5 | TC-6 | TC-7 | TC-8 | TC-9 | TC-10 | TC-11 | TC-12 | TC-13 | TC-14 |
|---|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **条件** | enable_waiting_number_flag | = 0 (tính năng bị tắt) | 〇 | | | | | | | | | | | | | |
| | | = 1 (tính năng bật) | | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 |
| | Loại / Trạng thái QR quét | Bất kỳ (mọi QR đều Lỗi 4 khi flag=0) | 〇 | | | | | | | | | | | | | |
| | | URL không có param `qr=` | | 〇 | | | | | | | | | | | | |
| | | `qr=` ≤ 20 ký tự (< boundary min 21) | | | 〇 | | | | | | | | | | | |
| | | `qr=` 21–39 ký tự (giải mã thất bại) | | | | 〇 | | | | | | | | | | |
| | | `qr=` = 40 ký tự (định dạng cũ) | | | | | 〇 | | | | | 〇 | 〇 | 〇 | 〇 | |
| | | `qr=` = 41 ký tự (định dạng cũ) | | | | | | 〇 | | | | | | | | |
| | | `qr=` ZNV + AES decode = 40/41 ký tự (định dạng mới) | | | | | | | 〇 | | | | | | | |
| | | `qr=` > 41 ký tự, KHÔNG có ZNV | | | | | | | | 〇 | | | | | | |
| | | `qr=` ZNV + AES decode ≠ 40/41 ký tự | | | | | | | | | 〇 | | | | | |
| | | QR tích điểm RJP ≤ 71 ký tự (cross-mode) | | | | | | | | | | | | | | 〇 |
| | Mã cửa hàng trong QR | Khớp danh sách cấu hình | | | | | 〇 | 〇 | 〇 | | | | | 〇 | 〇 | 〇 |
| | | Không khớp danh sách | | | | | | | | | | 〇 | | | | |
| | Danh sách cấu hình mã cửa hàng | Có dữ liệu | | | | | 〇 | 〇 | 〇 | | | 〇 | | 〇 | 〇 | 〇 |
| | | Rỗng (empty list) | | | | | | | | | | | 〇 | | | |
| | Trạng thái vé đang có | Không có vé | | | | | 〇 | 〇 | 〇 | | | | | | | 〇 |
| | | Có vé còn hiệu lực | | | | | | | | | | | | 〇 | | |
| | | Có vé đã hết hạn (expired) | | | | | | | | | | | | | 〇 | |
| | Trạng thái đăng nhập | Chưa đăng nhập | | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | |
| | | Đã đăng nhập | | | | | | | | | | | | | | 〇 |
| **動作** | Quét QR code | | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 |
| **期待結果** | Popup Lỗi 4:「本QRコードの読取りはサポートされていません。カメラアプリから読取ください。」<br>Nút OK. Camera restart sau 1 giây.<br>Lỗi 4 hiển thị TRƯỚC cả Lỗi 1 (kể cả QR rỗng cũng hiển thị Lỗi 4 khi flag=0) | | ● | | | | | | | | | | | | | |
| | Popup Lỗi 3:「久兵衛屋で発行した受付札を読取ってください。」<br>Nút OK. Camera restart sau 1 giây | | | ● | | | | | | | | | | | | |
| | Popup Lỗi 3a:「久兵衛屋で発行した受付札を読取ってください。」(chuỗi sau qr= quá ngắn < 21 ký tự)<br>Nút OK. Camera restart sau 1 giây | | | | ● | | | | | | | | | | | |
| | Popup Lỗi 3b:「久兵衛屋で発行した受付札を読取ってください。」(giải mã thất bại — 21–39 ký tự)<br>Nút OK. Camera restart sau 1 giây | | | | | ● | | | | | | | | | | |
| | Hệ thống extract brand code vị trí 14–21. Mã cửa hàng khớp.<br>Không có vé đang có → hợp lệ.<br>Thiết bị beep + rung khi nhận diện QR. Màn hình quét đóng.<br>Trả chuỗi QR về màn hình Home để xử lý đặt số.<br>KHÔNG cần đăng nhập. KHÔNG popup lỗi | | | | | | ● | | | | | | | | | |
| | Hệ thống extract brand code vị trí 15–22 (định dạng 41 ký tự). Mã khớp.<br>Không có vé → hợp lệ. Thiết bị beep + rung.<br>Màn hình quét đóng, trả QR về Home. KHÔNG cần đăng nhập | | | | | | | ● | | | | | | | | |
| | Hệ thống nhận diện prefix ZNV → giải mã AES.<br>Kết quả giải mã = 40/41 ký tự → validate brand code → khớp.<br>Không có vé → hợp lệ. Beep + rung.<br>Màn hình quét đóng, trả QR về Home | | | | | | | | ● | | | | | | | |
| | Popup Lỗi 3b:「久兵衛屋で発行した受付札を読取ってください。」(chuỗi > 41, không có ZNV — giải mã thất bại)<br>Nút OK. Camera restart sau 1 giây | | | | | | | | | ● | | | | | | |
| | Popup Lỗi 3b:「久兵衛屋で発行した受付札を読取ってください。」(ZNV + AES decode ≠ 40/41 ký tự)<br>Nút OK. Camera restart sau 1 giây | | | | | | | | | | ● | | | | | |
| | Popup Lỗi 3b:「久兵衛屋で発行した受付札を読取ってください。」(mã cửa hàng không khớp danh sách)<br>Nút OK. Camera restart sau 1 giây | | | | | | | | | | | ● | | | | |
| | Popup Lỗi 3b (danh sách cấu hình rỗng → không có mã nào khớp được).<br>KHÔNG crash hay exception khi list rỗng.<br>Nút OK. Camera restart sau 1 giây | | | | | | | | | | | | ● | | | |
| | Popup Lỗi 6:「"待ち組数"はアプリホーム画面でご確認いただけます。」<br>Nút OK. Camera restart sau 1 giây.<br>KHÔNG đặt số mới | | | | | | | | | | | | | ● | | |
| | Popup Lỗi 6 vẫn hiển thị (vé đã hết hạn vẫn bị coi là "đang có vé").<br>KHÔNG thể đặt số mới dù vé expired.<br>Nút OK. Camera restart sau 1 giây | | | | | | | | | | | | | | ● | |
| | KHÔNG hiển thị popup lỗi「quét phiếu chờ」.<br>Hệ thống tự nhận diện QR là loại tích điểm → xử lý tích điểm.<br>Gọi API tích điểm (đã đăng nhập → thành công).<br>Đóng màn hình quét, trả kết quả tích điểm về Home | | | | | | | | | | | | | | | ● |
| **TCタイプ** | N: Normal / A: Abnormal | | A | A | A | A | N | N | N | A | A | A | A | A | A | N |
| **試験結果** | iPhone XS — First time | | | | | | | | | | | | | | | |
| | iPhone XS — Last time | | | | | | | | | | | | | | | |
| | iPhone 11 — First time | | | | | | | | | | | | | | | |
| | iPhone 11 — Last time | | | | | | | | | | | | | | | |
| | Pixel 7a — First time | | | | | | | | | | | | | | | |
| | Pixel 7a — Last time | | | | | | | | | | | | | | | |
| | Galaxy A30 — First time | | | | | | | | | | | | | | | |
| | Galaxy A30 — Last time | | | | | | | | | | | | | | | |
| **Comment** | Bug ID / Ghi chú | | | | | | | | | | | | | | | |

---

*File được tạo tự động từ `【APP】zscan_QRScan.xlsx` — sheet `zscan_LOGIC` (41 TCs) + `zscan_GUI` (6 TCs)*
