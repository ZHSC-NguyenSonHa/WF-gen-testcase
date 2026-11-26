const path = require('path');
const ExcelJS = require('exceljs');

function styleHeader(row) {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFBFBFBF' } },
      left: { style: 'thin', color: { argb: 'FFBFBFBF' } },
      bottom: { style: 'thin', color: { argb: 'FFBFBFBF' } },
      right: { style: 'thin', color: { argb: 'FFBFBFBF' } },
    };
  });
}

function styleBody(row) {
  row.eachCell((cell) => {
    cell.alignment = { vertical: 'top', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
      left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
      bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
      right: { style: 'thin', color: { argb: 'FFD9D9D9' } },
    };
  });
}

function setWidths(ws, widths) {
  widths.forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });
}

async function main() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'QuynhNT';
  wb.created = new Date('2026-07-01T00:00:00');

  const s0 = wb.addWorksheet('0_Gioi_Thieu');
  s0.addRow(['HẠNG MỤC', 'NỘI DUNG']);
  styleHeader(s0.getRow(1));
  [
    ['Tên tài liệu', 'Hướng dẫn sử dụng chi tiết module Lucky Bag (zluckybag) cho người mới trong dự án.'],
    ['Mục tiêu', 'Giúp tất cả role (PM/BA/Dev/QA/CSKH/Ops) hiểu đúng luồng nghiệp vụ, điểm rủi ro và cách vận hành thực tế.'],
    ['Phạm vi', 'Dựa trên đặc tả nghiệp vụ tại specs/zluckybag/zluckybag_spec.html.'],
    ['Tóm tắt 1 câu', 'Lucky Bag là luồng bán theo cơ chế xổ số: đăng ký -> chờ kết quả -> trúng thì thanh toán -> nhận hàng.'],
    ['Các luồng chính', '1) Hiển thị tại Home\n2) Đăng ký bốc thăm\n3) Xem kết quả\n4) Thanh toán\n5) Nhận túi\n6) Hết hạn thanh toán\n7) Từ chối nhận túi\n8) Khảo sát sau sự kiện'],
    ['Các trạng thái quan trọng', 'bookingStatus: 0,1,2,3,4,5,6,7,8 (trọng tâm: 3,4,5,8).'],
    ['Chính sách cốt lõi', 'Không hủy sau khi đăng ký; quá hạn thanh toán mất quyền mua; quá hạn nhận tại cửa hàng có thể mất quyền nhận và không hoàn tiền.'],
  ].forEach((r) => {
    s0.addRow(r);
    styleBody(s0.lastRow);
  });
  setWidths(s0, [28, 120]);

  const s1 = wb.addWorksheet('1_Luong_Nghiep_Vu');
  s1.addRow(['LUỒNG', 'KHI NÀO XẢY RA', 'INPUT', 'XỬ LÝ HỆ THỐNG', 'OUTPUT']);
  styleHeader(s1.getRow(1));
  [
    ['Hiển thị tại Home', 'Mỗi lần vào Home', 'Trạng thái đăng nhập + bookingStatus', 'Render banner/nhãn/CTA theo trạng thái', 'Người dùng thấy đúng hành động tiếp theo'],
    ['Đăng ký bốc thăm', 'Trong BY_BOOKED_TIME', 'Điều khoản + phương thức nhận + thông tin nhận hàng', 'Validate và gửi đơn đăng ký', 'Thông báo tiếp nhận thành công'],
    ['Xem kết quả', 'Sau ngày công bố', 'Kết quả trúng/trượt', 'Phân nhánh vòng 1, vòng 2, bổ sung', 'Trúng thì sang thanh toán; trượt thì hướng dẫn tiếp'],
    ['Thanh toán', 'Sau khi trúng, trong hạn', 'Đồng ý quy định + phương thức thanh toán', 'Mở cổng thanh toán, nhận callback', 'Thành công -> trạng thái 4; quá hạn -> trạng thái 5'],
    ['Nhận túi', 'Sau thanh toán', 'Nhận tại cửa hàng hoặc giao tận nhà', 'Hiển thị mã đặt chỗ hoặc mã vận đơn', 'Hoàn tất nhận -> trạng thái 8'],
    ['Hết hạn thanh toán', 'Quá hạn chưa thanh toán', 'Trạng thái quá hạn', 'Hiển thị thông báo mất quyền mua (1 lần)', 'Không còn CTA thanh toán'],
    ['Từ chối nhận túi', 'Sau khi trúng', 'User chủ động từ chối', 'Ghi nhận từ chối', 'Mất quyền nhận, không khôi phục'],
    ['Khảo sát sau sự kiện', 'Sau hết hạn/từ chối', 'Danh sách câu hỏi + trạng thái chưa trả lời', 'Hiển thị khảo sát 1 lần và ghi nhận', 'Dữ liệu phản hồi cho cải tiến'],
  ].forEach((r) => {
    s1.addRow(r);
    styleBody(s1.lastRow);
  });
  setWidths(s1, [24, 24, 30, 45, 38]);

  const s2 = wb.addWorksheet('2_Theo_Role');
  s2.addRow(['ROLE', 'CẦN HIỂU GÌ', 'NHIỆM VỤ CHÍNH', 'RỦI RO THƯỜNG GẶP']);
  styleHeader(s2.getRow(1));
  [
    ['PM/PO', 'Timeline campaign, policy và KPI', 'Chốt scope, mốc thời gian, thông điệp', 'Đổi rule sát release làm vỡ test scope'],
    ['BA', 'State machine và decision table', 'Làm rõ điều kiện hiển thị/ẩn CTA', 'Thiếu nhánh trượt vòng 1 -> vòng 2'],
    ['Dev', 'Điều kiện chuyển trạng thái và callback', 'Implement đúng state + logging', 'Hardcode rule campaign trong app'],
    ['QA', '8 luồng + 9 trạng thái + 2 cách nhận hàng', 'Thiết kế testcase happy/negative/edge', 'Bỏ sót test theo mốc thời gian'],
    ['CSKH', 'Ý nghĩa từng thông báo và giới hạn chính sách', 'Tư vấn user theo script tình huống', 'Cam kết sai kỳ vọng (ví dụ hứa khôi phục quyền mua)'],
    ['Ops/Release', 'Giám sát hệ thống trong mùa campaign', 'Theo dõi lỗi API/callback thanh toán', 'Không khóa cấu hình đúng giờ mở/đóng campaign'],
  ].forEach((r) => {
    s2.addRow(r);
    styleBody(s2.lastRow);
  });
  setWidths(s2, [18, 42, 42, 42]);

  const s3 = wb.addWorksheet('3_Checklist_Van_Hanh');
  s3.addRow(['GIAI ĐOẠN', 'CHECKLIST BẮT BUỘC', 'OWNER']);
  styleHeader(s3.getRow(1));
  [
    ['Trước campaign', 'Chốt timeline + policy\nUAT đủ 8 luồng\nKiểm thử callback thanh toán\nChuẩn bị script CSKH', 'PM/BA/QA/Ops'],
    ['Mở đăng ký', 'Verify trạng thái 7\nĐăng ký mẫu thành công\nTheo dõi lỗi đột biến', 'Ops/QA'],
    ['Công bố kết quả', 'Kiểm tra nhánh trúng/trượt\nKiểm tra CTA thanh toán\nSoát wording popup', 'PM/QA/CSKH'],
    ['Trong hạn thanh toán', 'Giám sát callback\nTheo dõi tỷ lệ thanh toán thành công\nXác nhận chuyển 3 -> 4', 'Ops/Dev/QA'],
    ['Giai đoạn nhận hàng', 'Kiểm tra nhận tại cửa hàng\nKiểm tra giao tận nhà + mã vận đơn\nKiểm tra cảnh báo quá hạn', 'QA/Ops/CSKH'],
  ].forEach((r) => {
    s3.addRow(r);
    styleBody(s3.lastRow);
  });
  setWidths(s3, [24, 90, 20]);

  const s4 = wb.addWorksheet('4_ThuatNgu_FAQ');
  s4.addRow(['MỤC', 'NỘI DUNG']);
  styleHeader(s4.getRow(1));
  [
    ['Thuật ngữ', '福袋: Lucky Bag\n抽選: Bốc thăm\n当選: Trúng\n落選: Trượt\n決済: Thanh toán\n店舗で受取: Nhận tại cửa hàng\n宅配で受取: Giao tận nhà'],
    ['FAQ', 'Hỏi: Trúng rồi vì sao không mua được?\nĐáp: Có thể đã quá hạn thanh toán (trạng thái 5).'],
    ['FAQ', 'Hỏi: Từ chối rồi có khôi phục được không?\nĐáp: Không. Trạng thái từ chối là mất quyền nhận.'],
    ['FAQ', 'Hỏi: Khi nào hiện khảo sát?\nĐáp: Sau hết hạn thanh toán hoặc từ chối, và chỉ hiển thị 1 lần nếu chưa trả lời.'],
    ['FAQ', 'Hỏi: Có đổi cửa hàng nhận được không?\nĐáp: Không. Đã chọn cửa hàng thì không đổi được.'],
  ].forEach((r) => {
    s4.addRow(r);
    styleBody(s4.lastRow);
  });
  setWidths(s4, [20, 120]);

  const s5 = wb.addWorksheet('5_Setup_DB_App');
  s5.addRow(['LUỒNG', 'MỤC TIÊU TEST', 'SETUP DB (Backend)', 'SETUP APP (Mobile)', 'KẾT QUẢ MONG ĐỢI']);
  styleHeader(s5.getRow(1));
  [
    [
      'Luồng 1 - Hiển thị tại Home',
      'Render đúng nhãn/CTA theo bookingStatus',
      'Bảng tt_booking_buy_bag: tạo bản ghi theo user + campaign_id, set booking_status/payment_status/finish_status theo case test.\nBảng tm_detail_campaigns: set các mốc thời gian campaign (register_started_at, register_expired_at, result_at, payment_expired_at, receive_started_at, receive_expired_at) để now rơi đúng cửa sổ test.',
      'Đăng nhập bằng account test tương ứng (mỗi account 1 trạng thái).\nXóa cache app hoặc force refresh Home để lấy dữ liệu mới.',
      'Home hiển thị đúng nhãn Nhật + CTA cho từng trạng thái; không hiển thị sai campaign.'
    ],
    [
      'Luồng 2 - Đăng ký bốc thăm',
      'Nộp đơn thành công khi trong thời gian mở đăng ký',
      'tm_detail_campaigns: now nằm trong [register_started_at, register_expired_at].\ntt_booking_buy_bag: user chưa có bản ghi book cho campaign hiện tại hoặc bản ghi chưa hoàn tất; booking_status cho phép đăng ký.\nDữ liệu cửa hàng nhận và shipping fee phải hợp lệ.',
      'Mở app bằng account chưa đăng ký.\nVào màn đăng ký LuckyBag, điền form đầy đủ, tick điều khoản + tick xác nhận "không hủy".',
      'Submit thành công, sinh đơn đăng ký mới và trạng thái user chuyển sang 2 (ORDERED_NO_RESULTS).'
    ],
    [
      'Luồng 3 - Xem kết quả bốc thăm',
      'Phân nhánh đúng trúng/trượt theo vòng',
      'tm_detail_campaigns: now >= result_at (đã tới thời điểm công bố).\ntt_booking_buy_bag: set booking_status kết quả tương ứng và book_number theo vòng.\nVới case trúng: payment_expired_at phải còn hạn để hiện CTA thanh toán.',
      'Đăng nhập account test theo từng nhánh.\nVào Home hoặc màn LuckyBag để trigger popup kết quả.',
      'Hiển thị đúng nội dung thông báo theo từng vòng; nhánh trúng có CTA đi thanh toán.'
    ],
    [
      'Luồng 4 - Thanh toán',
      'Trạng thái chuyển đúng sau callback thanh toán',
      'tt_booking_buy_bag: trạng thái trước thanh toán ở mức đã có kết quả trúng; payment_status ban đầu là chưa thanh toán.\ntm_detail_campaigns: payment_expired_at > now để cho phép thanh toán.\nChuẩn bị callback success/fail/timeout để verify update payment_status/finish_status.',
      'Từ màn trúng, nhấn "Tiến hành thanh toán".\nThực hiện thanh toán sandbox (thẻ test / PayPay test).',
      'Success: booking_status -> 4.\nFail hoặc quá hạn: giữ 3 hoặc sang 5 tùy rule deadline.'
    ],
    [
      'Luồng 5 - Nhận túi',
      'Xử lý đúng theo 2 phương thức nhận hàng',
      'tt_booking_buy_bag: payment_status đã thanh toán, booking_status ở bước chờ nhận; lưu thông tin nhận hàng theo kênh (shop_name hoặc địa chỉ giao).\ntm_detail_campaigns: now nằm trong [receive_started_at, receive_expired_at] để cho phép nhận hợp lệ.',
      'Mở màn LuckyBag chi tiết sau thanh toán.\nCase IN_STORE: xác nhận đã nhận.\nCase HOME_DELIVERY: kiểm tra link tracking.',
      'IN_STORE: xác nhận thành công -> trạng thái 8.\nHOME_DELIVERY: hiển thị mã vận đơn và tracking đúng.'
    ],
    [
      'Luồng 6 - Hết hạn thanh toán',
      'Mất quyền mua khi quá deadline',
      'tt_booking_buy_bag: user đã trúng nhưng payment_status vẫn chưa thanh toán.\ntm_detail_campaigns: payment_expired_at < now.\nBật job/cron hoặc chạy tay tiến trình chuyển trạng thái quá hạn.',
      'Mở app sau mốc deadline.\nVào Home/LuckyBag để nhận trạng thái mới.',
      'booking_status = 5; popup mất quyền mua chỉ hiển thị 1 lần theo rule.'
    ],
    [
      'Luồng 7 - Từ chối nhận túi',
      'Không cho khôi phục quyền mua sau từ chối',
      'tt_booking_buy_bag: tạo case user đủ điều kiện từ chối theo rule campaign và trạng thái hiện tại.\nGhi nhận thời điểm từ chối vào cột audit liên quan (nếu có).\ntm_detail_campaigns: campaign còn hiệu lực.',
      'Trong app, thực hiện thao tác từ chối theo đúng màn/CTA.',
      'booking_status = 1; không còn CTA thanh toán/nhận; không khôi phục bằng thao tác user thường.'
    ],
    [
      'Luồng 8 - Khảo sát sau sự kiện',
      'Hiển thị khảo sát đúng đối tượng và chỉ 1 lần',
      'tt_booking_buy_bag: user ở nhóm hết hạn hoặc từ chối theo trạng thái cuối.\nCờ khảo sát quá hạn chưa trả lời = false.\nCampaign survey active theo campaign_id liên kết.',
      'Mở app bằng account đúng điều kiện.\nTrả lời khảo sát và gửi.',
      'Hiển thị khảo sát 1 lần; submit thành công; lần sau không hiện lại (cờ answered=true).'
    ],
  ].forEach((r) => {
    s5.addRow(r);
    styleBody(s5.lastRow);
  });

  const s6 = wb.addWorksheet('6_Matrix_State_Book');
  s6.addRow([
    'LUỒNG',
    'BOOKING STATUS',
    'BOOK LẦN',
    'SETUP DB CHI TIẾT',
    'SETUP APP CHI TIẾT',
    'KẾT QUẢ MONG ĐỢI',
  ]);
  styleHeader(s6.getRow(1));

  const matrixRows = [
    [
      'Home',
      'Chưa có kết quả / chưa book',
      'book 1',
      'tt_booking_buy_bag: chưa có bản ghi book hoặc booking_status=000 theo rule seed của môi trường\ntm_detail_campaigns: now < register_started_at\nCampaign active đúng brand/campaign_id',
      'Đăng nhập account test trạng thái 0\nClear app cache hoặc force refresh Home',
      'Hiển thị nhãn mở đăng ký (申し込み受付開始) và chưa có CTA nộp đơn',
    ],
    [
      'Home',
      'Đang mở đăng ký',
      'book 1',
      'tt_booking_buy_bag: booking_status=001, payment_status=101\ntm_detail_campaigns: register_started_at <= now <= register_expired_at\nNếu là book lần 3 thì phải seed qua batch batches/booking_lucky_bag/v1/register_event_data',
      'Mở Home -> khu vực LuckyBag\nNhấn CTA đăng ký để verify điều hướng',
      'Hiển thị nhãn đang nhận đăng ký vòng 1 (申し込み受付中) + CTA đi đăng ký',
    ],
    [
      'Home',
      'Trúng - chờ thanh toán',
      'book 1',
      'tt_booking_buy_bag: booking_status=200, payment_status=101\ntm_detail_campaigns: now >= result_at và payment_expired_at > now\nKết quả trúng phải được sinh bởi batch batches/booking_lucky_bag/v2/update_result_lucky',
      'Mở Home sau khi đã nộp đơn vòng 1',
      'Hiển thị trạng thái trúng, còn CTA thanh toán trong hạn',
    ],
    [
      'Home',
      'Trượt',
      'book 1',
      'tt_booking_buy_bag: booking_status=002\ntm_detail_campaigns: kết quả đã được sinh bởi batch batches/booking_lucky_bag/v2/update_result_lucky',
      'Mở Home account trượt vòng 1',
      'Hiển thị trạng thái trượt, không có CTA thanh toán',
    ],
    [
      'Home',
      'Book lần 3',
      'book 3',
      'tt_booking_buy_bag: booking_status=001, payment_status=101\ntm_detail_campaigns: now nằm trong lần book thứ 3\nSeed dữ liệu book 3 phải chạy batch batches/booking_lucky_bag/v1/register_event_data',
      'Mở Home bằng account đã có đủ điều kiện book lần 3',
      'Hiển thị đúng trạng thái book lần 3 và CTA đăng ký tương ứng',
    ],
    [
      'Home',
      'Hết hạn thanh toán',
      'book 1/2/3',
      'tt_booking_buy_bag: booking_status=201, payment_status=101, finish_status=202\ntm_detail_campaigns: payment_expired_at < now\nBatch cần chạy: batches/booking_lucky_bag/v2/update_payment_status',
      'Mở Home sau khi job hết hạn thanh toán chạy xong',
      'Hiển thị trạng thái đã hết hạn thanh toán, không còn CTA thanh toán',
    ],
    [
      'Home',
      'Từ chối thanh toán',
      'book 1/2/3',
      'tt_booking_buy_bag: booking_status=201, payment_status=101, finish_status=206\ntm_detail_campaigns: payment_expired_at < now hoặc rule từ chối thanh toán được kích hoạt\nBatch cần chạy: batches/booking_lucky_bag/v2/update_payment_status',
      'Mở Home account đã từ chối thanh toán',
      'Hiển thị trạng thái từ chối thanh toán, không còn CTA thanh toán',
    ],
    [
      'Home',
      'Đã thanh toán, chưa nhận túi',
      'book 1/2/3',
      'tt_booking_buy_bag: booking_status=201, payment_status=104, finish_status=201\ntm_detail_campaigns: user đã thanh toán thành công và đang chờ nhận túi',
      'Mở Home account đã thanh toán nhưng chưa nhận túi',
      'Hiển thị trạng thái đã thanh toán, chờ nhận túi',
    ],
    [
      'Home',
      'Đã nhận túi',
      'book 1/2/3',
      'tt_booking_buy_bag: booking_status=201, payment_status=104, finish_status=200\ntm_detail_campaigns: user đã xác nhận nhận túi hoặc hệ thống ghi nhận hoàn tất',
      'Mở Home account đã nhận hàng',
      'Hiển thị trạng thái hoàn tất; không còn CTA nghiệp vụ đang xử lý',
    ],

    [
      'Đăng ký bốc thăm',
      '7 - BY_BOOKED_TIME',
      'book 1',
      'tt_booking_buy_bag: booking_status=7, book_number=1, chưa có bản ghi đăng ký hợp lệ\ntm_detail_campaigns: register_started_at <= now <= register_expired_at\nUser hợp lệ theo policy campaign',
      'Vào màn đăng ký từ Home\nĐiền thông tin + tick điều khoản + tick không hủy',
      'Submit thành công, sinh application_round1 và chuyển trạng thái về 2',
    ],
    [
      'Đăng ký bốc thăm',
      '7 - BY_BOOKED_TIME',
      'book 2',
      'tt_booking_buy_bag: booking_status=7, book_number=2 sau khi trượt vòng 1\ntm_detail_campaigns: cửa sổ đăng ký lần 2 đang mở\nChưa có dữ liệu đăng ký lần 2',
      'Vào lại màn đăng ký vòng 2\nĐiền đủ thông tin và submit',
      'Nộp đơn vòng 2 thành công, trạng thái chuyển 2 (chờ kết quả vòng 2)',
    ],
    [
      'Đăng ký bốc thăm',
      '7 - BY_BOOKED_TIME',
      'book 3 (nếu áp dụng)',
      'tt_booking_buy_bag: booking_status cho phép đăng ký, book_number=3\ntm_detail_campaigns: cửa sổ đăng ký book 3 đang mở (nếu campaign hỗ trợ)\nChưa có dữ liệu đăng ký book 3',
      'Mở màn đăng ký vòng 3 và submit',
      'Nộp đơn thành công nếu campaign bật vòng 3',
    ],
    [
      'Đăng ký bốc thăm',
      '7 - BY_BOOKED_TIME (validation lỗi)',
      'book 1/2/3',
      'tm_detail_campaigns vẫn trong cửa sổ đăng ký nhưng dữ liệu cấu hình chưa đủ hoặc sai rule\ntt_booking_buy_bag không được tạo bản ghi mới khi validate fail',
      'Cố submit với dữ liệu thiếu/sai',
      'Hiển thị lỗi đúng field/đúng popup, không tạo đơn đăng ký',
    ],

    [
      'Xem kết quả bốc thăm',
      '3 - ORDERED_RESULTS',
      'book 1 - WIN',
      'tt_booking_buy_bag: booking_status=3, book_number=1, kết quả trúng\ntm_detail_campaigns: now >= result_at và payment_expired_at > now',
      'Mở Home/màn LuckyBag để nhận popup',
      'Popup trúng vòng 1 + CTA thanh toán, wording đúng hạn thanh toán',
    ],
    [
      'Xem kết quả bốc thăm',
      '3 - ORDERED_RESULTS',
      'book 1 - LOSE',
      'tt_booking_buy_bag: booking_status=3, book_number=1, kết quả trượt\ntm_detail_campaigns: mở cửa sổ đăng ký vòng tiếp theo (nếu có)',
      'Mở Home/màn kết quả',
      'Hiển thị thông báo trượt vòng 1 và hướng dẫn tham gia vòng 2',
    ],
    [
      'Xem kết quả bốc thăm',
      '3 - ORDERED_RESULTS',
      'book 2 - WIN',
      'tt_booking_buy_bag: booking_status=3, book_number=2, kết quả trúng vòng 2\ntm_detail_campaigns: now >= result_at và payment_expired_at > now',
      'Mở app account trúng vòng 2',
      'Hiển thị thông báo trúng vòng 2 + CTA thanh toán',
    ],
    [
      'Xem kết quả bốc thăm',
      '3 - ORDERED_RESULTS',
      'book 2 - LOSE',
      'tt_booking_buy_bag: booking_status=3, book_number=2, kết quả trượt vòng 2\ntm_detail_campaigns: policy vòng 3/bổ sung theo campaign',
      'Mở app account trượt vòng 2',
      'Hiển thị thông báo trượt cuối hoặc thông điệp chờ bốc thăm bổ sung theo policy',
    ],
    [
      'Xem kết quả bốc thăm',
      '3 - ORDERED_RESULTS',
      'book 3 - WIN_SUPPLEMENT',
      'tt_booking_buy_bag: booking_status=3, book_number=3, kết quả trúng bổ sung\ntm_detail_campaigns: now >= result_at và payment_expired_at > now',
      'Mở app account trúng bổ sung',
      'Hiển thị đúng thông điệp trúng bổ sung + CTA thanh toán',
    ],
    [
      'Xem kết quả bốc thăm',
      '3 - ORDERED_RESULTS (overdue)',
      'book 1/2/3',
      'tt_booking_buy_bag: vẫn đang ở trạng thái có thể thanh toán nhưng payment_status chưa update quá hạn\ntm_detail_campaigns: payment_expired_at < now\nTest cạnh biên trước/sau job chuyển trạng thái',
      'Mở app tại mốc sát deadline',
      'Sau job/refresh phải chuyển về 5; không cho thanh toán nếu đã quá hạn',
    ],
  ];

  matrixRows.forEach((r) => {
    s6.addRow(r);
    styleBody(s6.lastRow);
  });
  setWidths(s6, [26, 24, 20, 58, 45, 40]);
  setWidths(s5, [28, 24, 55, 45, 35]);

  s5.addRow([]);
  s5.addRow(['CHECKLIST CHUNG', 'NỘI DUNG', 'MẪU GIÁ TRỊ', 'AI CHỊU TRÁCH NHIỆM', 'GHI CHÚ']);
  styleHeader(s5.getRow(s5.lastRow.number));
  [
    ['Đồng bộ thời gian', 'Đảm bảo server/app cùng timezone khi test deadline', 'Asia/Tokyo hoặc timezone theo môi trường', 'Ops + QA', 'Sai timezone là lỗi phổ biến nhất ở luồng quá hạn'],
    ['Bảng tt_booking_buy_bag', 'Bảng lưu trạng thái book của user', 'Các cột trọng tâm: booking_status, payment_status, finish_status, campaign_id, shop_name_1, shop_name_2', 'Dev + QA', 'Dùng để seed dữ liệu theo từng trạng thái/từng lần book'],
    ['Mã booking_status', 'Mapping mã trạng thái book', '001: đã book; 200: trúng; 002: không trúng', 'BA + Dev + QA', 'Seed đúng mã để app hiển thị đúng nhánh'],
    ['Mã payment_status', 'Mapping mã trạng thái thanh toán', '101: chưa đăng ký thanh toán; 102: đã đăng ký thanh toán; 103: có lỗi khi đăng ký thanh toán; 104: đã thanh toán; 105: có lỗi khi thanh toán', 'Dev + QA', 'Dùng để test callback và nhánh lỗi thanh toán'],
    ['Mã finish_status', 'Mapping mã trạng thái hoàn tất/quà', '201: chưa lấy quà; 200: đã lấy quà; 202: quà hạn nhưng chưa đăng ký thanh toán (batch hạn dự tính); 203: quà ngày nhận quà (batch auto thanh toán); 204: quà hạn dù đã thanh toán nhấn confirm; 205: cancel bằng CMS; 206: trúng nhưng từ chối thanh toán', 'BA + Dev + QA', 'Dùng cho luồng nhận quà, quá hạn, từ chối'],
    ['Bảng tm_detail_campaigns', 'Bảng setup mốc thời gian chiến dịch', 'Các cột trọng tâm: register_started_at, register_expired_at, result_at, payment_expired_at, receive_started_at, receive_expired_at, campaign_expired_at, book_number', 'BA + Dev + Ops', 'Dùng để điều khiển cửa sổ đăng ký, công bố kết quả, thanh toán, nhận hàng'],
    ['Tài khoản test', 'Mỗi trạng thái nên có account riêng', 'lb_user_s0 ... lb_user_s8', 'QA', 'Tránh dùng chung account gây đè trạng thái'],
    ['Dữ liệu campaign', 'Chỉ active 1 campaign test để dễ quan sát', 'campaign_id_test_2026', 'BA + Ops', 'Nhiều campaign active dễ gây nhầm nhãn'],
    ['Sandbox thanh toán', 'Dùng môi trường sandbox cho test', 'payment_env=sandbox', 'Dev + Ops', 'Không test trực tiếp payment production'],
    ['Log & theo dõi', 'Bật log event để debug state transition', 'event: lb_state_changed', 'Dev + QA', 'Giúp trace nhanh khi mismatch UI/DB'],
  ].forEach((r) => {
    s5.addRow(r);
    styleBody(s5.lastRow);
  });

  const out = process.argv[2] || path.resolve(
    __dirname,
    '../../../Release/7.4.0 (Android 16KB, Tăng độ sáng màn hình giỏ coupon, thêm 2 loại popup)/Huong_dan_onboarding_zluckybag.xlsx'
  );

  await wb.xlsx.writeFile(out);
  console.log(`WROTE: ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
