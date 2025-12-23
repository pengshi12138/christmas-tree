# Download Google Fonts .woff2 files and generate public/fonts/fonts.css
# Usage (PowerShell):
#   .\scripts\download-fonts.ps1

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$cssUrl = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Monsieur+La+Doulaise&family=Zhi+Mang+Xing&family=Ma+Shan+Zheng&display=swap'
$outDir = Join-Path -Path $PSScriptRoot -ChildPath "..\public\fonts"

Write-Host "Fonts CSS URL:" $cssUrl
Write-Host "Output directory:" $outDir

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

try {
    Write-Host "Fetching Google Fonts CSS..."
    $css = (Invoke-WebRequest -Uri $cssUrl -UseBasicParsing -Headers @{ 'User-Agent' = 'Mozilla/5.0' }).Content
} catch {
    Write-Error "Failed to fetch CSS from $cssUrl - check network or URL."
    exit 1
}

$pattern = 'url\((https://fonts\.gstatic\.com/[^)]+)\)'
$matches = [regex]::Matches($css, $pattern) | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique

if ($matches.Count -eq 0) {
    Write-Error "No font URLs found in CSS."
    exit 1
}

Write-Host "Found" $matches.Count "font file URLs. Downloading..."

foreach ($url in $matches) {
    try {
        $fileName = [System.IO.Path]::GetFileName([uri]$url).Split('?')[0]
        $localPath = Join-Path $outDir $fileName
        if (-Not (Test-Path $localPath)) {
            Write-Host "Downloading:" $fileName
            Invoke-WebRequest -Uri $url -OutFile $localPath -UseBasicParsing -Headers @{ 'User-Agent' = 'Mozilla/5.0' }
        } else {
            Write-Host "Already exists:" $fileName
        }
        # Replace remote URL in CSS with local path (relative to site root)
        $css = $css -replace [regex]::Escape($url), "/fonts/$fileName"
    } catch {
        Write-Warning ("Failed to download {0}: {1}" -f $url, $_)
    }
}

$fontsCssPath = Join-Path $outDir 'fonts.css'
Write-Host "Writing local fonts CSS to" $fontsCssPath
[System.IO.File]::WriteAllText($fontsCssPath, $css)

Write-Host "Done. Place the generated files under public/fonts/ and update your HTML to load fonts/fonts.css"
Write-Host "Note: this downloads many .woff2 files (large)." -ForegroundColor Yellow
