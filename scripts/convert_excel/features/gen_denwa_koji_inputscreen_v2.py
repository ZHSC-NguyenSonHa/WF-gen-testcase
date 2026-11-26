# -*- coding: utf-8 -*-
"""Gen script: 電話工事依頼書 入力画面 — v2 (全レイアウト + validation + submit)"""
import openpyxl
from openpyxl.styles import PatternFill, Font, Border, Side, Alignment
from datetime import date
import itertools

TEMPLATE = r"E:\Auto_Gen AI\Q 2\Q\templates\testcase\testcase_template_inputscreen.xlsx"
OUTPUT   = r"E:\Auto_Gen AI\Q 2\Q\CMS\Testcase\【CMS】電話工事依頼書_入力画面.xlsx"

wb = openpyxl.load_workbook(TEMPLATE)
ws = wb["申請書 "]

# Header
ws.cell(2, 4).value = "電話工事依頼書 入力画面"
ws.cell(3, 3).value = ""
ws.cell(3, 4).value = "QA Team"
ws.cell(4, 4).value = date.today().strftime("%Y/%m/%d")

for r in range(10, ws.max_row + 1):
    ws.row_dimensions[r].height = None
    for c in range(2, 15):
        ws.cell(r, c).value = None

thin = Side(style="thin")
BD = Border(left=thin, right=thin, top=thin, bottom=thin)
F_BOLD = Font(name="Calibri", size=11, bold=True)
F_NORM = Font(name="Calibri", size=11, bold=False)
CTR = Alignment(horizontal="center", vertical="top", wrap_text=True)
LFT = Alignment(horizontal="left",   vertical="top", wrap_text=True)

BLUE   = PatternFill("solid", fgColor="BDD7EE")
GREEN  = PatternFill("solid", fgColor="D9EAD3")
ORANGE = PatternFill("solid", fgColor="FCE4D6")
YELLOW = PatternFill("solid", fgColor="FFF2CC")
PURPLE = PatternFill("solid", fgColor="EAD1DC")
PINK   = PatternFill("solid", fgColor="F4CCCC")

ROW = [10]

def sec(title, fill):
    r = ROW[0]
    ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=14)
    c = ws.cell(r, 2)
    c.value = title; c.fill = fill; c.font = F_BOLD
    c.alignment = LFT; c.border = BD
    ws.row_dimensions[r].height = 18
    ROW[0] += 1

def tc(no, item, req, edit, copy_, dtype, maxlen, cond, inp, out, note=""):
    r = ROW[0]
    vals = {2:(no,CTR),3:(item,LFT),4:(req,CTR),5:(edit,CTR),6:(copy_,CTR),
            7:(dtype,LFT),8:(maxlen,CTR),9:(cond,LFT),10:("",LFT),
            11:(inp,LFT),12:(out,LFT),13:("",CTR),14:(note,LFT)}
    for col,(v,a) in vals.items():
        c=ws.cell(r,col); c.value=v; c.font=F_NORM; c.alignment=a; c.border=BD
    mx=max(len(str(vals[k][0]).split("\n")) for k in [9,11,12])
    ws.row_dimensions[r].height=max(15, mx*15)
    ROW[0] += 1

# ============================================================
# HELPER: 利用開始希望日 共通 validation TCs
# ============================================================
def tc_riyou_validation(no_base, layout_cond):
    tc(no_base,
       "利用開始希望日","×","×","-","数値","4",
       layout_cond,
       "Nhập tháng năm quá khứ (ví dụ:「202507」) rồi nhấn「申請」",
       "Không thể đăng ký\nHiển thị lỗi「入力内容に誤りがあります。」\n(Logic: ①過去月入力不可)")
    tc(no_base+1,
       "利用開始希望日","×","×","-","数値","4",
       "Ngày hiện tại là ngày 11～31 của tháng\n" + layout_cond,
       "Nhập tháng năm hiện tại (ví dụ:「202608」) rồi nhấn「申請」",
       "Không thể đăng ký\nHiển thị lỗi「入力内容に誤りがあります。」\n(Logic: ②当月でも11日以降で登録不可)")

