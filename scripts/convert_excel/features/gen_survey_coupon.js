// =============================================================================
// gen_survey_coupon.js — CMS Survey Coupon Register (アンケートクーポン登録)
// Release: CMS | Creator: QuynhNT | Date: 2026-07-15
// Output: CMS/Testcase/【CMS】アンケートクーポン登録.xlsx
// Spec: CMS/Spec/survey_coupon_register_spec_analysis.md
// Assumptions (từ Ambiguities đã clarify):
//   AMB-03: クーポン番号 không unique trong CMS (nhiều coupon có thể cùng mã)
//   AMB-04: 併用可否 không có default selection (optional hoàn toàn)
//   AMB-07: Lỗi クーポン番号 trigger cả khi blur lẫn khi submit
//   AMB-11: 確認 lỗi → hiện inline error đỏ bên dưới field
//   AMB-12: 登録 không bị disabled khi chưa 確認 — submit được, server validates
//   AMB-13: Sau 登録 thành công → navigate về danh sách coupon survey
//   AMB-01: Max length name fields không rõ — test với 200 chars
//   AMB-02: Image format: JPG/PNG; size limit không rõ
//   AMB-05: 一時保存 không validate bắt buộc
//   AMB-06: 戻る hiện confirm dialog khi đã nhập dữ liệu
// =============================================================================

const path = require('path');
const { generateTestcase } = require('../testcase_builder');

const FUNCTION_NAME = 'アンケートクーポン登録';
const CREATOR       = 'QuynhNT';
const CREATE_DATE   = '2026-07-15';
const RELEASE       = 'CMS';
const DEVICES       = ['Chrome', 'Edge'];
const SHEET_PREFIX  = 'Survey_Coupon';

