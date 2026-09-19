Add-Type -AssemblyName System.Drawing

$origPath = (Resolve-Path "assets\Relicus Logo Files (1).original.png").Path
$srcImg = [System.Drawing.Bitmap]::FromFile($origPath)

# The glyph source bounds in the 4000x4000 original:
# minX=1556, minY=1292, w=887, h=888, with inner glyph at w=807, h=807
# Exact inner glyph in 4000x4000: x=1596, y=1332, w=808, h=808
$srcRect = New-Object System.Drawing.Rectangle(1596, 1332, 808, 808)

# 1. Generate assets/icon.png (1024 x 1024, 24-bit RGB without alpha for iOS App Store)
$iconSize = 1024
$glyphSizeIOS = 720
$offsetIOS = [int](($iconSize - $glyphSizeIOS) / 2)
$destRectIOS = New-Object System.Drawing.Rectangle($offsetIOS, $offsetIOS, $glyphSizeIOS, $glyphSizeIOS)

$iconBmp = New-Object System.Drawing.Bitmap($iconSize, $iconSize, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$gIcon = [System.Drawing.Graphics]::FromImage($iconBmp)
$gIcon.Clear([System.Drawing.Color]::White)
$gIcon.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gIcon.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gIcon.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$gIcon.DrawImage($srcImg, $destRectIOS, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$gIcon.Dispose()

$iconPath = (Resolve-Path "assets\icon.png").Path
$iconBmp.Save($iconPath, [System.Drawing.Imaging.ImageFormat]::Png)
$iconBmp.Dispose()
Write-Host "Created assets/icon.png (1024x1024, 24-bit RGB, opaque white background)"

# 2. Generate assets/adaptive-icon.png (1024 x 1024, 32-bit ARGB, transparent background, safe-zone glyph)
$glyphSizeAndroid = 620
$offsetAndroid = [int](($iconSize - $glyphSizeAndroid) / 2)
$destRectAndroid = New-Object System.Drawing.Rectangle($offsetAndroid, $offsetAndroid, $glyphSizeAndroid, $glyphSizeAndroid)

$adaptiveBmp = New-Object System.Drawing.Bitmap($iconSize, $iconSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gAdaptive = [System.Drawing.Graphics]::FromImage($adaptiveBmp)
$gAdaptive.Clear([System.Drawing.Color]::Transparent)
$gAdaptive.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gAdaptive.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gAdaptive.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$gAdaptive.DrawImage($srcImg, $destRectAndroid, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$gAdaptive.Dispose()

$adaptivePath = (Resolve-Path "assets\adaptive-icon.png").Path
$adaptiveBmp.Save($adaptivePath, [System.Drawing.Imaging.ImageFormat]::Png)
$adaptiveBmp.Dispose()
Write-Host "Created assets/adaptive-icon.png (1024x1024, 32-bit ARGB, transparent background)"

$srcImg.Dispose()
