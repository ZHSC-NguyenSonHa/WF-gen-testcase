const path = require('path');
const { generateTestcase } = require('../testcase_builder');

const FUNCTION_NAME = 'Scan_Claim';
const CREATOR = 'QuynhNT';
const CREATE_DATE = '2026-07-03';
const RELEASE = '7.4.0';
const DEVICES = ['iOS', 'Android'];
const SHEET_PREFIX = 'Scan_Claim';

/* ==========================================================
   GUI — mỗi row = 1 màn hình / popup, ghi rõ text hiển thị
   ========================================================== */
const guiSection = {
  title: 'GUI — Màn hình Scan và popup (bám ảnh design đính kèm spec)',
  rows: [
    {
      to: 'Màn hình Scan từ Home',
      sub: 'Tiêu đề và hướng dẫn — ảnh scan_waiting_home_enabled.png',
      input: '[Tiền điều kiện] Mở Scan bằng cách bấm icon quét QR trên Home.\n1. Quan sát tiêu đề ở trên cùng màn hình.\n2. Quan sát text hướng dẫn phía trên khung ngắm.',
      output: '1. Tiêu đề hiển thị: QR読み取り\n2. Text hướng dẫn: 受付札、レシートのQRコードを読み取ってください\n3. KHÔNG hiển thị 会員証 (tiêu đề dành cho mode Rank).'
    },
    {
      to: 'Màn hình Scan từ Rank',
      sub: 'Tiêu đề và hướng dẫn — ảnh scan_mode_member_title.png',
      input: '[Tiền điều kiện] Mở Scan bằng cách bấm thẻ thành viên trong tab Hạng.\n1. Quan sát tiêu đề ở trên cùng màn hình.\n2. Quan sát text hướng dẫn.',
      output: '1. Tiêu đề hiển thị: 会員証\n2. Text hướng dẫn: レシートのQRコードを読み取ってください\n3. KHÔNG hiển thị QR読み取り (tiêu đề dành cho mode Home).'
    },
    {
      to: 'Camera Preview',
      sub: 'Khung ngắm QR và camera live — ảnh scan_qr_scanning.png',
      input: '[Tiền điều kiện] Camera đã được cấp quyền, màn Scan đang hiển thị.\n1. Quan sát vùng camera.\n2. Quan sát khung ngắm overlay.',
      output: '1. Camera hiển thị live preview, không đen màn hình.\n2. Khung ngắm QR hình chữ nhật nằm ở trung tâm màn hình.'
    },
    {
      to: 'Dialog xin quyền Camera',
      sub: 'Dialog hệ thống OS — ảnh scan_camera_permission_dialog.png',
      input: '[Tiền điều kiện] Lần đầu mở Scan, app chưa được cấp quyền camera.\n1. Quan sát dialog hệ thống hiển thị.',
      output: '1. Dialog OS hiển thị text: QRコードを読み取るためにカメラへのアクセスを許可してください。\n2. Có 2 lựa chọn: Cho phép và Từ chối.'
    },
    {
      to: 'Màn in-app — quyền bị từ chối',
      sub: 'Màn thay thế camera preview — ảnh scan_camera_permission_denied.png',
      input: '[Tiền điều kiện] Đã từ chối quyền camera ít nhất 1 lần.\n1. Mở Scan.\n2. Quan sát màn hình thay thế camera preview.',
      output: '1. Camera preview KHÔNG hiển thị.\n2. Màn in-app hiển thị thông báo yêu cầu cấp quyền camera.\n3. Có nút 設定する để mở Settings hệ thống.'
    },
    {
      to: 'Popup — Lỗi 5: chưa đăng nhập',
      sub: 'Nội dung popup và 2 nút thao tác — ảnh scan_result_rankup_error_auth.png',
      input: '[Tiền điều kiện] Chưa đăng nhập, quét QR claim hợp lệ RJP ≤ 71 ký tự.\n1. Quan sát popup xuất hiện.\n2. Đọc text và kiểm tra các nút.',
      output: '1. Popup hiển thị text: この機能はログイン後に使用できるようになります。\n2. Nút trái: 閉じる (Đóng)\n3. Nút phải: ログイン (Đăng nhập)'
    },
    {
      to: 'Popup — Lỗi 1: QR không hợp lệ',
      sub: 'Thông báo khi QR rỗng hoặc không phải Kyubeeya — ảnh scan_result_rankup_error_invalid.png',
      input: '[Tiền điều kiện] Quét QR không bắt đầu bằng RJP hoặc QR rỗng.\n1. Quan sát popup lỗi hiển thị.',
      output: '1. Popup hiển thị text: 久兵衛屋で発行したQRコードを読取ってください。\n2. Nút: OK\n3. Sau bấm OK, camera tự restart sau 1 giây.'
    },
    {
      to: 'Popup — Lỗi 2: QR hóa đơn dài >71 ký tự',
      sub: 'Thông báo khi QR prefix RJP nhưng quá dài — ảnh scan_result_rankup_error_toolong.png',
      input: '[Tiền điều kiện] Quét QR bắt đầu bằng RJP nhưng độ dài tổng > 71 ký tự.\n1. Quan sát popup lỗi hiển thị.',
      output: '1. Popup hiển thị text: 久兵衛屋で発行されたレシートのみ有効です。\n2. Nút: OK\n3. Sau bấm OK, camera tự restart sau 1 giây.'
    },
    {
      to: 'Popup — Lỗi 7: mất mạng',
      sub: 'Thông báo và 2 nút khi thiết bị không có mạng — ảnh scan_result_rankup_error_network.png',
      input: '[Tiền điều kiện] Thiết bị không có kết nối mạng khi gửi API claim.\n1. Quét QR claim hợp lệ.\n2. Quan sát popup lỗi mạng.',
      output: '1. Popup hiển thị text: 端末がインターネットに接続されていません。接続状況を確認してください。\n2. Nút 1: リトライ (Retry)\n3. Nút 2: キャンセル (Hủy)'
    },
    {
      to: 'Popup — Lỗi 8/9: lỗi server',
      sub: 'Thông báo server 500/503 — ảnh scan_result_rankup_error_server.png',
      input: '[Tiền điều kiện] API trả về 503 hoặc 500/-108.\n1. Quan sát popup lỗi server theo từng trường hợp.',
      output: '1. Lỗi 503: サーバー側で一時的に不具合が発生しています。しばらく時間をおいてから再度お試しください。\n2. Lỗi 500/-108: text từ server nếu có, hoặc text lỗi mặc định.\n3. Cả 2 có nút: リトライ (Retry) và キャンセル (Hủy).'
    },
    {
      to: 'Popup — Lỗi 6: đang có vé chờ',
      sub: 'Thông báo khi user đã giữ active ticket — ảnh scan_waiting_error_duplicate.png',
      input: '[Tiền điều kiện] User đang có vé chờ còn hiệu lực, quét QR waiting hợp lệ.\n1. Quan sát popup hiển thị.',
      output: '1. Popup hiển thị text: "待ち組数"はアプリホーム画面でご確認いただけます。\n2. Nút: OK\n3. Sau bấm OK, camera tự restart sau 1 giây.'
    },
    {
      to: 'Popup — Lỗi 4: tính năng waiting bị tắt',
      sub: 'Thông báo khi tính năng lấy số thứ tự OFF — ảnh scan_waiting_error_feature_off.png',
      input: '[Tiền điều kiện] Tính năng lấy số thứ tự bị tắt từ cấu hình server.\n1. Quét bất kỳ QR nào ở waiting mode.\n2. Quan sát popup.',
      output: '1. Popup hiển thị text: 本QRコードの読取りはサポートされていません。カメラアプリから読取ください。\n2. Nút: OK\n3. Sau bấm OK, camera tự restart sau 1 giây.\n4. KHÔNG hiển thị Lỗi 1 — Lỗi 4 được ưu tiên khi feature OFF.'
    }
  ]
};

