---
name: skill-format-testcase
description: 'Skill chuẩn hóa file kết quả manual testcase dạng Excel: thêm sheet Summary, tách GUI và Logic, chia quan điểm test đúng theo từng mục trong spec, merge Test Object trùng theo cụm, và bám format file mẫu Push. Use when user asks format testcase file, chia quan điểm test, thêm summary sheet, hoặc chuẩn hóa output Excel test case.'
argument-hint: 'Đường dẫn spec, sheet cần đọc, thư mục output, file mẫu tham chiếu, version/release'
---

# Skill Format Testcase

## Mục tiêu

Skill này đóng gói workflow chuẩn để tạo hoặc chuẩn hóa file kết quả testcase manual theo format QA team đã thống nhất:

- Có sheet Summary theo mẫu đã dạy
- Tách sheet GUI và sheet Logic
- Sheet Logic phải chia đúng theo từng mục/quan điểm đã đánh số trong spec
- Test Object trùng được merge theo từng cụm để file gọn, không duplicate, không rối
- Step phải chi tiết, không viết gộp
- Bám phong cách file mẫu Push khi trình bày testcase

---

## Khi nào sử dụng

Sử dụng skill này khi user yêu cầu:

- format file kết quả testcase
- chia quan điểm testcase theo spec
- thêm sheet Summary vào file testcase
- chuẩn hóa output Excel test case
- tạo file testcase GUI và Logic
- merge Test Object bị trùng
- run lệnh Copy-Item -Path "C:\Users\Z03479\Desktop\manual_test\Q\Q\Test Result\1.0.0(Thư viện)\App\Base noti\【APP】_Push.xlsx" -Destination "C:\Users\Z03479\Desktop\manual_test\Q\Q\Test Result\7.4.0" -Force; Test-Path "C:\Users\Z03479\Desktop\manual_test\Q\Q\Test Result\7.4.0\【APP】_Push.xlsx"
- tạo testcase Excel theo style QA team

Ví dụ trigger:

- "format file testcase này theo mẫu đã dạy"
- "thêm sheet summary cho file testcase"
- "chia logic theo đúng 4 mục trong spec"
- "duplicate file `Q/Test Result/1.0.0(Thư viện)/App/Base noti/【APP】_Push.xlsx` để lấy template format rồi fill dữ liệu testcase vào"
- "merge Test Object để đỡ duplicate"

---

## Input tối thiểu cần có

1. Đường dẫn file spec hoặc requirement
2. Tên sheet cần đọc nếu là Excel
3. Thư mục output
4. File mẫu tham chiếu nếu có
5. Tên file output mong muốn hoặc version/release

Nếu thiếu một trong các mục trên:

- Hỏi lại user nếu thiếu thông tin đầu ra quan trọng
- Nếu không có file mẫu, dùng format QA team đã được dạy gần nhất trong repo

---

## Quy tắc cốt lõi

### 1. Bám spec trước, không bẻ cấu trúc

- Đọc kỹ spec trước khi tạo testcase
- Không tự chia module theo suy luận riêng nếu spec đã chia mục rõ ràng
- Nếu spec có 4 mục logic thì sheet Logic phải chia đúng 4 section tương ứng
- Tên section nên bám wording trong spec, chỉ chỉnh nhẹ để rõ nghĩa hơn khi cần

### 2. Tách GUI và Logic rõ ràng

Sheet GUI chỉ chứa:

- layout
- label
- title/message
- trạng thái hiển thị UI
- style, vị trí, icon, button, font, màu sắc

Sheet Logic chỉ chứa:

- điều kiện hiển thị
- hành vi khi thao tác
- điều hướng
- luồng nghiệp vụ
- thứ tự ưu tiên
- rule chỉ hiển thị một lần
- các logic đặc biệt có căn cứ từ spec

Không trộn GUI assertions vào cụm Logic nếu chúng không phục vụ rule nghiệp vụ.

### 3. Chia quan điểm test theo spec

Trong sheet Logic:

- Mỗi section tương ứng với một mục trong spec
- Mỗi section có tiêu đề riêng dạng viewpoint/quan điểm test
- Không gom nhiều mục spec khác nhau vào cùng một section chỉ để gọn hơn
- Nếu một mục spec có nhiều nhánh, chia thành nhiều testcase bên trong cùng section đó

### 4. Merge Test Object đúng cách

- Nếu nhiều testcase liên tiếp dùng cùng một Test Object trong cùng một cụm section, merge Test Object thành một ô
- Chỉ merge trong phạm vi cùng cụm quan điểm
- Không merge xuyên section
- Mục tiêu là giảm duplicate nhưng vẫn giữ dễ đọc

### 5. Step phải chi tiết

Không viết gộp kiểu:

- "Thực hiện thao tác và kiểm tra kết quả"
- "Mở màn hình rồi xác nhận đúng"

Thay vào đó, phải tách rõ:

1. Điều kiện
2. Các bước thao tác tuần tự
3. Kỳ vọng tương ứng

