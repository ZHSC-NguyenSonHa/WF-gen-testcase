# 📋 Phân Tích Spec: GIT発注検収申請 — 承認フロー

## 1. Tổng Quan Phân Tích Spec

| Loại | Mục | Nội dung | Ý hiểu / Ghi chú |
|---|---|---|---|
| Tổng quan | Tên document | GIT発注検収申請 | GIT Purchase Receipt Application |
| Tổng quan | Loại spec | Workflow phê duyệt nhiều node (承認フロー) | 6 承認 node + tối đa 20 関係者 slot |
| Tổng quan | Màn hình áp dụng | Màn hình tạo/xem GIT発注検収申請 | Nguồn: ảnh spec 承認欄 + 関係者欄 |
| Node 承認1 | 押印欄名称: 申請者 | 押印者: 申請者 / 編集権限: 〇 / 必須: 〇 / 差戻し: Không | Người tạo document tự ký (set theo user login). Không có 差戻し tại node này. Bắt buộc. |
| Node 承認2 | 押印欄名称: 上長 | 押印者: 申請者が指定 / 編集権限: 〇 / 必須: × / 差戻し: 〇 | Người nộp tự chỉ định 上長. KHÔNG bắt buộc → có thể skip (Not Full Node). Có 差戻し → trả về 申請者待ち. |
| Node 承認3 | 押印欄名称: 室長 | 押印者: 申請者が指定 / 編集権限: × / 必須: × / 差戻し: 〇 | Người nộp tự chỉ định 室長. KHÔNG bắt buộc → có thể skip. Có 差戻し → trả về 申請者待ち. |
| Node 承認4 | 押印欄名称: 部門長 | 押印者: 申請者が指定 / 編集権限: × / 必須: 〇 / 差戻し: Không rõ | Node bắt buộc. Bị chặn gửi mail PMO nếu 関係者 chưa done. Phụ thuộc hoàn thành kankei. |
| Node 承認5 | 押印欄名称: PMO室受付 | 押印者: 固定 / 編集権限: × / 必須: 〇 / 差戻し: Không rõ | Người duyệt cố định (lấy từ application). Bắt buộc. PMO không view được nếu BR-06 chặn. |
| Node 承認6 | 押印欄名称: 作業完了 | 押印者: 固定 / 編集権限: × / 必須: 〇 / 差戻し: Không rõ | Người duyệt cố định. Node cuối — khi approve → Status = 完了. |
| 関係者欄 | Số slot | 20 (関係者1 → 関係者20) | 押印者: 申請者が指定 / 編集権限: × / 必須: × / 差戻し: × |
| 関係者欄 | Ghi chú | Không bắt buộc, không có 差戻し | 関係者 không có quyền edit nội dung document. Bắt đầu view/approve từ status 室長待ち. |
| Status Flow | Bước 0 | 申請者 tạo + ký (承認1) → 上長待ち | Nếu 上長 skip → nhảy thẳng sang 室長待ち hoặc 部門長待ち |
| Status Flow | Bước 1 | 上長 ký (承認2) → 室長待ち | Optional node |
| Status Flow | Bước 2 | 室長 ký (承認3) → 部門長待ち | Optional. 関係者 bắt đầu có quyền view/approve từ đây (song song main flow) |
| Status Flow | Bước 3a | 関係者 approve đồng thời | Status chính KHÔNG đổi khi từng 関係者 approve. Hoạt động từ 室長待ち đến PMO室受付待ち |
| Status Flow | Bước 3b | 部門長 ký — kankei CHƯA done → PMO室受付待ち | KHÔNG gửi mail cho PMO室受付 |
| Status Flow | Bước 3c | 部門長 ký — kankei ĐÃ done → PMO室受付待ち | Gửi mail cho PMO室受付 bình thường |
| Status Flow | Bước 4 | PMO室受付 ký (承認5) → 作業完了待ち | PMO không view được nếu BR-06 chặn |
| Status Flow | Bước 5 | 作業完了 ký (承認6) → 完了 | Gửi mail done cho 申請者 và user share |
| Business Rule | BR-01 | 承認 → gửi mail 承認 đến node tiếp theo | Nguồn: ghi chú cuối ảnh spec |
| Business Rule | BR-02 | 差戻し → gửi mail 差戻し đến user 申請者 | Nguồn: ghi chú cuối ảnh spec |
| Business Rule | BR-03 | Khi Done → gửi mail done | Nguồn: ghi chú cuối ảnh spec |
| Business Rule | BR-04 | 関係者 start khi status = 室長待ち: có quyền view + 承認 | Nguồn: ghi chú cuối ảnh spec |
| Business Rule | BR-05 | 関係者 có thể thực hiện từ 室長待ち đến PMO室受付待ち | Nguồn: ghi chú cuối ảnh spec |
| Business Rule | BR-06 | Nếu chưa 関係者 done → user thuộc public group KHÔNG view được bản ghi dù status = PMO室受付待ち | Nguồn: ghi chú cuối ảnh spec — critical rule |
| Critical | 承認4 部門長 | Điều kiện kép: kankei done vs chưa done → 2 nhánh output khác nhau | Test bắt buộc cả 2 nhánh |
| Critical | 関係者 slots 1-20 | TẤT CẢ phải done mới unlock gửi mail PMO | Điều kiện done phức tạp |
| Critical | BR-06 blocking | User public group không view được nếu kankei chưa done | Edge case bảo mật quan trọng |
| Critical | 承認2/3 必須=× | Node optional → cần test Full Node và Not Full Node riêng biệt | 2 nhóm 大項目 trong testcase |

