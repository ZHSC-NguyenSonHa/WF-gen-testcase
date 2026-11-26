---
name: format-testcase-workflow
description: Skill tạo và chuẩn hóa manual testcase cho template testcase_template_workflow.xlsx (nghiệp vụ workflow nhiều node/phê duyệt). Bao gồm quan điểm chia test, cách điền từng cột, phong cách viết của QA team.
argument-hint: "Spec workflow, danh sách node/role, điều kiện Full Node vs Not Full Node, output folder, release/version"
---

# Format Testcase — Workflow Template

## Mục tiêu

Sinh bộ testcase cho nghiệp vụ workflow phê duyệt nhiều node theo file template  
`templates/testcase/testcase_template_workflow.xlsx`.  
Skill này hướng dẫn **quan điểm chia test**, **cách điền từng cột** và **phong cách viết** khớp với QA team.

---

## Khi nào dùng skill này

- Chức năng có luồng tạo → phê duyệt (承認) → hoàn thành (完了)
- Có nhiều node/vai trò tham gia duyệt theo thứ tự
- Có điều kiện 関係者 (kankei) ảnh hưởng tới việc chuyển node
- Cần cover cả nhánh Full Node lẫn Not Full Node

---

## Cấu trúc cột template (sheet: ワークフロー)

| Cột | Tên cột | Vai trò | Ghi chú |
|-----|---------|---------|---------|
| B (C2) | No | Số thứ tự TC | Có thể bỏ số (gap OK, vd 1→10→15) |
| C (C3) | 大項目 | Nhóm test lớn | VD: `発注_Full Node`, `発注_Not Full Node` |
| D (C4) | 中項目 | Nhóm test trung | Thường để trống — merge theo 大項目 |
| E (C5) | 小項目 | Quan điểm test cụ thể | VD: `Node_name`, `User kankeisha 1`, `引戻し` |
| F (C6) | Condition (前提条件) | Tiền điều kiện | Điều kiện đặc biệt kích hoạt case này |
| G (C7) | 操作ユーザー | User thực hiện | Thường để trống — đã nêu trong Input |
| H (C8) | Input (操作) | Hành động thực hiện | Viết ngắn, không dùng 1./2. — 1 câu/action |
| I (C9) | Output (期待動作) | Kết quả kỳ vọng | Bullet `- ` mỗi dòng, bắt đầu bằng Status/mail |
| J (C10) | 結果 | Kết quả test | Điền sau khi test: `〇` / `△` / `×` |

> **Lưu ý về 中項目 (C4):** Trong template thực tế cột C4 thường **trống** — các row trong cùng 大項目 tự merge nhìn vào. Chỉ dùng C4 khi muốn chia thêm nhóm trung gian rõ ràng.

---

## Quan điểm chia test (小項目 standard)

Mỗi workflow phải có đủ các 小項目 sau:

| 小項目 | Nội dung cần test |
|--------|------------------|
| `Node_name` | Luồng chính — từng node duyệt theo thứ tự, verify Status + mail sau mỗi bước |
| `User kankeisha 1` | 関係者 đầu tiên shounin (khi chưa done) — Status KHÔNG đổi sang node tiếp |
| `User kankeisha 2` | 関係者 thứ hai shounin (khi chưa done) — Status vẫn giữ nguyên |
| `Node_name` (sau kankei done) | Node chính duyệt khi tất cả kankei đã done → Status chuyển đúng + gửi mail đến node tiếp theo|
| `引戻し` | Kéo về — bất kỳ user nào có quyền kéo, verify: status lùi 1 bước, dấu duyệt xóa |
| `取止め` | Hủy bỏ — chỉ áp dụng khi record ở trạng thái nháp/saishinsei |
| `差戻` | Trả lại cho người nộp — verify: mail gửi 申請者, status = 申請者待ち, dấu xóa |

---

## Hai nhóm 大項目 bắt buộc

