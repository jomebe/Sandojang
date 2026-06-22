Add-Type -AssemblyName System.Drawing

$assetDirectory = Join-Path $PSScriptRoot '..\assets'
New-Item -ItemType Directory -Force -Path $assetDirectory | Out-Null

$bitmap = New-Object System.Drawing.Bitmap 1024, 1024
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#F4EFE3'))

$forestBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#173F32'))
$yellowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#F4C95D'))
$paperPen = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml('#FCFAF4')), 42
$stampPen = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml('#B74D45')), 35
$stampPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$stampPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

$graphics.FillEllipse($forestBrush, 112, 112, 800, 800)
$mountain = [System.Drawing.Point[]]@(
  (New-Object System.Drawing.Point 232, 682),
  (New-Object System.Drawing.Point 444, 334),
  (New-Object System.Drawing.Point 553, 508),
  (New-Object System.Drawing.Point 648, 390),
  (New-Object System.Drawing.Point 812, 682)
)
$graphics.FillPolygon($yellowBrush, $mountain)
$graphics.DrawEllipse($stampPen, 570, 548, 230, 230)
$graphics.DrawLines($paperPen, [System.Drawing.Point[]]@(
  (New-Object System.Drawing.Point 622, 662),
  (New-Object System.Drawing.Point 675, 710),
  (New-Object System.Drawing.Point 758, 615)
))

foreach ($name in @('icon.png', 'adaptive-icon.png', 'splash-icon.png')) {
  $path = Join-Path $assetDirectory $name
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
}

$paperPen.Dispose()
$stampPen.Dispose()
$forestBrush.Dispose()
$yellowBrush.Dispose()
$graphics.Dispose()
$bitmap.Dispose()

Write-Host '산도장 아이콘 3개를 생성했습니다.'
