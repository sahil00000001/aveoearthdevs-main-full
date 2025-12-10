import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/EnhancedAuthContext";
import { SearchProvider } from "./contexts/SearchContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CategoryPage from "./pages/CategoryPage";
import AllProductsPage from "./pages/AllProductsPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import OrdersPage from "./pages/OrdersPage";
import WishlistPageNew from "./pages/WishlistPageNew";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import Layout from "./components/Layout";
import TermsPage from "./pages/TermsPage.tsx";
import PrivacyPage from "./pages/PrivacyPage.tsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.tsx";
import CheckoutPage from "./pages/CheckoutPage.tsx";
import CommunityPage from "./pages/CommunityPage.tsx";
import SearchResultsPage from "./pages/SearchResultsPage";
import VendorLoginPage from "./pages/VendorLoginPage";
import VendorOnboardingPage from "./pages/VendorOnboardingPage";
import VendorDashboardPage from "./pages/VendorDashboardPage";
import VendorProductsPage from "./pages/VendorProductsPage";
import VendorOrdersPage from "./pages/VendorOrdersPage";
import VendorAnalyticsPage from "./pages/VendorAnalyticsPage";
import VendorProfilePage from "./pages/VendorProfilePage";
import VendorLayout from "./components/VendorLayout";
import DebugAuth from "./components/DebugAuth";
import EnhancedChatBot from "./components/EnhancedChatBot";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import TestRunner from "./pages/TestRunner";
import TrackOrderPage from "./pages/TrackOrderPage";
import AuthTestPage from "./pages/AuthTestPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SearchProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="category" element={<CategoryPage />} />
                <Route path="category/:slug" element={<CategoryPage />} />
                <Route path="products" element={<AllProductsPage />} />
                <Route path="product/:productId" element={<ProductPage />} />
                <Route path="search" element={<SearchResultsPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="wishlist" element={<WishlistPageNew />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="community" element={<CommunityPage />} />
                <Route path="track-order" element={<TrackOrderPage />} />
                <Route path="terms" element={<TermsPage />} />
                <Route path="privacy" element={<PrivacyPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              {/* Vendor Routes */}
              <Route path="vendor" element={<VendorLoginPage />} />
              <Route path="vendor/onboarding" element={<VendorOnboardingPage />} />
              <Route path="vendor" element={<VendorLayout />}>
                <Route path="dashboard" element={<VendorDashboardPage />} />
                <Route path="products" element={<VendorProductsPage />} />
                <Route path="orders" element={<VendorOrdersPage />} />
                <Route path="analytics" element={<VendorAnalyticsPage />} />
                <Route path="profile" element={<VendorProfilePage />} />
              </Route>
              {/* Admin Routes */}
              <Route path="admin/login" element={<AdminLoginPage />} />
              <Route path="admin/dashboard" element={<AdminDashboard />} />
              <Route path="admin" element={<AdminDashboard />} />
              {/* Test Runner Route */}
              <Route path="test-runner" element={<TestRunner />} />
              {/* Auth Test Route */}
              <Route path="auth-test" element={<AuthTestPage />} />
            </Routes>
            <DebugAuth />
            <EnhancedChatBot />
          </SearchProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
