# Phân Tích Testcase Matrix — File Mẫu: 【APP】Scan QR vé đợi giấy tại Home

> **Nguồn phân tích:** `Test Result/7.4.0/App/【APP】Scan QR vé đợi giấy tại Home_done.xlsx`  
> **Ngày phân tích:** 2026-07-03

---

## 1. Cấu Trúc Tổng Thể File

File gồm **3 sheet** với vai trò rõ ràng:

| Sheet | Vai trò |
|---|---|
| `Summary` | Thông tin chung dự án, thống kê kết quả (tổng TC, OK/NG/N/A, % Tested) |
| `GUI` | Testcase dạng danh sách truyền thống — kiểm tra giao diện (GUI check) |
| `Waiting number_FN_Matrix` | **Testcase dạng Matrix** — kiểm tra logic chức năng (FN1–FN7) |

---

## 2. Sheet Summary — Cấu Trúc Header

```
■ Common information
  Function name / Screen name : Scan QR code tại màn hình Home
  Create PIC                  : QuynhNT
  Create duration             : 07/11/2024
  Test device                 : Sony XZ2, IP12
  Team                        : Zapp

■ Total summary
  (Summary | Created | First time | Last time)
  Total TC: 297
  Tested  : 340   (>TC vì test nhiều device)
  OK      : 243
  NG      : 97

■ Detail summary
  Sheet → Matrix ID → Function name → Tester → Total/OK/NG/N/A
```

**Skill cần:** Biết thiết lập công thức Excel tự động tổng hợp kết quả từ nhiều sheet; hiểu ý nghĩa "Tested > Total TC" khi chạy nhiều device.

---

## 3. Sheet GUI — Cấu Trúc Testcase Danh Sách

### 3.1 Layout

```
Row 0 : Function name | Creator | Total | OK/NG/Pending/Skip | Comment
Row 6 : (header cột)
Row 7 : No | Test Object | Sub Test Object | Test Type | Input(Condition) | Output(Expect result)
        | [Device 1: First/Date/Last/Date/Tester]
        | [Device 2: First/Date/Last/Date/Tester]
        | [Device 3: First/Date/Last/Date/Tester]
```

### 3.2 Đặc Điểm

- **Test Type** phân loại rõ: `GUI` (kiểm tra visual) và `LOGIC` (kiểm tra hành vi).
- **Input/Condition** viết dạng numbered step: `1. Tap button... 2. Kiểm tra...`
- **Output/Expected** viết chi tiết cả UI text (tiếng Nhật) và hành vi.
- Mỗi device có cột: **First time result** | **Date** | **Last time result** | **Date** — để theo dõi retest.
- Kết quả: `OK` / `NG` / `-` (N/A hoặc không test) / `△` (pending/confirming).
- Mục con gom nhóm bằng **nhóm dòng theo "Test Object"** (merged cells), ví dụ: `Màn hình scan QR code`, `Webview`.

---

## 4. Sheet Matrix — Cấu Trúc Testcase Matrix (Trọng Tâm)

### 4.1 Header Toàn Sheet (Rows 0–8)

```
Row 0: 作成者(Author) | 実施者(Tester) | Test Matrix ID | Test description
Row 2: QuynhNT       | Skip           | FN1            | Xác nhận trạng thái quyền truy cập...
Row 3: QuynhNT       | DuyNQ          | FN2            | Xác nhận xử lí check format QR code
Row 4: QuynhNT       | DuyNQ          | FN3            | Xác nhận xử lí khi quét các trạng thái vé đợi
...
Row 8: QuynhNT       | DuyNQ          | FN7            | Xác mở webview từ deeplink
```

Mỗi function (FN) là **một khối độc lập** bên dưới.

---

### 4.2 Cấu Trúc Một Khối Function (Block Structure)

Mỗi khối FN có các section xếp theo thứ tự cố định:

