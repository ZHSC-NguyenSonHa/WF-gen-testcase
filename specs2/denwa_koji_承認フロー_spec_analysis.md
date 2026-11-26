# 📋 Phân Tích Spec: 電話工事依頼書 — 承認フロー

## 1. Tổng Quan Phân Tích Spec

| Loại | Mục | Nội dung | Ý hiểu / Ghi chú |
|---|---|---|---|
| Tổng quan | Tên document | 電話工事依頼書 | Telephone Construction Request |
| Tổng quan | Loại spec | Workflow phê duyệt nhiều node (承認フロー) | 6 node: 申請者 → 上長 → 部門長 → 受付 → 承認 → 完了 |
| Tổng quan | Ghi chú đặc biệt | Không có 関係者 (Kankeisha) | Workflow chỉ gồm các node trong chuỗi phê duyệt chính, không có người xác nhận bên ngoài |
| Node 承認欄1 | 押印欄名称: 申請者 | 押印者: 申請者 / 編集権限: ○ / 必須: ○ / 差戻し: × | Người tạo document tự ký (set theo user login). Không có 差戻し tại node này. Bắt buộc. |
| Node 承認欄2 | 押印欄名称: 上長 | 押印者: 申請者が指定 / 編集権限: × / 必須: × / 差戻し: ○ | KHÔNG bắt buộc → có thể skip (Not Full Node). Người nộp tự chỉ định 上長. Có 差戻し → về 申請者待ち. |
| Node 承認欄3 | 押印欄名称: 部門長 | 押印者: 申請者が指定 / 編集権限: × / 必須: ○ / 差戻し: ○ | Bắt buộc. Người nộp tự chỉ định 部門長. Có 差戻し → về 申請者待ち. |
| Node 承認欄4 | 押印欄名称: 受付 | 押印者: アプリケーション画面から取得 / 編集権限: ○ / 必須: ○ / 差戻し: ○ | Bắt buộc. User lấy từ app config. Đặc biệt: có quyền địnhều (編集権限=○) trước khi ký. |
| Node 承認欄5 | 押印欄名称: 承認 | 押印者: アプリケーション画面から取得 / 編集権限: × / 必須: ○ / 差戻し: ○ | Bắt buộc. User lấy từ app config. Không có quyền edit. |
| Node 承認欄6 | 押印欄名称: 完了 | 押印者: アプリケーション画面から取得 / 編集権限: × / 必須: ○ / 差戻し: ○ | Node cuối — khi approve → Status = 完了. Gửi mail done. |
| Status Flow | Bước 0 | 申請者 tạo + ký (Node1) → 上長待ち | Full Node: tiếp theo là 上長. Not Full Node (skip 上長): nhảy thẳng → 部門長待ち |
| Status Flow | Bước 1 | 上長 ký (Node2) → 部門長待ち | Optional node |
| Status Flow | Bước 2 | 部門長 ký (Node3) → 受付待ち | Bắt buộc |
| Status Flow | Bước 3 | 受付 ký (Node4) → 承認待ち | 受付 có thể edit document trước khi ký (編集権限=○) |
| Status Flow | Bước 4 | 承認 ký (Node5) → 完了待ち | Bắt buộc |
| Status Flow | Bước 5 | 完了 ký (Node6) → 完了 (Done) | Gửi mail done |
| Business Rule | BR-01 | 承認: gửi mail 承認 đến node tiếp theo | Nguồn: ghi chú cuối ảnh spec |
| Business Rule | BR-02 | 差戻し: gửi mail 差戻し đến user 申請者 | Tất cả node có mũi tên quay lại trong spec → giả định tất cả 6 node đều có 差戻し |
| Business Rule | BR-03 | Gửi mail 連絡 đến user 申請者 khi các user node bấm button 連絡先 | Chức năng đặc biệt ngoài flow chính |
| Business Rule | BR-04 | Done bản ghi thì gửi mail done | Node6 (完了) approve → trigger mail done |
| Critical | Node2 上長 必須=× | Node optional → cần test Full Node và Not Full Node riêng biệt | 2 nhóm 大項目 trong testcase |
| Critical | Node4 受付 編集権限=○ | 受付 có quyền edit trước khi ký — cần test: edit xong rồi ký OK | Edge case quan trọng |
| Critical | BR-03 連絡先 button | Chức năng gửi mail riêng ngoài flow chính — cần test riêng | Chưa rõ button xuất hiện ở status nào |

## 2. QnA

| # | Câu hỏi (Q) | Phạm vi ảnh hưởng | Mức độ | Giả định tạm / Ghi chú |
|---|---|---|---|---|
| Q-01 | 上長 (Node2) 必須=× — đây là cấu hình cố định theo loại document hay người dùng có thể bật/tắt per instance khi tạo? | Test Full Node vs Not Full Node | 🔴 High | Giả định: cố định theo document type |
| Q-02 | 差戻し — tất cả node từ Node2 đến Node6 đều có thể 差戻し về 申請者待ち không? Hay chỉ một số node? | Coverage test 差戻し | 🔴 High | Spec có mũi tên 差戻し quay lại ở cả 6 hàng → giả định: tất cả node đều có 差戻し |
| Q-03 | 受付 (Node4) 編集権限=○ — edit được trường nào? Toàn bộ document hay chỉ các trường nhất định? | TC Node4 edit + ký | 🔴 High | Chưa rõ phạm vi edit — cần confirm BA/PO |
| Q-04 | Button 連絡先 — xuất hiện ở những status nào? Chỉ cho user thuộc các node đang active, hay cả 申請者? | TC BR-03 | 🟡 Medium | Chưa rõ — cần confirm |
| Q-05 | Mail done gửi đến ai? Chỉ 申請者 hay cả 上長, 部門長, tất cả trong flow? | Verify mail notification | 🟡 Medium | Giả định: gửi cho 申請者 + user share (tương tự các workflow khác) |
| Q-06 | 引戻し — có chức năng không? Ai có quyền thực hiện? Chỉ người vừa ký hay tất cả user đã ký? | TC 引戻し | 🟡 Medium | Không rõ trong spec — cần confirm |
| Q-07 | 取止め — khi nào áp dụng? Chỉ khi status = save nháp / 申請者待ち hay có thể hủy ở bất kỳ status nào? | TC 取止め | 🟡 Medium | Giả định: chỉ áp dụng khi status = save nháp hoặc 申請者待ち |
| Q-08 | Status exact names — tên chính xác của từng status? VD: 上長待ち, 部門長待ち, 受付待ち, 承認待ち, 完了待ち, 完了? | Viết Output TC chính xác | 🔴 High | Cần lấy từ app — không nên suy đoán |
| Q-09 | 押印者 của Node4/5/6 = アプリケーション画面から取得 — user cố định từ config hệ thống hay động theo bộ phận? | TC setup data | 🟡 Medium | Giả định: cố định toàn hệ thống hoặc theo bộ phận — cần confirm |
| Q-10 | Node1 申請者 — 押印 tự động set khi submit hay user phải bấm ký thủ công trước khi submit? | TC tạo mới | 🔴 High | Giả định: tự động ký khi 申請者 bấm Submit |
| Q-11 | Khi 差戻し — status về 申請者待ち — 申請者 có thể edit lại toàn bộ hay chỉ một số trường? | TC 差戻し + re-submit | 🟡 Medium | Giả định: edit được toàn bộ rồi re-submit |
| Q-12 | Sau khi đạt 完了 — có thể thực hiện hành động nào không? View-only? Có 引戻し từ 完了 không? | Post-completion test | 🟢 Low | Giả định: read-only sau 完了 |