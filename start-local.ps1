param(
    [int]$Port = 3000,
    [switch]$OpenBrowser
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path $projectRoot ".local-server.pid"

function Get-ListeningProcessOnPort {
    param([int]$LocalPort)
    try {
        $conn = Get-NetTCPConnection -LocalPort $LocalPort -State Listen -ErrorAction Stop | Select-Object -First 1
        if ($conn) {
            return Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
        }
    } catch {
        return $null
    }
    return $null
}

if (Test-Path $pidFile) {
    $existingPid = (Get-Content $pidFile -ErrorAction SilentlyContinue | Select-Object -First 1)
    if ($existingPid) {
        $existingProc = Get-Process -Id $existingPid -ErrorAction SilentlyContinue
        if ($existingProc) {
            Write-Host "Pantheverse local server already running (PID $existingPid)."
            Write-Host "URL: http://localhost:$Port"
            if ($OpenBrowser) {
                Start-Process "http://localhost:$Port"
            }
            exit 0
        }
    }
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
}

$portProc = Get-ListeningProcessOnPort -LocalPort $Port
if ($portProc) {
    Write-Host "Port $Port is already in use by '$($portProc.ProcessName)' (PID $($portProc.Id))."
    Write-Host "Stop that process or run this script with another port, for example:"
    Write-Host ".\start-local.ps1 -Port 3001"
    exit 1
}

$pythonCommand = Get-Command py -ErrorAction SilentlyContinue
if ($pythonCommand) {
    $exe = "py"
} else {
    $pythonCommand = Get-Command python -ErrorAction SilentlyContinue
    if (-not $pythonCommand) {
        Write-Error "Python was not found in PATH. Install Python 3 and retry."
        exit 1
    }
    $exe = "python"
}

$proc = Start-Process -FilePath $exe -ArgumentList "-m", "http.server", "$Port" -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru
Start-Sleep -Milliseconds 700

if (-not (Get-Process -Id $proc.Id -ErrorAction SilentlyContinue)) {
    Write-Error "Failed to start local server."
    exit 1
}

$proc.Id | Set-Content -Path $pidFile -Encoding ascii

Write-Host "Pantheverse local server started."
Write-Host "PID: $($proc.Id)"
Write-Host "URL: http://localhost:$Port"
Write-Host "Stop with: .\stop-local.ps1"

if ($OpenBrowser) {
    Start-Process "http://localhost:$Port"
}

