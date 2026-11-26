# Manual Testcases RBT - zscan Scan Claim

## 1) Ambiguities da giai quyet

| ID | Noi dung | Ket luan chot |
|---|---|---|
| Q1 | Scope claim co bao gom waiting hay khong | Bao gom ca 2 luong claim + waiting |
| Q2 | Bao phu diem vao | Test du 3 diem vao: Home, Rank, push/deeplink |
| Q3 | Chon Dang nhap tu popup chua login | Sau login can tu xu ly tiep QR vua quet |
| Q4 | Session expired 401 giua luong | Hien loi chung, khong auto nav login |
| Q5 | Silent mode beep/rung | Silent co the khong beep, nhung van phai rung |
| Q6 | Mat mang dung luc dispatch ket qua | Bat buoc test va coi la edge case trong scope |
| Q7 | Thiet bi test | Android that + iOS that |

## 2) Traceability Matrix

| REQ ID | Mo ta yeu cau | Module | Risk | Scenarios |
|---|---|---|---|---|
| REQ-01 | Entry points va mode routing | Entry Routing | Medium | S01-S03 |
| REQ-02 | Camera permission lifecycle | Camera Permission | Medium | S04-S07 |
| REQ-03 | QR detect feedback | Detection Feedback | Medium | S08-S09 |
| REQ-04 | Claim QR validation | Claim Validation | High | S10-S12 |
| REQ-05 | Auth gate claim | Claim Auth | High | S13-S15 |
| REQ-06 | Claim API error handling | Claim API | High | S16-S20 |
| REQ-07 | Waiting validation + cross-mode | Waiting Validation | Medium | S21-S25 |
| REQ-08 | Network edge at result dispatch | Result Dispatch | High | S26 |