Ví dụ đúng — Steps:

1. Đăng nhập thành công
2. Điều hướng tới Home
3. Trigger điều kiện popup
4. Quan sát popup

Expected:

1. Popup hiển thị trên Home
2. Title/message đúng spec
3. Badge/chấm tròn hiển thị đúng vị trí

### 6. Summary là bắt buộc khi làm file kết quả chuẩn

Sheet Summary cần:

- bám template QA team đang dùng
- có thông tin function name
- creator
- create date
- tham chiếu tới sheet GUI và Logic
- giữ format tổng quan giống file mẫu

Nếu có template Summary trong file mẫu:

- ưu tiên copy style/merge/formula từ template
- chỉ override phần title, owner, sheet reference và metadata cần đổi

### 7. Bám phong cách file mẫu Push

Khi có file mẫu Push:

- học cách chia viewpoint
- học cách merge Test Object/Sub Test Object
- bám thứ tự cột và nhịp trình bày
- tránh duplicate row khiến file dài nhưng khó đọc

Không copy nguyên nội dung nghiệp vụ từ file mẫu; chỉ dùng mẫu làm chuẩn format và tư duy chia testcase.

---

## Quy trình thực hiện

### Bước 1. Recon spec

1. Đọc spec gốc
2. Xác định phần nào là GUI, phần nào là Logic
3. Liệt kê các mục logic đã đánh số trong spec
4. Xác định output structure: Summary, GUI, Logic

### Bước 2. Chốt cấu trúc sheet

Mặc định file chuẩn gồm:

1. Summary
2. `<Feature>_GUI`
3. `<Feature>_LOGIC`

- Nếu user yêu cầu chỉ 2 sheet thì chỉ tạo GUI + Logic.
- Nếu user yêu cầu có Summary, đưa Summary về đầu workbook.

### Bước 3. Thiết kế GUI cases

1. Tạo các nhóm GUI theo layout, title/message, button/icon, text theo brand nếu có
2. Step phải cụ thể theo thao tác quan sát/đối chiếu UI
3. Group các testcase cùng Test Object để merge cho gọn

### Bước 4. Thiết kế Logic cases theo quan điểm

1. Tạo từng section bám đúng từng mục trong spec
2. Với mỗi section, tạo testcase theo:
   - happy path
   - alternate path
   - negative path nếu spec có căn cứ
   - edge case trực tiếp liên quan nếu spec gợi ý
3. Viết step cụ thể, không gộp thao tác và verify
4. Merge Test Object trong cùng cụm section nếu bị lặp

### Bước 5. Chuẩn hóa Summary

1. Dùng template Summary đã dạy hoặc copy từ file mẫu
2. Điền tên function/feature
3. Điền creator, ngày tạo
4. Gắn reference tới GUI và Logic sheet
5. Giữ merge/style/formula tương thích template nếu có

### Bước 6. Validation output

Trước khi chốt file, kiểm tra:

1. Có đúng số sheet user yêu cầu không
2. Summary có nằm đúng vị trí đầu không
3. Sheet Logic có đúng số section theo spec không
4. Section title có bám mục spec không
5. Step đã chi tiết hay còn câu gộp
6. Có duplicate Test Object gây rối không
7. GUI và Logic có bị trộn nội dung không
8. Tên file output có đúng release/version user yêu cầu không

---

## Completion Criteria

Chỉ coi là hoàn tất khi đáp ứng đủ:

1. File kết quả được tạo đúng thư mục output
2. Có Summary nếu user yêu cầu hoặc format chuẩn cần có
3. GUI và Logic được tách riêng rõ ràng
4. Logic chia đúng theo từng mục trong spec
5. Test Object trùng đã merge theo từng cụm quan điểm
6. Step cụ thể, không gộp
7. Workbook mở được và có đúng sheet name

---

## Prompt mẫu để tái sử dụng

```text
Hãy tạo file testcase manual từ spec tôi cung cấp và bắt buộc tuân thủ format QA team như sau:

- File output phải có sheet Summary, GUI và Logic
- Sheet Logic phải chia đúng theo từng mục đã đánh số trong spec, không tự gom nhóm khác đi
- Sheet GUI chỉ chứa testcase về layout, text, label, button, style, trạng thái hiển thị UI
- Step phải viết cụ thể từng bước, không viết gộp
- Test Object trùng thì merge theo từng cụm quan điểm để tránh duplicate và rối file
- Bám format file mẫu Push về cách chia quan điểm và trình bày
- Summary phải theo đúng format đã dạy

Đầu vào:
- Spec: <path>
- Sheet: <sheet name>
- Output: <folder/file>
- Template tham chiếu: <path>
```

---

## Gợi ý triển khai trong repo này

- Nếu đầu ra là Excel, ưu tiên tái sử dụng script trong `scripts/convert_excel/`
- Nếu đã có generator gần giống, sửa generator hiện có thay vì viết lại từ đầu
- Nếu file đích bị khóa, tạo file fallback mới có suffix ngày giờ để user dùng ngay
