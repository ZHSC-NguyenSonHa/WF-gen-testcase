# Capture Screenshots via ADB — Không cần Appium
# Usage: .\capture-adb.ps1 -Name <tên file> [-Module <module>]
#
# Ví dụ:
#   .\capture-adb.ps1 -Name scan_home_initial -Module zscan
#   .\capture-adb.ps1 -Name scan_qr_scanning
#
# Bước chuẩn bị:
#   1. Kết nối thiết bị Android qua USB, bật USB Debugging
#   2. Chạy: adb devices  →  thiết bị phải hiện trong danh sách
#   3. Mở app đến màn hình cần chụp
#   4. Chạy script này

param(
  [Parameter(Mandatory = $true)]
  [string]$Name,

  [string]$Module = "zscan"
)

# ── Validate ──
if (-not (Get-Command adb -ErrorAction SilentlyContinue)) {
  Write-Error "adb không tìm thấy. Đảm bảo Android SDK platform-tools đã được thêm vào PATH."
  exit 1
}

$devices = adb devices 2>&1 | Where-Object { $_ -match "\tdevice$" }
if (-not $devices) {
  Write-Error "Không có thiết bị Android nào được kết nối. Kiểm tra USB Debugging."
  exit 1
}

# ── Setup paths ──
$outDir = Join-Path $PSScriptRoot "$Module\res"
if (-not (Test-Path $outDir)) {
  New-Item -ItemType Directory -Force $outDir | Out-Null
  Write-Host "  Created: $outDir"
}

$devicePath = "/sdcard/tmp_spec_capture.png"
$localPath  = Join-Path $outDir "$Name.png"

# ── Chụp ──
Write-Host "  Capturing $Name..."
adb shell screencap -p $devicePath 2>&1 | Out-Null
adb pull $devicePath $localPath 2>&1 | Out-Null
adb shell rm $devicePath 2>&1 | Out-Null

if (Test-Path $localPath) {
  $size = (Get-Item $localPath).Length
  Write-Host "  OK  Saved: $localPath  ($([math]::Round($size/1KB, 1)) KB)"
} else {
  Write-Error "  FAIL  File không được tạo: $localPath"
}
