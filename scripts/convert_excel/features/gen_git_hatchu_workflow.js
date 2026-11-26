// gen_git_hatchu_workflow.js — GIT発注検収申請 Workflow Testcase
// Creator: ThuNT | Date: 2026-08-14 | Template: testcase_template_workflow.xlsx
"use strict";
const path = require("path");
const ExcelJS = require("exceljs");

const TEMPLATE = path.resolve(__dirname, "..", "..", "..", "templates", "testcase", "testcase_template_workflow.xlsx");
const OUTPUT   = path.resolve(__dirname, "..", "..", "..", "CMS", "Testcase", "【GIT】発注検収申請_ワークフロー.xlsx");
const SHEET    = "ワークフロー";
const CREATOR  = "ThuNT";
const TODAY    = new Date("2026-08-14");

// TC data: [no, daiko, chuko(empty), shoko, condition, user, input, output]
// \n = xuống dòng thực trong cell (wrapText auto-enabled)
const TC = [
  [1,  "発注_Full Node", "", "Node_name",
   "Full Node\nリストALLから承認操作\nRandom cmt", "",
   "User shinseisha create Doc, có Add user kankei",
   "- Status là 上長待ち\n- Gửi mail shounin đến user 上長"],
  [2,  "発注_Full Node", "", "Node_name", "", "",
   "User 上長 shounin",
   "- Status là 室長待ち\n- Gửi mail shounin đến user 室長"],
  [3,  "発注_Full Node", "", "Node_name", "", "",
   "User 室長 shounin",
   "- Status là 部門長待ち\n- Gửi mail shounin đến user 部門長 và all user kankeisha（startkankel）"],
  [4,  "発注_Full Node", "", "User kankeisha 1",
   "Random khoảng 7,8 user kankei", "",
   "User 関係者1 shounin\nKhông nhập thông tin ở mục 業態記入欄",
   "- Status là 部門長待ち"],
  [5,  "発注_Full Node", "", "User kankeisha 2",
   "Random khoảng 7,8 user kankei", "",
   "User 関係者2 shounin",
   "- Status là 部門長待ち"],
  [6,  "発注_Full Node", "", "Node_name",
   "Chưa kankei done", "",
   "部門長 shounin",
   "- Status là PMO室受付待ち\n- Không gửi mail cho user PMO室受付"],
  [7,  "発注_Full Node", "", "Node_name",
   "User kankei cuối shounin", "",
   "User kankei cuối shounin",
   "- Status là PMO室受付待ち\n- Gửi mail cho user PMO室受付"],
  [8,  "発注_Full Node", "", "Node_name",
   "Kankei done", "",
   "部門長 shounin",
   "- Status là PMO室受付待ち\n- Gửi mail cho user PMO室受付"],
  [9,  "発注_Full Node", "", "Node_name", "", "",
   "User PMO受付 shounin",
   "- Status là 作業完了待ち\n- Gửi mail cho user 作業完了"],
  [10, "発注_Full Node", "", "Node_name", "", "",
   "User 作業完了 shounin",
   "- Status là 完了\n- Gửi mail cho user 申請者 và user share"],
  [15, "発注_Full Node", "", "引戻し",
   "Random user kéo về", "",
   "Sau khi shounin, bấm 引き戻し",
   "Back về status trước đó, xóa dấu, có thể shounin/ sashi"],
  [16, "発注_Full Node", "", "取止め",
   "bản ghi ở status save nháp or saishinsei", "",
   "Bấm 取止め",
   "Status là 取止め、done xử lý"],
  [17, "発注_Full Node", "", "差戻",
   "User shouninsha  thực hiện 差戻し", "",
   "bấm button 差戻しへ申請者",
   "- Gửi mail 差戻し đến user 申請者\n- Status = 申請者待ち\n- Thực hiện xóa dấu các user đã đóng dấu"],
  [18, "発注_Not Full Node", "", "Node_name",
   "Not Full Node\nリストALLから承認操作\nRandom cmt", "",
   "User shinseisha create Doc, chỉ add 部門長/kankei (skip 上長/室長)",
   "- Status là 部門長待ち\n- Gửi mail shounin đến user 部門長 và all user kankeisha"],
  [19, "発注_Not Full Node", "", "User kankeisha 1",
   "Random khoảng 7,8 user kankei", "",
   "User 関係者1 shounin\nKhông nhập thông tin ở mục 業態記入欄",
   "- Status là 部門長待ち"],
  [20, "発注_Not Full Node", "", "User kankeisha 2",
   "Random khoảng 7,8 user kankei", "",
   "User 関係者2 shounin",
   "- Status là 部門長待ち"],
  [21, "発注_Not Full Node", "", "Node_name",
   "Chưa kankei done", "",
   "部門長 shounin",
   "- Status là PMO室受付待ち\n- Không gửi mail cho user PMO室受付"],
  [22, "発注_Not Full Node", "", "Node_name",
   "User kankei cuối shounin", "",
   "User kankei cuối shounin",
   "- Status là PMO室受付待ち\n- Gửi mail cho user PMO室受付"],
  [23, "発注_Not Full Node", "", "Node_name",
   "Kankei done", "",
   "部門長 shounin",
   "- Status là PMO室受付待ち\n- Gửi mail cho user PMO室受付"],
  [24, "発注_Not Full Node", "", "Node_name", "", "",
   "User PMO受付 shounin",
   "- Status là 作業完了待ち\n- Gửi mail cho user 作業完了"],
  [25, "発注_Not Full Node", "", "Node_name", "", "",
   "User 作業完了 shounin",
   "- Status là 完了\n- Gửi mail cho user 申請者 và user share"],
  [26, "発注_Not Full Node", "", "引戻し",
   "Random user kéo về", "",
   "Sau khi shounin, bấm 引き戻し",
   "Back về status trước đó, xóa dấu, có thể shounin/ sashi"],
  [27, "発注_Not Full Node", "", "取止め",
   "bản ghi ở status save nháp or saishinsei", "",
   "Bấm 取止め",
   "Status là 取止め、done xử lý"],
  [28, "発注_Not Full Node", "", "差戻",
   "User shouninsha  thực hiện 差戻し", "",
   "bấm button 差戻しへ申請者",
   "- Gửi mail 差戻し đến user 申請者\n- Status = 申請者待ち\n- Thực hiện xóa dấu các user đã đóng dấu"],
];

async function run() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(TEMPLATE);
  const ws = wb.getWorksheet(SHEET);

  // Update metadata
  ws.getCell("F2").value = "GIT発注検収申請";
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
