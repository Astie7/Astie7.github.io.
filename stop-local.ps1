param(
    [int]$Port = 3000,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path $projectRoot ".local-server.pid"
$stopped = $false

if (Test-Path $pidFile) {
    $existingPid = (Get-Content $pidFile -ErrorAction SilentlyContinue | Select-Object -First 1)
    if ($existingPid) {
        $existingProc = Get-Process -Id $existingPid -ErrorAction SilentlyContinue
        if ($existingProc) {
            Stop-Process -Id $existingPid -Force:$Force -ErrorAction SilentlyContinue
            Write-Host "Stopped Pantheverse local server (PID $existingPid)."
            $stopped = $true
        }
    }
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
}

if (-not $stopped) {
    try {
        $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop | Select-Object -First 1
        if ($conn) {
            Stop-Process -Id $conn.OwningProcess -Force:$Force -ErrorAction SilentlyContinue
            Write-Host "Stopped process listening on port $Port (PID $($conn.OwningProcess))."
            $stopped = $true
        }
    } catch {
        # Ignore if no listener is present.
    }
}

if (-not $stopped) {
    Write-Host "No local server found on port $Port."
}

