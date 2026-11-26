# PLAN — specs2: Spec có Screenshot cho QA Auto Test

> Tài liệu lập kế hoạch triển khai hệ thống spec thế hệ 2  
> Cập nhật: 2026-07-01  
> Status: **DRAFT — chờ implement**

---

## 1. Mục tiêu

Xây dựng hệ thống tài liệu QA (`docs/specs2/`) nâng cấp từ `docs/specs/` với:

| Tính năng | specs/ (hiện tại) | specs2/ (mới) |
|-----------|-------------------|----------------|
| HTML spec | ✅ | ✅ (kế thừa) |
| Markdown spec | ✅ | ✅ (kế thừa) |
| Screenshot inline mỗi step | ❌ | ✅ |
| Caption mô tả dưới ảnh | ❌ | ✅ |
| Lightbox khi click ảnh | ❌ | ✅ |
| Placeholder khi chưa có ảnh | ❌ | ✅ |
| Script chụp ảnh qua ADB | ❌ | ✅ |
| Script chụp ảnh qua Appium + JS | ❌ | ✅ |

---

## 2. Cấu trúc thư mục

```
docs/specs2/
  PLAN.md                         ← file này
  spec2-shared.css                ← extend spec-shared.css + screenshot + lightbox
  spec2-shared.js                 ← extend spec-shared.js + lightbox handler
  capture-adb.ps1                 ← script chụp nhanh qua ADB (không cần Appium)
  appium/                         ← 1 Node.js project dùng chung cho tất cả module
    setup.md                      ← hướng dẫn cài Appium + WD/IO từ 0
    package.json                  ← deps: webdriverio, @wdio/appium-service
    wdio.conf.js                  ← WebdriverIO config (device caps, ADB port...)
    capture-zscan.js              ← script navigate + chụp ảnh cho zscan
    capture-zcoupon.js            ← (thêm sau khi zscan xong)
    capture-zbooking.js           ← (thêm sau)
    ...                           ← 1 file per module, không cài lại Appium
  zscan/
    zscan_spec.html               ← spec HTML v2 có screenshot inline
    zscan_spec.md                 ← spec Markdown v2 full detail
    res/                          ← ảnh chụp màn hình
      scan_home_initial.png
      scan_mode_member_title.png
      scan_qr_scanning.png
      scan_result_rankup_success.png
      scan_result_rankup_error_invalid.png
      scan_result_rankup_error_toolong.png
      scan_result_rankup_error_auth.png
      scan_result_rankup_error_network.png
      scan_result_rankup_error_server.png
      scan_waiting_home_enabled.png
      scan_waiting_result_success.png
      scan_waiting_error_duplicate.png
      scan_waiting_error_feature_off.png
      scan_camera_permission_dialog.png
      scan_camera_permission_denied.png
      scan_camera_permission_settings.png
```

---

## 3. Naming convention ảnh

Pattern: `[module]_[screen]_[state].png`

| Tên file | Mô tả màn hình |
|----------|----------------|
| `scan_home_initial.png` | Màn hình QR vừa mở, camera chưa bật |
| `scan_mode_member_title.png` | Màn hình chế độ tích điểm — tiêu đề 会員証 hiển thị |
| `scan_qr_scanning.png` | Camera đang hoạt động, khung ngắm QR hiển thị |
| `scan_result_rankup_success.png` | Kết quả tích điểm thành công |
| `scan_result_rankup_error_invalid.png` | Popup lỗi QR không phải của Kyubeeya |
| `scan_result_rankup_error_toolong.png` | Popup lỗi QR dài hơn 71 ký tự |
| `scan_result_rankup_error_auth.png` | Popup yêu cầu đăng nhập |
| `scan_result_rankup_error_network.png` | Popup lỗi không có mạng (có Retry/Hủy) |
| `scan_result_rankup_error_server.png` | Popup lỗi server 500/503 |
| `scan_waiting_home_enabled.png` | Màn hình chế độ lấy số thứ tự — tiêu đề QR読み取り |
| `scan_waiting_result_success.png` | QR số thứ tự hợp lệ, trả kết quả thành công |
| `scan_waiting_error_duplicate.png` | Popup lỗi đang có vé chờ |
| `scan_waiting_error_feature_off.png` | Popup lỗi tính năng bị tắt |
| `scan_camera_permission_dialog.png` | Dialog xin quyền camera lần đầu |
| `scan_camera_permission_denied.png` | Màn hình thông báo cần quyền camera (sau từ chối) |
| `scan_camera_permission_settings.png` | Màn hình Cài đặt hệ thống (cấp quyền thủ công) |

**Tổng: 16 screenshots cho zscan**

---

## 4. HTML layout mới — 2 cột step + screenshot

### Cấu trúc HTML mỗi step