### Nhóm 1: `<Tên申請書>_Full Node`
- Tất cả node đều được cấu hình (有り)
- Luồng dài nhất: Create Doc → 上長 → 室長 → 部門長 → (kankei) → PMO受付 → 作業完了 → 完了 ( đi qua all node, có thể thay đổi tùy spec )
- Cover 3 biến thể kankei: **kankei chưa done → node chặn**, **kankei done → node thông**

### Nhóm 2: `<Tên申請書>_Not Full Node`
- Một hoặc nhiều node trung gian bị skip (なし)
- Luồng ngắn hơn: tạo → bỏ qua node skip → đến node đầu tiên active
- Phải verify đúng: node skip không xuất hiện trong flow, status chuyển thẳng

> **Cách đặt tên 大項目:** Dùng tên document/申請書 làm prefix. VD: `発注_Full Node`, `稟議_Full Node`, `GITApp_Full Node`.

---

## Cách viết Condition (前提条件) — C6

Chỉ điền khi có **điều kiện đặc biệt** làm case này khác với case mặc định:

```
Full Node
Thao tác shouin từ list ALL
Random cmt          ← (điều kiện để test random comment)

Random khoảng 7,8 user kankei   ← (điều kiện số lượng kankei)

Chưa kankei done                ← (điều kiện trạng thái kankei)

User kankei cuối shounin        ← (điều kiện: đây là kankei cuối)

Kankei done                     ← (điều kiện: tất cả kankei đã done)

bản ghi ở status save nháp or saishinsei  ← (điều kiện để thực hiện 取止め)

User shouninsha thực hiện 差戻し  ← (điều kiện actor cụ thể)
```

> **Để trống C6** khi đây là bước mặc định của flow — không cần điều kiện đặc biệt.

---

## Cách viết Input (操作) — C8

**Phong cách:** Ngắn gọn, 1-2 dòng, thể hiện AI TỰ NÓI hành động. Không dùng format "1. 2. 3."

```
User shinseisha create Doc, có Add user kankei    ← tạo + add kankei
User 上長　shounin                                 ← node 上長 approve
User 関係者1 shounin
Không nhập thông tin ở mục 業態記入欄              ← 2 dòng khi có thêm điều kiện input
部門長　shounin
User PMO受付 shounin
User 作業完了 shounin
Sau khi shounin, bấm 引き戻し                     ← action đặc biệt sau khi đã approve
Bấm 取止め
bấm button 差戻しへ申請者                          ← action + target rõ
```

> **Quy tắc:** Mỗi row = 1 action chính của 1 actor. Không gộp nhiều actor vào 1 row.

---

## Cách viết Output (期待動作) — C9

**Phong cách:** Bullet points bắt đầu bằng `- `, không đánh số. Ưu tiên **Status** trước, **mail** sau.

**Pattern chuẩn cho bước approve:**
```
- Status là <status tiếp theo>
- Gửi mail shounin đến user <role nhận mail>
```

**Ví dụ thực tế từ template:**
```
- Status là 上長待ち
- Gửi mail shounin đến user 上長

- Status là 室長待ち
- Gửi mail shounin đến user 室長

- Status là 部門長待ち
- Gửi mail shounin đến user 部門長 và all user kankeisha（startkankel）

- Status là  PMO室受付待ち
-  Không gửi mail cho user PMO室受付    ← trường hợp đặc biệt: KHÔNG gửi mail

- Status là  PMO室受付待ち
-  Gửi mail cho user PMO室受付

- Status là 完了
-  Gửi mail Done cho user　申請者　và user share
```

**Pattern cho 引戻し:**
```
Back về status trước đó, xóa dấu, có thể shounin/ sashi
```

**Pattern cho 差戻:**
```
- Gửi mail 差戻し　đến user 申請者
- Status = 申請者待ち
- Thực hiện xóa dấu các user đã đóng dấu
```

