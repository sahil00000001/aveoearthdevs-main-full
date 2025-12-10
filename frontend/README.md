# AveoEarth E-commerce Platform - Knowledge Transfer Guide

## 📋 Table of Contents
1. [Tech Stack Overview](#tech-stack-overview)
2. [Project Structure](#project-structure)
3. [Frontend Architecture](#frontend-architecture)
4. [Key Components & Integration](#key-components--integration)
5. [Services & API Integration](#services--api-integration)
6. [Styling & Design System](#styling--design-system)
7. [Authentication & State Management](#authentication--state-management)
8. [Future Development Opportunities](#future-development-opportunities)
9. [Getting Started](#getting-started)

---

## 🛠 Tech Stack Overview

### **Core Framework**
- **Next.js 15.5.0** - React framework with App Router
- **React 19.1.0** - UI library with latest features
- **Node.js** - Runtime environment

### **Styling & UI**
- **Tailwind CSS v4** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **Custom Fonts**:
  - Poppins (local)
  - Reem Kufi (local)
  - EB Garamond (Google Fonts)
  - Geist Sans/Mono (Google Fonts)

### **Development Tools**
- **ESLint** - Code linting
- **Turbopack** - Fast bundler (Next.js built-in)
- **TypeScript** - Type safety (configured but not fully implemented)

### **Key Dependencies**
```json
{
  "@heroicons/react": "^2.2.0",     // Heroicons for UI icons
  "lucide-react": "^0.542.0",       // Lucide icons
  "next": "15.5.0",                 // Next.js framework
  "react": "19.1.0",                // React library
  "react-dom": "19.1.0"             // React DOM
}
```

---

## 📁 Project Structure

```
frontend/
├── .env.local                    # Environment variables
├── .env.local.example           # Environment template
├── .next/                       # Next.js build output
├── node_modules/                # Dependencies
├── public/                      # Static assets
│   ├── fonts/                   # Custom fonts
│   ├── *.jpg, *.png, *.svg      # Images and icons
│   └── *.mp4                    # Videos
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── account/             # User account pages
│   │   ├── admin/               # Admin dashboard
│   │   ├── cart/                # Shopping cart
│   │   ├── checkout/            # Checkout process
│   │   ├── contactus/           # Contact page
│   │   ├── designGuide/         # Design system guide
│   │   ├── explore/             # Product exploration
│   │   ├── login/               # Authentication
│   │   ├── products/            # Product pages
│   │   ├── signup/              # Registration
│   │   ├── vendor/              # Vendor dashboard
│   │   ├── layout.js            # Root layout
│   │   ├── page.jsx             # Home page
│   │   └── globals.css          # Global styles
│   ├── components/              # Reusable components
│   │   ├── address/             # Address management
│   │   ├── admin/               # Admin components
│   │   ├── ai/                  # AI chat components
│   │   ├── cart/                # Cart components
│   │   ├── checkout/            # Checkout components
│   │   ├── dashboard/           # Dashboard components
│   │   ├── esg/                 # ESG/sustainability components
│   │   ├── explore/             # Product exploration
│   │   ├── forms/               # Form components
│   │   ├── layout/              # Layout components
│   │   ├── search/              # Search components
│   │   ├── ui/                  # UI primitives
│   │   └── vendor/              # Vendor dashboard
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utility libraries
│   └── services/                # API service layer
├── tailwind.config.js           # Tailwind configuration
├── next.config.mjs              # Next.js configuration
├── package.json                 # Dependencies & scripts
├── jsconfig.json                # JavaScript configuration
└── eslint.config.mjs            # ESLint configuration
```

---

## 🏗 Frontend Architecture

### **App Router Structure**
The application uses Next.js 15's App Router with the following key features:

- **File-based routing** in `src/app/`
- **Layout composition** with `layout.js`
- **Server Components** by default
- **Client Components** marked with `"use client"`

### **Component Organization**
```
components/
├── ui/              # Design system primitives
├── layout/          # Page layout components
├── vendor/          # Vendor-specific components
├── admin/           # Admin dashboard components
├── cart/            # Shopping cart components
├── checkout/        # Checkout flow components
├── forms/           # Form components
├── search/          # Search and filter components
├── esg/             # Sustainability features
└── ai/              # AI-powered features
```

---

## 🔧 Key Components & Integration

### **Layout Components**

#### **1. Root Layout (`layout.js`)**
```javascript
// Context Providers: Auth, Cart, Orders
// Font loading: Poppins, Reem Kufi, EB Garamond, Geist
// Global styles and metadata
```

#### **2. Navbar (`components/layout/Navbar.jsx`)**
- User authentication state
- Navigation links
- Cart indicator
- Mobile-responsive design

#### **3. Footer (`components/layout/Footer.jsx`)**
- Site links and information
- Social media integration
- Newsletter signup

#### **4. Vendor Layout (`components/layout/VendorLayout.jsx`)**
- Sidebar navigation
- Vendor-specific routing
- Authentication guards

### **UI Components (`components/ui/`)**
- **Button.jsx** - Consistent button styles
- **Card.jsx** - Card containers
- **ProductCard.jsx** - Product display
- **CategoryCard.jsx** - Category navigation
- **FileUpload.jsx** - File upload functionality
- **ProductQuickView.jsx** - Product preview modal

### **Vendor Dashboard Components**

#### **Core Components:**
- **VendorSidebar.jsx** - Navigation sidebar
- **DashboardContent.jsx** - Main dashboard view
- **DashboardStats.jsx** - Statistics cards
- **ProductsContent.jsx** - Product management
- **OrdersContent.jsx** - Order management
- **InventoryContent.jsx** - Inventory tracking
- **AnalyticsContent.jsx** - Performance analytics
- **SettingsContent.jsx** - Account settings

#### **Product Management:**
```
vendor/products/
├── ProductsHeader.jsx      # Section header with add button
├── ProductsTable.jsx       # Product listing table
├── ProductTableHeader.jsx  # Table headers (hidden on mobile)
├── ProductRow.jsx          # Individual product row
├── ProductsSearch.jsx      # Search and filter controls
└── AddProductModal.jsx     # Add new product modal
```

#### **Order Management:**
```
vendor/orders/
├── OrdersHeader.jsx        # Section header
├── OrdersTable.jsx         # Order listing table
├── OrderTableHeader.jsx    # Table headers (hidden on mobile)
├── OrderRow.jsx            # Individual order row
└── OrdersSearch.jsx        # Search and filter controls
```

### **AI Components (`components/ai/`)**
- **DraggableChatModal.jsx** - AI assistant chat interface
  - Draggable functionality
  - Session management
  - Real-time messaging
  - Browser compatibility (UUID fallback)

### **ESG Components (`components/esg/`)**
- **HotDealsSection.jsx** - Featured deals
- **TopCategoriesSection.jsx** - Category navigation
- **BestSellersSection.jsx** - Popular products

---

## 🌐 Services & API Integration

### **Service Layer Architecture**
Located in `src/services/` - Clean separation of API calls:

```javascript
// Example service structure
services/
├── productsService.js       # Product CRUD operations
├── buyerOrdersService.js    # Customer order management
├── supplierOrdersService.js # Vendor order management
├── supplierAnalyticsService.js # Analytics and reporting
├── chatService.js           # AI chat functionality
├── addressService.js        # Address management
├── profileService.js        # User profile management
└── adminService.js          # Admin operations
```

### **API Integration Pattern**
```javascript
// Consistent error handling and response formatting
const productsService = {
  async getProducts(params) {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  }
};
```

### **Key API Endpoints**
- **Products**: CRUD operations, search, filtering
- **Orders**: Order management, status updates
- **Analytics**: Performance metrics, reporting
- **Authentication**: Login, signup, profile management
- **Cart**: Shopping cart operations
- **AI Chat**: Conversational AI integration

---

## 🎨 Styling & Design System

### **Tailwind CSS Configuration**
- **Custom color palette** with CSS variables
- **Responsive breakpoints**: `sm:`, `md:`, `lg:`
- **Custom fonts** loaded locally and from Google Fonts
- **Design tokens** for consistent theming

### **Color System**
```css
/* CSS Variables in globals.css */
--color-green-primary: #1b6145;
--color-green-secondary: #22c55e;
--color-success: #10b981;
--color-warning: #f59e0b;
--color-error: #ef4444;
/* ... more color tokens */
```

### **Typography Scale**
- **Headings**: Poppins font family
- **Body**: Reem Kufi for UI elements
- **Accent**: EB Garamond for special text
- **Mono**: Geist Mono for code

### **Responsive Design**
- **Mobile-first approach**
- **Breakpoint system**: `sm: 640px`, `md: 768px`, `lg: 1024px`
- **Flexible layouts** with CSS Grid and Flexbox
- **Touch-friendly** interactive elements (44px minimum)

---

## 🔐 Authentication & State Management

### **Custom Hooks**
Located in `src/hooks/`:

#### **useAuth.js**
```javascript
// Authentication state management
const { user, login, logout, isAuthenticated } = useAuth();
```

#### **useCart.js**
```javascript
// Shopping cart state
const { cart, addToCart, removeFromCart, cartTotal } = useCart();
```

#### **useOrders.js**
```javascript
// Order management
const { orders, createOrder, updateOrderStatus } = useOrders();
```

### **Context Providers**
- **AuthProvider** - User authentication state
- **CartProvider** - Shopping cart state
- **OrdersProvider** - Order management state

### **Authentication Flow**
1. **Login/Signup** pages with form validation
2. **JWT token** storage in localStorage
3. **Protected routes** with authentication guards
4. **Role-based access** (buyer, supplier, admin)

---

## 🚀 Future Development Opportunities

### **High Priority Features**

#### **1. Enhanced Mobile Experience**
- [ ] Progressive Web App (PWA) capabilities
- [ ] Offline functionality for product browsing
- [ ] Push notifications for order updates
- [ ] Mobile-specific payment flows

#### **2. Advanced Search & Filtering**
- [ ] AI-powered product recommendations
- [ ] Visual search with image recognition
- [ ] Advanced filtering (price ranges, sustainability scores)
- [ ] Search analytics and insights

#### **3. Vendor Tools Enhancement**
- [ ] Bulk product management
- [ ] Advanced analytics dashboard
- [ ] Automated inventory management
- [ ] Multi-channel selling integration

#### **4. Sustainability Features**
- [ ] Carbon footprint calculator
- [ ] ESG score visualization
- [ ] Supplier sustainability tracking
- [ ] Green shipping options

### **Medium Priority Features**

#### **5. Social Commerce**
- [ ] Product reviews and ratings
- [ ] User-generated content
- [ ] Social sharing integration
- [ ] Community features

#### **6. Internationalization**
- [ ] Multi-language support
- [ ] Currency conversion
- [ ] Regional shipping rules
- [ ] Localized content

#### **7. Performance Optimization**
- [ ] Image optimization pipeline
- [ ] Caching strategies
- [ ] Bundle size optimization
- [ ] Core Web Vitals improvement

### **Technical Debt & Improvements**

#### **8. Code Quality**
- [ ] Full TypeScript migration
- [ ] Comprehensive test coverage
- [ ] Component documentation
- [ ] API documentation with OpenAPI

#### **9. Developer Experience**
- [ ] Storybook for component development
- [ ] Automated deployment pipeline
- [ ] Development environment setup
- [ ] Code generation tools

#### **10. Security Enhancements**
- [ ] Advanced authentication (2FA, social login)
- [ ] Payment security improvements
- [ ] Data encryption at rest
- [ ] GDPR compliance features

### **Integration Opportunities**

#### **11. Third-party Integrations**
- [ ] Payment gateways (Stripe, PayPal)
- [ ] Shipping providers (FedEx, UPS)
- [ ] Marketing tools (email, SMS)
- [ ] Analytics platforms (Google Analytics, Mixpanel)

#### **12. API Ecosystem**
- [ ] Public API for third-party integrations
- [ ] Webhook system for real-time updates
- [ ] Mobile app API endpoints
- [ ] Partner integration APIs

---

## 🏁 Getting Started

### **Prerequisites**
```bash
Node.js 18+
npm or yarn
```

### **Installation**
```bash
# Clone the repository
git clone <repository-url>
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

### **Available Scripts**
```json
{
  "dev": "next dev --turbopack",     // Development with Turbopack
  "build": "next build --turbopack", // Production build
  "start": "next start",             // Production server
  "lint": "eslint"                   // Code linting
}
```

### **Development Workflow**
1. **Feature Development**: Create feature branch from `main`
2. **Code Standards**: Follow ESLint rules and component patterns
3. **Testing**: Test components across different screen sizes
4. **Responsive Design**: Ensure mobile-first approach
5. **Performance**: Optimize images and bundle size

### **Key Files to Understand**
- `src/app/layout.js` - Root layout and providers
- `src/app/page.jsx` - Home page structure
- `tailwind.config.js` - Styling configuration
- `src/services/` - API integration patterns
- `src/components/vendor/` - Dashboard architecture

### **Architecture Principles**
- **Component Composition** over inheritance
- **Separation of Concerns** (services, components, hooks)
- **Responsive First** design approach
- **Accessibility** considerations
- **Performance** optimization

---

## 📞 Support & Documentation

### **Current Documentation**
- `DESIGN_GUIDE.md` - Design system guidelines
- `README.md` - Project overview
- Component-level documentation in code comments

### **Recommended Next Steps**
1. Set up automated testing framework
2. Create comprehensive API documentation
3. Implement error monitoring and logging
4. Establish code review processes
5. Plan for scalability and performance monitoring

---

*This knowledge transfer guide provides a comprehensive overview of the AveoEarth e-commerce platform. The next developer should focus on understanding the component architecture and service layer patterns before implementing new features.*