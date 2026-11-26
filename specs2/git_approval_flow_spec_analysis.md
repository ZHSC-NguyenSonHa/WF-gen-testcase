# 📋 Phân Tích Requirement: GIT-APPROVAL-FLOW
## Luồng Phê Duyệt Bản Ghi App GIT (GIT発注検収申請)

---

## 1. Tổng Quan Ticket

| Mục | Nội dung |
|---|---|
| Ticket ID | GIT-APPROVAL-FLOW |
| Tên chức năng | 承認フロー / GIT発注検収申請 |
| Loại yêu cầu | Workflow approval cấu hình theo node |
| Module | App GIT -> Tạo bản ghi -> Gửi申請 -> Luồng phê duyệt |
| Ngày phân tích | 2026-08-13 |
| Nguồn phân tích | 1 ảnh workflow người dùng cung cấp + mô tả text ngắn |
| Người phân tích | Copilot / GPT-5.4 |
| Ngôn ngữ UI | Tiếng Nhật |
| Loại đầu vào | Mockup / ảnh chụp cấu hình workflow |

**Bối cảnh:**
Đây là đặc tả luồng phê duyệt cho bản ghi của app GIT. Luồng bắt đầu khi user **申請者** tạo bản ghi và bấm **申請**. Ảnh thể hiện một workflow gồm các node phê duyệt chính ở cột trái và một cụm **関係者欄** ở cột phải. Mỗi node có các thuộc tính cấu hình như người đóng dấu/phê duyệt, quyền chỉnh sửa, bắt buộc hay không, và quan hệ trả về hoặc liên kết giữa các node.

---

## 2. User Story

| # | User Story |
|---|---|
| US-01 | Là một user 申請者, tôi muốn tạo bản ghi và bấm 申請 để khởi động luồng phê duyệt chuẩn của hệ thống GIT. |
| US-02 | Là một approver ở từng node, tôi muốn chỉ nhìn thấy và xử lý bản ghi khi đến đúng node của mình. |
| US-03 | Là người cấu hình workflow, tôi muốn định nghĩa node nào bắt buộc, node nào không bắt buộc, ai là người phê duyệt và có quyền sửa hay không. |
| US-04 | Là 関係者, tôi muốn chỉ được tham gia ở đúng thời điểm mà workflow cho phép. |
| US-05 | Là hệ thống, tôi muốn chuyển bản ghi qua từng node theo thứ tự để kiểm soát phê duyệt và hoàn tất công việc. |

---

## 3. Phạm Vi Áp Dụng (Scope)

| Module / Thành phần | Mô tả | Bị ảnh hưởng |
|---|---|---|
| Màn hình tạo bản ghi | Nơi user 申請者 nhập dữ liệu và bấm 申請 | ✅ Trực tiếp |
| Engine workflow phê duyệt | Điều khiển luồng qua các node 承認欄1..6 | ✅ Trực tiếp |
| Quan hệ 関係者欄 | Tập node phụ bên phải, tối đa 20 dòng | ✅ Trực tiếp |
| Phân quyền chỉnh sửa | Quyết định node có thể edit hay chỉ approve/view | ✅ Trực tiếp |
| Thông báo / email | Gửi thông báo cho user tiếp theo khi tới node mới | ⭕ Suy ra từ workflow, chưa thấy rõ trên ảnh |
| Chức năng 差戻し | Xử lý trả bản ghi về node trước / node đích | ⭕ Có dấu hiệu trên ảnh nhưng rule chưa rõ |
| Màn hình danh sách / chi tiết bản ghi | Hiển thị trạng thái bản ghi đang ở node nào | ⭕ Liên quan gián tiếp |

---

## 4. Acceptance Criteria — Phân Tích Chi Tiết

### 4.1. Cấu trúc tổng thể của workflow

