import React from "react";
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
import CustomerNavigation from './CustomerNavigation'; // Updated import
import CartView from './components/CartView'; // Add this import
import Checkout from './components/Checkout'; // Add this import for Checkout page
import ViewOrders from "./components/ViewOrders";

function App() {
  return (
    <Router>
      <CustomerNavigation /> {/* Include Customer Navigation */}
      <Layout>
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
          
          {/* Cart and Checkout */}
          <Route path="/cart" element={<CartView />} />
          <Route path="/checkout" element={<Checkout />} /> {/* Add Checkout route */}

          {/* Customer view orders status */}
          <Route path="/your-orders" element={<ViewOrders/>} /> 

        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
