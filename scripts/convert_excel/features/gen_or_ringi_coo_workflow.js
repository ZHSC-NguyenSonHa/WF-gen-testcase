// gen_or_ringi_coo_workflow.js — OR稟議書 (COO決裁) Workflow Testcase
// Creator: ThuNT | Date: 2026-08-24 | Template: testcase_template_workflow.xlsx
// Source spec: CMS/Spec/OR稟議/wf_coo_spec_analysis.md
"use strict";
const path = require("path");
const ExcelJS = require("exceljs");

const TEMPLATE = path.resolve(__dirname, "..", "..", "..", "templates", "testcase", "testcase_template_workflow.xlsx");
const OUTPUT   = path.resolve(__dirname, "..", "..", "..", "CMS", "Testcase", "【CMS】OR稟議書_COO決裁_ワークフロー.xlsx");
const SHEET    = "ワークフロー";
const CREATOR  = "ThuNT";
const TODAY    = new Date("2026-08-24");

// Luồng COO決裁 CHỈ có 7 node (申請者→OR管理課→部門長→統括部長→本部長→各社COO→TCO), KHÔNG có 担当役員/秘書室/決裁者 (khác CEO決裁)
// TCO là node CÓ ĐIỀU KIỆN (giống cơ chế 担当役員 ở CEO決裁): 会社名 KHÔNG có setting user TCO trong 承認者マスタ
//   → khi 各社COO bấm 承認 → bản ghi HOÀN THÀNH NGAY (bỏ qua TCO); nếu CÓ setting → tiếp tục đến TCO 承認 → hoàn thành
// 6 group chính (tương tự cấu trúc CEO決裁, rút gọn theo chain 7 node):
// - Group A: 店舗 + ngoài SK + Full Node (TCO có setting) — có case 業態COOコメント đã/chưa nhập ảnh hưởng mail 業態記入 (gửi đến 各社COO)
// - Group B: 店舗 + SK + Full Node — mail 業態記入 KHÔNG gửi trong mọi trường hợp nhập, nhưng vẫn bắt buộc nhập 業態記入欄
// - Group C: 店舗 + ngoài SK + Not Full Node — 会社名 KHÔNG có setting user TCO trong 承認者マスタ nên node TCO bị skip
//   (各社COO duyệt xong → bản ghi hoàn thành (完了) NGAY, bỏ qua TCO)
// - Group D: 事務所 + Full Node — bản ghi loại 事務所 không có trường 業態/業態COOコメント nên KHÔNG có button nhập vùng 業態記入
//   ở bất kỳ node/関係者 nào trong suốt luồng
// - Group E: Action 差し戻し (Reject) — user tại node hiện tại đang giữ bản ghi thực hiện; về chân 申請者,
//   XÓA dấu 承認 của TẤT CẢ node đã đóng dấu trước đó (reset toàn bộ chain); nếu tại/sau 部門長 thì 関係者 bị revoke quyền xem
// - Group F: Action 引き戻し (Recall) — chỉ user ĐÃ đóng dấu 承認 mới thực hiện được; kéo bản ghi về lại CHÍNH MÌNH,
//   CHỈ xóa dấu của chính user đó (không ảnh hưởng dấu node khác); nếu chính là 部門長 thì 関係者 vẫn bị ảnh hưởng vì dấu kích hoạt 関係 bị xóa
// Group A-D đều có case 関係 chưa done khi 本部長 duyệt → không gửi mail 承認 đến 各社COO
// TC data: [no, daiko, chuko(empty), shoko, condition, user, input, output]
const TC = [
  // ===== Group A: 店舗 + ngoài SK + Full Node (TCO có setting) =====
  [1, "OR稟議書(COO決裁)_Full Node_店舗_ngoài SK", "", "Node_name",
   "Full Node\n稟議種類 = 店舗\n業態 khác SK (loại ngoài SK)\n会社名 đã chọn có setting user TCO trong 承認者マスタ (TCO active)\n業態COOコメント: chưa nhập (trống)", "",
   "User 申請者 tạo bản ghi và bấm 承認 (submit)",
   "- Status là OR管理課待ち\n- Gửi mail 承認 đến user OR管理課"],
  [2, "OR稟議書(COO決裁)_Full Node_店舗_ngoài SK", "", "Node_name",
   "業態COOコメント CHƯA được nhập (còn trống) tính đến thời điểm OR管理課 duyệt", "",
   "User OR管理課 shounin",
   "- Status là 部門長待ち\n- Gửi mail 承認 đến user 部門長\n- Gửi mail 業態記入 đến user 各社COO (vì 業態COOコメント trống và bản ghi loại ngoài SK)"],
  [3, "OR稟議書(COO決裁)_Full Node_店舗_ngoài SK", "", "Node_name",
   "業態COOコメント ĐÃ được nhập trước đó (không còn trống) bởi user 関係者/各社COO/TCO, tính đến thời điểm OR管理課 duyệt", "",
   "User OR管理課 shounin",
   "- Status là 部門長待ち\n- Gửi mail 承認 đến user 部門長\n- KHÔNG gửi mail 業態記入 (vì 業態COOコメント đã có dữ liệu, không còn trống)"],
  [4, "OR稟議書(COO決裁)_Full Node_店舗_ngoài SK", "", "Nhập 業態COOコメント",
   "Bản ghi đang ở status 部門長待ち (chưa đến lượt duyệt của 各社COO)", "",
   "User 各社COO bấm button trên toolbar và nhập 業態COOコメント",
   "- Nhập/lưu 業態COOコメント thành công dù chưa đến lượt duyệt\n- Status không đổi"],
  [5, "OR稟議書(COO決裁)_Full Node_店舗_ngoài SK", "", "Node_name", "", "",
   "User 部門長 shounin",
   "- Status là 統括部長待ち\n- Gửi mail 承認 đến user 統括部長\n- 関係 bắt đầu: Gửi mail đến toàn bộ user 関係者 đã assign"],
  [6, "OR稟議書(COO決裁)_Full Node_店舗_ngoài SK", "", "User kankeisha 1",
   "Random 2 user 関係者 đã assign", "",
   "User 関係者1 shounin\nNhập vùng 業態記入欄 và 業態COOコメント (vì 稟議種類 = 店舗)",
   "- Status vẫn là 統括部長待ち (không đổi)"],
  [7, "OR稟議書(COO決裁)_Full Node_店舗_ngoài SK", "", "User kankeisha 2",
   "User 関係者 cuối cùng shounin", "",
   "User 関係者2 (kankei cuối) shounin",
   "- Status vẫn là 統括部長待ち\n- Toàn bộ 関係者 đã hoàn thành承認 (kankei done)"],
  [8, "OR稟議書(COO決裁)_Full Node_店舗_ngoài SK", "", "Node_name", "", "",
   "User 統括部長 shounin",
   "- Status là 本部長待ち\n- Gửi mail 承認 đến user 本部長"],
  [9, "OR稟議書(COO決裁)_Full Node_店舗_ngoài SK", "", "Node_name",
   "関係者 CHƯA hoàn thành 承認 (còn ít nhất 1 user 関係者 chưa done) tại thời điểm 本部長 duyệt", "",
   "User 本部長 shounin",
   "- Status là 各社COO待ち\n- KHÔNG gửi mail 承認 đến user 各社COO (vì còn 関係者 chưa hoàn thành)\n- Bản ghi bị block cho đến khi toàn bộ 関係者 hoàn thành"],
  [10, "OR稟議書(COO決裁)_Full Node_店舗_ngoài SK", "", "Node_name",
   "Kankei done (đã hoàn thành ở TC7)", "",
   "User 本部長 shounin",
   "- Status là 各社COO待ち\n- Gửi mail 承認 đến user 各社COO (vì tất cả 関係者 đã done)\n- 関係 kết thúc tại node này"],
  [11, "OR稟議書(COO決裁)_Full Node_店舗_ngoài SK", "", "Node_name",
   "会社名 đã chọn CÓ setting user TCO trong 承認者マスタ", "",
   "User 各社COO shounin\nNhập vùng 業態記入欄",
   "- Status là TCO待ち\n- Gửi mail 承認 đến user TCO"],
  [12, "OR稟議書(COO決裁)_Full Node_店舗_ngoài SK", "", "Node_name", "", "",
   "User TCO shounin\nNhập vùng 業態記入欄",
   "- Status là 完了\n- Gửi mail Done đến ALL user trên node"],

  // ===== Group B: 店舗 + SK + Full Node (TCO có setting) =====
  [13, "OR稟議書(COO決裁)_Full Node_店舗_SK", "", "Node_name",
   "Full Node\n稟議種類 = 店舗\n業態 = SK\n会社名 đã chọn có setting user TCO trong 承認者マスタ (TCO active)\n業態COOコメント: chưa nhập (trống)", "",
   "User 申請者 tạo bản ghi và bấm 承認 (submit)",
   "- Status là OR管理課待ち\n- Gửi mail 承認 đến user OR管理課"],
  [14, "OR稟議書(COO決裁)_Full Node_店舗_SK", "", "Node_name",
   "業態COOコメント CHƯA được nhập (còn trống) tính đến thời điểm OR管理課 duyệt", "",
   "User OR管理課 shounin",
   "- Status là 部門長待ち\n- Gửi mail 承認 đến user 部門長\n- KHÔNG gửi mail 業態記入 (vì bản ghi loại SK, dù comment còn trống)"],
  [15, "OR稟議書(COO決裁)_Full Node_店舗_SK", "", "Node_name",
   "業態COOコメント ĐÃ được nhập trước đó (không còn trống) bởi user 関係者/各社COO/TCO, tính đến thời điểm OR管理課 duyệt", "",
   "User OR管理課 shounin",
   "- Status là 部門長待ち\n- Gửi mail 承認 đến user 部門長\n- KHÔNG gửi mail 業態記入 (vì bản ghi loại SK; dữ liệu đã nhập không làm phát sinh mail)"],
  [16, "OR稟議書(COO決裁)_Full Node_店舗_SK", "", "Nhập 業態COOコメント",
   "Bản ghi đang ở status 部門長待ち (chưa đến lượt duyệt của TCO)", "",
   "User TCO bấm button trên toolbar và nhập 業態COOコメント",
   "- Nhập/lưu 業態COOコメント thành công dù chưa đến lượt duyệt\n- Status không đổi"],
  [17, "OR稟議書(COO決裁)_Full Node_店舗_SK", "", "Node_name", "", "",
   "User 部門長 shounin",
   "- Status là 統括部長待ち\n- Gửi mail 承認 đến user 統括部長\n- 関係 bắt đầu: Gửi mail đến toàn bộ user 関係者 đã assign"],
  [18, "OR稟議書(COO決裁)_Full Node_店舗_SK", "", "User kankeisha 1",
   "Random 2 user 関係者 đã assign", "",
   "User 関係者1 shounin\nVẫn BẮT BUỘC nhập vùng 業態記入欄 dù bản ghi loại SK",
   "- Status vẫn là 統括部長待ち (không đổi)"],
  [19, "OR稟議書(COO決裁)_Full Node_店舗_SK", "", "User kankeisha 2",
   "User 関係者 cuối cùng shounin", "",
   "User 関係者2 (kankei cuối) shounin",
   "- Status vẫn là 統括部長待ち\n- Toàn bộ 関係者 đã hoàn thành承認 (kankei done)"],
  [20, "OR稟議書(COO決裁)_Full Node_店舗_SK", "", "Node_name", "", "",
   "User 統括部長 shounin",
   "- Status là 本部長待ち\n- Gửi mail 承認 đến user 本部長"],
  [21, "OR稟議書(COO決裁)_Full Node_店舗_SK", "", "Node_name",
   "関係者 CHƯA hoàn thành 承認 (còn ít nhất 1 user 関係者 chưa done) tại thời điểm 本部長 duyệt", "",
   "User 本部長 shounin",
   "- Status là 各社COO待ち\n- KHÔNG gửi mail 承認 đến user 各社COO (vì còn 関係者 chưa hoàn thành)\n- Bản ghi bị block cho đến khi toàn bộ 関係者 hoàn thành"],
  [22, "OR稟議書(COO決裁)_Full Node_店舗_SK", "", "Node_name",
   "Kankei done (đã hoàn thành ở TC19)", "",
   "User 本部長 shounin",
   "- Status là 各社COO待ち\n- Gửi mail 承認 đến user 各社COO (vì tất cả 関係者 đã done)\n- 関係 kết thúc tại node này"],
  [23, "OR稟議書(COO決裁)_Full Node_店舗_SK", "", "Node_name",
   "会社名 đã chọn CÓ setting user TCO trong 承認者マスタ", "",
   "User 各社COO shounin\nVẫn BẮT BUỘC nhập vùng 業態記入欄 dù bản ghi loại SK",
   "- Status là TCO待ち\n- Gửi mail 承認 đến user TCO"],
  [24, "OR稟議書(COO決裁)_Full Node_店舗_SK", "", "Node_name", "", "",
   "User TCO shounin\nVẫn BẮT BUỘC nhập vùng 業態記入欄 dù bản ghi loại SK",
   "- Status là 完了\n- Gửi mail Done đến ALL user trên node"],

  // ===== Group C: 店舗 + ngoài SK + Not Full Node (TCO bị skip vì không setting) =====
  [25, "OR稟議書(COO決裁)_Not Full Node_店舗_ngoài SK", "", "Node_name",
   "Not Full Node\n稟議種類 = 店舗\n業態 khác SK (loại ngoài SK)\n会社名 đã chọn KHÔNG có setting user TCO trong 承認者マスタ (node TCO sẽ bị skip)\n業態COOコメント: chưa nhập (trống)", "",
   "User 申請者 tạo bản ghi và bấm 承認 (submit)",
   "- Status là OR管理課待ち\n- Gửi mail 承認 đến user OR管理課"],
  [26, "OR稟議書(COO決裁)_Not Full Node_店舗_ngoài SK", "", "Node_name",
   "業態COOコメント CHƯA được nhập (còn trống) tính đến thời điểm OR管理課 duyệt", "",
   "User OR管理課 shounin",
   "- Status là 部門長待ち\n- Gửi mail 承認 đến user 部門長\n- Gửi mail 業態記入 đến user 各社COO (vì 業態COOコメント trống và bản ghi loại ngoài SK)"],
  [27, "OR稟議書(COO決裁)_Not Full Node_店舗_ngoài SK", "", "Node_name",
   "業態COOコメント ĐÃ được nhập trước đó (không còn trống) bởi user 関係者/各社COO/TCO, tính đến thời điểm OR管理課 duyệt", "",
   "User OR管理課 shounin",
   "- Status là 部門長待ち\n- Gửi mail 承認 đến user 部門長\n- KHÔNG gửi mail 業態記入 (vì 業態COOコメント đã có dữ liệu, không còn trống)"],
  [28, "OR稟議書(COO決裁)_Not Full Node_店舗_ngoài SK", "", "Nhập 業態COOコメント",
   "Bản ghi đang ở status 部門長待ち (chưa đến lượt duyệt của 各社COO)", "",
   "User 各社COO bấm button trên toolbar và nhập 業態COOコメント",
   "- Nhập/lưu 業態COOコメント thành công dù chưa đến lượt duyệt\n- Status không đổi"],
  [29, "OR稟議書(COO決裁)_Not Full Node_店舗_ngoài SK", "", "Node_name", "", "",
   "User 部門長 shounin",
   "- Status là 統括部長待ち\n- Gửi mail 承認 đến user 統括部長\n- 関係 bắt đầu: Gửi mail đến toàn bộ user 関係者 đã assign"],
  [30, "OR稟議書(COO決裁)_Not Full Node_店舗_ngoài SK", "", "User kankeisha 1",
   "Random 2 user 関係者 đã assign", "",
   "User 関係者1 shounin\nNhập vùng 業態記入欄 và 業態COOコメント (vì 稟議種類 = 店舗)",
   "- Status vẫn là 統括部長待ち (không đổi)"],
  [31, "OR稟議書(COO決裁)_Not Full Node_店舗_ngoài SK", "", "User kankeisha 2",
   "User 関係者 cuối cùng shounin", "",
   "User 関係者2 (kankei cuối) shounin",
   "- Status vẫn là 統括部長待ち\n- Toàn bộ 関係者 đã hoàn thành承認 (kankei done)"],
  [32, "OR稟議書(COO決裁)_Not Full Node_店舗_ngoài SK", "", "Node_name", "", "",
   "User 統括部長 shounin",
   "- Status là 本部長待ち\n- Gửi mail 承認 đến user 本部長"],
  [33, "OR稟議書(COO決裁)_Not Full Node_店舗_ngoài SK", "", "Node_name",
   "関係者 CHƯA hoàn thành 承認 (còn ít nhất 1 user 関係者 chưa done) tại thời điểm 本部長 duyệt", "",
   "User 本部長 shounin",
   "- Status là 各社COO待ち\n- KHÔNG gửi mail 承認 đến user 各社COO (vì còn 関係者 chưa hoàn thành)\n- Bản ghi bị block cho đến khi toàn bộ 関係者 hoàn thành"],
  [34, "OR稟議書(COO決裁)_Not Full Node_店舗_ngoài SK", "", "Node_name",
   "Kankei done (đã hoàn thành ở TC31)", "",
   "User 本部長 shounin",
   "- Status là 各社COO待ち\n- Gửi mail 承認 đến user 各社COO (vì tất cả 関係者 đã done)\n- 関係 kết thúc tại node này"],
  [35, "OR稟議書(COO決裁)_Not Full Node_店舗_ngoài SK", "", "Node_name",
   "会社名 đã chọn KHÔNG có setting user TCO trong 承認者マスタ", "",
   "User 各社COO shounin\nNhập vùng 業態記入欄",
   "- Node TCO hiển thị `/` (bị skip, không active)\n- Bản ghi HOÀN THÀNH (完了) NGAY, bỏ qua bước TCO\n- Gửi mail Done đến ALL user trên node"],

  // ===== Group D: 事務所 + Full Node (không có button nhập vùng 業態記入) =====
  [36, "OR稟議書(COO決裁)_Full Node_事務所", "", "Node_name",
   "Full Node\n稟議種類 = 事務所 (không phát sinh trường 業態/業態COOコメント)\n会社名 đã chọn có setting user TCO trong 承認者マスタ (TCO active)", "",
   "User 申請者 tạo bản ghi và bấm 承認 (submit)",
   "- Status là OR管理課待ち\n- Gửi mail 承認 đến user OR管理課"],
  [37, "OR稟議書(COO決裁)_Full Node_事務所", "", "Node_name", "", "",
   "User OR管理課 shounin",
   "- Status là 部門長待ち\n- Gửi mail 承認 đến user 部門長\n- KHÔNG phát sinh mail 業態記入 (bản ghi loại 事務所 không có trường 業態)"],
  [38, "OR稟議書(COO決裁)_Full Node_事務所", "", "Node_name", "", "",
   "User 部門長 shounin",
   "- Status là 統括部長待ち\n- Gửi mail 承認 đến user 統括部長\n- 関係 bắt đầu: Gửi mail đến toàn bộ user 関係者 đã assign"],
  [39, "OR稟議書(COO決裁)_Full Node_事務所", "", "User kankeisha 1",
   "Random 2 user 関係者 đã assign", "",
   "User 関係者1 shounin\nKHÔNG có button nhập vùng 業態記入 (vì 稟議種類 = 事務所)",
   "- Status vẫn là 統括部長待ち (không đổi)"],
  [40, "OR稟議書(COO決裁)_Full Node_事務所", "", "User kankeisha 2",
   "User 関係者 cuối cùng shounin", "",
   "User 関係者2 (kankei cuối) shounin",
   "- Status vẫn là 統括部長待ち\n- Toàn bộ 関係者 đã hoàn thành承認 (kankei done)"],
  [41, "OR稟議書(COO決裁)_Full Node_事務所", "", "Node_name", "", "",
   "User 統括部長 shounin",
   "- Status là 本部長待ち\n- Gửi mail 承認 đến user 本部長"],
  [42, "OR稟議書(COO決裁)_Full Node_事務所", "", "Node_name",
   "関係者 CHƯA hoàn thành 承認 (còn ít nhất 1 user 関係者 chưa done) tại thời điểm 本部長 duyệt", "",
   "User 本部長 shounin",
   "- Status là 各社COO待ち\n- KHÔNG gửi mail 承認 đến user 各社COO (vì còn 関係者 chưa hoàn thành)\n- Bản ghi bị block cho đến khi toàn bộ 関係者 hoàn thành"],
  [43, "OR稟議書(COO決裁)_Full Node_事務所", "", "Node_name",
   "Kankei done (đã hoàn thành ở TC40)", "",
   "User 本部長 shounin",
   "- Status là 各社COO待ち\n- Gửi mail 承認 đến user 各社COO (vì tất cả 関係者 đã done)\n- 関係 kết thúc tại node này"],
  [44, "OR稟議書(COO決裁)_Full Node_事務所", "", "Node_name",
   "会社名 đã chọn CÓ setting user TCO trong 承認者マスタ", "",
   "User 各社COO shounin\nKHÔNG có button nhập vùng 業態記入 (vì 稟議種類 = 事務所)",
   "- Status là TCO待ち\n- Gửi mail 承認 đến user TCO"],
  [45, "OR稟議書(COO決裁)_Full Node_事務所", "", "Node_name", "", "",
   "User TCO shounin\nKHÔNG có button nhập vùng 業態記入 (vì 稟議種類 = 事務所)",
   "- Status là 完了\n- Gửi mail Done đến ALL user trên node"],

  // ===== Group E: Action 差し戻し (Reject) — về chân 申請者, XÓA dấu 承認 của TẤT CẢ node đã đóng dấu =====
  [46, "OR稟議書(COO決裁)_差し戻し", "", "Node_name",
   "Bản ghi mới tạo, 稟議種類 = 店舗, chưa qua node nào", "",
   "User 申請者 tạo bản ghi và bấm 承認 (submit)",
   "- Status là OR管理課待ち\n- Gửi mail 承認 đến user OR管理課"],
  [47, "OR稟議書(COO決裁)_差し戻し", "", "Node_name", "", "",
   "User OR管理課 shounin",
   "- Status là 部門長待ち\n- Gửi mail 承認 đến user 部門長"],
  [48, "OR稟議書(COO決裁)_差し戻し", "", "Node_name",
   "Bản ghi đang ở status 部門長待ち, đã có dấu 承認 của 申請者 và OR管理課, 関係 CHƯA bắt đầu (関係者 chưa được assign quyền xem)", "",
   "User 部門長 thực hiện 差し戻し (thay vì 承認)",
   "- Bản ghi chuyển về chân user 申請者 phụ trách\n- Xóa dấu 承認 của TẤT CẢ node đã đóng dấu trước đó (申請者, OR管理課)\n- 関係 CHƯA bắt đầu nên không ảnh hưởng user 関係者"],
  [49, "OR稟議書(COO決裁)_差し戻し", "", "Node_name",
   "User 申請者 nhận lại bản ghi sau khi bị 差し戻し", "",
   "User 申請者 kiểm tra lại dấu 承認 hiện có trên bản ghi",
   "- Dấu 承認 của 申請者 và OR管理課 đã bị xóa hoàn toàn, không còn hiển thị trên bản ghi\n- Bản ghi ở trạng thái như mới tạo, cần bấm 承認 lại từ đầu"],
  [50, "OR稟議書(COO決裁)_差し戻し", "", "Node_name", "", "",
   "User 申請者 sửa và bấm 承認 (submit lại)",
   "- Status là OR管理課待ち\n- Gửi mail 承認 đến user OR管理課"],
  [51, "OR稟議書(COO決裁)_差し戻し", "", "Node_name", "", "",
   "User OR管理課 shounin",
   "- Status là 部門長待ち\n- Gửi mail 承認 đến user 部門長"],
  [52, "OR稟議書(COO決裁)_差し戻し", "", "Node_name", "", "",
   "User 部門長 shounin",
   "- Status là 統括部長待ち\n- Gửi mail 承認 đến user 統括部長\n- 関係 bắt đầu: Gửi mail đến toàn bộ user 関係者 đã assign"],
  [53, "OR稟議書(COO決裁)_差し戻し", "", "Node_name",
   "Bản ghi đang ở status 統括部長待ち, đã có dấu 承認 của 申請者/OR管理課/部門長, 関係 ĐÃ bắt đầu (関係者 đã được assign, chưa hoàn thành 承認)", "",
   "User 統括部長 thực hiện 差し戻し (thay vì 承認)",
   "- Bản ghi chuyển về chân user 申請者 phụ trách\n- Xóa dấu 承認 của TẤT CẢ node đã đóng dấu trước đó (申請者, OR管理課, 部門長)\n- Toàn bộ user 関係者 đã assign KHÔNG còn xem được bản ghi nữa (vì dấu 部門長 — node kích hoạt 関係 — cũng bị xóa)"],
  [54, "OR稟議書(COO決裁)_差し戻し", "", "Node_name",
   "Bản ghi đang ở status TCO待ち (giai đoạn cuối luồng, đã có đủ dấu 承認 của toàn bộ node trước đó)", "",
   "User TCO thực hiện 差し戻し (thay vì 承認)",
   "- Bản ghi chuyển về chân user 申請者 phụ trách, bất kể đang ở node cuối chain\n- Xóa dấu 承認 của TOÀN BỘ node đã đóng dấu trước đó\n- Toàn bộ user 関係者 đã assign KHÔNG còn xem được bản ghi nữa"],

  // ===== Group F: Action 引き戻し (Recall) — chỉ user ĐÃ đóng dấu mới thực hiện được, kéo bản ghi về CHÍNH MÌNH, CHỈ xóa dấu của chính mình =====
  [55, "OR稟議書(COO決裁)_引き戻し", "", "Node_name",
   "Bản ghi đã qua 申請者 → OR管理課 → 部門長 (đã có dấu 承認 của cả 3 user này), hiện đang ở status 統括部長待ち, 関係 đã bắt đầu (関係者 đã được assign)", "",
   "User OR管理課 thực hiện 引き戻し (kéo bản ghi về lại chính mình)",
   "- Bản ghi quay về chân user OR管理課, status chuyển về OR管理課待ち\n- CHỈ xóa dấu 承認 của chính user OR管理課 (dấu của 申請者 và 部門長 vẫn giữ nguyên, không bị ảnh hưởng)\n- Toàn bộ user 関係者 đã assign VẪN xem được bản ghi bình thường (vì dấu 部門長 — node kích hoạt 関係 — không bị xóa)"],
  [56, "OR稟議書(COO決裁)_引き戻し", "", "Node_name",
   "Bản ghi đã qua 申請者 → OR管理課 → 部門長 (đã có dấu 承認 của cả 3 user này), hiện đang ở status 統括部長待ち, 関係 đã bắt đầu (関係者 đã được assign)", "",
   "User 部門長 thực hiện 引き戻し (kéo bản ghi về lại chính mình)",
   "- Bản ghi quay về chân user 部門長, status chuyển về 部門長待ち\n- CHỈ xóa dấu 承認 của chính user 部門長 (dấu của 申請者 và OR管理課 vẫn giữ nguyên)\n- Toàn bộ user 関係者 đã assign KHÔNG còn xem được bản ghi nữa (vì chính dấu 部門長 — node kích hoạt 関係 — đã bị xóa)"],
  [57, "OR稟議書(COO決裁)_引き戻し", "", "Node_name",
   "Bản ghi đã qua đủ 6 node (申請者 ~ 各社COO, đã có dấu 承認 của tất cả), hiện đang ở status TCO待ち", "",
   "User 各社COO thực hiện 引き戻し (kéo bản ghi về lại chính mình)",
   "- Bản ghi quay về chân user 各社COO, status chuyển về 各社COO待ち\n- CHỈ xóa dấu 承認 của chính user 各社COO (dấu của các node khác — 申請者~本部長 — vẫn giữ nguyên)\n- Không ảnh hưởng user 関係者 (vì dấu 部門長 không bị xóa)"],
];
async function run() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(TEMPLATE);
  const ws = wb.getWorksheet(SHEET);

  // Update metadata
  ws.getCell("F2").value = "OR稟議書(COO決裁)";
  ws.getCell("F3").value = CREATOR;
  ws.getCell("F4").value = TODAY;

  // Capture anchor style from row 11 (first data row in template)
  const anchorRow = ws.getRow(11);
  const anchorStyles = {};
  for (let c = 2; c <= 10; c++) {
    const cell = anchorRow.getCell(c);
    anchorStyles[c] = cell.style ? JSON.parse(JSON.stringify(cell.style)) : {};
  }
  const anchorHeight = anchorRow.height || 40;

  // Unmerge data area (rows >= 11)
  if (ws.model && Array.isArray(ws.model.merges)) {
    [...ws.model.merges].forEach(m => {
      const match = m.match(/^[A-Z]+(\d+)/);
      if (match && parseInt(match[1]) >= 11) {
        try { ws.unMergeCells(m); } catch (_) {}
      }
    });
  }

  // Remove rows from 11 to end
  for (let r = ws.rowCount; r >= 11; r--) {
    ws.spliceRows(r, 1);
  }

  // Fill new data rows
  TC.forEach(([no, daiko, chuko, shoko, cond, user, input, output], idx) => {
    const rowNum = 11 + idx;
    const row = ws.getRow(rowNum);
    row.height = anchorHeight;

    const vals = [no, daiko, chuko, shoko, cond, user, input, output, ""];
    vals.forEach((v, i) => {
      const colNum = i + 2; // B=2 .. J=10
      const cell = row.getCell(colNum);
      cell.value = (v === "" || v == null) ? null : v;
      // Clone anchor style
      if (anchorStyles[colNum]) {
        cell.style = JSON.parse(JSON.stringify(anchorStyles[colNum]));
      }
      // wrapText for cells with newlines
      if (typeof v === "string" && v.indexOf("\n") !== -1) {
        cell.alignment = Object.assign({}, cell.alignment || {}, { wrapText: true, vertical: "top" });
      }
    });
    row.commit();
  });

  // Merge 大項目 (col C = 3) for consecutive same-value rows
  let mergeStart = 11;
  for (let i = 1; i <= TC.length; i++) {
    const diff = i === TC.length || TC[i][1] !== TC[i - 1][1];
    if (diff) {
      const mergeEnd = 10 + i;
      if (mergeEnd > mergeStart) {
        try { ws.mergeCells(mergeStart, 3, mergeEnd, 3); } catch (_) {}
      }
      if (i < TC.length) mergeStart = 11 + i;
    }
  }

  require("fs").mkdirSync(path.dirname(OUTPUT), { recursive: true });
  await wb.xlsx.writeFile(OUTPUT);
  console.log("Done:", OUTPUT);
  console.log("TC count:", TC.length);
}

run().catch(e => { console.error(e.message); process.exit(1); });
