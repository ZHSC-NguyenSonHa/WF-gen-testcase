// =============================================================================
// gen_popup_list.js — CMS Popup List (ポップアップ一覧)
// Release: 7.4.0 | Creator: QuynhNT | Date: 2026-07-13
// Output: CMS/Testcase/【CMS】Popup_List.xlsx
// Spec: CMS/Spec/popup_list_spec_analysis.md
// Assumptions (từ Ambiguities đã clarify):
//   AMB-01: Filter 件名 = partial match (contains)
//   AMB-02: Có nút Search riêng (hoặc auto trigger on Enter)
//   AMB-03: Nút 削除 ẩn hoàn toàn cho status terminal (表示終了, 取消済)
//   AMB-06: Cột 文字色 tồn tại, giá trị: 黒文字 / 白文字
//   AMB-07: 表示頻度 có: 毎回 / 1回のみ
//   AMB-08: Click 削除 → có confirmation dialog trước khi xóa
//   AMB-09: Click 複製 → tạo bản copy với status 一時保存
// =============================================================================

const path = require('path');
const { generateTestcase } = require('../testcase_builder');

const FUNCTION_NAME  = 'Popup_List';
const CREATOR        = 'QuynhNT';
const CREATE_DATE    = '2026-07-13';
const RELEASE        = '7.4.0';
const DEVICES        = ['Chrome', 'Edge'];
const SHEET_PREFIX   = 'Popup_List';

