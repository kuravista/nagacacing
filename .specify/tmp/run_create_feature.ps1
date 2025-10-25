Param(
  [Parameter(Mandatory = $true)] [string] $ShortName,
  [Parameter(Mandatory = $true)] [string] $Description
)

$ErrorActionPreference = 'Stop'

function Get-ExistingNumbersForShortName {
  param([string] $Name)

  $numbers = @()

  # Remote branches
  try {
    $remote = git ls-remote --heads origin 2>$null
    if ($LASTEXITCODE -eq 0 -and $remote) {
      foreach ($line in ($remote -split "`n")) {
        if ($line -match ("refs/heads/([0-9]+)-" + [regex]::Escape($Name) + '$')) {
          $numbers += [int]$Matches[1]
        }
      }
    }
  } catch {}

  # Local branches
  try {
    $locals = git branch --format='%(refname:short)' 2>$null
    if ($LASTEXITCODE -eq 0 -and $locals) {
      foreach ($line in ($locals -split "`n")) {
        if ($line -match ('^([0-9]+)-' + [regex]::Escape($Name) + '$')) {
          $numbers += [int]$Matches[1]
        }
      }
    }
  } catch {}

  # Specs directories
  if (Test-Path 'specs') {
    Get-ChildItem -Path 'specs' -Directory -ErrorAction SilentlyContinue | ForEach-Object {
      if ($_.Name -match ('^([0-9]+)-' + [regex]::Escape($Name) + '$')) {
        $numbers += [int]$Matches[1]
      }
    }
  }

  return $numbers
}

$existing = Get-ExistingNumbersForShortName -Name $ShortName
if ($existing.Count -gt 0) {
  $next = ([int]($existing | Measure-Object -Maximum).Maximum) + 1
} else {
  $next = 1
}

$createScript = '.specify/scripts/powershell/create-new-feature.ps1'
if (-not (Test-Path $createScript)) {
  throw "Script not found: $createScript"
}

$json = & $createScript -Json -Number $next -ShortName $ShortName $Description

# Persist JSON for callers
$outDir = '.specify/tmp'
if (-not (Test-Path $outDir)) { New-Item -Path $outDir -ItemType Directory | Out-Null }
$outFile = Join-Path $outDir 'last-create-feature.json'
$json | Set-Content -Path $outFile -Encoding UTF8

Write-Output $json

