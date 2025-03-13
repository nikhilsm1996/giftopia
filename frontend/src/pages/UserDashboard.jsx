import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../components/DashboardSidebar";
import Profile from "../components/DashboardProfile";
import Orders from "../components/DashboardOrders";
import Wishlist from "../components/DashboardWishlist";
import Cart from "../components/Cart";
import ProductsPage from "../pages/ProductsPage"; // Import the ProductsPage

const UserDashboard = () => {
  return (
    <div className="container-fluid mt-5">
      {/* Sidebar and Main Content */}
      <div className="d-flex flex-column">
        <Sidebar />

        {/* Main Content */}
        <div className="content p-4">
          <Routes>
            <Route path="profile" element={<Profile />} />
            <Route path="orders" element={<Orders />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="cart" element={<Cart />} />
          </Routes>

          {/* 🛍 Display Products below the dashboard content */}
          <ProductsPage />
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