> **Lưu ý quan trọng:**  
> - Luôn verify cả **2 chiều**: Status chuyển đúng VÀ mail gửi đúng người  
> - Nếu logic mail có ngoại lệ (vd node kankei chưa done → KHÔNG gửi mail PMO), phải ghi rõ **Không gửi mail**  
> - Trạng thái hoàn thành = `完了`, không có mail tiếp theo

---

## Quy trình sinh testcase (5 bước)

### Bước 1 — Đọc spec, lập bảng node
Tổng hợp danh sách node theo thứ tự, với role và điều kiện require/skip:

| Thứ tự | Node | Role duyệt | Require? | Mail sau duyệt |
|--------|------|-----------|----------|----------------|
| 1 | 上長 | 上長 | Có | → 室長 |
| 2 | 室長 | 室長 | Có | → 部門長 |
| ... | ... | ... | ... | ... |

### Bước 2 — Xác định 大項目
- Mỗi variant workflow = 1 大項目
- Tối thiểu 2 nhóm: `_Full Node` và `_Not Full Node`
- Nếu có nhiều loại document (発注, 稟議...) → mỗi loại 2 nhóm

### Bước 3 — Map 小項目 cho từng node
Với mỗi node trong chain, tạo row theo thứ tự:
1. Row `Node_name` — node chính duyệt (+ verify mail)
2. Row `User kankeisha 1` — nếu có kankei tại node này
3. Row `User kankeisha 2` — nếu có nhiều kankei
4. Row `Node_name` lại (sau kankei done) — nếu kankei ảnh hưởng flow

### Bước 4 — Thêm các case đặc biệt
Sau khi xong full flow, bổ sung:
- `引戻し` (số TC gap, vd TC15 sau TC10)
- `取止め`
- `差戻`

### Bước 5 — Review checklist trước khi export

Dùng checklist dưới đây trước khi export file `.xlsx` và giao cho khách hàng:
- Coverage: đủ node, đủ kankei variant, đủ 3 case đặc biệt
- Nội dung: bullet output đúng, mail ngoại lệ ghi rõ, condition không thừa
- Format: 大項目 merge, No gap hợp lý, không có `\u3000` hay `\n` literal

---

## Checklist trước khi submit

**Coverage:**
- [ ] Đủ row cho mỗi node trong chuỗi phê duyệt (Full Node)
- [ ] Có cả case kankei chưa done (Status KHÔNG đổi) và kankei đã done (Status đổi)
- [ ] Có row `引戻し`, `取止め`, `差戻` trong mỗi 大項目
- [ ] Not Full Node: verify đúng node bị skip, flow vẫn complete

**Nội dung:**
- [ ] Mỗi Output bắt đầu bằng `- Status là ...`
- [ ] Nêu rõ trường hợp KHÔNG gửi mail (nếu có)
- [ ] Condition (C6) để trống với các bước default — không điền thừa
- [ ] 操作ユーザー (C7) để trống — đã nêu trong Input

**Format:**
- [ ] 大項目 dùng prefix tên document (`発注_Full Node`, không phải chỉ `Full Node`)
- [ ] Số TC (No) có thể gap — không cần liên tục
- [ ] Output dùng `- ` bullet, không đánh số 1. 2. 3.

---

## Ví dụ đầy đủ một nhóm 大項目

