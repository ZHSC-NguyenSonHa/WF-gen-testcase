# QA Test Case Templates

Canonical templates dùng chung cho mọi script sinh test case Excel (giữ nguyên màu sắc, border, font, công thức tính toán).

## File hiện có

| File | Loại | Mô tả |
|---|---|---|
| `app-testcase-template.xlsx` | Mobile App | Layout chuẩn cho test case mobile App (iOS/Android) — clone từ `【APP】_Push.xlsx` v1.0.0 |

> Sau này có thể bổ sung: `web-testcase-template.xlsx`, `api-testcase-template.xlsx`.

## Cấu trúc `app-testcase-template.xlsx`

### Sheets
| Sheet | Vai trò |
|---|---|
| `Summary` | Common info + Total summary + Detail summary (formula `'Sheet'!G2..G5`) |
| `Home_GUI` | Layout chuẩn cho 1 sheet test case (dùng làm template cho cả `<feature>_GUI` và `<feature>_LOGIC`) |
| `Push History_GUI`, `Push detail_GUI`, `Push_FN_Matrix` | Sheet phụ của feature Push gốc — script sinh testcase sẽ XOÁ trước khi fill data mới |

### Layout 1 sheet test case (anchor rows — DO NOT CHANGE)

| Row(s) | Vùng | Style nguồn |
|---|---|---|
| 1–6 col A:D | Label trái (gray) | `A2` |
| 1–6 col E | Value trái (white) | `E1` |
| 1–6 col F | Label phải (gray, "Total/OK/NG/Pending/Skip") | `A2` |
| 1 col G:H | Sub-header "First/Last" (gray bold center) | `A8` |
| 2–6 col G,H | Value summary (white center, formula COUNTIF) | `A11` |
| 7 | Banner "Test Result(テスト結果)" mỗi device (gray bold center) | `G7` |
| 7–9 col N-1, N | "Memo" / "Status" (gray bold center, merged vertically) | `A8` |
| 8 | Fixed header `No / Test Object / Sub Test Object / Test Type / Input / Output` + Device name (gray bold center) | `A8` |
| 9 | Sub header `First / Date / Last / Date / Tester` (gray center) | `G9` |
| **10** | **Section title (anchor cho fill)** — bold, merge A:N, gray | `A10` |
| **11+** | **Data rows (anchor cho fill)** — text wrap, valign top | `A11` (center) + `B11` (left) + `G11` (pink result) + `Q11` (memo) |

### Công thức cần preserve (Summary sheet)
- `Total test case / OK / NG / Pending` = `SUM('<sheet>'!G2:G5)` ← refer Detail summary col G/H/I/J
- Detail summary mỗi sheet: `'<sheet>'!G2..G5` ← refer Total summary từng sheet
- Total summary của mỗi `<feature>_GUI` / `<feature>_LOGIC`:
  - `G2` = `COUNTIF(D11:D<last>,"<testType>")` (Total)
  - `G3..G6` = `COUNTIF(<First device cols>, "OK"|"NG"|"△"|"-")` (OK/NG/Pending/Skip First)
  - `H3..H6` = same nhưng tính trên `<Last device cols>`

### Quy ước Test Result columns
| Col group | Device | Cột |
|---|---|---|
| G–K | iOS | First / Date / Last / Date / Tester |
| L–P | Android | First / Date / Last / Date / Tester |
| Q | — | Memo |
| R | — | Status |

## Quy tắc sử dụng template

1. **KHÔNG sửa trực tiếp** file template trong folder này — đây là canonical, mọi tool đều phụ thuộc.
2. Khi cần đổi template (vd thêm device, đổi màu) → tạo PR riêng, update README.
3. Script `scripts/convert_excel/testcase_builder.js` đọc file này và copy+fill dữ liệu mới.
4. File gốc `Test Result/1.0.0(Thư viện)/App/Base noti/【APP】_Push.xlsx` được giữ làm reference manual test result, KHÔNG động vào.

## Reference

- Skill: `.github/skills/format_testcase/SKILL.md`
- Skill: `.github/skills/excel-converter/SKILL.md`
- Script: `scripts/convert_excel/testcase_builder.js`
