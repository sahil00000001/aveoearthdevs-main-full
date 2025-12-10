# Export Supabase Database Schema
# Usage: .\export_supabase_schema.ps1 -ProjectRef "your-project-ref" -Password "your-password" [-IncludeData]

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectRef,
    
    [Parameter(Mandatory=$true)]
    [string]$Password,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputFile = "supabase_schema.sql",
    
    [Parameter(Mandatory=$false)]
    [switch]$IncludeData,
    
    [Parameter(Mandatory=$false)]
    [switch]$UseConnectionPooling
)

# Check if pg_dump is available
try {
    $pgDumpVersion = pg_dump --version 2>&1
    Write-Host "✅ Found pg_dump: $pgDumpVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: pg_dump not found. Please install PostgreSQL client tools." -ForegroundColor Red
    Write-Host "Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

# Build connection string
$port = if ($UseConnectionPooling) { "6543" } else { "5432" }
$pgbouncer = if ($UseConnectionPooling) { "?pgbouncer=true" } else { "" }
$connString = "postgresql://postgres:${Password}@db.${ProjectRef}.supabase.co:${port}/postgres${pgbouncer}"

Write-Host "`n📦 Exporting Supabase Database Schema..." -ForegroundColor Cyan
Write-Host "   Project Ref: $ProjectRef" -ForegroundColor Gray
Write-Host "   Output File: $OutputFile" -ForegroundColor Gray
Write-Host "   Include Data: $IncludeData" -ForegroundColor Gray
Write-Host "   Connection Pooling: $UseConnectionPooling" -ForegroundColor Gray
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
try {
    Write-Host "⏳ Running pg_dump... This may take a while." -ForegroundColor Yellow
    & pg_dump $dumpArgs
    
    if ($LASTEXITCODE -eq 0) {
        $fileInfo = Get-Item $OutputFile -ErrorAction SilentlyContinue
        if ($fileInfo) {
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
            
        } else {
            Write-Host "⚠️  Warning: Export completed but output file not found." -ForegroundColor Yellow
        }
    } else {
        Write-Host "`n❌ Error: pg_dump failed with exit code $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "`n❌ Error: Failed to execute pg_dump" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n💡 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Review the exported schema file: $OutputFile" -ForegroundColor Gray
Write-Host "   2. To import to another Supabase project:" -ForegroundColor Gray
Write-Host "      - Go to Supabase Dashboard → SQL Editor" -ForegroundColor Gray
Write-Host "      - Copy and paste the contents of $OutputFile" -ForegroundColor Gray
Write-Host "      - Click 'Run'" -ForegroundColor Gray
Write-Host ""



