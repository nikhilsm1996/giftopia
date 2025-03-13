import React from "react";
import { Link } from "react-router-dom";
import { FaUser, FaBoxOpen, FaHeart, FaShoppingCart } from "react-icons/fa";

const Sidebar = () => {
  return (
    <div className="custom-sidebar d-flex d-md-flex"> {/* Ensures visibility */}
      <nav>
        <Link to="/dashboard/profile" className="text-white">
          <FaUser className="icon" /> Profile
        </Link>
        <Link to="/dashboard/orders" className="text-white">
          <FaBoxOpen className="icon" /> Orders
        </Link>
        <Link to="/dashboard/wishlist" className="text-white">
          <FaHeart className="icon" /> Wishlist
        </Link>
        <Link to="/dashboard/cart" className="text-white">
          <FaShoppingCart className="icon" /> Cart
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
