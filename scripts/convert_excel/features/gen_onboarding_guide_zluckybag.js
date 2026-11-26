const path = require('path');
const ExcelJS = require('exceljs');

function styleHeader(row) {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F4E78' },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFBFBFBF' } },
      left: { style: 'thin', color: { argb: 'FFBFBFBF' } },
      bottom: { style: 'thin', color: { argb: 'FFBFBFBF' } },
      right: { style: 'thin', color: { argb: 'FFBFBFBF' } },
    };
  });
}

function styleBodyRow(row) {
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

function autoSize(ws, widths) {
  widths.forEach((w, idx) => {
    ws.getColumn(idx + 1).width = w;
  });
}

async function main() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'QuynhNT';
  workbook.created = new Date('2026-07-01T00:00:00');
  workbook.modified = new Date();

  const ws0 = workbook.addWorksheet('0_Gioi_Thieu');
  ws0.addRow(['HANG MUC', 'NOI DUNG']);
  styleHeader(ws0.getRow(1));
  [
    ['Ten tai lieu', 'Huong dan su dung module Lucky Bag (zluckybag) cho nguoi moi trong du an'],
    ['Muc tieu', 'Giup tat ca role (PM/BA/Dev/QA/CSKH/Ops) hieu nhanh luong nghiep vu, trang thai, diem canh bao va cach van hanh thuc te.'],
    ['Pham vi', 'Can cu theo specs/zluckybag/zluckybag_spec.html (phien ban 2026-06-24).'],
    ['Tom tat de nho', 'Lucky Bag hoat dong theo mo hinh xo so co gioi han. User dang ky, cho ket qua, trung thi thanh toan dung han va nhan hang theo 2 cach: tai cua hang hoac giao tan nha.'],
    ['8 luong chinh', '1) Hien thi tai Home\n2) Dang ky boc tham\n3) Xem ket qua\n4) Thanh toan\n5) Nhan tui\n6) Het han thanh toan\n7) Tu choi nhan tui\n8) Khao sat sau su kien'],
    ['9 trang thai he thong', 'bookingStatus = 0..8, trong do quan trong nhat: 3 (co ket qua), 4 (da thanh toan), 5 (het han), 8 (da nhan tui).'],
    ['Nguyen tac nghiep vu quan trong', 'Khong duoc huy sau khi dang ky; co han thanh toan; qua han mat quyen mua; nhan tai cua hang qua han bao quan co the mat quyen nhan va khong hoan tien.'],
    ['Thuat ngu tieng Nhat can nho', '申し込み: Dang ky\n抽選結果発表: Cong bo ket qua xo so\n購入手続き: Thu tuc thanh toan\n店舗で受取: Nhan tai cua hang\n宅配で受取: Nhan qua giao hang'],
    ['Huong dan su dung tai lieu', 'Doc sheet 1 de hieu luong tong the, sheet 2 theo role, sheet 3 de chay du an thuc te, sheet 4 de tra nhanh thuat ngu + FAQ.'],
  ].forEach((r) => {
    ws0.addRow(r);
    styleBodyRow(ws0.lastRow);
  });
  autoSize(ws0, [28, 120]);

  const ws1 = workbook.addWorksheet('1_Luong_Nghiep_Vu');
  ws1.addRow(['LUONG', 'THOI DIEM', 'INPUT CHINH', 'XU LY HE THONG', 'OUTPUT/MAU CHOT']);
  styleHeader(ws1.getRow(1));
  [
    ['1. Hien thi tai Home', 'Moi lan vao Home', 'Trang thai login + campaign + bookingStatus', 'Kiem tra campaign, lay du lieu Lucky Bag, render nhan theo bookingStatus, co the hien popup uu tien', 'User nhin thay dung CTA: mo dang ky, cho ket qua, thanh toan, nhan hang...'],
    ['2. Dang ky boc tham', 'Trong BY_BOOKED_TIME', 'Dong y dieu khoan + thong tin nhan hang + xac nhan khong huy', 'Validate form, gui don dang ky', 'Popup tiep nhan dang ky thanh cong va cho ngay cong bo ket qua'],
    ['3. Xem ket qua', 'Sau ngay cong bo', 'Du lieu ket qua tung vong', 'Phan nhanh trung/truot vong 1/vong 2/bo sung', 'Neu trung: mo luong thanh toan. Neu truot: thong bao va huong dan vong tiep theo neu co'],
    ['4. Thanh toan', 'Sau khi trung, trong han', 'Dong y quy dinh thanh toan + kenh thanh toan (the/PayPay)', 'Mo web thanh toan, nhan callback ket qua', 'Thanh cong -> bookingStatus=4 (cho nhan hang). Qua han -> bookingStatus=5'],
    ['5. Nhan tui', 'Sau thanh toan', 'Loai nhan hang (cua hang/giao tan nha)', 'Neu cua hang: hien ma dat cho + cho user xac nhan da nhan. Neu giao: hien ma van don', 'Hoan tat nhan -> bookingStatus=8'],
    ['6. Het han thanh toan', 'Qua han mua', 'Khong thanh toan dung han', 'Chuyen trang thai het han, popup mat quyen mua (1 lan)', 'bookingStatus=5 + co the mo khao sat ly do'],
    ['7. Tu choi nhan tui', 'Sau khi trung', 'User chu dong tu choi', 'Ghi nhan tu choi va ket thuc quyen mua', 'bookingStatus=1, khong the phuc hoi quyen nhan'],
    ['8. Khao sat sau su kien', 'Sau het han/tu choi', 'Danh sach cau hoi + co chua tra loi', 'Hien thi khao sat 1 lan, ghi nhan dap an', 'Du lieu feedback cho cai tien san pham'],
  ].forEach((r) => {
    ws1.addRow(r);
    styleBodyRow(ws1.lastRow);
  });
  autoSize(ws1, [22, 22, 28, 45, 45]);

  ws1.addRow([]);
  ws1.addRow(['BANG MA TRANG THAI', 'Y NGHIA NGAN', 'HANH DONG DUOC PHEP', 'RUI RO CHINH', 'GOI Y QA/UAT']);
  styleHeader(ws1.getRow(ws1.lastRow.number));
  [
    ['0 - BE_REGISTERED', 'Chua dang ky', 'Xem lich + cho mo dang ky', 'Hieu sai la da mo dang ky', 'Check nhan va CTA dung theo lich'],
    ['1 - REFUSE_TO_PAY', 'Da tu choi', 'Chi xem thong tin', 'Tuong nham co the quay lai mua', 'Dam bao khong con CTA thanh toan'],
    ['2 - ORDERED_NO_RESULTS', 'Da nop don/cho ket qua', 'Cho cong bo ket qua', 'User lo lang vi khong thay update', 'Check text huong dan ngay cong bo ro rang'],
    ['3 - ORDERED_RESULTS', 'Da co ket qua', 'Neu trung: thanh toan; neu truot: xem huong dan tiep', 'Nhan ket qua sai vong', 'Test theo tung kich ban vong 1/2/bo sung'],
    ['4 - REGISTERED_PAYMENT_RECEIVE_BAG_YET', 'Da thanh toan, cho nhan', 'Nhan hang theo cach da chon', 'Nhap nham kenh nhan/cua hang', 'Check thong tin ma dat cho/ma van don'],
    ['5 - EXPIRED_REGISTRATION_PAYMENT', 'Het han thanh toan', 'Chi xem + co the khao sat', 'Khieu nai khong hieu ly do mat quyen', 'Check popup thong bao 1 lan va wording dung'],
    ['6 - LUCKY_BAG_SIX', 'Trang thai an/noi bo', 'Khong hien thi nghiep vu cho user', 'Lo UI khong mong muon', 'Dam bao khong render sai man hinh'],
    ['7 - BY_BOOKED_TIME', 'Dang mo dang ky', 'Nop don boc tham', 'Dang ky loi nhieu lan', 'Dam bao quy tac 1 user/1 don'],
    ['8 - RECEIVED_BAG', 'Da nhan tui', 'Chi xem lich su/thong tin', 'Con nham la chua nhan', 'Check nhan hoan tat va khong cho thao tac lap'],
  ].forEach((r) => {
    ws1.addRow(r);
    styleBodyRow(ws1.lastRow);
  });

  const ws2 = workbook.addWorksheet('2_Theo_Role');
  ws2.addRow(['ROLE', 'MUC TIEU CHINH', 'CAN HIEU GI VE LUCKY BAG', 'DAU VIEC HANG NGAY', 'CANH BAO DE TRANH LOI']);
  styleHeader(ws2.getRow(1));
  [
    ['PM/PO', 'Dam bao feature dung business va deadline campaign', 'Ngan sach, mốc ngay campaign, policy khong huy sau dang ky, han thanh toan/nhan hang', 'Chot requirement theo tung phase, review popup copy, theo doi KPI (dang ky, trung, thanh toan, nhan)', 'Tranh doi quy tac sat ngay release gay vo test scope'],
    ['BA', 'Lam ro rule va edge case', 'Mapping day du bookingStatus 0-8, dieu kien hien/an CTA, wording tung thong bao', 'Viet use case + decision table trung/truot + state transition', 'Tranh bo sot kich ban truot vong 1 nhung co vong 2'],
    ['Dev Mobile', 'Implement dung luong va trang thai', 'Event trigger popup, callback thanh toan, rendering theo role login va state', 'Code theo state machine, log event, bat cac guard condition', 'Tranh hardcode text/logic campaign trong app'],
    ['QA Manual', 'Dam bao khong regress luong tien/nhan hang', 'Test full 8 luong + 9 trang thai + 2 phuong thuc nhan', 'Viet testcase theo happy/negative/edge; retest popup 1 lan; verify status sau callback', 'Can test time-based: qua han thanh toan, qua han nhan cua hang'],
    ['QA Automation', 'Tu dong hoa regression xuyen su kien', 'State setup data, API mock ket qua trung/truot, callback thanh toan', 'Build suite smoke + regression theo campaign', 'Tranh test phu thuoc du lieu production va gio he thong thuc'],
    ['CSKH', 'Ho tro user nhanh va dung thong diep', 'Nghia tung thong bao loi, khi nao mat quyen mua, tai sao khong hoan tien', 'Tra loi theo script tinh huong, huong dan user den man hinh dung', 'Khong hua "khoi phuc quyen" neu state da REFUSE/EXPIRED'],
    ['Marketing/CRM', 'Toi uu noi dung va conversion', 'Thong diep campaign, CTA theo tung phase, luong push thong bao', 'Len lich push theo phase va segment', 'Tranh spam push lam user bo qua thong diep quan trong'],
    ['Ops/Release', 'Van hanh on dinh trong mua campaign', 'Rui ro he thong tai cao, monitor callback thanh toan, rollback plan', 'Theo doi dashboard, canh bao loi API/payment, backup runbook', 'Can lock config dung gio mo/ket thuc de tranh sai nhan'],
  ].forEach((r) => {
    ws2.addRow(r);
    styleBodyRow(ws2.lastRow);
  });
  autoSize(ws2, [20, 28, 38, 35, 40]);

  const ws3 = workbook.addWorksheet('3_Runbook_Thuc_Thi');
  ws3.addRow(['GIAI DOAN', 'CHECKLIST BAT BUOC', 'OWNER GOI Y', 'DAU RA MONG DOI']);
  styleHeader(ws3.getRow(1));
  [
    ['Truoc campaign (T-14 -> T-1)', '1) Chot config campaign va timeline\n2) Chot policy thanh toan/hoan tien\n3) UAT full 8 luong\n4) Dry-run callback thanh toan\n5) Chot script CSKH', 'PM/BA/QA/Ops', 'San sang mo campaign khong blocker'],
    ['Ngay mo dang ky (T0)', '1) Verify nhan BY_BOOKED_TIME\n2) Dang ky mau 1 case thanh cong\n3) Theo doi loi API dang ky\n4) Check push thong bao mo dang ky', 'Ops + QA + CRM', 'User dang ky duoc, khong loi nghiem trong'],
    ['Ngay cong bo ket qua', '1) Verify split trung/truot\n2) Verify CTA thanh toan\n3) Verify popup wording tung vong\n4) Theo doi support ticket tang dot bien', 'PM + QA + CSKH', 'Thong diep ro rang, user hieu can lam gi tiep'],
    ['Trong han thanh toan', '1) Monitor callback thanh toan thanh cong\n2) Detect case fail due to payment method\n3) Verify state chuyen 3 -> 4', 'Ops + Dev + QA', 'Ty le thanh toan on dinh, state chuan'],
    ['Qua han thanh toan', '1) Verify state 5\n2) Popup mat quyen hien 1 lan\n3) Khao sat hien dung doi tuong', 'QA + CSKH + BA', 'Khong user nao con CTA thanh toan sau han'],
    ['Giai doan nhan hang', '1) Verify luong nhan tai cua hang\n2) Verify luong giao tan nha + ma van don\n3) Verify canh bao qua han nhan va no-refund', 'QA + Ops + CSKH', 'Giam tranh chap va sai expectation'],
    ['Ket thuc campaign', '1) Tong ket metric dang ky-trung-thanh toan-nhan\n2) Tong hop feedback khao sat\n3) Lap backlog cai tien', 'PM + Data + BA', 'Bao cao retro va ke hoach cai tien dot sau'],
  ].forEach((r) => {
    ws3.addRow(r);
    styleBodyRow(ws3.lastRow);
  });
  autoSize(ws3, [28, 60, 20, 32]);

  const ws4 = workbook.addWorksheet('4_ThuatNgu_FAQ');
  ws4.addRow(['MUC', 'NOI DUNG']);
  styleHeader(ws4.getRow(1));
  [
    ['Thuat ngu', '福袋 (Lucky Bag): Goi san pham su kien ban theo hinh thuc xo so\n抽選: Boc tham/xo so\n当選: Trung\n落選: Truot\n決済: Thanh toan\n店舗受取: Nhan tai cua hang\n宅配受取: Nhan qua giao tan nha'],
    ['FAQ 1', 'Hoi: Vi sao user trung roi ma van khong mua duoc?\nDap: Vi qua han thanh toan, state da chuyen sang EXPIRED (5).'],
    ['FAQ 2', 'Hoi: User tu choi xong co mo lai mua duoc khong?\nDap: Khong. REFUSE (1) la mat quyen mua va khong phuc hoi.'],
    ['FAQ 3', 'Hoi: Khi nao hien khao sat?\nDap: Sau khi het han thanh toan hoac tu choi, va chi hien 1 lan neu chua tra loi.'],
    ['FAQ 4', 'Hoi: Nhan tai cua hang can gi?\nDap: Can ma dat cho (予約受付番号) va den dung cua hang da chon.'],
    ['FAQ 5', 'Hoi: Co doi cua hang nhan hang duoc khong?\nDap: Khong. Sau khi chot don, cua hang nhan khong doi duoc.'],
    ['FAQ 6', 'Hoi: Vi sao khong hoan tien khi qua han nhan tai cua hang?\nDap: Theo policy hien hanh trong spec: qua han bao quan thi mat quyen nhan va khong hoan tien.'],
    ['Lien he noi bo', 'Can hoi nhanh PM/BA khi gap case mo ho. Can hoi Ops/Dev khi gap van de callback thanh toan hoac state khong khop UI.'],
  ].forEach((r) => {
    ws4.addRow(r);
    styleBodyRow(ws4.lastRow);
  });
  autoSize(ws4, [20, 120]);

  const out = process.argv[2] || path.resolve(
    __dirname,
    '../../../Release/7.4.0 (Android 16KB, Tăng độ sáng màn hình giỏ coupon, thêm 2 loại popup)/Huong_dan_onboarding_zluckybag.xlsx'
  );

  await workbook.xlsx.writeFile(out);
  console.log(`WROTE: ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