// ─────────────────────────────────────────────────────────────────────────────
// GUI — Layout, labels, visual states
// ─────────────────────────────────────────────────────────────────────────────
const guiSection = {
  title: 'Xác nhận hiển thị màn hình アンケートクーポン登録 (CMS)',
  rows: [
    {
      to: 'Layout form',
      sub: 'Thứ tự và đầy đủ các fields',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình アンケートクーポン登録 (新規登録).\n1. Quan sát toàn bộ form từ trên xuống dưới.',
      output: '1.\n- Hiển thị đủ 10 fields theo thứ tự: クーポン名（管理用）→ クーポン名（公開用）→ 表示場所 → 種類 → 画像 → クーポン番号 → 有効期限 → 併用可否 → 利用条件 → 利用条件②（BB4.7.0以下で対応）.\n- Không thiếu field, không lặp field.\n- Layout 2 cột: cột trái label, cột phải input.'
    },
    {
      to: 'Layout form',
      sub: 'Marker bắt buộc (*) trên các fields required',
      input: '[Tiền điều kiện] Form đang ở trạng thái rỗng.\n1. Quan sát dấu * đỏ trên các field.',
      output: '1.\n- Có dấu * đỏ: クーポン名（公開用）, 表示場所, 画像, クーポン番号, 有効期限 (5 fields).\n- KHÔNG có dấu *: クーポン名（管理用）, 種類, 併用可否, 利用条件, 利用条件② (5 fields).'
    },
    {
      to: '表示場所 badge',
      sub: 'Hiển thị "アンケート" read-only',
      input: '[Tiền điều kiện] Form mới mở.\n1. Quan sát field 表示場所.\n2. Thử click/edit vào badge.',
      output: '1. Field 表示場所 hiển thị badge "アンケート" màu xám nhạt, không có input cursor.\n2. Không thể chỉnh sửa — badge không phản hồi khi click/type.'
    },
    {
      to: '種類 field',
      sub: 'Trạng thái mặc định dropdown + タイプ名',
      input: '[Tiền điều kiện] Form mới mở.\n1. Quan sát field 種類.',
      output: '1.\n- Dropdown hiển thị giá trị mặc định "未選択".\n- Text input "タイプ名" nằm bên phải cùng hàng với dropdown.\n- Cả 2 components hiển thị đúng layout.'
    },
    {
      to: '画像 upload area',
      sub: 'Hiển thị hướng dẫn kích thước và drag & drop',
      input: '[Tiền điều kiện] Form mới mở.\n1. Quan sát khu vực upload 画像.',
      output: '1.\n- Viền đứt bao quanh khu vực upload.\n- Hiển thị text: "ファイルサイズ：980 x 570".\n- Hiển thị text: "ここに画像をドラッグ＆ドロップ".\n- Hiển thị text: "または".\n- Hiển thị nút "ファイルを選択".'
    },
    {
      to: '有効期限 + 確認 button',
      sub: 'Hiển thị input date kèm nút 確認',
      input: '[Tiền điều kiện] Form mới mở.\n1. Quan sát field 有効期限.',
      output: '1.\n- Field 有効期限 hiển thị input date rỗng.\n- Nút "確認" nằm ngay bên phải input 有効期限.\n- Chưa hiển thị text "クーポン管理サーバ上の有効期限：..." vì chưa ấn 確認.'
    },
    {
      to: '併用可否 radio group',
      sub: 'Trạng thái mặc định — không có option nào được chọn',
      input: '[Tiền điều kiện] Form mới mở.\n1. Quan sát field 併用可否.',
      output: '1.\n- Hiển thị 2 radio options: "併用不可" và "併用可".\n- KHÔNG có option nào được chọn mặc định (cả 2 đều unselected).\n- Không có dấu * (field optional).'
    },
    {
      to: 'Action buttons',
      sub: 'Hiển thị 3 nút ở cuối form',
      input: '[Tiền điều kiện] Form mới mở.\n1. Cuộn xuống cuối form, quan sát nút hành động.',
      output: '1.\n- Hiển thị 3 nút nằm ngang: 登録, 一時保存, 戻る.\n- Thứ tự từ trái sang phải: 登録, 一時保存, 戻る.\n- Không thiếu nút nào.'
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LOGIC — Chia theo AC sections trong spec
// ─────────────────────────────────────────────────────────────────────────────
const logicSections = [

  // ════════════════════════════════════════════════════════
  // L1. クーポン名（管理用）— Optional field
  // ════════════════════════════════════════════════════════
  {
    title: 'L1. クーポン名（管理用）— Field optional',
    rows: [
      {
        to: 'クーポン名（管理用）',
        sub: 'Để trống — submit thành công (optional)',
        input: '[Tiền điều kiện] Điền đủ tất cả các fields bắt buộc khác hợp lệ. Để trống クーポン名（管理用）.\n1. Nhấn nút 登録.',
        output: '1. Form submit thành công, không có lỗi liên quan đến クーポン名（管理用）.'
      },
      {
        to: 'クーポン名（管理用）',
        sub: 'Nhập text hợp lệ — submit thành công',
        input: '[Tiền điều kiện] Điền đủ tất cả fields bắt buộc khác hợp lệ.\n1. Nhập "管理テスト_20260715" vào クーポン名（管理用）.\n2. Nhấn nút 登録.',
        output: '2. Form submit thành công. Giá trị クーポン名（管理用）được lưu theo đúng text đã nhập.'
      },
      {
        to: 'クーポン名（管理用）',
        sub: 'Nhập text rất dài (200 ký tự)',
        input: '[Tiền điều kiện] Điền đủ fields bắt buộc khác.\n1. Nhập chuỗi 200 ký tự vào クーポン名（管理用）(vd: "A" × 200).\n2. Quan sát UI và submit.',
        output: '1. Input chấp nhận 200 ký tự không bị truncate trong field.\n2. Không có lỗi liên quan đến độ dài field này (nếu có max-length thì field tự cắt bớt và submit không lỗi vì optional).'
      },
    ],
  },

  // ════════════════════════════════════════════════════════
  // L2. クーポン名（公開用）— Required field
  // ════════════════════════════════════════════════════════
  {
    title: 'L2. クーポン名（公開用）— Field bắt buộc',
    rows: [
      {
        to: 'クーポン名（公開用）',
        sub: 'Để trống — hiện lỗi bắt buộc',
        input: '[Tiền điều kiện] Điền đủ các fields khác hợp lệ. Để trống クーポン名（公開用）.\n1. Nhấn nút 登録.',
        output: '1.\n- Form KHÔNG submit.\n- Hiển thị thông báo lỗi bắt buộc tại field クーポン名（公開用）.\n- Focus về field này.'
      },
      {
        to: 'クーポン名（公開用）',
        sub: 'Nhập chỉ khoảng trắng — hiện lỗi bắt buộc',
        input: '[Tiền điều kiện] Điền đủ các fields khác hợp lệ.\n1. Nhập "   " (3 khoảng trắng) vào クーポン名（公開用）.\n2. Nhấn nút 登録.',
        output: '2.\n- Form KHÔNG submit.\n- Hiển thị thông báo lỗi bắt buộc (whitespace-only không được chấp nhận).'
      },
      {
        to: 'クーポン名（公開用）',
        sub: 'Nhập text hợp lệ — submit thành công',
        input: '[Tiền điều kiện] Điền đủ fields bắt buộc khác hợp lệ.\n1. Nhập "夏のアンケートクーポン2026" vào クーポン名（公開用）.\n2. Nhấn nút 登録.',
        output: '2. Form submit thành công. Tên công khai được lưu đúng.'
      },
      {
        to: 'クーポン名（公開用）',
        sub: 'Nhập ký tự đặc biệt / HTML tag',
        input: '[Tiền điều kiện] Điền đủ fields bắt buộc khác.\n1. Nhập "<script>alert(1)</script>" vào クーポン名（公開用）.\n2. Nhấn nút 登録.',
        output: '2.\n- Nếu submit thành công: hệ thống escape HTML, không execute script, hiển thị như plain text.\n- Nếu reject: hiện thông báo lỗi ký tự không hợp lệ.'
      },
    ],
  },

  // ════════════════════════════════════════════════════════
  // L3. クーポン番号 — Validation 2 tầng
  // ════════════════════════════════════════════════════════
  {
    title: 'L3. クーポン番号 — Validation 2 tầng (length + server)',
    rows: [
      {
        to: 'クーポン番号 — Tầng 1 (length)',
        sub: 'Nhập 4 chữ số → lỗi tầng 1 khi blur',
        input: '[Tiền điều kiện] Form đang mở.\n1. Click vào field クーポン番号.\n2. Nhập "1234" (4 chữ số).\n3. Click ra ngoài field (blur).',
        output: '3.\n- Hiển thị lỗi đỏ dưới field: "5桁で入力してください。"\n- Không gọi API server kiểm tra.'
      },
      {
        to: 'クーポン番号 — Tầng 1 (length)',
        sub: 'Nhập 6 chữ số → lỗi tầng 1 khi blur',
        input: '[Tiền điều kiện] Form đang mở.\n1. Click vào field クーポン番号.\n2. Nhập "123456" (6 chữ số).\n3. Click ra ngoài field (blur).',
        output: '3. Hiển thị lỗi đỏ dưới field: "5桁で入力してください。"'
      },
      {
        to: 'クーポン番号 — Tầng 1 (length)',
        sub: 'Nhập 5 ký tự non-numeric → lỗi format',
        input: '[Tiền điều kiện] Form đang mở.\n1. Nhập "ABCDE" vào クーポン番号.\n2. Click ra ngoài (blur).',
        output: '2. Hiển thị lỗi (chỉ chấp nhận chữ số, không chấp nhận ký tự chữ cái).'
      },
      {
        to: 'クーポン番号 — Tầng 1 (length)',
        sub: 'Nhập ký tự đặc biệt → lỗi format',
        input: '[Tiền điều kiện] Form đang mở.\n1. Nhập "@#$%^" vào クーポン番号.\n2. Click ra ngoài (blur).',
        output: '2. Hiển thị lỗi format — không chấp nhận ký tự đặc biệt.'
      },
      {
        to: 'クーポン番号 — Tầng 2 (server)',
        sub: 'Nhập 5 chữ số không tồn tại trên server → lỗi tầng 2 khi blur',
        input: '[Tiền điều kiện] Form đang mở.\n1. Nhập "07766" vào クーポン番号 (5 chữ số, không tồn tại trên coupon server).\n2. Click ra ngoài field (blur).',
        output: '2. Hiển thị lỗi đỏ: "正しいクーポンNoを入力してください。"\nKhông có lỗi tầng 1 (độ dài đúng).'
      },
      {
        to: 'クーポン番号 — Tầng 2 (server)',
        sub: 'Nhập 5 chữ số hợp lệ trên server → không lỗi khi blur',
        input: '[Tiền điều kiện] Form đang mở.\n1. Nhập "00328" vào クーポン番号 (5 chữ số hợp lệ trên server).\n2. Click ra ngoài field (blur).',
        output: '2. Không hiển thị lỗi. Field hợp lệ.'
      },
      {
        to: 'クーポン番号 — Submit validation',
        sub: 'Để trống クーポン番号 + submit → lỗi bắt buộc',
        input: '[Tiền điều kiện] Điền đủ fields khác. Để trống クーポン番号.\n1. Nhấn nút 登録.',
        output: '1.\n- Form KHÔNG submit.\n- Hiển thị lỗi required tại field クーポン番号.'
      },
      {
        to: 'クーポン番号 — Submit validation',
        sub: 'Nhập 4 chữ số + submit (chưa blur) → lỗi tầng 1',
        input: '[Tiền điều kiện] Điền đủ fields khác hợp lệ.\n1. Nhập "1234" vào クーポン番号 (không blur).\n2. Nhấn ngay nút 登録.',
        output: '2.\n- Form KHÔNG submit.\n- Hiển thị lỗi tầng 1: "5桁で入力してください。" tại field クーポン番号.'
      },
      {
        to: 'クーポン番号 — Submit validation',
        sub: 'Nhập 5 chữ số invalid + submit → lỗi tầng 2',
        input: '[Tiền điều kiện] Điền đủ fields khác hợp lệ.\n1. Nhập "07766" vào クーポン番号.\n2. Nhấn nút 登録.',
        output: '2.\n- Form KHÔNG submit.\n- Hiển thị lỗi: "正しいクーポンNoを入力してください。"'
      },
      {
        to: 'クーポン番号 — Boundary',
        sub: 'BVA: Nhập đúng biên 5 chữ số hợp lệ',
        input: '[Tiền điều kiện] Test data: クーポン番号 hợp lệ trên server.\n1. Nhập chính xác 5 chữ số hợp lệ vào クーポン番号.\n2. Blur ra ngoài.',
        output: '2. Không có lỗi. Field hợp lệ — pass cả tầng 1 và tầng 2.'
      },
    ],
  },

  // ════════════════════════════════════════════════════════
  // L4. 有効期限 + 確認 — Server lookup flow
  // ════════════════════════════════════════════════════════
  {
    title: 'L4. 有効期限 + 確認 — Server lookup flow',
    rows: [
      {
        to: '有効期限 + 確認',
        sub: 'Happy path — 確認 thành công, hiển thị date từ server',
        input: '[Tiền điều kiện] Đã nhập クーポン番号 hợp lệ "00328".\n1. Nhập ngày "2030-12-02" vào field 有効期限.\n2. Nhấn nút 確認.',
        output: '2.\n- Không hiển thị lỗi.\n- Hiển thị text bên phải nút 確認: "クーポン管理サーバ上の有効期限：2030-12-02"\n- Text hiển thị ngay sau khi API trả về.'
      },
      {
        to: '有効期限 + 確認',
        sub: 'クーポン番号 invalid khi ấn 確認 → inline error',
        input: '[Tiền điều kiện] Form đang mở. Nhập クーポン番号 = "07766" (invalid).\n1. Nhập ngày bất kỳ vào 有効期限.\n2. Nhấn nút 確認.',
        output: '2.\n- Hiển thị lỗi inline đỏ liên quan đến クーポン番号 không hợp lệ: "正しいクーポンNoを入力してください。"\n- Không hiển thị text "クーポン管理サーバ上の有効期限：..."'
      },
      {
        to: '有効期限 + 確認',
        sub: 'Để trống 有効期限 + ấn 確認',
        input: '[Tiền điều kiện] Đã nhập クーポン番号 hợp lệ.\n1. Để trống field 有効期限.\n2. Nhấn nút 確認.',
        output: '2. Hiển thị lỗi bắt buộc tại 有効期限 hoặc không kích hoạt API call (require date input trước).'
      },
      {
        to: '有効期限 + 確認',
        sub: 'Coupon server không khả dụng khi 確認 → inline error',
        input: '[Tiền điều kiện] Coupon management server đang offline/timeout. Đã nhập クーポン番号 và 有効期限 hợp lệ.\n1. Nhấn nút 確認.',
        output: '1.\n- Hiển thị thông báo lỗi inline (error đỏ) khi server không trả về.\n- Không hiển thị text "クーポン管理サーバ上の有効期限：..."\n- Không crash trang.'
      },
      {
        to: '有効期限 + 確認',
        sub: 'Submit mà không ấn 確認 — server validates khi 登録',
        input: '[Tiền điều kiện] Điền đủ tất cả fields bắt buộc bao gồm 有効期限 hợp lệ. Không nhấn 確認.\n1. Nhấn nút 登録 luôn.',
        output: '1.\n- 登録 không bị disabled, vẫn cho submit.\n- Server thực hiện validate 有効期限 và クーポン番号 trong quá trình 登録.\n- Nếu hợp lệ: submit thành công.\n- Nếu không hợp lệ: hiển thị lỗi inline tương ứng.'
      },
      {
        to: '有効期限 + 確認',
        sub: '確認 nhiều lần liên tiếp — không gây lỗi',
        input: '[Tiền điều kiện] Đã nhập クーポン番号 và 有効期限 hợp lệ.\n1. Nhấn nút 確認 lần 1 → quan sát kết quả.\n2. Nhấn nút 確認 lần 2 ngay sau đó.',
        output: '1. Hiển thị "クーポン管理サーバ上の有効期限：[date]".\n2.\n- Kết quả cũ được clear/update.\n- Hiển thị lại "クーポン管理サーバ上の有効期限：[date]" đúng.\n- Không có duplicate text hay lỗi giao diện.'
      },
    ],
  },

  // ════════════════════════════════════════════════════════
  // L5. 画像 — File upload
  // ════════════════════════════════════════════════════════
  {
    title: 'L5. 画像 — File upload (bắt buộc)',
    rows: [
      {
        to: '画像 upload',
        sub: 'Upload ảnh JPG hợp lệ qua nút ファイルを選択',
        input: '[Tiền điều kiện] Form đang mở.\n1. Nhấn nút "ファイルを選択".\n2. Chọn file ảnh JPG kích thước 980×570 (≤ 5MB).\n3. Quan sát sau khi chọn file.',
        output: '3.\n- Ảnh preview hiển thị trong vùng upload.\n- Không có thông báo lỗi.\n- Tên file hoặc thumbnail hiển thị.'
      },
      {
        to: '画像 upload',
        sub: 'Drag & drop ảnh hợp lệ vào vùng upload',
        input: '[Tiền điều kiện] Form đang mở.\n1. Kéo file ảnh JPG/PNG 980×570 thả vào vùng upload.\n2. Quan sát.',
        output: '2.\n- Ảnh được accept và hiển thị preview.\n- Tương đương với dùng nút ファイルを選択.\n- Không có lỗi.'
      },
      {
        to: '画像 upload',
        sub: 'Submit không upload ảnh → lỗi required',
        input: '[Tiền điều kiện] Điền đủ fields bắt buộc khác hợp lệ. Để trống 画像 (không upload).\n1. Nhấn nút 登録.',
        output: '1.\n- Form KHÔNG submit.\n- Hiển thị thông báo lỗi required tại field 画像.'
      },
      {
        to: '画像 upload',
        sub: 'Upload file không phải ảnh (PDF, TXT) → lỗi định dạng',
        input: '[Tiền điều kiện] Form đang mở.\n1. Nhấn ファイルを選択 và chọn file "test_document.pdf".\n2. Quan sát phản hồi.',
        output: '2. Hiển thị thông báo lỗi định dạng file không được hỗ trợ. File không được upload.'
      },
      {
        to: '画像 upload',
        sub: 'Upload ảnh sai kích thước (không phải 980×570)',
        input: '[Tiền điều kiện] Form đang mở.\n1. Upload ảnh JPG kích thước 200×200 (sai kích thước).\n2. Quan sát phản hồi.',
        output: '2. Hệ thống hiển thị cảnh báo về kích thước không đúng (980×570) hoặc reject file.'
      },
    ],
  },

  // ════════════════════════════════════════════════════════
  // L6. 種類 + タイプ名 — Optional fields
  // ════════════════════════════════════════════════════════
  {
    title: 'L6. 種類 + タイプ名 — Fields optional',
    rows: [
      {
        to: '種類 + タイプ名',
        sub: 'Để mặc định "未選択" + để trống タイプ名 → submit OK',
        input: '[Tiền điều kiện] Điền đủ fields bắt buộc khác hợp lệ. Giữ 種類 = "未選択", タイプ名 = trống.\n1. Nhấn nút 登録.',
        output: '1. Form submit thành công. Không có lỗi liên quan 種類 hoặc タイプ名.'
      },
      {
        to: '種類 + タイプ名',
        sub: 'Chọn 種類 option + nhập タイプ名 → submit OK',
        input: '[Tiền điều kiện] Điền đủ fields bắt buộc khác hợp lệ.\n1. Chọn một option hợp lệ trong dropdown 種類.\n2. Nhập "テスト種類A" vào ô タイプ名.\n3. Nhấn nút 登録.',
        output: '3. Submit thành công. Giá trị 種類 và タイプ名 được lưu đúng.'
      },
      {
        to: '種類 + タイプ名',
        sub: 'Nhập タイプ名 mà không chọn 種類 → submit OK',
        input: '[Tiền điều kiện] Điền đủ fields bắt buộc khác hợp lệ.\n1. Giữ 種類 = "未選択".\n2. Nhập "テスト" vào タイプ名.\n3. Nhấn nút 登録.',
        output: '3. Submit thành công (cả 2 fields optional).'
      },
    ],
  },

  // ════════════════════════════════════════════════════════
  // L7. 併用可否 — Optional radio
  // ════════════════════════════════════════════════════════
  {
    title: 'L7. 併用可否 — Radio group optional',
    rows: [
      {
        to: '併用可否',
        sub: 'Không chọn radio nào → submit OK (optional)',
        input: '[Tiền điều kiện] Điền đủ fields bắt buộc khác hợp lệ. Không chọn 併用可否.\n1. Nhấn nút 登録.',
        output: '1. Submit thành công. 併用可否 không cần bắt buộc chọn.'
      },
      {
        to: '併用可否',
        sub: 'Chọn 併用不可 → submit OK',
        input: '[Tiền điều kiện] Điền đủ fields bắt buộc khác hợp lệ.\n1. Chọn radio "併用不可".\n2. Nhấn nút 登録.',
        output: '2. Submit thành công. Giá trị "併用不可" được lưu.'
      },
      {
        to: '併用可否',
        sub: 'Chọn 併用可 → submit OK',
        input: '[Tiền điều kiện] Điền đủ fields bắt buộc khác hợp lệ.\n1. Chọn radio "併用可".\n2. Nhấn nút 登録.',
        output: '2. Submit thành công. Giá trị "併用可" được lưu.'
      },
    ],
  },

  // ════════════════════════════════════════════════════════
  // L8. 登録 — Full submit flow (HIGH RISK)
  // ════════════════════════════════════════════════════════
  {
    title: 'L8. 登録 — Full submit flow',
    rows: [
      {
        to: '登録 — Happy path',
        sub: 'Điền đủ tất cả fields bắt buộc + 確認 thành công → submit OK',
        input: '[Tiền điều kiện] Chuẩn bị: クーポン名（公開用）= "夏クーポン2026", 画像 = ảnh JPG 980×570, クーポン番号 = "00328" (hợp lệ), 有効期限 = "2030-12-02" đã 確認 thành công.\n1. Nhấn nút 登録.',
        output: '1.\n- Form submit thành công.\n- Hệ thống navigate về danh sách coupon survey (アンケートクーポン一覧).\n- Coupon mới xuất hiện trong danh sách.'
      },
      {
        to: '登録 — Validation tổng hợp',
        sub: 'Tất cả fields bắt buộc trống → hiện tất cả lỗi',
        input: '[Tiền điều kiện] Form rỗng hoàn toàn (không nhập gì).\n1. Nhấn nút 登録.',
        output: '1.\n- Form KHÔNG submit.\n- Hiển thị lỗi required tại tất cả fields bắt buộc: クーポン名（公開用）, 画像, クーポン番号, 有効期限.\n- Tất cả lỗi hiện cùng lúc (không phải từng cái).'
      },
      {
        to: '登録 — Validation tổng hợp',
        sub: 'Thiếu chỉ クーポン名（公開用）→ lỗi targeted',
        input: '[Tiền điều kiện] Điền đủ fields khác hợp lệ. Để trống クーポン名（公開用）.\n1. Nhấn nút 登録.',
        output: '1.\n- Form KHÔNG submit.\n- Chỉ hiển thị lỗi tại field クーポン名（公開用）.\n- Các fields khác không hiển thị lỗi.'
      },
      {
        to: '登録 — Validation tổng hợp',
        sub: 'Thiếu chỉ 画像 → lỗi targeted',
        input: '[Tiền điều kiện] Điền đủ fields khác hợp lệ. Không upload 画像.\n1. Nhấn nút 登録.',
        output: '1.\n- Form KHÔNG submit.\n- Chỉ hiển thị lỗi required tại field 画像.'
      },
      {
        to: '登録 — Validation tổng hợp',
        sub: 'Thiếu chỉ 有効期限 → lỗi targeted',
        input: '[Tiền điều kiện] Điền đủ fields khác hợp lệ. Để trống 有効期限.\n1. Nhấn nút 登録.',
        output: '1.\n- Form KHÔNG submit.\n- Hiển thị lỗi required tại field 有効期限.'
      },
      {
        to: '登録 — Validation tổng hợp',
        sub: 'クーポン番号 invalid (4 digits) → lỗi tầng 1 khi submit',
        input: '[Tiền điều kiện] Điền đủ fields khác hợp lệ. Nhập "1234" vào クーポン番号.\n1. Nhấn nút 登録.',
        output: '1.\n- Form KHÔNG submit.\n- Hiển thị lỗi: "5桁で入力してください。"'
      },
      {
        to: '登録 — Validation tổng hợp',
        sub: 'クーポン番号 invalid trên server → lỗi tầng 2 khi submit',
        input: '[Tiền điều kiện] Điền đủ fields khác hợp lệ. Nhập クーポン番号 = "07766" (5 digits, không tồn tại server).\n1. Nhấn nút 登録.',
        output: '1.\n- Form KHÔNG submit.\n- Hiển thị lỗi tầng 2: "正しいクーポンNoを入力してください。"'
      },
      {
        to: '登録 — Submit without 確認',
        sub: 'Submit không 確認 với data hợp lệ → server validates thành công',
        input: '[Tiền điều kiện] Điền đủ fields bắt buộc: クーポン番号 = "00328" (hợp lệ), 有効期限 = "2030-12-02". KHÔNG nhấn 確認.\n1. Nhấn nút 登録 luôn.',
        output: '1.\n- Server validate 有効期限 + クーポン番号 trong quá trình 登録.\n- Nếu hợp lệ: submit thành công → navigate về list.\n- 登録 KHÔNG bị disabled.'
      },
    ],
  },

  // ════════════════════════════════════════════════════════
  // L9. 一時保存 — Draft save
  // ════════════════════════════════════════════════════════
  {
    title: 'L9. 一時保存 — Lưu nháp',
    rows: [
      {
        to: '一時保存',
        sub: 'Lưu nháp form rỗng — không validate',
        input: '[Tiền điều kiện] Form đang hoàn toàn rỗng.\n1. Nhấn nút 一時保存.',
        output: '1.\n- 一時保存 không thực hiện full validation (không cần fields bắt buộc đủ).\n- Hiển thị thông báo lưu nháp thành công (hoặc navigate về list ở trạng thái draft).\n- Không hiển thị lỗi required.'
      },
      {
        to: '一時保存',
        sub: 'Lưu nháp với dữ liệu nhập một phần',
        input: '[Tiền điều kiện] Đã nhập クーポン名（公開用）= "テスト" và クーポン番号 = "00328". Các fields khác trống.\n1. Nhấn nút 一時保存.',
        output: '1.\n- Lưu nháp thành công.\n- Dữ liệu đã nhập được lưu đúng (クーポン名、クーポン番号).\n- Các fields chưa nhập được lưu là null/trống.'
      },
      {
        to: '一時保存',
        sub: 'Lưu nháp với đầy đủ dữ liệu bắt buộc — lưu không publish',
        input: '[Tiền điều kiện] Điền đủ tất cả fields bắt buộc hợp lệ.\n1. Nhấn nút 一時保存 (không nhấn 登録).',
        output: '1.\n- Lưu nháp thành công.\n- Coupon được lưu ở trạng thái draft (一時保存), không ở trạng thái published.\n- Nếu navigate về list: coupon xuất hiện với status 一時保存.'
      },
    ],
  },

  // ════════════════════════════════════════════════════════
  // L10. 戻る — Navigation
  // ════════════════════════════════════════════════════════
  {
    title: 'L10. 戻る — Điều hướng quay lại',
    rows: [
      {
        to: '戻る',
        sub: 'Nhấn 戻る khi form rỗng — không hiện dialog',
        input: '[Tiền điều kiện] Form vừa mở, chưa nhập bất kỳ dữ liệu nào.\n1. Nhấn nút 戻る.',
        output: '1.\n- Navigate về màn hình trước (danh sách coupon survey).\n- Không hiện confirmation dialog vì chưa có dữ liệu thay đổi.'
      },
      {
        to: '戻る',
        sub: 'Nhấn 戻る khi đã nhập dữ liệu — hiện confirm dialog',
        input: '[Tiền điều kiện] Đã nhập クーポン名（公開用）= "テスト" (chưa lưu).\n1. Nhấn nút 戻る.',
        output: '1.\n- Hiển thị confirmation dialog cảnh báo có dữ liệu chưa lưu.\n- Dialog có 2 nút: Confirm (OK/はい) và Cancel (いいえ/キャンセル).\n- Không navigate ngay.'
      },
      {
        to: '戻る',
        sub: 'Confirm dialog → OK → navigate về list',
        input: '[Tiền điều kiện] Đã nhập dữ liệu, dialog confirm đang hiển thị.\n1. Nhấn "OK" (hoặc "はい") trong dialog.',
        output: '1.\n- Navigate về danh sách coupon survey.\n- Dữ liệu vừa nhập bị discard (không lưu).'
      },
      {
        to: '戻る',
        sub: 'Confirm dialog → Cancel → ở lại form',
        input: '[Tiền điều kiện] Đã nhập dữ liệu, dialog confirm đang hiển thị.\n1. Nhấn "Cancel" (hoặc "いいえ") trong dialog.',
        output: '1.\n- Dialog đóng lại.\n- Ở lại màn hình form, dữ liệu vừa nhập KHÔNG bị mất.'
      },
    ],
  },
];

(async () => {
  const out = process.argv[2] || path.join(__dirname, `【CMS】${FUNCTION_NAME}.xlsx`);
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
