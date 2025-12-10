# 🚀 Quick Reference: Copy Supabase Schema

## ⚡ Quick Method (PowerShell Script)

```powershell
# 1. Export schema only (no data)
.\scripts\export_supabase_schema.ps1 -ProjectRef "your-project-ref" -Password "your-password"

# 2. Export with data
.\scripts\export_supabase_schema.ps1 -ProjectRef "your-project-ref" -Password "your-password" -IncludeData

# 3. Use connection pooling (faster)
.\scripts\export_supabase_schema.ps1 -ProjectRef "your-project-ref" -Password "your-password" -UseConnectionPooling
```

**Where to find Project Ref:**
- Supabase Dashboard URL: `https://app.supabase.com/project/YOUR-PROJECT-REF`
- Or: Settings → API → Project URL → Extract the ref

---

## 🖥️ Manual Method (pg_dump)

```powershell
# Schema only
pg_dump "postgresql://postgres:PASSWORD@db.PROJECT-REF.supabase.co:5432/postgres" `
  --schema-only --no-owner --no-privileges -f schema.sql

# With data
pg_dump "postgresql://postgres:PASSWORD@db.PROJECT-REF.supabase.co:5432/postgres" `
  --no-owner --no-privileges -f full_database.sql
```

---

## 📋 Supabase CLI Method

```bash
# 1. Install Supabase CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Link project
supabase link --project-ref your-project-ref

# 4. Export schema
supabase db dump --schema-only -f schema.sql
```

---

## 📤 Import to Another Project

1. **Via SQL Editor:**
   - Open target Supabase project → SQL Editor
   - Paste exported SQL file content
   - Click "Run"

2. **Via Supabase CLI:**
   ```bash
   supabase link --project-ref target-project-ref
   supabase db push
   ```

---

## 🔍 What Gets Exported

- ✅ Tables and columns
- ✅ Custom types (ENUMs)
- ✅ Indexes
- ✅ Functions and triggers
- ✅ RLS policies (if included)
- ❌ Data (unless `--IncludeData` is used)

---

## 💡 Pro Tips

1. **Always test on staging first** before production
2. **Review RLS policies** - they may need adjustments
3. **Check for custom functions** - update schema references if needed
4. **Use connection pooling** for faster exports: add `-UseConnectionPooling` flag

---

For detailed documentation, see: [COPY_SUPABASE_SCHEMA_GUIDE.md](./COPY_SUPABASE_SCHEMA_GUIDE.md)



