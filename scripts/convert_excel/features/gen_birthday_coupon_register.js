// =============================================================================
// gen_birthday_coupon_register.js — CMS Birthday Coupon Register (バースデークーポン登録)
// Release: CMS | Creator: QuynhNT | Date: 2026-07-14
// Output: CMS/Testcase/【CMS】BirthdayCouponRegister.xlsx
// Spec: CMS/Spec/birthday_coupon_register_spec_analysis.md
// Ambiguities resolved (từ Excel sheet "1. Điểm Mơ Hồ"):
//   AMB-01: クーポン名 max 255 ký tự
//   AMB-02: 画像 chấp nhận JPG, PNG, JPEG
//   AMB-03: クーポン番号 dùng chung toàn hệ thống (không unique per record)
//   AMB-04: Default 併用可否: BBJ → 併用不可, brand khác → 併用可
//   AMB-05: Validate uniqueness 生年月 khi nhấn 登録
//   AMB-06: 一時保存 không validate required fields
//   AMB-07: Dropdown 種類 options từ bảng tm_coupon_icons
//   AMB-08: タイプ名 luôn nhập được, không phụ thuộc 種類
//   AMB-09: 生年月 = tháng sinh của USER
//   AMB-10: 戻る không hỏi xác nhận
//   AMB-11: 利用条件 / ② max 255 ký tự
//   AMB-12: Sau 登録 thành công → về list, record mới đầu danh sách
//   AMB-13: Coupon cấp vào đầu tháng sinh
//   AMB-14: BB4.7.0 = iOS/Android; BB > 4.7.0 → 利用条件② bị bỏ qua
// =============================================================================

const path = require('path');
const { generateTestcase } = require('../testcase_builder');

const FUNCTION_NAME  = 'BirthdayCouponRegister';
const CREATOR        = 'QuynhNT';
const CREATE_DATE    = '2026-07-14';
const RELEASE        = 'CMS';
const DEVICES        = ['Chrome', 'Edge'];
const SHEET_PREFIX   = 'BdayCoupon';

