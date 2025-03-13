import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import AdminDashboard from '../pages/AdminDashboard.jsx';
// import Products from '../pages/ProductsPage.jsx';
import ManageProducts from '../pages/ManageProducts.jsx';
import ManageUsers from '../pages/ManageUsers.jsx';
import ManageOrders from '../pages/ManageOrders.jsx'; // Import ManageOrders component
import ManageCoupons from '../pages/ManageCoupons.jsx'; // Import ManageOrders component
const AdminRoutes = ({ username, onLogout }) => {
  return (
    <div className="admin-layout">
      <AdminNavbar username={username} onLogout={onLogout} />
      <div className="admin-content" style={{ marginTop: '80px', padding: '20px' }}>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/products" element={<ManageProducts />} />
          <Route path="/orders" element={<ManageOrders />} /> Add this route
          <Route path="/users" element={<ManageUsers />} /> {/* Add this route */}
          <Route path="/coupons" element={<ManageCoupons />} /> {/* Add this route */}
        </Routes>
      </div>
    </div>
  );
};

export default AdminRoutes;