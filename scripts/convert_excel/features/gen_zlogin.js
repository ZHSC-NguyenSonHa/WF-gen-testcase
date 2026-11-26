const path = require('path');
const { generateTestcase } = require('../testcase_builder');

const FUNCTION_NAME = 'Login_Email_Auth_zlogin';
const CREATOR = 'QuynhNT';
const CREATE_DATE = '2026-06-30';
const RELEASE = '7.4.0';
const DEVICES = ['iOS', 'Android'];
const SHEET_PREFIX = 'zlogin_Email_Auth';

const guiSection = {
  title: 'GUI - Xac thuc Email (zlogin)',
  rows: [
    {
      to: 'Login Screen',
      sub: 'Layout tong the',
      input: '[Tien dieu kien] Mo man hinh xac thuc email.\n1. Quan sat tieu de man hinh.\n2. Quan sat o nhap email, checkbox dieu khoan, nut gui ma.',
      output: '1. Hien thi day du thanh phan UI theo spec.\n2. Khong vo layout, khong de text.'
    },
    {
      to: 'Login Screen',
      sub: 'Noi dung text va ngon ngu',
      input: '[Tien dieu kien] Man hinh dang o trang thai cho nhap.\n1. Doi chieu text tieu de/thong bao/chu thich voi spec.',
      output: '1. Noi dung text trung khop spec.\n2. Khong sai chinh ta/encoding.'
    },
    {
      to: 'Email Input',
      sub: 'Hien thi o nhap va cursor',
      input: '[Tien dieu kien] Man hinh login da mo.\n1. Tap vao o email.\n2. Nhap 1 ky tu.',
      output: '1. O nhap nhan focus dung.\n2. Cursor va text hien thi ro rang.'
    },
    {
      to: 'Consent Checkbox',
      sub: 'UI checkbox + link dieu khoan/chinh sach',
      input: '[Tien dieu kien] Man hinh login da mo.\n1. Quan sat checkbox va noi dung ben canh.\n2. Tap vao link dieu khoan/chinh sach.',
      output: '1. Checkbox hien thi dung trang thai check/uncheck.\n2. Link mo dung man hinh/noi dung theo spec.'
    },
    {
      to: 'Send OTP Button',
      sub: 'Trang thai disable/enable UI',
      input: '[Tien dieu kien] Man hinh login da mo.\n1. Kiem tra nut o trang thai email rong.\n2. Nhap email hop le + check dieu khoan.',
      output: '1. Nut bi khoa khi chua du dieu kien.\n2. Nut kich hoat khi du dieu kien.'
    },
    {
      to: 'OTP Screen',
      sub: 'UI OTP input 4 chu so',
      input: '[Tien dieu kien] Da vao man hinh OTP.\n1. Quan sat 4 o OTP va thong bao huong dan.\n2. Nhap lan luot 4 ky tu so.',
      output: '1. Hien thi 4 o OTP ro rang.\n2. Focus chuyen o dung thu tu.'
    },
    {
      to: 'OTP Screen',
      sub: 'Countdown va nut resend',
      input: '[Tien dieu kien] Vua vao man hinh OTP.\n1. Quan sat bo dem nguoc.\n2. Cho het 60 giay.',
      output: '1. Trong 60 giay, nut resend an/khoa.\n2. Het 60 giay, hien thi nut resend.'
    },
    {
      to: 'OTP Screen',
      sub: 'Label nut xac nhan theo context',
      input: '[Tien dieu kien] Mo man hinh OTP tu 3 context: login/register/change email.\n1. Doi chieu label nut xac nhan.',
      output: '1. Login: nut hien thi Dang nhap.\n2. Register: nut hien thi Dang ky.\n3. Change email: nut hien thi Doi.'
    },
    {
      to: 'Login Prompt Dialog',
      sub: 'UI hop thoai yeu cau dang nhap',
      input: '[Tien dieu kien] O trang thai chua dang nhap.\n1. Truy cap tinh nang can dang nhap.\n2. Quan sat hop thoai va 2 nut thao tac.',
      output: '1. Hien thong diep yeu cau dang nhap.\n2. Co nut Dong va Dang nhap dung vi tri.'
    },
    {
      to: 'Global Security',
      sub: 'Bao ve chup man hinh',
      input: '[Tien dieu kien] Mo cac man hinh xac thuc email/OTP.\n1. Thu chup man hinh tren thiet bi.',
      output: '1. Hinh anh bi chan theo co che FLAG_SECURE.\n2. Khong lo thong tin nhay cam.'
    }
  ]
};

