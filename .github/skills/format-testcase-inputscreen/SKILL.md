---
name: format-testcase-inputscreen
description: Skill tạo và chuẩn hóa manual testcase cho template testcase_template_inputscreen.xlsx (màn hình input/form).
argument-hint: "Spec màn hình input, danh sách fields (tên, Requie, Edit, Copy, Data type, Maxlength), output folder, release/version"
---

# Format Testcase — Input Screen Template

## Mục tiêu

Sinh bộ testcase cho màn hình nhập liệu (申請書, form, input screen) theo file template  
`templates/testcase/testcase_template_inputscreen.xlsx`.  
Skill này hướng dẫn **quan điểm chia test**, **cách điền từng cột** và **phong cách viết** khớp với QA team.

---

## Cấu trúc cột template (sheet: 申請書)

| Cột | Tên cột | Vai trò | Ghi chú |
|-----|---------|---------|---------|
| B | No | Số thứ tự TC | Liên tục trong Section 1; Section 2 tiếp nối |
| C | 項目名 | Tên trường/field | Đúng tên hiển thị trên UI |
| D | Requie | Bắt buộc nhập | `○` = bắt buộc / `×` = không / `△` = có điều kiện |
| E | Edit | Có thể chỉnh sửa | `○` = edit được / `×` = read-only / `△` = có điều kiện |
| F | Copy | Có thể copy sang bản ghi mới | `○` / `×` / `△` |
| G | Data type | Kiểu dữ liệu của field | Xem bảng Data type bên dưới |
| H | Maxlength | Độ dài tối đa ký tự | Số = có giới hạn; `ー` = không áp dụng |
| I | Condition (前提条件) | Tiền điều kiện đặc biệt | Để trống nếu là case mặc định |
| J | User test | Người thực hiện test | Thường để trống |
| K | Input (操作) | Thao tác thực hiện | Ngắn gọn, thể hiện action cụ thể |
| L | Output (期待動作) | Kết quả kỳ vọng | Mô tả chính xác trạng thái sau action |
| M | 結果 | Kết quả test | Điền sau test: `〇` / `△` / `×` |
| N | 備考 | Ghi chú | Để trống hoặc ghi chú đặc biệt |

---

## Quan điểm chia test — 2 Section bắt buộc

### Section 1 — Hiển thị và nhập liệu từng trường (No 1 → N)

**Nguyên tắc:** Mỗi trường field = **1 row TC** (trừ trường có 2 mode đặc biệt thì 2 rows).  
Mỗi row test **1 đặc tính chính** của field đó theo Data type.

**Khi nào tách 2 rows cho 1 field:**
- Trường có auto-fill VÀ editable → row 1: test auto-fill display; row 2: test nhập giá trị mới
- Trường có 2 loại nhập khác nhau (ví dụ: radio button có nhiều mode ảnh hưởng khác nhau)

### Section 2 — Boundary / Max length test (No N+1 → cuối)

**Nguyên tắc:** Chỉ áp dụng cho trường **テキスト** có Maxlength là **số cụ thể** (≠ `ー`).  
Mỗi trường có Maxlength → 1 row test vượt giới hạn.

**Pattern chuẩn Section 2:**
- Condition: `「{N}」と桁数が指定されている`
- Input: `{N}桁以上テキスト入力し、「申請」ボタンを押下`
- Output: `画面上部に「入力内容に誤りがあります。」と表示され、登録不可`  
  `未入力の必須項目欄に「（エラー文言確認）」とエラーメッセージが表示される`

---

## Data type — Pattern viết Input / Output

### テキスト (Text)

| Trường hợp | Condition | Input | Output |
|------------|-----------|-------|--------|
| Auto-fill + Read-only (Edit=×) | | `入力画面を表示` | `ログインユーザーの{フィールド名}を自動取得し表示` |
| Auto-fill + số tự động | | `入力画面を表示` | `入力不可となっており、申請開始時に自動採番される` |
| Auto-fill + ngày tháng | | `入力画面を表示` | `入力不可となっており、申請開始時にyyyy/mm/dd形式で自動取得される` |
| Không nhập được (固定文言) | | `入力画面を表示` | `固定文言「{text}」と表示` |
| Không dùng / hiển thị `/` | Điều kiện gây ra | `入力画面を表示` | `使用しない承認欄の項目名が「/」と表示される` |
| Editable (Edit=○) | | `「{giá trị cụ thể}」と入力` | `「{giá trị cụ thể}」と表示される` |
| Editable — có auto-fill trước | | `「{giá trị mới}」と入力` | `入力が可能で、テキストが途切れずに枠内に表示される` |

