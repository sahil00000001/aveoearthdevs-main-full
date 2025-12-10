# AveoEarth Admin Dashboard

A comprehensive admin dashboard for the AveoEarth sustainable e-commerce marketplace, built with Next.js 15.5.0, React 19.1.0, and Tailwind CSS v4.

## 🌟 Features

### 📊 **Analytics & Reporting**
- **Real-time Dashboard**: Overview of key metrics, revenue trends, and user activity
- **Advanced Analytics**: Revenue analytics, user growth charts, conversion tracking
- **Custom Reports**: Exportable reports with multiple time ranges and filters
- **Visual Charts**: Interactive charts for sales, users, products, and revenue data

### 👥 **User Management**
- **User Overview**: Complete user list with search and filtering
- **Role Management**: Manage buyer, supplier, and admin roles
- **Status Control**: Activate, suspend, or delete user accounts
- **Bulk Actions**: Perform actions on multiple users simultaneously
- **User Analytics**: Track user activity, orders, and spending patterns

### 🏪 **Supplier Management**
- **Supplier Verification**: Review and approve supplier applications
- **Document Management**: View and verify business documents
- **Performance Tracking**: Monitor supplier performance and ratings
- **Revenue Analytics**: Track supplier-generated revenue
- **Status Management**: Approve, reject, or suspend suppliers

### 📦 **Product Management**
- **Product Review**: Approve or reject product submissions
- **Inventory Management**: Monitor stock levels and product status
- **Category Management**: Organize products by categories
- **Bulk Operations**: Enable/disable multiple products
- **Product Analytics**: Track best-selling products and performance

### 📋 **Order Management**
- **Order Overview**: Complete order list with status tracking
- **Order Details**: Detailed view of individual orders
- **Status Updates**: Update order status and tracking information
- **Order Analytics**: Revenue tracking and order trends
- **Customer Support**: Handle order-related issues

### ⚙️ **System Settings**
- **General Settings**: Site configuration, timezone, currency
- **Notification Settings**: Configure email and system notifications
- **Security Settings**: Password policies, 2FA, session management
- **Payment Settings**: Configure payment gateways and commission rates
- **Feature Flags**: Enable/disable platform features
- **Integrations**: Manage third-party integrations (Analytics, Email, etc.)

## 🎨 **Design System**

