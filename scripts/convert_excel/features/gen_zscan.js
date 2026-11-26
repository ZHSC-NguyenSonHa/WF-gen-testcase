// =============================================================================
// gen_zscan.js — Test cases cho module quét QR Code (zscan) v3
// Release 7.4.0 | Creator: QuynhNT | Spec: zscan_spec.html
// =============================================================================
const path = require('path');
const { generateTestcase } = require('../testcase_builder');

const FUNCTION_NAME = 'zscan_QRScan';
const CREATOR = 'QuynhNT';
const CREATE_DATE = '2026-07-03';
const RELEASE = '7.4.0';
const DEVICES = ['iOS', 'Android'];
const SHEET_PREFIX = 'zscan';

// ─────────────────────────────────────────────────────────────────
// GUI — Trạng thái màn hình (layout, tiêu đề, khung ngắm)
// ─────────────────────────────────────────────────────────────────
const guiSection = {
  title: 'Xác nhận hiển thị UI màn hình quét QR (zscan)',
  rows: [
    // === Màn hình xin quyền camera ===
    {
      to: 'Màn hình xin quyền camera',
      sub: 'Layout tổng thể và nút Cài đặt',
      input: '[Tiền điều kiện] Mở app, chua cap quyền camera (cai dat moi hoặc đã xóa quyền).\n1. Bấm icon quét QR từ Home.\n2. Quan sát màn hình hiển thị.',
      output: '1. Hiển thị màn hình in-app thông báo cần quyền camera.\n2. Có icon/hình ảnh minh họa camera.\n3. Có nội dung text giải thích lý do cần quyền.\n4. Có nút "設定する" (Cai dat) o vi tri noi bat.\n5. Không crash, khong man hinh trang.'
    },
    {
      to: 'Màn hình xin quyền camera',
      sub: 'Nội dung text và encoding',
      input: '[Tiền điều kiện] Đang hiển thị màn hình xin quyền camera in-app.\n1. Đối chiếu nội dung text với spec.\n2. Kiểm tra encoding.',
      output: '1. Text hiển thị dung ngon ngu theo cai dat thiết bị.\n2. Không có lỗi encoding, ký tự ???, chữ vuông.\n3. Nut "設定する" label dung, khong bi cat.'
    },
    // === Màn hình quét chế độ tích điểm ===
    {
      to: 'Màn hình quét chế độ Tích điểm',
      sub: 'Tiêu đề và hướng dẫn',
      input: '[Tiền điều kiện] Da cap quyền camera. Mở màn hình quét từ menu thành viên / tab Hạng.\n1. Quan sát tiêu đề màn hình.\n2. Quan sát nội dung hướng dẫn bên dưới.',
      output: '1. Tieu de hiển thị "会員証" (The thanh vien).\n2. Huong dan hiển thị "レシートのQRコードを読み取ってください" (Vui long quet ma QR tren hoa don).\n3. KHONG hien tieu de "QR読み取り" (sai che do).'
    },
    {
      to: 'Màn hình quét chế độ Tích điểm',
      sub: 'Khung ngắm QR và camera preview',
      input: '[Tiền điều kiện] Đang ở màn hình quét chế độ tích điểm.\n1. Quan sát vùng trung tâm màn hình.\n2. Camera đã khởi động.',
      output: '1. Khung ngắm QR hình vuông hiển thị ở trung tâm màn hình.\n2. Camera đang phân tích liên tục (preview video chạy).\n3. Không bị đen màn hình hoặc treo.\n4. Không có nút hay nhãn hiệu "QR読み取り".'
    },
    // === Màn hình quét chế độ số thứ tự ===
    {
      to: 'Màn hình quét chế độ Số thứ tự',
      sub: 'Tiêu đề và hướng dẫn',
      input: '[Tiền điều kiện] Da cap quyền camera. Mở màn hình quét từ màn hình Home.\n1. Quan sát tiêu đề màn hình.\n2. Quan sát nội dung hướng dẫn bên dưới.',
      output: '1. Tieu de hiển thị "QR読み取り" (Doc QR).\n2. Huong dan hiển thị "受付札、レシートのQRコードを読み取ってください" (Vui long quét QR tren phieu cho hoac hoa don).\n3. KHONG hien tieu de "会員証" (sai che do).'
    },
    {
      to: 'Màn hình quét chế độ Số thứ tự',
      sub: 'Khung ngắm QR và camera preview',
      input: '[Tiền điều kiện] Đang ở màn hình quét chế độ số thứ tự.\n1. Quan sát vùng trung tâm màn hình.\n2. Camera đã khởi động.',
      output: '1. Khung ngắm QR hình vuông hiển thị ở trung tâm màn hình.\n2. Camera đang phân tích liên tục (preview video chạy).\n3. Không bị đen màn hình hoặc treo.\n4. Khong co tieu de "会員証".'
    },
  ]
};