```
[A] Title Row
    ◆FNx  Tên chức năng cần kiểm tra
    (+ Sub-title nếu có, ví dụ: "Login hay không đều quét được")

[B] Test Case Number Header
    Cột phải: |  1  |  2  |  3  | ... (số thứ tự testcase)

[C] 条件/Condition — Bảng điều kiện
    Dimension 1: [Tên dimension]  |  Value A  |  〇 |    |  〇 |
                                  |  Value B  |    |  〇 |    |
    Dimension 2: [Tên dimension]  |  Value X  |  〇 |  〇 |    |
                                  |  Value Y  |    |    |  〇 |

[D] 動作/Action — Hành động thực hiện
    | Bước hành động 1 | 〇 | 〇 |    |
    | Bước hành động 2 |    | 〇 |    |

[E] 期待結果/Expected result — Kết quả kỳ vọng
    | Kết quả A | ● |    |    |
    | Kết quả B |   | ● |    |

[F] TCタイプ — Loại testcase
    | A:異常・Abnormal; N: 正常・Normal |  N  |  A  |  N  |

[G] 試験結果/Tested result — Kết quả thực thi
    Device: iPhone XS  | First time | [date] |  OK  |  OK  |
                       | Last time  | [date] |      |      |
    Device: Pixel 7a   | First time | [date] |  OK  |  OK  |
    ...

[H] コメント/Comment
    | Bug ID / Ghi chú |  390  |     |
```

---

### 4.3 Hệ Thống Ký Hiệu (Symbol System)

| Ký hiệu | Vị trí dùng | Ý nghĩa |
|---|---|---|
| `〇` (hollow circle) | Condition, Action | Giá trị này ĐƯỢC CHỌN cho testcase cột đó |
| `●` (solid circle) | Expected result | Đây là kết quả kỳ vọng cho testcase cột đó |
| `❶ ❷` (bold số) | Expected result | Kết quả tương ứng với hành động `①②` |
| `① ②` (số khoanh) | Action | Bước action tương ứng với expected result `❶❷` |
| `-` | Expected result | N/A hoặc không áp dụng |
| `OK` / `NG` | Tested result | Kết quả thực thi |

**Nguyên tắc hoạt động:**  
- Mỗi **cột số** (1, 2, 3...) = 1 testcase  
- Đọc theo cột: lấy `〇` trên mỗi dimension → đó là tổ hợp điều kiện  
- Lấy `●` trong Expected result → đó là kết quả cần verify  
- Khi action phân nhánh (①②), expected result tương ứng cũng ký hiệu (❶❷)

---

### 4.4 Cách Chia Quan Điểm (Dimension Design)

Quan điểm được phân tầng theo **nguyên nhân - ảnh hưởng**, ví dụ FN2:

```
Trạng thái login
  ├── Chưa login/register          ← boundary
  └── Đã login/register

Trạng thái QR code
  ├── QR code null                  ← boundary/abnormal
  ├── QR code không đúng
  │     ├── ≠qr=
  │     ├── độ dài sau 'qr=' < 21  ← boundary value
  │     ├── độ dài sau 'qr=' > 21  ← boundary value
  │     └── không có chuỗi 'qr='
  ├── QR code hợp lệ
  │     ├── 40 ký tự               ← boundary
  │     └── 41 ký tự
  └── Trạng thái brand trong QR
        ├── brand 51
        ├── brand ≠51
        └── Không thuộc brand nào

enable_waiting_number_flag
  ├── = 0
  └── = 1

Internet                           ← external dependency
  ├── Kết nối
  └── Không kết nối

Server
  ├── Kết nối
  └── Không kết nối
```

**Pattern thiết kế điều kiện:**
1. Bắt đầu từ điều kiện tiên quyết (login state, flag setting)
2. Đến object chính cần test (QR code format)
3. Đến external dependency (network, server)
4. Boundary Value Analysis được nhúng vào từng dimension

---

### 4.5 Cách Chia FN (Function Decomposition)

| FN ID | Quan điểm kiểm tra | #TC |
|---|---|---|
| FN1 | Quyền truy cập camera → có/không có quyền | 2 |
| FN2 | Validate format QR code (null, sai format, đúng format, brand) | 2 |
| FN3 | Xử lý khi quét vé đợi các trạng thái (waiting/calling/absence/...) | 2 |
| FN4 | Chuyển trạng thái webview (waiting→calling, waiting→absence,...) | 2 |
| FN5 | Quét liên tiếp 2 lần QR code (scan on top of existing scan) | 2 |
| FN6 | Tác động của register/login/logout lên webview | 2 |
| FN7 | Mở webview từ deeplink (camera ngoài app → mở app) | 2 |

> Mỗi FN thường có **2 TC** (test case 1 và 2), tương ứng **Normal + Abnormal** hoặc **2 scenario chính**.