# ============================================================
# HELPER: 申請 submit TC
# ============================================================
def tc_submit(no, cond_layout):
    tc(no,
       "申請（フォーム送信）","○","○","○","ー","ー",
       cond_layout,
       "Điền đầy đủ tất cả trường bắt buộc (○) theo layout\nNhấn nút「申請」",
       "Bản ghi được tạo thành công, lưu đúng thông tin đã nhập\nStatus hiển thị là (Node_name tiếp theo + 待ち)")

# ============================================================
# HELPER: Shared field TCs (備考/添付/利用開始希望日)
# ============================================================
def tc_shared_fields(no_base, cond, riyou_required):
    tc(no_base,
       "備考","×","○","ー","テキスト","256", cond,
       "Nhập「テスト備考内容」",
       "Có thể nhập, văn bản hiển thị đầy đủ trong ô nhập")
    tc(no_base+1,
       "添付ファイル","×","○","ー","ファイル","ー", cond,
       "Tải lên file PDF",
       "File PDF được tải lên thành công\nFile đính kèm được hiển thị ở trạng thái mở rộng")
    req = "○" if riyou_required else "ー"
    tc(no_base+2,
       "利用開始希望日", req,"○","-","数値","4", cond,
       "Nhập năm tháng tháng sau (ví dụ:「202601」)",
       "「202601」được hiển thị" + (" (bắt buộc nhập)" if riyou_required else " (tùy chọn)"))

# ============================================================
# MAIN DATA
# ============================================================

# ---- COMMON ----
sec("【Trường chung】Xác nhận hiển thị tất cả trường — Áp dụng cho mọi layout", BLUE)
tc(1,"タイトル","ー","×","ー","テキスト","ー","",
   "Hiển thị màn hình nhập liệu",
   "Văn bản cố định「電話工事依頼書」được hiển thị")
tc(2,"秘密情報","ー","×","ー","テキスト","ー","",
   "Hiển thị màn hình nhập liệu",
   "Văn bản cố định「秘密情報」được hiển thị (in đậm, màu đỏ)")
tc(3,"申請No.","ー","×","×","テキスト","ー","",
   "Hiển thị màn hình nhập liệu",
   "Không thể nhập, tự động phát số theo quy tắc khi nhấn 申請")
tc(4,"申請日","ー","×","×","日付","6","",
   "Hiển thị màn hình nhập liệu",
   "Không thể nhập, tự động lấy ngày tháng định dạng yyyy/mm/dd khi nhấn 申請")
tc(5,"連絡先","ー","○","×","テキスト","15","",
   "Hiển thị màn hình nhập liệu",
   "Tự động lấy số nội tuyến của login user và hiển thị (để trống nếu không có)")
tc(6,"連絡先","ー","○","×","テキスト","15","",
   "Nhập「0312345678」",
   "Có thể nhập, văn bản hiển thị đầy đủ trong ô nhập")
tc(7,"申請者","○","×","○","ユーザー","ー","",
   "Hiển thị màn hình nhập liệu",
   "Login user được tự động lấy và hiển thị ở ô 申請者, không thể chỉnh sửa")
tc(8,"申請者","○","×","○","ユーザー","ー","",
   "Thử nhấn vào ô 申請者 hoặc cố nhập/thay đổi giá trị",
   "Không thể nhập tay hay chọn user khác\nÔ 申請者 là read-only — chỉ hiển thị login user hiện tại")
tc(9,"上長","×","○","×","ユーザー","ー","",
   "①Nhập tay tên user hoặc ID\n②Chọn user từ nút「選択」",
   "Cả hai cách đều có thể chọn user vào ô phê duyệt")
tc(10,"部門長","○","○","×","ユーザー","ー","",
   "①Nhập tay tên user hoặc ID\n②Chọn user từ nút「選択」",
   "Cả hai cách đều có thể chọn user vào ô phê duyệt")
tc(11,"受付","○","×","×","PG","ー","",
   "Hiển thị màn hình nhập liệu",
   "Tự động lấy từ màn hình Application, không thể edit")
tc(12,"承認","○","×","○","PG","ー","",
   "Hiển thị màn hình nhập liệu",
   "Tự động lấy từ màn hình Application, không thể edit")
tc(13,"完了","○","×","○","PG","ー","",
   "Hiển thị màn hình nhập liệu",
   "Tự động lấy từ màn hình Application, không thể edit")
tc(14,"/","×","×","○","テキスト","ー","Khi có node phê duyệt không sử dụng",
   "Hiển thị màn hình nhập liệu",
   "Tên mục ô phê duyệt không sử dụng hiển thị là「/」")