const logicSections = [
  {
    title: '1. Luong Dang nhap (Email da ton tai)',
    rows: [
      {
        to: 'Login Routing',
        sub: 'Email da dang ky -> OTP dang nhap',
        input: '[Tien dieu kien] Tai khoan abc_login01@domain.com da ton tai.\n1. Nhap email abc_login01@domain.com.\n2. Check dong y dieu khoan.\n3. Nhan Gui ma xac thuc.',
        output: '1. Server tra ve email ton tai.\n2. Chuyen sang man hinh OTP voi nut Dang nhap.'
      },
      {
        to: 'Login Routing',
        sub: 'OTP dung -> dang nhap thanh cong',
        input: '[Tien dieu kien] Dang o man hinh OTP login, co OTP hop le moi nhat.\n1. Nhap dung 4 chu so OTP.\n2. Nhan Dang nhap.',
        output: '1. Xac thuc thanh cong.\n2. Dong man hinh xac thuc va tiep tuc luong dang cho.'
      }
    ]
  },
  {
    title: '2. Luong Dang ky moi (Email chua ton tai)',
    rows: [
      {
        to: 'Register Routing',
        sub: 'Email moi -> OTP dang ky',
        input: '[Tien dieu kien] Email new_user_2026@domain.com chua ton tai.\n1. Nhap email new_user_2026@domain.com.\n2. Check dong y dieu khoan.\n3. Nhan Gui ma xac thuc.',
        output: '1. He thong route sang quy trinh dang ky.\n2. Mo man OTP voi nut Dang ky.'
      },
      {
        to: 'Register Routing',
        sub: 'Case dac biet email khac lan truoc',
        input: '[Tien dieu kien] Thiet bi da tung dung old_user@domain.com.\n1. Nhap new_user_2026@domain.com.\n2. Nhan gui ma.',
        output: '1. Hien popup thong bao email khac lan truoc.\n2. Co 2 lua chon: dung email cu hoac dang ky email moi.'
      },
      {
        to: 'Register Routing',
        sub: 'Chon dung email cu',
        input: '[Tien dieu kien] Dang hien popup email khac lan truoc.\n1. Chon Dung lai email cu.',
        output: '1. He thong quay ve luong dang nhap voi email cu.\n2. Gui OTP dang nhap cho email cu.'
      },
      {
        to: 'Register Routing',
        sub: 'Chon dang ky email moi',
        input: '[Tien dieu kien] Dang hien popup email khac lan truoc.\n1. Chon Dang ky email moi.',
        output: '1. Tiep tuc luong dang ky voi email moi.\n2. Gui OTP dang ky den email moi.'
      },
      {
        to: 'Register Completion',
        sub: 'OTP dung -> tao tai khoan thanh cong',
        input: '[Tien dieu kien] Dang o OTP register voi OTP hop le.\n1. Nhap OTP 4 so dung.\n2. Nhan Dang ky.',
        output: '1. Tao tai khoan thanh cong.\n2. Hien man hinh hoan tat dang ky voi 2 nut Dang ky ho so / Ve trang chu.'
      }
    ]
  },
  {
    title: '3. Luong Doi email',
    rows: [
      {
        to: 'Change Email',
        sub: 'Doi email hop le khong can checkbox dieu khoan',
        input: '[Tien dieu kien] User dang dang nhap.\n1. Mo man hinh doi email.\n2. Nhap change_2026@domain.com.\n3. Nhan Doi email.',
        output: '1. Nut doi email kich hoat khi email hop le.\n2. OTP gui den email moi ma khong can tich dieu khoan.'
      },
      {
        to: 'Change Email',
        sub: 'OTP dung -> doi email thanh cong',
        input: '[Tien dieu kien] Dang o man hinh OTP doi email voi OTP hop le.\n1. Nhap OTP dung.\n2. Nhan nut Doi.',
        output: '1. Doi email thanh cong.\n2. Hien man hinh hoan tat voi nut OK duy nhat.'
      },
      {
        to: 'Change Email',
        sub: '401 session expired khi doi email',
        input: '[Tien dieu kien] User dang trong luong doi email, backend tra 401.\n1. Nhan xac nhan OTP/hoac submit thao tac doi email.',
        output: '1. Ung dung tu dong chuyen sang trang thai dang xuat.\n2. Yeu cau user dang nhap lai tu dau.'
      }
    ]
  },
  {
    title: '4. Luong Dang xuat',
    rows: [
      {
        to: 'Logout',
        sub: 'Logout thanh cong',
        input: '[Tien dieu kien] User dang dang nhap.\n1. Chon Dang xuat trong cai dat.\n2. Cho server phan hoi thanh cong.',
        output: '1. Xoa token/session local.\n2. Quay ve trang thai chua dang nhap.'
      },
      {
        to: 'Logout',
        sub: 'Logout that bai tu server',
        input: '[Tien dieu kien] User dang dang nhap, server tra loi dang xuat loi.\n1. Chon Dang xuat.',
        output: '1. Dong man hinh dang xuat va bao loi.\n2. Du lieu phien khong bi xoa tu dong.'
      }
    ]
  },
  {
    title: '5. Field Validation - Email va Checkbox',
    rows: [
      {
        to: 'Email Field Validation',
        sub: 'Email rong',
        input: '[Tien dieu kien] Mo man hinh nhap email.\n1. De trong email.\n2. Khong tick checkbox.',
        output: '1. Nut gui OTP bi khoa.\n2. Khong gui request len server.'
      },
      {
        to: 'Email Field Validation',
        sub: 'Email sai dinh dang thieu @',
        input: '[Tien dieu kien] Mo man hinh nhap email.\n1. Nhap abc.domain.com.\n2. Tick checkbox.',
        output: '1. Hien loi dinh dang email.\n2. O email vien do.\n3. Nut gui OTP bi khoa.'
      },
      {
        to: 'Email Field Validation',
        sub: 'Email co khoang trang dau/cuoi (validate nguyen ban)',
        input: '[Tien dieu kien] Rule Q&A: validate nguyen ban input.\n1. Nhap " user01@domain.com ".\n2. Tick checkbox.',
        output: '1. He thong khong tu trim.\n2. Input bi xem la khong hop le va khong cho gui OTP.'
      },
      {
        to: 'Email Field Validation',
        sub: 'Email hop le + chua tick checkbox',
        input: '[Tien dieu kien] Mo man hinh nhap email.\n1. Nhap user01@domain.com.\n2. De checkbox o trang thai uncheck.',
        output: '1. Nut gui OTP van bi khoa do chua dong y dieu khoan.'
      },
      {
        to: 'Consent Validation',
        sub: 'Email hop le + tick checkbox',
        input: '[Tien dieu kien] Mo man hinh nhap email.\n1. Nhap user01@domain.com.\n2. Tick checkbox dong y.',
        output: '1. Nut gui OTP duoc kich hoat.'
      }
    ]
  },
  {
    title: '6. Field Validation - OTP',
    rows: [
      {
        to: 'OTP Field Validation',
        sub: 'Nhap 1-3 chu so',
        input: '[Tien dieu kien] Dang o man hinh OTP.\n1. Nhap lan luot 1,2,3 chu so.',
        output: '1. Nut xac nhan bi khoa khi chua du 4 chu so.'
      },
      {
        to: 'OTP Field Validation',
        sub: 'Nhap du 4 chu so',
        input: '[Tien dieu kien] Dang o man hinh OTP.\n1. Nhap 4 chu so 1-2-3-4.',
        output: '1. Nut xac nhan duoc kich hoat.'
      },
      {
        to: 'OTP Field Validation',
        sub: 'Nhap ky tu khong phai so',
        input: '[Tien dieu kien] Dang o man hinh OTP.\n1. Thu nhap ky tu a, #, khoang trang.',
        output: '1. He thong tu choi ky tu khong phai so.\n2. OTP chi nhan chu so 0-9.'
      },
      {
        to: 'OTP Field Validation',
        sub: 'Sai OTP lan 1 den 4',
        input: '[Tien dieu kien] Co OTP sai.\n1. Nhap sai OTP va submit lan 1-4.',
        output: '1. Moi lan sai hien popup loi.\n2. Tu dong xoa OTP de nhap lai.\n3. Chua bi khoa tam thoi.'
      },
      {
        to: 'OTP Field Validation',
        sub: 'Sai OTP lan thu 5',
        input: '[Tien dieu kien] Da sai OTP 4 lan lien tiep.\n1. Nhap sai OTP lan thu 5 va submit.',
        output: '1. He thong khoa tam thoi theo rule backend.\n2. Khong cho xac thuc tiep ngay lap tuc.'
      }
    ]
  },
  {
    title: '7. Countdown, Resend va Error Recovery',
    rows: [
      {
        to: 'Resend OTP',
        sub: 'Chua het 60 giay',
        input: '[Tien dieu kien] Vua vao man OTP va bo dem dang chay.\n1. Thu bam resend truoc 60s.',
        output: '1. Nut resend an/khoa.\n2. Khong phat sinh request resend OTP.'
      },
      {
        to: 'Resend OTP',
        sub: 'Da het 60 giay',
        input: '[Tien dieu kien] Dang o man OTP, bo dem ve 0.\n1. Nhan resend OTP.',
        output: '1. Gui lai OTP thanh cong.\n2. Bo dem 60s khoi tao lai.'
      },
      {
        to: 'Network Error Handling',
        sub: 'Khong co mang khi gui OTP',
        input: '[Tien dieu kien] Tat internet tren thiet bi.\n1. Nhap email hop le + tick checkbox.\n2. Nhan gui OTP.',
        output: '1. Hien popup loi mang.\n2. Co thao tac Retry/Cancel theo quy uoc thong nhat.'
      },
      {
        to: 'Network Error Handling',
        sub: 'Server 500 khi gui hoac verify OTP',
        input: '[Tien dieu kien] Mock backend tra 500.\n1. Thu gui OTP hoac xac thuc OTP.',
        output: '1. Hien thong bao loi tam thoi tu server.\n2. Hanh vi nut thao tac thong nhat giua cac buoc (theo Q&A).' 
      },
      {
        to: 'Network Error Handling',
        sub: 'Loi server khac',
        input: '[Tien dieu kien] Backend tra ve business error message.\n1. Thuc hien submit gay loi.',
        output: '1. Hien dung noi dung loi server tra ve.\n2. Co nut OK de dong thong bao.'
      }
    ]
  },
  {
    title: '8. Login Prompt va Security',
    rows: [
      {
        to: 'Login Prompt',
        sub: 'User chua login truy cap tinh nang can login',
        input: '[Tien dieu kien] User chua dang nhap.\n1. Truy cap tinh nang yeu cau login.',
        output: '1. Hien hop thoai yeu cau dang nhap.\n2. Nut Dong dong hop thoai.\n3. Nut Dang nhap mo man hinh xac thuc email.'
      },
      {
        to: 'Security Handling',
        sub: 'Ung dung gap loi nghiem trong',
        input: '[Tien dieu kien] Gia lap loi nghiem trong theo spec.\n1. Trigger tinh huong loi he thong.',
        output: '1. Hien thong bao yeu cau khoi dong lai app.\n2. User co the mo lai app de tiep tuc.'
      }
    ]
  }
];

(async () => {
  const out = process.argv[2] || path.join(__dirname, `【APP】${FUNCTION_NAME}.xlsx`);
  const res = await generateTestcase({
    functionName: FUNCTION_NAME,
    creator: CREATOR,
    createDate: CREATE_DATE,
    release: RELEASE,
    devices: DEVICES,
    sheetPrefix: SHEET_PREFIX,
    guiSection,
    logicSections,
    output: out,
  });
  console.log('WROTE:', res.output, '| GUI:', res.gui, '| LOGIC:', res.logic);
})();