```html
<!-- Step có screenshot inline -->
<div class="step-row">
  <div class="step-content">
    <div class="step">
      <p>Người dùng mở màn hình từ menu thành viên...</p>
    </div>
  </div>
  <figure class="step-screenshot">
    <img src="res/scan_mode_member_title.png"
         alt="Màn hình tích điểm — tiêu đề 会員証"
         loading="lazy"
         onerror="this.closest('figure').classList.add('img-missing')">
    <figcaption>Màn hình tích điểm — tiêu đề 会員証 hiển thị trên cùng</figcaption>
  </figure>
</div>
```

### CSS layout

```
Desktop (≥ 900px):
┌─────────────────────────────────────────────────┐
│ Sidebar │  Step content (60%)  │ Screenshot (40%) │
└─────────────────────────────────────────────────┘

Mobile (< 900px):
┌──────────────────────┐
│     Step content     │
│     Screenshot       │  ← stack dọc
└──────────────────────┘
```

### Placeholder khi ảnh chưa có

```
┌──────────────────────────┐
│  📷                      │
│  scan_mode_member_title  │  ← tên file hiển thị
│  .png                    │
│  [Chưa có ảnh]           │
└──────────────────────────┘
```

Implement bằng CSS `::after` trên `figure.img-missing` — **không cần file PNG trống**.

### Lightbox khi click ảnh

- Click ảnh → overlay fullscreen (CSS + JS thuần)
- Click overlay / Esc → đóng
- Không cần thư viện bên ngoài

---

## 5. spec2-shared.css — Các class mới thêm vào

```css
/* Layout */
.step-row          /* flex container: content + screenshot */
.step-content      /* 60% width, chứa steps */
.step-screenshot   /* 40% width, figure element */

/* Screenshot */
figure.step-screenshot img    /* bo góc, border, shadow nhẹ */
figure.step-screenshot figcaption  /* caption nhỏ bên dưới */
figure.img-missing             /* placeholder khi ảnh thiếu */
figure.img-missing::before    /* icon 📷 */
figure.img-missing::after     /* tên file + [Chưa có ảnh] */

/* Lightbox */
#lightbox-overlay   /* fixed fullscreen, backdrop blur */
#lightbox-img       /* ảnh phóng to */
#lightbox-close     /* nút × */
```

**File spec2-shared.css KHÔNG ghi đè spec-shared.css** — chỉ import thêm.
Mỗi HTML file specs2 load cả 2:
```html
<link rel="stylesheet" href="../spec-shared.css">   <!-- từ specs/ -->
<link rel="stylesheet" href="../spec2-shared.css">  <!-- thêm mới -->
```

---

## 6. Appium + JavaScript — Setup & Script

### Stack

| Component | Tool | Version |
|-----------|------|---------|
| Test runner | WebdriverIO | v8 |
| Appium driver | @wdio/appium-service | v8 |
| Android driver | appium-uiautomator2-driver | latest |
| Language | JavaScript (ESM) | Node 18+ |

### Appium cài 1 lần toàn máy

```bash
# Bước 1: Cài Appium server
npm install -g appium

# Bước 2: Cài Android driver
appium driver install uiautomator2

# Bước 3: Verify
appium --version          # expect: 2.x
adb devices               # expect: thiết bị thật hiện trong danh sách
```

### `appium/package.json`

```json
{
  "name": "specs2-appium-capture",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "capture:zscan": "node capture-zscan.js",
    "capture:zcoupon": "node capture-zcoupon.js"
  },
  "dependencies": {
    "webdriverio": "^8.0.0",
    "@wdio/appium-service": "^8.0.0"
  }
}
```

### `appium/wdio.conf.js` — config chung

```javascript
export const capabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': 'DEVICE_SERIAL',     // ← thay bằng adb devices output
  'appium:appPackage': 'com.zensho.zapp',   // ← thay bằng package name thực
  'appium:appActivity': '.MainActivity',     // ← thay bằng activity thực
  'appium:noReset': true,                   // giữ login state
  'appium:autoGrantPermissions': true,
};

export const appiumServerUrl = 'http://127.0.0.1:4723';
```

### `appium/capture-zscan.js` — flow capture

```
START
  │
  ├─ Kết nối Appium server (localhost:4723)
  ├─ Khởi động app (package + activity từ config)
  │
  ├─ SCREEN 1: Home/initial
  │   └─ saveScreenshot("../zscan/res/scan_home_initial.png")
  │
  ├─ Navigate đến màn hình QR tích điểm
  │   └─ SCREEN 2: Mode member title
  │       └─ saveScreenshot("../zscan/res/scan_mode_member_title.png")
  │
  ├─ SCREEN 3: Camera scanning
  │   └─ saveScreenshot("../zscan/res/scan_qr_scanning.png")
  │
  ├─ Inject mock QR hợp lệ → chờ kết quả
  │   └─ SCREEN 4: rankup success
  │       └─ saveScreenshot("../zscan/res/scan_result_rankup_success.png")
  │
  ├─ Inject mock QR invalid → chụp popup lỗi
  │   └─ SCREEN 5-9: các error states
  │
  ├─ Navigate đến màn hình QR số thứ tự
  │   └─ SCREEN 10-13: waiting number states
  │
  ├─ Inject permission scenarios
  │   └─ SCREEN 14-16: camera permission states
  │
END → "✅ 16 screenshots saved to docs/specs2/zscan/res/"
```