---

### 4.6 Cấu Trúc "Tested Result" — Multi-Device Tracking

```
試験結果 / Tested result
├── QA test: [Tên tester]
├── Device: iPhone 11
│     ├── First time | Date test | [result theo TC]
│     └── Last time  | Date test | [result sau retest]
├── Device: iPhone XS
│     ├── First time | Date test | OK | OK
│     └── Last time  | Date test |    |
├── Device: Pixel 7a
│     ├── First time | Date test | OK | OK
│     └── Last time  | Date test |    |
└── Device: Xperia XZ3 SOV39
      ├── First time | Date test |    |
      └── Last time  | Date test |    |
```

- **First time:** Test lần đầu (tìm bug)
- **Last time:** Retest sau fix (confirm resolve)
- Nếu First = NG và Last = OK → bug đã được fix và confirm

---

## 5. Ngôn Ngữ Sử Dụng

### 5.1 Bilingual Vietnamese - Japanese

| Yếu tố | Ngôn ngữ |
|---|---|
| Label tiêu đề section | Japanese (条件, 動作, 期待結果, 試験結果, TCタイプ) |
| Tên chức năng | Vietnamese (FN description) |
| Điều kiện (Condition values) | Vietnamese |
| Expected result | Vietnamese (mô tả) + Japanese (UI text nguyên bản) |
| UI text/button labels | Japanese nguyên bản (e.g., `QR読み取り`, `発券用紙...`) |
| Tên device | English (iPhone XS, Pixel 7a) |
| Kết quả test | OK / NG / Skip |

### 5.2 Phong Cách Viết Expected Result

```
Tốt: "Hiển thị popup báo lỗi tại màn hình scan QR code:
       Nội dung: {Tên app}で発行した受付札を読取ってください。
       Button: OK"

Tốt: "Di chuyển vào màn hình scan QR, có thể đọc QR code"

Tốt: "IOS: Di chuyển đến màn hình setting quyền truy cập camera
       AOS: Hiển thị popup yêu cầu quyền truy cập"
```

- Luôn ghi rõ **platform difference** (iOS vs AOS) nếu có
- Luôn ghi rõ **UI text chính xác** (tiếng Nhật nguyên bản từ design)
- Luôn ghi rõ **button** và **hành vi tiếp theo** khi tap

---

## 6. Tổng Hợp Skill Cần Có

### 6.1 Tư Duy Phân Tích (Test Design Thinking)

| Skill | Mô tả |
|---|---|
| **Equivalence Partitioning** | Phân nhóm input thành các nhóm tương đương: QR null / sai format / đúng format |
| **Boundary Value Analysis (BVA)** | Nhận diện và test các giá trị biên: `<21`, `=21`, `>21` ký tự; `40` vs `41` ký tự |
| **Cause-Effect Graphing** | Phân tích mối quan hệ điều kiện → kết quả để xác định TC tối thiểu |
| **State Transition Testing** | Test các chuyển đổi trạng thái: waiting→calling→absence→guided |
| **Pairwise / Combinatorial Testing** | Không test all-combination, chỉ test tổ hợp quan trọng nhất (TC1, TC2) |
| **Dimension Decomposition** | Biết tách một chức năng thành các "chiều" độc lập: login state / QR type / network |

### 6.2 Kỹ Năng Thiết Kế Matrix

| Skill | Mô tả |
|---|---|
| **Xác định FN scope** | Biết phân tách feature thành các function nhỏ (FN1–FN7) theo mục tiêu kiểm tra |
| **Xác định dimensions** | Mỗi dimension = 1 yếu tố ảnh hưởng đến outcome |
| **Chọn representative values** | Mỗi dimension chọn đủ representative values (không thừa, không thiếu) |
| **Gộp TC từ dimensions** | 1 TC = 1 tổ hợp `〇` trên mỗi dimension → phải consistent (không contradicted) |
| **Viết expected result theo TC** | `●` đặt đúng dòng result tương ứng với tổ hợp điều kiện đó |
| **Linked action-result (①②/❶❷)** | Khi 1 TC có nhiều bước, link action ↔ expected result bằng ký hiệu |

### 6.3 Kỹ Năng Viết Nội Dung

