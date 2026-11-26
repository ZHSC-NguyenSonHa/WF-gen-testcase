const path = require('path');
const { generateTestcase } = require('../testcase_builder');

// Dùng file 【APP】Popup Claim.xlsx làm template để clone style/border
const TEMPLATE = path.resolve(__dirname, '../../../Test Result/7.4.0/App/Base Popup/【APP】Popup Claim.xlsx');
const TEMPLATE_GUI_SHEET = 'Popup_Claim_GUI';
const TEMPLATE_EXTRA_SHEETS = ['Popup_Claim_GUI', 'Popup_Claim_LOGIC'];

const FUNCTION_NAME = 'CMS スプラッシュ一覧';
const CREATOR = 'QuynhNT';
const CREATE_DATE = '2026-07-07';
const RELEASE = 'CMS-1.0';
const DEVICES = ['Browser'];
const SHEET_PREFIX = 'Splash_List';

/* ============================================================
   GUI — kiểm tra hiển thị / layout / label
   ============================================================ */
const guiSection = {
  title: 'GUI - Kiểm tra hiển thị / Layout / Label (スプラッシュ一覧)',
  rows: [
    // --- Layout (merge to = 'Layout') ---
    { to: 'Layout', sub: '7 cột theo đúng thứ tự',
      input: '[Tiền ĐK] Admin đã đăng nhập CMS, có ít nhất 1 splash tồn tại.\n1. Vào màn hình スプラッシュ一覧.\n2. Quan sát bảng danh sách.',
      output: '1. Màn hình スプラッシュ一覧 hiển thị thành công.\n2.\n- Bảng hiển thị đúng 7 cột theo thứ tự: 編集 | ID | 件名 | 画像 | 表示期間 | 表示頻度 | ステータス.\n- Tên cột hiển thị đúng label như spec.' },
    { to: 'Layout', sub: 'Nút [\u65b0\u898f\u767b\u9332] luôn hiển thị góc trên phải',
      input: '[Tiền ĐK] Admin đã đăng nhập CMS.\n1. Vào màn hình スプラッシュ一覧.\n2. Quan sát góc trên phải.',
      output: '1. Màn hình スプラッシュ一覧 hiển thị thành công.\n2.\n- Nút [新規登録] màu xám hiển thị ở góc trên phải.\n- Nút luôn hiển thị bất kể có hay không có data.' },
    { to: 'Layout', sub: 'Nút 取消 (đỏ) + 編集 (xám) có trên mọi dòng',
      input: '[Tiền ĐK] Có ít nhất 1 splash trong danh sách.\n1. Quan sát cột 編集 của mỗi dòng.\n2. Kiểm tra màu sắc các nút.',
      output: '1.\n- Nút [取消] hiển thị trên mỗi dòng.\n- Nút [編集] hiển thị trên mỗi dòng.\n- Cả 2 nút hiển thị bất kể trạng thái.\n2.\n- Nút [取消] màu đỏ.\n- Nút [編集] màu xám.' },
    // --- Row Color ---
    { to: 'Row Color - 一時保存', sub: 'Dòng trạng thái 一時保存 nền xanh lá nhạt',
      input: '[Tiền ĐK] Có ít nhất 1 splash trạng thái 一時保存.\n1. Lọc để hiện splash 一時保存.\n2. Quan sát màu nền dòng.',
      output: '1. Danh sách hiển thị các splash 一時保存.\n2.\n- Dòng 一時保存 được tô nền XANH LÁ NHẠT.\n- Dòng trạng thái khác (表示中 v.v.) nền trắng bình thường.' },
    // --- Cột 画像 (merge to = 'Cột 画像') ---
    { to: 'Cột 画像', sub: 'Ảnh bị xóa — hiển fallback text',
      input: '[Tiền ĐK] Có splash có ảnh đã bị xóa khỏi storage.\n1. Quan sát cột 画像 của dòng splash đó.',
      output: '1.\n- Hiển thị text: この画像は削除されました。\n- Text màu đỏ/tím.\n- Trang KHÔNG bị crash.' },
    { to: 'Cột 画像', sub: 'Chưa upload ảnh — hiển "-"',
      input: '[Tiền ĐK] Có splash chưa upload ảnh.\n1. Quan sát cột 画像.',
      output: '1.\n- Cột 画像 hiển thị ký tự "-".\n- Không hiển thị broken image icon.' },
    // --- Cột 表示期間 (merge to = 'Cột 表示期間') ---
    { to: 'Cột 表示期間', sub: 'Format YY/MM/DD(曜日) HH:mm khi có ngày',
      input: '[Tiền ĐK] Có splash có cài đặt 表示期間.\n1. Quan sát giá trị cột 表示期間.',
      output: '1.\n- Format: YY/MM/DD(曜日) HH:mm ~ YY/MM/DD(曜日) HH:mm.\n- Ví dụ: 26/07/07(火) 00:00 ~ 26/07/09(木) 00:00.\n- (曜日) hiển thị đúng thứ trong tuần.' },
    { to: 'Cột 表示期間', sub: 'Chưa set 表示期間 — hiển "-"',
      input: '[Tiền ĐK] Có splash bản nháp chưa set 表示期間.\n1. Quan sát cột 表示期間.',
      output: '1. Cột 表示期間 hiển thị "-".' },
    // --- Cột 表示頻度 (merge to = 'Cột 表示頻度') ---
    { to: 'Cột 表示頻度', sub: '3 giá trị: 毎回 / 1回限り / 1回/日',
      input: '[Tiền ĐK] Có 3 splash với 表示頻度 khác nhau (毎回, 1回限り, 1回/日).\n1. Quan sát cột 表示頻度 của từng dòng.',
      output: '1.\n- Dòng 毎回: hiển thị "毎回".\n- Dòng 1回限り: hiển thị "1回限り".\n- Dòng 1回/日: hiển thị "1回/日".' },
    { to: 'Cột 表示頻度', sub: 'Chưa set 表示頻度 — hiển "-"',
      input: '[Tiền ĐK] Có splash chưa set 表示頻度.\n1. Quan sát cột 表示頻度.',
      output: '1. Cột 表示頻度 hiển thị "-".' },
    // --- Empty State ---
    { to: 'Empty State', sub: 'Thông báo khi không có kết quả',
      input: '[Tiền ĐK] Nhập 件名 không tồn tại để filter trả về 0 kết quả.\n1. Quan sát vùng bảng.',
      output: '1.\n- Hiển thị text: 該当データがありません。\n- KHÔNG hiển thị bảng rỗng hay hàng trống.\n- Text căn giữa vùng danh sách.' },
    // --- Pagination Counter ---
    { to: 'Pagination Counter', sub: 'Hiển thị X-Y/Z件 ở góc trên phải',
      input: '[Tiền ĐK] Có splash thỏa mãn bộ lọc hiện tại.\n1. Quan sát indicator ở góc trên phải vùng bảng.',
      output: '1.\n- Hiển thị dạng: X-Y/Z件 (ví dụ: 1-14/14件, 1-50/100件).\n- Giá trị chính xác tương ứng số bản ghi.' },
  ],
};