tc(15,"所属会社名","○","×","○","テキスト","ー","",
   "Hiển thị màn hình nhập liệu",
   "Tự động lấy tên công ty của login user và hiển thị")
tc(16,"所属","○","×","○","テキスト","ー","",
   "Hiển thị màn hình nhập liệu",
   "Tự động lấy bộ phận chính của login user và hiển thị")
tc(17,"社員番号","○","×","○","テキスト","ー","",
   "Hiển thị màn hình nhập liệu",
   "Tự động lấy mã nhân viên của login user và hiển thị")
tc(18,"氏名","○","×","○","ユーザー","ー","",
   "Hiển thị màn hình nhập liệu",
   "Tự động lấy họ tên của login user và hiển thị")
tc(19,"工事の種類","○","○","○","ラジオボタン","ー",
   "Hiển thị 3 radio button:「1.電話機増設」「2.既存電話機設定変更」「3.その他」",
   "Chọn từng giá trị radio button",
   "Giá trị được chọn và section tương ứng được hiển thị")

# ---- LAYOUT 2 ----
L2_COND = "Chọn「1.電話機増設」ở 工事の種類\nChọn「1.既存の内線と同じ盤面」ở 電話機増設"
sec("【Layout②】工事の種類=電話機増設 — Chỉ check ①「既存の内線と同じ盤面」", GREEN)
tc(20,"電話機増設","△","○","○","チェックボックス","ー",
   "Chọn「1.電話機増設」ở 工事の種類\nHiển thị 2 checkbox「1.既存の内線と同じ盤面」「2.新しい盤面」",
   "Nhấn checkbox「1.既存の内線と同じ盤面」",
   "Checkbox được tick, các trường「台数」・「a）既存の内線と同じ盤面⇒」được hiển thị")
tc(21,"台数","○","○","○","数値","3", L2_COND,
   "Nhập「123」",
   "「123台」được hiển thị (「台」ở cuối cố định không chỉnh sửa được)")
tc(22,"a）既存の内線と同じ盤面⇒","○","○","○","数値","12", L2_COND,
   "Nhập「123456789012」",
   "「123456789012」được hiển thị")
tc(23,"備考","×","○","ー","テキスト","256", L2_COND,
   "Nhập「テスト備考内容」",
   "Có thể nhập, văn bản hiển thị đầy đủ trong ô nhập")
tc(24,"添付ファイル","×","○","ー","ファイル","ー", L2_COND,
   "Tải lên file PDF",
   "File PDF được tải lên thành công\nFile đính kèm hiển thị ở trạng thái mở rộng")
tc(25,"利用開始希望日","ー","○","-","数値","4", L2_COND,
   "Nhập năm tháng tháng sau (ví dụ:「202601」)",
   "「202601」được hiển thị (tùy chọn, không bắt buộc ở Layout②)")
tc_riyou_validation(26, L2_COND)
tc(28,"※3日以降…","ー","ー","-","テキスト","ー",
   "Hiển thị màn hình vào ngày 5～10 của tháng hiện tại",
   "Hiển thị màn hình nhập liệu",
   "「※3日以降の申請は、次回の定例工事での対応となります。」được hiển thị")
tc(29,"※鳴動変更がある…","ー","ー","-","テキスト","ー","",
   "Hiển thị màn hình nhập liệu",
   "「※鳴動変更がある場合は、変更する番号を備考に記載ください。」được hiển thị")
tc(30,"利用開始希望日定例工事…","ー","ー","-","テキスト","ー","",
   "Hiển thị màn hình nhập liệu",
   "「利用開始希望日：定例工事は毎月10日ごろ行っています。」được hiển thị")
tc_submit(31, L2_COND + "\nĐiền: 台数=1, a）既存の内線と同じ盤面=1001, 部門長=test")

# ---- LAYOUT 3 ----
L3_COND = "Chọn「1.電話機増設」ở 工事の種類\nChọn「2.新しい盤面」ở 電話機増設"
sec("【Layout③】工事の種類=電話機増設 — Chỉ check ②「新しい盤面」", GREEN)
tc(32,"電話機増設","△","○","○","チェックボックス","ー",
   "Chọn「1.電話機増設」ở 工事の種類\nHiển thị 2 checkbox",
   "Nhấn checkbox「2.新しい盤面」",
   "Checkbox được tick, các trường「台数」・「盤面表」được hiển thị")
