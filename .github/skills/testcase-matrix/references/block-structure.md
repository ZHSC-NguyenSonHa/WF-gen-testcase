# Cấu Trúc Chi Tiết Một Block FN Matrix

## Anatomy của 1 FN Block

Mỗi function được trình bày thành 1 block gồm **8 section theo thứ tự cố định**:

```
[A] TITLE
[B] TC NUMBER HEADER
[C] CONDITION (条件)
[D] ACTION (動作)
[E] EXPECTED RESULT (期待結果)
[F] TC TYPE (TCタイプ)
[G] TEST RESULT (試験結果)
[H] COMMENT (コメント)
```

---

## [A] Title Row

```
◆FNx  [Mô tả ngắn — dạng "Xác nhận [hành vi] khi [điều kiện]"]
```

Nếu FN có sub-scenario, thêm dòng phụ mô tả phạm vi:
```
◆FN2  Xác nhận xử lí check format QR code
      Login hay không đều quét được
```

**Quy tắc đặt tên FN:**
- `Xác nhận xử lí [động từ] khi [danh từ]`
- `Xác nhận trạng thái [đối tượng]`
- `Xác nhận [hành vi] từ [nguồn]`

---

## [B] TC Number Header

Cột cuối bên phải là các số **1, 2, 3...** — mỗi số = 1 test case.

```
|  |  |  |  1  |  2  |  3  |
```

---

## [C] Condition — 条件

Liệt kê **từng dimension** (yếu tố điều kiện) theo hàng. Mỗi **value** của dimension là 1 hàng riêng.

```
条件/Condition
  [Dimension 1]  Value A     |  〇 |     |  〇 |
                 Value B     |     |  〇 |     |
  [Dimension 2]  Value X     |  〇 |  〇 |     |
                 Value Y     |     |     |  〇 |
```

**Quy tắc:**
- Mỗi cột TC phải có đúng **1 dấu `〇`** trên mỗi dimension bắt buộc
- Không được có 2 dấu `〇` trên cùng 1 dimension cho cùng 1 TC
- Nếu dimension không áp dụng cho TC đó → để trống (implicit N/A)

---

## [D] Action — 動作

```
動作/Action
  [Hành động chính]           |  〇 |  〇 |  〇 |
  [Hành động bổ sung — step 2]|  ② |     |     |
```

**Quy tắc:**
- Thường chỉ có 1 action chính, đánh `〇` cho tất cả TC
- Nếu TC có bước phụ (tap thêm, pull to refresh...), dùng `②` và link với `❷` trong expected result
- Viết action ngắn, dạng mệnh lệnh: `Quét QR code`, `Tap button ^`, `Pull to refresh`

---

## [E] Expected Result — 期待結果

```
期待結果/Expected result
  [Kết quả scenario A]        |  ● |     |     |
  [Kết quả scenario B]        |     |  ● |     |
  [Kết quả bước 2]            |  ❷ |     |     |
```

**Quy tắc:**
- Mỗi cột TC có đúng **1 dấu `●`** (hoặc `❶ ❷` nếu multi-step)
- Mô tả đầy đủ: UI element + text chính xác + button + hành vi sau khi tap
- Ghi rõ platform difference khi cần: `iOS: ... / AOS: ...`
- UI text/button label giữ nguyên tiếng Nhật nguyên bản từ design

**Ví dụ viết expected result tốt:**
```
Hiển thị popup báo lỗi tại màn hình scan QR code:
  Nội dung: {Tên app}で発行した受付札を読取ってください。
  Button: OK
```

```
iOS: Di chuyển đến màn hình setting quyền truy cập camera
AOS: Hiển thị popup yêu cầu quyền truy cập
```

---

## [F] TC Type — TCタイプ

```
TCタイプ
  A:異常・Abnormal; N: 正常・Normal  |  N  |  A  |  N  |
```

| Value | Ý nghĩa |
|---|---|
| `N` | Normal — happy path, đúng input, đúng flow |
| `A` | Abnormal — sai input, thiếu điều kiện, lỗi mạng |

---

## [G] Test Result — 試験結果

```
試験結果/Tested result
  QA test: [Tên tester]

  Device: iPhone XS
    First time  | [ngày] |  OK  |  OK  |
    Last time   | [ngày] |      |      |

  Device: Pixel 7a
    First time  | [ngày] |  OK  |  NG  |
    Last time   | [ngày] |      |  OK  |
```

**Quy tắc:**
- **First time:** Lần test đầu (tìm bug). Điền ngay sau khi test.
- **Last time:** Retest sau khi fix. Nếu First = OK thì Last để trống.
- Nếu First = NG, Last = OK → bug đã fix và verify xong.
- Nếu First = NG, Last vẫn NG → bug chưa fix (ghi bug ID vào Comment).
- Device list tối thiểu: 1 iOS + 1 Android representative.

---

## [H] Comment — コメント

```
コメント/Comment
  [Bug ID / Ghi chú]    |     |  #390  |     |
```

- Ghi số bug ID khi TC = NG
- Có thể ghi thêm ghi chú đặc biệt (skip reason, blocker...)
- Nếu nhiều bug: `#390 (iOS) / #332 (AOS)`

---

## Mối Quan Hệ Giữa Sections

```
Condition [〇] ──► xác định kịch bản cụ thể
Action    [〇] ──► thực hiện trên kịch bản đó
Expected  [●] ──► kết quả phải đạt được
TC Type   [N/A] ──► phân loại tự nhiên từ condition
```

Nếu Action có nhiều bước:
```
Action ①  ──► Expected ❶
Action ②  ──► Expected ❷
```