/* ============================================================
   LOGIC SECTIONS
   Rule 4: to giống nhau → auto-merge ô Test Object theo cụm
   Rule 5b: số thứ tự Expected phải khớp số bước Action (không đếm Tiền ĐK)
   ============================================================ */
const logicSections = [
  {
    title: '1. Bộ Lọc Tìm Kiếm (件名 / 表示期間 / Checkbox trạng thái)',
    rows: [
      // --- Filter Mặc Định ---
      { to: 'Filter Mặc Định', sub: '3 checkbox được tích, 2 không tích khi load lần đầu',
        input: '[Tiền ĐK] Admin lần đầu truy cập màn hình スプラッシュ一覧.\n1. Quan sát trạng thái 5 checkbox Trạng thái.',
        output: '1.\n- 表示中: ĐƯỢC tích.\n- 表示前: ĐƯỢC tích.\n- 一時保存: ĐƯỢC tích.\n- 表示終了: KHÔNG tích.\n- 取消済: KHÔNG tích.' },
      // --- Filter 件名 (merge) ---
      { to: 'Filter 件名', sub: 'Có kết quả — partial match',
        input: '[Tiền ĐK] Có splash tên "XCVX".\n1. Nhập "XCV" vào ô 件名.\n2. Quan sát kết quả.',
        output: '1. Hệ thống tiếp nhận giá trị tìm kiếm.\n2.\n- Chỉ hiển thị splash có 件名 chứa "XCV".\n- "XCVX" xuất hiện trong kết quả.\n- Counter X-Y/Z件 cập nhật chính xác.' },
      { to: 'Filter 件名', sub: 'Không kết quả — empty state',
        input: '[Tiền ĐK] Không có splash tên chứa "ZZZNOTTHERE999".\n1. Nhập "ZZZNOTTHERE999" vào ô 件名.\n2. Quan sát bảng.',
        output: '1. Hệ thống tiếp nhận giá trị tìm kiếm.\n2.\n- Hiển thị: 該当データがありません。\n- Counter 0/0 hoặc tương đương.' },
      { to: 'Filter 件名', sub: 'Bỏ trống — kết quả theo checkbox',
        input: '[Tiền ĐK] Có nhiều splash.\n1. Để trống ô 件名.\n2. Giữ checkbox mặc định.\n3. Quan sát kết quả.',
        output: '1. Ô 件名 trống, không có giá trị filter.\n2. Các checkbox giữ nguyên mặc định.\n3.\n- Kết quả chỉ theo checkbox Trạng thái.\n- Tất cả splash thỏa mãn checkbox được hiển thị.' },
      // --- Filter 表示期間 (merge) ---
      { to: 'Filter 表示期間', sub: 'Splash overlap với khoảng lọc — có kết quả',
        input: '[Tiền ĐK] Có splash 表示期間 = 26/07/01~26/07/31.\n1. Đặt 表示期間 lọc từ=26/07/15, đến=26/07/20.\n2. Quan sát kết quả.',
        output: '1. Bộ lọc 表示期間 được đặt với khoảng 15~20/07.\n2.\n- Splash overlap với 15~20/7 ĐƯỢC hiển thị.\n- Counter chính xác.' },
      { to: 'Filter 表示期間', sub: 'Không overlap — empty state',
        input: '[Tiền ĐK] Splash có ngày trước 26/01/01.\n1. Đặt lọc từ=26/12/01, đến=26/12/31.\n2. Quan sát.',
        output: '1. Bộ lọc 表示期間 được đặt với khoảng 12/2026.\n2. Hiển thị: 該当データがありません。' },
      // --- Filter Status (merge) ---
      { to: 'Filter Status (Checkbox)', sub: 'Tích thêm 表示終了 → kết quả tăng',
        input: '[Tiền ĐK] Có splash 表示終了.\n1. Từ mặc định, tích thêm 表示終了.\n2. Quan sát kết quả.',
        output: '1. Checkbox 表示終了 được tích thêm.\n2.\n- Danh sách tăng thêm splash 表示終了.\n- Counter tăng tương ứng.' },
      { to: 'Filter Status (Checkbox)', sub: 'Bỏ tất cả checkbox → trả về TẤT CẢ',
        input: '[Tiền ĐK] Có splash nhiều trạng thái.\n1. Bỏ tích TẤT CẢ 5 checkbox.\n2. Quan sát kết quả.',
        output: '1. Tất cả 5 checkbox Trạng thái đều bỏ tích.\n2.\n- Hệ thống trả về TẤT CẢ splash.\n- Không lọc theo trạng thái.' },
      // --- Filter Kết Hợp ---
      { to: 'Filter Kết Hợp', sub: '件名 + 表示期間 + checkbox cùng lúc',
        input: '[Tiền ĐK] Có nhiều splash đa dạng.\n1. Nhập 1 phần tên vào 件名.\n2. Đặt khoảng 表示期間.\n3. Chỉ giữ tích 表示中.\n4. Quan sát.',
        output: '1. Ô 件名 có giá trị tìm kiếm.\n2. Bộ lọc 表示期間 có khoảng thời gian.\n3. Chỉ checkbox 表示中 được tích.\n4.\n- Chỉ hiển thị splash ĐỒNG THỜI thỏa mãn: tên khớp AND overlap ngày AND trạng thái 表示中.' },
      // --- Filter Reload ---
      { to: 'Filter Reload', sub: 'Reload → filter reset về mặc định',
        input: '[Tiền ĐK] Đã thay đổi bộ lọc khỏi mặc định.\n1. Reload trang (F5).\n2. Quan sát bộ lọc.',
        output: '1. Trang được tải lại.\n2.\n- Filter reset: 表示中+表示前+一時保存 tích, 表示終了+取消済 bỏ tích.\n- Ô 件名 và 表示期間 trống.' },
    ],
  },
  {
    title: '2. Hiển Thị Danh Sách (Sort / Phân trang)',
    rows: [
      // --- Sort ---
      { to: 'Sort Theo ID', sub: 'ID lớn lên đầu — mặc định',
        input: '[Tiền ĐK] Có ít nhất 5 splash ID khác nhau.\n1. Vào màn hình スプラッシュ一覧.\n2. Quan sát thứ tự ID.',
        output: '1. Màn hình hiển thị danh sách.\n2.\n- ID sắp xếp GIẢM DẦN (lớn nhất lên đầu).\n- Không phụ thuộc trạng thái.\n- Ví dụ: 6336, 1801, 1793... (giảm dần).' },
      // --- Phân Trang (merge) ---
      { to: 'Phân Trang', sub: 'Giới hạn 50 bản ghi/trang',
        input: '[Tiền ĐK] Có hơn 50 splash thỏa mãn bộ lọc.\n1. Quan sát số bản ghi và điều hướng phân trang.',
        output: '1.\n- Tối đa 50 bản ghi trên 1 trang.\n- Có điều hướng chuyển trang (nếu >50 kết quả).\n- Counter: 1-50/N件.' },
      { to: 'Phân Trang', sub: 'Chuyển sang trang tiếp theo',
        input: '[Tiền ĐK] Có hơn 50 splash.\n1. Chuyển sang trang 2.\n2. Quan sát danh sách.',
        output: '1. Chuyển sang trang 2 thành công.\n2.\n- Hiển thị 50 bản ghi tiếp theo.\n- Counter: 51-100/N件.\n- Dữ liệu không trùng trang 1.' },
      // --- Result Count ---
      { to: 'Result Count', sub: 'X-Y/Z件 cập nhật đúng sau khi đổi bộ lọc',
        input: '[Tiền ĐK] Bộ lọc đang trả về 14 kết quả.\n1. Quan sát indicator hiện tại.\n2. Thay đổi bộ lọc (ví dụ: bỏ tích 1 checkbox).\n3. Quan sát indicator sau khi thay đổi.',
        output: '1. Hiển thị: 1-14/14件.\n2.\n3. Counter cập nhật ngay theo bộ lọc mới.' },
    ],
  },
  {
    title: '3. Nút Hủy 取消 — 4 Loại Dialog Confirm',
    rows: [
      // --- Dialog Confirm (merge) ---
      { to: 'Nút 取消 — Dialog Confirm', sub: 'Loại 1: Splash 表示中 → có 表示開始日',
        input: '[Tiền ĐK] Splash trạng thái 表示中, 表示期間=26/07/01~26/07/31, ID=6336.\n1. Nhấn [取消] trên dòng đó.\n2. Quan sát dialog.',
        output: '1. Dialog xác nhận xuất hiện.\n2.\n- Dialog hiển thị: 該当スプラッシュを取消しますか？\n- id: 6336、表示開始日：2026-07-01\n- Có 2 nút OK / Cancel.' },
      { to: 'Nút 取消 — Dialog Confirm', sub: 'Loại 2: Splash 表示終了 → có 表示期間 range',
        input: '[Tiền ĐK] Splash trạng thái 表示終了, 表示期間=26/06/01~26/06/30, ID=1569.\n1. Tích checkbox 表示終了 để hiện splash đó.\n2. Nhấn [取消].\n3. Quan sát dialog.',
        output: '1. Splash 表示終了 xuất hiện trong danh sách.\n2. Dialog xác nhận xuất hiện.\n3.\n- Dialog hiển thị: 該当スプラッシュを取消しますか？\n- id: 1569、表示期間: 2026-06-01~2026-06-30\n- Có 2 nút OK / Cancel.' },
      { to: 'Nút 取消 — Dialog Confirm', sub: 'Loại 3: 一時保存 chưa set ngày → 表示期間:~',
        input: '[Tiền ĐK] Splash trạng thái 一時保存 chưa set 表示期間, ID=1009.\n1. Nhấn [取消].\n2. Quan sát dialog.',
        output: '1. Dialog xác nhận xuất hiện.\n2.\n- Dialog hiển thị: 該当スプラッシュを取消しますか？\n- id: 1009、表示期間:~\n- Có 2 nút OK / Cancel.' },
      { to: 'Nút 取消 — Dialog Confirm', sub: 'Loại 4: 表示前 (ngày tương lai) → dialog cảnh báo',
        input: '[Tiền ĐK] Splash trạng thái 表示前 (ngày tương lai), ID=1049.\n1. Nhấn [取消].\n2. Quan sát dialog.',
        output: '1. Dialog xuất hiện.\n2.\n- Dialog CẢNH BÁO: 表示期限前ですが、スプラッシュの表示を終了します。\n- id: 1049、表示期限：yyyy-mm-dd\n- Có 2 nút OK / Cancel.' },
      // --- Xử lý Dialog (merge) ---
      { to: 'Nút 取消 — Xử lý Dialog', sub: 'Click OK → đổi trạng thái 取消済',
        input: '[Tiền ĐK] Dialog xác nhận hủy đang hiện (bất kỳ loại).\n1. Nhấn OK trong dialog.\n2. Quan sát trạng thái splash.',
        output: '1. Dialog đóng lại.\n2.\n- Trạng thái splash đổi thành 取消済.\n- Splash có thể mất khỏi filter mặc định.\n- Không có lỗi.' },
      { to: 'Nút 取消 — Xử lý Dialog', sub: 'Click Cancel → không thay đổi',
        input: '[Tiền ĐK] Dialog xác nhận hủy đang hiện.\n1. Nhấn Cancel (hủy dialog).\n2. Quan sát.',
        output: '1. Dialog đóng lại.\n2. Trạng thái KHÔNG thay đổi, danh sách như cũ.' },
      // --- Hiển thị nút (merge) ---
      { to: 'Nút 取消 — Hiển thị mọi trạng thái', sub: 'Luôn hiển thị trên dòng 表示終了',
        input: '[Tiền ĐK] Splash trạng thái 表示終了 trong danh sách (tích checkbox 表示終了).\n1. Quan sát cột 編集.',
        output: '1.\n- Nút [取消] HIỂN THỊ trên dòng 表示終了.\n- Nút [編集] cũng hiển thị.' },
      { to: 'Nút 取消 — Hiển thị mọi trạng thái', sub: 'Luôn hiển thị trên dòng 取消済',
        input: '[Tiền ĐK] Splash trạng thái 取消済 (tích checkbox 取消済).\n1. Quan sát cột 編集.',
        output: '1.\n- Nút [取消] HIỂN THỊ trên dòng 取消済.\n- Nút [編集] cũng hiển thị.' },
    ],
  },
  {
    title: '4. Điều Hướng 編集 + 新規登録',
    rows: [
      // --- 新規登録 ---
      { to: 'Nút 新規登録', sub: 'Nhấn → chuyển màn hình Splash Create',
        input: '[Tiền ĐK] Admin ở màn hình スプラッシュ一覧.\n1. Nhấn [新規登録] góc trên phải.\n2. Quan sát màn hình.',
        output: '1. Điều hướng bắt đầu.\n2.\n- Chuyển sang màn hình Splash Create (form trống).\n- Breadcrumb/title hiển thị đúng.' },
      // --- 編集 Điều hướng (merge) ---
      { to: 'Nút 編集 — Điều Hướng', sub: 'Dòng 表示中 → dữ liệu đúng ID',
        input: '[Tiền ĐK] Splash ID=6336 trạng thái 表示中.\n1. Nhấn [編集] trên dòng ID=6336.\n2. Quan sát màn hình.',
        output: '1. Điều hướng bắt đầu.\n2.\n- Chuyển sang Splash Edit.\n- Form hiển thị DỮ LIỆU CHÍNH XÁC của ID=6336.\n- Không hiện data splash khác.' },
      { to: 'Nút 編集 — Điều Hướng', sub: 'Dòng 一時保存 (bản nháp) → dữ liệu đúng ID',
        input: '[Tiền ĐK] Splash trạng thái 一時保存 trong danh sách.\n1. Nhấn [編集] trên dòng bản nháp.\n2. Quan sát.',
        output: '1. Điều hướng bắt đầu.\n2.\n- Chuyển sang Splash Edit.\n- Hiển thị dữ liệu của splash bản nháp.\n- Không bị lỗi.' },
      // --- 編集 Hiển thị nút (merge) ---
      { to: 'Nút 編集 — Hiển thị mọi trạng thái', sub: 'Luôn hiển thị trên dòng 表示終了',
        input: '[Tiền ĐK] Splash 表示終了 trong danh sách.\n1. Quan sát cột 編集.',
        output: '1.\n- [編集] HIỂN THỊ trên dòng 表示終了.\n- Nhấn [編集] → chuyển Edit form đúng ID.' },
      { to: 'Nút 編集 — Hiển thị mọi trạng thái', sub: 'Luôn hiển thị trên dòng 取消済',
        input: '[Tiền ĐK] Splash 取消済 trong danh sách (tích checkbox 取消済).\n1. Quan sát cột 編集.',
        output: '1.\n- [編集] HIỂN THỊ trên dòng 取消済.\n- Nhấn [編集] → chuyển Edit form đúng ID.' },
    ],
  },
];

(async () => {
  const out = process.argv[2] || path.join(__dirname, '\u3010CMS\u3011\u30B9\u30D7\u30E9\u30C3\u30B7\u30E5\u4E00\u89A7.xlsx');
  const res = await generateTestcase({
    template: TEMPLATE,
    templateGuiSheet: TEMPLATE_GUI_SHEET,
    templateExtraSheets: TEMPLATE_EXTRA_SHEETS,
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
  console.log('WROTE:', res.output);
  console.log('TC: GUI=' + res.gui + ' | LOGIC=' + res.logic + ' | TOTAL=' + (res.gui + res.logic));
})();