tc(33,"台数","○","○","○","数値","3", L3_COND,
   "Nhập「99」",
   "「99台」được hiển thị (「台」ở cuối cố định)")
tc(34,"盤面表","ー","○","ー","ファイル","ー", L3_COND,
   "Hiển thị màn hình nhập liệu",
   "File「盤面表」được tự động lấy từ cài đặt màn hình Application và hiển thị")
tc(35,"備考","×","○","ー","テキスト","256", L3_COND,
   "Nhập「テスト備考内容」",
   "Có thể nhập, văn bản hiển thị đầy đủ trong ô nhập")
tc(36,"添付ファイル","×","○","ー","ファイル","ー", L3_COND,
   "Tải lên file PDF",
   "File PDF được tải lên thành công\nFile đính kèm hiển thị ở trạng thái mở rộng")
tc(37,"利用開始希望日","○","○","-","数値","4", L3_COND,
   "Nhập năm tháng tháng sau (ví dụ:「202601」)",
   "「202601」được hiển thị (bắt buộc nhập)")
tc_riyou_validation(38, L3_COND)
tc(40,"※3日以降…","ー","ー","-","テキスト","ー",
   "Hiển thị màn hình vào ngày 5～10 của tháng hiện tại",
   "Hiển thị màn hình nhập liệu",
   "「※3日以降の申請は、次回の定例工事での対応となります。」được hiển thị")
tc(41,"※鳴動変更がある…","ー","ー","-","テキスト","ー","",
   "Hiển thị màn hình nhập liệu",
   "「※鳴動変更がある場合は、変更する番号を備考に記載ください。」được hiển thị")
tc(42,"利用開始希望日定例工事…","ー","ー","-","テキスト","ー","",
   "Hiển thị màn hình nhập liệu",
   "「利用開始希望日：定例工事は毎月10日ごろ行っています。」được hiển thị")
tc_submit(43, L3_COND + "\nĐiền: 台数=1, 利用開始希望日=202601, 部門長=test")

# ---- LAYOUT 2+3 COMBO ----
L23_COND = "Chọn「1.電話機増設」ở 工事の種類\nCheck CẢ 2 checkbox ①「既存の内線と同じ盤面」+②「新しい盤面」"
sec("【Layout②+③】工事の種類=電話機増設 — Check ①「既存の内線と同じ盤面」+②「新しい盤面」", ORANGE)
tc(44,"電話機増設","△","○","○","チェックボックス","ー",
   "Chọn「1.電話機増設」ở 工事の種類",
   "Check CẢ 2 checkbox「1.既存の内線と同じ盤面」và「2.新しい盤面」",
   "Tất cả trường của ①và② đồng thời hiển thị:\n・台数(unitCount) [○]・a）既存の内線と同じ盤面⇒ [○]\n・台数(unitCount2) [○]・盤面表 [ー]\n・備考 [×]・添付ファイル [×]・利用開始希望日 [○]")
tc(45,"台数（①用）","○","○","○","数値","3", L23_COND,
   "Nhập「123」vào ô 台数 thuộc nhóm ①",
   "「123台」được hiển thị trong ô 台数 của nhóm ①")
tc(46,"a）既存の内線と同じ盤面⇒（①用）","○","○","○","数値","12", L23_COND,
   "Nhập「123456789012」",
   "「123456789012」được hiển thị")
tc(47,"台数（②用）","○","○","○","数値","3", L23_COND,
   "Nhập「99」vào ô 台数 thuộc nhóm ②",
   "「99台」được hiển thị trong ô 台数 của nhóm ②")
tc(48,"盤面表（②用）","ー","○","ー","ファイル","ー", L23_COND,
   "Hiển thị màn hình nhập liệu",
   "File 盤面表 được lấy từ Application setting và hiển thị")
tc(49,"備考（共通）","×","○","ー","テキスト","256", L23_COND,
   "Nhập「テスト備考内容」",
   "Có thể nhập, hiển thị đầy đủ\nTrường 備考 chỉ xuất hiện 1 lần (dùng chung)")
tc(50,"添付ファイル（共通）","×","○","ー","ファイル","ー", L23_COND,
   "Tải lên file PDF",
   "File PDF tải lên thành công\nTrường 添付ファイル chỉ xuất hiện 1 lần (dùng chung)")
