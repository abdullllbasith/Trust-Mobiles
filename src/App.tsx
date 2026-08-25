import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuthStore } from "@/store/authStore";

import About from "@/pages/About";
import Contact from "@/pages/Contact";
import TradeIn from "@/pages/TradeIn";

import Shop from "@/pages/Shop";
import ProductDetails from "@/pages/ProductDetails";
import Cart from "@/pages/Cart";
import Wishlist from "@/pages/Wishlist";
import Checkout from "@/pages/Checkout";
import AdminLogin from "@/pages/Admin/Login";
import AdminDashboard from "@/pages/Admin/Dashboard";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin } = useAuthStore();

  if (!isAuthenticated() || !isAdmin()) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
        </Route>

        <Route path="/" element={<Layout />}>
          <Route path="shop" element={<Shop />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="trade-in" element={<TradeIn />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="cart" element={<Cart />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="login" element={<Navigate to="/" replace />} />
          <Route path="register" element={<Navigate to="/" replace />} />
          <Route path="dashboard" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
