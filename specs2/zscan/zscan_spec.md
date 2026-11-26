# zscan — Tài liệu Luồng Xử Lý Nghiệp Vụ v3

> Phiên bản: v3 (bổ sung Dependency Map cross-module)  
> Dành cho: QA, Nghiệp vụ, Auto Test  
> Nguồn: Source code thực tế (`zscan`, `app/MainActivity.kt`, `zrank`, `zhome`, `zevent`)  
> Cập nhật: 2026-07-02

---

## Tổng quan

Module zscan cung cấp màn hình quét mã QR bằng camera, hỗ trợ **hai chế độ**:

| Chế độ | Người dùng vào từ đâu | Tiêu đề | Mục đích |
|--------|----------------------|---------|---------|
| **Lấy số thứ tự** | Màn hình chính (Home) | **「QR読み取り」** *(Đọc QR)* | Quét QR phiếu chờ để lấy số thứ tự — **hoặc** quét QR hóa đơn để tích điểm (tự động nhận diện theo nội dung mã, không giới hạn chỉ 1 loại) |
| **Tích điểm** | Menu thành viên / tab Hạng | **「会員証」** *(Thẻ thành viên)* | Quét QR hóa đơn để tích điểm / nâng hạng — **chỉ** xử lý tích điểm, không hỗ trợ lấy số thứ tự |

Chế độ được xác định **tự động** dựa trên tham số truyền vào — người dùng không cần chọn.