| No | 大項目 | 中項目 | 小項目 | Condition | 操作ユーザー | Input | Output |
|----|--------|--------|--------|-----------|------------|-------|--------|
| 1 | 発注_Full Node | | Node_name | Full Node / Thao tác shouin từ list ALL / Random cmt | | User shinseisha create Doc, có Add user kankei | - Status là 上長待ち<br>- Gửi mail shounin đến user 上長 |
| 2 | 発注_Full Node | | Node_name | | | User 上長　shounin | - Status là 室長待ち<br>- Gửi mail shounin đến user 室長 |
| 3 | 発注_Full Node | | Node_name | | | User 室長 shounin | - Status là 部門長待ち<br>- Gửi mail shounin đến user 部門長 và all user kankeisha |
| 4 | 発注_Full Node | | User kankeisha 1 | Random khoảng 7,8 user kankei | | User 関係者1 shounin<br>Không nhập thông tin ở mục 業態記入欄 | - Status là 部門長待ち |
| 5 | 発注_Full Node | | User kankeisha 2 | Random khoảng 7,8 user kankei | | User 関係者2 shounin | - Status là 部門長待ち |
| 6 | 発注_Full Node | | Node_name | Chưa kankei done | | 部門長　shounin | - Status là PMO室受付待ち<br>- Không gửi mail cho user PMO室受付 |
| 7 | 発注_Full Node | | Node_name | User kankei cuối shounin | | User kankei cuối shounin | - Status là PMO室受付待ち<br>- Gửi mail cho user PMO室受付 |
| 8 | 発注_Full Node | | Node_name | Kankei done | | 部門長　shounin | - Status là PMO室受付待ち<br>- Gửi mail cho user PMO室受付 |
| 9 | 発注_Full Node | | Node_name | | | User PMO受付 shounin | - Status là 作業完了待ち<br>- Gửi mail cho user 作業完了 |
| 10 | 発注_Full Node | | Node_name | | | User 作業完了 shounin | - Status là 完了<br>- Gửi mail cho user 申請者 và user share |
| 15 | 発注_Full Node | | 引戻し | Random user kéo về | | Sau khi shounin, bấm 引き戻し | Back về status trước đó, xóa dấu, có thể shounin/ sashi |
| 16 | 発注_Full Node | | 取止め | bản ghi ở status save nháp or saishinsei | | Bấm 取止め | Status là 取止め、done xử lý |
| 17 | 発注_Full Node | | 差戻 | User shouninsha thực hiện 差戻し | | bấm button 差戻しへ申請者 | - Gửi mail 差戻し　đến user 申請者<br>- Status = 申請者待ち<br>- Thực hiện xóa dấu các user đã đóng dấu |

> **TC numbering:** Full Node thường kết thúc ở TC10, rồi nhảy 15→16→17 cho 3 case đặc biệt (gap để chừa chỗ). Not Full Node bắt đầu từ 18 (tiếp nối No cuối của Full Node + 1).

---

## Tạo file Excel — Gen Script

Mỗi module workflow có 1 file gen riêng tại `scripts/convert_excel/features/gen_<module>.js`.  
File clone template → điền TC data → export `.xlsx` vào `CMS/Testcase/`.

### Cấu trúc file gen (pattern chuẩn)

```javascript
// gen_<module>_workflow.js
"use strict";
const path = require("path");
const ExcelJS = require("exceljs");

// Path từ features/ lên workspace root cần 3 cấp: ../../..
const TEMPLATE = path.resolve(__dirname, "..", "..", "..", "templates", "testcase", "testcase_template_workflow.xlsx");
const OUTPUT   = path.resolve(__dirname, "..", "..", "..", "CMS", "Testcase", "【MODULE】<Tên>_ワークフロー.xlsx");
const SHEET    = "ワークフロー";
const CREATOR  = "ThuNT";
const TODAY    = new Date("YYYY-MM-DD");

// TC data: [no, daiko, chuko(luôn ""), shoko, condition, user(luôn ""), input, output]
// \n trong string = xuống dòng thực trong cell (wrapText tự bật)
const TC = [
  [1, "<Doc>_Full Node", "", "Node_name",
   "Full Node\nリストALLから承認操作\nRandom cmt", "",
   "User shinseisha create Doc, có Add user kankei",
   "- Status là <status1>\n- Gửi mail shounin đến user <role1>"],
  // ... thêm rows theo flow
];
```

### TC data — quy tắc format

