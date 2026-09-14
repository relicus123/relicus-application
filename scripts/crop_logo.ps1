Add-Type -AssemblyName System.Drawing
$origPath = (Resolve-Path "assets\Relicus Logo Files (1).png").Path
$backupPath = Join-Path (Split-Path $origPath) "Relicus Logo Files (1).original.png"
if (-not (Test-Path $backupPath)) {
    Copy-Item -LiteralPath $origPath -Destination $backupPath
    Write-Host "Backed up original logo to: $backupPath"
}
$srcImg = [System.Drawing.Bitmap]::FromFile($backupPath)
$rect = New-Object System.Drawing.Rectangle(1444, 1292, 1101, 1326)
$destBmp = New-Object System.Drawing.Bitmap($rect.Width, $rect.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($destBmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$destRect = New-Object System.Drawing.Rectangle(0, 0, $rect.Width, $rect.Height)
$g.DrawImage($srcImg, $destRect, $rect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()
$srcImg.Dispose()
$destBmp.Save($origPath, [System.Drawing.Imaging.ImageFormat]::Png)
$destBmp.Dispose()
Write-Host "Cropped logo saved to: $origPath"