### ラジオボタン (Radio button)

| Condition | Input | Output |
|-----------|-------|--------|
| Liệt kê tất cả options trong Condition | Chọn 1 giá trị cụ thể | `「{giá trị}」が選択される` |

Ví dụ:
```
Condition: 「極秘情報」、「秘密情報」、「営業秘情報」、「社外秘情報」の4択のラジオボタンが表示
Input:     4つの値から「社外秘情報」を選択
Output:    「社外秘情報」が選択される
```

Trường hợp chọn giá trị ảnh hưởng side effect:
```
Input:  「役員決裁」を押下
Output: 決裁者と秘書室の承認ラベルが「／」に表示される、承認欄は空欄になる
```

### プルダウン (Dropdown)

```
Input:  「{option name}」を押下
Output: 「{option name}」と表示される
```

### ユーザー (User picker — chọn user)

Khi trường cho chọn user bằng 2 cách:
```
Input:  ① Nhập thủ công tên user hoặc ID
        ② Chọn user từ nút 「選択」
Output: Cả 2 cách đều có thể chọn user trong trường approval
```

### マスタ (Master lookup)

```
Input:  「{giá trị}」を選択   ← hoặc: {tên nút}の「選択ボタン」を押下
Output: {popup mô tả} → giá trị hiển thị ở bên phải nút
```

### チェックボックス (Checkbox)

```
Input:  Nhấn checkbox
Output: Checkbox được chọn, {side effect: ẩn/hiện trường liên quan}
```

### ファイル (File upload)

Trường hợp read-only:
```
Input:  Hiển thị màn hình nhập
Output: Không thể edit
```

Trường hợp upload được:
```
Input:  Upload file PDFファイル
Output: Có thể upload file PDFがアップロードされる
        添付されたファイルが折りたたまれずに展開された状態で表示される
```

### PG (Tự động lấy từ app — Program)

