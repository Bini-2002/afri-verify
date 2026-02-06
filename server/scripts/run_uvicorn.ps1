param(
    [string]$HostAddress = '127.0.0.1',
    [int]$Port = 8000,
    [switch]$SkipDotEnv
)

$serverDir = Split-Path -Parent $PSScriptRoot
Set-Location $serverDir

function Import-DotEnv([string]$Path) {
    if (-not (Test-Path $Path)) {
        Write-Host ("No .env found at {0} (skipping)" -f $Path)
        return
    }

    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith('#')) { return }

        $parts = $line -split '=', 2
        if ($parts.Count -ne 2) { return }

        $name = $parts[0].Trim()
        $value = $parts[1].Trim()
        if ($name) {
            Set-Item -Path ("Env:{0}" -f $name) -Value $value
        }
    }
}

if (-not $SkipDotEnv) {
    Import-DotEnv -Path '.env'
}

$py = Join-Path $serverDir '.venv\Scripts\python.exe'
if (-not (Test-Path $py)) {
    $py = Join-Path $serverDir 'venv\Scripts\python.exe'
}

if (-not (Test-Path $py)) {
    throw 'Python venv not found in server/.venv or server/venv'
}

Write-Host ("Using Python: {0}" -f $py)
& $py -m uvicorn app.main:app --host $HostAddress --port $Port --reload
