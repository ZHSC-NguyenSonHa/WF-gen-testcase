**📋 Phân Tích Requirement: ワークフロー図（CEO決裁） — OR稟議書 Luồng phê duyệt CEO**

---

## Spec tổng quan

### Thông tin tài liệu

| Mục | Nội dung |
|---|---|
| Tên file | 05.ワークフロー_OR稟議書_20260205.xlsx |
| Sheet | ワークフロー図（CEO決裁） |
| Loại workflow | Phê duyệt OR稟議書 (OR Resolution Document) — Tuyến CEO決裁 |
| Ngày tài liệu | 2026-02-05 |
| Tổng số node phê duyệt | 10 node (承認欄2 → 承認欄11) |
| Tổng số slot 関係者 | 20 slot (関係者欄1 → 関係者欄20) |

---

### Luồng phê duyệt chính (承認フロー — Approval Chain)

| # | 承認欄 | 押印欄名称 (Node Name) | 押印者 (Approver) | 編集権限 | 必須 | Ghi chú |
|---|---|---|---|---|---|---|
| 1 | 承認欄2 | 申請者 (Applicant) | 申請者 (self) | 〇 | 〇 | Người tạo/submit bản ghi |
| 2 | 承認欄3 | OR管理課 (OR Mgmt Div.) | Cố định (Fixed) | × | 〇 | Lấy user từ Application screen |
| 3 | 承認欄4 | 部門長 (Division Manager) | Applicant chỉ định | × | 〇 | |
| 4 | 承認欄5 | 統括部長 (Exec. Gen. Manager) | Applicant chỉ định | × | 〇 | |
| 5 | 承認欄6 | 本部長 (HQ Manager) | Applicant chỉ định | × | 〇 | |
| 6 | 承認欄7 | 各社COO | Lấy từ 承認者マスタ | △ | 〇 | 会社名・業態名選択時に反映; 業態記入欄 編集権限〇 |
| 7 | 承認欄8 | TCO | Lấy từ 承認者マスタ | △ | 〇 | 会社名・業態名選択時に反映; 業態記入欄 編集権限〇 |
| 8 | 承認欄9 | 担当役員 (Exec. Director) | Lấy từ 承認者マスタ (theo 会社名) | × | × | **[Confirmed]** Node bị ảnh hưởng bởi 会社名 đã chọn: nếu 会社名 có setting user trong 承認者マスタ → hiển thị user (node active); nếu KHÔNG có setting → hiển thị `/` (node bị skip) |
| 9 | 承認欄10 | 秘書室 (Secretarial Office) | Cố định (Fixed) | × | 〇 | Lấy user từ Application screen; **[Confirmed]** không nhận mail thông báo riêng khi đến lượt (BR-15) |
| 10 | 承認欄11 | 決裁者 (CEO) | Cố định (Fixed) | × | 〇 | Lấy user từ Application screen; **[Confirmed]** không nhận mail thông báo riêng khi đến lượt (BR-15) |

> **Chiều luồng:** 申請者 → OR管理課 → 部門長 → 統括部長 → 本部長 → 各社COO → TCO → (担当役員 nếu có setting) → 秘書室 → 決裁者
> **[Confirmed]** Tại mọi node, user đang giữ bản ghi có thêm action **差し戻し (Reject)** — trả bản ghi về chân user 申請者, đồng thời xóa dấu 承認 của TẤT CẢ node đã đóng dấu trước đó (xem BR-12, BR-13).
> **[Confirmed]** Ngoài ra, user ĐÃ đóng dấu 承認 ở node của mình (bản ghi đã chuyển sang node tiếp theo) có thêm action **引き戻し (Recall)** — kéo bản ghi về lại CHÍNH MÌNH, chỉ xóa dấu 承認 của chính user đó, KHÔNG ảnh hưởng dấu của các node khác (xem BR-23).

---

### 関係者欄 (Related Parties)

| Mục | Nội dung |
|---|---|
| Số lượng slot | 20 slot (関係者欄1 ～ 関係者欄20) |
| Người chỉ định | 申請者 (Applicant) |
| 編集権限 | △ (có điều kiện) |
| 必須 | × (không bắt buộc) |
| Điều kiện edit | Khi 稟議種類 = 店舗 → chỉ được edit 業態記入欄 |

> **[Confirmed]** Áp dụng đồng nhất cho TẤT CẢ 20 slot 関係者欄: nếu bản ghi loại 稟議種類 = 店舗 → hiển thị button nhập vùng 業態記入; nếu 稟議種類 = 事務所 → KHÔNG hiển thị button nhập (BR-17).
> **[Confirmed]** Nếu 部門長 thực hiện 差し戻し (reject) → toàn bộ user 関係者 đã được assign KHÔNG còn xem được bản ghi nữa; bản ghi quay về chân user 申請者, dấu 承認 của 部門長 cũng bị xóa (BR-13).

