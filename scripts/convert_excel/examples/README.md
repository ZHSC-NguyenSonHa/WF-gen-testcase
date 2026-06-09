# Examples — Test Case Builder

Folder chứa **skeleton** và **example reference** cho `testcase_builder.js`.

## Files

| File | Vai trò |
|---|---|
| `gen_testcase.template.js` | **Skeleton** — copy file này khi tạo feature mới |
| `gen_popup_claim.js` | **Example đầy đủ** — Popup Claim v7.4.0 (7 GUI + 28 Logic TC), tham khảo format `to/sub/input/output` |

## Cách dùng

QA team **KHÔNG sửa trực tiếp** file trong folder này. Chỉ copy ra `../features/`:

```powershell
Copy-Item gen_testcase.template.js ../features/gen_<your_feature>.js
```

Sau đó mở file vừa copy ở `features/`, sửa metadata + điền data, rồi chạy.

## Reference

- Engine: [../testcase_builder.js](../testcase_builder.js)
- README chính: [../README.md](../README.md)
- Skill: [.github/skills/excel-converter/SKILL.md](../../../.github/skills/excel-converter/SKILL.md)
