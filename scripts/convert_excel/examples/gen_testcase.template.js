// =============================================================================
// gen_testcase.template.js — SKELETON cho file testcase MỚI
// -----------------------------------------------------------------------------
// CÁCH DÙNG:
//   1. Copy file này, đổi tên thành gen_<feature>.js (vd gen_popup_pizza.js)
//   2. Sửa metadata (FUNCTION_NAME, CREATOR, ...) + SHEET_PREFIX
//   3. Điền guiSection (1 section UI) + logicSections (chia ĐÚNG theo từng mục spec)
//   4. Chạy:  node gen_<feature>.js "<đường-dẫn-output.xlsx>"
//
// LƯỢC ĐỒ LUỒNG (Copy+Fill):
//   - Engine `testcase_builder.js` load template `templates/testcase/app-testcase-template.xlsx`
//   - Clone Home_GUI → `<SHEET_PREFIX>_GUI` và `<SHEET_PREFIX>_LOGIC` (giữ NGUYÊN style/border/font/formula)
//   - Fill data mới vào, auto-merge Test Object trùng theo cụm
//   - Update Summary (common info + detail rows trỏ tới 2 sheet mới)
//
// LƯU Ý FORMAT (theo skill format_testcase):
//   - Mỗi row: { to: 'Test Object', sub: 'Sub Test Object', input: '...', output: '...' }
//   - Các row liên tiếp cùng `to` sẽ tự ĐỘNG MERGE ô Test Object (gọn, không duplicate)
//   - Step trong `input` viết CỤ THỂ từng bước, mở đầu bằng [Tiền điều kiện] ... rồi 1. 2. 3.
//   - logicSections phải chia đúng số mục như spec (1., 2., 3., ...)
//   - Style/màu/border/formula tự clone từ template canonical → KHÔNG cần style thủ công
// =============================================================================

const path = require('path');
const { generateTestcase } = require('../testcase_builder');

const FUNCTION_NAME = 'Tên Feature';        // vd 'Popup Pizza'
const CREATOR = 'QuynhNT';
const CREATE_DATE = '2026-06-09';
const RELEASE = '7.4.0';
const DEVICES = ['iOS', 'Android'];
const SHEET_PREFIX = 'Feature_Name';        // -> Feature_Name_GUI, Feature_Name_LOGIC

const guiSection = {
  title: 'Xác nhận hiển thị <Feature>',
  rows: [
    { to: 'Layout', sub: 'Tổng thể', input: '[Tiền điều kiện] ...\n1. ...\n2. Quan sát', output: '1. ...\n2. ...' },
    // ... thêm row GUI
  ],
};

const logicSections = [
  { title: '1. <Mục 1 theo spec>', rows: [
    { to: 'Test Object A', sub: 'Happy path', input: '[Tiền điều kiện] ...\n1. ...\n2. ...', output: '1. ...' },
    // ... thêm row cùng `to` sẽ merge
  ]},
  { title: '2. <Mục 2 theo spec>', rows: [
    { to: 'Test Object B', sub: 'Negative', input: '[Tiền điều kiện] ...\n1. ...', output: '...' },
  ]},
  // ... thêm section đúng theo số mục trong spec
];

(async () => {
  // Default output: 【APP】<FeatureName>.xlsx (khớp convention Push gốc trong Test Result/)
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