---

### Business Rules (Quy tắc nghiệp vụ)

| # | Rule | Mô tả |
|---|---|---|
| BR-01 | Thời điểm bắt đầu 関係 | User có thể bắt đầu 関係 **sau khi 部門長 bấm 承認**, khi status = 統括部長待ち |
| BR-02 | Email khi start 関係 | Khi 関係 bắt đầu → gửi mail đến tất cả user 関係者 |
| BR-03 | Email khi node approve | Khi user tại node bấm 承認 → gửi mail 承認 đến user node tiếp theo; status = node tiếp theo + 待ち |
| BR-04 | Exception: 秘書室・決裁者 | **Không gửi mail** qua luồng approve thông thường cho 秘書室 và 決裁者 |
| BR-05 | Thời điểm kết thúc 関係 | 関係 kết thúc tại node 各社COO |
| BR-06 | Điều kiện advance đến 各社COO | Nếu TẤT CẢ 関係者 chưa hoàn thành 承認 → **không gửi mail 承認 đến 各社COO** |
| BR-07 | Email khi done | Khi bản ghi hoàn thành (done) → gửi mail đến ALL user trên node |
| BR-08 | Email 秘書室依頼 | Khi status = 秘書室待ち → gửi mail 秘書室依頼 đến: 申請者, 依頼先追加受信PG, 提出依頼先 |
| BR-09 | Email 業態記入 | Khi OR管理課 approve **VÀ** 業態COOコメント còn trống **VÀ** bản ghi là loại ngoài SK → gửi mail 業態記入 đến Node COO users |
| BR-10 | Phán đoán SK / ngoài SK | Dựa vào trường 業態: nếu 業態 = SK → loại SK; 業態 ≠ SK → loại ngoài SK |
| BR-11 | Nhập liệu 業態記入欄 | Vùng 業態記入欄 dùng button trên toolbar để nhập thông tin; **[Confirmed]** toolbar chỉ dùng để nhập các field cơ bản, không có chức năng khác (đính kèm file/rich text sẽ nằm ở chức năng riêng biệt) |
| BR-12 | **[Confirmed]** Luồng 差し戻し (Reject) | User tại node hiện tại đang giữ bản ghi bấm 差し戻し → bản ghi chuyển về chân user 申請者 phụ trách; đồng thời XÓA dấu 承認 của TẤT CẢ các node đã đóng dấu trước đó (reset toàn bộ tiến trình phê duyệt về ban đầu) |
| BR-13 | **[Confirmed]** Ảnh hưởng 差し戻し lên 関係者 | Nếu 部門長 thực hiện 差し戻し → toàn bộ user 関係者 đã assign KHÔNG còn xem được bản ghi; bản ghi quay về 申請者 (vì dấu 部門長 cũng bị xóa trong lần 差し戻し này) |
| BR-14 | **[Confirmed]** 業態記入 khi bản ghi loại SK | Khi bản ghi thuộc loại SK: vẫn BẮT BUỘC nhập vùng 業態記入 như bình thường, nhưng KHÔNG gửi mail 業態記入 (chỉ khác BR-09 ở việc không trigger mail) |
| BR-15 | **[Confirmed]** 秘書室 / 決裁者 không nhận mail thông báo riêng | Hai user này KHÔNG cần nhận mail thông báo khi đến lượt xử lý (không có kênh thông báo riêng ngoài luồng chuẩn) |
| BR-16 | **[Confirmed]** Nguồn dữ liệu 提出依頼先 | User 提出依頼先 (nhận mail 秘書室依頼 cùng 申請者, 依頼先追加受信PG) được lấy từ màn hình Application (giống cơ chế Fixed của OR管理課/秘書室/決裁者) |
| BR-17 | **[Confirmed]** Điều kiện hiển thị vùng 業態記入 (関係者) | 稟議種類 = 店舗 → có button nhập vùng 業態記入; 稟議種類 = 事務所 → KHÔNG có button nhập |
| BR-18 | **[Confirmed]** Không có cơ chế timeout/override tại 各社COO | Nếu 関係者 không bao giờ hoàn thành 承認, bản ghi bị BLOCK VĨNH VIỄN tại bước chờ 各社COO (không có timeout hay override thủ công) |
| BR-19 | **[Confirmed]** Điều kiện active node 担当役員 | Node chỉ active (hiển thị user) nếu 会社名 đã chọn có setting user tương ứng trong 承認者マスタ; nếu không có setting → hiển thị `/` và node coi như bị skip |
| BR-20 | **[Bổ sung nghiệp vụ]** Cơ chế input 業態COOコメント | Field 業態COOコメント (dùng để phán đoán điều kiện trong BR-09/BR-14) được nhập thông qua button trên toolbar — cùng cơ chế thao tác với vùng 業態記入欄 (xem BR-11) |
| BR-21 | **[Bổ sung nghiệp vụ]** Quyền nhập 業態COOコメント | User **関係者**, **各社COO**, **TCO** đều có quyền nhập/sửa field 業態COOコメント, tại **BẤT KỲ status nào** của bản ghi — không giới hạn theo lượt duyệt hiện tại (VD: COO vẫn có thể nhập trước khi đến lượt mình duyệt) |
| BR-22 | **[Bổ sung nghiệp vụ]** Ảnh hưởng điều kiện "trống" tại BR-09 | Vì 業態COOコメント có thể được nhập sớm bởi 関係者/COO/TCO trước khi OR管理課 duyệt, nên điều kiện "còn trống" tại BR-09 phụ thuộc vào việc đã có user nào chủ động nhập trước thời điểm OR管理課 bấm 承認 hay chưa, bất kể bản ghi đang ở node/status nào tại thời điểm đó |
| BR-23 | **[Bổ sung nghiệp vụ]** Luồng 引き戻し (Recall) | User ĐÃ đóng dấu 承認 ở node của mình (bản ghi đã chuyển sang node tiếp theo) có thể bấm 引き戻し để kéo bản ghi về lại CHÍNH MÌNH; hành động này CHỈ xóa dấu 承認 của chính user đó (KHÔNG ảnh hưởng dấu của các node khác, kể cả node trước/sau); Status chuyển về node của chính user đó + 待ち |

