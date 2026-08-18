import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import React from 'react';
import { AnimatePresence } from 'motion/react';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RequireAdmin } from './components/RequireAdmin';
import { ConnectionBanner } from './components/ConnectionBanner';

import { HomePage } from './pages/HomePage';
import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage, OrderPage } from './pages/CheckoutPage';
import { SearchPage } from './pages/SearchPage';
import { CategoryPage } from './pages/CategoryPage';
import { DeliveryPage, ReturnsPage, StoresPage, ContactsPage, CmsPage } from './pages/StaticPages';
import { LoginPage, RegisterPage, WishlistPage, AccountPage } from './pages/UserPages';
import { ComparePage } from './pages/ComparePage';
import { NotFoundPage } from './pages/NotFoundPage';

import { CartProvider } from './context/CartContext';
import { AdminProvider } from './context/AdminContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

// Admin
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
import AdminHomeSections from './pages/admin/AdminHomeSections';
import { AdminPageBuilder } from './pages/admin/AdminPageBuilder';
import AdminProductPageSettings from './pages/admin/AdminProductPageSettings';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Admin — gated on the client, and independently enforced on every API route */}
        <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="home-builder" element={<AdminHomeBuilder />} />
          <Route path="home-sections" element={<AdminHomeSections />} />
          <Route path="page-builder" element={<AdminPageBuilder />} />
          <Route path="product-page" element={<AdminProductPageSettings />} />
          <Route path="menu" element={<AdminMenu />} />
          <Route path="pages" element={<AdminPages />} />
          <Route path="sliders" element={<AdminSliders />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Storefront */}
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order/:number" element={<OrderPage />} />
        <Route path="/category/:id" element={<CategoryPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/delivery" element={<DeliveryPage />} />
        <Route path="/payment" element={<DeliveryPage />} />
        <Route path="/returns" element={<ReturnsPage />} />
        <Route path="/stores" element={<StoresPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/page/:slug" element={<CmsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/compare" element={<ComparePage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = useLocation().pathname.startsWith('/admin');
  if (isAdmin) return <>{children}</>;

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <Header />
      <ConnectionBanner />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      {/* Router sits outermost: LanguageProvider reads the route to decide
          whether the admin or the storefront language is currently in effect. */}
      <Router>
        <LanguageProvider>
          <AuthProvider>
            <AdminProvider>
              <CartProvider>
                <PublicLayout>
                  <AnimatedRoutes />
                </PublicLayout>
              </CartProvider>
            </AdminProvider>
          </AuthProvider>
        </LanguageProvider>
      </Router>
    </ErrorBoundary>
  );
}
