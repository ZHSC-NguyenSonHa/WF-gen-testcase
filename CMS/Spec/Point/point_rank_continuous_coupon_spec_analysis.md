# 📋 Phân Tích Requirement: REQ-RANK-COUPON-POINT-2026
## Cấp phát coupon cho user giữ rank liên tục từ ngày X đến ngày Y, với mô hình chỉ ghi log khi có thay đổi rank

## 1. Tổng Quan Ticket

| Mục | Nội dung |
|---|---|
| Nguồn yêu cầu | Khách hàng: cấp phát coupon cho user giữ rank liên tục từ X đến Y |
| Ngữ cảnh kỹ thuật | Chỉ ghi data khi có thay đổi rank (change-only logging) |
| Luồng Up rank | API tích điểm từ App và CMS |
| Luồng Down rank | API chạy mùng 1 đầu tháng do điểm hết hạn |
| Mục tiêu chính | Đảm bảo xác định đúng eligibility cấp coupon ngay cả khi log up/down bị thiếu hoặc ghi lỗi |
| Tài liệu tham chiếu | rank_diamond_coupon_spec_analysis_v2.xlsx |
| Bảng dữ liệu hiện hữu | om_point_histories (id, brand_id, hash_code, receipt_id, campaign_id, quality_point, object, expired_at, created_at, updated_at, deleted_at, is_need_show_popup) |
| Output yêu cầu | File phân tích Markdown + Excel styled tại thư mục CMS/Spec/Point |

## 2. User Story

| # | User Story |
|---|---|
| US-01 | Là một System, tôi muốn cấp coupon cho user giữ rank Diamond liên tục trong khoảng X đến Y để đảm bảo đúng chính sách loyalty. |
| US-02 | Là một Product Owner, tôi muốn hệ thống không phụ thuộc tuyệt đối vào log up/down để tránh cấp sai khi sự cố ghi log xảy ra. |
| US-03 | Là một QA/Dev, tôi muốn có cơ chế đối soát từ bảng điểm gốc để phục hồi trạng thái rank khi event log bị mất. |
| US-04 | Là một Admin, tôi muốn cấu hình thời gian X, Y và rank mục tiêu mà không hard-code Diamond. |

## 3. Phạm Vi Áp Dụng (Scope)

| Module/Thành phần | Vai trò | Ảnh hưởng |
|---|---|---|
| API tích điểm App/CMS | Sinh sự kiện thay đổi điểm có thể dẫn tới Up rank | Trực tiếp |
| API down rank mùng 1 | Tái tính rank khi điểm hết hạn | Trực tiếp |
| Rank change log (change-only) | Lưu event up/down khi rank thay đổi | Trực tiếp |
| om_point_histories | Nguồn dữ liệu điểm gốc để đối soát/phục hồi rank | Trực tiếp |
| Batch xét eligibility coupon | Kiểm tra duy trì rank liên tục [X, Y] | Trực tiếp |
| Batch cấp coupon | Cấp coupon và chống cấp trùng | Trực tiếp |
| Admin cấu hình campaign | Cấu hình X, Y, rank_threshold, campaign_id | Liên quan |

## 4. Acceptance Criteria — Phân Tích Chi Tiết

### 4.1. Nhóm AC về dữ liệu và logging

| Mã AC | Mô tả | Mặc định/Tùy chọn | Ghi chú phân tích |
|---|---|---|---|
| AC-01 | Hệ thống tiếp tục ghi log chỉ khi có thay đổi rank | Mặc định | Đúng theo phương án hiện tại, nhưng có rủi ro thiếu log |
| AC-02 | Mỗi log phải có hash_code, brand_id, prev_rank, new_rank, direction, changed_at, source_api | Mặc định | source_api giúp truy vết App/CMS/mùng 1 |
| AC-03 | Log phải idempotent theo khóa nghiệp vụ (hash_code + changed_at + new_rank + source_api) | Mặc định | Tránh duplicate khi retry |
| AC-04 | Nếu ghi log thất bại, phải tạo bản ghi lỗi kỹ thuật để reconciliation xử lý | Mặc định | Không được im lặng bỏ qua |

### 4.2. Nhóm AC về eligibility liên tục X-Y

| Mã AC | Mô tả | Mặc định/Tùy chọn | Ghi chú phân tích |
|---|---|---|---|
| AC-05 | User đủ điều kiện khi rank tại thời điểm X >= rank mục tiêu và không có giai đoạn dưới ngưỡng trong [X, Y] | Mặc định | Cần tái dựng timeline hoặc period |
| AC-06 | User lên Diamond sau X (ví dụ 15/08) thì không đủ điều kiện cho kỳ đã bắt đầu từ X | Mặc định | Tránh cấp nhầm do chỉ kiểm tra không có down event |
| AC-07 | Dữ liệu thiếu log phải được đối soát từ om_point_histories trước khi chốt danh sách đủ điều kiện | Mặc định | Đây là AC chống silent data loss |
| AC-08 | Batch coupon phải idempotent theo (hash_code, campaign_id, period_start, period_end) | Mặc định | Tránh cấp trùng khi rerun |

