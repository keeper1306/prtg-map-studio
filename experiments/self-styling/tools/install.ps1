# Copies built self-styling test objects into PRTG's webroot\mapobjects on the lab VM (owner's rule: keep a copy of a Map Studio
# file before replacing it, never touch PRTG's own files, read every written file back and compare it byte for byte).
# Usage: powershell -File tools\install.ps1 table graph donut
param([Parameter(ValueFromRemainingArguments=$true)][string[]]$Types)
$ErrorActionPreference = 'Stop'
$src = Split-Path -Parent $PSScriptRoot
$dst = 'C:\Program Files (x86)\PRTG Network Monitor\webroot\mapobjects'
$bak = Join-Path ([Environment]::GetFolderPath('Desktop')) ('Claude outputs\mapobjects-backup-' + (Get-Date -Format 'yyyy-MM-dd'))
New-Item -ItemType Directory -Force $bak | Out-Null
foreach ($t in $Types) {
  $name = "map-studio-zz-$t-self-styling.htm"
  $from = Join-Path $src $name
  $to = Join-Path $dst $name
  if (-not (Test-Path $from)) { throw "not built: $name" }
  if (Test-Path $to) {
    $head = Get-Content $to -TotalCount 1
    if ($head -notmatch '^<!--Map Studio Tests:') { throw "$name in mapobjects is not a Map Studio test file; left alone" }
    $b = Join-Path $bak ($name + '.' + (Get-Date -Format 'HHmmss'))
    Copy-Item $to $b
    Write-Output "backup: $b"
  }
  # stage under a fresh name, then move into place (a reused staged path once wrote a stale copy)
  $stage = Join-Path $dst ('.' + [guid]::NewGuid().ToString('N') + '.tmp')
  Copy-Item $from $stage
  Move-Item -Force $stage $to
  $h1 = (Get-FileHash $from -Algorithm SHA256).Hash; $h2 = (Get-FileHash $to -Algorithm SHA256).Hash
  if ($h1 -ne $h2) { throw "$name differs after writing" }
  Write-Output ("installed {0}  {1} bytes  sha256 {2}  identical" -f $name, (Get-Item $to).Length, $h1.Substring(0,12))
}
