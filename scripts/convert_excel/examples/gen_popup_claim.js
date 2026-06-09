// =============================================================================
// gen_popup_claim.js — DATA file cho feature Popup Claim (v7.4.0)
// Engine/format dùng chung: testcase_builder.js (clone style từ mẫu Push).
// Chạy: node gen_popup_claim.js "<output.xlsx>"
// =============================================================================

const path = require('path');
const { generateTestcase } = require('../testcase_builder');

const FUNCTION_NAME = 'Popup Claim';
const CREATOR = 'QuynhNT';
const CREATE_DATE = '2026-06-09';
const RELEASE = '7.4.0';
const DEVICES = ['iOS', 'Android'];

// --- GUI: layout, title/message, button, style hiển thị ---------------------
const guiSection = {
  title: 'Xác nhận hiển thị Popup Claim',
  rows: [
    { to: 'Layout popup', sub: 'Tổng thể', input: '[Tiền điều kiện] Đã trigger điều kiện hiển thị popup claim (1 claim đổi status 001→200)\n1. Cold start app, đăng nhập\n2. Điều hướng tới màn Home\n3. Quan sát popup claim', output: '1. Popup claim hiển thị ở giữa màn Home\n2. Nền sau popup bị làm mờ (overlay)\n3. Bố cục popup đúng thiết kế theo từng brand' },
    { to: 'Title', sub: 'Nội dung text', input: '[Tiền điều kiện] Popup claim đang hiển thị\n1. Quan sát dòng Title của popup', output: 'Title hiển thị đúng: "{point_name}登録申請に返信が届きました。"' },
    { to: 'Title', sub: 'point_name theo brand', input: '[Tiền điều kiện] Popup claim đang hiển thị trên brand đang chạy\n1. Quan sát phần {point_name} ở đầu Title', output: '{point_name} hiển thị đúng theo brand hiện hành và đứng ở đầu Title' },
    { to: 'Message', sub: 'Nội dung text', input: '[Tiền điều kiện] Popup claim đang hiển thị\n1. Quan sát dòng Message', output: 'Message hiển thị đúng: "申請履歴からご確認ください。"' },
    { to: 'Button 申請履歴へ', sub: 'Hiển thị', input: '[Tiền điều kiện] Popup claim đang hiển thị\n1. Quan sát button 申請履歴へ', output: 'Button "申請履歴へ" hiển thị đúng label, style và vị trí theo thiết kế' },
    { to: 'Button 後で確認する', sub: 'Hiển thị', input: '[Tiền điều kiện] Popup claim đang hiển thị\n1. Quan sát button 後で確認する', output: 'Button "後で確認する" hiển thị đúng label, style và vị trí theo thiết kế' },
    { to: 'Nút đóng X', sub: 'Hiển thị', input: '[Tiền điều kiện] Popup claim đang hiển thị\n1. Quan sát nút đóng X', output: 'Nút X hiển thị ở góc trên popup đúng thiết kế' },
  ],
};

