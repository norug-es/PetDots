param([string]$OutDir = "$(Join-Path $PSScriptRoot 'dist')")
$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$pluginZip = Join-Path $OutDir 'petdots-codex-plugin-0.1.0.zip'
$vscodeVsix = Join-Path $OutDir 'petdots-vscode-extension-0.1.0.vsix'
$legacyVscodeZip = Join-Path $OutDir 'petdots-vscode-extension-0.1.0.zip'
Remove-Item -Force -ErrorAction SilentlyContinue $pluginZip, $vscodeVsix, $legacyVscodeZip
Compress-Archive -Path (Join-Path $PSScriptRoot 'plugin\*') -DestinationPath $pluginZip
$stage = Join-Path $env:TEMP ('petdots-vsix-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Force -Path (Join-Path $stage 'extension') | Out-Null
Copy-Item -Recurse -Force (Join-Path $PSScriptRoot 'vscode-extension\*') (Join-Path $stage 'extension')
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'vscode-extension\extension.vsixmanifest') -Destination (Join-Path $stage 'extension.vsixmanifest')
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'vscode-extension\[Content_Types].xml') -Destination (Join-Path $stage '[Content_Types].xml')
Compress-Archive -Path (Join-Path $stage '*') -DestinationPath $vscodeVsix
Write-Output "Created $pluginZip"
Write-Output "Created $vscodeVsix"
