import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { SearchPage } from './pages/SearchPage';
import { CategoryPage } from './pages/CategoryPage';
import { DeliveryPage, ReturnsPage, StoresPage, ContactsPage, AboutPage, FAQPage, TermsPage, PrivacyPage } from './pages/StaticPages';
import { LoginPage, RegisterPage, WishlistPage, AccountPage } from './pages/UserPages';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { ComparePage } from './pages/ComparePage';
import { CartProvider } from './context/CartContext';
import { AdminProvider } from './context/AdminContext';
import { ToastContainer } from './components/Toast';
import { AnimatePresence, motion } from 'motion/react';
import React from 'react';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminReviews from './pages/admin/AdminReviews';
import AdminMenu from './pages/admin/AdminMenu';
import AdminPages from './pages/admin/AdminPages';
import AdminSliders from './pages/admin/AdminSliders';
import AdminSettings from './pages/admin/AdminSettings';
import AdminHomeBuilder from './pages/admin/AdminHomeBuilder';
import { AdminPageBuilder } from './pages/admin/AdminPageBuilder';

// Wrapper for animated routes
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="home-builder" element={<AdminHomeBuilder />} />
          <Route path="page-builder" element={<AdminPageBuilder />} />
          <Route path="menu" element={<AdminMenu />} />
          <Route path="pages" element={<AdminPages />} />
          <Route path="sliders" element={<AdminSliders />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/category/:id" element={<CategoryPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/track-order" element={<TrackOrderPage />} />
        <Route path="/delivery" element={<DeliveryPage />} />
        <Route path="/returns" element={<ReturnsPage />} />
        <Route path="/stores" element={<StoresPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

// Global Layout for public pages
function PublicLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  
  if (isAdmin) return <>{children}</>;

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col relative w-full max-w-full overflow-x-hidden">
      <Header />
      <div className="flex-1 w-full max-w-full overflow-x-hidden">
         {children}
      </div>
      <Footer />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AdminProvider>
      <CartProvider>
        <Router>
          <PublicLayout>
            <AnimatedRoutes />
          </PublicLayout>
        </Router>
      </CartProvider>
    </AdminProvider>
  );
}
