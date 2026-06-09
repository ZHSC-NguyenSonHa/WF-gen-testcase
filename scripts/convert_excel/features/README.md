# Features — Test Case Data Files

Đặt các file `gen_<feature>.js` của QA team vào đây. Mỗi file 1 feature.

## Cách tạo file mới

```powershell
# 1. Copy skeleton từ examples/
Copy-Item ../examples/gen_testcase.template.js gen_<feature_name>.js

# 2. Mở file vừa copy, sửa metadata + điền data (xem README chính)

# 3. Chạy
node gen_<feature_name>.js "../../../Test Result/<release>/App/<folder>/【APP】<FeatureName>.xlsx"
```

## Reference

- Engine: [../testcase_builder.js](../testcase_builder.js)
- Skeleton: [../examples/gen_testcase.template.js](../examples/gen_testcase.template.js)
- Example đầy đủ: [../examples/gen_popup_claim.js](../examples/gen_popup_claim.js)
- Skill: [.github/skills/excel-converter/SKILL.md](../../../.github/skills/excel-converter/SKILL.md)
