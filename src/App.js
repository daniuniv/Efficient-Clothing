import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import InventoryManagement from "./components/InventoryManagement";
import StoreManagerDashboard from "./components/StoreManagerDashboard";
import CustomerDashboard from "./components/CustomerDashboard";
import CustomerOrders from "./components/CustomerOrders";
import Reports from "./components/Reports";
import Catalog from "./components/Catalog";
import ProductDetail from "./components/ProductDetail";
import Layout from "./components/Layout";

function App() {
  return (
    <Router>
      <Layout>
        {/* Routes */}
        <Routes>
          {/* Login and Register */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Store Manager */}
          <Route path="/store-manager-dashboard" element={<StoreManagerDashboard />} />
          <Route path="/inventory-management" element={<InventoryManagement />} />
          <Route path="/customer-orders" element={<CustomerOrders />} />
          <Route path="/reports" element={<Reports />} />

          {/* Customer */}
          <Route path="/customer-dashboard" element={<CustomerDashboard />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:productId" element={<ProductDetail />} />

          {/* Default */}
          <Route path="/" element={<Login />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
