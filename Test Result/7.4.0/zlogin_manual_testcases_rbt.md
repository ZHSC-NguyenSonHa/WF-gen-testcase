| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data |
|---|---|---|---|---|---|---|---|---|
| ZLOGIN_TC_001 | GUI/Login Screen | Medium | Hien thi layout tong the man hinh login | Mo man hinh xac thuc email | 1. Quan sat tieu de va cac thanh phan chinh | UI day du: email, checkbox, nut gui ma | Medium | N/A |
| ZLOGIN_TC_002 | GUI/Login Screen | Low | Kiem tra text/label theo spec | Mo man hinh xac thuc email | 1. Doi chieu text tieu de/thong bao voi spec | Text dung noi dung, khong vo font/encoding | Low | N/A |
| ZLOGIN_TC_003 | GUI/Email Input | Low | Hien thi va focus o nhap email | Mo man hinh xac thuc email | 1. Tap o email 2. Nhap 1 ky tu | O email focus dung, hien thi text ro rang | Low | email: a |
| ZLOGIN_TC_004 | GUI/Consent | Low | Hien thi checkbox va link dieu khoan/chinh sach | Mo man hinh xac thuc email | 1. Quan sat checkbox 2. Tap link dieu khoan/chinh sach | Checkbox hien thi dung, link mo dung noi dung | Low | N/A |
| ZLOGIN_TC_005 | GUI/Send OTP | Medium | Trang thai UI cua nut gui OTP | Mo man hinh xac thuc email | 1. De rong 2. Nhap email hop le + tick checkbox | Nut bi khoa khi chua du dieu kien, kich hoat khi du | Medium | user01@domain.com |
| ZLOGIN_TC_006 | GUI/OTP Screen | Low | Hien thi 4 o OTP va huong dan | Da vao man hinh OTP | 1. Quan sat 2. Nhap 4 so | 4 o OTP hien thi dung, focus chuyen dung | Low | OTP: 1234 |
| ZLOGIN_TC_007 | GUI/OTP Screen | Medium | Hien thi countdown/resend | Da vao man hinh OTP | 1. Quan sat bo dem 2. Cho den 0 | <60s: resend bi khoa/an, het 60s: resend hien thi | Medium | Countdown: 60s |
| ZLOGIN_TC_008 | GUI/OTP Screen | Low | Label nut xac nhan theo context | Co 3 context login/register/change | 1. Mo OTP tu tung context 2. Doi chieu label nut | Login=Dang nhap, Register=Dang ky, Change=Doi | Low | N/A |
| ZLOGIN_TC_009 | GUI/Login Prompt | Low | UI hop thoai yeu cau dang nhap | User chua dang nhap | 1. Truy cap tinh nang can login 2. Quan sat dialog | Hien thong diep + 2 nut Dong/Dang nhap | Low | N/A |
| ZLOGIN_TC_010 | GUI/Security | High | Chan chup man hinh man hinh xac thuc | Mo man hinh xac thuc/OTP | 1. Thu chup man hinh tren thiet bi | Screenshot bi chan theo FLAG_SECURE | High | Device iOS/Android |
| ZLOGIN_TC_011 | Logic/Login Routing | High | Email da ton tai route sang OTP login | Email ton tai trong he thong | 1. Nhap email 2. Tick checkbox 3. Gui ma | Chuyen sang OTP login, nut Dang nhap | Critical | abc_login01@domain.com |
| ZLOGIN_TC_012 | Logic/Login | High | OTP dung dang nhap thanh cong | Dang o OTP login, co OTP hop le | 1. Nhap OTP 2. Nhan Dang nhap | Tao session, dong man hinh, resume flow | Critical | OTP dung tu email |
| ZLOGIN_TC_013 | Logic/Register Routing | High | Email chua ton tai route sang OTP register | Email chua ton tai | 1. Nhap email 2. Tick checkbox 3. Gui ma | Chuyen OTP register, nut Dang ky | High | new_user_2026@domain.com |
| ZLOGIN_TC_014 | Logic/Register Routing | High | Thiet bi da tung dung email khac -> hien popup lua chon | Device co lich su email cu | 1. Nhap email moi 2. Gui ma | Hien popup: dung email cu / dang ky email moi | High | old_user@domain.com, new_user_2026@domain.com |
| ZLOGIN_TC_015 | Logic/Register Routing | Medium | Chon dung email cu | Dang hien popup email khac lan truoc | 1. Chon dung email cu | Quay ve luong dang nhap voi email cu | Medium | old_user@domain.com |
| ZLOGIN_TC_016 | Logic/Register Routing | Medium | Chon dang ky email moi | Dang hien popup email khac lan truoc | 1. Chon dang ky email moi | Tiep tuc luong dang ky voi email moi | Medium | new_user_2026@domain.com |
| ZLOGIN_TC_017 | Logic/Register Completion | High | OTP dung tao tai khoan va hien man hinh hoan tat | Dang o OTP register, co OTP hop le | 1. Nhap OTP 2. Nhan Dang ky | Tao tai khoan thanh cong, hien 2 CTA | High | OTP dung tu email |
| ZLOGIN_TC_018 | Logic/Change Email | High | Doi email hop le khong can checkbox | User da dang nhap | 1. Mo doi email 2. Nhap email moi 3. Nhan Doi | Gui OTP den email moi, khong can consent | High | change_2026@domain.com |
| ZLOGIN_TC_019 | Logic/Change Email | High | OTP dung doi email thanh cong | Dang o OTP change email | 1. Nhap OTP dung 2. Nhan Doi | Hien man hinh hoan tat, chi co nut OK | High | OTP dung tu email moi |
| ZLOGIN_TC_020 | Logic/Session | High | Session 401 khi doi email | User dang trong luong doi email | 1. Submit khi backend tra 401 | Tu dong ve trang thai dang xuat, yeu cau login lai | Critical | API 401 mock |
| ZLOGIN_TC_021 | Logic/Logout | Medium | Dang xuat thanh cong | User da dang nhap | 1. Chon Dang xuat 2. Cho server success | Xoa token/session, ve trang thai chua login | Medium | API 200 |
| ZLOGIN_TC_022 | Logic/Logout | Medium | Dang xuat that bai | User da dang nhap | 1. Chon Dang xuat 2. Server tra loi | Dong man hinh, giu session hien tai | Medium | API error |
| ZLOGIN_TC_023 | Validation/Email | High | Email rong | Mo man hinh nhap email | 1. De rong email | Nut gui OTP bi khoa, khong goi API | High | "" |
| ZLOGIN_TC_024 | Validation/Email | High | Email sai dinh dang thieu @ | Mo man hinh nhap email | 1. Nhap abc.domain.com 2. Tick checkbox | Hien loi dinh dang, vien do, nut bi khoa | High | abc.domain.com |
| ZLOGIN_TC_025 | Validation/Email | High | Email co khoang trang dau/cuoi (validate nguyen ban) | Rule Q&A: validate nguyen ban input | 1. Nhap " user01@domain.com " 2. Tick checkbox | Input bi xem khong hop le, khong cho gui OTP | High | " user01@domain.com " |
| ZLOGIN_TC_026 | Validation/Consent | High | Email hop le nhung chua tick checkbox | Mo man hinh nhap email | 1. Nhap user01@domain.com 2. Khong tick checkbox | Nut gui OTP van bi khoa | High | user01@domain.com |
| ZLOGIN_TC_027 | Validation/Consent | Medium | Email hop le va tick checkbox | Mo man hinh nhap email | 1. Nhap user01@domain.com 2. Tick checkbox | Nut gui OTP duoc kich hoat | Medium | user01@domain.com |
| ZLOGIN_TC_028 | Validation/OTP | High | OTP 1-3 chu so | Dang o man hinh OTP | 1. Nhap 1/2/3 chu so | Nut xac nhan bi khoa | High | 1, 12, 123 |
| ZLOGIN_TC_029 | Validation/OTP | High | OTP du 4 chu so | Dang o man hinh OTP | 1. Nhap 4 chu so | Nut xac nhan duoc kich hoat | High | 1234 |
| ZLOGIN_TC_030 | Validation/OTP | High | OTP chi chap nhan chu so | Dang o man hinh OTP | 1. Thu nhap a/#/space | He thong tu choi ky tu khong phai so | High | a, #, space |
| ZLOGIN_TC_031 | Validation/OTP | High | Sai OTP lan 1-4 | Dang o man hinh OTP | 1. Nhan sai OTP 4 lan lien tiep | Moi lan deu bao loi, xoa OTP de nhap lai | High | 1111 (sai) |
| ZLOGIN_TC_032 | Validation/OTP | High | Sai OTP lan 5 bi khoa tam thoi | Da sai OTP 4 lan lien tiep | 1. Nhap sai OTP lan 5 | Khoa tam thoi theo rule backend | Critical | 1111 (sai lan 5) |
| ZLOGIN_TC_033 | Logic/Resend OTP | Medium | Khong cho resend truoc 60 giay | Vua vao man hinh OTP | 1. Thu bam resend truoc 60s | Khong goi resend API, nut bi khoa/an | Medium | Timer < 60 |
| ZLOGIN_TC_034 | Logic/Resend OTP | High | Cho resend sau 60 giay | Bo dem OTP da ve 0 | 1. Bam resend | Gui lai OTP, reset countdown 60s | High | Timer = 0 |
| ZLOGIN_TC_035 | Error Handling | High | Loi khong co mang khi gui OTP | Tat internet tren thiet bi | 1. Nhap email hop le + consent 2. Gui OTP | Hien popup loi mang, cho Retry/Cancel | High | Offline mode |
| ZLOGIN_TC_036 | Error Handling | High | Loi server 500 khi gui/xac thuc OTP | Mock backend 500 | 1. Thu gui OTP hoac verify OTP | Hien thong bao loi tam thoi, hanh vi thong nhat | High | API 500 |
| ZLOGIN_TC_037 | Error Handling | Medium | Loi server business khac | Backend tra loi custom error | 1. Submit thao tac gay loi | Hien dung thong diep server, co nut OK | Medium | API custom error |
| ZLOGIN_TC_038 | Logic/Login Prompt | Medium | Nut Dang nhap trong dialog mo man hinh xac thuc | User chua login, dialog dang mo | 1. Nhan nut Dang nhap | Mo man hinh xac thuc email | Medium | N/A |
| ZLOGIN_TC_039 | Error Handling | Medium | Loi nghiem trong yeu cau khoi dong lai app | Gia lap loi nghiem trong he thong | 1. Trigger loi | Hien thong bao khoi dong lai app | Medium | Fatal error mock |