## 2. QnA

| # | Câu hỏi (Q) | Phạm vi ảnh hưởng | Mức độ | Giả định tạm / Ghi chú |
|---|---|---|---|---|
| Q-01 | 承認2 (上長) và 承認3 (室長) đều có 必須=× — điều này cấu hình ở đâu? Per document-type, per-instance khi tạo, hay admin config toàn hệ thống? | Test Full Node vs Not Full Node | 🔴 High | Giả định: cố định theo document type, không thay đổi per instance |
| Q-02 | 部門長 approve khi 関係者 CHƯA done → spec nói không gửi mail PMO — Status có chuyển PMO室受付待ち không, hay bị block hoàn toàn (button disabled)? | Status flow + TC-6 | 🔴 High | Template TC: status chuyển PMO室受付待ち nhưng không mail → hiểu là vẫn chuyển status |
| Q-03 | 差戻し ở 承認2/承認3 → luôn về 申請者待ち, hay về node trước đó? | Expected status sau 差戻し | 🔴 High | Spec ghi "gửi mail đến user 申請者" → giả định: luôn về 申請者待ち |
| Q-04 | 承認4/5/6 có chức năng 差戻し không? Spec không có mũi tên 差戻し tại 3 node này. | Coverage test 差戻し | 🟡 Medium | Cần confirm BA/PO |
| Q-05 | 関係者 "approve / 承認" nghĩa cụ thể là gì? Click ký duyệt hay chỉ xác nhận đã xem? "Done" = tất cả ký hay đủ số lượng tối thiểu? | Test case kankei | 🔴 High | Giả định: có button ký/đóng dấu riêng; done = tất cả 関係者 được add đã ký |
| Q-06 | 申請者 chỉ định 上長/室長/部門長/関係者 lúc tạo document hay có thể thêm/sửa sau khi submit? | TC tạo mới + edit | 🟡 Medium | Giả định: chỉ định lúc tạo, không sửa được sau submit |
| Q-07 | Nếu 申請者 chỉ định 上長 = chính mình (self-approval) → có bị chặn không? | Security/business rule | 🟡 Medium | Giả định: không chặn, approve bình thường — cần confirm |
| Q-08 | 関係者 approve theo thứ tự bất kỳ hay phải tuần tự 関係者1 → 関係者N? | Thứ tự test kankei | 🟡 Medium | Giả định: bất kỳ thứ tự, độc lập nhau |
| Q-09 | BR-06: "user thuộc public group" — public group là gì? Chỉ 関係者 chưa approve, hay tất cả user ngoài flow? | Test phân quyền view | 🔴 High | Giả định: "public group" là group chứa nhóm các user được cấu hình sẵn — cần định nghĩa rõ từ BA/PO |
| Q-10 | 引戻し — ai có quyền thực hiện? Chỉ người vừa approve, hay bất kỳ người đã approve trong chain, hay cả 申請者? | TC-15 (引戻し) | 🟡 Medium | Template TC: "Random user kéo về" → giả định: bất kỳ user nào đã approve đều có thể recall |
| Q-11 | Sau khi đạt 完了 — có thể thực hiện hành động nào không? View-only? Có 引戻し từ 完了? | Post-completion test | 🟢 Low | Giả định: read-only sau 完了 |
| Q-12 | Mail "Done" (BR-03) gửi đến ai? 申請者, user share, hay tất cả người trong flow? | Verify mail notification | 🟡 Medium | Template TC: gửi cho "申請者 và user share" |
| Q-13 | Khi từng 関係者 approve → status chính document có thay đổi không? | Status display khi test | 🔴 High | Giả định: status chính KHÔNG đổi khi 関係者 approve — chỉ đổi internal kankei counter |
| Q-14 | 編集権限 承認1 (申請者) = 〇 — 申請者 edit được suốt workflow hay chỉ khi status = 申請者待ち (sau 差戻し/nháp)? | Edit permission test | 🟡 Medium | Giả định: 申請者 chỉ edit được khi status = 申請者待ち |
| Q-15 | 関係者: tối đa 20 slot — có bắt buộc add tối thiểu bao nhiêu không? Có thể submit với 0 関係者 không? | Boundary test | 🟢 Low | Template dùng 7-8 kankei → giả định min = 0 (optional hoàn toàn) |
