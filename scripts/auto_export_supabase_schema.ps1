# Auto-Export Supabase Schema
# Automatically detects configuration from .env files and exports schema

param(
    [Parameter(Mandatory=$false)]
    [string]$OutputFile = "supabase_schema.sql",
    
    [Parameter(Mandatory=$false)]
    [switch]$IncludeData
)

# Function to parse .env file
function Get-EnvValue {
    param([string]$FilePath, [string]$Key)
    
    if (-not (Test-Path $FilePath)) {
        return $null
    }
    
    $content = Get-Content $FilePath -Raw
    $pattern = "^${Key}\s*=\s*(.+?)(?:\r?\n|$)"
    $match = [regex]::Match($content, $pattern, [System.Text.RegularExpressions.RegexOptions]::Multiline)
    
    if ($match.Success) {
        $value = $match.Groups[1].Value.Trim()
        # Remove quotes if present
        if ($value -match '^["''](.+)["'']$') {
            $value = $matches[1]
        }
        return $value
    }
    
    return $null
}

# Function to extract project ref from URL
function Get-ProjectRef {
    param([string]$Url)
    
    if ($Url -match 'https?://([^.]+)\.supabase\.co') {
        return $matches[1]
    }
    if ($Url -match '@([^.]+)\.supabase\.co') {
        return $matches[1]
    }
    return $null
}

# Function to extract password from DATABASE_URL
function Get-DatabasePassword {
    param([string]$DatabaseUrl)
    
    if ($DatabaseUrl -match 'postgres://[^:]+:([^@]+)@') {
        return $matches[1]
    }
    if ($DatabaseUrl -match 'postgresql://[^:]+:([^@]+)@') {
        return $matches[1]
    }
    return $null
}

Write-Host "🔍 Detecting Supabase configuration..." -ForegroundColor Cyan

# Try to find .env files
$envPaths = @(
    "backend\.env",
    "backend\env",
    ".env",
    "env"
)

$projectRef = $null
$password = $null
$databaseUrl = $null

# Try to read from backend/.env first
foreach ($envPath in $envPaths) {
    if (Test-Path $envPath) {
        Write-Host "   Found: $envPath" -ForegroundColor Gray
        
        # Try DATABASE_URL first (contains both project ref and password)
        $databaseUrl = Get-EnvValue -FilePath $envPath -Key "DATABASE_URL"
        if ($databaseUrl) {
            $projectRef = Get-ProjectRef -Url $databaseUrl
            $password = Get-DatabasePassword -DatabaseUrl $databaseUrl
            Write-Host "   ✅ Found DATABASE_URL" -ForegroundColor Green
            break
        }
        
        # Fallback: Try SUPABASE_URL
        $supabaseUrl = Get-EnvValue -FilePath $envPath -Key "SUPABASE_URL"
        if ($supabaseUrl) {
            $projectRef = Get-ProjectRef -Url $supabaseUrl
            Write-Host "   ✅ Found SUPABASE_URL" -ForegroundColor Green
        }
    }
}

# If still no project ref, check docs
if (-not $projectRef) {
    Write-Host "   Checking documentation..." -ForegroundColor Yellow
    $docPath = "docs\BACKEND_ENV_SETUP.md"
    if (Test-Path $docPath) {
        $docContent = Get-Content $docPath -Raw
        if ($docContent -match 'ylhvdwizcsoelpreftpy') {
            $projectRef = "ylhvdwizcsoelpreftpy"
            Write-Host "   ✅ Found project ref in docs: $projectRef" -ForegroundColor Green
        }
    }
}

# Display findings
Write-Host "`n📊 Configuration Detected:" -ForegroundColor Cyan
if ($projectRef) {
    Write-Host "   Project Ref: $projectRef" -ForegroundColor Green
} else {
    Write-Host "   Project Ref: ❌ Not found" -ForegroundColor Red
}

if ($password) {
    Write-Host "   Password: ✅ Found (${password.Length} chars)" -ForegroundColor Green
} else {
    Write-Host "   Password: ❌ Not found" -ForegroundColor Red
}

# If we have project ref but no password, prompt for it
if ($projectRef -and -not $password) {
    Write-Host "`n🔑 Database password is required to export schema." -ForegroundColor Yellow
    $securePassword = Read-Host "Enter your Supabase database password" -AsSecureString
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
}

# If we still don't have project ref, ask for it
if (-not $projectRef) {
    Write-Host "`n📝 Project reference is required." -ForegroundColor Yellow
    Write-Host "   Find it in your Supabase Dashboard URL: https://app.supabase.com/project/YOUR-PROJECT-REF" -ForegroundColor Gray
    $projectRef = Read-Host "Enter your Supabase project reference"
}