// --- LOGIC: chia đúng 4 mục theo spec ---------------------------------------
const logicSections = [
  { title: '1. Điều kiện hiển thị', rows: [
    { to: '1 claim đổi trạng thái', sub: 'TH1: 001→200 (対応完了)', input: '[Tiền điều kiện] User có đúng 1 claim ở trạng thái 申請中 (001)\n1. Backend đổi trạng thái claim 001→200 (対応完了)\n2. Cold start app, đăng nhập\n3. Vào màn Home', output: '1. Popup claim hiển thị trên màn Home\n2. Title/Message đúng spec\n3. Popup hiển thị do có thay đổi trạng thái claim' },
    { to: '1 claim đổi trạng thái', sub: 'TH1: 001→401 (対応不可)', input: '[Tiền điều kiện] User có đúng 1 claim ở trạng thái 申請中 (001)\n1. Backend đổi trạng thái claim 001→401 (対応不可)\n2. Cold start app, đăng nhập\n3. Vào màn Home', output: '1. Popup claim hiển thị trên màn Home\n2. Title/Message đúng spec' },
    { to: '1 claim đổi trạng thái', sub: 'TH1: 001→500 (その他)', input: '[Tiền điều kiện] User có đúng 1 claim ở trạng thái 申請中 (001)\n1. Backend đổi trạng thái claim 001→500 (その他)\n2. Cold start app, đăng nhập\n3. Vào màn Home', output: '1. Popup claim hiển thị trên màn Home\n2. Title/Message đúng spec' },
    { to: '1 claim đổi trạng thái', sub: 'TH1: 001→003 (status hợp lệ khác)', input: '[Tiền điều kiện] User có đúng 1 claim ở trạng thái 申請中 (001)\n1. Backend đổi trạng thái claim 001→003\n2. Cold start app, đăng nhập\n3. Vào màn Home', output: '1. Popup claim hiển thị trên màn Home (mọi thay đổi status ≠ 001 đều trigger)\n2. Title/Message đúng spec' },
    { to: '1 claim đổi trạng thái', sub: 'TH2: status vẫn 500 nhưng có message mới', input: '[Tiền điều kiện] Claim đang ở status 500, đã hiển thị popup cho lần 500 trước đó\n1. Backend trả về message mới (status vẫn giữ 500)\n2. Cold start app\n3. Vào màn Home', output: '1. Mỗi lần có message mới (dù status vẫn 500) = 1 thay đổi → popup hiển thị\n2. Popup chỉ hiển thị 1 lần cho thay đổi này\n3. Title/Message vẫn dùng text cố định theo spec' },
    { to: 'Nhiều claim đổi trạng thái', sub: 'Gộp 2 claim thành 1 popup chung', input: '[Tiền điều kiện] User có nhiều claim cùng pending (vd 2 claim)\n1. Backend đổi đồng thời 2 claim: 001→003 và 001→200\n2. Cold start app\n3. Vào màn Home', output: '1. Chỉ hiển thị 1 popup claim chung cho nhiều thay đổi\n2. Không hiển thị nhiều popup chồng nhau\n3. Title/Message dùng text cố định theo spec (không hiển thị số lượng)' },
    { to: 'Nhiều claim đổi trạng thái', sub: 'BVA: 3 claim đổi status cùng lúc vẫn gộp 1 popup', input: '[Tiền điều kiện] User có 3 claim cùng pending\n1. Backend đổi đồng thời 3 claim: 001→200, 001→401, 001→500\n2. Cold start app\n3. Vào màn Home', output: '1. Chỉ hiển thị đúng 1 popup claim chung\n2. Không hiển thị nhiều popup chồng nhau' },
    { to: '1 claim đổi trạng thái nhiều lần', sub: '001→401→200 qua nhiều lần cold start', input: '[Tiền điều kiện] 1 claim ở status 001\n1. Backend đổi 001→401\n2. Cold start app, vào Home (lần 1)\n3. Đóng popup\n4. Backend đổi 401→200\n5. Cold start app, vào Home (lần 2)', output: '1. Lần cold start 1: popup hiển thị cho thay đổi →401\n2. Lần cold start 2: popup hiển thị cho thay đổi →200\n3. Mỗi thay đổi status hiển thị popup đúng 1 lần' },
    { to: 'Vị trí hiển thị', sub: 'Trên màn Home', input: '[Tiền điều kiện] Có thay đổi status claim chưa hiển thị\n1. Cold start app\n2. Điều hướng tới màn Home', output: 'Popup claim hiển thị trên màn hình Home (không hiển thị ở màn khác)' },
    { to: 'Vị trí hiển thị', sub: 'Popup chờ tới khi vào Home', input: '[Tiền điều kiện] Có thay đổi status claim; sau cold start user không ở màn Home\n1. Cold start app, đăng nhập\n2. App mở vào màn khác (không phải Home)\n3. Điều hướng tới màn Home', output: '1. Popup chưa hiển thị khi chưa vào Home\n2. Popup hiển thị ngay khi user vào màn Home trong cùng phiên' },
    { to: 'Quy tắc chỉ hiển thị 1 lần', sub: 'Logout/login không hiện lại', input: '[Tiền điều kiện] Popup claim đã hiển thị 1 lần cho 1 thay đổi status\n1. Đóng popup\n2. Logout\n3. Login lại\n4. Vào màn Home', output: 'Popup claim KHÔNG hiển thị lại (mỗi thay đổi status chỉ hiện 1 lần duy nhất)' },
    { to: 'Quy tắc chỉ hiển thị 1 lần', sub: 'Kill app mở lại không hiện lại', input: '[Tiền điều kiện] Popup claim đã hiển thị 1 lần cho 1 thay đổi status\n1. Đóng popup\n2. Kill app hoàn toàn\n3. Mở lại app, vào màn Home', output: 'Popup claim KHÔNG hiển thị lại' },
    { to: 'Không có thay đổi status', sub: 'Không hiển thị popup', input: '[Tiền điều kiện] Không có claim nào đổi trạng thái\n1. Cold start app\n2. Vào màn Home', output: 'Không hiển thị popup claim' },
    { to: 'Chưa đăng nhập', sub: 'Không hiển thị popup', input: '[Tiền điều kiện] Có claim đã đổi trạng thái nhưng user chưa đăng nhập\n1. Cold start app\n2. Không đăng nhập, ở màn chưa login', output: 'Không hiển thị popup claim khi chưa đăng nhập' },
    { to: 'Mất kết nối mạng', sub: 'Không hiển thị popup', input: '[Tiền điều kiện] Có claim đã đổi trạng thái\n1. Tắt mạng (Wi-Fi/4G)\n2. Cold start app, đăng nhập\n3. Vào màn Home', output: '1. Không hiển thị popup claim (không lấy được trạng thái claim)\n2. App không bị crash' },
    { to: 'API timeout/chậm', sub: 'Xử lí như mất mạng', input: '[Tiền điều kiện] Có claim đã đổi trạng thái; API trạng thái claim phản hồi chậm/timeout\n1. Giả lập API trạng thái claim timeout\n2. Cold start app, đăng nhập\n3. Vào màn Home', output: '1. Không hiển thị popup claim\n2. App không crash, không treo màn hình' },
  ]},
  { title: '2. Xử lí popup', rows: [
    { to: 'Tương tác ngoài popup', sub: 'Tap ra ngoài popup', input: '[Tiền điều kiện] Popup claim đang hiển thị\n1. Tap vào vùng nền mờ bên ngoài popup', output: 'Popup KHÔNG đóng, vẫn hiển thị bình thường' },
    { to: 'Tương tác ngoài popup', sub: 'App background → foreground', input: '[Tiền điều kiện] Popup claim đang hiển thị\n1. Cho app xuống background\n2. Đưa app trở lại foreground', output: 'Popup vẫn hiển thị (không đóng), không trigger popup mới' },
    { to: 'Button 申請履歴へ', sub: 'Tap button', input: '[Tiền điều kiện] Popup claim đang hiển thị\n1. Tap button 申請履歴へ', output: '1. Popup đóng\n2. Mở màn hình list lịch sử claim' },
    { to: 'Button 後で確認する', sub: 'Tap button', input: '[Tiền điều kiện] Popup claim đang hiển thị\n1. Tap button 後で確認する', output: 'Popup đóng, trở về màn Home' },
    { to: 'Nút X', sub: 'Tap nút X', input: '[Tiền điều kiện] Popup claim đang hiển thị\n1. Tap nút X', output: 'Popup đóng, trở về màn Home' },
    { to: 'Chấm tròn thông báo', sub: 'Sau khi tap 申請履歴へ', input: '[Tiền điều kiện] Popup claim đang hiển thị, đang có chấm tròn thông báo\n1. Tap button 申請履歴へ\n2. Quay lại Home, quan sát icon thông báo', output: 'Chấm tròn thông báo VẪN còn (tap 申請履歴へ không làm mất chấm tròn)' },
    { to: 'Chấm tròn thông báo', sub: 'Sau khi tap 後で確認する', input: '[Tiền điều kiện] Popup claim đang hiển thị, đang có chấm tròn thông báo\n1. Tap button 後で確認する đóng popup\n2. Quan sát icon thông báo', output: 'Chấm tròn thông báo VẪN còn (tap 後で確認する không làm mất chấm tròn)' },
    { to: 'Chấm tròn thông báo', sub: 'Sau khi tap X', input: '[Tiền điều kiện] Popup claim đang hiển thị, đang có chấm tròn thông báo\n1. Tap nút X đóng popup\n2. Quan sát icon thông báo', output: 'Chấm tròn thông báo VẪN còn (tap X không làm mất chấm tròn)' },
  ]},
  { title: '3. Thứ tự hiển thị popup', rows: [
    { to: 'Thứ tự ưu tiên popup', sub: 'Chuỗi ưu tiên đầy đủ', input: '[Tiền điều kiện] Nhiều popup cùng đủ điều kiện hiển thị\n1. Cold start app, đăng nhập\n2. Lần lượt đóng từng popup\n3. Quan sát thứ tự hiển thị', output: 'Thứ tự: login → túi phúc → claim → pizza sắp hết hạn → checkin → điểm hết hạn → thông báo sản phẩm mới → update → off cờ scan waiting QR' },
    { to: 'Thứ tự ưu tiên popup', sub: 'Claim sau túi phúc, trước pizza', input: '[Tiền điều kiện] Popup túi phúc, claim và pizza cùng đủ điều kiện\n1. Đóng popup login (nếu có)\n2. Đóng popup túi phúc\n3. Quan sát popup tiếp theo\n4. Đóng popup claim\n5. Quan sát popup tiếp theo', output: '1. Sau popup túi phúc hiển thị popup claim\n2. Sau popup claim hiển thị popup pizza sắp hết hạn' },
  ]},
  { title: '4. Xử lí button ← ở màn hình lịch sử', rows: [
    { to: 'Điều hướng button ←', sub: 'Vào lịch sử từ popup 申請履歴へ', input: '[Tiền điều kiện] Popup claim đang hiển thị\n1. Tap button 申請履歴へ để vào màn lịch sử claim\n2. Tap button ← trên màn lịch sử', output: 'Quay về màn hình Home' },
    { to: 'Điều hướng button ←', sub: 'Vào lịch sử từ màn Send Claim', input: '[Tiền điều kiện] Đang ở màn Send Claim\n1. Điều hướng vào màn lịch sử claim từ màn Send Claim\n2. Tap button ← trên màn lịch sử', output: 'Quay về màn hình Send Claim' },
  ]},
];

(async () => {
  const out = process.argv[2] || path.join(__dirname, `【APP】${FUNCTION_NAME}.xlsx`);
  const res = await generateTestcase({
    functionName: FUNCTION_NAME,
    creator: CREATOR,
    createDate: CREATE_DATE,
    release: RELEASE,
    devices: DEVICES,
    sheetPrefix: 'Popup_Claim',
    guiSection,
    logicSections,
    output: out,
  });
  console.log('WROTE:', res.output, '| GUI:', res.gui, '| LOGIC:', res.logic);
})();
