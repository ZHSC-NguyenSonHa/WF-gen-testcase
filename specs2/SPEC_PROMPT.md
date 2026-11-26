# Spec Generation Prompt — docs/specs2/

> Dùng file này khi yêu cầu AI viết spec cho một module mới.
> Copy prompt bên dưới và điền `[MODULE]` và `[MainClass]` (Activity hoặc ViewModel chính).

---

## Prompt template

```
Hãy viết spec QA cho module [MODULE] theo format docs/specs2/zscan/zscan_spec.md.

Nguồn: đọc source code trong [MODULE]/src/main/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 0 — CROSS-MODULE DISCOVERY (BẮT BUỘC, làm TRƯỚC khi đọc source)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mục tiêu: tìm ra TẤT CẢ module liên quan — không chỉ [MODULE]

Bước 0a — Tìm ai gọi module này:
  codegraph affected [MODULE]/src/main/java/
  → Ghi lại: danh sách module/file gọi vào [MODULE]

Bước 0b — Tìm entry points của tính năng:
  codegraph query [MainClass]
  → Ghi lại: nơi [MainClass] được tạo ra (new Intent / navigate / inject)
  → Với mỗi caller: đọc đoạn code gọi để biết params/state được truyền vào

Bước 0c — Tìm nơi nhận kết quả (result/callback):
  codegraph query "[MainClass]Result"   (hoặc tên event/callback)
  → Ghi lại: ai nhận kết quả, xử lý gì với nó

Bước 0d — Map toàn bộ dependency:
  codegraph context "[MODULE] [tính năng chính]"
  → Đọc kết quả, ghi ra: Entry modules → [MODULE] → Output modules

OUTPUT bắt buộc của Phase 0:
  Dependency Map:
  - Gọi vào [MODULE] từ: [module A line X], [module B line Y]
  - Params truyền vào: [param1=..., param2=...]
  - Kết quả trả ra: [event/callback → nhận bởi module Z]
  - Modules liên quan: [list]

⛔ KHÔNG được bỏ qua Phase 0. Nếu codegraph chưa index → chạy `codegraph index .` trước.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 1 — STATE ANALYSIS (trong và ngoài module)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Với MỖI module trong Dependency Map (bao gồm [MODULE] và các caller/receiver):

1a. Check login state behavior:
  codegraph context "[MODULE] login authentication user state"
  rtk grep "isLogin\|checkLogin\|requireLogin\|UNAUTHORIZED\|401" [MODULE]/src/
  → Ghi lại: điểm nào check login, behavior khi fail

1b. Check các state dimensions khác:
  - User type (old/new/guest): rtk grep "isOldUser\|userType\|isNewUser" [MODULE]/src/
  - Feature flag: rtk grep "isEnabled\|featureFlag\|config\." [MODULE]/src/
  - Permission: rtk grep "permission\|checkPermission\|shouldShow" [MODULE]/src/
  - Network: rtk grep "network\|offline\|NoInternet\|IOException" [MODULE]/src/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 2 — VIẾT SPEC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Viết [MODULE]_spec.md với các section theo thứ tự:

1. Tổng quan
2. Dependency Map  ← output từ Phase 0
3. User State Matrix  ← BẮT BUỘC, không được bỏ
4. Preconditions
5. Happy paths
6. Validate tables
7. API mapping
8. Edge cases  ← PHẢI include case từ CALLER modules, không chỉ [MODULE]
9. Error table
10. Screenshots list

FORMAT User State Matrix:
| Tính năng | Chưa đăng nhập | Đã đăng nhập | Ghi chú |
|-----------|:--------------:|:------------:|---------|
| [feature] | ✅/⚠️/❌        | ✅/⚠️/❌      | [mô tả hành vi] |

⚠️ = behavior khác   ❌ = blocked   ✅ = hoạt động bình thường

CHÚ Ý:
- Case "chưa login" thường nằm trong RESPONSE HANDLER, không phải Activity/Fragment
- Mỗi API call đều là potential auth failure point
- Edge case từ caller: "module A gọi [MODULE] với state X → [MODULE] handle thế nào?"
```

---

## Ví dụ thực tế — zscan

```
Phase 0 output cho zscan:
- Gọi vào từ: zhome/HomeFragment (clScanQRCode, IS_HOME_SCAN=true)
                zrank/RankFragment (btnScanQRCode, IS_HOME_SCAN=false)
- Params: IS_HOME_SCAN: Boolean
- Kết quả: ScanResultEvent → nhận bởi zrank/RankViewModel (rankup flow)
           WaitingTicketEvent → nhận bởi zhome/HomeViewModel (waiting flow)
- Modules liên quan: zhome, zrank, zcommon (shared models), app (navigation)

→ AI phải đọc zhome + zrank để biết:
  - zhome gọi scan bất kể login state → scan mở được, nhưng waiting ticket API không cần login
  - zrank chỉ show btnScanQRCode khi user đã login (check ở RankFragment)
    → Nhưng nếu user thoát → login lại → quay lại rank → button available
  - ScanQR từ rank: nếu API trả 401 → popup login, KHÔNG navigate back to rank
```

---

## Checklist review spec trước khi commit

- [ ] Có section "Dependency Map" (ai gọi, ai nhận)
- [ ] Có section "User State Matrix"
- [ ] Matrix cover cả logged-in VÀ logged-out
- [ ] Edge cases có ít nhất 1 case từ CALLER module (không chỉ [MODULE] nội bộ)
- [ ] Mọi API endpoint có row trong matrix
- [ ] Có screenshot cho case "chưa đăng nhập" (MANUAL nếu cần)

---

## Anti-patterns AI thường bỏ sót

| Pattern | Lý do bỏ sót | Cách tìm |
|---------|-------------|----------|
| Login popup khi scan | Logic nằm trong ViewModel response handler | `codegraph query onScanResult` |
| Caller check login trước khi mở module | AI chỉ đọc module target, bỏ qua caller | `codegraph affected [MODULE]/` |
| Kết quả scan ảnh hưởng state của module khác | Cross-module event/callback | `codegraph query [ResultEvent]` |
| Feature bị disable cho user type | Flag check ở caller, không phải target | `codegraph context "[feature] user type"` |
| API fail silently khi không có token | HTTP 401 handler không hiện UI | `rtk grep "401\|UNAUTHORIZED" [MODULE]/src/` |
| Params từ caller quyết định behavior | IS_HOME_SCAN, mode, type, flag... | Đọc kỹ Intent/Args ở caller site |