| # | Acceptance Criteria | Chi tiết |
|---|---|---|
| AC-01 | Workflow có tiêu đề tổng | Hiển thị tên workflow ở phần đầu: **GIT発注検収申請** |
| AC-02 | Workflow chia 2 cụm chính | Cụm trái là các node phê duyệt chính; cụm phải là **関係者欄** |
| AC-03 | Mỗi cụm dùng cùng một bộ cột | Các cột quan sát được: 承認欄(右端が1), 押印欄名称, 押印者, 編集権限, 必須, 備考, 差戻し |
| AC-04 | Các node chính có thứ tự dọc | Ảnh thể hiện luồng dọc từ 承認欄1 xuống 承認欄6 bằng mũi tên |
| AC-05 | Có cơ chế liên kết giữa node chính và 関係者欄 | Quan sát thấy các đường màu xanh nối giữa cụm trái và cụm phải |

### 4.2. Các node phê duyệt chính ở cột trái

| # | Node | 押印欄名称 | 押印者 | 編集権限 | 必須 | Ghi chú quan sát |
|---|---|---|---|---|---|---|
| AC-06 | 承認欄1 | 申請者 | 申請者 | ○ | ○ | Node đầu tiên gắn với người tạo đơn |
| AC-07 | 承認欄2 | 上長 | 申請者が指定 | ○ | × | Approver do người nộp chỉ định |
| AC-08 | 承認欄3 | 室長 | 申請者が指定 | × | × | Không có quyền chỉnh sửa |
| AC-09 | 承認欄4 | 部門長 | 申請者が指定 | × | ○ | Là node bắt buộc |
| AC-10 | 承認欄5 | PMO受受付 | 固定 | × | ○ | Người đóng dấu/phê duyệt là cố định |
| AC-11 | 承認欄6 | 作業完了 | 固定 | × | ○ | Node cuối của luồng chính |

### 4.3. Cụm 関係者欄 ở cột phải

| # | Acceptance Criteria | Chi tiết |
|---|---|---|
| AC-12 | Có danh sách 関係者欄 nhiều dòng | Ảnh thể hiện từ **関係者欄1** đến **関係者欄20** |
| AC-13 | Tên từng dòng là tăng dần theo số | Quan sát thấy 関係者欄1, 2, 3 ... 20 |
| AC-14 | Người đóng dấu của từng 関係者欄 là người do 申請者 chỉ định | Cột 押印者 ở toàn bộ cụm phải đều hiển thị **申請者が指定** |
| AC-15 | 関係者欄 không có quyền chỉnh sửa | Cột 編集権限 ở cụm phải đều là × |
| AC-16 | 関係者欄 không bắt buộc | Cột 必須 ở cụm phải đều là × |
| AC-17 | Các ô 備考 và 差戻し của cụm phải hiện để trống hoặc chưa cấu hình | Ảnh chưa thấy giá trị text trong các cột này |

### 4.4. Luồng bắt đầu và điều kiện khởi động

| # | Acceptance Criteria | Chi tiết |
|---|---|---|
| AC-18 | Luồng bắt đầu khi 申請者 create bản ghi | Thông tin do user mô tả rõ |
| AC-19 | Hành động khởi động là bấm 申請 | Đây là trigger chính để vào workflow |
| AC-20 | Sau khi bấm 申請, bản ghi đi vào 承認欄1 | Vì node đầu tiên là 申請者, có mũi tên xuống các node sau |

### 4.5. Quy tắc bắt buộc / không bắt buộc

| # | Quy tắc | Mô tả |
|---|---|---|
| AC-21 | Một số node trái là bắt buộc | AC quan sát được dấu ○ tại 承認欄1, 4, 5, 6 |
| AC-22 | Một số node trái không bắt buộc | AC quan sát được dấu × tại 承認欄2 và 3 |
| AC-23 | Tất cả 関係者欄 là không bắt buộc | Cột 必須 ở cụm phải đều là × |

### 4.6. Quy tắc chỉnh sửa

| # | Quy tắc | Mô tả |
|---|---|---|
| AC-24 | 申請者 có quyền chỉnh sửa tại 承認欄1 | Cột 編集権限 = ○ |
| AC-25 | 上長 có quyền chỉnh sửa tại 承認欄2 | Cột 編集権限 = ○ |
| AC-26 | Các node còn lại ở cụm trái không có quyền chỉnh sửa | 承認欄3..6 là × |
| AC-27 | Tất cả 関係者欄 không có quyền chỉnh sửa | Cột 編集権限 ở cụm phải đều là × |

### 4.7. Quy tắc người phê duyệt / người đóng dấu