> ⚠️ **Lưu ý dễ hiểu nhầm:** "Lấy số thứ tự" không phải là chế độ tách biệt hoàn toàn với "Tích điểm" — vào từ Home vẫn quét được QR tích điểm bình thường (hệ thống tự nhận diện QR là loại nào). Ngược lại, vào từ Menu thành viên/tab Hạng thì CHỈ xử lý được tích điểm, dù có quét nhầm QR phiếu chờ cũng không nhận (xem [Edge cases — Lấy số thứ tự](#edge-cases--lấy-số-thứ-tự)).

---

## Dependency Map

> Nguồn: `codegraph query ScanQRActivity`, `codegraph affected zscan/`, đọc source `app/MainActivity.kt`, `zrank/RankUpFragment.kt`, `zhome/ZLibHomeFragment.kt`, `zevent/`.

### Entry points — nơi tạo Intent mở `ScanQRActivity`

| # | Module → File | Trigger | `IS_HOME_SCAN` |
|---|---------------|---------|-----------------|
| 1 | `zhome/ZLibHomeFragment.kt` (tap `clScanQRCode`) → gửi `AppEvent.NavigateScanQr(isAutoNavigation=false)` → `app/MainActivity.kt:gotoScanQr()` mới thực sự mở Activity | Tap icon quét QR trên Home | `true` |
| 1b | Deep link / push notification (target `SCAN_QR` trong `zevent/NavigationToHelper.kt`) → cùng `AppEvent.NavigateScanQr(isAutoNavigation=true)` → `MainActivity.gotoScanQr()` | Auto-navigate từ notification | `true` |
| 2 | `zrank/AnimationFragment.kt` / `AnimationScrollFragment.kt` (tap thẻ **会員証**) → `RankUpFragment.kt:onClickScanQRCode()` mở Activity **trực tiếp** (không qua `MainActivity`) | Tap thẻ thành viên trong tab Rank | Không set → mặc định `false` |

> **zscan không có caller nào khác** ngoài 2 điểm trên (`codegraph affected zscan/` không phát hiện thêm module gọi vào). Cả hai entry point dùng chung 1 `ScanQRActivity` — sự khác biệt hành vi hoàn toàn do giá trị `IS_HOME_SCAN` và launcher nhận kết quả khác nhau (bên dưới), không phải do 2 activity riêng biệt.

### Result consumers — khác nhau theo entry point

| Entry point | Consumer (launcher nhận `setResult`) | Xử lý |
|-------------|----------------------------------------|-------|
| 1 & 1b (Home) | `app/MainActivity.kt:scanQRActivityResultLauncher` | `RESULT_OK` + có `WAITING_ORDER_NUMBER` → `sharedViewModel.sendWaitingOrderEvent()` → **`zhome/ZLibHomeFragment`** nhận (hiện banner số thứ tự đang chờ)<br>`RESULT_OK` + `SCAN_QR_RANK_UP` → `navToRank()` + `sharedViewModel.sendLibEvent(RankUpLibEvent.SaveReceiptEvent(...))` → **`zrank/RankUpFragment`** nhận<br>`AuthConstant.FINISH_SCAN_AFTER_LOGIN` → `updateAfterLoginSuccess()` (reload Home, có thể hiện dialog đăng nhập thành công)<br>`AuthConstant.GO_TO_SURVEY` → `navToSurveyAfterLogin()`<br>⚠️ Trước khi xử lý `RESULT_OK`, `MainActivity` check `checkConnection()` — **nếu mất mạng đúng lúc này** → chỉ hiện dialog "không có kết nối", **không xử lý kết quả scan** |
| 2 (Rank tab) | `zrank/RankUpFragment.kt:scanQRActivityResultLauncher` (launcher riêng của Fragment, không đi qua `MainActivity`) | `RESULT_OK` → đọc trực tiếp extras (`message`, `newRankInfo`, `fieldName`) → `rankUpViewModel.handleOnSavedReceipt()`<br>**Mọi result khác** (kể cả `FINISH_SCAN_AFTER_LOGIN`, `GO_TO_SURVEY`, `RESULT_CANCELED`) → rơi vào nhánh `else` → chỉ gọi `rankUpViewModel.getRankInfo(false)` (refresh rank info, **không** xử lý QR vừa quét, **không** hiện dialog nào) |

**Modules liên quan:** `zscan` (camera + validate), `app` (điều phối kết quả khi vào từ Home), `zhome` (entry point 1 + nhận vé chờ), `zrank` (entry point 2 + nhận kết quả tích điểm), `zevent` (kênh `AppEvent`/`SharedViewModel`/`RankUpLibEvent` truyền sự kiện xuyên module), `zlogin` (màn hình login khi cần), `zcommon` (`Constants`, `AuthConstant` dùng chung để truyền qua Intent extras).

---

## User State Matrix

> Bảng này liệt kê **mọi tổ hợp trạng thái user × tính năng** để QA không bỏ sót case.

| Tính năng | Chưa đăng nhập | Đã đăng nhập | Ghi chú |
|-----------|:--------------:|:------------:|---------|
| Mở màn hình QR | ✅ Hoạt động | ✅ Hoạt động | Cả 2 mode đều mở được |
| Camera tự khởi động | ✅ | ✅ | — |
| Quét QR tích điểm | ⚠️ Popup đăng nhập | ✅ Gọi API | Popup: この機能はログイン後に使用できるようになります |
| Gọi API tích điểm | ❌ Không gọi | ✅ | Token chưa có → block ở client |
| Quét QR số thứ tự | ✅ Hoạt động | ✅ Hoạt động | Không cần đăng nhập |
| Lấy số thứ tự | ✅ | ✅ | API không cần auth |
| Xem vé chờ đang có | ✅ | ✅ | — |

**⚠️ Miss case phổ biến:** Quét QR tích điểm khi CHƯA đăng nhập — không gây crash, chỉ hiện popup. QA cần test riêng case này.

---

## Preconditions

### Chế độ Tích điểm

| Điều kiện | Bắt buộc? |
|-----------|----------|
| Mở từ menu thành viên | ✅ |
| Có kết nối mạng (để gọi API sau khi quét) | ✅ |
| Đã đăng nhập | Không bắt buộc (popup nhắc sau khi quét) |
| Quyền camera được cấp | ✅ (xin tại runtime nếu chưa có) |

### Chế độ Lấy số thứ tự

| Điều kiện | Bắt buộc? |
|-----------|----------|
| Mở từ màn hình Home (`IS_HOME_SCAN = true`) | ✅ |
| Tính năng được bật trong cấu hình backend | ✅ |
| Không đang có vé chờ còn hiệu lực | ✅ |
| Quyền camera được cấp | ✅ |

---

## Luồng 1 — Tích điểm (Rank-up)

### Happy path

1. Người dùng mở màn hình từ menu thành viên  
   → Tiêu đề: **「会員証」** *(Thẻ thành viên)*  
   → Hướng dẫn: **「レシートのQRコードを読み取ってください」** *(Quét QR trên hóa đơn)*  
   → 📷 `scan_mode_member_title.png`

2. Camera tự động khởi động, hiển thị khung ngắm QR ở trung tâm  
   → 📷 `scan_qr_scanning.png`

3. Người dùng đưa hóa đơn vào vùng khung ngắm  
   → Camera liên tục phân tích hình ảnh (không cần tap)

4. Hệ thống nhận diện QR → **phát tiếng beep + rung**  
   → Camera dừng phân tích ngay (tránh quét trùng)

5. Validate nội dung QR (xem bảng validate bên dưới)  
   → Kiểm tra đăng nhập: chưa → popup yêu cầu đăng nhập

6. Gọi API tích điểm  
   → Server xác nhận → trả thông tin điểm/hạng  
   → Màn hình tự đóng, chuyển về màn hình kết quả  
   → 📷 `scan_result_rankup_success.png`

### Validate QR tích điểm

| Điều kiện | Kết quả |
|-----------|---------|
| Chuỗi rỗng | Lỗi 1 — QR không hợp lệ |
| Không bắt đầu bằng `RJP` | Lỗi 1 — QR không hợp lệ |
| Bắt đầu `RJP`, độ dài ≤ 71 | **Hợp lệ** → tiếp tục |
| Bắt đầu `RJP`, độ dài > 71 | Lỗi 2 — hóa đơn không hợp lệ |

> **Edge case**: QR chứa nhiều chuỗi "RJP" (URL redirect) → hệ thống tách theo "amount=" để lấy phần sau.

### API response mapping

| HTTP Status | Body | Kết quả |
|-------------|------|---------|
| 200 | Có dữ liệu điểm | ✅ Thành công — đóng màn hình |
| 200 | Không có dữ liệu | Lỗi 8 — popup + Retry/Hủy |
| 401 | Bất kỳ | ⚠️ **Không tự động điều hướng login** — code xử lý `CODE_401` đang bị comment-out trong source, rơi vào nhánh mặc định → popup lỗi chung "エラー" (OK → camera restart), **trừ khi** body response có `messageContent` khác rỗng thì hiện message đó thay vì "エラー". Khác với case "chưa đăng nhập" ban đầu (Lỗi 5, có nút Login) |
| 500 / -108 | Bất kỳ | Lỗi 8 — thông báo từ server |
| 503 | Bất kỳ | Lỗi 9 — sự cố tạm thời |
| Network error | — | Lỗi 7 — không có mạng |

### Edge cases — Tích điểm

- **Chế độ im lặng**: beep không phát, rung vẫn hoạt động  
- **Đăng nhập từ popup**: sau khi đăng nhập thành công, màn hình trả về kết quả đặc biệt (không phải `RESULT_OK` thông thường) — **hành vi sau đó khác nhau theo entry point** (xem Dependency Map): vào từ Home → reload Home + có thể hiện dialog đăng nhập thành công; vào từ tab Rank → chỉ refresh rank info, không có thông báo, **không tự xử lý QR vừa quét** (user phải quét lại)  
- **Retry sau lỗi mạng**: chỉ gửi lại nếu QR bắt đầu bằng "RJP"; nếu không → hiển thị lỗi "QR không hợp lệ"  
- **Quyền camera bị thu hồi khi nền**: màn hình tự đóng khi mở lại, không crash  
- **Token hết hạn giữa chừng (401)**: khác với case chưa đăng nhập ban đầu, không có nút Login — xem bảng API mapping ở trên  
- **Mở scan khi đã logout (entry point 2 — tab Rank)**: `RankUpFragment.onClickScanQRCode()` có check `isOldUser()` nhưng hàm này **luôn trả `false`** (logic cũ đã bị bỏ, còn dead code) → camera vẫn mở bình thường bất kể trạng thái login; việc chặn chỉ xảy ra sau khi quét, ở bước gọi API (bearer token rỗng → Lỗi 5)

---

## Luồng 2 — Lấy số thứ tự (Waiting Number)

### Happy path

1. Người dùng mở màn hình từ Home  
   → Tiêu đề: **「QR読み取り」** *(Đọc QR)*  
   → Hướng dẫn: **「受付札、レシートのQRコードを読み取ってください」** *(Quét QR phiếu chờ hoặc hóa đơn)*  
   → 📷 `scan_waiting_home_enabled.png`

2. Camera khởi động → người dùng đưa phiếu chờ vào khung ngắm

3. Nhận diện QR → beep + rung

4. Kiểm tra loại QR: URL chứa domain dịch vụ số thứ tự  
   → Tách chuỗi mã (phần sau `qr=` trong URL)

5. Validate chuỗi mã (xem bảng validate bên dưới)

6. Kiểm tra không có vé chờ đang hoạt động  
   → Đóng màn hình, trả chuỗi QR về màn hình gọi  
   → 📷 `scan_waiting_result_success.png`

### Validate QR số thứ tự

| Độ dài chuỗi (sau `qr=`) | Loại | Xử lý |
|--------------------------|------|-------|
| < 21 ký tự | Quá ngắn | Lỗi 3a |
| 21–39 ký tự | Không xác định | Lỗi 3b |
| 40 ký tự | Cũ, không mã hóa | Extract brand code tại index 14–21 |
| 41 ký tự | Cũ, không mã hóa | Extract brand code tại index 15–22 |
| > 41, bắt đầu `ZNV` | Mới, AES | Giải mã → validate lại 40/41 ký tự |
| > 41, không có `ZNV` | Không hợp lệ | Lỗi 3b |

### Edge cases — Lấy số thứ tự

- **Quét nhầm QR tích điểm** trong chế độ này → hệ thống xử lý tích điểm luôn, không báo lỗi  
- **Vé chờ expired** vẫn bị coi là đang có vé → block đặt mới  
- **Cấu hình brand code rỗng** → mọi mã cửa hàng bị từ chối  
- **Tính năng bị tắt**: mọi QR đều bị từ chối (kể cả QR hợp lệ về format)  
- **QR rỗng khi tính năng số thứ tự đang tắt** (`isEnableWaitingNumber=false`, `isHomeScan=true`): hiển thị popup **Lỗi 4 (tính năng bị tắt)** thay vì popup lỗi QR chung (Lỗi 1) — khác với chế độ Tích điểm nơi QR rỗng luôn ra Lỗi 1  
- **Camera permission bị từ chối vĩnh viễn** (dù entry point là Home hay push notification): behavior giống hệt nhau cho mọi entry point vì check quyền nằm ở `ScanQRActivity`, không phụ thuộc caller — xem Luồng 3 bên dưới

---

## Luồng 3 — Quyền Camera

| Trạng thái | Giao diện | Hành động | Kết quả |
|------------|-----------|-----------|---------|
| Lần đầu, chưa cấp | Dialog hệ thống | Đồng ý | Camera khởi động |
| Đã từ chối, hỏi lại được | Màn hình in-app + nút 設定する | Tap nút → dialog lại | Cấp → OK; Từ chối → chờ |
| Từ chối vĩnh viễn | Màn hình in-app + nút 設定する | Tap nút → Cài đặt hệ thống | Tự cấp trong Settings |
| Quyền bị thu hồi khi nền | — | Mở lại màn hình | Tự đóng, không crash |
| Quay lại từ Settings | — | — | onResume kiểm tra lại quyền |

📷 Screenshots: `scan_camera_permission_dialog.png`, `scan_camera_permission_denied.png`, `scan_camera_permission_settings.png`

---

## Bảng lỗi đầy đủ

| # | Tình huống | Thông báo tiếng Nhật | Nghĩa tiếng Việt | Nút | Hành động |
|---|-----------|---------------------|-----------------|-----|-----------|
| 1 | QR không hợp lệ (chung) | **「久兵衛屋で発行したQRコードを読取ってください。」** | Quét mã QR do Kyubeeya phát hành. | OK | Camera restart |
| 2 | QR hóa đơn dài >71 ký tự | **「久兵衛屋で発行されたレシートのみ有効です。」** | Chỉ hóa đơn Kyubeeya mới hợp lệ. | OK | Camera restart |
| 3a | QR phiếu chờ quá ngắn | **「久兵衛屋で発行した受付札を読取ってください。」** | Quét phiếu chờ do Kyubeeya phát hành. | OK | Camera restart |
| 3b | Giải mã thất bại / mã cửa hàng sai | **「久兵衛屋で発行した受付札を読取ってください。」** | Quét phiếu chờ do Kyubeeya phát hành. | OK | Camera restart |
| 4 | Tính năng lấy số thứ tự bị tắt | **「本QRコードの読取りはサポートされていません。カメラアプリから読取ください。」** | Không hỗ trợ QR này. Dùng camera app. | OK | Camera restart |
| 5 | Chưa đăng nhập | **「この機能はログイン後に使用できるようになります。」** | Chỉ dùng được sau khi đăng nhập. | 閉じる / ログイン | Đóng → quét tiếp; Đăng nhập → màn hình login |
| 6 | Đang có vé chờ | **「"待ち組数"はアプリホーム画面でご確認いただけます。」** | Xem số nhóm chờ trên màn hình chính. | OK | Camera restart |
| 7 | Không có mạng | **「端末がインターネットに接続されていません。接続状況を確認してください。」** | Thiết bị không kết nối internet. | リトライ / キャンセル | Retry → gọi API lại |
| 8 | Lỗi server 500 / -108 | Thông báo từ server (nếu có) | — | リトライ / キャンセル | Retry / Hủy |
| 9 | Lỗi server 503 | **「サーバー側で一時的に不具合が発生しています。しばらく時間をおいてから再度お試しください。」** | Sự cố tạm thời, thử lại sau. | リトライ / キャンセル | Retry / Hủy |
| 10 | Lỗi 401 (token hết hạn giữa chừng) | **「エラー」** *(generic, do handler `CODE_401` bị comment-out; nếu server trả `messageContent` thì hiện message đó thay vì generic)* | Lỗi (generic). | OK | Camera restart — **không** điều hướng sang login |

---

## Screenshots — Danh sách đầy đủ (16 ảnh)

| File | Màn hình / Trạng thái |
|------|----------------------|
| `scan_home_initial.png` | Home — trước khi vào QR scan |
| `scan_mode_member_title.png` | Chế độ tích điểm — tiêu đề 会員証 |
| `scan_qr_scanning.png` | Camera đang hoạt động — khung ngắm |
| `scan_result_rankup_success.png` | Tích điểm thành công |
| `scan_result_rankup_error_invalid.png` | Popup lỗi QR không hợp lệ (Lỗi 1) |
| `scan_result_rankup_error_toolong.png` | Popup lỗi hóa đơn >71 ký tự (Lỗi 2) |
| `scan_result_rankup_error_auth.png` | Popup yêu cầu đăng nhập (Lỗi 5) |
| `scan_result_rankup_error_network.png` | Popup lỗi mạng Retry/Hủy (Lỗi 7) |
| `scan_result_rankup_error_server.png` | Popup lỗi server (Lỗi 8/9) |
| `scan_waiting_home_enabled.png` | Chế độ số thứ tự — tiêu đề QR読み取り |
| `scan_waiting_result_success.png` | Số thứ tự hợp lệ — trả kết quả |
| `scan_waiting_error_duplicate.png` | Popup lỗi đang có vé chờ (Lỗi 6) |
| `scan_waiting_error_feature_off.png` | Popup lỗi tính năng bị tắt (Lỗi 4) |
| `scan_camera_permission_dialog.png` | Dialog hệ thống xin quyền camera |
| `scan_camera_permission_denied.png` | Màn hình in-app sau khi từ chối |
| `scan_camera_permission_settings.png` | Cài đặt hệ thống — cấp quyền thủ công |

---

## Metadata

| Thông tin | Giá trị |
|-----------|---------|
| Module | zscan |
| Source path | `zscan/src/main/java/` (+ `app/MainActivity.kt`, `zrank`, `zhome`, `zevent` cho phần Dependency Map) |
| Spec version | v3 |
| Số luồng chính | 3 (Tích điểm, Số thứ tự, Camera perm) |
| Số entry point | 3 trigger thực tế, 2 hành vi (1 = tap icon Home, 1b = push/deep-link, cùng `IS_HOME_SCAN=true`; 2 = tab Rank, `IS_HOME_SCAN=false`) |
| Số loại lỗi | 10 |
| Số screenshots | 16 |
| Trạng thái ảnh | Placeholder (chờ Appium capture) |
| Framework auto test | Appium + JavaScript (WebdriverIO) |