// ─────────────────────────────────────────────────────────────────────────────
// GUI — Kiểm tra layout, label, trạng thái visual
// ─────────────────────────────────────────────────────────────────────────────
const guiSection = {
  title: 'Xác nhận hiển thị màn hình バースデークーポン登録 (CMS)',
  rows: [
    {
      to: 'Layout tổng thể',
      sub: 'Hiển thị đủ 10 fields',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật.\n1. Quan sát toàn bộ form.',
      output: '1.\n- Hiển thị đủ 10 fields theo thứ tự: 表示場所 → クーポン名 → 種類 → 画像 → クーポン番号 → 生年月 → 併用可否 → 利用条件 → 利用条件②.\n- Không thiếu field, không lặp field.\n- 3 nút hành động cuối form: 登録 | 一時保存 | 戻る.'
    },
    {
      to: 'Layout tổng thể',
      sub: 'Dấu * đỏ trên fields bắt buộc',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật.\n1. Quan sát label từng field.',
      output: '1.\n- Có dấu (*) đỏ cạnh label: クーポン名(*), 画像(*), クーポン番号(*), 生年月(*), 併用可否(*).\n- Các fields không bắt buộc (種類, タイプ名, 利用条件, 利用条件②) KHÔNG có dấu (*).'
    },
    {
      to: '表示場所 (Vị trí hiển thị)',
      sub: 'Badge スペシャル read-only',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật.\n1. Quan sát field 表示場所.',
      output: '1.\n- Hiển thị badge tag "スペシャル" màu xám.\n- Không có input box cho phép chỉnh sửa.\n- Không click được, không focus được.'
    },
    {
      to: '種類 (Loại coupon)',
      sub: 'Trạng thái mặc định dropdown + タイプ名',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật.\n1. Quan sát khu vực field 種類.',
      output: '1.\n- Dropdown 種類 hiển thị giá trị mặc định "未選択".\n- Bên phải dropdown: text input có placeholder "タイプ名" ở trạng thái nhập được (enabled).\n- Hai thành phần nằm trên cùng 1 hàng.'
    },
    {
      to: '画像 (Image upload area)',
      sub: 'Hướng dẫn kích thước và drag & drop',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật.\n1. Quan sát khu vực upload ảnh.',
      output: '1.\n- Vùng upload có viền đứt nét.\n- Hiển thị text "ファイルサイズ：980 x 570".\n- Hiển thị text "ここに画像をドラッグ＆ドロップ".\n- Hiển thị text "または".\n- Hiển thị nút "ファイルを選択".'
    },
    {
      to: 'クーポン番号 (Mã coupon)',
      sub: 'Placeholder gợi ý 5桁数字',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật.\n1. Quan sát field クーポン番号 khi chưa nhập.',
      output: '1.\n- Hiển thị placeholder "5桁数字" bên trong input.\n- Input rỗng, chưa có dữ liệu.'
    },
    {
      to: '併用可否 (Khả năng kết hợp)',
      sub: 'Radio mặc định theo brand BBJ',
      input: '[Tiền điều kiện] Đăng nhập CMS với tài khoản brand BBJ. Vào màn hình Đăng ký coupon sinh nhật.\n1. Quan sát nhóm radio 併用可否.',
      output: '1.\n- Hiển thị 2 radio: ○ 併用不可 và ○ 併用可.\n- Radio 併用不可 được chọn mặc định (filled circle / màu xanh).\n- Radio 併用可 ở trạng thái unselected.'
    },
    {
      to: '併用可否 (Khả năng kết hợp)',
      sub: 'Radio mặc định theo brand khác (non-BBJ)',
      input: '[Tiền điều kiện] Đăng nhập CMS với tài khoản brand khác (không phải BBJ). Vào màn hình Đăng ký coupon sinh nhật.\n1. Quan sát nhóm radio 併用可否.',
      output: '1.\n- Hiển thị 2 radio: ○ 併用不可 và ○ 併用可.\n- Radio 併用可 được chọn mặc định (filled circle).\n- Radio 併用不可 ở trạng thái unselected.'
    },
    {
      to: '利用条件② (Điều kiện sử dụng 2)',
      sub: 'Label hiển thị chú thích BB4.7.0',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật.\n1. Quan sát label của field 利用条件②.',
      output: '1.\n- Label hiển thị: "利用条件②（BB4.7.0以下で対応）".\n- Có ghi chú "(BB4.7.0以下で対応)" trong label.'
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LOGIC — Business rules, validation, button behaviors
// ─────────────────────────────────────────────────────────────────────────────
const logicSections = [

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Validation クーポン名
  // ──────────────────────────────────────────────────────────────────────────
  { title: '1. Validation クーポン名 (Tên coupon)', rows: [
    {
      to: 'クーポン名',
      sub: 'Happy path — Nhập giá trị hợp lệ',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật. Điền đầy đủ tất cả fields bắt buộc khác hợp lệ.\n1. Nhập クーポン名: "誕生日クーポン7月"\n2. Nhấn 登録.',
      output: '2.\n- Form submit thành công.\n- Không có lỗi validation tại field クーポン名.'
    },
    {
      to: 'クーポン名',
      sub: 'Boundary — Nhập đúng 255 ký tự (max)',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật. Điền đầy đủ tất cả fields bắt buộc khác hợp lệ.\n1. Nhập クーポン名: chuỗi "あ" lặp lại 255 lần (255 ký tự)\n2. Nhấn 登録.',
      output: '2.\n- Form submit thành công.\n- クーポン名 được lưu đúng 255 ký tự.'
    },
    {
      to: 'クーポン名',
      sub: 'Boundary — Nhập 256 ký tự (vượt max)',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật.\n1. Nhập クーポン名: chuỗi "あ" lặp lại 256 lần (256 ký tự)\n2. Nhấn 登録 hoặc quan sát phản hồi input.',
      output: '2.\n- Hệ thống từ chối input vượt 255 ký tự (không nhập được ký tự thứ 256) HOẶC hiện thông báo lỗi max length.\n- Form không được submit với giá trị 256 ký tự.'
    },
    {
      to: 'クーポン名',
      sub: 'Negative — Để trống (required)',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật.\n1. Để trống field クーポン名.\n2. Điền đầy đủ tất cả fields bắt buộc khác hợp lệ.\n3. Nhấn 登録.',
      output: '3.\n- Hiển thị thông báo lỗi required tại field クーポン名.\n- Form không được submit.'
    },
    {
      to: 'クーポン名',
      sub: 'Negative — Nhập chỉ khoảng trắng (whitespace-only)',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật. Điền đầy đủ tất cả fields bắt buộc khác hợp lệ.\n1. Nhập クーポン名: "   " (3 khoảng trắng)\n2. Nhấn 登録.',
      output: '2.\n- Hệ thống coi whitespace-only là không hợp lệ, hiện lỗi required HOẶC lỗi format.\n- Form không được submit.'
    },
    {
      to: 'クーポン名',
      sub: 'Security — XSS injection',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật. Điền đầy đủ tất cả fields bắt buộc khác hợp lệ.\n1. Nhập クーポン名: "<script>alert(1)</script>"\n2. Nhấn 登録.',
      output: '2.\n- Giá trị được lưu dạng escaped text, không thực thi JavaScript.\n- Không xuất hiện alert popup.\n- Khi hiển thị lại trên màn hình, text được render an toàn (HTML escaped).'
    },
  ]},

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Validation クーポン番号
  // ──────────────────────────────────────────────────────────────────────────
  { title: '2. Validation クーポン番号 (Mã coupon)', rows: [
    {
      to: 'クーポン番号',
      sub: 'Happy path — Nhập đúng 5 chữ số',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật. Điền đầy đủ tất cả fields bắt buộc khác hợp lệ.\n1. Nhập クーポン番号: "12345"\n2. Nhấn 登録.',
      output: '2.\n- Form submit thành công.\n- Không có lỗi tại field クーポン番号.'
    },
    {
      to: 'クーポン番号',
      sub: 'Happy path — Leading zero giữ nguyên',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật. Điền đầy đủ tất cả fields bắt buộc khác hợp lệ.\n1. Nhập クーポン番号: "09009"\n2. Nhấn 登録.',
      output: '2.\n- Form submit thành công.\n- Giá trị lưu là "09009" (giữ nguyên leading zero, không bị strip thành "9009").'
    },
    {
      to: 'クーポン番号',
      sub: 'Negative — Để trống (required)',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật. Điền đầy đủ tất cả fields bắt buộc khác hợp lệ.\n1. Để trống field クーポン番号.\n2. Nhấn 登録.',
      output: '2.\n- Hiển thị thông báo lỗi required tại field クーポン番号.\n- Form không được submit.'
    },
    {
      to: 'クーポン番号',
      sub: 'Boundary — Nhập 4 chữ số (thiếu 1)',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật. Điền đầy đủ tất cả fields bắt buộc khác hợp lệ.\n1. Nhập クーポン番号: "1234" (4 chữ số)\n2. Nhấn 登録.',
      output: '2.\n- Hiển thị thông báo lỗi: yêu cầu đúng 5 chữ số.\n- Form không được submit.'
    },
    {
      to: 'クーポン番号',
      sub: 'Boundary — Nhập 6 chữ số (thừa 1)',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật. Điền đầy đủ tất cả fields bắt buộc khác hợp lệ.\n1. Nhập クーポン番号: "123456" (6 chữ số)\n2. Nhấn 登録.',
      output: '2.\n- Hệ thống không cho nhập quá 5 ký tự HOẶC hiện lỗi khi submit.\n- Form không được submit với 6 chữ số.'
    },
    {
      to: 'クーポン番号',
      sub: 'Negative — Nhập ký tự chữ cái',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật. Điền đầy đủ tất cả fields bắt buộc khác hợp lệ.\n1. Nhập クーポン番号: "abcde"\n2. Nhấn 登録.',
      output: '2.\n- Hệ thống không cho nhập chữ cái HOẶC hiện lỗi: chỉ chấp nhận số.\n- Form không được submit.'
    },
    {
      to: 'クーポン番号',
      sub: 'Negative — Nhập ký tự đặc biệt',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật. Điền đầy đủ tất cả fields bắt buộc khác hợp lệ.\n1. Nhập クーポン番号: "#!@%^"\n2. Nhấn 登録.',
      output: '2.\n- Hệ thống không cho nhập ký tự đặc biệt HOẶC hiện lỗi format.\n- Form không được submit.'
    },
  ]},

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Validation 生年月 (Tháng sinh)
  // ──────────────────────────────────────────────────────────────────────────
  { title: '3. Validation 生年月 (Tháng sinh) & Uniqueness', rows: [
    {
      to: '生年月',
      sub: 'Happy path — Nhập tháng sinh chưa có coupon',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật. Điền đầy đủ tất cả fields bắt buộc khác hợp lệ. Chắc chắn tháng 2026-01 chưa có coupon sinh nhật nào.\n1. Nhập 生年月: "2026-01" (tháng 1)\n2. Nhấn 登録.',
      output: '2.\n- Form submit thành công.\n- Không hiện lỗi uniqueness.\n- Về màn hình list, record mới hiển thị ở đầu danh sách.'
    },
    {
      to: '生年月',
      sub: 'Negative — Để trống (required)',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật. Điền đầy đủ tất cả fields bắt buộc khác hợp lệ.\n1. Để trống field 生年月.\n2. Nhấn 登録.',
      output: '2.\n- Hiển thị thông báo lỗi required tại field 生年月.\n- Form không được submit.'
    },
    {
      to: '生年月',
      sub: 'Negative — Tháng sinh đã tồn tại coupon (uniqueness check)',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật. Đã có coupon sinh nhật cho tháng 2026-07. Điền đầy đủ tất cả fields bắt buộc khác hợp lệ.\n1. Nhập 生年月: "2026-07" (tháng đã có coupon)\n2. Nhấn 登録.',
      output: '2.\n- Hiển thị lỗi đỏ dưới field 生年月: "こちらの月に誕生日クーポンを既に登録されました".\n- Form không được submit.'
    },
    {
      to: '生年月',
      sub: 'Validate timing — Uniqueness KHÔNG check khi blur (onBlur)',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật. Đã có coupon sinh nhật cho tháng 2026-07.\n1. Nhập 生年月: "2026-07"\n2. Click ra ngoài field (blur), không nhấn 登録.\n3. Quan sát trạng thái field.',
      output: '2. Không có lỗi xuất hiện khi blur.\n3. Lỗi uniqueness KHÔNG hiển thị ở bước này (chỉ check khi nhấn 登録).'
    },
  ]},

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Validation 画像 (File upload)
  // ──────────────────────────────────────────────────────────────────────────
  { title: '4. Validation 画像 (Ảnh coupon)', rows: [
    {
      to: '画像',
      sub: 'Happy path — Upload file JPG hợp lệ',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật.\n1. Click nút "ファイルを選択".\n2. Chọn file "coupon_birthday.jpg" (format JPG, kích thước ≤ 980×570).\n3. Quan sát khu vực upload sau khi chọn.',
      output: '2. File được chọn thành công.\n3. Khu vực upload hiển thị preview ảnh HOẶC tên file đã chọn.'
    },
    {
      to: '画像',
      sub: 'Happy path — Upload file PNG hợp lệ',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật.\n1. Click nút "ファイルを選択".\n2. Chọn file "coupon_birthday.png" (format PNG).\n3. Quan sát khu vực upload sau khi chọn.',
      output: '2. File được chọn thành công.\n3. Khu vực upload hiển thị preview hoặc tên file.'
    },
    {
      to: '画像',
      sub: 'Happy path — Drag & Drop file hợp lệ',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật.\n1. Kéo file "coupon_birthday.jpg" từ desktop thả vào vùng upload (drag & drop area).\n2. Quan sát phản hồi.',
      output: '1. Vùng upload highlight khi file được kéo vào.\n2. File được nhận thành công, hiển thị preview hoặc tên file.'
    },
    {
      to: '画像',
      sub: 'Negative — Không upload ảnh, nhấn 登録',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật. Điền đầy đủ tất cả fields bắt buộc khác hợp lệ.\n1. Không upload ảnh (khu vực vẫn rỗng).\n2. Nhấn 登録.',
      output: '2.\n- Hiển thị thông báo lỗi required tại field 画像.\n- Form không được submit.'
    },
    {
      to: '画像',
      sub: 'Negative — Upload file định dạng không hợp lệ (PDF)',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật.\n1. Click nút "ファイルを選択".\n2. Chọn file "document.pdf".\n3. Quan sát phản hồi.',
      output: '2. Hệ thống không chấp nhận file PDF.\n3. Hiển thị lỗi: chỉ chấp nhận JPG, PNG, JPEG HOẶC file picker không cho chọn định dạng này.'
    },
    {
      to: '画像',
      sub: 'Negative — Upload file định dạng không hợp lệ (EXE / binary)',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật.\n1. Click nút "ファイルを選択".\n2. Chọn file "setup.exe".\n3. Quan sát phản hồi.',
      output: '2. Hệ thống từ chối file EXE.\n3. Hiển thị lỗi định dạng không hợp lệ. Không upload lên server.'
    },
    {
      to: '画像',
      sub: 'Negative — Drag & Drop file sai định dạng',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật.\n1. Kéo file "document.pdf" thả vào vùng upload.\n2. Quan sát phản hồi.',
      output: '1. File được thả vào.\n2. Hệ thống hiển thị lỗi định dạng. Không chấp nhận file PDF qua drag & drop.'
    },
  ]},

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Validation 併用可否 (Khả năng kết hợp)
  // ──────────────────────────────────────────────────────────────────────────
  { title: '5. Validation 併用可否 (Khả năng kết hợp)', rows: [
    {
      to: '併用可否',
      sub: 'Happy path — Giữ nguyên mặc định 併用不可 (BBJ) và submit',
      input: '[Tiền điều kiện] Đăng nhập CMS với brand BBJ. Vào màn hình Đăng ký coupon sinh nhật. Điền đầy đủ tất cả fields bắt buộc hợp lệ.\n1. Không thay đổi 併用可否 (giữ mặc định 併用不可).\n2. Nhấn 登録.',
      output: '2.\n- Form submit thành công.\n- Coupon được lưu với giá trị 併用可否 = 併用不可.'
    },
    {
      to: '併用可否',
      sub: 'Happy path — Chọn 併用可 và submit',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật. Điền đầy đủ tất cả fields bắt buộc hợp lệ.\n1. Chọn radio 併用可.\n2. Nhấn 登録.',
      output: '1. Radio 併用可 được chọn (filled circle).\n2. Form submit thành công. Coupon được lưu với giá trị 併用可否 = 併用可.'
    },
    {
      to: '併用可否',
      sub: 'Happy path — Chuyển từ 併用不可 sang 併用可',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật.\n1. Quan sát: 併用不可 đang được chọn mặc định.\n2. Click radio 併用可.\n3. Quan sát trạng thái 2 radio.',
      output: '1. 併用不可: filled circle (selected).\n2. Click thành công.\n3.\n- 併用可: filled circle (selected).\n- 併用不可: empty circle (unselected).\n- Chỉ 1 radio được chọn tại 1 thời điểm.'
    },
  ]},

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Optional fields (種類, タイプ名, 利用条件, 利用条件②)
  // ──────────────────────────────────────────────────────────────────────────
  { title: '6. Optional fields (種類, タイプ名, 利用条件, 利用条件②)', rows: [
    {
      to: '種類 + タイプ名',
      sub: 'Submit khi 種類 = 未選択 (không bắt buộc)',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật. Điền đầy đủ tất cả fields bắt buộc hợp lệ.\n1. Giữ nguyên 種類 = "未選択", không nhập タイプ名.\n2. Nhấn 登録.',
      output: '2.\n- Form submit thành công.\n- Không có lỗi validation tại 種類 hay タイプ名.'
    },
    {
      to: '種類 + タイプ名',
      sub: 'タイプ名 luôn nhập được bất kể 種類',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật.\n1. Giữ nguyên 種類 = "未選択".\n2. Click vào text input タイプ名 và nhập "テスト種別名".\n3. Quan sát trạng thái input.',
      output: '2. Input nhận ký tự "テスト種別名" thành công.\n3. Input enabled, không bị disable khi 種類 = 未選択.'
    },
    {
      to: '利用条件',
      sub: 'Boundary — Nhập đúng 255 ký tự (max)',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật. Điền đầy đủ tất cả fields bắt buộc hợp lệ.\n1. Nhập 利用条件: chuỗi "あ" × 255 ký tự.\n2. Nhấn 登録.',
      output: '2.\n- Form submit thành công.\n- 利用条件 được lưu đúng 255 ký tự.'
    },
    {
      to: '利用条件',
      sub: 'Boundary — Nhập 256 ký tự (vượt max)',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật. Điền đầy đủ tất cả fields bắt buộc hợp lệ.\n1. Nhập 利用条件: chuỗi "あ" × 256 ký tự.\n2. Nhấn 登録.',
      output: '2.\n- Hệ thống từ chối nhập quá 255 ký tự (không nhập được ký tự thứ 256) HOẶC hiện lỗi max length.\n- Không submit với 256 ký tự.'
    },
    {
      to: '利用条件②',
      sub: 'Submit không nhập 利用条件② (optional)',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật. Điền đầy đủ tất cả fields bắt buộc hợp lệ.\n1. Để trống 利用条件②.\n2. Nhấn 登録.',
      output: '2.\n- Form submit thành công.\n- Không có lỗi tại 利用条件②.'
    },
    {
      to: '利用条件②',
      sub: 'Boundary — Nhập đúng 255 ký tự (max)',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật. Điền đầy đủ tất cả fields bắt buộc hợp lệ.\n1. Nhập 利用条件②: chuỗi "あ" × 255 ký tự.\n2. Nhấn 登録.',
      output: '2.\n- Form submit thành công.\n- 利用条件② được lưu đúng 255 ký tự.'
    },
  ]},

  // ──────────────────────────────────────────────────────────────────────────
  // 7. Hành vi nút 登録 (Submit)
  // ──────────────────────────────────────────────────────────────────────────
  { title: '7. Hành vi nút 登録 (Đăng ký)', rows: [
    {
      to: '登録',
      sub: 'Happy path — Submit form hợp lệ đầy đủ',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật.\n1. Nhập クーポン名: "誕生日クーポン1月" (hợp lệ)\n2. Upload 画像: "birthday_jan.jpg" (JPG hợp lệ)\n3. Nhập クーポン番号: "00101"\n4. Nhập 生年月: "2026-01" (tháng chưa có coupon)\n5. Giữ nguyên 併用可否: 併用不可 (mặc định)\n6. Nhấn 登録.',
      output: '6.\n- Form được submit thành công.\n- Hệ thống điều hướng về màn hình danh sách coupon sinh nhật.\n- Record vừa tạo hiển thị ở đầu danh sách.'
    },
    {
      to: '登録',
      sub: 'Negative — Submit khi thiếu multiple required fields',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật.\n1. Để trống クーポン名, 画像, クーポン番号, 生年月.\n2. Nhấn 登録.',
      output: '2.\n- Hiển thị đồng thời lỗi required cho tất cả các fields bị thiếu.\n- Form không được submit.\n- Không điều hướng khỏi trang.'
    },
    {
      to: '登録',
      sub: 'Negative — Submit đủ fields nhưng 生年月 trùng tháng',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật. Đã có coupon cho tháng 2026-07.\n1. Điền đầy đủ tất cả fields hợp lệ.\n2. Nhập 生年月: "2026-07".\n3. Nhấn 登録.',
      output: '3.\n- Hiển thị lỗi: "こちらの月に誕生日クーポンを既に登録されました" tại field 生年月.\n- Form không được submit.\n- Các fields khác không bị xóa.'
    },
    {
      to: '登録',
      sub: 'Verify — Tạo coupon cho 12 tháng khác nhau',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Chưa có coupon cho các tháng 1-12.\n1. Tạo lần lượt 12 coupon sinh nhật, mỗi coupon cho 1 tháng (生年月: 2026-01 đến 2026-12), với クーポン番号 khác nhau (00101 → 00112).\n2. Sau khi tạo xong 12 coupon, vào màn hình list.',
      output: '1. Tất cả 12 lần submit đều thành công.\n2.\n- Danh sách hiển thị đủ 12 coupon, mỗi tháng 1 coupon.\n- Không có lỗi uniqueness trong quá trình tạo.'
    },
  ]},

  // ──────────────────────────────────────────────────────────────────────────
  // 8. Hành vi nút 一時保存 (Lưu nháp)
  // ──────────────────────────────────────────────────────────────────────────
  { title: '8. Hành vi nút 一時保存 (Lưu nháp)', rows: [
    {
      to: '一時保存',
      sub: 'Happy path — Lưu nháp khi form rỗng hoàn toàn',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật. Chưa nhập gì.\n1. Nhấn 一時保存.',
      output: '1.\n- Hệ thống lưu nháp thành công, không hiện lỗi validation.\n- Form rỗng được lưu (không validate required fields).'
    },
    {
      to: '一時保存',
      sub: 'Happy path — Lưu nháp khi form nhập một phần',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật.\n1. Chỉ nhập クーポン名: "誕生日クーポン下書き", bỏ trống các fields khác.\n2. Nhấn 一時保存.',
      output: '2.\n- Hệ thống lưu nháp thành công.\n- Không có lỗi validation dù 画像, クーポン番号, 生年月, 併用可否 còn trống.'
    },
    {
      to: '一時保存',
      sub: 'Happy path — Lưu nháp khi form điền đầy đủ',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật. Điền đầy đủ tất cả fields hợp lệ.\n1. Nhấn 一時保存.',
      output: '1.\n- Hệ thống lưu nháp thành công.\n- Trạng thái coupon trong list = 一時保存 (draft), KHÔNG tự động publish.'
    },
  ]},

  // ──────────────────────────────────────────────────────────────────────────
  // 9. Hành vi nút 戻る (Quay lại)
  // ──────────────────────────────────────────────────────────────────────────
  { title: '9. Hành vi nút 戻る (Quay lại)', rows: [
    {
      to: '戻る',
      sub: 'Happy path — Nhấn 戻る khi form rỗng',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật. Chưa nhập gì.\n1. Nhấn nút 戻る.\n2. Quan sát điều hướng.',
      output: '1. Không xuất hiện dialog xác nhận.\n2. Hệ thống điều hướng về màn hình danh sách coupon sinh nhật ngay lập tức.'
    },
    {
      to: '戻る',
      sub: 'Happy path — Nhấn 戻る khi đã nhập dữ liệu chưa lưu',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình Đăng ký coupon sinh nhật.\n1. Nhập クーポン名: "テストクーポン", 生年月: "2026-05".\n2. Nhấn nút 戻る.\n3. Quan sát điều hướng và dữ liệu.',
      output: '2. Không xuất hiện dialog xác nhận ("データが失われます" hoặc tương tự).\n3.\n- Hệ thống điều hướng về màn hình list ngay lập tức.\n- Dữ liệu đã nhập bị mất (không được lưu).'
    },
  ]},
];

(async () => {
  const out = process.argv[2] || path.join(__dirname, '..', '..', '..', 'CMS', 'Testcase', '【CMS】BirthdayCouponRegister.xlsx');
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
