// =============================================================================
// gen_testcase.template.js — SKELETON cho file testcase MỚI
// -----------------------------------------------------------------------------
// CÁCH DÙNG:
//   1. Copy file này, đổi tên thành gen_<feature>.js (vd gen_popup_pizza.js)
//   2. Sửa metadata (FUNCTION_NAME, CREATOR, ...) + SHEET_PREFIX
//   3. Điền guiSection (1 section UI) + logicSections (chia ĐÚNG theo từng mục spec)
//   4. Chạy:  node gen_<feature>.js "<đường-dẫn-output.xlsx>"
//
// LƯỢC ĐỒ LUỒNG (Copy+Fill):
//   - Engine `testcase_builder.js` load template `templates/testcase/app-testcase-template.xlsx`
//   - Clone Home_GUI → `<SHEET_PREFIX>_GUI` và `<SHEET_PREFIX>_LOGIC` (giữ NGUYÊN style/border/font/formula)
//   - Fill data mới vào, auto-merge Test Object trùng theo cụm
//   - Update Summary (common info + detail rows trỏ tới 2 sheet mới)
//
// LƯU Ý FORMAT (theo skill format_testcase):
//   - Mỗi row: { to: 'Test Object', sub: 'Sub Test Object', input: '...', output: '...' }
//   - Các row liên tiếp cùng `to` sẽ tự ĐỘNG MERGE ô Test Object (gọn, không duplicate)
//   - Step trong `input` viết CỤ THỂ từng bước, mở đầu bằng [Tiền điều kiện] ... rồi 1. 2. 3.
//   - logicSections phải chia đúng số mục như spec (1., 2., 3., ...)
//   - Style/màu/border/formula tự clone từ template canonical → KHÔNG cần style thủ công
// =============================================================================

const path = require('path');
const { generateTestcase } = require('../testcase_builder');

const FUNCTION_NAME = 'Tích điểm nhân hệ số';
const CREATOR = 'QuynhNT';
const CREATE_DATE = '2026-07-16';
const RELEASE = '7.4.0';
const DEVICES = ['iOS', 'Android'];
const SHEET_PREFIX = 'PointMultiplier';     // -> PointMultiplier_GUI, PointMultiplier_LOGIC

const guiSection = {
  title: 'Xác nhận hiển thị kết quả tích điểm nhân hệ số',
  rows: [
    { to: 'Màn kết quả tích điểm', sub: 'Hiển thị điểm đã nhân',
      input: '[Tiền điều kiện] Có chiến dịch đang diễn ra (hệ số N). HĐ có ngày phát hành nằm trong khoảng chiến dịch.\n1. Mở app, vào chức năng scan QR tích điểm\n2. Quét QR hóa đơn hợp lệ\n3. Quan sát màn kết quả tích điểm',
      output: '3.\n- Hiển thị số điểm đã cộng = điểm gốc × N\n- Số điểm hiển thị rõ ràng, đúng định dạng' },
    { to: 'Màn kết quả tích điểm', sub: 'Không hiển thị message campaign',
      input: '[Tiền điều kiện] Có chiến dịch đang diễn ra. HĐ nằm trong khoảng chiến dịch.\n1. Quét QR hóa đơn hợp lệ\n2. Quan sát toàn màn kết quả',
      output: '2.\n- KHÔNG có popup/banner/message báo "đang có chiến dịch"\n- Chỉ hiển thị số điểm nhận được' },
    { to: 'Lịch sử tích điểm', sub: 'Hiển thị bản ghi điểm nhân',
      input: '[Tiền điều kiện] Đã tích điểm thành công với chiến dịch (điểm đã nhân hệ số).\n1. Vào màn Lịch sử tích điểm\n2. Quan sát bản ghi vừa tích',
      output: '2.\n- Bản ghi hiển thị số điểm đã nhân\n- Ngày tích điểm hiển thị đúng' },
  ],
};

