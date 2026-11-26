## Tong Quan

| Phan loai | No | Ten field | Field ID | Kieu | Gioi han | Bat buoc | Chinh sua | Sao chep | Layout | Mo ta / Kiem tra |
|-----------|----|-----------|---------|----|---------|----------|-----------|---------|--------|-----------------|
| [Man hinh] | - | Ten man hinh | - | - | - | - | - | - | - | Man hinh nhap lieu 電話工事依頼書 |
| [Man hinh] | - | Chuc nang | - | - | - | - | - | - | - | Nhap lieu 電話工事依頼書; Nop don / Luu nhap |
| [Su kien] | 1 | 初期表示 | - | - | - | - | - | - | Tat ca | Tu dong lay gia tri template da chon |
| [Su kien] | 2 | 会社選択 | - | - | - | - | - | - | Tat ca | Hien thi popup danh muc cong ty |
| [Su kien] | 3 | 申請 | - | - | - | - | - | - | Tat ca | Bat dau quy trinh phe duyet |
| [Su kien] | 4 | 一時保存 | - | - | - | - | - | - | Tat ca | Luu o trang thai nhap |
| [Su kien] | 5 | キャンセル | - | - | - | - | - | - | Tat ca | Quay ve man hinh truoc |
| [Chung] | 1 | タイトル | appTitle | Text | - | ー | x | ー | Tat ca | Van ban co dinh: 電話工事依頼書 |
| [Chung] | 2 | 秘密情報 | - | Text | - | ー | x | ー | Tat ca | Van ban co dinh: 秘密情報; In do dam; Tu dong |
| [Chung] | 3 | 申請 No. | applicationNumber | Text | - | ー | x | x | Tat ca | Tu phat so theo quy tac khi nhan 申請; Tu dong |
| [Chung] | 4 | 申請日 | issueDate | Ngay | 6 | ー | x | x | Tat ca | yyyy/mm/dd; Tu dong set khi nhan 申請 |
| [Chung] | 5 | 連絡先 | reqContact | Text | 15 | ー | o | x | Tat ca | Tu dien neu login user co noi tuyen; Toi da 15 ky tu |
| [Chung] | 6 | 申請者 | reqUser1 | User | - | o | o | o | Tat ca | Tu lay login user hien tai |
| [Chung] | 7 | 上長 | appUser1 | User | - | x | o | x | Tat ca | Tuy chon o man hinh nhap lieu (khong bat buoc) |
| [Chung] | 8 | 部門長 | appUser2 | User | - | o | o | x | Tat ca | Bat buoc chi dinh |
| [Chung] | 9 | 受付 | appUser3 | Nhom cong khai | - | o | x | x | Tat ca | Tu lay tu cai dat ung dung |
| [Chung] | 10 | 承認 | appUser4 | Nhom cong khai | - | o | x | o | Tat ca | Tu lay tu cai dat ung dung |
| [Chung] | 11 | 完了 | appUser5 | Nhom cong khai | - | o | x | o | Tat ca | Tu lay tu cai dat ung dung |
| [Chung] | 12 | / | - | Text | - | x | x | o | Tat ca | Node phe duyet khong dung hien thi "/" |
| [Chung] | 13 | 所属会社名 | - | Text | - | o | x | o | Tat ca | Ten cong ty cua login user |
| [Chung] | 14 | 所属 | - | Text | - | o | x | o | Tat ca | Bo phan chinh cua login user |
| [Chung] | 15 | 社員番号 | reqEmployeeNumber | Text | - | o | x | o | Tat ca | Ma nhan vien cua login user |
| [Chung] | 16 | 氏名 | - | User | - | o | x | o | Tat ca | Ho ten cua login user |
| [Chung] | 17 | 工事の種類 | constructionType | Radio | - | o | o | o | Tat ca | KEY FIELD: 1.電話機増設 / 2.既存電話機設定変更 / 3.その他 |
| [Dong] | 18 | 電話機増設 | phoneExtensionAddition | Checkbox | - | dieu kien | o | o | 2-3 | Tuy chon: 1.既存の内線と同じ盤面 / 2.新しい盤面; Neu chon ca 2: 備考/添付/利用開始日 dung chung |
| [Dong] | 19 | 台数 (unitCount) | unitCount | So nguyen | 3 | o | o | o | Layout 2 | Chi so nguyen; Hau to 台 khong chinh sua |
| [Dong] | 20 | a)既存の内線と同じ盤面 | samePanel | So nguyen | 12 | o | o | o | Layout 2 | Chi phan nguyen |
| [Dong] | 19 | 台数 (unitCount2) | unitCount2 | So nguyen | 3 | o | o | o | Layout 3 | Chi so nguyen |
| [Dong] | 20 | 盤面表 (them moi - ban moi) | - | File | - | ー | o | ー | Layout 3 | Lay tu cai dat ung dung |
| [Dong] | 19 | 変更したい内線番号 (extChange) | extChange | So nguyen | 12 | o | o | o | Layout 4 | Chi phan nguyen |
| [Dong] | 20 | a)既存の内線と同じ盤面 noi tuyen | samePanelExtension | So nguyen | 12 | ー | o | o | Layout 4 | Hau to "to dung cai dat" khong chinh sua |
| [Dong] | 19 | 変更したい内線番号 (extChange2) | extChange2 | So nguyen | 12 | o | o | o | Layout 5 | Chi phan nguyen |
| [Dong] | 20 | 盤面表 (thay doi - ban moi) | - | File | - | ー | o | ー | Layout 5 | Lay tu cai dat ung dung |
| [Dong] | 19 | 留守番電話設定仕様 (voicemailDropdown) | voicemailDropdown | Dropdown | - | o | o | o | Layout 6 | Cai dat / Huy cai dat |
| [Dong] | 20 | 設定する外線番号 | externalNumberToSet | So nguyen | 12 | x | o | o | Layout 6 | Chi phan nguyen; Khong bat buoc (can xac nhan dieu kien) |
| [Dong] | 19 | 変更したい内線番号 (extChange3) | extChange3 | So nguyen | 12 | o | o | o | Layout 7 | Chi phan nguyen |
| [Dong] | 20 | 現在の発番 | currentCallerId | So nguyen | 12 | o | o | o | Layout 7 | Chi phan nguyen |
| [Dong] | 21 | 変更後の発番 | newCallerId | So nguyen | 12 | o | o | o | Layout 7 | Chi phan nguyen |
| [Dong] | 38 | 備考 | remarks | Text | 256 | o(L2,L8) / x(L3-L7) | o | o | Layout 2-8 | Toi da 256 ky tu; Bat buoc chi o layout 2 va 8 |
| [Dong] | 39 | 添付ファイル | - | File | - | x | o | ー | Layout 2-8 | Toi da 20 file |
| [Dong] | 40 | 利用開始希望日 | expectedStartDate | So nguyen | 4 | tuy chon(L2)/bat buoc(L3-L7)/khong(L8) | o | - | Layout 2-8 | KT: (1) Khong nhap thang qua khu; (2) Hien chu y khi ngay 5-10 thang HT; (3) Tu ngay 11 khong cho dang ky |

