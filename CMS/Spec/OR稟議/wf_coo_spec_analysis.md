**📋 Phân Tích Requirement: ワークフロー図 (COO決裁) — OR稟議書 Luồng phê duyệt COO**

---

## Spec tổng quan

### Thông tin tài liệu

| Mục | Nội dung |
|---|---|
| Tên file | 05.ワークフロー_OR稟議書_20260205.xlsx |
| Sheet | ワークフロー図 (COO決裁) |
| Loại workflow | Phê duyệt OR稟議書 (OR Resolution Document) — Tuyến COO決裁 |
| Ngày tài liệu | 2026-02-05 |
| Tổng số node phê duyệt | 7 node (承認欄2 → 承認欄8) |
| Tổng số slot 関係者 | 20 slot (関係者欄1 → 関係者欄20) |
| Sheet liên quan | ワークフロー図（CEO決裁） — cùng file, luồng CEO決裁 dài hơn (10 node); dùng để đối chiếu |

---

### Luồng phê duyệt chính (承認フロー — Approval Chain)

| # | 承認欄 | 押印欄名称 (Node Name) | 押印者 (Approver) | 編集権限 | 必須 | Ghi chú |
|---|---|---|---|---|---|---|
| 1 | 承認欄2 | 申請者 (Applicant) | 申請者 (self) | 〇 | 〇 | Người tạo/submit bản ghi |
| 2 | 承認欄3 | OR管理課 (OR Mgmt Div.) | Cố định (Fixed) | × | 〇 | Lấy user từ Application screen |
| 3 | 承認欄4 | 部門長 (Division Manager) | Applicant chỉ định | × | 〇 | |
| 4 | 承認欄5 | 統括部長 (Exec. Gen. Manager) | Applicant chỉ định | × | 〇 | |
| 5 | 承認欄6 | 本部長 (HQ Manager) | Applicant chỉ định | × | 〇 | |
| 6 | 承認欄7 | 各社COO | Lấy từ 承認者マスタ | × | 〇 | 会社名・業態名選択時反映; 業態記入欄 編集権限〇 (dù cột 編集権限 chính = ×) |
| 7 | 承認欄8 | TCO | Lấy từ 承認者マスタ | × | △ | 会社名・業態名選択時反映; 業態記入欄 編集権限〇; **[Confirmed]** 必須=△ vì node CÓ ĐIỀU KIỆN — xem BR-07 |

> **Chiều luồng:** 申請者 → OR管理課 → 部門長 → 統括部長 → 本部長 → 各社COO → TCO *(nếu có setting)* → 完了
> **[Confirmed]** Luồng COO決裁 NGẮN HƠN CEO決裁 — không có node 担当役員, 秘書室, 決裁者. Ghi chú gốc trong sheet nhắc đến "秘書室"/"決裁者" là nội dung copy nhầm từ sheet CEO決裁, KHÔNG áp dụng cho luồng COO決裁 (xem AMB-01). 編集権限 tại 各社COO/TCO = × và 必須 tại TCO = △ là **chủ ý thiết kế** (xem AMB-03, BR-07).
> **[Confirmed]** Cột 否認 (I, Q) — COO決裁 vẫn có đầy đủ 2 action **差し戻し (Reject)** và **引き戻し (Recall)** giống sheet CEO決裁 (xem AMB-04, BR-12, BR-13).

---

### 関係者欄 (Related Parties)

| Mục | Nội dung |
|---|---|
| Số lượng slot | 20 slot (関係者欄1 ～ 関係者欄20) |
| Người chỉ định | 申請者 (Applicant) |
| 編集権限 | △ (có điều kiện) |
| 必須 | × (không bắt buộc) |
| Điều kiện edit | Khi 稟議種類 = 店舗 → chỉ được edit 業態記入欄 |

> **[Đối chiếu CEO決裁]** Cấu trúc 関係者欄 (số lượng slot, người chỉ định, quyền edit, điều kiện) GIỐNG HỆT sheet CEO決裁 — không phát hiện khác biệt.

---

### Business Rules (Quy tắc nghiệp vụ)