tc(51,"利用開始希望日（共通）","○","○","-","数値","4", L23_COND,
   "Nhập năm tháng tháng sau (ví dụ:「202601」)",
   "「202601」được hiển thị (bắt buộc vì check ②)\nTrường 利用開始希望日 chỉ xuất hiện 1 lần (dùng chung)")
tc(52,"備考 / 添付ファイル / 利用開始希望日","ー","○","-","ー","ー", L23_COND,
   "Hiển thị màn hình nhập liệu",
   "「備考」・「添付ファイル」・「利用開始希望日」mỗi trường chỉ hiển thị 1 lần duy nhất, không bị trùng lặp")
tc_submit(53, L23_COND + "\nĐiền: 台数①=1, a）既存盤面=1001, 台数②=2, 利用開始希望日=202601, 部門長=test")

# ---- LAYOUT 4 ----
L4_COND = "Chọn「2.既存電話機設定変更」ở 工事の種類\nChọn「①設定変更（既存の内線と同じ盤面）」"
sec("【Layout④】工事の種類=既存電話機設定変更 — Chỉ check ①「設定変更（既存の内線と同じ盤面）」", GREEN)
tc(54,"既存電話機設定変更","△","○","○","チェックボックス","ー",
   "Chọn「2.既存電話機設定変更」ở 工事の種類\nHiển thị 4 checkbox: ①設定変更(既存盤面) ②設定変更(新盤面) ③留守番電話設定 ④発番変更",
   "Nhấn checkbox「①設定変更（既存の内線と同じ盤面）」",
   "Checkbox ①được tick, các trường「変更したい内線番号」・「a）既存の内線と同じ盤面」được hiển thị")
tc(55,"変更したい内線番号","○","○","○","数値","12", L4_COND,
   "Nhập「123456789012」",
   "「123456789012」được hiển thị")
tc(56,"a）既存の内線と同じ盤面","ー","○","○","数値","12", L4_COND,
   "Nhập「100」",
   "「100」được hiển thị (tùy chọn, không bắt buộc)")
tc(57,"備考","×","○","ー","テキスト","256", L4_COND,
   "Nhập「テスト備考内容」",
   "Có thể nhập, văn bản hiển thị đầy đủ")
tc(58,"添付ファイル","×","○","ー","ファイル","ー", L4_COND,
   "Tải lên file PDF",
   "File PDF tải lên thành công")
tc(59,"利用開始希望日","○","○","-","数値","4", L4_COND,
   "Nhập năm tháng tháng sau (ví dụ:「202601」)",
   "「202601」được hiển thị (bắt buộc nhập)")
tc_riyou_validation(60, L4_COND)
tc_submit(62, L4_COND + "\nĐiền: 変更したい内線番号=1001, 利用開始希望日=202601, 部門長=test")

# ---- LAYOUT 5 ----
L5_COND = "Chọn「2.既存電話機設定変更」ở 工事の種類\nChọn「②設定変更（新しい盤面）」"
sec("【Layout⑤】工事の種類=既存電話機設定変更 — Chỉ check ②「設定変更（新しい盤面）」", GREEN)
tc(63,"既存電話機設定変更","△","○","○","チェックボックス","ー",
   "Chọn「2.既存電話機設定変更」ở 工事の種類",
   "Nhấn checkbox「②設定変更（新しい盤面）」",
   "Checkbox ②được tick, các trường「変更したい内線番号」・「盤面表」được hiển thị")
tc(64,"変更したい内線番号","○","○","○","数値","12", L5_COND,
   "Nhập「123456789012」",
   "「123456789012」được hiển thị")
tc(65,"盤面表","ー","○","ー","ファイル","ー", L5_COND,
   "Hiển thị màn hình nhập liệu",
   "File 盤面表 được lấy từ Application setting và hiển thị")
tc(66,"備考","×","○","ー","テキスト","256", L5_COND,
   "Nhập「テスト備考内容」",
   "Có thể nhập, văn bản hiển thị đầy đủ")
tc(67,"添付ファイル","×","○","ー","ファイル","ー", L5_COND,
   "Tải lên file PDF",
   "File PDF tải lên thành công")
tc(68,"利用開始希望日","○","○","-","数値","4", L5_COND,
   "Nhập năm tháng tháng sau (ví dụ:「202601」)",
   "「202601」được hiển thị (bắt buộc nhập)")
