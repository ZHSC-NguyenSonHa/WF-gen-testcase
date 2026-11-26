# Nguyên Tắc Thiết Kế Dimension

## Dimension là gì?

Dimension = **1 yếu tố độc lập** có thể ảnh hưởng đến kết quả của feature. Mỗi dimension có tập các **values** (giá trị có thể có).

Ví dụ:
```
Dimension: "Trạng thái login"
Values   : ["Chưa login", "Đã login"]

Dimension: "Trạng thái QR code"
Values   : ["null", "sai format", "đúng format — brand đúng", "đúng format — brand sai"]
```

---

## Thứ Tự Ưu Tiên Liệt Kê Dimension

Luôn sắp xếp dimension **từ ngoài vào trong**, **từ tiên quyết đến chi tiết**:

```
1. Pre-condition / Feature flag
   (Điều kiện tiên quyết để feature hoạt động)
   Ví dụ: enable_waiting_number_flag=0/1

2. User state
   (Trạng thái người dùng)
   Ví dụ: Chưa login / Đã login

3. System permission / device state
   (Quyền device, trạng thái app)
   Ví dụ: Chưa cấp quyền camera / Đã cấp quyền

4. Main input object
   (Đối tượng chính cần test)
   Ví dụ: Trạng thái vé đợi, Loại QR code, Format data

5. External dependency
   (Phụ thuộc ngoài hệ thống)
   Ví dụ: Internet, Server

6. Current state / context
   (Trạng thái hiện tại của màn hình/app)
   Ví dụ: Đang có webview / Không có webview
```

---

## Kỹ Thuật Phân Tích Value

### Equivalence Partitioning (EP)

Chia value thành nhóm có **cùng hành vi kỳ vọng**. Mỗi nhóm chỉ cần test 1 representative.

```
QR code format:
  Group 1: null                    → popup lỗi "scan vé tích điểm"
  Group 2: ≠ format 'qr=...'       → popup lỗi "không đúng format"
  Group 3: format 'qr=...' hợp lệ  → mở webview thành công
```

### Boundary Value Analysis (BVA)

Thêm values tại **ranh giới** giữa các nhóm EP:

```
Độ dài chuỗi sau 'qr=':
  < 21 ký tự  ← boundary dưới
  = 21 ký tự  ← giá trị hợp lệ tối thiểu
  > 21 ký tự  ← vùng hợp lệ
  40 ký tự    ← boundary trên hợp lệ
  41 ký tự    ← vượt boundary
```

### State Transition

Liệt kê **tất cả trạng thái** và chuyển đổi:

```
Trạng thái vé đợi:
  waiting → calling → absence → guided
                    ↘ log_moved
                    ↘ canceled
                    ↘ disabled
```

---

## Số Lượng Values Tối Ưu

| Loại dimension | Số values | Ví dụ |
|---|---|---|
| Binary flag | 2 | enabled/disabled, có/không |
| User state | 2–3 | Chưa login / Đã login / Đã logout |
| Trạng thái hệ thống | 3–7 | waiting/calling/absence/guided/... |
| Input format | 3–5 | null / sai / hợp lệ (+ boundary) |
| External dep | 2 | Kết nối / Không kết nối |

> **Rule of thumb:** Không quá 8 values trong 1 dimension. Nếu nhiều hơn, tách thành 2 dimensions.

---

## Cách Chọn Tổ Hợp (Selecting TC Combinations)

### Nguyên Tắc

**Không test all-combinations** — số lượng sẽ bùng nổ tổ hợp.

Dùng **Pairwise**: Chọn tổ hợp sao cho mỗi **cặp (dimension A, dimension B)** đều được cover ít nhất 1 lần.

### Ví Dụ Thực Tế (FN2)

```
Dimension 1: Login state     [Chưa login, Đã login]
Dimension 2: QR code type    [null, sai, hợp lệ]
Dimension 3: Flag            [=0, =1]
Dimension 4: Internet        [Kết nối, Không kết nối]
```

All-combinations = 2×3×2×2 = **24 TCs** (quá nhiều)

Pairwise selection → **chỉ cần 2 TCs**:
```
TC-1: Chưa login + hợp lệ + flag=1 + Kết nối  → Normal (mở webview)
TC-2: Chưa login + sai   + flag=1 + Kết nối  → Abnormal (popup lỗi)
```

### Pattern Thường Dùng

```
TC-1 (Normal)   : Pre-conditions OK + input hợp lệ + dependencies OK
TC-2 (Abnormal) : Pre-conditions OK + input sai    + dependencies OK
TC-3 (Edge)     : Pre-conditions bất thường + input hợp lệ + ...
```

---

## Anti-Patterns

### ❌ Dimension quá chung

```
Xấu:  "Trạng thái"  →  ["Hợp lệ", "Không hợp lệ"]
Tốt:  "Trạng thái QR code"  →  ["null", "sai format", "brand sai", "hợp lệ 40 ký tự"]
```

### ❌ Gộp nhiều dimension vào 1

```
Xấu:  "Trạng thái mạng và server"  →  ["OK", "Mạng lỗi", "Server lỗi"]
Tốt:  Dimension 1: Internet  →  ["Kết nối", "Không kết nối"]
      Dimension 2: Server    →  ["Kết nối", "Không kết nối"]
```

### ❌ Value trùng lặp (overlap)

```
Xấu:  ["Đã login", "Đã đăng nhập", "Login thành công"]  ← cùng 1 state
Tốt:  ["Chưa login", "Đã login"]
```

### ❌ Thiếu boundary value khi có constraint số

```
Xấu:  Chỉ test "40 ký tự" (hợp lệ)
Tốt:  Test cả "40 ký tự" (boundary) + "41 ký tự" (vượt boundary)
```
