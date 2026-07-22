$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$logFile = Join-Path $projectRoot 'security-audit.log'
$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'

Set-Location $projectRoot
npm run security:audit | Tee-Object -FilePath $logFile -Append
Add-Content -Path $logFile -Value "--- End: $timestamp ---"
