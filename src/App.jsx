import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Doctor from '@/pages/Doctor';
import Treatments from '@/pages/Treatments';
import Products from '@/pages/Products';
import Blog from '@/pages/Blog';
import Contact from '@/pages/Contact';
import BlogPiles from '@/pages/BlogPiles';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import OrderConfirmed from '@/pages/OrderConfirmed';
import TrackOrder from '@/pages/TrackOrder';
import SendPrescription from '@/pages/SendPrescription';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import { CartProvider } from '@/lib/CartContext';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminOrderDetail from '@/pages/admin/AdminOrderDetail';
import AdminCustomers from '@/pages/admin/AdminCustomers';
import AdminCustomerDetail from '@/pages/admin/AdminCustomerDetail';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminInventory from '@/pages/admin/AdminInventory';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminPrescriptions from '@/pages/admin/AdminPrescriptions';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/doctor" element={<Doctor />} />
        <Route path="/treatments" element={<Treatments />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmed/:orderId" element={<OrderConfirmed />} />
        <Route path="/track-order/:orderId?" element={<TrackOrder />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/piles" element={<BlogPiles />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/send-prescription" element={<SendPrescription />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/orders/:orderId" element={<AdminOrderDetail />} />
        <Route path="/admin/customers" element={<AdminCustomers />} />
        <Route path="/admin/customers/:id" element={<AdminCustomerDetail />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/inventory" element={<AdminInventory />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/prescriptions" element={<AdminPrescriptions />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
