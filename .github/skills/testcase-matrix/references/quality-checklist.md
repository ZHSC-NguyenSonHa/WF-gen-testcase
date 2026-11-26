# Checklist Chất Lượng — Testcase Matrix

## Trước Khi Submit

### FN Decomposition
- [ ] Đã tách feature thành các FN riêng biệt (mỗi FN = 1 mục tiêu kiểm tra)
- [ ] Tên FN đúng format: `Xác nhận [hành vi] khi [điều kiện]`
- [ ] FN ID được đánh số tuần tự (FN1, FN2, FN3...)
- [ ] Tổng số FN được ghi vào Summary sheet (nếu có)

### Condition Block
- [ ] Mỗi dimension là 1 yếu tố độc lập (không overlap, không gộp)
- [ ] Thứ tự dimensions: pre-condition → user state → main input → external deps
- [ ] Mỗi TC column có đúng 1 dấu `〇` trên mỗi dimension bắt buộc
- [ ] Không có 2 dấu `〇` trên cùng 1 dimension cho cùng 1 TC
- [ ] Boundary values đã được thêm vào khi dimension có constraint số/độ dài

### Action Block
- [ ] Hành động chính được ghi rõ, ngắn gọn
- [ ] Nếu có multi-step: dùng `① ②` và link với `❶ ❷` trong expected result
- [ ] Tất cả TC đều có `〇` hoặc `①②` trong action block

### Expected Result Block
- [ ] Mỗi TC column có đúng 1 dấu `●` (hoặc linked `❶ ❷`)
- [ ] Mô tả bao gồm: màn hình/vị trí + UI text chính xác + button + hành vi tiếp theo
- [ ] Ghi rõ platform difference: `iOS: ... / AOS: ...` khi behavior khác nhau
- [ ] UI text / button label giữ nguyên tiếng Nhật từ design spec (không tự dịch)
- [ ] Không có dòng expected result nào để trống `●` cho mọi TC (vô nghĩa)

### TC Type Block
- [ ] Mỗi TC được phân loại đúng: `N` (Normal) hoặc `A` (Abnormal)
- [ ] TC có input sai / điều kiện thiếu → `A`
- [ ] TC theo happy path với input hợp lệ → `N`

### Test Result Block
- [ ] Có ít nhất 1 iOS device + 1 Android device
- [ ] Điền `First time` + ngày test sau lần test đầu
- [ ] Điền `Last time` + ngày chỉ khi có retest (sau fix bug)
- [ ] Nếu First = OK thì Last để trống (không cần retest)
- [ ] Nếu First = NG thì Last phải có kết quả sau khi fix

### Comment Block
- [ ] Bug ID ghi khi TC = NG (format: `#[số]`)
- [ ] Ghi platform nếu bug chỉ xảy ra 1 OS: `#390 (iOS) / #332 (AOS)`
- [ ] Ghi "Skip" + lý do nếu TC được skip

---

## Lỗi Phổ Biến Cần Tránh

| Lỗi | Hậu quả | Fix |
|---|---|---|
| 2 dấu `〇` trên cùng 1 dimension | TC ambiguous, không rõ tổ hợp điều kiện | Xóa `〇` thừa |
| Thiếu `●` trên 1 TC | Không biết expected result → không thể test | Thêm `●` đúng dòng |
| Expected result quá chung | Tester không biết verify gì cụ thể | Ghi rõ UI text + button |
| Thiếu platform difference | Bug iOS bị bỏ sót hoặc sai expectation AOS | Thêm `iOS: / AOS:` |
| UI text tự dịch sang tiếng Việt | Sai so với design thực tế | Copy nguyên bản tiếng Nhật |
| Gộp 2 conditions vào 1 value | Không track coverage từng condition | Tách thành 2 rows riêng |
| First = NG nhưng không ghi bug ID | Mất traceability | Luôn ghi bug ID vào Comment |