---

### Sơ đồ trạng thái (Status Transition)

| Từ Node | Hành động | Status tiếp theo |
|---|---|---|
| 申請者 | 承認 | OR管理課待ち |
| OR管理課 | 承認 | 部門長待ち |
| 部門長 | 承認 | 統括部長待ち *(+ 関係 starts)* |
| 統括部長 | 承認 | 本部長待ち |
| 本部長 | 承認 | 各社COO待ち *(sau khi ALL 関係者 done)* |
| 各社COO | 承認 | TCO待ち |
| TCO | 承認 | 担当役員待ち *(nếu 会社名 có setting user trong 承認者マスタ)* → hoặc bỏ qua thẳng → 秘書室待ち *(nếu không có setting, hiển thị `/`)* |
| 担当役員 *(nếu active)* | 承認 | 秘書室待ち |
| 秘書室 | 承認 | 決裁者待ち |
| 決裁者 | 承認 | 完了 (Done) |
| **Bất kỳ node nào (đang giữ bản ghi)** | **差し戻し (Reject)** | **申請者 phụ trách** *(bản ghi quay lại chân người tạo; XÓA dấu 承認 của TẤT CẢ node đã đóng dấu; nếu reject tại/sau 部門長 thì 関係者 bị revoke quyền xem)* |
| **User ĐÃ đóng dấu tại node của mình** | **引き戻し (Recall)** | **Chính user đó + 待ち** *(bản ghi quay về lại chân user vừa recall; CHỈ xóa dấu của chính user đó, các node khác không đổi)* |

---

### 否認 (Rejection) Column — **[Confirmed]**

Cột 否認 định nghĩa trong header (columns I và Q) tương ứng 2 hành động riêng biệt **差し戻し (Reject)** và **引き戻し (Recall)**:
- **差し戻し**: User tại node hiện tại đang giữ bản ghi thực hiện (BR-12) → bản ghi chuyển thẳng về chân user 申請者 phụ trách, đồng thời xóa dấu 承認 của TẤT CẢ node đã đóng dấu trước đó (reset toàn bộ chain). Nếu xảy ra tại/sau node 部門長 (tức 関係者 đã được assign) → toàn bộ user 関係者 KHÔNG còn xem được bản ghi nữa (BR-13).
- **引き戻し**: Chỉ user ĐÃ từng đóng dấu 承認 ở node của mình mới thực hiện được (BR-23) → kéo bản ghi về lại CHÍNH MÌNH, status chuyển về node của chính user đó + 待ち; CHỈ xóa dấu 承認 của chính user đó, không ảnh hưởng dấu của các node khác.

---

## QnA

### Danh sách câu hỏi & điểm mơ hồ — Đã xác nhận với PO/BA (✅ 14/14)