| # | Quy tắc | Mô tả |
|---|---|---|
| AC-28 | Node đầu là 申請者 tự gắn với người nộp đơn | Không cần chỉ định ngoài |
| AC-29 | Một số node phụ thuộc người do 申請者 chỉ định | 上長, 室長, 部門長 và toàn bộ 関係者欄 dùng **申請者が指定** |
| AC-30 | Một số node là người cố định | PMO受受付 và 作業完了 dùng **固定** |

---

## 5. Phụ Thuộc (Dependencies)

### 5.1. Dữ liệu master role / chức danh

| Mục | Chi tiết |
|---|---|
| Role chính | 申請者, 上長, 室長, 部門長, PMO受受付, 作業完了, 関係者 |
| Nguồn dữ liệu | Cần có danh sách user/role để người nộp chọn cho các node **申請者が指定** |
| Phụ thuộc | Nếu không có user hợp lệ cho role tương ứng thì luồng không thể chạy đúng |

### 5.2. Màn hình tạo bản ghi

| Mục | Chi tiết |
|---|---|
| Trigger | Nút 申請 trên màn hình tạo / chỉnh sửa bản ghi |
| Dữ liệu truyền sang workflow | Record ID, creator, approver selections, trạng thái khởi tạo |
| Phụ thuộc | Cần lưu được các lựa chọn approver do 申請者 chỉ định |

### 5.3. Cơ chế thông báo / chuyển trạng thái

| Mục | Chi tiết |
|---|---|
| Chuyển node | Sau khi node hiện tại approve thì chuyển sang node tiếp theo phù hợp |
| Thông báo | Nhiều khả năng cần gửi mail / notification cho user ở node kế tiếp |
| Rủi ro | Ảnh không mô tả message / channel / thời điểm gửi |

---

## 6. Phân Tích Mockup/Screenshot

### 6.1. Quan sát tổng thể ảnh workflow

| Thành phần | Quan sát |
|---|---|
| Header sheet | Có chữ **承認フロー** ở góc trên trái |
| Tên workflow | Nằm giữa phía trên: **GIT発注検収申請** |
| Cụm trái | 6 node chính dạng bảng, kết nối dọc bằng mũi tên đen |
| Cụm phải | 20 dòng 関係者欄 trong một khung độc lập |
| Đường xanh | Thể hiện các liên kết ngang / luồng 差戻し hoặc mapping giữa 2 cụm |
| Các ô dấu | Dùng ký hiệu ○ / × để biểu diễn có/không |

### 6.2. Bảng cột ở cụm trái

| Cột | Ý nghĩa suy ra |
|---|---|
| 承認欄(右端が1) | Số thứ tự node / vị trí node trong workflow |
| 押印欄名称 | Tên node / tên ô phê duyệt |
| 押印者 | Ai là người xử lý node đó |
| 編集権限 | Người tại node đó có được chỉnh sửa record không |
| 必須 | Node đó có bắt buộc phải đi qua không |
| 備考 | Ghi chú bổ sung |
| 差戻し | Điểm trả về / đường trả về / mapping trả về |

### 6.3. Bảng cột ở cụm phải

| Cột | Quan sát |
|---|---|
| 承認欄(右端が1) | Dòng nào cũng là 関係者欄x |
| 押印欄名称 | Trùng với tên 関係者欄1..20 |
| 押印者 | Tất cả là 申請者が指定 |
| 編集権限 | Tất cả là × |
| 必須 | Tất cả là × |
| 備考 | Không thấy dữ liệu |
| 差戻し | Chỉ thấy ô trống và đường xanh |

### 6.4. Inconsistency / điểm chưa chắc từ ảnh

| # | Inconsistency / điểm chưa rõ | Mô tả | Mức độ |
|---|---|---|---|
| INC-01 | Chữ ở 承認欄5 chưa thật sắc nét | Có thể là **PMO受受付** hoặc biến thể gần giống | 🟡 Medium |
| INC-02 | Ý nghĩa chính xác của cột 差戻し chưa rõ | Chỉ thấy đường xanh, chưa thấy text rule | 🔴 High |
| INC-03 | Quan hệ nối giữa cụm trái và phải chưa có chú thích | Không rõ node nào mở/đóng từng 関係者欄 | 🔴 High |