// ─────────────────────────────────────────────────────────────────────────────
// GUI — Kiểm tra layout, label, trạng thái visual
// ─────────────────────────────────────────────────────────────────────────────
const guiSection = {
  title: 'Xác nhận hiển thị màn hình ポップアップ一覧 (CMS)',
  rows: [
    // ── Filter section ──
    {
      to: 'Khu vực Filter',
      sub: 'Layout và thứ tự các thành phần',
      input: '[Tiền điều kiện] Đăng nhập CMS thành công. Vào màn hình ポップアップ一覧.\n1. Quan sát toàn bộ khu vực filter phía trên bảng.',
      output: '1.\n- Hiển thị label "件名" + input text bên phải.\n- Hiển thị label "表示期間" + 2 ô date picker (từ / đến).\n- Hiển thị nhóm checkbox "ステータス": 表示前, 表示中, 一時保存, 取消済, 表示終了.\n- Hiển thị nút "新規登録" màu xanh ở góc phải trên.\n- Tất cả thành phần nằm trên 1 hàng ngang, không bị vỡ layout.'
    },
    {
      to: 'Khu vực Filter',
      sub: 'Trạng thái mặc định checkbox ステータス',
      input: '[Tiền điều kiện] Vào màn hình lần đầu, chưa thao tác gì.\n1. Quan sát trạng thái 5 checkbox ステータス.',
      output: '1.\n- 表示前: ✅ checked mặc định.\n- 表示中: ✅ checked mặc định.\n- 一時保存: ✅ checked mặc định.\n- 取消済: ☐ unchecked mặc định.\n- 表示終了: ☐ unchecked mặc định.'
    },
    // ── Table header ──
    {
      to: 'Header bảng danh sách',
      sub: 'Tên cột và thứ tự',
      input: '[Tiền điều kiện] Màn hình đang hiển thị bảng có ít nhất 1 popup.\n1. Quan sát hàng header của bảng.',
      output: '1.\n- Thứ tự cột từ trái sang phải: 編集 | ID | 種別 | 件名 | 文字色 | 画像 | 内容 | リンク先 | 表示期間 | 表示頻度 | ステータス.\n- Không thiếu cột, không lặp cột.'
    },
    // ── Row actions ──
    {
      to: 'Nút hành động trong cột 編集',
      sub: 'Popup có status non-terminal (表示前 / 表示中 / 一時保存)',
      input: '[Tiền điều kiện] Có ít nhất 1 popup với status 表示前 hoặc 表示中 hoặc 一時保存.\n1. Quan sát cột 編集 của row đó.',
      output: '1.\n- Hiển thị 3 nút: 削除 (màu đỏ), 編集, 複製.\n- Nút 削除 nổi bật bằng màu đỏ/nền đỏ.'
    },
    {
      to: 'Nút hành động trong cột 編集',
      sub: 'Popup có status terminal (表示終了 / 取消済)',
      input: '[Tiền điều kiện] Có ít nhất 1 popup với status 表示終了 hoặc 取消済.\n1. Quan sát cột 編集 của row đó.',
      output: '1.\n- KHÔNG hiển thị nút 削除 màu đỏ.\n- Chỉ hiển thị nút 編集 và 複製 (style thông thường).'
    },
    // ── Empty state ──
    {
      to: 'Trạng thái rỗng (Empty state)',
      sub: 'Không có dữ liệu khớp filter',
      input: '[Tiền điều kiện] Filter đang áp dụng, không có popup nào khớp điều kiện.\n1. Quan sát vùng nội dung bảng.',
      output: '1. Hiển thị message: "該当データがありません。" ở giữa vùng bảng.\n2. Không có row dữ liệu nào.'
    },
    // ── Pagination ──
    {
      to: 'Phân trang (Pagination)',
      sub: 'Hiển thị phân trang khi có nhiều hơn 50 items',
      input: '[Tiền điều kiện] Tổng số popup hiển thị > 50.\n1. Quan sát vùng phân trang.',
      output: '1.\n- Góc trái: dãy số trang (1, 2, 3...), trang hiện tại được highlight (filled circle ●).\n- Góc phải: counter format "X - Y / N件" (vd: 1 - 50 / 133件).'
    },
    // ── Status badge ──
    {
      to: 'Cột ステータス',
      sub: 'Hiển thị đúng badge cho từng trạng thái',
      input: '[Tiền điều kiện] Bảng có đủ 5 loại status (check all để thấy).\n1. Quan sát cột ステータス cho mỗi loại status.',
      output: '1.\n- 表示前: hiển thị text "表示前".\n- 表示中: hiển thị text "表示中".\n- 一時保存: hiển thị text "一時保存".\n- 取消済: hiển thị text "取消済".\n- 表示終了: hiển thị text "表示終了".\n- Không bị lẫn lộn giữa các status.'
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LOGIC — Chia theo các mục trong spec (AC sections)
// ─────────────────────────────────────────────────────────────────────────────
const logicSections = [

  // ════════════════════════════════════════════════════════
  // 1. Filter — 件名 (AC-01)
  // ════════════════════════════════════════════════════════
  {
    title: '1. Filter theo 件名',
    rows: [
      {
        to: 'Filter 件名',
        sub: 'Partial match — tìm thấy kết quả',
        input: '[Tiền điều kiện] Có popup tên "Popup Noel 2026" trong hệ thống. Check all status checkboxes.\n1. Nhập "Noel" vào ô filter 件名.\n2. Trigger search (nhấn Enter hoặc nút Search).\n3. Quan sát bảng kết quả.',
        output: '2. Tìm kiếm được thực thi.\n3.\n- Bảng chỉ hiển thị các popup có 件名 chứa "Noel".\n- Counter cập nhật đúng số lượng kết quả tìm được.'
      },
      {
        to: 'Filter 件名',
        sub: 'Không tìm thấy kết quả — empty state',
        input: '[Tiền điều kiện] Check all status checkboxes.\n1. Nhập "XXXXXXXXNOTEXIST" vào ô filter 件名.\n2. Trigger search.',
        output: '2. Hiển thị message "該当データがありません。"\nCounter hiển thị 0件.'
      },
      {
        to: 'Filter 件名',
        sub: 'Xóa text filter — reset về tất cả',
        input: '[Tiền điều kiện] Đang có filter 件名 = "Noel", kết quả đã hiển thị.\n1. Xóa hết text trong ô filter 件名.\n2. Trigger search.',
        output: '2. Bảng hiển thị lại tất cả popup khớp status đang check (không còn filter 件名).'
      },
      {
        to: 'Filter 件名',
        sub: 'Nhập chỉ khoảng trắng',
        input: '[Tiền điều kiện] Check all status checkboxes.\n1. Nhập " " (dấu cách) vào ô filter 件名.\n2. Trigger search.',
        output: '2. Hệ thống trim whitespace → hiển thị tất cả popup (không filter theo tên) HOẶC hiển thị empty. Không crash.'
      },
    ]
  },

  // ════════════════════════════════════════════════════════
  // 2. Filter theo 表示期間 (AC-02, AC-03)
  // ════════════════════════════════════════════════════════
  {
    title: '2. Filter theo 表示期間',
    rows: [
      {
        to: 'Filter 表示期間 (Từ)',
        sub: 'Chỉ nhập ngày bắt đầu',
        input: '[Tiền điều kiện] Check all status. Có popup A (期間: 26/07/01~26/07/31) và popup B (期間: 26/06/01~26/06/30).\n1. Nhập ngày Từ = 26/07/01.\n2. Trigger search.\n3. Quan sát kết quả.',
        output: '3. Chỉ hiển thị popup A (start date ≥ 26/07/01). Popup B không xuất hiện.'
      },
      {
        to: 'Filter 表示期間 (Đến)',
        sub: 'Chỉ nhập ngày kết thúc',
        input: '[Tiền điều kiện] Check all status. Có popup A (期間: 26/07/01~26/07/31) và popup B (期間: 26/08/01~26/08/31).\n1. Nhập ngày Đến = 26/07/31.\n2. Trigger search.',
        output: '2. Chỉ hiển thị popup A (end date ≤ 26/07/31). Popup B không xuất hiện.'
      },
      {
        to: 'Filter 表示期間 (Từ + Đến)',
        sub: 'Nhập cả 2 ngày — khoảng hợp lệ',
        input: '[Tiền điều kiện] Check all status. Có popup A (26/07/01~26/07/31), popup B (26/06/01~26/06/30), popup C (26/08/01~26/08/31).\n1. Nhập Từ = 26/07/01, Đến = 26/07/31.\n2. Trigger search.',
        output: '2. Chỉ popup A xuất hiện. Popup B và C không xuất hiện.'
      },
      {
        to: 'Filter 表示期間 (Từ + Đến)',
        sub: 'Ngày Từ > Ngày Đến — nhập ngược',
        input: '[Tiền điều kiện] Check all status.\n1. Nhập Từ = 26/07/31, Đến = 26/07/01 (ngược chiều).\n2. Trigger search.',
        output: '2. Hệ thống hiển thị thông báo lỗi validation HOẶC tự đổi ngược lại cho đúng. Không crash.'
      },
    ]
  },

  // ════════════════════════════════════════════════════════
  // 3. Filter theo ステータス (AC-04)
  // ════════════════════════════════════════════════════════
  {
    title: '3. Filter theo ステータス',
    rows: [
      {
        to: 'Filter ステータス',
        sub: 'Trạng thái mặc định khi vào màn hình',
        input: '[Tiền điều kiện] Có popup ở tất cả 5 trạng thái.\n1. Vào màn hình ポップアップ一覧 mà không thay đổi filter.\n2. Quan sát bảng kết quả.',
        output: '2. Bảng chỉ hiển thị popup có status: 表示前, 表示中, 一時保存.\nKhông hiển thị popup có status: 取消済, 表示終了.'
      },
      {
        to: 'Filter ステータス',
        sub: 'Check thêm 表示終了 — hiển thị popup đã kết thúc',
        input: '[Tiền điều kiện] Có popup 表示終了. Filter mặc định đang áp dụng.\n1. Check thêm checkbox 表示終了.\n2. Trigger search.',
        output: '2. Bảng hiển thị thêm các popup có status 表示終了 so với kết quả trước.'
      },
      {
        to: 'Filter ステータス',
        sub: 'Check tất cả 5 status',
        input: '[Tiền điều kiện] Có popup ở cả 5 trạng thái.\n1. Check cả 5 checkbox status.\n2. Trigger search.',
        output: '2. Bảng hiển thị tất cả popup không phân biệt status. Counter hiển thị tổng số popup trong hệ thống.'
      },
      {
        to: 'Filter ステータス',
        sub: 'Bỏ check tất cả — không chọn status nào',
        input: '[Tiền điều kiện] Đang check tất cả status.\n1. Bỏ check tất cả 5 checkbox.\n2. Trigger search.',
        output: '2. Bảng hiển thị empty "該当データがありません。" vì không có status nào được chọn.'
      },
      {
        to: 'Filter ステータス',
        sub: 'Chỉ check 一時保存',
        input: '[Tiền điều kiện] Bỏ check tất cả, chỉ check 一時保存.\n1. Trigger search.',
        output: '1. Bảng chỉ hiển thị các popup có status 一時保存. Không hiển thị popup status khác.'
      },
    ]
  },

  // ════════════════════════════════════════════════════════
  // 4. Filter kết hợp
  // ════════════════════════════════════════════════════════
  {
    title: '4. Filter kết hợp nhiều điều kiện',
    rows: [
      {
        to: 'Filter kết hợp',
        sub: '件名 + ステータス — thu hẹp kết quả',
        input: '[Tiền điều kiện] Có popup "Popup Noel" với status 表示中 và "Popup Noel Draft" status 一時保存.\n1. Nhập 件名 = "Noel".\n2. Chỉ check 表示中.\n3. Trigger search.',
        output: '3. Bảng chỉ hiển thị "Popup Noel" (status 表示中). Không hiển thị "Popup Noel Draft".'
      },
      {
        to: 'Filter kết hợp',
        sub: '件名 + 表示期間 + ステータス — cả 3 điều kiện',
        input: '[Tiền điều kiện] Có nhiều popup đa dạng.\n1. Nhập 件名 = "Summer".\n2. Nhập 表示期間 Từ = 26/07/01, Đến = 26/07/31.\n3. Check chỉ 表示中.\n4. Trigger search.',
        output: '4. Bảng chỉ hiển thị popup thỏa đồng thời cả 3 điều kiện:\n- Tên chứa "Summer".\n- Thời gian hiển thị nằm trong 26/07/01 ~ 26/07/31.\n- Status = 表示中.'
      },
    ]
  },

  // ════════════════════════════════════════════════════════
  // 5. Hiển thị bảng và sắp xếp (AC-20)
  // ════════════════════════════════════════════════════════
  {
    title: '5. Hiển thị bảng và thứ tự sắp xếp',
    rows: [
      {
        to: 'Sắp xếp mặc định',
        sub: 'ID giảm dần — mới nhất đầu tiên',
        input: '[Tiền điều kiện] Check all status. Có nhiều popup với ID khác nhau.\n1. Vào màn hình không thay đổi gì.\n2. Quan sát thứ tự hiển thị.',
        output: '2. Popup có ID lớn nhất (mới nhất) hiển thị ở dòng đầu tiên. Thứ tự giảm dần theo ID.'
      },
      {
        to: 'Hiển thị 種別',
        sub: 'Phân biệt アップデート và 通常',
        input: '[Tiền điều kiện] Có cả 2 loại popup trong danh sách.\n1. Quan sát cột 種別.',
        output: '1.\n- Popup loại cập nhật app hiển thị: "アップデート".\n- Popup thông thường hiển thị: "通常".\n- Không bị lẫn lộn giữa 2 loại.'
      },
      {
        to: 'Hiển thị 文字色',
        sub: '黒文字 và 白文字',
        input: '[Tiền điều kiện] Có popup với 文字色 = 黒文字 và popup với 文字色 = 白文字.\n1. Quan sát cột 文字色.',
        output: '1. Hiển thị đúng giá trị "黒文字" hoặc "白文字" tương ứng với từng popup.'
      },
      {
        to: 'Hiển thị リンク先',
        sub: 'Popup アップデート — 2 link iOS + AOS',
        input: '[Tiền điều kiện] Có popup loại アップデート.\n1. Quan sát cột リンク先 của popup đó.',
        output: '1. Hiển thị 2 dòng riêng biệt:\n- "iOS: <App Store URL>"\n- "AOS: <Google Play URL>"'
      },
      {
        to: 'Hiển thị リンク先',
        sub: 'Popup 通常 không có link',
        input: '[Tiền điều kiện] Có popup loại 通常 không cấu hình リンク先.\n1. Quan sát cột リンク先.',
        output: '1. Hiển thị "-" trong cột リンク先.'
      },
    ]
  },

  // ════════════════════════════════════════════════════════
  // 6. Trạng thái ステータス và nút 削除 (AC-06, section 4.4)
  // ════════════════════════════════════════════════════════
  {
    title: '6. Trạng thái ステータス và hiển thị nút 削除',
    rows: [
      {
        to: 'Nút 削除 — status 表示前',
        sub: 'Nút 削除 đỏ hiển thị cho popup chưa đến giờ',
        input: '[Tiền điều kiện] Có popup với status 表示前 (start date > ngày hiện tại).\n1. Quan sát cột 編集 của row đó.',
        output: '1. Hiển thị nút 削除 màu đỏ cùng với 編集 và 複製.'
      },
      {
        to: 'Nút 削除 — status 表示中',
        sub: 'Nút 削除 đỏ hiển thị cho popup đang active',
        input: '[Tiền điều kiện] Có popup với status 表示中 (start ≤ now ≤ end).\n1. Quan sát cột 編集 của row đó.',
        output: '1. Hiển thị nút 削除 màu đỏ cùng với 編集 và 複製.'
      },
      {
        to: 'Nút 削除 — status 一時保存',
        sub: 'Nút 削除 đỏ hiển thị cho popup lưu nháp',
        input: '[Tiền điều kiện] Có popup với status 一時保存.\n1. Quan sát cột 編集 của row đó.',
        output: '1. Hiển thị nút 削除 màu đỏ cùng với 編集 và 複製.'
      },
      {
        to: 'Nút 削除 — status 表示終了',
        sub: 'Nút 削除 đỏ KHÔNG hiển thị cho popup đã kết thúc',
        input: '[Tiền điều kiện] Có popup với status 表示終了.\n1. Quan sát cột 編集 của row đó.',
        output: '1. Không hiển thị nút 削除 màu đỏ. Chỉ có nút 編集 và 複製 thông thường.'
      },
      {
        to: 'Nút 削除 — status 取消済',
        sub: 'Nút 削除 đỏ KHÔNG hiển thị cho popup đã hủy',
        input: '[Tiền điều kiện] Có popup với status 取消済.\n1. Quan sát cột 編集 của row đó.',
        output: '1. Không hiển thị nút 削除 màu đỏ. Chỉ có nút 編集 và 複製 thông thường.'
      },
      {
        to: 'Tự động chuyển status',
        sub: '表示前 → 表示中 khi đến start datetime',
        input: '[Tiền điều kiện] Có popup với start datetime = T+1 phút (gần sắp bắt đầu), status hiện = 表示前.\n1. Chờ đến khi start datetime qua.\n2. Refresh màn hình hoặc chờ auto refresh.\n3. Quan sát cột ステータス.',
        output: '3. Status của popup tự chuyển từ 表示前 → 表示中. Nút 削除 đỏ vẫn còn hiển thị.'
      },
      {
        to: 'Tự động chuyển status',
        sub: '表示中 → 表示終了 khi qua end datetime',
        input: '[Tiền điều kiện] Có popup với end datetime = T+1 phút, status hiện = 表示中.\n1. Chờ đến khi end datetime qua.\n2. Refresh màn hình.\n3. Quan sát cột ステータス.',
        output: '3. Status của popup tự chuyển từ 表示中 → 表示終了. Nút 削除 đỏ biến mất.'
      },
    ]
  },

  // ════════════════════════════════════════════════════════
  // 7. Hành động 削除 (AC-06, AMB-08)
  // ════════════════════════════════════════════════════════
  {
    title: '7. Hành động 削除 (Xóa popup)',
    rows: [
      {
        to: '削除 — Confirm',
        sub: 'Xóa thành công sau khi xác nhận',
        input: '[Tiền điều kiện] Có popup X với status 表示前. Ghi nhớ ID và 件名.\n1. Click nút 削除 đỏ của popup X.\n2. Quan sát dialog xác nhận.\n3. Click nút xác nhận (OK / はい / 削除).\n4. Quan sát bảng sau khi xóa.',
        output: '2. Dialog xác nhận hiển thị (không xóa ngay lập tức).\n3. Hệ thống thực hiện xóa.\n4.\n- Popup X không còn trong danh sách.\n- Counter giảm đi 1.\n- Hiển thị toast/message thành công (nếu có).'
      },
      {
        to: '削除 — Cancel',
        sub: 'Hủy xóa — popup không bị mất',
        input: '[Tiền điều kiện] Có popup X với status 表示中.\n1. Click nút 削除 đỏ của popup X.\n2. Dialog xác nhận hiển thị.\n3. Click nút hủy (キャンセル / いいえ / 閉じる).',
        output: '3. Dialog đóng lại. Popup X vẫn còn trong danh sách với status không đổi.'
      },
      {
        to: '削除 — Popup 表示中',
        sub: 'Xóa popup đang active — cảnh báo hoặc xóa ngay',
        input: '[Tiền điều kiện] Có popup Y với status 表示中.\n1. Click nút 削除 đỏ của popup Y.\n2. Xác nhận xóa.\n3. Quan sát bảng và kiểm tra app.',
        output: '2. Hệ thống xóa thành công.\n3.\n- Popup Y không còn trong danh sách CMS.\n- Popup không còn hiển thị trên app (sau thời gian cache invalidate).'
      },
    ]
  },

  // ════════════════════════════════════════════════════════
  // 8. Hành động 複製 (AMB-09)
  // ════════════════════════════════════════════════════════
  {
    title: '8. Hành động 複製 (Nhân bản popup)',
    rows: [
      {
        to: '複製',
        sub: 'Nhân bản popup — bản copy có status 一時保存',
        input: '[Tiền điều kiện] Có popup gốc Z (種別: 通常, 件名: "Popup Summer", status: 表示終了).\n1. Click nút 複製 của popup Z.\n2. Quan sát bảng danh sách sau khi nhân bản.',
        output: '2.\n- Bản copy mới xuất hiện trong bảng với ID mới (lớn hơn ID của Z).\n- Status của bản copy: 一時保存.\n- 件名, 種別, 画像, 内容, リンク先, 文字色 giống hệt popup gốc Z.\n- Popup gốc Z không bị thay đổi.'
      },
      {
        to: '複製',
        sub: 'Nhân bản popup アップデート — link iOS + AOS được copy đúng',
        input: '[Tiền điều kiện] Có popup gốc loại アップデート với đầy đủ link iOS và AOS.\n1. Click nút 複製.\n2. Click 編集 để mở bản copy vừa tạo.\n3. Kiểm tra field リンク先.',
        output: '3. Link iOS và AOS giống hệt popup gốc. Không bị mất hay bị truncate.'
      },
    ]
  },

  // ════════════════════════════════════════════════════════
  // 9. Phân trang (AC-17, AC-18, AC-19)
  // ════════════════════════════════════════════════════════
  {
    title: '9. Phân trang',
    rows: [
      {
        to: 'Phân trang',
        sub: '50 item mỗi trang — chuyển sang trang 2',
        input: '[Tiền điều kiện] Check all status. Tổng popup > 50 (vd: 133 popup).\n1. Quan sát trang 1.\n2. Click số trang 2.\n3. Quan sát trang 2.',
        output: '1. Hiển thị 50 popup đầu tiên. Counter: "1 - 50 / N件".\n2. Chuyển trang thành công.\n3.\n- Hiển thị 50 popup tiếp theo (hoặc ít hơn nếu là trang cuối).\n- Counter: "51 - 100 / N件".\n- Trang 2 được highlight trong dãy phân trang.\n- Không trùng dữ liệu với trang 1.'
      },
      {
        to: 'Phân trang',
        sub: 'Filter thay đổi — phân trang reset về trang 1',
        input: '[Tiền điều kiện] Đang ở trang 2 của kết quả filter.\n1. Thay đổi điều kiện filter (vd: nhập 件名 mới).\n2. Trigger search.',
        output: '2. Kết quả mới hiển thị từ trang 1. Counter cập nhật theo kết quả mới.'
      },
    ]
  },

  // ════════════════════════════════════════════════════════
  // 10. Hành động 新規登録 và 編集
  // ════════════════════════════════════════════════════════
  {
    title: '10. Hành động 新規登録 và 編集',
    rows: [
      {
        to: '新規登録',
        sub: 'Mở form tạo mới popup',
        input: '[Tiền điều kiện] Đang ở màn hình ポップアップ一覧.\n1. Click nút 新規登録 (góc phải trên).',
        output: '1. Mở form tạo mới popup. Form rỗng, chưa có dữ liệu được điền sẵn.'
      },
      {
        to: '編集',
        sub: 'Mở form chỉnh sửa đúng popup',
        input: '[Tiền điều kiện] Có popup P với ID = 588, 件名 = "Popup A", status 表示中.\n1. Click nút 編集 của popup P.',
        output: '1. Mở form chỉnh sửa. Tất cả field hiển thị đúng giá trị của popup P (件名 = "Popup A",種別, 画像, リンク先, 表示期間, 表示頻度 đúng với data popup P).'
      },
    ]
  },
];

// ─────────────────────────────────────────────────────────────────────────────
(async () => {
  const out = process.argv[2] || path.join(__dirname, '../../..', 'CMS', 'Testcase', '【CMS】Popup_List.xlsx');
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