| # | Mã | Câu hỏi | Trạng thái | Trả lời xác nhận |
|---|---|---|---|---|
| 1 | AMB-01 | **承認欄1 bị thiếu.** Header ghi "(右端が1)" nghĩa là vị trí phải nhất = 承認欄1, nhưng node đầu tiên trong spec là 承認欄2. 承認欄1 là gì? | ✅ Resolved | 承認欄1 chỉ hiển thị label, không gắn với node/logic nghiệp vụ nào — không cần quan tâm khi test |
| 2 | AMB-02 | **Luồng 否認 (Reject) chưa được mô tả.** Cột I (否認) và Q (否認) được định nghĩa nhưng không có giá trị. Khi user bấm 差し戻し/否認, bản ghi đi về đâu? | ✅ Resolved | Khi bấm 差し戻し → bản ghi chuyển về chân user 申請者 phụ trách (xem BR-12) |
| 3 | AMB-03 | **担当役員 (承認欄9) không bắt buộc (必須=×).** Điều kiện nào khiến node này trở thành active? | ✅ Resolved | Node active khi 会社名 đã chọn có setting user tương ứng trong 承認者マスタ; nếu không có setting → hiển thị `/` (xem BR-19) |
| 4 | AMB-04 | **BR-08: Tại sao 申請者 nhận mail 秘書室依頼?** Mục đích thông báo cho 申請者 là gì? | ✅ Resolved | Spec đúng như mô tả — mail 秘書室依頼 được gửi đến cả 申請者 (không có sai lệch cần sửa) |
| 5 | AMB-05 | **BR-06: Cơ chế block tại 各社COO.** Nếu 関係者 không bao giờ approve thì luồng có bị block mãi? | ✅ Resolved | Có — bản ghi bị BLOCK VĨNH VIỄN, không có cơ chế timeout/override (xem BR-18) |
| 6 | AMB-06 | **秘書室 và 決裁者 nhận thông báo qua kênh nào?** | ✅ Resolved | Hai user này KHÔNG cần nhận mail thông báo riêng (xem BR-15) |
| 7 | AMB-07 | **BR-09: Khi bản ghi loại SK → luồng 業態記入 có bị skip hoàn toàn không?** | ✅ Resolved | Vẫn BẮT BUỘC nhập 業態記入欄, chỉ KHÔNG gửi mail 業態記入 (xem BR-14) |
| 8 | AMB-08 | **編集権限=△ của 各社COO và TCO có nghĩa cụ thể là gì?** | ✅ Resolved | △ = edit được 業態記入欄 thông qua toolbar button (đúng như giả định ban đầu) |
| 9 | AMB-09 | **Điều kiện edit 業態記入欄 áp dụng cho TẤT CẢ 関係者欄 (1-20) hay chỉ một số?** | ✅ Resolved | Dựa vào 稟議種類: = 店舗 → có button nhập 業態記入; = 事務所 → KHÔNG có button nhập (xem BR-17) |
| 10 | AMB-10 | **提出依頼先 (C37) là trường nào trên form?** | ✅ Resolved | User được lấy từ màn hình Application (xem BR-16) |
| 11 | AMB-11 | **業態記入欄 toolbar button (C42) có những chức năng gì?** | ✅ Resolved | Chỉ dùng để nhập thông tin các field cơ bản; các chức năng khác (nếu có) sẽ được viết ở mục riêng (xem BR-11) |
| 12 | AMB-12 | **Nếu 部門長 reject → 関係者 đã được assign có bị hủy không?** | ✅ Resolved | Có — nếu 部門長 差し戻し, bản ghi về chân 申請者 và user 関係者 KHÔNG còn xem được bản ghi (xem BR-13) |
| 13 | AMB-13 | **Không có mô tả 差し戻し/引き戻し (return/recall). Workflow có hỗ trợ không, và 2 action này khác nhau thế nào?** | ✅ Resolved | Có — đây là 2 action RIÊNG BIỆT: **差し戻し** (user đang giữ bản ghi bấm → về chân 申請者, xóa dấu TẤT CẢ node đã đóng dấu — xem BR-12) và **引き戻し** (chỉ user ĐÃ đóng dấu mới bấm được → kéo bản ghi về lại chính mình, chỉ xóa dấu của chính mình, status về [user đó]待ち — xem BR-23) |
| 14 | AMB-14 | **承認欄3ん9 (担当役員) 備考 ghi "会社名・業態名選択時" (bị cắt).** Nội dung đầy đủ và cơ chế activate? | ✅ Resolved | Node 担当役員 bị ảnh hưởng bởi 会社名 đã chọn: nếu có setting user trong 承認者マスタ → hiển thị user; nếu không → hiển thị `/` (xem BR-19) |

> **Ghi chú:** Toàn bộ 14 điểm mơ hồ đã được User xác nhận trực tiếp trong file deliverable. Các quy tắc nghiệp vụ tương ứng đã được bổ sung vào bảng *Business Rules* (BR-12 → BR-19, BR-23) và các mục liên quan trong *Spec tổng quan* ở trên.