| Vị trí trong mảng | Tương ứng cột | Quy tắc |
|--------------------|---------------|---------|
| index 0 | B — No | Số nguyên, có thể gap (1,2,3...10,15,16,17) |
| index 1 | C — 大項目 | `"<Doc>_Full Node"` hoặc `"<Doc>_Not Full Node"` |
| index 2 | D — 中項目 | Luôn `""` (để trống) |
| index 3 | E — 小項目 | `"Node_name"` / `"User kankeisha 1"` / `"引戻し"` / `"取止め"` / `"差戻"` |
| index 4 | F — Condition | `""` nếu bước default; viết điều kiện nếu có |
| index 5 | G — 操作ユーザー | Luôn `""` — đã nêu trong Input |
| index 6 | H — Input | Hành động ngắn gọn, dùng `\n` để xuống dòng nếu có 2 actions |
| index 7 | I — Output | Bullet `- ` mỗi dòng, dùng `\n` giữa các bullet |

### Cách chạy

```powershell
cd "e:\Auto_Gen AI\Q 2\Q\scripts\convert_excel"
node features/gen_<module>_workflow.js
# Output: Done: ...\CMS\Testcase\【MODULE】...xlsx | TC count: <n>
```

### Output file — cấu trúc đa-sheet

File `.xlsx` output có **3 sheets**:

| Sheet | Mục đích | Data từ row |
|-------|----------|-------------|
| `MENU ` | Thông tin tổng quan + count | Auto-update bởi gen script |
| `ワークフロー` | Testcase chi tiết (function tests) | Row 11+ |
| `Scenario` | Happy-path end-to-end scenarios | Row 11+ |

#### Sheet Scenario
- Dùng cùng column structure như ワークフロー (header rows 1-10 được copy)
- Data format: `[no, daiko, chuko, shoko, cond, user, input, output]`
- `chuko` = Step number (VD: "Step 1", "Step 2", ...)
- `daiko` = tên scenario (VD: "シナリオ1：申請→承認→Done")
- Chỉ cover happy-path (不 cover 引き戻し/差戻し/取止め/連絡先)
- 大項目 (col C) được merge theo nhóm scenario

**Chuẩn 3 luồng scenario cho Full Node:**
```javascript
const SCENARIO = [
  // Scenario 1: 一時保存 → 申請 → (全node承認) → Done
  [1, "シナリオ1：一時保存→申請→承認→Done", "Step 1", "一時保存", ...],
  [1, ..., "Step 2", "申請", ...],
  [1, ..., "Step 3", "承認(上長)", ...],
  // ...

  // Scenario 2: 申請 → (全node承認) → Done (không qua 一時保存)
  [2, "シナリオ2：申請→承認→Done", "Step 1", "申請", ...],
  // ...

  // Scenario 3: 再申請 → (全node承認) → Done (sau 差戻し)
  [3, "シナリオ3：再申請→承認→Done", "Step 1", "再申請", ...],
  // ...
];
```

#### MENU sheet auto-update
Gen script tự động update các cell sau trong sheet `MENU ` (lưu ý: tên sheet có trailing space):

```javascript
const wsMENU = wb.getWorksheet("MENU ");
if (wsMENU) {
  // R3 C5-C9: App name
  for (let c = 5; c <= 9; c++) wsMENU.getRow(3).getCell(c).value = "<TênApp>";
  // R6 C3-C5: Sheet list thêm Scenario
  [3,4,5].forEach(c => { wsMENU.getRow(6).getCell(c).value = "・ Scenario"; });
  // R29-R33 C14: Count formulas = ワークフロー + Scenario
  const wf = "ワークフロー";
  wsMENU.getRow(29).getCell(14).value = { formula: wf + "!H2+Scenario!H2" };  // 総テスト数
  wsMENU.getRow(30).getCell(14).value = { formula: wf + "!H6+Scenario!H6" };  // 未
  wsMENU.getRow(31).getCell(14).value = { formula: wf + "!H3+Scenario!H3" };  // 〇
  wsMENU.getRow(32).getCell(14).value = { formula: wf + "!H4+Scenario!H4" };  // △
  wsMENU.getRow(33).getCell(14).value = { formula: wf + "!H5+Scenario!H5" };  // ×
}
```