tc_riyou_validation(69, L5_COND)
tc_submit(71, L5_COND + "\nĐiền: 変更したい内線番号=1001, 利用開始希望日=202601, 部門長=test")

# ---- LAYOUT 6 ----
L6_COND = "Chọn「2.既存電話機設定変更」ở 工事の種類\nChọn「③留守番電話設定」"
sec("【Layout⑥】工事の種類=既存電話機設定変更 — Chỉ check ③「留守番電話設定」", GREEN)
tc(72,"既存電話機設定変更","△","○","○","チェックボックス","ー",
   "Chọn「2.既存電話機設定変更」ở 工事の種類",
   "Nhấn checkbox「③留守番電話設定」",
   "Checkbox ③được tick, các trường「留守番電話設定仕様」・「設定する外線番号」được hiển thị")
tc(73,"留守番電話設定仕様","○","○","○","プルダウン","ー", L6_COND,
   "Chọn「設定」hoặc「解除」",
   "Giá trị được chọn và hiển thị đúng trong ô dropdown")
tc(74,"設定する外線番号","×","○","○","数値","12", L6_COND,
   "Nhập「123456789012」",
   "「123456789012」được hiển thị (tùy chọn, không bắt buộc)")
tc(75,"備考","×","○","ー","テキスト","256", L6_COND,
   "Nhập「テスト備考内容」",
   "Có thể nhập, văn bản hiển thị đầy đủ")
tc(76,"添付ファイル","×","○","ー","ファイル","ー", L6_COND,
   "Tải lên file PDF",
   "File PDF tải lên thành công")
tc(77,"利用開始希望日","○","○","-","数値","4", L6_COND,
   "Nhập năm tháng tháng sau (ví dụ:「202601」)",
   "「202601」được hiển thị (bắt buộc nhập)")
tc_riyou_validation(78, L6_COND)
tc_submit(80, L6_COND + "\nĐiền: 留守番電話設定仕様=設定, 利用開始希望日=202601, 部門長=test")

# ---- LAYOUT 7 ----
L7_COND = "Chọn「2.既存電話機設定変更」ở 工事の種類\nChọn「④発番変更」"
sec("【Layout⑦】工事の種類=既存電話機設定変更 — Chỉ check ④「発番変更」", GREEN)
tc(81,"既存電話機設定変更","△","○","○","チェックボックス","ー",
   "Chọn「2.既存電話機設定変更」ở 工事の種類",
   "Nhấn checkbox「④発番変更」",
   "Checkbox ④được tick, các trường「変更したい内線番号」・「現在の発番」・「変更後の発番」được hiển thị")
tc(82,"変更したい内線番号","○","○","○","数値","12", L7_COND,
   "Nhập「123456789012」",
   "「123456789012」được hiển thị")
tc(83,"現在の発番","○","○","○","数値","12", L7_COND,
   "Nhập「0312345678」",
   "「0312345678」được hiển thị")
tc(84,"変更後の発番","○","○","○","数値","12", L7_COND,
   "Nhập「0398765432」",
   "「0398765432」được hiển thị")
tc(85,"備考","×","○","ー","テキスト","256", L7_COND,
   "Nhập「テスト備考内容」",
   "Có thể nhập, văn bản hiển thị đầy đủ")
tc(86,"添付ファイル","×","○","ー","ファイル","ー", L7_COND,
   "Tải lên file PDF",
   "File PDF tải lên thành công")
tc(87,"利用開始希望日","○","○","-","数値","4", L7_COND,
   "Nhập năm tháng tháng sau (ví dụ:「202601」)",
   "「202601」được hiển thị (bắt buộc nhập)")
tc_riyou_validation(88, L7_COND)
tc_submit(90, L7_COND + "\nĐiền: 変更したい内線番号=1001, 現在の発番=0312345678, 変更後の発番=0398765432, 利用開始希望日=202601, 部門長=test")

# ============================================================
# 既存電話機設定変更 COMBOS
# ============================================================