## QnA

| No | Nhom | Cau hoi | Ly do can xac nhan | Muc do |
|----|------|---------|-------------------|--------|
| Q1 | 申請 No. | Quy tac dat ten 申請 No. la format cu the nhu the nao? | Khong viet duoc TC kiem tra dinh dang | [High] |
| Q2 | 上長 | 上長 la tuy chon o man hinh nhap lieu -- Neu khong dien 上長 van co the nhan 申請 khong? Hay chi 一時保存? | TC luong 申請 thay doi | [High] |
| Q3 | 電話機増設 bat buoc | Spec goc ghi bat buoc=o nhung layout 2 ghi bat buoc=dieu kien -- Cai nao dung? Dieu kien bat buoc la gi? | TC validation bat buoc bi sai | [High] |
| Q4 | 電話機増設 chon ca hai | Khi chon ca 2 option 1+2: 備考/添付/利用開始日 hien thi 1 lan hay moi section rieng? | TC case chon ca hai khong viet duoc | [High] |
| Q5 | 既存電話機 chon nhieu | Khi chon nhieu option cua 既存電話機設定変更: cac field moi option hien thi rieng khong? Vi tri shared section o dau? | So luong TC layout thay doi lon | [High] |
| Q6 | 利用開始希望日 format | 利用開始希望日 -- kieu=so, do dai=4 -- Format YYYYMM (6 so) hay YYYY (4 so)? Date picker hay nhap tay? | TC ve dinh dang nhap bi thay doi | [High] |
| Q7 | 利用開始希望日 bat buoc | Layout 2: bat buoc=tuy chon; Layout 3 tro di: bat buoc=yes -- Su khac biet nay co chu y khong? | TC validation bat buoc thay doi | [High] |
| Q8 | 留守番電話 dieu kien | Khi chon "Cai dat": 設定する外線番号 (khong bat buoc) co tro thanh bat buoc khong? | Noi dung TC bat buoc co dieu kien thay doi | [Medium] |
| Q9 | 利用開始希望日 timing | Validation thang qua khu / tu ngay 11 khong cho dang ky xay ra luc: nhap field / 一時保存 / 申請 / real-time? | Trigger TC va cau truc muc thay doi | [Medium] |
| Q10 | 添付 max 20 | Upload file thu 21: noi dung error message la gi? Bi chan ngay hay loi khi luu? | Khong viet duoc TC boundary (20/21 file) | [Medium] |
| Q11 | 連絡先 validation | Khi nhap qua 15 ky tu: error message la gi? Tu cat ngan hay hien thi loi? | Noi dung TC error message thay doi | [Medium] |
| Q12 | キャンセル xac nhan | Khi da nhap data roi nhan Cancel: co confirm dialog khong? | Thieu TC canh bao du lieu chua luu | [Medium] |
| Q13 | 複製 hanh vi | Khi 複製: 申請 No./申請日 cua ban sao duoc reset hay copy? Man hinh chuyen den dau? | Expected result TC 複製 khong ro | [Medium] |
| Q14 | 台数 gia tri min | 台数 (3 chu so) -- gia tri toi thieu la 1? Co the nhap 0 khong? Nhap so am thi sao? | Thieu TC boundary value | [Medium] |
| Q15 | 盤面表 loai file | 盤面表 (file) -- loai file duoc phep upload va gioi han dung luong la gi? | Thieu TC kiem tra upload file | [Medium] |
| Q16 | cap nhat man hinh | Sau khi chon 工事の種類: man hinh cap nhat ngay (SPA/dynamic) hay can nhan nut? | Thu tu buoc TC thay doi | [Medium] |
| Q17 | 電話機増設 chua chon | Chon 工事=電話機増設 nhung khong tick option nao trong checkbox -- Co the 申請 khong? Error message la gi? | Thieu TC edge case | [Medium] |
| Q18 | 備考 bat buoc theo layout | 備考: layout 2 bat buoc; layout 3-7 tuy chon; layout 8 bat buoc -- Xac nhan chi layout 2 va 8 moi yeu cau? | TC validation bat buoc thay doi | [Medium] |
| Q19 | chu y 3 ngay+ | Text chu y hien thi khi ngay 5-10 thang hien tai -- Chi hien thi thong tin; khong block 申請? | Mo ta pham vi TC thay doi | [Low] |
| Q20 | 申請者 sao chep | 申請者 co 複製=o -- Khi 複製: 申請者 la nguoi nop goc hay login user hien tai? | Expected result khong ro rang | [Low] |