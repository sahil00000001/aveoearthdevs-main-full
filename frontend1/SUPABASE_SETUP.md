# 🚀 Supabase Backend Integration Setup Guide

This guide will help you set up the complete Supabase backend for the frontend1 project.

## 📋 Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier available)
- Git installed

## 🔧 Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `aveo-earth-frontend1`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be created (2-3 minutes)

## 🔑 Step 2: Get Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)
   - **Service role key** (starts with `eyJ...`) - Keep this secret!

## ⚙️ Step 3: Configure Environment Variables

1. Open `.env.local` in the frontend1 directory
2. Replace the placeholder values with your actual Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 🗄️ Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `database/schema.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute the schema

This will create:
- All necessary tables (users, products, categories, orders, etc.)
- Row Level Security (RLS) policies
- Sample data for testing
- Indexes for performance

## 🔐 Step 5: Configure Authentication

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Configure the following:

### Email Settings
- **Enable email confirmations**: ✅ (recommended for production)
- **Enable email change confirmations**: ✅
- **Enable secure email change**: ✅

### URL Configuration
- **Site URL**: `http://localhost:5173` (for development)
- **Redirect URLs**: Add `http://localhost:5173/**`

### Email Templates (Optional)
- Customize the email templates for signup, password reset, etc.

## 🚀 Step 6: Test the Integration

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:5173` in your browser

4. Test the following features:
   - User registration/login
   - Product browsing
   - Add to cart functionality
   - Wishlist management
   - Order creation

## 📊 Step 7: Verify Database Setup

1. In Supabase dashboard, go to **Table Editor**
2. Verify that all tables are created:
   - `users`
   - `products`
   - `categories`
   - `orders`
   - `order_items`
   - `reviews`
   - `wishlist`
   - `inventory_log`
   - `sustainability_metrics`

3. Check that sample data is populated in `products` and `categories` tables

## 🔧 Step 8: Configure Storage (Optional)

For product images and file uploads:

1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket called `product-images`
3. Set the bucket to public
4. Update the `image_url` fields in products to use Supabase storage URLs

## 🚨 Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables"**
   - Check that `.env.local` exists and has correct values
   - Restart the development server after adding environment variables

2. **"Invalid API key"**
   - Verify the API keys are copied correctly
   - Check that there are no extra spaces or characters

3. **"Row Level Security policy violation"**
   - Ensure users are properly authenticated
   - Check that RLS policies are correctly configured

4. **"Table doesn't exist"**
   - Run the schema.sql file again
   - Check that all tables were created successfully

### Debug Mode:

Add this to your `.env.local` for debugging:
```env
VITE_DEBUG=true
```

## 📈 Next Steps

1. **Customize the schema** for your specific needs
2. **Add more sample data** for testing
3. **Configure email templates** for better UX
4. **Set up monitoring** and analytics
5. **Deploy to production** when ready

## 🔒 Security Best Practices

1. **Never commit** `.env.local` to version control
2. **Use environment-specific** Supabase projects for dev/staging/prod
3. **Regularly rotate** API keys
4. **Monitor** API usage and costs
5. **Review** RLS policies regularly

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## 🆘 Support

If you encounter any issues:
1. Check the Supabase dashboard logs
2. Review the browser console for errors
3. Check the network tab for failed API calls
4. Refer to the Supabase documentation
5. Create an issue in the project repository

---

**Happy coding! 🎉**