const logicSections = [
  { title: '1. Luồng tích điểm khi chiến dịch được TẠO MỚI (đang hiệu lực)', rows: [
    // -- Ma trận: NGÀY HÓA ĐƠN × THỜI ĐIỂM TÍCH (chứng minh kết quả chỉ phụ thuộc ngày HĐ) --
    // Nhóm A: HĐ TRONG chiến dịch
    { to: 'HĐ TRONG chiến dịch (theo thời điểm tích)', sub: 'Tích TRONG lúc chiến dịch đang diễn ra → nhân',
      input: '[Tiền điều kiện] HĐ có ngày phát hành nằm TRONG khoảng chiến dịch. User tích điểm khi chiến dịch đang diễn ra.\n1. Quét QR hóa đơn\n2. Kiểm tra điểm',
      output: '2.\n- Được nhân hệ số (ngày HĐ nằm trong khoảng)' },
    { to: 'HĐ TRONG chiến dịch (theo thời điểm tích)', sub: 'Tích SAU khi chiến dịch kết thúc (終了) → vẫn nhân',
      input: '[Tiền điều kiện] HĐ có ngày phát hành nằm TRONG khoảng chiến dịch. Chiến dịch đã kết thúc (chưa bị xóa). User tích điểm sau khi kết thúc (giả định còn trong hạn tích điểm hợp lệ hoặc tích bằng claim).\n1. Quét QR hóa đơn / gửi claim\n2. Kiểm tra điểm',
      output: '2.\n- VẪN được nhân hệ số (phán định theo ngày HĐ, KHÔNG phụ thuộc thời điểm tích)' },
    // Nhóm B: HĐ TRƯỚC chiến dịch — tích ở cả 3 khoảng thời gian (trước / trong / sau)
    { to: 'HĐ TRƯỚC chiến dịch (theo thời điểm tích)', sub: 'Tích TRƯỚC khi chiến dịch bắt đầu → không nhân',
      input: '[Tiền điều kiện] HĐ có ngày phát hành ở KHOẢNG TRƯỚC chiến dịch (trước FROM). User tích điểm khi chiến dịch CHƯA bắt đầu.\n1. Quét QR hóa đơn\n2. Kiểm tra điểm',
      output: '2.\n- KHÔNG nhân, chỉ tích điểm gốc (ngày HĐ ngoài khoảng, thời điểm chưa có chiến dịch)' },
    { to: 'HĐ TRƯỚC chiến dịch (theo thời điểm tích)', sub: 'Tích TRONG lúc chiến dịch đang diễn ra → không nhân',
      input: '[Tiền điều kiện] HĐ có ngày phát hành ở KHOẢNG TRƯỚC chiến dịch (trước FROM). User tích điểm khi chiến dịch ĐANG diễn ra.\n1. Quét QR hóa đơn\n2. Kiểm tra điểm',
      output: '2.\n- KHÔNG nhân, chỉ tích điểm gốc (dù tích trong lúc chiến dịch chạy, ngày HĐ vẫn ngoài khoảng)' },
    { to: 'HĐ TRƯỚC chiến dịch (theo thời điểm tích)', sub: 'Tích SAU khi chiến dịch kết thúc → không nhân',
      input: '[Tiền điều kiện] HĐ có ngày phát hành ở KHOẢNG TRƯỚC chiến dịch (trước FROM). User tích điểm sau khi chiến dịch đã kết thúc.\n1. Quét QR hóa đơn\n2. Kiểm tra điểm',
      output: '2.\n- KHÔNG nhân, chỉ tích điểm gốc (ngày HĐ ngoài khoảng)' },
    // Nhóm C: HĐ SAU chiến dịch
    { to: 'HĐ SAU chiến dịch (theo thời điểm tích)', sub: 'Tích SAU khi chiến dịch kết thúc → không nhân',
      input: '[Tiền điều kiện] HĐ có ngày phát hành ở KHOẢNG SAU chiến dịch (sau TO). User tích điểm sau đó.\n1. Quét QR hóa đơn\n2. Kiểm tra điểm',
      output: '2.\n- KHÔNG nhân, chỉ tích điểm gốc (ngày HĐ ngoài khoảng)' },
    // -- Biên thời gian theo giờ --
    { to: 'Biên thời gian theo đơn vị giờ', sub: 'HĐ ngay trước giờ FROM (phút cuối giờ liền trước)',
      input: '[Tiền điều kiện] FROM của chiến dịch set theo đơn vị giờ. HĐ phát hành vào phút cuối của giờ liền TRƯỚC giờ FROM.\n1. Quét QR hóa đơn\n2. Kiểm tra điểm',
      output: '2.\n- KHÔNG nhân (thời điểm HĐ trước FROM → ngoài khoảng)' },
    { to: 'Biên thời gian theo đơn vị giờ', sub: 'HĐ đúng đầu giờ FROM',
      input: '[Tiền điều kiện] FROM set theo đơn vị giờ. HĐ phát hành đúng đầu giờ FROM (phút 00).\n1. Quét QR hóa đơn\n2. Kiểm tra điểm',
      output: '2.\n- Được nhân hệ số (đúng FROM → trong khoảng)' },
    { to: 'Biên thời gian theo đơn vị giờ', sub: 'HĐ phút cuối của giờ TO (giờ TO còn hiệu lực)',
      input: '[Tiền điều kiện] TO set theo đơn vị giờ → hiệu lực đến phút cuối của giờ đó. HĐ phát hành vào phút cuối của giờ TO.\n1. Quét QR hóa đơn\n2. Kiểm tra điểm',
      output: '2.\n- Được nhân hệ số (vẫn trong hiệu lực của giờ TO)' },
    { to: 'Biên thời gian theo đơn vị giờ', sub: 'HĐ đầu giờ kế tiếp sau giờ TO',
      input: '[Tiền điều kiện] TO set theo đơn vị giờ (hiệu lực hết phút cuối giờ TO). HĐ phát hành đầu giờ KẾ TIẾP sau giờ TO.\n1. Quét QR hóa đơn\n2. Kiểm tra điểm',
      output: '2.\n- KHÔNG nhân (ngoài khoảng)' },
    // -- Kênh tích điểm --
    { to: 'Kênh tích điểm: scan QR vs claim', sub: 'Scan QR: HĐ còn trong hạn QR (≤ 7 ngày)',
      input: '[Tiền điều kiện] HĐ nằm trong khoảng chiến dịch, còn trong hạn QR (≤ 7 ngày kể từ ngày phát hành).\n1. Quét QR hóa đơn trên app\n2. Kiểm tra điểm',
      output: '2.\n- Quét được, nhân hệ số bình thường' },
    { to: 'Kênh tích điểm: scan QR vs claim', sub: 'Scan QR: HĐ quá hạn QR (> 7 ngày) → bị chặn',
      input: '[Tiền điều kiện] HĐ phát hành quá 7 ngày.\n1. Quét QR hóa đơn trên app\n2. Quan sát kết quả',
      output: '2.\n- KHÔNG quét được (QR hết hạn), không tích được điểm nào' },
    { to: 'Kênh tích điểm: scan QR vs claim', sub: 'Claim: HĐ quá 7 ngày vẫn tích được',
      input: '[Tiền điều kiện] HĐ phát hành quá 7 ngày, nằm trong khoảng chiến dịch.\n1. User gửi claim tích điểm với HĐ quá hạn QR\n2. Admin duyệt claim\n3. Kiểm tra điểm',
      output: '3.\n- Vẫn tích được, nhân hệ số (claim không giới hạn 7 ngày)' },
    { to: 'Kênh tích điểm: scan QR vs claim', sub: 'Claim: chiến dịch còn hiệu lực tại thời điểm duyệt → nhân',
      input: '[Tiền điều kiện] HĐ nằm trong khoảng chiến dịch. Chiến dịch chưa bị xóa tại thời điểm admin duyệt claim.\n1. User gửi claim\n2. Admin duyệt claim\n3. Kiểm tra điểm',
      output: '3.\n- Được nhân hệ số (căn cứ ngày HĐ, chiến dịch còn hiệu lực khi duyệt)' },
    // -- Công thức tính điểm --
    { to: 'Công thức tính điểm', sub: 'Hệ số nhân vào số điểm cuối',
      input: '[Tiền điều kiện] Chiến dịch hệ số N. HĐ có điểm gốc là số nguyên.\n1. Quét QR hóa đơn\n2. Kiểm tra điểm',
      output: '2.\n- Điểm nhận = điểm gốc × N (hệ số nhân vào SỐ ĐIỂM CUỐI, điểm gốc là số nguyên)' },
    { to: 'Công thức tính điểm', sub: 'Hệ số biên lớn nhất',
      input: '[Tiền điều kiện] Chiến dịch có hệ số lớn nhất cho phép (giá trị max trong khoảng 2–99).\n1. Quét QR hóa đơn\n2. Kiểm tra điểm',
      output: '2.\n- Điểm nhận = điểm gốc × hệ số max, tính đúng không tràn/sai số' },
    { to: 'Công thức tính điểm', sub: 'Nhiều hóa đơn → tính riêng, không gộp',
      input: '[Tiền điều kiện] User có nhiều HĐ khác ngày phát hành: một số nằm trong khoảng chiến dịch, một số ngoài.\n1. Tích điểm từng HĐ riêng lẻ\n2. Kiểm tra điểm mỗi HĐ',
      output: '2.\n- Mỗi HĐ tính hệ số riêng theo ngày phát hành của nó\n- KHÔNG gộp chung nhiều HĐ' },
  ]},
  { title: '2. Luồng tích điểm khi chiến dịch được SỬA', rows: [
    // -- Sửa hệ số --
    { to: 'Sửa hệ số chiến dịch', sub: 'Đổi hệ số rồi user mới quét → áp dụng hệ số MỚI',
      input: '[Tiền điều kiện] Chiến dịch đang chạy với hệ số cũ. HĐ phát hành khi còn hệ số cũ. User CHƯA tích điểm.\n1. Admin đổi hệ số chiến dịch sang giá trị mới\n2. User quét QR hóa đơn\n3. Kiểm tra điểm',
      output: '3.\n- Điểm nhận theo hệ số MỚI (áp dụng hệ số tại thời điểm quét)' },
    { to: 'Sửa hệ số chiến dịch', sub: 'Đã tích trước khi sửa → điểm giữ nguyên hệ số cũ',
      input: '[Tiền điều kiện] Chiến dịch hệ số cũ. User đã tích điểm với hệ số cũ. Sau đó admin sửa hệ số.\n1. Admin đổi hệ số sang giá trị mới\n2. Kiểm tra lại điểm user đã tích trước đó',
      output: '2.\n- Điểm đã tích giữ nguyên theo hệ số cũ, KHÔNG đổi theo hệ số mới' },
    // -- Sửa thời gian: mở rộng (HĐ ở khoảng trước/sau được kéo vào) --
    { to: 'Sửa thời gian chiến dịch', sub: 'Mở rộng FROM về trước để bao trùm HĐ ở khoảng TRƯỚC → được nhân',
      input: '[Tiền điều kiện] HĐ có ngày phát hành ban đầu nằm ở KHOẢNG TRƯỚC chiến dịch (trước FROM). User chưa tích.\n1. Admin sửa FROM lùi về trước để ngày HĐ nằm TRONG khoảng\n2. User quét QR hóa đơn\n3. Kiểm tra điểm',
      output: '3.\n- Được nhân hệ số (ngày HĐ giờ nằm trong khoảng sau khi mở rộng FROM)' },
    { to: 'Sửa thời gian chiến dịch', sub: 'Mở rộng TO về sau để bao trùm HĐ ở khoảng SAU → được nhân',
      input: '[Tiền điều kiện] HĐ có ngày phát hành ban đầu nằm ở KHOẢNG SAU chiến dịch (sau TO). User chưa tích.\n1. Admin sửa TO kéo về sau để ngày HĐ nằm TRONG khoảng\n2. User quét QR hóa đơn\n3. Kiểm tra điểm',
      output: '3.\n- Được nhân hệ số (ngày HĐ giờ nằm trong khoảng sau khi mở rộng TO)' },
    // -- Sửa thời gian: thu hẹp (HĐ bị đẩy ra khoảng trước/sau) --
    { to: 'Sửa thời gian chiến dịch', sub: 'Thu hẹp FROM đẩy HĐ ra khoảng TRƯỚC → không nhân',
      input: '[Tiền điều kiện] HĐ có ngày phát hành ban đầu TRONG khoảng chiến dịch. User chưa tích.\n1. Admin sửa FROM tiến về sau khiến ngày HĐ rơi vào KHOẢNG TRƯỚC (trước FROM mới)\n2. User quét QR hóa đơn\n3. Kiểm tra điểm',
      output: '3.\n- KHÔNG nhân, chỉ tích điểm gốc (ngày HĐ ở khoảng trước chiến dịch sau khi thu hẹp)' },
    { to: 'Sửa thời gian chiến dịch', sub: 'Thu hẹp TO đẩy HĐ ra khoảng SAU → không nhân',
      input: '[Tiền điều kiện] HĐ có ngày phát hành ban đầu TRONG khoảng chiến dịch. User chưa tích.\n1. Admin sửa TO lùi về trước khiến ngày HĐ rơi vào KHOẢNG SAU (sau TO mới)\n2. User quét QR hóa đơn\n3. Kiểm tra điểm',
      output: '3.\n- KHÔNG nhân, chỉ tích điểm gốc (ngày HĐ ở khoảng sau chiến dịch sau khi thu hẹp)' },
  ]},
  { title: '3. Luồng tích điểm khi chiến dịch bị XÓA (取消済)', rows: [
    { to: 'Điểm đã tích trước khi xóa', sub: 'Tích trước khi xóa → điểm giữ nguyên',
      input: '[Tiền điều kiện] User đã tích điểm (được nhân hệ số) khi chiến dịch còn hiệu lực. Sau đó admin xóa chiến dịch.\n1. Admin xóa chiến dịch\n2. Kiểm tra lại điểm user đã tích trước đó',
      output: '2.\n- Điểm đã tích giữ nguyên, KHÔNG bị rollback' },
    { to: 'Tích điểm sau khi xóa', sub: 'HĐ trong khoảng, scan sau khi xóa → không nhân',
      input: '[Tiền điều kiện] Chiến dịch đã bị xóa. HĐ có ngày phát hành nằm trong khoảng chiến dịch (khoảng gốc trước khi xóa).\n1. User quét QR hóa đơn sau khi chiến dịch bị xóa\n2. Kiểm tra điểm',
      output: '2.\n- KHÔNG nhân, chỉ tích điểm gốc (đã xóa → không áp dụng sau thời điểm xóa)' },
    { to: 'Tích điểm sau khi xóa', sub: 'Claim gửi trước xóa, duyệt SAU xóa → không nhân',
      input: '[Tiền điều kiện] User gửi claim khi chiến dịch còn hiệu lực (HĐ trong khoảng). Admin xóa chiến dịch TRƯỚC khi duyệt claim.\n1. User gửi claim\n2. Admin xóa chiến dịch\n3. Admin duyệt claim\n4. Kiểm tra điểm',
      output: '4.\n- KHÔNG nhân (mốc tính là thời điểm DUYỆT, lúc đó chiến dịch đã xóa)' },
    { to: 'Xóa đồng thời với tích điểm (race)', sub: 'Race → ưu tiên xóa',
      input: '[Tiền điều kiện] Chiến dịch đang hiệu lực. Thao tác xóa chiến dịch và thao tác tích điểm của user diễn ra cùng thời điểm.\n1. Thực hiện tích điểm đồng thời với thao tác xóa chiến dịch\n2. Kiểm tra điểm',
      output: '2.\n- Ưu tiên xóa → KHÔNG nhân, chỉ tích điểm gốc' },
  ]},
];

(async () => {
  // Default output: 【APP】<FeatureName>.xlsx (khớp convention Push gốc trong Test Result/)
  const out = process.argv[2] || path.join(__dirname, `【APP】${FUNCTION_NAME}.xlsx`);
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
