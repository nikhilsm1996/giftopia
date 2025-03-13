import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ isLoggedIn, username, onLogout, isAdmin }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light py-3 fixed-top shadow-sm">
      <div className="container-fluid d-flex align-items-center">
        <Link className="navbar-brand" to="/" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#333' }}>
          Giftopia
        </Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse d-flex" id="navbarNav">
          {/* Search bar */}
          <div className="d-flex" style={{ maxWidth: '400px', marginRight: '20px' }}>
            <input
              className="form-control me-2 rounded-pill"
              type="search"
              placeholder="Search for Gifts"
              aria-label="Search"
            />
          </div>
          {/* Navbar links */}
          <ul className="navbar-nav ms-auto d-flex align-items-center">
            <li className="nav-item">
              <Link className="nav-link text-dark hover-effect" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-dark hover-effect" to="/products">Shop</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-dark hover-effect" to="/about">About</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-dark hover-effect" to="/contact">Contact</Link>
            </li>
            {/* Conditional rendering based on login state */}
            {isLoggedIn ? (
              <>
                <li className="nav-item ms-3">
                  <Link className="nav-link text-dark hover-effect" to="/cart">Cart</Link>
                </li>
                {!isAdmin && (
                  <>
                    <li className="nav-item ms-3">
                      <Link className="nav-link text-dark hover-effect" to="/orders">My Orders</Link>
                    </li>
                    <li className="nav-item ms-3">
                      <span className="nav-link fw-bold text-primary">Welcome, {username}!</span>
                    </li>
                  </>
                )}
                <li className="nav-item ms-3">
                  <button className="btn btn-outline-danger" onClick={onLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item ms-3">
                  <Link className="btn btn-outline-primary me-2" to="/login">Login</Link>
                </li>
                <li className="nav-item ms-3">
                  <Link className="btn btn-outline-primary" to="/signup">Signup</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