# Define unique fields per option
OPT_FIELDS = {
    1: [
        ("変更したい内線番号（extChange）","○","○","○","数値","12",
         "Nhập「123456789012」","「123456789012」được hiển thị"),
        ("a）既存の内線と同じ盤面","ー","○","○","数値","12",
         "Nhập「100」","「100」được hiển thị (tùy chọn)"),
    ],
    2: [
        ("変更したい内線番号（extChange2）","○","○","○","数値","12",
         "Nhập「987654321012」","「987654321012」được hiển thị"),
        ("盤面表","ー","○","ー","ファイル","ー",
         "Hiển thị màn hình nhập liệu","File 盤面表 được lấy từ Application setting"),
    ],
    3: [
        ("留守番電話設定仕様","○","○","○","プルダウン","ー",
         "Chọn「設定」hoặc「解除」","Giá trị dropdown hiển thị đúng"),
        ("設定する外線番号","×","○","○","数値","12",
         "Nhập「111222333444」","「111222333444」được hiển thị (tùy chọn)"),
    ],
    4: [
        ("変更したい内線番号（extChange3）","○","○","○","数値","12",
         "Nhập「555666777888」","「555666777888」được hiển thị"),
        ("現在の発番","○","○","○","数値","12",
         "Nhập「0312345678」","「0312345678」được hiển thị"),
        ("変更後の発番","○","○","○","数値","12",
         "Nhập「0398765432」","「0398765432」được hiển thị"),
    ],
}
OPT_NAMES = {
    1: "①設定変更（既存の内線と同じ盤面）",
    2: "②設定変更（新しい盤面）",
    3: "③留守番電話設定",
    4: "④発番変更",
}
OPT_SHORT = {1:"①", 2:"②", 3:"③", 4:"④"}
# Build submit data per option
OPT_SUBMIT = {
    1: "変更したい内線番号=1001",
    2: "変更したい内線番号=9001",
    3: "留守番電話設定仕様=設定",
    4: "変更したい内線番号=5001, 現在の発番=0311111111, 変更後の発番=0322222222",
}

TC_NO = [91]

def next_no():
    n = TC_NO[0]; TC_NO[0] += 1; return n

# Generate all combos: pairs, triples, all-4
for r in range(2, 5):
    for combo in itertools.combinations([1,2,3,4], r):
        names = " + ".join(OPT_NAMES[o] for o in combo)
        shorts = "+".join(OPT_SHORT[o] for o in combo)
        cond = f"Chọn「2.既存電話機設定変更」ở 工事の種類\nCheck {' + '.join(OPT_NAMES[o] for o in combo)}"

        # Build ALL fields list for display TC output
        all_unique = []
        for o in combo:
            for fdata in OPT_FIELDS[o]:
                fname = fdata[0]
                freq  = fdata[1]
                all_unique.append(f"・{fname} [{freq}] (from {OPT_SHORT[o]})")
        all_unique += ["・備考 [×]", "・添付ファイル [×]", "・利用開始希望日 [○]"]
        all_fields_str = "\n".join(all_unique)

        sec(f"【Tổ hợp {shorts}】 既存電話機設定変更 — Check {names}", PURPLE)

        # Main display TC
        n = next_no()
        tc(n,"既存電話機設定変更","△","○","○","チェックボックス","ー",
           f"Chọn「2.既存電話機設定変更」ở 工事の種類",
           f"Check {names}",
           f"Tất cả trường đồng thời hiển thị:\n{all_fields_str}")

        # Individual field TCs
        for o in combo:
            for fdata in OPT_FIELDS[o]:
                fname, freq, fedit, fcopy, ftype, fmaxlen, finp, fout = fdata
                n = next_no()
                tc(n, fname, freq, fedit, fcopy, ftype, fmaxlen, cond, finp, fout)

        # Shared fields TC
        n = next_no()
        tc(n,"備考（共通）","×","○","ー","テキスト","256", cond,
           "Nhập「テスト備考内容」",
           "Có thể nhập\n「備考」chỉ xuất hiện 1 lần dùng chung, không bị trùng lặp")
        n = next_no()
        tc(n,"添付ファイル（共通）","×","○","ー","ファイル","ー", cond,
           "Tải lên file PDF",
           "File PDF tải lên thành công\n「添付ファイル」chỉ xuất hiện 1 lần")
        n = next_no()
        tc(n,"利用開始希望日（共通）","○","○","-","数値","4", cond,
           "Nhập năm tháng tháng sau (ví dụ:「202601」)",
           "「202601」được hiển thị (bắt buộc)\n「利用開始希望日」chỉ xuất hiện 1 lần")

        # Submit TC
        submit_data = ", ".join(OPT_SUBMIT[o] for o in combo)
        n = next_no()
        tc_submit(n, cond + f"\nĐiền: {submit_data}, 利用開始希望日=202601, 部門長=test")


