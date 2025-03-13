import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ isLoggedIn, username, onLogout, isAdmin }) => {
  return (
    <div className="d-flex flex-column min-vh-100"> {/* Ensures full page height */}
      <Navbar 
        isLoggedIn={isLoggedIn}
        username={username}
        onLogout={onLogout}
        isAdmin={isAdmin}
      />
      
      {/* Main Content Area */}
      <div className="flex-grow-1" style={{ marginTop: '80px' }}>
        <Outlet />
      </div>

      {/* Footer at the bottom */}
      <Footer />
    </div>
  );
};

export default Layout;
