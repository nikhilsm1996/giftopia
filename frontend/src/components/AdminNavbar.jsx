import React from "react";
import { NavLink } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

const AdminNavbar = ({ username, onLogout }) => {
  const handleLogout = (e) => {
    e.preventDefault();
    console.log("Logout button clicked");
    if (typeof onLogout === "function") {
      console.log("onLogout is a function, calling it");
      onLogout();
    } else {
      console.log("onLogout is not a function:", onLogout);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light w-100 position-fixed top-0 start-0 shadow-sm">
      <div className="container-fluid px-3">
        <span className="navbar-brand fw-bold text-dark" style={{ fontSize: "1.5rem" }}>
          Giftopia
        </span>
        <NavLink to="/admin" className="navbar-brand text-primary fw-bold ms-2">
          Admin Dashboard
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#adminNavbar"
          aria-controls="adminNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="adminNavbar">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink to="/admin/products" className="nav-link text-dark">
                Products
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/admin/orders" className="nav-link text-dark">
                Orders
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/admin/users" className="nav-link text-dark">
                Users
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/admin/coupons" className="nav-link text-dark">
                Coupons
              </NavLink>
            </li>
          </ul>
          <div className="d-flex align-items-center">
            <FaUserCircle size={24} className="text-dark me-2" />
            <span className="text-dark me-3">Welcome, {username}!</span>
            <button className="btn btn-outline-danger" onClick={handleLogout} type="button">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