| # | Rule | Mô tả |
|---|---|---|
| BR-01 | Thời điểm bắt đầu 関係 | User có thể bắt đầu 関係 **sau khi 部門長 bấm 承認**, khi status = 統括部長待ち |
| BR-02 | Email khi start 関係 | Khi 関係 bắt đầu → gửi mail đến tất cả user 関係者 |
| BR-03 | **[Confirmed]** Email khi node approve | Khi user tại node bấm 承認 → gửi mail 承認 đến user node tiếp theo; status = node tiếp theo + 待ち. Ghi chú gốc trong sheet nhắc "không gửi mail cho 秘書室/決裁者" là **copy nhầm từ CEO決裁** — không áp dụng cho COO決裁 vì 2 node này không tồn tại (xem AMB-01) |
| BR-04 | Thời điểm kết thúc 関係 | 関係 kết thúc tại node 各社COO |
| BR-05 | Điều kiện advance đến 各社COO | Nếu TẤT CẢ 関係者 chưa hoàn thành 承認 → **không gửi mail 承認 đến 各社COO** |
| BR-06 | Email khi done | Khi bản ghi hoàn thành (done) → gửi mail đến ALL user trên node |
| BR-07 | **[Confirmed]** Node TCO có điều kiện (giống cơ chế 担当役員 ở CEO決裁) | Nếu 会社名 đã chọn **KHÔNG có setting user TCO** trong 承認者マスタ → khi 各社COO bấm 承認 → bản ghi **HOÀN THÀNH (完了) NGAY**, bỏ qua bước TCO; nếu **CÓ setting** → luồng tiếp tục đến TCO, TCO bấm 承認 → hoàn thành (xem AMB-02) |
| BR-08 | **[Confirmed]** Email 業態記入 | Khi OR管理課 approve **VÀ** 業態COOコメント còn trống **VÀ** bản ghi là loại ngoài SK → gửi mail 業態記入 đến user **各社COO** ("Node COO" = 各社COO, xem AMB-06) |
| BR-09 | Phán đoán SK / ngoài SK | Dựa vào trường 業態: nếu 業態 = SK → loại SK; 業態 ≠ SK → loại ngoài SK |
| BR-10 | **[Confirmed]** Nhập liệu 業態記入欄 | Vùng 業態記入欄 dùng button trên toolbar để nhập thông tin; 各社COO/TCO tuy có 編集権限=× (KHÔNG edit field chính của bản ghi) nhưng vẫn nhập được vùng 業態記入 riêng thông qua button toolbar (xem AMB-03) |
| BR-11 | **[Confirmed]** Không có node 担当役員 | Luồng COO決裁 chủ ý KHÔNG có bước duyệt theo 会社名-based 担当役員 như CEO決裁 (xem AMB-07) |
| BR-12 | **[Confirmed]** Luồng 差し戻し (Reject) | COO決裁 vẫn có action button **差し戻し**, tương tự CEO決裁: user đang giữ bản ghi bấm 差し戻し → bản ghi chuyển về chân user 申請者 phụ trách, xóa dấu 承認 của TẤT CẢ node đã đóng dấu trước đó (xem AMB-04) |
| BR-13 | **[Confirmed]** Luồng 引き戻し (Recall) | COO決裁 vẫn có action button **引き戻し**, tương tự CEO決裁: user ĐÃ đóng dấu 承認 ở node của mình bấm 引き戻し → kéo bản ghi về lại CHÍNH MÌNH, CHỈ xóa dấu 承認 của chính mình, status về [user đó]待ち (xem AMB-04) |

> **[Confirmed]** Ghi chú gốc trong sheet (liên quan BR-03) đề cập node **秘書室** và **決裁者** là nội dung copy nguyên văn từ sheet CEO決裁 — COO決裁 thực sự KHÔNG có 2 node này, chain chỉ dừng ở 承認欄8 = TCO (xem AMB-01).

---

### Sơ đồ trạng thái (Status Transition)

| Từ Node | Hành động | Status tiếp theo |
|---|---|---|
| 申請者 | 承認 | OR管理課待ち |
| OR管理課 | 承認 | 部門長待ち |
| 部門長 | 承認 | 統括部長待ち *(+ 関係 starts)* |
| 統括部長 | 承認 | 本部長待ち |
| 本部長 | 承認 | 各社COO待ち *(sau khi ALL 関係者 done)* |
| 各社COO | 承認 | TCO待ち *(nếu 会社名 có setting user TCO trong 承認者マスタ)* → hoặc **完了 (Done)** trực tiếp *(nếu KHÔNG có setting, bỏ qua TCO — xem BR-07)* |
| TCO *(nếu active)* | 承認 | **完了 (Done)** |
| **Bất kỳ node nào (đang giữ bản ghi)** | **差し戻し (Reject)** | **申請者 phụ trách** *(xóa dấu 承認 của TẤT CẢ node đã đóng dấu — xem BR-12)* |
| **User ĐÃ đóng dấu tại node của mình** | **引き戻し (Recall)** | **Chính user đó + 待ち** *(chỉ xóa dấu của chính user đó — xem BR-13)* |

---

## QnA

### Danh sách câu hỏi & điểm mơ hồ — Đã xác nhận với PO/BA (✅ 7/7)