| Skill | Mô tả |
|---|---|
| **Viết condition rõ ràng** | Mỗi dòng condition = 1 value duy nhất, không gộp nhiều value vào 1 dòng |
| **Viết expected result đầy đủ** | Ghi UI text chính xác (nguyên bản), button, hành vi khi tap |
| **Platform-aware writing** | Ghi rõ "Chỉ iOS:" / "Chỉ AOS:" khi behavior khác biệt |
| **Viết FN description ngắn gọn** | Dạng "Xác nhận [hành vi] khi [điều kiện]" |
| **Comment bug ID** | Ghi bug ID vào cột Comment để traceability |

### 6.4 Kỹ Năng Excel / Công Cụ

| Skill | Mô tả |
|---|---|
| **Merge cells đúng cách** | Merge header cells cho dimension spans, không merge cells có data |
| **Freeze panes** | Đóng băng hàng header và cột dimension để scroll dễ đọc |
| **Màu sắc / Conditional formatting** | Phân biệt section bằng màu nền (condition/action/expected/result) |
| **Ký hiệu Unicode** | Dùng `〇 ● ❶ ❷ ① ②` thay vì text dài |
| **Multiple device columns** | Thiết kế đủ cột cho First/Last time per device |
| **Summary formula** | `COUNTIF` để đếm OK/NG/N/A tự động cho Summary sheet |

### 6.5 Kỹ Năng Quy Trình

| Skill | Mô tả |
|---|---|
| **Phân tách GUI vs FN** | GUI check → sheet GUI (list style); Logic check → sheet Matrix |
| **Đặt Matrix ID** | FN1, FN2... rõ ràng, match với Summary |
| **First/Last time tracking** | Luôn điền cả First time và Last time để theo dõi retest |
| **Skip/N/A strategy** | Biết khi nào đánh Skip (không test) vs `-` (N/A) vs không điền |
| **Review gate** | Cột Reviewer trong Summary — testcase phải qua review trước khi execute |

---

## 7. Template Viết Một Khối FN Matrix

```
◆FNx  [Tên chức năng — dạng: "Xác nhận xử lí [hành vi] khi [điều kiện]"]
[Sub-title nếu cần mô tả phạm vi hẹp hơn]

                                              |  1  |  2  |  3  |
条件/Condition
  [Dimension 1: Tên yếu tố]  Value A         |  〇 |     |  〇 |
                             Value B         |     |  〇 |     |
  [Dimension 2: Tên yếu tố]  Value X         |  〇 |  〇 |     |
                             Value Y         |     |     |  〇 |

動作/Action
  [Bước 1 / hành động chính]                 |  〇 |  〇 |  〇 |
  [Bước 2 — nếu có nhánh]                    |  ② |     |     |

期待結果/Expected result
  [Kết quả 1]                                |  ● |     |     |
  [Kết quả 2]                                |     |  ● |     |
  [Kết quả 3 — nhánh từ bước 2]             |  ❷ |     |     |

TCタイプ
  A:異常; N: 正常                             |  N  |  A  |  N  |

試験結果/Tested result
  QA test: [Tester name]
  [Device 1]  First time  Date  |  OK  |  NG  |  OK  |
              Last time   Date  |      |  OK  |      |
  [Device 2]  First time  Date  |  OK  |  NG  |  OK  |
              Last time   Date  |      |  OK  |      |

コメント/Comment
  [Bug ID / ghi chú]             |      |  #123|      |
```

---

## 8. Checklist Tự Kiểm Tra Trước Khi Submit

- [ ] Mỗi FN có title rõ ràng dạng "Xác nhận [hành vi]"
- [ ] Mỗi dimension chỉ có 1 value được đánh `〇` trên 1 cột TC
- [ ] Không có cột TC nào thiếu `〇` trên 1 dimension bắt buộc
- [ ] Mỗi cột TC có đúng 1 dòng `●` trong Expected result (trừ TC multi-step thì có `❶❷`)
- [ ] Đã ghi rõ platform difference (iOS vs AOS) nếu behavior khác
- [ ] UI text trong Expected result là text chính xác từ design (tiếng Nhật nguyên bản)
- [ ] Cột TCタイプ đã phân loại N/A đúng
- [ ] First time đã điền sau lần test đầu; Last time điền sau retest
- [ ] Bug ID ghi vào cột Comment khi TC = NG
- [ ] Summary sheet có formula tự tính tổng TC/OK/NG