Dùng khi giá trị được lấy tự động từ cấu hình app (không phải user nhập):
```
Condition: 決裁者で「１．CEO決裁」を選択  ← điều kiện trigger
Input:     Hiển thị màn hình input
Output:    Thu thập từ màn hình アプリケーション画面{フィールド名}

### 日付 (Date)

```
Input:  Hiển thị màn hình input
Output: Không thể input、申請開始時 thì tự động lấy theo format yyy/mm/dd
```

### 数値 (Number)

```
Input:  Nhập「{số cụ thể, đủ maxlength}」と入力
Output: Hiển thị số đã nhập「{số đó}」
```

### リッチテキスト (Rich text editor)

```
Condition: bấm vào tab   ← phải vào tab trước
Input:    Nhập  text
Output:    Hiển thị text đã nhập, không bị cắt
```

---

## Cách viết Condition (前提条件) — Cột I

Chỉ điền khi field cần **điều kiện đặc biệt** để TC này có nghĩa:

| Tình huống | Nội dung Condition |
|------------|-------------------|
| Radio/Dropdown có nhiều options | Liệt kê tất cả options: `「A」、「B」、「C」の4択のラジオボタンが表示` |
| PG field phụ thuộc lựa chọn | `決裁者で「１．CEO決裁」を選択` |
| Field chỉ xuất hiện khi click tab | `内容タブを押下` |
| Boundary test | `「{N}」と桁数が指定されている` |
| Feature/button chỉ hiện có điều kiện | Mô tả điều kiện xuất hiện |

> **Để trống** khi field hiển thị mặc định trên màn hình, không cần điều kiện trước.

---

## Ví dụ đầy đủ (trích từ template thực)

| No | 項目名 | Requie | Edit | Copy | Data type | Maxlength | Condition | User test | Input | Output |
|----|--------|--------|------|------|-----------|-----------|-----------|-----------|-------|--------|
| 1 | 稟議会社略称 | ○ | × | ○ | テキスト | 256 | 会社名で「㈱ゼンショー...」を選択 | | 入力画面を表示 | 会社略称「ZHD」と表示 |
| 2 | 申請書タイトル | × | × | × | テキスト | 256 | | | 入力画面を表示 | 固定文言「稟議書」と表示 |
| 3 | 情報区分 | ○ | ○ | ○ | ラジオボタン | ー | 「極秘情報」...の4択が表示 | | 4つの値から「社外秘情報」を選択 | 「社外秘情報」が選択される |
| 4 | 稟議No. | × | × | × | テキスト | 256 | | | 入力画面を表示 | 入力不可となっており、表示なし |
| 6 | 申請日 | × | × | × | 日付 | 6 | | | 入力画面を表示 | 入力不可となっており、申請開始時にyyyy/mm/dd形式で自動取得される |
| 7 | 連絡先 | ○ | ○ | × | テキスト | 15 | | | 入力画面を表示 | ログインユーザーの連絡先の値を自動取得し表示 |
| 8 | 連絡先 | ○ | ○ | × | テキスト | 15 | | | 「090-1234-5678」と入力 | 入力が可能で、テキストが途切れずに枠内に表示される |
| 10 | 上長 | × | ○ | ○ | ユーザー | ー | | | ①ユーザ名またはIDを手入力<br>②「選択」ボタンからユーザを選択 | どちらの方法でも承認欄にユーザを選択することが可能 |
| 22 | 会社名 | ○ | ○ | ○ | マスタ | ー | | | 「㈱ゼンショーホールディングス」を選択 | 選択ボタンの右側に「㈱ゼンショーホールディングス」と表示される |
| 26 | 添付ファイル | ○ | ○ | ○ | ファイル | 50 | | | PDFファイルをアップロード | PDFがアップロードされる<br>添付されたファイルが折りたたまれずに展開された状態で表示される |
| 29 | 関連JNoなし | × | ○ | ○ | チェックボックス | ー | | | チェックボックス押下 | チェックが入り、JNoの選択ボタンが非表示なる |
| ... | | | | | | | | | | |
| **54** | **連絡先** | **×** | **×** | **×** | **テキスト** | **15** | **「15」と桁数が指定されている** | | **15桁以上テキスト入力し、「申請」ボタンを押下** | **画面上部に「入力内容に誤りがあります。」と表示され、登録不可<br>未入力の必須項目欄に「（エラー文言確認）」とエラーメッセージが表示される** |

> **Lưu ý:** Row in đậm (No 54+) là Section 2 — Boundary test — có pattern cố định.

---

## Quy trình sinh testcase (4 bước)

### Bước 1 — Liệt kê fields từ spec/ảnh
Tạo bảng field list với đầy đủ: `項目名 | Requie | Edit | Copy | Data type | Maxlength`

### Bước 2 — Section 1: Điền TC từng trường
Với mỗi field:
1. Xác định Data type → chọn pattern phù hợp từ bảng trên
2. Nếu auto-fill AND editable → 2 rows (hiển thị + nhập)
3. Nếu có điều kiện đặc biệt → điền Condition
4. Input/Output dùng tiếng Nhật theo pattern chuẩn

### Bước 3 — Section 2: Boundary test
Với mỗi field テキスト có Maxlength là số:
1. Thêm 1 row mới (tiếp nối No)
2. Condition: `「{N}」と桁数が指定されている`
3. Input/Output: dùng pattern chuẩn Section 2

### Bước 4 — Review checklist

---

## Checklist trước khi submit

**Coverage Section 1:**
- [ ] Tất cả fields có ít nhất 1 row TC
- [ ] Trường auto-fill AND editable có 2 rows riêng
- [ ] Radio/Dropdown: Condition liệt kê đủ options
- [ ] PG field: Condition nêu rõ điều kiện trigger
- [ ] Trường có side effect (checkbox/radio): Output mô tả đủ side effect

**Coverage Section 2:**
- [ ] Tất cả trường テキスト có Maxlength là số đều có 1 boundary row
- [ ] Pattern output boundary nhất quán (không tự sáng tạo)

**Format:**
- [ ] Requie/Edit/Copy dùng ○/×/△ (không phải Y/N hay khác)
- [ ] Data type dùng đúng tiếng Nhật (テキスト, ラジオボタン, etc.)
- [ ] Maxlength: số hoặc `ー` (không để trống)
- [ ] User test cột J: để trống
- [ ] Không viết Input/Output bằng số 1. 2. 3. — dùng ①② cho multi-step

---

## Bảng Data type chuẩn

| Data type (JP) | Nghĩa tiếng Việt |
|----------------|-----------------|
| テキスト | Text thường |
| ラジオボタン | Radio button |
| プルダウン | Dropdown list |
| ユーザー | User picker (chọn user từ hệ thống) |
| マスタ | Master lookup (popup chọn từ danh mục) |
| チェックボックス | Checkbox |
| ファイル | File upload |
| PG | Public group - 1 nhóm các user |
| 日付 | Date |
| 数値 | Number |
| リッチテキスト | Rich text editor |