### **Color Palette**
- **Primary**: Emerald Green (#047857) - Sustainable, eco-friendly theme
- **Secondary**: Forest Green (#065f46) - Deep, professional
- **Accent**: Sage Green (#6b9080) - Soft, natural
- **Neutral**: Gray scale for text and backgrounds
- **Status Colors**: Success (green), Warning (yellow), Error (red), Info (blue)

### **Typography**
- **Primary Font**: Poppins - Clean, modern, readable
- **Secondary Font**: Reem Kufi - For Arabic text support
- **Monospace**: Geist Mono - For code and data display

### **Components**
- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Consistent styling with hover states
- **Forms**: Clean inputs with focus states
- **Tables**: Responsive with sorting and filtering
- **Modals**: Centered overlays with backdrop blur

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+
- Next.js 15.5.0
- React 19.1.0
- Tailwind CSS v4

### **Installation**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access admin dashboard
http://localhost:3000/admin/dashboard
```

### **Authentication**
- Admin login: `/admin/login`
- Role-based access control
- JWT token authentication
- Session management

## 📁 **File Structure**

```
frontend/src/
├── app/admin/
│   ├── dashboard/page.jsx          # Main dashboard
│   ├── login/page.jsx              # Admin login
│   └── layout.js                   # Admin layout wrapper
├── components/admin/
│   ├── AdminSidebar.jsx            # Navigation sidebar
│   ├── AdminTopbar.jsx             # Top navigation bar
│   ├── screens/                    # Dashboard screens
│   │   ├── DashboardScreen.jsx     # Overview dashboard
│   │   ├── AnalyticsScreen.jsx     # Analytics & reports
│   │   ├── UsersScreen.jsx         # User management
│   │   ├── SuppliersScreen.jsx     # Supplier management
│   │   ├── ProductsScreen.jsx      # Product management
│   │   ├── OrdersScreen.jsx        # Order management
│   │   └── SettingsScreen.jsx      # System settings
│   └── ui/                         # Reusable UI components
└── services/
    └── adminService.js             # Admin API service
```

## 🔧 **API Integration**

### **Admin Service**
The `adminService.js` provides a comprehensive API layer for admin operations:

```javascript
// Dashboard analytics
await adminService.getDashboardStats();
await adminService.getAnalytics(params);

// User management
await adminService.getAllUsers(params);
await adminService.updateUserStatus(userId, status);

// Product management
await adminService.getAllProducts(params);
await adminService.reviewProduct(productId, approved, notes);

// Order management
await adminService.getAllOrders(params);
await adminService.getOrderAnalytics(params);

// Settings
await adminService.getSettings();
await adminService.updateSettings(settings);
```

### **Caching**
- Intelligent caching system for API responses
- 5-minute cache duration for admin data
- Automatic cache invalidation on updates
- Fallback to mock data when API fails

## 📱 **Responsive Design**

### **Breakpoints**
- **Mobile**: < 768px - Collapsible sidebar, stacked layout
- **Tablet**: 768px - 1024px - Adjusted spacing and sizing
- **Desktop**: > 1024px - Full sidebar and multi-column layout

### **Mobile Features**
- Hamburger menu for navigation
- Touch-friendly buttons and inputs
- Swipe gestures for tables
- Optimized forms for mobile input

## 🔐 **Security Features**

### **Authentication**
- JWT token-based authentication
- Role-based access control (RBAC)
- Session timeout management
- Secure password policies

### **Authorization**
- Admin-only access to dashboard
- Feature-level permissions
- API endpoint protection
- Secure data transmission

### **Data Protection**
- Input validation and sanitization
- XSS protection
- CSRF protection
- Secure API communication

## 📊 **Analytics Features**

### **Dashboard Metrics**
- Total revenue and growth
- Order count and trends
- User registration and activity
- Product performance
- Supplier metrics

### **Charts & Visualizations**
- Revenue trend charts
- User growth graphs
- Product performance bars
- Conversion funnel analysis
- Geographic distribution maps

### **Export Capabilities**
- PDF report generation
- CSV data export
- Excel spreadsheet export
- Custom date range reports

## 🎯 **Performance Optimizations**

### **Loading States**
- Skeleton loaders for better UX
- Progressive loading for large datasets
- Optimistic updates for better responsiveness

### **Caching Strategy**
- API response caching
- Component-level memoization
- Image optimization
- Bundle splitting

### **Error Handling**
- Graceful error boundaries
- User-friendly error messages
- Retry mechanisms
- Fallback data display

## 🧪 **Testing**

### **Component Testing**
```bash
# Run component tests
npm run test:components

# Run with coverage
npm run test:coverage
```

### **Integration Testing**
```bash
# Run integration tests
npm run test:integration
```

## 🚀 **Deployment**

### **Production Build**
```bash
# Build for production
npm run build

# Start production server
npm start
```

### **Environment Variables**
```env
NEXT_PUBLIC_API_BASE=http://localhost:8000
NEXT_PUBLIC_ADMIN_URL=http://localhost:3000/admin
```

## 🔄 **Updates & Maintenance**

### **Version Control**
- Semantic versioning
- Changelog maintenance
- Feature flag system
- Rollback capabilities

### **Monitoring**
- Error tracking
- Performance monitoring
- User analytics
- System health checks

## 📞 **Support**

### **Documentation**
- Component documentation
- API documentation
- User guides
- Video tutorials

### **Contact**
- Technical support: admin@aveoearth.com
- Bug reports: GitHub Issues
- Feature requests: GitHub Discussions

## 🎉 **Contributing**

### **Development Setup**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### **Code Standards**
- ESLint configuration
- Prettier formatting
- TypeScript support
- Component documentation

---

**Built with ❤️ for sustainable e-commerce** 🌱