### 4.3. Nhóm AC về fallback khi log up/down lỗi

| Mã AC | Mô tả | Mặc định/Tùy chọn | Ghi chú phân tích |
|---|---|---|---|
| AC-09 | Có job reconciliation chạy định kỳ để phát hiện lệch giữa rank log và rank suy ra từ point history | Mặc định | Khuyến nghị chạy hằng ngày + trước batch coupon |
| AC-10 | Có chế độ backfill log cho khoảng thời gian bị lỗi ghi log | Mặc định | Backfill có flag is_reconstructed |
| AC-11 | Nếu không thể phục hồi đầy đủ timeline, user phải vào danh sách pending review thay vì auto cấp | Mặc định | Ưu tiên tránh cấp sai |
| AC-12 | Dashboard cảnh báo tỷ lệ thiếu log theo ngày/nguồn API | Tùy chọn | Nâng cao quan sát vận hành |

## 5. Phụ Thuộc (Dependencies)

### 5.1. Luồng phụ thuộc hệ thống

| Dependency | Loại | Tác động tới requirement |
|---|---|---|
| API tích điểm App | Upstream nghiệp vụ | Nếu API ghi điểm thành công nhưng ghi rank log lỗi sẽ tạo lệch dữ liệu |
| API tích điểm CMS | Upstream nghiệp vụ | Tương tự App, cần đồng nhất contract logging |
| Job hết hạn điểm mùng 1 | Batch định kỳ | Down rank hàng loạt, rủi ro cao nếu mất log |
| om_point_histories | Data source gốc | Dùng để đối soát, backfill, và làm nguồn sự thật khi log thiếu |
| Coupon engine | Downstream | Cần nhận danh sách eligibility đã qua bước reconcile |

### 5.2. Business Rules tổng hợp (ticket chính + ràng buộc kỹ thuật)

| Mã Rule | Rule |
|---|---|
| BR-01 | Chỉ log khi rank thay đổi là chấp nhận được nếu có cơ chế reconciliation bắt buộc. |
| BR-02 | Điểm hết hạn mùng 1 có thể làm down rank diện rộng, nên phải có checkpoint dữ liệu trước/sau batch. |
| BR-03 | om_point_histories là nguồn bằng chứng để tái dựng rank khi event log thiếu. |
| BR-04 | Quyết định cấp coupon chỉ dùng dữ liệu đã reconcile, không dùng log thô trực tiếp. |
| BR-05 | Mọi batch liên quan coupon phải idempotent và có khả năng rerun an toàn. |

## 6. Phân Tích Mockup/Screenshot

### 6.1. Ảnh cấu trúc DB point history

| Thành phần quan sát | Chi tiết |
|---|---|
| Dạng hiển thị | Result Grid từ DB client, dữ liệu dạng transaction log |
| Cột chính | id, brand_id, hash_code, receipt_id, campaign_id, quality_point, object, expired_at, created_at, updated_at, deleted_at, is_need_show_popup |
| Nhận định | Bảng thể hiện lịch sử điểm, không phải bảng rank timeline trực tiếp |
| Giá trị hỗ trợ phân tích | Có mốc created_at/expired_at và điểm quality_point để suy luận trạng thái điểm theo thời gian |

### 6.2. Inconsistency/GAP giữa yêu cầu và dữ liệu hiện có

| Mã | Quan sát | Tác động |
|---|---|---|
| GAP-01 | Yêu cầu cần xác nhận duy trì rank liên tục, nhưng bảng đang có là lịch sử point chứ không có rank snapshot theo ngày | Không thể query trực tiếp eligibility nếu thiếu log rank |
| GAP-02 | Mô hình change-only logging không tự bảo đảm đầy đủ khi xảy ra lỗi ghi log | Có thể cấp sai hoặc bỏ sót user |
| GAP-03 | Chưa thấy cờ đánh dấu log tái dựng (reconstructed) trong thiết kế hiện tại | Khó audit sau sự cố |

## 7. Các Điểm Mơ Hồ & Rủi Ro

### 7.1. Điểm Mơ Hồ (Ambiguities)

| # | Mã | Câu hỏi cần làm rõ | Nguy cơ | Mức độ |
|---|---|---|---|---|
| 1 | AMB-01 | Rank tại thời điểm X được xác định từ đâu nếu user không có bản ghi up/down gần X? | Không xác định đúng eligibility đầu kỳ | 🔴 High |
| 2 | AMB-02 | Khi log up/down lỗi, SLA cho reconciliation là bao lâu trước khi chốt cấp coupon? | Chốt danh sách khi dữ liệu chưa sạch | 🔴 High |
| 3 | AMB-03 | Recompute rank từ point history dùng quy tắc nào khi nhiều campaign point khác nhau? | Tái dựng rank sai | 🔴 High |
| 4 | AMB-04 | Khoảng [X, Y] là inclusive cả hai đầu hay có quy tắc cắt theo giờ/timezone? | Sai lệch biên thời gian | 🟡 Medium |
| 5 | AMB-05 | Nếu batch mùng 1 fail một phần, có rollback hay replay theo partition user không? | Dữ liệu nửa vời, khó recovery | 🟡 Medium |
| 6 | AMB-06 | Trường hợp thiếu log nhưng point history cũng thiếu (do ETL/sync), quyết định pending hay reject? | Không nhất quán quyết định cấp coupon | 🟡 Medium |