| # | Mã | Câu hỏi | Trạng thái | Trả lời xác nhận |
|---|---|---|---|---|
| 1 | AMB-01 | Ghi chú BR-03/BR-07 (bản gốc) trong sheet đề cập node "秘書室" và "決裁者" — nhưng 2 node này KHÔNG có trong bảng 承認欄 của sheet COO決裁. Đây là lỗi copy-paste từ sheet CEO決裁 hay COO決裁 thực sự CÓ 2 node ẩn/chưa liệt kê này? | ✅ Resolved | **Không có** 2 node 秘書室 và 決裁者 — xác nhận đây là ghi chú copy nhầm từ CEO決裁, COO決裁 chain kết thúc ở TCO (xem BR-03) |
| 2 | AMB-02 | TCO (node cuối cùng) có 必須=△ (không bắt buộc). Nếu TCO không bắt buộc duyệt, bản ghi có tự động chuyển "完了 (Done)" không? Cơ chế hoàn thành cụ thể là gì? | ✅ Resolved | Nếu **không có TCO** (không có setting user TCO) thì khi **各社COO** bấm 承認 → bản ghi **done** ngay (node TCO có điều kiện, giống cơ chế 担当役員 ở CEO決裁 — xem BR-07) |
| 3 | AMB-03 | 編集権限 tại 各社COO và TCO = × (không cho edit field chính) — khác CEO決裁 (= △). Đây có phải chủ ý nghiệp vụ hay sai sót? | ✅ Resolved | Chủ ý — **không cho edit bản ghi** (field chính); việc nhập vùng 業態記入 thực hiện riêng bằng cách bấm vào button toolbar (xem BR-10) |
| 4 | AMB-04 | Cột 否認 không có mô tả giá trị. COO決裁 có áp dụng 2 action 差し戻し/引き戻し giống CEO決裁 không? | ✅ Resolved | **Có** — vẫn có đầy đủ 2 button **差し戻し** và **引き戻し** (xem BR-12, BR-13) |
| 5 | AMB-05 | 承認欄1 bị thiếu (giống hiện tượng ở CEO決裁, đã xác nhận chỉ là label). Áp dụng cùng kết luận cho COO決裁? | ✅ Resolved | **Có** — áp dụng giống sheet CEO決裁 (承認欄1 chỉ là label, không gắn logic nghiệp vụ) |
| 6 | AMB-06 | BR-08 ghi mail 業態記入 gửi đến "Node COO" — 各社COO hay TCO? | ✅ Resolved | **Là 各社COO** (xem BR-08) |
| 7 | AMB-07 | COO決裁 không có node 担当役員 — chủ ý thiết kế hay thiếu sót? | ✅ Resolved | **Không có** node 担当役員 trong luồng COO決裁 (chủ ý thiết kế — xem BR-11) |

### Rủi ro kiểm thử (đã mitigate sau khi có câu trả lời QnA)

| # | Rủi ro | Mô tả | Mitigation |
|---|---|---|---|
| RISK-01 | Test sai điều kiện hoàn thành luồng | TCO là node có điều kiện (必須=△); nếu không hiểu rõ cơ chế BR-07, test case "luồng hoàn thành" dễ viết sai | Đã xác nhận AMB-02/BR-07 — viết 2 test case riêng: (1) 各社COO done trực tiếp khi KHÔNG có TCO setting, (2) qua TCO khi CÓ setting |
| RISK-02 | Nhầm lẫn business rule giữa 2 luồng CEO決裁 và COO決裁 | Ghi chú gốc trong sheet COO決裁 copy nguyên văn từ CEO決裁 (nhắc 秘書室/決裁者) | Đã xác nhận AMB-01/AMB-04 — bỏ qua các đoạn ghi chú liên quan 秘書室/決裁者 khi test COO決裁; áp dụng đúng BR-12/BR-13 cho 差し戻し/引き戻し |
| RISK-03 | Bỏ sót verify quyền edit khác biệt giữa 2 luồng | 編集権限 tại 各社COO/TCO khác nhau giữa CEO決裁 (△) và COO決裁 (×) | Đã xác nhận AMB-03/BR-10 — thiết kế test case riêng biệt: verify field chính KHÔNG edit được (×) nhưng vùng 業態記入 vẫn nhập được qua button |

> **Ghi chú:** Toàn bộ 7 điểm mơ hồ (AMB-01 → AMB-07) đã được PO/BA xác nhận trực tiếp. Các quy tắc nghiệp vụ tương ứng đã được cập nhật vào bảng *Business Rules* (BR-03, BR-07, BR-08, BR-10 → BR-13) và các mục liên quan trong *Spec tổng quan* ở trên.