// ─────────────────────────────────────────────────────────────────
// LOGIC — 3 sections
// ─────────────────────────────────────────────────────────────────
const logicSections = [
  // ═══════════════════════════════════════════════
  // Section 1: Xử lý quyền camera
  // ═══════════════════════════════════════════════
  {
    title: '1. Xác nhận xử lý quyền camera',
    rows: [
      {
        to: 'Lần đầu xin quyền',
        sub: 'Cho phep → camera hoat dong',
        input: '[Tiền điều kiện] App cài lần đầu hoặc đã xóa quyền camera. Chưa từng cấp quyền.\n1. Mở màn hình quét QR (từ Home).\n2. Dialog hệ thống xin quyền camera hiển thị.\n3. Bam "Allow" / "Cho phep".\n4. Quan sát màn hình quet.',
        output: '1. Dialog he thong hien dung tieu de va noi dung "QRコードを読み取るためにカメラへのアクセスを許可してください".\n2. Sau khi bấm Cho phép: dialog đóng.\n3. Camera khởi động, khung ngắm QR hiển thị.\n4. Màn hình sẵn sàng để quét. Không crash.'
      },
      {
        to: 'Lần đầu xin quyền',
        sub: 'Tu choi → màn hình in-app',
        input: '[Tiền điều kiện] App cài lần đầu, chưa từng cấp quyền.\n1. Mở màn hình quét QR.\n2. Dialog hệ thống xin quyền camera hiển thị.\n3. Bam "Deny" / "Tu choi".\n4. Quan sát màn hình.',
        output: '1. Dialog hệ thống đóng.\n2. Hiện màn hình in-app thông báo cần quyền camera.\n3. Có nút "設定する" (Cai dat).\n4. Camera KHÔNG khởi động.\n5. Không crash, khong man hinh den.'
      },
      {
        to: 'Đã từ chối 1 lần (có thể hỏi lại)',
        sub: 'Bam Cai dat → dialog xin lai → Cho phep',
        input: '[Tiền điều kiện] Đã từ chối quyền 1 lần (chua chon "Never Ask Again" tren Android / chua chon "Khong cho phep" vinh vien tren iOS). Đang ở màn hình in-app cần quyền.\n1. Bấm nút "設定する".\n2. Dialog xin quyền lần 2 hiển thị.\n3. Bam Cho phep.\n4. Quan sát màn hình.',
        output: '1. Bấm nút: mo dialog xin quyền (KHONG mo Settings).\n2. Sau khi Cho phep: camera khởi động.\n3. Khung ngam QR hiển thị, sẵn sàng quét.'
      },
      {
        to: 'Đã từ chối 1 lần (có thể hỏi lại)',
        sub: 'Bam Cai dat → dialog xin lai → Tu choi lan 2',
        input: '[Tiền điều kiện] Đã từ chối 1 lần, chưa vĩnh viễn. Đang ở màn hình in-app.\n1. Bam "設定する".\n2. Dialog xin quyền hiển thị lần 2.\n3. Bam Tu choi.',
        output: '1. Dialog đóng.\n2. Màn hình vẫn ở trạng thái in-app "can quyền camera".\n3. Nut "設定する" vẫn hiện.\n4. Camera KHÔNG khởi động.'
      },
      {
        to: 'Từ chối vĩnh viễn (Never Ask Again)',
        sub: 'Bam Cai dat → mo Settings → cap thu cong → quay lai',
        input: '[Tiền điều kiện] Đã từ chối vĩnh viễn (iOS: "Khong cho phep" / Android: tich "Khong hoi lai" + tu choi). Đang ở màn hình in-app.\n1. Bam "設定する".\n2. Quan sát điều hướng.\n3. Trong Settings: bật quyền Camera cho app.\n4. Quay lại app.',
        output: '1. Bấm nút → mo Cai dat he thong (Settings) thay vi dialog (khác với case từ chối 1 lần).\n2. Co the bat quyen thu cong trong Settings.\n3. Quay lại app: màn hình tự kiểm tra lại quyền (onResume/viewDidAppear).\n4. Camera khoi dong, khung ngam hiển thị.\n5. San sang quét QR.'
      },
      {
        to: 'Quyền bị thu hồi khi app ở nền',
        sub: 'Mo lai → màn hình tự đóng / khong crash',
        input: '[Tiền điều kiện] App đang foreground, màn hình quét QR đang mở. Thiết bị thực.\n1. Vào Settings hệ thống → thu hoi quyền camera cua app.\n2. Quay lại app (man hinh quet).\n3. Quan sát hành vi.',
        output: '1. Màn hình quét tự đóng / dong khi phat hien quyền bị thu hồi.\n2. Không có crash, khong ANR / freeze.\n3. App vẫn hoạt động bình thường o cac màn hình khác.\n4. Không hiển thị thông báo lỗi, chỉ đóng gracefully.'
      },
      {
        to: 'Quay lại từ Settings',
        sub: 'Re-check quyền onResume (chưa cấp)',
        input: '[Tiền điều kiện] Đang ở màn hình in-app "cần quyền camera". Đã bấm "設定する" → vào Settings NHUNG KHONG cấp quyền.\n1. Quay lại app (Back hoặc swipe).\n2. Quan sát màn hình.',
        output: '1. Màn hình tự kiểm tra lại quyền camera.\n2. Quyen chua duoc cap → van hien màn hình in-app "can quyen".\n3. Không tự mở camera, khong crash.'
      },
    ]
  },

  // ═══════════════════════════════════════════════
  // Section 2: Xử lý khi quét QR tích điểm
  // ═══════════════════════════════════════════════
  {
    title: '2. Xác nhận xử lý khi quét QR tích điểm',
    rows: [
      // -- Validate QR --
      {
        to: 'Validate QR tích điểm',
        sub: 'QR rong → Loi 1',
        input: '[Tiền điều kiện] Da cap quyền camera. Che do tich diem (tu menu thanh vien). Đã đăng nhập.\nTest data: QR content = "" (chuoi rong).\n1. Quét QR có nội dung rỗng.\n2. Quan sát phản hồi.',
        output: '1. Popup Lỗi 1: "久兵衛屋で発行したQRコードを読取ってください。"\n2. Nút OK hiển thị.\n3. Bấm OK → popup đóng, camera restart sau 1 giay.\n4. KHÔNG gọi API.'
      },
      {
        to: 'Validate QR tích điểm',
        sub: 'QR khong bat dau RJP → Loi 1',
        input: '[Tiền điều kiện] Che do tich diem. Đã đăng nhập.\nTest data: QR = "ABC1234567890" (khong co prefix RJP).\n1. Quét QR khong co prefix RJP.\n2. Quan sát phản hồi.',
        output: '1. Popup Lỗi 1: "久兵衛屋で発行したQRコードを読取ってください。"\n2. Nut OK.\n3. Camera restart sau 1 giây.\n4. KHÔNG gọi API.'
      },
      {
        to: 'Validate QR tích điểm',
        sub: 'QR RJP dài = 71 ký tự (boundary hợp lệ)',
        input: '[Tiền điều kiện] Che do tich diem. Đã đăng nhập.\nTest data: QR = "RJP" + 68 ky tu alphanum = 71 ky tu tong cong (dung bang gioi han).\n1. Quét QR RJP dài 71 ký tự.\n2. Quan sát phản hồi.',
        output: '1. Khong hien popup lỗi validate.\n2. Hệ thống gọi API tích điểm.\n3. API thanh cong → màn hình đóng, chuyển kết quả.'
      },
      {
        to: 'Validate QR tích điểm',
        sub: 'QR RJP dài = 72 ký tự (vượt giới hạn)',
        input: '[Tiền điều kiện] Che do tich diem. Đã đăng nhập.\nTest data: QR = "RJP" + 69 ky tu = 72 ky tu tong cong (vuot > 71).\n1. Quét QR RJP dài 72 ký tự.\n2. Quan sát phản hồi.',
        output: '1. Popup Lỗi 2: "久兵衛屋で発行されたレシートのみ有効です。" (Chi hoa don Kyubeeya moi hop le).\n2. Nut OK.\n3. Camera restart sau 1 giây.\n4. KHÔNG gọi API.\n5. Thong bao KHAC Loi 1 (Loi 1 dung cho QR khong RJP, Loi 2 dung cho RJP > 71).'
      },
      // -- Kiểm tra đăng nhập --
      {
        to: 'Kiểm tra đăng nhập',
        sub: 'Chua dang nhap → popup Loi 5',
        input: '[Tiền điều kiện] CHƯA đăng nhập. Che do tich diem. Đã mở camera thành công.\nTest data: QR hop le "RJP" + 30 ky tu (tong 33, <= 71).\n1. Quét QR hóa đơn hợp lệ.\n2. He thong nhận diện QR.\n3. Quan sát popup.',
        output: '1. Popup Lỗi 5: "この機能はログイン後に使用できるようになります。" (Tinh nang chi dung duoc sau khi dang nhap).\n2. Có 2 nút: "閉じる" (Dong) va "ログイン" (Dang nhap).\n3. KHONG gọi API tích điểm.'
      },
      {
        to: 'Kiểm tra đăng nhập',
        sub: 'Popup Loi 5 → bam Dong → camera tiếp tục',
        input: '[Tiền điều kiện] Đang hiển thị popup Lỗi 5 (yêu cầu đăng nhập).\n1. Bấm nút "閉じる" (Dong).\n2. Quan sát hành vi.',
        output: '1. Popup đóng.\n2. Camera tiếp tục phân tích (sẵn sàng quét lại).\n3. KHONG dieu huong sang màn hình khác.\n4. Màn hình quét vẫn ở chế độ tích điểm.'
      },
      {
        to: 'Kiểm tra đăng nhập',
        sub: 'Popup Lỗi 5 → bấm Đăng nhập → mở màn hình login',
        input: '[Tiền điều kiện] Đang hiển thị popup Lỗi 5.\n1. Bấm nút "ログイン" (Dang nhap).\n2. Quan sát điều hướng.',
        output: '1. Màn hình đăng nhập mở.\n2. Màn hình quét đóng lai.\n3. Sau đăng nhập thành công: hành vi khác nhau theo điểm vào ban đầu:\n   - Vào từ Home → tải lại Home, co the hien dialog dang nhap thanh cong.\n   - Vao tu Tab Hạng → chỉ làm mới điểm/hạng, KHÔNG hiển thị thông báo.'
      },
      // -- Gọi API --
      {
        to: 'Gọi API tích điểm',
        sub: 'Thành công (200 + data)',
        input: '[Tiền điều kiện] Đã đăng nhập. Chế độ tích điểm (từ menu thành viên). QR hop le RJP <= 71 ky tu.\n1. Quét QR hóa đơn hợp lệ.\n2. Hệ thống nhận diện, beep + rung.\n3. API trả về 200 có dữ liệu điểm/hạng.',
        output: '1. Thiết bị phát tiếng beep + rung khi nhận diện QR.\n2. Camera dừng phân tích để tránh quét nhiều lần.\n3. Gọi API thành công.\n4. Màn hình quét tự đóng.\n5. Chuyển sang màn hình kết quả tích điểm (hiển thị điểm/hạng mới).\n6. KHONG hien popup lỗi.'
      },
      {
        to: 'Gọi API tích điểm',
        sub: 'API 200 khong co du lieu → popup lỗi',
        input: '[Tiền điều kiện] Đã đăng nhập. QR hợp lệ.\nTinh huong: server trả 200 nhung response KHONG chua du lieu diem.\n1. Quét QR → API trả 200 + empty data.\n2. Quan sát popup.',
        output: '1. Popup lỗi mặc định "エラー" (Loi) hiển thị.\n2. Co nut "リトライ" (Retry) va "キャンセル" (Huy).\n3. Màn hình quét chưa đóng.\n4. Ket qua khong duoc xu ly.'
      },
      {
        to: 'Gọi API tích điểm',
        sub: 'Mat mang → Loi 7 (Retry/Huy)',
        input: '[Tiền điều kiện] Đã đăng nhập. QR hợp lệ. Thiet bi KHONG co ket noi mang (tắt WiFi và data).\n1. Quét QR hóa đơn hợp lệ.\n2. Hệ thống nhận diện, beep + rung.\n3. Gui yeu cau API → no network.',
        output: '1. Popup Lỗi 7: "端末がインターネットに接続されていません。接続状況を確認してください。"\n2. Dịch: Thiet bi khong ket noi internet. Vui long kiem tra ket noi.\n3. Co nut "リトライ" va "キャンセル".\n4. KHÔNG gọi được API.'
      },
      {
        to: 'Gọi API tích điểm',
        sub: 'Retry sau Loi 7 → thanh cong',
        input: '[Tiền điều kiện] Đang hiển thị popup Lỗi 7. Bật lại mạng.\n1. Bam "リトライ" (Retry).\n2. Quan sát hành vi.',
        output: '1. Hệ thống gửi lại request API.\n2. API trả 200 + data → thanh cong.\n3. Popup đóng, màn hình quét đóng, chuyển kết quả.\n4. Lưu ý: chỉ retry nếu QR bắt đầu "RJP"; nếu không → hien Loi 1.'
      },
      {
        to: 'Gọi API tích điểm',
        sub: 'Huy sau loi → camera tiếp tục',
        input: '[Tiền điều kiện] Đang hiển thị popup lỗi bất kỳ (Loi 7, 8, 9, hoac 200-nodata).\n1. Bam "キャンセル" (Huy).\n2. Quan sát hành vi.',
        output: '1. Popup đóng.\n2. Camera tiếp tục phân tích, sẵn sàng quét lại.\n3. Màn hình quét vẫn mở.'
      },
      {
        to: 'Gọi API tích điểm',
        sub: 'Loi server 503 → Loi 9',
        input: '[Tiền điều kiện] Đã đăng nhập. QR hợp lệ. Server tra ve 503.\n1. Quét QR → API trả 503.\n2. Quan sát popup.',
        output: '1. Popup Lỗi 9: "サーバー側で一時的に不具合が発生しています。しばらく時間をおいてから再度お試しください。"\n2. Dịch: May chu dang gap su co tam thoi. Vui long thu lai sau.\n3. Có nút Retry / Hủy.'
      },
      {
        to: 'Gọi API tích điểm',
        sub: 'Loi server 500 / -108 → Loi 8',
        input: '[Tiền điều kiện] Đã đăng nhập. QR hợp lệ. Server tra ve 500 hoac -108.\n1. Quét QR → API trả 500 hoặc -108.\n2. Quan sát popup.',
        output: '1. Popup Lỗi 8: hien thông báo lỗi từ server nếu có, hoac thông báo mặc định nếu không.\n2. Có nút Retry / Hủy.\n3. KHÔNG tự điều hướng sang màn hình khác.'
      },
      {
        to: 'Gọi API tích điểm',
        sub: 'Session het han (API 401) — KHONG nav login',
        input: '[Tiền điều kiện] Đã đăng nhập nhưng token đã hết hạn phía server. QR hop le.\n1. Quét QR → server trả 401.\n2. Quan sát popup va hanh vi dieu huong.',
        output: '1. Popup Lỗi 10: "エラー" (thông báo lỗi chung, hoac noi dung neu server gui kem).\n2. Chi có nút OK — KHÔNG có nút Đăng nhập.\n3. Bấm OK → popup đóng, camera quet lai tiep.\n4. KHÔNG tự điều hướng sang màn hình đăng nhập.\n5. KHAC Loi 5 (chưa đăng nhập): Lỗi 10 chỉ có OK, không có nút Login, không tự nav.'
      },
      {
        to: 'QR URL redirect nhiều RJP',
        sub: 'Tách theo amount= xử lý đúng',
        input: '[Tiền điều kiện] Đã đăng nhập. Chế độ tích điểm.\nTest data: QR = "https://example.com/redirect?RJP=dummy&amount=RJP[68 ky tu hop le]" (chua nhieu chuoi RJP).\n1. Quét QR URL redirect có nhiều "RJP".\n2. Quan sát xử lý.',
        output: '1. Hệ thống tách chuỗi theo "amount=" va lay phan sau.\n2. Phan sau "amount=" la chuoi RJP hop le → gọi API tích điểm.\n3. Ket qua xu ly dung nhu QR binh thuong.\n4. KHÔNG báo Lỗi 1 do nhầm nhiều chuỗi RJP.'
      },
      {
        to: 'Kết quả theo điểm vào',
        sub: 'Mo tu Home → ket qua ve Home',
        input: '[Tiền điều kiện] Đã đăng nhập. Mở màn hình quét từ icon Home (KHONG phai Tab Hạng). QR tich diem hop le.\n1. Quét QR, API thành công.\n2. Quan sát màn hình sau khi dong quet.',
        output: '1. Màn hình quét đóng.\n2. Chuyển sang màn hình kết quả tích điểm (hiển thị điểm/hạng mới).\n3. Hoac hien banner so cho tren Home neu la QR so thu tu.\n4. KHONG chi lam moi lang le nhu Tab Hạng.'
      },
      {
        to: 'Kết quả theo điểm vào',
        sub: 'Mo tu Tab Hạng → chi lam moi, khong thong bao',
        input: '[Tiền điều kiện] Đã đăng nhập. Mở màn hình quét từ Tab Hạng thành viên. QR tich diem hop le.\n1. Quét QR, API thành công.\n2. Quan sát màn hình sau khi dong quet.',
        output: '1. Màn hình quét đóng.\n2. Tab Hạng tự làm mới thông tin điểm/hạng (silent update).\n3. KHÔNG hiển thị banner, dialog, hay thong bao nao.\n4. Không crash, khong loi.\n5. Neu can quet lai → phải mở màn hình quét lần nữa (không tự xử lý QR vừa quét).'
      },
    ]
  },

  // ═══════════════════════════════════════════════
  // Section 3: Xử lý khi quét QR vé đợi
  // ═══════════════════════════════════════════════
  {
    title: '3. Xác nhận xử lý khi quét QR vé đợi (số thứ tự)',
    rows: [
      {
        to: 'Tính năng bị tắt từ cấu hình',
        sub: 'Moi QR → Loi 4',
        input: '[Tiền điều kiện] Tinh nang lay so thu tu BI TAT trong cau hinh may chu. Mo tu Home.\n1. Quét bất kỳ QR nào (phiếu chờ, hóa đơn RJP, QR ngẫu nhiên).\n2. Quan sát popup.',
        output: '1. Popup Lỗi 4: "本QRコードの読取りはサポートされていません。カメラアプリから読取ください。"\n2. Dịch: Khong ho tro doc ma QR nay. Vui long dung ung dung camera.\n3. Nut OK.\n4. Camera restart sau 1 giây.\n5. Lỗi 4 hiển thị TRƯỚC cả Lỗi 1 khi tinh nang bi tat (kể cả QR rỗng cũng hiển thị Lỗi 4 trong mode này).'
      },
      {
        to: 'Validate QR vé đợi',
        sub: 'QR khong co param qr= → Loi 3',
        input: '[Tiền điều kiện] Tinh nang bat. Mo tu Home. Da cap quyền camera.\nTest data: URL = "https://example.com/waiting?id=ABC" (KHONG co qr=).\n1. Quét QR URL không chứa tham số qr=.\n2. Quan sát phản hồi.',
        output: '1. Popup Lỗi 3: "久兵衛屋で発行した受付札を読取ってください。"\n2. Dịch: Vui long quet phieu cho Kyubeeya.\n3. Nut OK.\n4. Camera restart sau 1 giây.'
      },
      {
        to: 'Validate QR vé đợi',
        sub: 'Chuỗi sau qr= = 20 ký tự (boundary < 21)',
        input: '[Tiền điều kiện] Tinh nang bat. Mo tu Home.\nTest data: URL co qr=ABCDEFGHIJ1234567890 (dung 20 ky tu, boundary duoi 21).\n1. Quét QR chuỗi sau qr= = 20 ký tự.\n2. Quan sát phản hồi.',
        output: '1. Popup Lỗi 3a: "久兵衛屋で発行した受付札を読取ってください。" (qua ngan — 20 < 21).\n2. Nut OK.\n3. Camera restart sau 1 giây.'
      },
      {
        to: 'Validate QR vé đợi',
        sub: 'Chuỗi sau qr= = 21 ký tự (boundary tối thiểu)',
        input: '[Tiền điều kiện] Tinh nang bat. Mo tu Home.\nTest data: chuỗi sau qr= = 21 ky tu alphanum (du toi thieu).\n1. Quét QR chuoi 21 ky tu.\n2. Quan sát xử lý.',
        output: '1. Hệ thống tiếp tục validate (vuot qua kiem tra do dai toi thieu).\n2. Neu dung 21-39 ky tu → Loi 3b (không phải 40/41, khong ZNV).\n3. Khong ra Loi 3a (qua ngan).'
      },
      {
        to: 'Validate QR vé đợi',
        sub: 'Chuỗi 21-39 ký tự (giải mã thất bại)',
        input: '[Tiền điều kiện] Tinh nang bat. Mo tu Home.\nTest data: chuỗi sau qr= = 30 ky tu (không phải 40/41 cu, khong phai ZNV).\n1. Quét QR chuoi 30 ky tu.\n2. Quan sát phản hồi.',
        output: '1. Popup Lỗi 3b: "久兵衛屋で発行した受付札を読取ってください。" (giai ma that bai).\n2. Nut OK.\n3. Camera restart sau 1 giây.'
      },
      {
        to: 'Validate QR vé đợi',
        sub: 'Chuoi = 40 ky tu (dinh dang cu) — hop le',
        input: '[Tiền điều kiện] Tinh nang bat. Chưa có vé chờ. Mã cửa hàng hop le.\nTest data: chuỗi sau qr= = 40 ky tu, brand code tai vi tri 14-21 khop danh sách cấu hình.\n1. Quét QR phiếu chờ định dạng cũ 40 ky tu.\n2. Quan sát xử lý.',
        output: '1. Hệ thống extract brand code vị trí 14-21.\n2. Mã cửa hàng khớp → hợp lệ.\n3. Kiểm tra vé đang có → khong co ve.\n4. Màn hình quét đóng, tra chuỗi QR ve màn hình gọi de đặt số.\n5. KHONG popup lỗi.'
      },
      {
        to: 'Validate QR vé đợi',
        sub: 'Chuoi = 41 ky tu (dinh dang cu) — hop le',
        input: '[Tiền điều kiện] Tinh nang bat. Chưa có vé chờ. Mã cửa hàng hop le.\nTest data: chuỗi sau qr= = 41 ky tu, brand code tai vi tri 15-22 khớp danh sách.\n1. Quét QR phiếu chờ định dạng cũ 41 ky tu.\n2. Quan sát xử lý.',
        output: '1. Hệ thống extract brand code vị trí 15-22.\n2. Mã cửa hàng khớp → hợp lệ.\n3. Kiểm tra vé → không có vé.\n4. Màn hình quét đóng, tra chuỗi QR ve màn hình gọi.\n5. KHONG popup lỗi.'
      },
      {
        to: 'Validate QR vé đợi',
        sub: 'Chuoi > 41 ky tu, bat dau ZNV (dinh dang moi) — hop le',
        input: '[Tiền điều kiện] Tinh nang bat. Chưa có vé chờ. Mã cửa hàng hop le.\nTest data: chuỗi sau qr= > 41 ky tu, bat dau "ZNV", giải mã AES ra chuỗi 40 hoặc 41 ký tự hợp lệ.\n1. Quét QR định dạng mới (ZNV + AES).\n2. Quan sát xử lý.',
        output: '1. Hệ thống nhận diện prefix ZNV → giải mã AES.\n2. Ket qua giai ma = 40/41 ky tu → tiếp tục validate mã cửa hàng.\n3. Hop le → màn hình quét đóng, tra chuỗi QR ve màn hình gọi.\n4. KHONG popup lỗi.'
      },
      {
        to: 'Validate QR vé đợi',
        sub: 'Chuỗi > 41 ký tự, KHÔNG có ZNV (giải mã thất bại)',
        input: '[Tiền điều kiện] Tinh nang bat.\nTest data: chuỗi sau qr= = 50 ky tu, KHONG bat dau "ZNV".\n1. Quét QR chuỗi > 41 ký tự không có ZNV.\n2. Quan sát phản hồi.',
        output: '1. Popup Lỗi 3b: "久兵衛屋で発行した受付札を読取ってください。" (giai ma that bai).\n2. Nut OK.\n3. Camera restart sau 1 giây.'
      },
      {
        to: 'Validate QR vé đợi',
        sub: 'ZNV giải mã AES → ket qua không phải 40/41 ky tu',
        input: '[Tiền điều kiện] Tinh nang bat.\nTest data: chuỗi ZNV giải mã AES ra 35 ky tu (khong phai 40 hay 41).\n1. Quét QR bat dau ZNV nhung giai ma ra do dai khong hop le.\n2. Quan sát phản hồi.',
        output: '1. Popup Lỗi 3b: "久兵衛屋で発行した受付札を読取ってください。"\n2. Nut OK.\n3. Camera restart sau 1 giây.'
      },
      {
        to: 'Mã cửa hàng',
        sub: 'Mã cửa hàng khong khớp danh sách',
        input: '[Tiền điều kiện] Tinh nang bat. QR dinh dang chuan (40 ky tu).\nTest data: brand code tai vi tri 14-21 = "UNKNOWN1" (khong co trong danh sách cấu hình).\n1. Quét QR có mã cửa hàng không khớp.\n2. Quan sát phản hồi.',
        output: '1. Popup Lỗi 3b: "久兵衛屋で発行した受付札を読取ってください。" (mã cửa hàng khong khop).\n2. Nut OK.\n3. Camera restart sau 1 giây.'
      },
      {
        to: 'Mã cửa hàng',
        sub: 'Danh sach cau hinh rong → moi ma bi tu choi',
        input: '[Tiền điều kiện] Tinh nang bat. Danh sach mã cửa hàng trong cau hinh = [] (rong). QR dinh dang chuan hop le.\n1. Quét QR phiếu chờ hợp lệ.\n2. Quan sát phản hồi.',
        output: '1. Popup Loi 3b vi mã cửa hàng khong the khop voi danh sách rỗng.\n2. Nut OK.\n3. Camera restart.\n4. KHÔNG có exception hay crash do list rỗng.'
      },
      {
        to: 'Kiểm tra vé đang có',
        sub: 'Dang co ve cho con hieu luc → block (Loi 6)',
        input: '[Tiền điều kiện] Tinh nang bat. Dang có vé chờ CÒN HIỆU LỰC trong local storage. QR hop le.\n1. Quét QR phiếu chờ hợp lệ.\n2. Quan sát phản hồi.',
        output: '1. Popup Lỗi 6: "\"待ち組数\"はアプリホーム画面でご確認いただけます。"\n2. Dịch: Co the xem so nhom dang cho tren màn hình chính.\n3. Nut OK.\n4. Camera restart sau 1 giây.\n5. KHÔNG đặt số mới.'
      },
      {
        to: 'Kiểm tra vé đang có',
        sub: 'Ve cho da het han (expired) → van block',
        input: '[Tiền điều kiện] Tinh nang bat. Co ve cho trong local storage nhung DA HET HAN (expired). QR hop le.\n1. Quét QR phiếu chờ hợp lệ.\n2. Quan sát phản hồi.',
        output: '1. Popup Lỗi 6 vẫn hiển thị (vé expired vẫn bị coi là "đang có vé").\n2. Khong the đặt số moi.\n3. Nut OK → camera restart.\n4. Luu y: cần mock data hoặc chờ vé expire tự nhiên để test.'
      },
      {
        to: 'Cross-mode QR tích điểm trong chế độ số thứ tự',
        sub: 'Tự động chuyển sang xử lý tích điểm',
        input: '[Tiền điều kiện] Tinh nang bat. Mo tu Home (che do so thu tu). Đã đăng nhập.\nTest data: QR hoa don tich diem hop le (bat dau "RJP", <= 71 ky tu).\n1. Quét QR hóa đơn tích điểm (thay vi QR phieu cho) trong che do so thu tu.\n2. Quan sát hành vi.',
        output: '1. KHONG hien popup lỗi "quet phieu cho".\n2. He thong tu nhận diện QR la loai tich diem → xử lý tích điểm luôn.\n3. Gọi API tích điểm (da dang nhap → thanh cong).\n4. Đóng màn hình, trả kết quả tích điểm về Home.'
      },
      {
        to: 'QR hop le → thanh cong',
        sub: 'Trả chuỗi QR về màn hình gọi',
        input: '[Tiền điều kiện] Tinh nang bat. Chưa có vé chờ. Mã cửa hàng khớp cấu hình. QR phieu cho hop le.\n1. Quét QR phiếu chờ hợp lệ.\n2. Quan sát hành vi sau xu ly.',
        output: '1. Thiết bị phát tiếng beep + rung khi nhận diện QR.\n2. Hệ thống validate hợp lệ → KHONG co popup lỗi.\n3. Màn hình quét tự đóng.\n4. Man hinh goi (Home) nhan chuỗi QR de xử lý đặt số.\n5. KHÔNG cần đăng nhập (API so thu tu khong can auth).'
      },
    ]
  }
];

(async () => {
  const out = process.argv[2] || path.join(__dirname, `..`, `..`, `..`, `Test Result`, `7.4.0`, `App`, `Base QR Scan`, `【APP】zscan_QRScan.xlsx`);
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