/* ==========================================================
   LOGIC — chia quan điểm theo từng sơ đồ trong spec
   ========================================================== */
const logicSections = [
  /* ── 1. Điểm vào & Dependency Map ──────────────────────── */
  {
    title: '1. Điểm vào và điều hướng kết quả (Dependency Map)',
    rows: [
      {
        to: 'Entry từ Home',
        sub: 'IS_HOME_SCAN = true → kết quả dispatch về context Home',
        input: '[Tiền điều kiện] User ở Home, đã login, camera được cấp quyền.\n1. Bấm icon quét QR trên Home.\n2. Quét QR claim hợp lệ (RJP ≤ 71 ký tự).\n3. Quan sát màn hình sau khi claim thành công.',
        output: '1. Claim xử lý thành công.\n2. Màn scan đóng.\n3. Kết quả dispatch về MainActivity → chuyển sang màn kết quả điểm.'
      },
      {
        to: 'Entry từ Rank',
        sub: 'IS_HOME_SCAN = false → kết quả chỉ refresh Rank, không có dialog',
        input: '[Tiền điều kiện] User ở tab Rank, đã login.\n1. Bấm thẻ 会員証 để mở Scan.\n2. Quét QR claim hợp lệ.\n3. Quan sát tab Rank sau khi scan đóng.',
        output: '1. Claim xử lý thành công.\n2. Màn scan đóng và quay về tab Rank.\n3. Rank tự refresh điểm/hạng.\n4. KHÔNG hiện thêm dialog hay thông báo nào khác.'
      },
      {
        to: 'Entry từ Push/Deep link',
        sub: 'IS_HOME_SCAN = true → hành vi giống entry Home',
        input: '[Tiền điều kiện] App mở qua push notification hoặc deep link đến Scan.\n1. Quét QR claim hợp lệ.',
        output: '1. Claim xử lý thành công.\n2. Hành vi dispatch kết quả giống entry từ Home.'
      }
    ]
  },

  /* ── 2. Vòng đời quyền Camera ──────────────────────────── */
  {
    title: '2. Vòng đời quyền Camera',
    rows: [
      {
        to: 'Lần đầu cấp quyền',
        sub: 'Dialog OS → Cho phép → camera khởi động',
        input: '[Tiền điều kiện] App chưa từng được cấp quyền camera.\n1. Mở Scan.\n2. Dialog OS xuất hiện với text QRコードを読み取るためにカメラへのアクセスを許可してください。\n3. Chọn Cho phép.',
        output: '1. Camera khởi động ngay.\n2. Khung ngắm QR hiển thị sẵn sàng quét.'
      },
      {
        to: 'Từ chối 1 lần → cấp lại qua Settings',
        sub: 'Màn in-app → bấm 設定する → dialog lại → cấp → camera OK',
        input: '[Tiền điều kiện] Đã từ chối quyền camera 1 lần.\n1. Mở Scan — màn in-app hiển thị với nút 設定する.\n2. Bấm nút → dialog xin quyền lại.\n3. Chọn Cho phép → quay lại app.',
        output: '1. App kiểm tra lại quyền tại onResume.\n2. Camera khởi động bình thường.'
      },
      {
        to: 'Never ask again → mở System Settings',
        sub: 'Bấm 設定する → mở System Settings trực tiếp (không dialog)',
        input: '[Tiền điều kiện] User đã chọn Never ask again cho camera.\n1. Mở Scan — màn in-app hiển thị.\n2. Bấm 設定する.\n3. Quay lại app khi chưa cấp quyền.',
        output: '1. Hệ thống mở trực tiếp trang Settings (không qua dialog OS).\n2. App không crash, không treo.\n3. Quay lại app → màn in-app yêu cầu quyền vẫn hiển thị.'
      },
      {
        to: 'Thu hồi quyền khi app nền',
        sub: 'Revoke permission trong background → màn scan tự đóng an toàn',
        input: '[Tiền điều kiện] Camera đang hoạt động bình thường.\n1. Đưa app xuống nền.\n2. Vào OS Settings và thu hồi quyền camera.\n3. Quay lại app và mở Scan.',
        output: '1. Màn scan tự đóng ngay lập tức.\n2. App không crash.'
      }
    ]
  },

  /* ── 3. Nhận diện QR + validate claim (flowchart) ──────── */
  {
    title: '3. Nhận diện QR và validate claim (theo flowchart)',
    rows: [
      {
        to: 'Phản hồi khi nhận diện QR',
        sub: 'Thiết bị normal mode → beep + rung ngay lập tức',
        input: '[Tiền điều kiện] Camera đang scan, thiết bị ở chế độ bình thường (không silent).\n1. Đưa QR claim hợp lệ vào khung ngắm.\n2. Theo dõi phản hồi ngay khi camera nhận diện được mã.',
        output: '1. Thiết bị phát tiếng beep ngay lập tức.\n2. Thiết bị rung.\n3. Camera dừng phân tích để tránh quét lặp.'
      },
      {
        to: 'Phản hồi khi nhận diện QR',
        sub: 'Thiết bị silent mode → chỉ rung, không beep',
        input: '[Tiền điều kiện] Camera đang scan, thiết bị bật chế độ im lặng.\n1. Quét QR claim hợp lệ.',
        output: '1. Thiết bị rung (bắt buộc hoạt động).\n2. Không phát tiếng beep.'
      },
      {
        to: 'Validate chuỗi QR',
        sub: 'Nhánh flowchart: Chuỗi rỗng? = CÓ → Lỗi 1',
        input: '[Tiền điều kiện] Camera ở claim mode.\n1. Quét QR có payload rỗng (empty string).',
        output: '1. Popup Lỗi 1: 久兵衛屋で発行したQRコードを読取ってください。\n2. Nút OK.\n3. Camera restart sau 1 giây.'
      },
      {
        to: 'Validate chuỗi QR',
        sub: 'Nhánh flowchart: Bắt đầu RJP? = KHÔNG → Lỗi 1',
        input: '[Tiền điều kiện] Camera ở claim mode.\n1. Quét QR có nội dung bất kỳ không bắt đầu bằng chuỗi RJP.',
        output: '1. Popup Lỗi 1: 久兵衛屋で発行したQRコードを読取ってください。\n2. Nút OK.\n3. Camera restart sau 1 giây.'
      },
      {
        to: 'Validate chuỗi QR',
        sub: 'Nhánh flowchart: Độ dài ≤ 71? = KHÔNG → Lỗi 2',
        input: '[Tiền điều kiện] Camera ở claim mode.\n1. Quét QR có prefix RJP và tổng độ dài > 71 ký tự.',
        output: '1. Popup Lỗi 2: 久兵衛屋で発行されたレシートのみ有効です。\n2. Nút OK.\n3. Camera restart sau 1 giây.'
      },
      {
        to: 'Validate chuỗi QR',
        sub: 'Nhánh flowchart: RJP ≤ 71 hợp lệ → kiểm tra đăng nhập → gọi API',
        input: '[Tiền điều kiện] User đã đăng nhập, camera ở claim mode.\n1. Quét QR hợp lệ: bắt đầu RJP, độ dài ≤ 71 ký tự.',
        output: '1. Không hiển thị popup lỗi validate.\n2. Hệ thống kiểm tra đã đăng nhập → tiếp tục gọi API claim.'
      },
      {
        to: 'Validate chuỗi QR',
        sub: 'QR URL chứa nhiều RJP → parse theo quy tắc amount=',
        input: '[Tiền điều kiện] Camera ở claim mode.\n1. Quét QR format đặc biệt (URL redirect) chứa nhiều chuỗi RJP và có tham số amount=.',
        output: '1. Hệ thống tách chuỗi theo quy tắc amount= để lấy phần sau.\n2. Payload hợp lệ sau parse được dùng cho bước gọi API claim.'
      }
    ]
  },

  /* ── 4. Auth gate ── */
  {
    title: '4. Cổng xác thực đăng nhập',
    rows: [
      {
        to: 'Chưa đăng nhập — chọn Đóng',
        sub: 'Bấm 閉じる → popup đóng, camera scan lại',
        input: '[Tiền điều kiện] User chưa đăng nhập.\n1. Quét QR claim hợp lệ (RJP ≤ 71 ký tự).\n2. Popup Lỗi 5 hiển thị.\n3. Bấm 閉じる (Đóng).',
        output: '1. Popup đóng lại.\n2. Không gọi API claim.\n3. Camera tiếp tục scan lại.'
      },
      {
        to: 'Chưa đăng nhập — chọn Đăng nhập',
        sub: 'Bấm ログイン → đăng nhập thành công → tự xử lý tiếp QR cũ',
        input: '[Tiền điều kiện] User chưa đăng nhập.\n1. Quét QR claim hợp lệ.\n2. Popup Lỗi 5 hiển thị.\n3. Bấm ログイン → đăng nhập thành công.',
        output: '1. Màn scan đóng với result FINISH_SCAN_AFTER_LOGIN.\n2. Hệ thống tự xử lý tiếp QR vừa quét.\n3. User KHÔNG cần quét lại QR cũ.'
      },
      {
        to: 'Session hết hạn — API trả 401',
        sub: '401 giữa chừng → lỗi chung エラー, KHÔNG điều hướng login',
        input: '[Tiền điều kiện] User có token đã hết hạn.\n1. Quét QR claim hợp lệ.\n2. API trả về lỗi 401.',
        output: '1. Popup hiển thị: エラー (hoặc text từ server nếu có).\n2. Bấm OK → camera quét lại.\n3. KHÔNG tự mở màn đăng nhập (khác với Lỗi 5 chưa đăng nhập).'
      }
    ]
  },

  /* ── 5. API response handling ── */
  {
    title: '5. Xử lý phản hồi API claim',
    rows: [
      {
        to: 'API 200 + có dữ liệu',
        sub: 'Claim thành công → đóng scan, dispatch kết quả đúng context',
        input: '[Tiền điều kiện] User đã đăng nhập, QR claim hợp lệ.\n1. Quét QR.\n2. API trả về 200 kèm dữ liệu điểm/hạng.',
        output: '1. Claim thành công.\n2. Màn scan tự đóng.\n3. Entry Home → chuyển sang màn kết quả điểm; Entry Rank → refresh rank.'
      },
      {
        to: 'API 200 + không có dữ liệu',
        sub: 'HTTP 200 nhưng body rỗng → popup lỗi mặc định',
        input: '[Tiền điều kiện] User đã đăng nhập.\n1. Quét QR claim hợp lệ.\n2. API trả 200 nhưng body không có dữ liệu điểm.',
        output: '1. Popup lỗi mặc định エラー hiển thị.\n2. Có nút リトライ và キャンセル.'
      },
      {
        to: 'API 503',
        sub: 'Lỗi tạm thời phía server → popup Lỗi 9',
        input: '[Tiền điều kiện] User đã đăng nhập.\n1. Quét QR claim hợp lệ.\n2. API trả về 503.',
        output: '1. Popup Lỗi 9: サーバー側で一時的に不具合が発生しています。しばらく時間をおいてから再度お試しください。\n2. Có nút リトライ và キャンセル.'
      },
      {
        to: 'API 500 / -108',
        sub: 'Lỗi server → popup Lỗi 8 với message từ server',
        input: '[Tiền điều kiện] User đã đăng nhập.\n1. Quét QR claim hợp lệ.\n2. API trả về 500 hoặc -108.',
        output: '1. Popup Lỗi 8 với text từ server (nếu có) hoặc text mặc định.\n2. Có nút リトライ và キャンセル.'
      },
      {
        to: 'Mất mạng + quy tắc Retry',
        sub: 'Retry chỉ hợp lệ khi QR là RJP — không gọi API với QR sai',
        input: '[Tiền điều kiện] User đã đăng nhập.\n1. Tắt mạng trước khi quét.\n2. Quét QR hợp lệ RJP → popup Lỗi 7 → bấm リトライ.\n3. Thử bấm Retry khi QR không hợp lệ (không RJP).',
        output: '1. Popup Lỗi 7: 端末がインターネットに接続されていません。接続状況を確認してください。\n2. Retry với QR hợp lệ RJP → gửi lại API.\n3. Retry với QR không RJP → hiển thị Lỗi 1, KHÔNG gọi API claim.'
      }
    ]
  },

  /* ── 6. Validate QR waiting (flowchart) ── */
  {
    title: '6. Validate QR waiting (theo flowchart)',
    rows: [
      {
        to: 'Validate URL waiting',
        sub: 'Nhánh flowchart: Tìm thấy qr= trong URL? = KHÔNG → Lỗi 3',
        input: '[Tiền điều kiện] Waiting mode đang mở từ Home.\n1. Quét QR waiting nhưng URL không chứa tham số qr=.',
        output: '1. Popup Lỗi 3: 久兵衛屋で発行した受付札を読取ってください。\n2. Camera restart sau 1 giây.'
      },
      {
        to: 'Validate chuỗi sau qr=',
        sub: 'Nhánh flowchart: Độ dài ≥ 21? = KHÔNG → Lỗi QR quá ngắn',
        input: '[Tiền điều kiện] Waiting mode đang mở.\n1. Quét QR waiting với chuỗi sau qr= có độ dài < 21 ký tự.',
        output: '1. Popup Lỗi 3: 久兵衛屋で発行した受付札を読取ってください。\n2. Camera restart sau 1 giây.'
      },
      {
        to: 'Validate chuỗi sau qr=',
        sub: 'Nhánh flowchart: Độ dài 40 hoặc 41 (định dạng cũ) → extract brand code',
        input: '[Tiền điều kiện] Waiting mode, chưa có vé chờ active, brand code hợp lệ.\n1. Quét QR waiting với chuỗi sau qr= đúng 40 hoặc 41 ký tự (không mã hóa).',
        output: '1. Validate pass.\n2. Extract brand code tại vị trí 14–21 (40 ký tự) hoặc 15–22 (41 ký tự).\n3. Trả chuỗi QR về màn hình gọi để đặt số thứ tự.'
      },
      {
        to: 'Validate chuỗi sau qr=',
        sub: 'Nhánh flowchart: > 41 + bắt đầu ZNV → decode AES thành công',
        input: '[Tiền điều kiện] Waiting mode đang mở.\n1. Quét QR mã hóa mới: chuỗi > 41 ký tự, bắt đầu bằng ZNV.\n2. Decode AES thành công → kết quả sau decode là 40 hoặc 41 ký tự.',
        output: '1. Decode thành công.\n2. Xử lý tiếp như định dạng cũ 40/41 ký tự.\n3. Kết quả trả về màn hình gọi.'
      },
      {
        to: 'Validate chuỗi sau qr=',
        sub: 'Nhánh flowchart: > 41 + ZNV → decode AES thất bại → Lỗi',
        input: '[Tiền điều kiện] Waiting mode đang mở.\n1. Quét QR chuỗi > 41 ký tự bắt đầu ZNV nhưng dữ liệu bị hỏng → decode thất bại.',
        output: '1. Popup Lỗi 3b: 久兵衛屋で発行した受付札を読取ってください。\n2. Camera restart sau 1 giây.'
      },
      {
        to: 'Validate chuỗi sau qr=',
        sub: 'Nhánh flowchart: > 41 KHÔNG bắt đầu ZNV → Lỗi giải mã',
        input: '[Tiền điều kiện] Waiting mode đang mở.\n1. Quét QR chuỗi > 41 ký tự không có prefix ZNV.',
        output: '1. Popup Lỗi 3b: 久兵衛屋で発行した受付札を読取ってください。\n2. Camera restart sau 1 giây.'
      },
      {
        to: 'Validate brand code',
        sub: 'Nhánh flowchart: Mã cửa hàng trong config? = KHÔNG → Lỗi',
        input: '[Tiền điều kiện] Waiting mode, format QR hợp lệ.\n1. Quét QR waiting có brand code không tồn tại trong danh sách cấu hình server.',
        output: '1. Popup Lỗi 3b: 久兵衛屋で発行した受付札を読取ってください。\n2. Camera restart sau 1 giây.'
      },
      {
        to: 'Validate vé chờ',
        sub: 'Nhánh flowchart: Đang có vé chờ? = CÓ → Lỗi 6',
        input: '[Tiền điều kiện] User đang giữ vé chờ còn hiệu lực (kể cả vé expired).\n1. Quét QR waiting hợp lệ (format, brand code đều đúng).',
        output: '1. Popup Lỗi 6: "待ち組数"はアプリホーム画面でご確認いただけます。\n2. Camera restart sau 1 giây.\n3. Lưu ý: vé expired vẫn bị coi là active → vẫn block.'
      },
      {
        to: 'Tính năng waiting bị tắt',
        sub: 'Feature OFF → Lỗi 4 được ưu tiên, kể cả khi QR rỗng',
        input: '[Tiền điều kiện] isEnableWaitingNumber=false trên server.\n1. Quét bất kỳ QR nào ở waiting mode (kể cả QR rỗng hoặc không hợp lệ).',
        output: '1. Popup Lỗi 4: 本QRコードの読取りはサポートされていません。カメラアプリから読取ください。\n2. Camera restart sau 1 giây.\n3. KHÔNG hiển thị Lỗi 1 — Lỗi 4 ưu tiên khi feature OFF.'
      },
      {
        to: 'Cross-mode behavior',
        sub: 'Quét nhầm QR claim RJP ở waiting mode → tự route sang claim flow',
        input: '[Tiền điều kiện] User đang mở waiting mode từ Home.\n1. Quét QR claim hợp lệ (bắt đầu bằng RJP).',
        output: '1. Hệ thống tự nhận diện đây là QR claim.\n2. Tự route sang luồng tích điểm.\n3. KHÔNG hiển thị popup lỗi waiting.'
      }
    ]
  },

  /* ── 7. Edge case Dependency Map ── */
  {
    title: '7. Edge case theo Dependency Map',
    rows: [
      {
        to: 'Mất mạng đúng lúc dispatch kết quả',
        sub: 'Ngắt mạng khi màn scan chuẩn bị đóng để trả kết quả',
        input: '[Tiền điều kiện] Mở scan từ Home hoặc Push, QR vừa được nhận diện xong.\n1. Ngắt kết nối mạng ngay thời điểm màn scan chuẩn bị đóng để dispatch kết quả.',
        output: '1. Hiển thị dialog không có kết nối.\n2. Không xử lý kết quả vừa quét.\n3. Không hiển thị banner số thứ tự.\n4. Không chuyển sang màn kết quả claim.'
      },
      {
        to: 'Login từ popup — entry Home',
        sub: 'Sau đăng nhập: reload Home, xử lý tiếp QR tự động',
        input: '[Tiền điều kiện] Mở scan từ Home, chưa login.\n1. Quét QR claim.\n2. Popup Lỗi 5 hiển thị.\n3. Bấm ログイン → đăng nhập thành công.',
        output: '1. Màn scan đóng với result FINISH_SCAN_AFTER_LOGIN.\n2. Home reload.\n3. Có thể hiện dialog đăng nhập thành công.\n4. QR cũ được xử lý tự động, KHÔNG cần quét lại.'
      },
      {
        to: 'Login từ popup — entry Rank',
        sub: 'Sau đăng nhập: chỉ refresh Rank, KHÔNG xử lý QR cũ',
        input: '[Tiền điều kiện] Mở scan từ tab Rank, chưa login.\n1. Quét QR claim.\n2. Popup Lỗi 5 hiển thị.\n3. Bấm ログイン → đăng nhập thành công.',
        output: '1. Màn scan đóng.\n2. Tab Rank chỉ tự refresh điểm/hạng.\n3. KHÔNG hiện dialog.\n4. QR vừa quét KHÔNG được xử lý tự động — user phải quét lại.'
      }
    ]
  }
];

(async () => {
  const out = process.argv[2] || path.join(__dirname, '【APP】Scan_Claim.xlsx');
  const res = await generateTestcase({
    functionName: FUNCTION_NAME,
    creator: CREATOR,
    createDate: CREATE_DATE,
    release: RELEASE,
    devices: DEVICES,
    sheetPrefix: SHEET_PREFIX,
    guiSection,
    logicSections,
    output: out,
  });
  console.log('WROTE:', res.output, '| GUI:', res.gui, '| LOGIC:', res.logic);
})();
