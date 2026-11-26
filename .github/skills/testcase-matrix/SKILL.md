---
name: testcase-matrix
description: Skill thiết kế và viết testcase dạng Matrix theo chuẩn file mẫu 【APP】Scan QR vé đợi. Dùng khi cần viết TC matrix cho chức năng mobile app (iOS/AOS), thiết kế dimension, phân tích tổ hợp điều kiện, viết expected result bilingual Vietnamese-Japanese, theo dõi kết quả multi-device. Trigger keywords: matrix testcase, TC matrix, testcase matrix, viết matrix, thiết kế matrix, function matrix, FN matrix, test matrix.
argument-hint: "Tên chức năng hoặc FN cần thiết kế matrix"
---

# Testcase Matrix Skill

## Mục Đích

Sinh **testcase dạng Matrix** cho mobile app (iOS/Android) theo đúng chuẩn file mẫu `【APP】Scan QR vé đợi giấy tại Home_done.xlsx`.

Matrix format giúp:
- Quản lý tổ hợp điều kiện phức tạp một cách trực quan
- Theo dõi coverage (mỗi value đã được test chưa)
- Retest multi-device có First time / Last time
- Traceability: condition → action → expected result → bug ID

---

## When to Use

Dùng skill này khi:
- Cần viết testcase cho **logic chức năng** (FN) phức tạp có nhiều điều kiện
- Feature có **state/trạng thái** (waiting/calling/absence, login/logout, có/không có quyền...)
- Feature phụ thuộc **external factors** (network, server, flag config)
- Cần thiết kế testcase **multi-device** (iOS + Android)
- User nói: "viết matrix", "thiết kế TC matrix", "FN matrix", "test matrix"

**KHÔNG** dùng khi:
- TC đơn giản 1 điều kiện → dùng `rbt-manual-testing` mode QUICK
- Cần TC cho automation code → dùng `qa-automation-engineer`
- Chỉ cần test GUI/layout → dùng sheet GUI (list style), không cần matrix

---

## Quy Trình

### Bước 1 — Phân Tích Input

1. Đọc requirements / spec / user story được cung cấp
2. Xác định **phạm vi feature** cần cover
3. Tách thành danh sách **FN (Function)**: mỗi FN = 1 mục tiêu kiểm tra
4. Ưu tiên: Normal flow trước, Abnormal/Edge case sau

### Bước 2 — Thiết Kế Dimensions

Với mỗi FN, liệt kê tất cả **yếu tố ảnh hưởng đến outcome** theo thứ tự:

```
1. Pre-conditions (login state, feature flag, permissions)
2. Main input object (dữ liệu chính cần test: QR code type, trạng thái vé...)
3. External dependencies (network, server, device state)
```

Xem chi tiết: [Dimension Design Guide](./references/dimension-design.md)

### Bước 3 — Chọn Test Cases

Áp dụng **Pairwise / representative selection**:
- Không test all-combinations (quá nhiều)
- Mỗi TC = 1 kịch bản có ý nghĩa rõ ràng (Normal hoặc Abnormal)
- Thường 2–5 TC per FN là đủ
- Đánh dấu `〇` vào dimension value được chọn cho từng TC

### Bước 4 — Viết Expected Result

- Mỗi TC có đúng 1 `●` (hoặc `❶ ❷` nếu multi-step)
- Mô tả đầy đủ: UI text chính xác + button + hành vi tiếp theo
- Ghi rõ platform difference: `iOS: ... / AOS: ...`
- UI text giữ nguyên tiếng Nhật (copy từ design spec)

### Bước 5 — Viết Block Markdown

Sử dụng template: [FN Block Template](./assets/fn-block-template.md)

### Bước 6 — Self-Check

Xem checklist: [Quality Checklist](./references/quality-checklist.md)

---

## Cấu Trúc Output

Output mặc định là **Markdown** (có thể convert sang Excel sau):

```markdown
## ◆FNx — [Tên chức năng]

| | | TC-1 | TC-2 | TC-3 |
|---|---|---|---|---|
| **条件** | Dimension A — Value X | 〇 | | 〇 |
| | Dimension A — Value Y | | 〇 | |
| | Dimension B — Value M | 〇 | 〇 | |
| **動作** | Bước thực hiện | 〇 | 〇 | 〇 |
| **期待結果** | Kết quả A | ● | | |
| | Kết quả B | | ● | |
| **TCタイプ** | | N | A | N |
| **Device** | iPhone XS — First | | | |
| | Pixel 7a — First | | | |
| **Comment** | Bug ID | | | |
```

---

## Ký Hiệu Chuẩn

| Ký hiệu | Dùng ở đâu | Nghĩa |
|---|---|---|
| `〇` | Condition, Action | Value này được chọn cho TC này |
| `●` | Expected result | Đây là kết quả kỳ vọng |
| `❶ ❷` | Expected result | Kết quả cho action `①②` tương ứng |
| `① ②` | Action | Bước action có linked expected result |
| `N` | TCタイプ | Normal |
| `A` | TCタイプ | Abnormal |
| `OK` / `NG` | Tested result | Kết quả thực thi |

---

## Tham Khảo

- [Cấu trúc chi tiết block FN](./references/block-structure.md)
- [Nguyên tắc thiết kế dimension](./references/dimension-design.md)
- [Template block FN](./assets/fn-block-template.md)
- [Checklist chất lượng](./references/quality-checklist.md)