> **Ghi chú**: Một số màn hình error cần inject mock QR hoặc mock API response.
> Appium + WD/IO hỗ trợ `driver.executeScript()` cho deep link / intent injection.

---

## 7. `capture-adb.ps1` — Fallback không cần Appium

Dùng khi muốn chụp nhanh 1 màn hình đang mở trên device:

```powershell
# Usage: .\capture-adb.ps1 -Name scan_home_initial -Module zscan
param(
  [string]$Name,
  [string]$Module = "zscan"
)

$outDir = "$PSScriptRoot\$Module\res"
New-Item -ItemType Directory -Force $outDir | Out-Null

adb shell screencap -p /sdcard/tmp_capture.png
adb pull /sdcard/tmp_capture.png "$outDir\$Name.png"
adb shell rm /sdcard/tmp_capture.png

Write-Host "✅ Saved: $outDir\$Name.png"
```

**Workflow với script này:**
1. QA mở app đến màn hình cần chụp
2. Chạy: `.\capture-adb.ps1 -Name scan_home_initial -Module zscan`
3. Ảnh tự vào đúng folder → HTML hiện ảnh ngay (không cần sửa file nào)

---

## 8. Phases thực hiện

### Phase 1 — Scaffold (làm ngay, không cần Appium)

| # | File cần tạo | Mô tả |
|---|-------------|-------|
| 1 | `spec2-shared.css` | CSS mới: step-row, screenshot, placeholder, lightbox |
| 2 | `spec2-shared.js` | JS mới: lightbox handler |
| 3 | `zscan/zscan_spec.html` | HTML spec v2 — full content + 16 screenshot slots |
| 4 | `zscan/zscan_spec.md` | Markdown spec v2 — happy path + edge cases + preconditions + API notes |
| 5 | `capture-adb.ps1` | ADB capture script |
| 6 | `appium/setup.md` | Hướng dẫn cài Appium từ 0 |
| 7 | `appium/package.json` | Node.js project |
| 8 | `appium/wdio.conf.js` | WebdriverIO config template |
| 9 | `appium/capture-zscan.js` | Capture script cho zscan |

**Deliverable Phase 1:** HTML đầy đủ nội dung + placeholder ảnh hiện đúng, Appium scaffold sẵn sàng.

### Phase 2 — Appium Setup (cần thiết bị thật + terminal)

| Bước | Action | Ai làm |
|------|--------|--------|
| 2.1 | Đọc `appium/setup.md`, cài Appium + driver | Dev/QA |
| 2.2 | `adb devices` → điền serial vào `wdio.conf.js` | Dev/QA |
| 2.3 | Điền `appPackage` + `appActivity` thực tế | Dev |
| 2.4 | Chạy: `npm run capture:zscan` | AI (hoặc Dev/QA) |
| 2.5 | 16 ảnh tự fill vào `zscan/res/` → HTML cập nhật tự động | Auto |

### Phase 3 — Nhân rộng (sau zscan hoàn chỉnh)

1. Copy template zscan → module mới (zcoupon, zbooking...)
2. Thêm `appium/capture-[module].js`
3. Viết nội dung spec riêng cho module đó
4. Chạy capture → xong

**Ước tính effort mỗi module mới sau khi hệ thống sẵn:**
- CSS/JS: không cần thêm (dùng chung)
- HTML spec: ~2-4 giờ (nội dung)
- Capture script: ~1 giờ
- Chụp ảnh (Phase 2): ~30 phút

---

## 9. Checklist trước khi implement

- [ ] Xác nhận `appPackage` và `appActivity` của app (cần Dev cung cấp hoặc từ `adb shell dumpsys window`)
- [ ] Xác nhận serial thiết bị thật (`adb devices`)
- [ ] Xác nhận app đang login sẵn trên thiết bị (do config `noReset: true`)
- [ ] Confirm path `../spec-shared.css` từ `docs/specs2/zscan/` trỏ đúng `docs/specs/spec-shared.css`

> **Path spec-shared.css từ specs2/zscan/:**  
> `../spec-shared.css` → `docs/specs2/spec-shared.css` ❌ KHÔNG ĐÚNG  
> Cần dùng: `../../specs/spec-shared.css` → `docs/specs/spec-shared.css` ✅

---

## 10. Câu hỏi còn mở (cần confirm trước Phase 2)

| # | Câu hỏi | Cần ai trả lời |
|---|---------|---------------|
| 1 | `appPackage` của app là gì? | Dev |
| 2 | `appActivity` (main launcher activity) là gì? | Dev |
| 3 | Có deep link / intent để navigate thẳng đến màn hình QR không? | Dev |
| 4 | Appium có thể inject mock QR string không, hay cần build app ở debug mode? | Dev |
| 5 | specs2 có cần index.html tổng hợp (như specs/) không? | QA/PM |