### 7.2. Rủi Ro Kiểm Thử

| # | Mã | Rủi ro | Mô tả | Mitigation |
|---|---|---|---|---|
| 1 | RISK-01 | Silent missing logs | API thành công nhưng log rank thất bại không bị phát hiện | Bắt buộc log technical error + metric mismatch |
| 2 | RISK-02 | False positive eligibility | User không duy trì đủ từ X nhưng vẫn được cấp | Kiểm tra rank tại X + timeline liên tục + reconcile |
| 3 | RISK-03 | False negative eligibility | User đủ điều kiện nhưng bị loại do thiếu log | Backfill từ point history trước khi finalize |
| 4 | RISK-04 | Duplicate coupon khi rerun | Batch cấp lại sau lỗi | Unique key theo kỳ + idempotent command |
| 5 | RISK-05 | Load cao mùng 1 | Down rank hàng loạt gây timeout, mất một phần log | Chạy theo chunk + retry có checkpoint |
| 6 | RISK-06 | Drift dữ liệu giữa App và CMS | Hai nguồn cập nhật điểm không đồng bộ | Chuẩn hóa source_api + reconciliation theo source |

## 8. Ma Trận Trạng Thái

| Trạng thái dữ liệu | Điều kiện nhận diện | Hành vi eligibility | Hành động hệ thống |
|---|---|---|---|
| S1: Complete | Log rank đầy đủ, không lỗi reconcile | Xét eligibility bình thường | Cho vào danh sách cấp coupon |
| S2: MissingLog-Recoverable | Thiếu log nhưng tái dựng được từ om_point_histories | Xét theo dữ liệu đã tái dựng | Gắn cờ reconstructed và cho phép xét |
| S3: MissingLog-Unrecoverable | Thiếu log và không đủ dữ liệu point để tái dựng | Không auto quyết định | Đưa vào pending review |
| S4: Inconsistent | Log rank và điểm gốc mâu thuẫn sau reconcile | Tạm dừng cấp | Escalate cho vận hành/BA |
| S5: Eligible | Thỏa rank liên tục từ X đến Y sau reconcile | Đủ điều kiện | Cấp coupon (idempotent) |
| S6: Ineligible | Không thỏa liên tục hoặc lên rank sau X | Không đủ điều kiện | Không cấp coupon |

## 9. Tóm Tắt Acceptance Criteria (Checklist)

| Nhóm | Checklist |
|---|---|
| Data Logging | [ ] Có prev_rank/new_rank/direction/changed_at/source_api cho mọi log thay đổi rank |
| Data Logging | [ ] Có cơ chế bắt lỗi ghi log và lưu technical failure |
| Reconciliation | [ ] Có job đối soát log rank với om_point_histories trước khi batch coupon chạy |
| Reconciliation | [ ] Có backfill log bị thiếu với cờ reconstructed |
| Eligibility | [ ] Có kiểm tra rank tại X và liên tục trong [X, Y] |
| Eligibility | [ ] Loại user lên Diamond sau X khỏi kỳ hiện tại |
| Coupon | [ ] Batch coupon idempotent theo khóa kỳ |
| Operations | [ ] Có dashboard tỷ lệ thiếu log theo ngày/nguồn |
| Operations | [ ] Có runbook cho sự cố mùng 1 đầu tháng |
| Audit | [ ] Truy vết được quyết định cấp coupon dựa trên dữ liệu đã reconcile |

## 10. Khuyến Nghị Cho Kiểm Thử

| # | Khuyến nghị trọng tâm |
|---|---|
| 1 | Thiết kế bộ test dữ liệu cho 3 tình huống: đủ log, thiếu log khôi phục được, thiếu log không khôi phục được. |
| 2 | Tạo test mùng 1 đầu tháng với tải lớn để kiểm tra mất log cục bộ theo chunk user. |
| 3 | Kiểm thử chéo App API và CMS API: cùng user, nhiều nguồn điểm trong cùng ngày. |
| 4 | Kiểm thử biên thời gian X/Y theo timezone hệ thống và thời điểm 00:00:00. |
| 5 | Kiểm thử rerun reconciliation nhiều lần bảo đảm kết quả không đổi (idempotent). |
| 6 | Kiểm thử duplicate prevention của batch coupon khi retry sau lỗi giữa chừng. |
| 7 | Kiểm thử truy vết audit: từ coupon đã cấp ngược về log/reconstructed record. |
| 8 | Kiểm thử quality gate: nếu tỷ lệ missing log vượt ngưỡng thì chặn cấp coupon tự động. |
| 9 | Kiểm thử rule user lên Diamond sau X nhưng không được tính cho kỳ hiện tại. |
| 10 | Kiểm thử recovery end-to-end: giả lập mất log, chạy backfill, chạy eligibility, chạy coupon. |