**Mapping ワークフロー!H column:**
| Cell | Formula trong sheet | Ý nghĩa |
|------|---------------------|---------|
| H2 | `COUNT(B:B)` | 総テスト数 |
| H3 | `COUNTIF(J:J,"〇")` | Pass |
| H4 | `COUNTIF(J:J,"△")` | Partial |
| H5 | `COUNTIF(J:J,"×")` | Fail (**cần add thủ công** — template thiếu) |
| H6 | `COUNTIFS(B11:B976,"<>",J11:J976,"")` | 未 (chưa test) |

> **Pitfall:** Template không có × formula ở H5. Gen script phải thêm thủ công:
> ```javascript
> ws.getRow(5).getCell(8).value = { formula: 'COUNTIF(J:J,"×")' };
> wsSc.getRow(5).getCell(8).value = { formula: 'COUNTIF(J:J,"×")' };
> ```

### Verify sau khi chạy

```javascript
// Trong scripts/convert_excel/
node -e "
const ExcelJS = require('exceljs');
const wb = new ExcelJS.Workbook();
wb.xlsx.readFile('../../CMS/Testcase/<filename>.xlsx').then(() => {
  const ws = wb.getWorksheet('ワークフロー');
  console.log('Rows:', ws.rowCount);         // phải = 10 header + số TC
  let u3 = 0, wrap = 0;
  for (let r = 11; r <= ws.rowCount; r++)
    for (let c = 2; c <= 10; c++) {
      const cell = ws.getRow(r).getCell(c);
      if (String(cell.value||'').includes('\u3000')) u3++;
      if (cell.alignment && cell.alignment.wrapText) wrap++;
    }
  console.log('U3000 cells:', u3);           // phải = 0
  console.log('WrapText cells:', wrap);      // phải > 0 nếu có \n trong data
});
"
```

---

## Pitfalls & Lessons Learned

### 1. Path resolution từ `features/`
```
__dirname = scripts/convert_excel/features
../         = scripts/convert_excel        (1 cấp)
../../      = scripts                      (2 cấp)  ← SAI nếu dùng để tới workspace root
../../..    = <workspace root>             (3 cấp)  ← ĐÚNG
```
→ Phải dùng **3 cấp `..`** để reach `templates/` và `CMS/`.

### 2. `\n` trong cell Excel
- Dùng ký tự newline thực `"\n"` (không phải `"\\n"` hay `\u000A`).
- ExcelJS **không tự bật** wrapText — phải set thủ công:
  ```javascript
  if (typeof v === "string" && v.indexOf("\n") !== -1) {
    cell.alignment = Object.assign({}, cell.alignment || {}, { wrapText: true, vertical: "top" });
  }
  ```
- Dùng `indexOf("\n")` không dùng `includes('\\n')` — cái sau match chuỗi 2 ký tự `\n`, không match newline.

### 3. Không dùng `\u3000` (全角スペース)
- `\u3000` trong string JS có thể bị double-escape trong một số flow → hiển thị literal `\u3000` trong cell.
- Thay bằng space thường hoặc bỏ luôn.

### 4. unMergeCells trước khi splice rows
- Template có merged cells ở vùng data (row ≥ 11). Phải unMerge trước, rồi mới `spliceRows`.
- Không unMerge → ExcelJS throw error khi splice.

### 5. Merge 大項目 sau khi fill data
- Merge col C (index 3) cho các row liền kề có cùng giá trị `大項目`.
- Thực hiện **sau** khi đã fill hết `TC.forEach(...)`, không merge trước.

### 6. PowerShell và template literal
- Backtick `` ` `` trong PowerShell bị escape, không thể dùng `node -e "...\`...\`..."` với template literal.
- Thay bằng: viết file `.js` riêng → `node file.js`.
- Tránh dùng PowerShell heredoc (`@'...'@`) qua `run_in_terminal` — dễ bị stuck ở prompt `>>`.
