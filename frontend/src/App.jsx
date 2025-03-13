import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUp from './pages/SignupPage';
import ProductsPage from './pages/ProductsPage';
import UserDashboard from './pages/UserDashboard';
import Cart from './components/Cart';
import PaymentPage from './pages/PaymentPage';
import AdminRoutes from "./routes/AdminRoutes";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import UserOrders from './pages/UserOrders';
import About from './pages/AboutPage';  // ✅ Import About Page
import Contact from './pages/ContactPage'; // ✅ Import Contact Page

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    const storedIsAdmin = localStorage.getItem('isAdmin');

    if (token && storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
      setIsAdmin(storedIsAdmin === 'true');
    }
  }, []);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUsername(userData.name || userData.email);
    setIsAdmin(userData.isAdmin);
    localStorage.setItem('username', userData.name || userData.email);
    localStorage.setItem('isAdmin', userData.isAdmin);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setIsAdmin(false);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdmin');
    window.location.href = '/';
  };

  const ProtectedRoute = ({ children, requiresAuth, requiresAdmin }) => {
    if (requiresAuth && !isLoggedIn) {
      return <Navigate to="/login" />;
    }
    if (requiresAdmin && !isAdmin) {
      return <Navigate to="/" />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        {/* Wrap inside Layout */}
        <Route
          element={
            <Layout
              isLoggedIn={isLoggedIn}
              username={username}
              onLogout={handleLogout}
              isAdmin={isAdmin}
            />
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={
              isLoggedIn ? <Navigate to={isAdmin ? "/admin" : "/"} /> : <LoginPage onLoginSuccess={handleLogin} />
            }
          />
          <Route path="/signup" element={isLoggedIn ? <Navigate to="/" /> : <SignUp />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute requiresAuth={true}>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute requiresAuth={true}>
                <PaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute requiresAuth={true}>
                <UserOrders />
              </ProtectedRoute>
            }
          />
          {/* ✅ Added About & Contact Pages */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiresAuth={true} requiresAdmin={true}>
              <AdminRoutes username={username} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