# ---- LAYOUT 8 ----
L8_COND = "Chọn「3.その他」ở 工事の種類"
sec("【Layout⑧】工事の種類=その他", GREEN)
tc(TC_NO[0],"工事の種類","○","○","○","ラジオボタン","ー","",
   "Chọn「3.その他」",
   "「3.その他」được chọn và trường「備考」hiển thị bắt buộc")
TC_NO[0] += 1
tc(TC_NO[0],"備考","○","○","○","テキスト","ー", L8_COND,
   "Nhập「テスト nội dung yêu cầu công trình」",
   "Có thể nhập, văn bản hiển thị đầy đủ (bắt buộc nhập)")
TC_NO[0] += 1
tc(TC_NO[0],"添付ファイル","×","○","ー","ファイル","ー", L8_COND,
   "Tải lên file PDF",
   "File PDF tải lên thành công")
TC_NO[0] += 1
tc(TC_NO[0],"利用開始希望日","×","○","-","数値","4", L8_COND,
   "Nhập năm tháng tháng sau (ví dụ:「202601」)",
   "「202601」được hiển thị (không bắt buộc trong Layout⑧)")
TC_NO[0] += 1
tc(TC_NO[0],"※3日以降…","ー","ー","-","テキスト","ー",
   "Hiển thị màn hình vào ngày 5～10 của tháng hiện tại",
   "Hiển thị màn hình nhập liệu",
   "「※3日以降の申請は、次回の定例工事での対応となります。」được hiển thị")
TC_NO[0] += 1
tc(TC_NO[0],"※鳴動変更がある…","ー","ー","-","テキスト","ー","",
   "Hiển thị màn hình nhập liệu",
   "「※鳴動変更がある場合は、変更する番号を備考に記載ください。」được hiển thị")
TC_NO[0] += 1
tc(TC_NO[0],"利用開始希望日定例工事…","ー","ー","-","テキスト","ー","",
   "Hiển thị màn hình nhập liệu",
   "「利用開始希望日：定例工事は毎月10日ごろ行っています。」được hiển thị")
TC_NO[0] += 1
tc_submit(TC_NO[0], L8_COND + "\nĐiền: 備考=テスト工事内容, 部門長=test")
TC_NO[0] += 1

# ---- BOUNDARY ----
sec("【Kiểm tra số ký tự tối đa】", YELLOW)
boundaries = [
    ("連絡先","テキスト","15","Nhập 16 ký tự trở lên rồi nhấn「申請」"),
    ("備考","テキスト","256","Nhập 257 ký tự trở lên rồi nhấn「申請」"),
    ("台数（Layout②③）","数値","3","Nhập 4 chữ số trở lên rồi nhấn「申請」"),
    ("a）既存の内線と同じ盤面⇒（samePanel）","数値","12","Nhập 13 chữ số trở lên rồi nhấn「申請」"),
    ("変更したい内線番号（extChange/2/3）","数値","12","Nhập 13 chữ số trở lên rồi nhấn「申請」"),
    ("a）既存の内線と同じ盤面（samePanelExtension）","数値","12","Nhập 13 chữ số trở lên rồi nhấn「申請」"),
    ("設定する外線番号","数値","12","Nhập 13 chữ số trở lên rồi nhấn「申請」"),
    ("現在の発番","数値","12","Nhập 13 chữ số trở lên rồi nhấn「申請」"),
    ("変更後の発番","数値","12","Nhập 13 chữ số trở lên rồi nhấn「申請」"),
]
for i,(fname,ftype,fmax,finp) in enumerate(boundaries):
    no = TC_NO[0]
    tc(no,fname,"×","×","×",ftype,fmax,f"Max {fmax} ký tự",
       finp,
       "Hiển thị「入力内容に誤りがあります。」ở đầu màn hình\nHiển thị thông báo lỗi ở ô tương ứng")
    TC_NO[0] += 1

wb.save(OUTPUT)
print(f"Done: {OUTPUT}")
print(f"Total rows: {ROW[0]-10}  |  Last TC No: {TC_NO[0]-1}")