---

## 7. Các Điểm Mơ Hồ & Rủi Ro

### 7.1. Điểm Mơ Hồ (Ambiguities)

| # | Câu hỏi | Nguy cơ | Mức độ |
|---|---|---|---|
| AMB-01 | Thứ tự thực thi chính xác của 承認欄1..6 là tuần tự tuyệt đối hay có nhảy cóc khi node không bắt buộc? | Test sai flow happy path và alternate path | 🔴 High |
| AMB-02 | Với node không bắt buộc (必須 = ×), hệ thống tự skip, cho người dùng skip, hay chỉ dùng khi có approver được chọn? | Không xác định được coverage cho optional node | 🔴 High |
| AMB-03 | Ý nghĩa chính xác của cột **差戻し** là gì? Trả về node trước, trả về node chỉ định, hay chỉ là mapping đường nối? | Không thể xác định luồng reject/return | 🔴 High |
| AMB-04 | Khi node hiện tại reject / 差戻し thì record quay về node nào? Có nhiều đích trả về không? | Bỏ sót các state transition quan trọng | 🔴 High |
| AMB-05 | Các user **申請者が指定** được chọn ở bước nào: trước khi bấm 申請, hay hệ thống tự suy từ org chart? | Thiếu logic cho màn hình nhập liệu | 🔴 High |
| AMB-06 | Điều kiện để chọn 上長, 室長, 部門長 có ràng buộc role đúng danh mục hay chọn bất kỳ user nào? | Phân quyền sai, test data sai | 🟡 Medium |
| AMB-07 | 関係者欄1..20 tham gia ở thời điểm nào? Trước node 2, song song, hay sau các node cụ thể? | Không rõ luồng view/approve của 関係者 | 🔴 High |
| AMB-08 | 関係者 có quyền gì ngoài view/approve? Ảnh chỉ thể hiện không edit, nhưng không rõ có approve hay chỉ xác nhận | Sai phạm vi testcase | 🔴 High |
| AMB-09 | Khi user không thuộc node hiện tại truy cập bản ghi thì hệ thống hiển thị thế nào? Hidden, read-only, hay báo lỗi? | Không cover được permission negative cases | 🟡 Medium |
| AMB-10 | Node **作業完了** là một node phê duyệt thực sự hay trạng thái hệ thống sau khi workflow xong? | Sai mô hình state cuối | 🟡 Medium |
| AMB-11 | Node **PMO受受付** có ý nghĩa business cụ thể gì? Là review, reception, hay approval trung gian? | Expected result không chính xác | 🟡 Medium |
| AMB-12 | Có cho phép rollback nhiều lần hay chỉ một lần trên cùng record? | Thiếu edge cases chuỗi 差戻し liên tiếp | 🟡 Medium |
| AMB-13 | Có thông báo/email gửi cho user tiếp theo khi qua node không? | Không rõ dependency tích hợp | 🟡 Medium |
| AMB-14 | Có điều kiện kết thúc sớm workflow nếu optional nodes đều bỏ qua không? | State done có thể sai | 🟡 Medium |
| AMB-15 | “右端が1” trong tiêu đề cột 承認欄 nghĩa chính xác là gì? | Có thể ảnh hưởng cách đánh số node khi map dữ liệu | 🟢 Low |

### 7.2. Rủi Ro Kiểm Thử

| # | Rủi ro | Mô tả | Mitigation |
|---|---|---|---|
| RISK-01 | Workflow phụ thuộc cấu hình role | Nếu master role/user không đúng, toàn bộ flow phê duyệt sai | Cần data setup rõ cho từng node |
| RISK-02 | Optional node gây hiểu nhầm | Node không bắt buộc dễ bị hiểu là luôn skip hoặc luôn phải đi qua | Test riêng 2 mode: có chọn approver và không chọn approver |
| RISK-03 | 差戻し chưa rõ rule | Đây thường là nguồn bug lớn nhất trong workflow | Clarify với BA/Dev trước khi viết test case |
| RISK-04 | Permission theo node dễ lệch | Người không đúng node có thể view hoặc edit sai quyền | Test matrix theo role x node |
| RISK-05 | Quan hệ 関係者欄 nhiều dòng | Tối đa 20 dòng tạo nguy cơ lỗi UI, lưu dữ liệu, và notify | Test boundary với 0, 1, nhiều và 20 関係者 |
| RISK-06 | Người do 申請者 chỉ định có thể chọn sai | Nếu không validate role đúng, workflow có thể đi sai người | Yêu cầu clarify constraint chọn user |
| RISK-07 | Node fixed user là điểm nghẽn | Nếu user 固定 nghỉ việc / disable account, workflow có thể bị kẹt | Cần rule fallback hoặc monitoring |

