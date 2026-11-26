# Template Block FN Matrix

Sao chép và điền vào cho từng FN. Thay thế tất cả `[...]` bằng nội dung thực tế.

---

## Template Markdown (dùng khi output ra .md)

```markdown
## ◆[FN_ID] — [Mô tả ngắn: "Xác nhận [hành vi] khi [điều kiện]"]

> [Sub-title nếu cần làm rõ phạm vi — bỏ qua nếu không cần]

|  | 条件/動作/期待結果 | Value | TC-1 | TC-2 | TC-3 |
|---|---|---|---|---|---|
| **条件** | [Dimension 1 — tên yếu tố] | [Value A] | 〇 | | 〇 |
| | | [Value B] | | 〇 | |
| | [Dimension 2 — tên yếu tố] | [Value X] | 〇 | 〇 | |
| | | [Value Y] | | | 〇 |
| | [Dimension 3 — external dep] | [Kết nối] | 〇 | 〇 | 〇 |
| | | [Không kết nối] | | | |
| **動作** | [Hành động chính] | | 〇 | 〇 | 〇 |
| | [Hành động phụ — nếu có] | | ② | | |
| **期待結果** | [Kết quả scenario A — mô tả đầy đủ] | | ● | | |
| | [Kết quả scenario B — mô tả đầy đủ] | | | ● | |
| | [Kết quả scenario C] | | | | ● |
| | [Kết quả bước 2 — nếu có] | | ❷ | | |
| **TCタイプ** | A: Abnormal / N: Normal | | N | A | N |
| **試験結果** | [Device iOS 1] — First time | | | | |
| | [Device iOS 1] — Last time | | | | |
| | [Device AOS 1] — First time | | | | |
| | [Device AOS 1] — Last time | | | | |
| **Comment** | Bug ID / Ghi chú | | | | |
```

---

## Ví Dụ Đã Điền — FN1: Quyền Camera

```markdown
## ◆FN1 — Xác nhận trạng thái quyền truy cập vào màn hình scan QR code

| | 条件/動作/期待結果 | Value | TC-1 | TC-2 |
|---|---|---|---|---|
| **条件** | Trạng thái login | Chưa login | 〇 | 〇 |
| | Trạng thái quyền camera | Chưa cấp quyền | 〇 | |
| | | Đã cấp quyền | | 〇 |
| **動作** | Tap vào button QR読み取り trên màn hình home | | 〇 | 〇 |
| **期待結果** | Di chuyển đến màn hình scan QR.<br>Hiển thị dialog yêu cầu quyền camera:<br>- iOS: Popup của OS có text 「発券用紙、端末のQRコード読取りのため、カメラへのアクセスを許可してください｡」<br>- AOS: Popup của OS | | ● | |
| | Di chuyển vào màn hình scan QR, có thể đọc QR code | | | ● |
| **TCタイプ** | | | N | N |
| **試験結果** | iPhone XS — First time | | | |
| | iPhone XS — Last time | | | |
| | Pixel 7a — First time | | | |
| | Pixel 7a — Last time | | | |
| **Comment** | | | | |
```

---

## Ví Dụ Đã Điền — FN2: Check Format QR Code

```markdown
## ◆FN2 — Xác nhận xử lí check format QR code

> Login hay không đều quét được

| | 条件/動作/期待結果 | Value | TC-1 | TC-2 |
|---|---|---|---|---|
| **条件** | Trạng thái login | Chưa login/register | 〇 | 〇 |
| | Trạng thái QR code | QR null | 〇 | |
| | | QR không đúng format (≠ chuỗi 'qr=') | | 〇 |
| | enable_waiting_number_flag | = 1 | 〇 | 〇 |
| | Internet | Kết nối | 〇 | 〇 |
| | Server | Kết nối | 〇 | 〇 |
| **動作** | Quét QR code | | 〇 | 〇 |
| **期待結果** | Hiển thị popup báo lỗi tại màn hình scan QR code:<br>Nội dung: {Tên app}で発行した受付札を読取ってください。<br>Button: OK | | ● | |
| | Hiển thị popup báo lỗi tại màn hình scan QR code:<br>Nội dung: {Tên app}で発行したQRコードを読取ってください。<br>Button: OK | | | ● |
| **TCタイプ** | | | A | A |
| **試験結果** | iPhone XS — First time | | | |
| | iPhone XS — Last time | | | |
| | Pixel 7a — First time | | | |
| | Pixel 7a — Last time | | | |
| **Comment** | | | | |
```

---

## Ghi Chú

- Số cột TC (`TC-1`, `TC-2`...) điều chỉnh theo số TC thực tế của FN
- Xóa các hàng dimension/action/result không cần thiết
- Cột `Value` có thể để trống nếu label ở cột trước đã đủ rõ
- Khi export sang Excel: merge các cells cùng dimension lại (dọc theo cột đầu)
