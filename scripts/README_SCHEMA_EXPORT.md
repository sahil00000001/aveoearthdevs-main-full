# 📋 How to Export Supabase Schema

## ✅ Quick Method (Recommended)

Run the auto-detection script - it will find your configuration and prompt for password if needed:

```powershell
.\scripts\auto_export_supabase_schema.ps1
```

The script will:
1. ✅ Auto-detect your project reference from `.env` files or docs
2. 🔑 Prompt you for database password (if not found in `.env`)
3. 📦 Export schema to `supabase_schema.sql`
4. 📊 Show statistics about what was exported

## 🔧 Manual Method

If you prefer to specify everything manually:

```powershell
.\scripts\export_supabase_schema.ps1 -ProjectRef "your-project-ref" -Password "your-password"
```

## 📝 Prerequisites

1. **PostgreSQL Client Tools** - Install from: https://www.postgresql.org/download/windows/
   - This includes `pg_dump` which is required for the export

2. **Supabase Credentials**:
   - **Project Ref**: Found in your Supabase Dashboard URL: `https://app.supabase.com/project/YOUR-PROJECT-REF`
   - **Database Password**: Found in Supabase Dashboard → Settings → Database → Database password

## 🎯 What Gets Exported

By default, the script exports:
- ✅ All tables and their structure
- ✅ Custom types (ENUMs)
- ✅ Indexes
- ✅ Functions and triggers
- ❌ **NO DATA** (schema only)

To include data, use:
```powershell
.\scripts\auto_export_supabase_schema.ps1 -IncludeData
```

## 📤 Output

The exported schema will be saved as `supabase_schema.sql` in the project root.

## 🔄 Next Steps

To import the schema to another Supabase project:

1. Open the target Supabase Dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `supabase_schema.sql`
4. Click **Run**

---

**Need help?** See the detailed guide: `docs/COPY_SUPABASE_SCHEMA_GUIDE.md`