## 3) Markdown Testcase Table (Preview)

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data |
|---|---|---|---|---|---|---|---|---|
| SCAN_TC_001 | Entry UI | Medium | Home entry title and instruction | App da dang nhap, mo Home | 1. Bam icon Scan tren Home<br>2. Quan sat title va guide | Title/guide mode Home dung spec | Medium | Device iOS/Android |
| SCAN_TC_002 | Entry UI | Medium | Rank entry title and instruction | App da dang nhap, mo tab Rank | 1. Bam the member de vao Scan<br>2. Quan sat title va guide | Title/guide mode Rank dung spec | Medium | Device iOS/Android |
| SCAN_TC_003 | Camera Permission UI | Medium | Dialog xin quyen camera lan dau | App chua cap camera permission | 1. Mo Scan<br>2. Quan sat dialog he thong | Dialog permission hien thi dung text va options | Medium | Permission state = first launch |
| SCAN_TC_004 | Camera Preview UI | Medium | Khung ngam QR hien thi dung | Camera da duoc cap quyen | 1. Mo Scan<br>2. Quan sat preview va khung ngam | Preview camera on, khung ngam hien thi ro rang | Medium | Permission = granted |
| SCAN_TC_005 | Claim Popup UI | High | Popup chua login co Dong/Dang nhap | User chua login | 1. Quet QR RJP hop le<br>2. Quan sat popup | Popup login required hien thi 2 nut Dong va Dang nhap | High | QR = RJP1234567890 |
| SCAN_TC_006 | Claim Popup UI | High | Popup loi mang/server co Retry/Huy | User da login | 1. Kich hoat loi mang hoac 503<br>2. Quan sat popup | Popup hien dung thong diep va co Retry/Huy | High | API mock 503/no network |
| SCAN_TC_007 | Waiting Mode UI | Medium | Waiting mode title and guideline | User mo tu Home | 1. Vao waiting mode<br>2. Quan sat title/text | Title waiting va huong dan dung spec | Medium | Device iOS/Android |
| SCAN_TC_008 | Entry Routing | Medium | Home + QR claim route dung luong claim | Da login, da cap camera | 1. Mo scan tu Home<br>2. Quet QR RJP hop le | Route claim thanh cong, dispatch ve Home context | High | RJP_VALID_0001 |
| SCAN_TC_009 | Entry Routing | Medium | Rank + QR claim route ve Rank | Da login, da cap camera | 1. Mo scan tu Rank<br>2. Quet QR RJP hop le | Claim xong chi refresh diem/hang o Rank, khong dialog them | High | RJP_VALID_0002 |
| SCAN_TC_010 | Entry Routing | Medium | Push/deeplink + QR claim route nhu Home | Da login, app mo tu push/deeplink | 1. Mo scan qua push/deeplink<br>2. Quet QR RJP hop le | Dispatch ket qua theo hanh vi Home context | High | RJP_VALID_0003 |
| SCAN_TC_011 | Camera Permission | Medium | First-time allow mo camera ngay | Chua cap quyen camera | 1. Mo scan<br>2. Chon Allow | Camera khoi dong, vao scan state | Medium | Permission allow |
| SCAN_TC_012 | Camera Permission | Medium | Deny roi cap lai trong settings | Da deny quyen 1 lan | 1. Bam Settings in-app<br>2. Cap quyen trong OS<br>3. Quay lai app | App recheck onResume, camera hoat dong | Medium | Permission deny->grant |
| SCAN_TC_013 | Camera Permission | Medium | Never ask again xu ly an toan | Da deny vinh vien | 1. Mo scan<br>2. Bam Settings<br>3. Khong cap quyen va quay lai | Van o man yeu cau quyen, app khong crash | Medium | Permission never ask again |
| SCAN_TC_014 | Camera Permission | Medium | Thu hoi quyen khi app nen | Dang scan binh thuong | 1. Dua app nen va thu hoi quyen<br>2. Mo lai scan | Man scan dong gracefull, khong crash | High | Permission revoked in background |
| SCAN_TC_015 | Detection Feedback | Medium | Detect QR co beep + rung | Device normal mode | 1. Quet QR claim hop le | Co beep va rung, camera dung scan lap | Medium | RJP_VALID_0101 |
| SCAN_TC_016 | Detection Feedback | Medium | Silent mode van rung | Device bat silent mode | 1. Quet QR claim hop le | Beep co the khong co, rung van phai co | Medium | RJP_VALID_0102 |
| SCAN_TC_017 | Claim Validation | High | QR rong/khong RJP | Camera dang scan claim mode | 1. Quet payload rong hoac ABC... | Bao loi QR khong hop le, camera restart 1s | High | Payload = ""; payload = ABC123 |
| SCAN_TC_018 | Claim Validation | High | QR RJP dai >71 ky tu | Camera dang scan claim mode | 1. Quet payload RJP >71 | Bao loi receipt khong hop le, camera restart 1s | High | RJP + 72 chars |
| SCAN_TC_019 | Claim Validation | High | QR dac biet nhieu RJP parse amount= | Camera dang scan claim mode | 1. Quet payload co nhieu RJP + amount=<token> | Parse dung theo amount= va tiep tuc claim | High | URL...RJP...amount=RJP_FINAL |
| SCAN_TC_020 | Claim Auth | High | Chua login chon Dong | Chua login | 1. Quet QR RJP hop le<br>2. Chon Dong | Khong goi API, camera tiep tuc scan | High | RJP_VALID_0201 |
| SCAN_TC_021 | Claim Auth | High | Chua login chon Dang nhap | Chua login | 1. Quet QR RJP hop le<br>2. Chon Dang nhap<br>3. Login thanh cong | Tu xu ly tiep QR vua quet, khong bat quet lai | Critical | RJP_VALID_0202 + account valid |
| SCAN_TC_022 | Claim Auth | High | Session expired 401 giua luong | Token het han | 1. Quet QR RJP hop le<br>2. API tra 401 | Hien loi chung/loi server, OK de quay lai scan, khong auto nav login | High | API 401 |
| SCAN_TC_023 | Claim API | High | 200 + data | Da login | 1. Quet QR RJP hop le<br>2. API tra 200 co data | Dong scan, vao ket qua claim thanh cong | Critical | API 200 data |
| SCAN_TC_024 | Claim API | High | 200 khong data | Da login | 1. Quet QR RJP hop le<br>2. API tra 200 nhung khong data | Hien popup loi mac dinh + Retry/Huy | High | API 200 empty |
| SCAN_TC_025 | Claim API | High | API 503 tam thoi | Da login | 1. Quet QR RJP hop le<br>2. API tra 503 | Popup loi tam thoi + Retry/Huy | High | API 503 |
| SCAN_TC_026 | Claim API | High | API 500/-108 | Da login | 1. Quet QR RJP hop le<br>2. API tra 500 hoac -108 | Popup loi server + Retry/Huy | High | API 500; API -108 |
| SCAN_TC_027 | Claim API | High | Khong mang + retry rule | Da login | 1. Tat mang va quet QR RJP<br>2. Bam Retry<br>3. Thu voi QR khong RJP | Retry chi gui lai cho RJP; QR khong RJP bao loi invalid | High | RJP_VALID_0301; ABC_INVALID_01 |
| SCAN_TC_028 | Waiting Validation | Medium | Waiting QR 40/41 hop le | Waiting mode, chua co ve cho | 1. Quet waiting URL co qr= 40/41 | Extract dung, tra chuoi ve man hinh waiting caller | Medium | URL...qr=123456...(40/41) |
| SCAN_TC_029 | Waiting Validation | Medium | >41 + ZNV decode pass/fail | Waiting mode dang mo | 1. Quet payload ZNV decode pass<br>2. Quet payload ZNV decode fail | Pass thi xu ly tiep; fail thi bao loi waiting invalid | Medium | ZNV_ENC_VALID; ZNV_ENC_BROKEN |
| SCAN_TC_030 | Waiting Validation | Medium | Store code khong match config | Waiting mode dang mo | 1. Quet waiting QR co store code la | Tu choi QR va bao loi waiting invalid | Medium | StoreCode=99999999 |
| SCAN_TC_031 | Waiting Validation | Medium | Dang co active waiting ticket | Dang co ve cho con hieu luc | 1. Quet waiting QR hop le | Khong tao ve moi, hien thong bao da co ve cho | Medium | Waiting ticket active |
| SCAN_TC_032 | Cross Mode Routing | Medium | Waiting mode quet nham RJP claim | Waiting mode mo tu Home | 1. Quet QR RJP hop le | Tu dong route sang claim flow, khong bao loi waiting | High | RJP_VALID_0401 |
| SCAN_TC_033 | Result Dispatch | High | Mat mang dung luc dong scan dispatch ket qua | Home/push context, detect vua xong | 1. Ngat mang ngay luc scan dong de dispatch | Chi hien loi khong ket noi, khong xu ly ket qua vua quet | Critical | Network off at dispatch timing |
