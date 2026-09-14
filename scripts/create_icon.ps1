Add-Type -AssemblyName System.Drawing
$backupPath = (Resolve-Path "assets\Relicus Logo Files (1).original.png").Path
$destIconPath = Join-Path (Split-Path $backupPath) "relicus-icon.png"
$srcImg = [System.Drawing.Bitmap]::FromFile($backupPath)
# Icon bounds was x: 1596..2403 (w: 807), y: 1332..2139 (h: 808)
$rect = New-Object System.Drawing.Rectangle(1556, 1292, 887, 888)
$destBmp = New-Object System.Drawing.Bitmap($rect.Width, $rect.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($destBmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$destRect = New-Object System.Drawing.Rectangle(0, 0, $rect.Width, $rect.Height)
$g.DrawImage($srcImg, $destRect, $rect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()
$srcImg.Dispose()
$destBmp.Save($destIconPath, [System.Drawing.Imaging.ImageFormat]::Png)
$destBmp.Dispose()
Write-Host "Created relicus-icon.png successfully at: $destIconPath"
