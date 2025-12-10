# 📋 Guide: How to Copy Supabase Database Schema

This guide explains multiple methods to export and copy your Supabase database schema.

## 🎯 Method 1: Using Supabase CLI (Recommended)

### Prerequisites
```bash
# Install Supabase CLI
npm install -g supabase

# Or using Homebrew (Mac)
brew install supabase/tap/supabase

# Or using Scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Steps

1. **Login to Supabase**
   ```bash
   supabase login
   ```

2. **Link your project**
   ```bash
   supabase link --project-ref your-project-ref
   ```
   You can find your project ref in the Supabase dashboard URL: `https://app.supabase.com/project/your-project-ref`

3. **Pull the database schema**
   ```bash
   supabase db pull
   ```
   This creates a `supabase/migrations/` folder with SQL migration files.

4. **Export schema only (no data)**
   ```bash
   supabase db dump --schema-only -f schema.sql
   ```

5. **Export schema + data**
   ```bash
   supabase db dump -f full_database.sql
   ```

---

## 🔧 Method 2: Using pg_dump Directly

### Get Connection String

1. Go to Supabase Dashboard → **Settings** → **Database**
2. Find **Connection string** → **URI** (or use the connection pooling URI)
3. Copy the connection string

### Export Schema Only

```bash
# Schema only (no data)
pg_dump "postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" \
  --schema-only \
  --no-owner \
  --no-privileges \
  -f schema.sql

# Schema with data
pg_dump "postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" \
  --no-owner \
  --no-privileges \
  -f full_database.sql
```

### Windows PowerShell Example

```powershell
# Set connection string
$connString = "postgresql://postgres:YOUR_PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres"

# Export schema only
pg_dump $connString --schema-only --no-owner --no-privileges -f schema.sql

# Export with data
pg_dump $connString --no-owner --no-privileges -f full_database.sql
```

### Options Explained

- `--schema-only`: Exports only the schema (tables, types, functions) without data
- `--no-owner`: Excludes ownership commands (useful when copying to different user)
- `--no-privileges`: Excludes privilege commands
- `-f filename.sql`: Output file name

---

## 🌐 Method 3: Using Supabase Dashboard SQL Editor

### Export Schema via SQL Queries

1. **Go to Supabase Dashboard** → **SQL Editor**

2. **Run this query to get all table definitions:**
   ```sql
   -- Get all table definitions
   SELECT 
       'CREATE TABLE ' || schemaname || '.' || tablename || ' (' || 
       string_agg(
           column_name || ' ' || data_type || 
           CASE 
               WHEN character_maximum_length IS NOT NULL 
               THEN '(' || character_maximum_length || ')'
               ELSE ''
           END ||
           CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END,
           ', '
       ) || ');' as create_table_statement
   FROM information_schema.columns
   WHERE table_schema = 'public'
   GROUP BY schemaname, tablename;
   ```

3. **Get all custom types (ENUMs):**
   ```sql
   SELECT 
       'CREATE TYPE ' || typname || ' AS ENUM (' ||
       string_agg(quote_literal(enumlabel), ', ' ORDER BY enumsortorder) ||
       ');' as create_type_statement
   FROM pg_type t
   JOIN pg_enum e ON t.oid = e.enumtypid
   WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
   GROUP BY typname;
   ```

4. **Get all indexes:**
   ```sql
   SELECT indexdef || ';' as create_index_statement
   FROM pg_indexes
   WHERE schemaname = 'public';
   ```

5. **Get all functions:**
   ```sql
   SELECT pg_get_functiondef(oid) || ';' as create_function_statement
   FROM pg_proc
   WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
   ```

6. **Get RLS policies:**
   ```sql
   SELECT 
       'CREATE POLICY ' || policyname || ' ON ' || schemaname || '.' || tablename ||
       ' AS ' || permissive || ' FOR ' || cmd ||
       ' USING (' || qual || ')' ||
       CASE WHEN with_check IS NOT NULL THEN ' WITH CHECK (' || with_check || ')' ELSE '' END ||
       ';' as create_policy_statement
   FROM pg_policies
   WHERE schemaname = 'public';
   ```

---

## 📦 Method 4: Complete Schema Export Script

Create a PowerShell script to automate the export:

```powershell
# export_schema.ps1
param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectRef,
    
    [Parameter(Mandatory=$true)]
    [string]$Password,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputFile = "supabase_schema.sql",
    
    [Parameter(Mandatory=$false)]
    [switch]$IncludeData
)

$connString = "postgresql://postgres:${Password}@db.${ProjectRef}.supabase.co:5432/postgres"

if ($IncludeData) {
    Write-Host "Exporting schema with data..."
    pg_dump $connString --no-owner --no-privileges -f $OutputFile
} else {
    Write-Host "Exporting schema only..."
    pg_dump $connString --schema-only --no-owner --no-privileges -f $OutputFile
}

Write-Host "Schema exported to: $OutputFile"
```

Usage:
```powershell
.\export_schema.ps1 -ProjectRef "your-project-ref" -Password "your-password"
.\export_schema.ps1 -ProjectRef "your-project-ref" -Password "your-password" -IncludeData
```

---

## 🔄 Method 5: Copy Schema to Another Supabase Project

### Using Supabase CLI

1. **Export from source project:**
   ```bash
   supabase link --project-ref source-project-ref
   supabase db dump --schema-only -f schema.sql
   ```

2. **Import to target project:**
   ```bash
   supabase link --project-ref target-project-ref
   supabase db push
   ```

### Using SQL File

1. **Export schema** (using any method above)

2. **Import to new project:**
   - Go to target Supabase Dashboard → **SQL Editor**
   - Copy and paste the contents of `schema.sql`
   - Click **Run**

---

## 📝 Method 6: Export Specific Tables Only

```bash
# Export only specific tables
pg_dump "postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres" \
  --schema-only \
  --table=products \
  --table=users \
  --table=categories \
  -f specific_tables.sql
```

---

## ✅ Best Practices

1. **Always export schema-only first** for version control
2. **Test imports** on a staging project before production
3. **Review RLS policies** - they may need adjustments for new projects
4. **Check for custom functions** - they might reference specific schemas
5. **Export extensions separately** - some extensions might not be available in target

---

## 🚨 Important Notes

- **Connection Pooling**: Use connection pooling URI for better performance:
  ```
  postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true
  ```

- **SSL Required**: Supabase requires SSL. Add `?sslmode=require` if needed:
  ```
  postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
  ```

- **Service Role Key**: For programmatic access, use service role key instead of password

- **RLS Policies**: Row Level Security policies are schema-specific and may need updates

---

## 🔍 Verify Exported Schema

After exporting, verify the schema file:

```bash
# Check file size (should be > 0)
Get-Item schema.sql | Select-Object Length

# View first few lines
Get-Content schema.sql -Head 50

# Count CREATE TABLE statements
Select-String -Path schema.sql -Pattern "CREATE TABLE" | Measure-Object
```

---

## 📚 Additional Resources

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [pg_dump Documentation](https://www.postgresql.org/docs/current/app-pgdump.html)
- [Supabase Database Guide](https://supabase.com/docs/guides/database)



