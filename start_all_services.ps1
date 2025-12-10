# Start All Services for AveoEarth
# This script starts the backend, AI service, and ensures frontend is running

Write-Host "🚀 Starting AveoEarth Services..." -ForegroundColor Cyan
Write-Host ""

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
    return $connection
}

# Function to wait for service to be ready
function Wait-ForService {
    param(
        [string]$Url,
        [int]$MaxWaitSeconds = 30,
        [string]$ServiceName
    )
    $elapsed = 0
    while ($elapsed -lt $MaxWaitSeconds) {
        try {
            $response = Invoke-WebRequest -Uri $Url -TimeoutSec 2 -ErrorAction Stop
            Write-Host "✅ $ServiceName is ready!" -ForegroundColor Green
            return $true
        } catch {
            Start-Sleep -Seconds 2
            $elapsed += 2
            Write-Host "." -NoNewline -ForegroundColor Yellow
        }
    }
    Write-Host ""
    Write-Host "⚠️ $ServiceName not ready after $MaxWaitSeconds seconds" -ForegroundColor Yellow
    return $false
}

# Check if backend is already running
if (Test-Port -Port 8080) {
    Write-Host "⚠️ Port 8080 is already in use. Backend may already be running." -ForegroundColor Yellow
} else {
    Write-Host "Starting Backend Service..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; `$env:DEBUG='True'; python main.py" -WindowStyle Normal
    Start-Sleep -Seconds 3
}

# Check if AI service exists and start it
if (Test-Path "$PSScriptRoot\ai\main.py") {
    if (Test-Port -Port 8002) {
        Write-Host "⚠️ Port 8002 is already in use. AI Service may already be running." -ForegroundColor Yellow
    } else {
        Write-Host "Starting AI Service..." -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\ai'; python main.py" -WindowStyle Normal
        Start-Sleep -Seconds 2
    }
} else {
    Write-Host "ℹ️ AI Service not found (optional)" -ForegroundColor Gray
}

# Check if frontend is running
if (Test-Port -Port 5173) {
    Write-Host "✅ Frontend appears to be running on port 5173" -ForegroundColor Green
} else {
    Write-Host "Starting Frontend Service..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend1'; npm run dev" -WindowStyle Normal
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "Waiting for services to start..." -ForegroundColor Cyan
Write-Host ""

# Wait for backend
Write-Host "Checking Backend (http://localhost:8080/health)..." -NoNewline
Wait-ForService -Url "http://localhost:8080/health" -ServiceName "Backend" -MaxWaitSeconds 30

# Wait for AI service (optional)
if (Test-Path "$PSScriptRoot\ai\main.py") {
    Write-Host "Checking AI Service (http://localhost:8002/health)..." -NoNewline
    Wait-ForService -Url "http://localhost:8002/health" -ServiceName "AI Service" -MaxWaitSeconds 20
}

# Wait for frontend
Write-Host "Checking Frontend (http://localhost:5173)..." -NoNewline
Wait-ForService -Url "http://localhost:5173" -ServiceName "Frontend" -MaxWaitSeconds 20

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "🎉 Services Status:" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "Backend:   http://localhost:8080" -ForegroundColor White
Write-Host "AI:        http://localhost:8002 (optional)" -ForegroundColor White
Write-Host ""
Write-Host "💡 Check the PowerShell windows for any startup errors" -ForegroundColor Yellow
Write-Host "💡 If services aren't starting, check:" -ForegroundColor Yellow
Write-Host "   1. Python dependencies are installed (pip install -r requirements.txt)" -ForegroundColor Gray
Write-Host "   2. Node dependencies are installed (npm install)" -ForegroundColor Gray
Write-Host "   3. .env files are configured correctly" -ForegroundColor Gray
Write-Host ""