---

## 8. Ma Trận Trạng Thái (nếu applicable)

| Trạng thái / Node hiện tại | Người xử lý chính | Có thể edit | Bắt buộc | Hành vi kế tiếp suy ra |
|---|---|---|---|---|
| Draft trước khi申請 | 申請者 | Có | — | Người tạo nhập dữ liệu và bấm 申請 |
| 承認欄1 | 申請者 | ○ | ○ | Chuyển xuống 承認欄2 |
| 承認欄2 | 上長 | ○ | × | Có thể chuyển 承認欄3 hoặc skip theo rule chưa rõ |
| 承認欄3 | 室長 | × | × | Có thể chuyển 承認欄4 hoặc skip theo rule chưa rõ |
| 承認欄4 | 部門長 | × | ○ | Sau approve chuyển 承認欄5 |
| 承認欄5 | PMO受受付 | × | ○ | Sau approve chuyển 承認欄6 |
| 承認欄6 | 作業完了 | × | ○ | Kết thúc workflow hoặc chuyển sang done status |
| 関係者欄1..20 | 申請者 chỉ định | × | × | Chưa rõ tham gia song song hay tuần tự |
| 差戻し | Chưa rõ | Chưa rõ | Chưa rõ | Trả record về node đích theo mapping chưa rõ |

---

## 9. Tóm Tắt Acceptance Criteria (Checklist)

- [ ] Có 6 node chính ở cột trái
- [ ] Có tối đa 20 関係者欄 ở cột phải
- [ ] Luồng bắt đầu khi 申請者 create record và bấm 申請
- [ ] Node 1 gắn với 申請者
- [ ] Node 2, 3, 4 dùng approver do 申請者 chỉ định
- [ ] Node 5 và 6 dùng user cố định
- [ ] Chỉ node 1 và 2 có 編集権限 = ○
- [ ] Node 1, 4, 5, 6 là bắt buộc
- [ ] Node 2, 3 là không bắt buộc
- [ ] Tất cả 関係者欄 là không bắt buộc
- [ ] Tất cả 関係者欄 không có quyền chỉnh sửa
- [ ] Có quan hệ nối giữa node chính và cụm 関係者欄
- [ ] Có cột 差戻し cần được đặc tả thêm

---

## 10. Khuyến Nghị Cho Kiểm Thử

1. Clarify ngay rule của **差戻し** trước khi viết test case vì đây là nhánh dễ phát sinh bug nhất.
2. Tách testcase theo 2 nhóm lớn: **Full node** và **Required-only** để bám đúng cách cấu hình trên ảnh.
3. Dựng test matrix theo chiều **role x node x quyền** để không bỏ sót permission negative cases.
4. Ưu tiên kiểm tra logic với các node **申請者が指定** vì đây là chỗ dễ sai dữ liệu và sai định tuyến approver.
5. Kiểm tra boundary cho **関係者欄** với số lượng 0, 1, nhiều dòng, và 20 dòng.
6. Kiểm tra việc người không thuộc node hiện tại có thể xem/edit/approve record hay không.
7. Kiểm tra nhánh skip cho node không bắt buộc để xác nhận hệ thống tự skip hay phụ thuộc lựa chọn thực tế.
8. Kiểm tra trạng thái cuối sau **作業完了**: record đóng hẳn, chuyển trạng thái done, hay còn bước hậu xử lý.
9. Nếu có email/notification, xác nhận thời điểm gửi khi record chuyển node.
10. Chuẩn bị bộ dữ liệu user test cố định cho từng role: 申請者, 上長, 室長, 部門長, PMO, 関係者.