# If we still don't have password, ask for it
if (-not $password) {
    Write-Host "`n🔑 Database password is required." -ForegroundColor Yellow
    Write-Host "   Find it in Supabase Dashboard → Settings → Database → Database password" -ForegroundColor Gray
    $securePassword = Read-Host "Enter your Supabase database password" -AsSecureString
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
}

# Check if pg_dump is available
try {
    $pgDumpVersion = pg_dump --version 2>&1
    Write-Host "`n✅ Found pg_dump: $pgDumpVersion" -ForegroundColor Green
} catch {
    Write-Host "`n❌ Error: pg_dump not found. Please install PostgreSQL client tools." -ForegroundColor Red
    Write-Host "Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

# Build connection string
$connString = "postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres"

Write-Host "`n📦 Exporting Supabase Database Schema..." -ForegroundColor Cyan
Write-Host "   Project Ref: $projectRef" -ForegroundColor Gray
Write-Host "   Output File: $OutputFile" -ForegroundColor Gray
Write-Host "   Include Data: $IncludeData" -ForegroundColor Gray
Write-Host ""

# Build pg_dump command
$dumpArgs = @(
    $connString,
    "--no-owner",
    "--no-privileges",
    "-f", $OutputFile
)

if (-not $IncludeData) {
    $dumpArgs += "--schema-only"
    Write-Host "   Mode: Schema only (no data)" -ForegroundColor Yellow
} else {
    Write-Host "   Mode: Full export (schema + data)" -ForegroundColor Yellow
}

# Execute pg_dump
Write-Host "⏳ Running pg_dump... This may take a while." -ForegroundColor Yellow
try {
    $result = & pg_dump $dumpArgs 2>&1
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -ne 0) {
        Write-Host "`n❌ Error: pg_dump failed with exit code $exitCode" -ForegroundColor Red
        Write-Host "   Common issues:" -ForegroundColor Yellow
        Write-Host "   - Incorrect password" -ForegroundColor Gray
        Write-Host "   - Wrong project reference" -ForegroundColor Gray
        Write-Host "   - Network/firewall issues" -ForegroundColor Gray
        exit 1
    }
    
    $fileInfo = Get-Item $OutputFile -ErrorAction SilentlyContinue
    if (-not $fileInfo) {
        Write-Host "⚠️  Warning: Export completed but output file not found." -ForegroundColor Yellow
        exit 1
    }
    
    $fileSizeKB = [math]::Round($fileInfo.Length / 1KB, 2)
    $fileSizeMB = [math]::Round($fileInfo.Length / 1MB, 2)
    $sizeDisplay = if ($fileSizeMB -gt 1) { "$fileSizeMB MB" } else { "$fileSizeKB KB" }
    
    Write-Host "`n✅ Schema exported successfully!" -ForegroundColor Green
    Write-Host "   File: $OutputFile" -ForegroundColor Gray
    Write-Host "   Size: $sizeDisplay" -ForegroundColor Gray
    
    # Count some stats
    $content = Get-Content $OutputFile -Raw
    $tableCount = ([regex]::Matches($content, "CREATE TABLE")).Count
    $typeCount = ([regex]::Matches($content, "CREATE TYPE")).Count
    $indexCount = ([regex]::Matches($content, "CREATE INDEX")).Count
    $functionCount = ([regex]::Matches($content, "CREATE FUNCTION|CREATE OR REPLACE FUNCTION")).Count
    
    Write-Host "`n📊 Statistics:" -ForegroundColor Cyan
    Write-Host "   Tables: $tableCount" -ForegroundColor Gray
    Write-Host "   Types: $typeCount" -ForegroundColor Gray
    Write-Host "   Indexes: $indexCount" -ForegroundColor Gray
    Write-Host "   Functions: $functionCount" -ForegroundColor Gray
    
    Write-Host "`n💡 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Review the exported schema file: $OutputFile" -ForegroundColor Gray
    Write-Host "   2. To import to another Supabase project:" -ForegroundColor Gray
    Write-Host "      - Go to Supabase Dashboard → SQL Editor" -ForegroundColor Gray
    Write-Host "      - Copy and paste the contents of $OutputFile" -ForegroundColor Gray
    Write-Host "      - Click 'Run'" -ForegroundColor Gray
    Write-Host ""
}
catch {
    Write-Host "`n❌ Error: Failed to execute pg_dump" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    exit 1
}

