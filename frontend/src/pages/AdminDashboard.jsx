import React, { useState, useEffect } from "react";
import AdminNavbar from "../components/AdminNavbar";
import { Outlet, useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("Admin");
  const [dashboardStats, setDashboardStats] = useState({
    ordersThisWeek: 0,
    orderChangePercentage: 0,
    paymentsThisWeek: 0,
    pendingOrders: 0,
    processingOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    // Remove auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Use window.location for a full page refresh
    window.location.href = '/login';
  };

  useEffect(() => {
    // Try to get username from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.name) {
      setUsername(user.name);
    }
  
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Only attempt to fetch if there's a token
        if (!token) {
          setError("Authentication required");
          setLoading(false);
          return;
        }
        
        // Get all orders using fetch
        const response = await fetch("/api/orders/admin/orders", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const orders = await response.json();
        
        // Calculate statistics
        const now = new Date();
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const twoWeeksAgo = new Date(oneWeekAgo);
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7);
        
        // Filter orders for different time periods
        const ordersThisWeek = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= oneWeekAgo && orderDate <= now;
        });
        
        const ordersPreviousWeek = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= twoWeeksAgo && orderDate < oneWeekAgo;
        });
        
        // Calculate percentage change - handle potential NaN issues
        let orderChangePercentage = 0;
        if (ordersPreviousWeek.length > 0) {
          orderChangePercentage = ((ordersThisWeek.length - ordersPreviousWeek.length) / ordersPreviousWeek.length) * 100;
        } else if (ordersThisWeek.length > 0) {
          orderChangePercentage = 100; // If no orders previous week but some this week, that's a 100% increase
        }
        
        // Calculate payments received this week - fix NaN issues by ensuring numbers
        const paymentsThisWeek = ordersThisWeek.reduce((sum, order) => {
          const amount = parseFloat(order.finalAmount) || 0;
          return sum + amount;
        }, 0);
        
        // Count orders by status
        const pendingOrders = orders.filter(order => order.status === "Pending").length;
        const processingOrders = orders.filter(order => order.status === "Processing").length;
        const deliveredOrders = orders.filter(order => order.status === "Delivered").length;
        
        // Calculate total revenue - fix NaN issues
        const totalRevenue = orders.reduce((sum, order) => {
          const amount = parseFloat(order.finalAmount) || 0;
          return sum + amount;
        }, 0);
        
        setDashboardStats({
          ordersThisWeek: ordersThisWeek.length,
          orderChangePercentage: isNaN(orderChangePercentage) ? 0 : orderChangePercentage.toFixed(1),
          paymentsThisWeek: isNaN(paymentsThisWeek) ? 0 : paymentsThisWeek.toFixed(2),
          pendingOrders,
          processingOrders,
          deliveredOrders,
          totalRevenue: isNaN(totalRevenue) ? 0 : totalRevenue.toFixed(2)
        });
        
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
        setLoading(false);
      }
    };
  
    fetchDashboardData();
  }, []); // Keep the dependency array empty to avoid re-renders


  const renderNavbar = () => {
    console.log("Rendering navbar with onLogout:", handleLogout);
    return <AdminNavbar username={username} onLogout={handleLogout} />;
  };

  if (loading) {
    return (
      <div className="d-flex flex-column min-vh-100">
        {renderNavbar()}
        <div className="d-flex justify-content-center align-items-center flex-grow-1">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="d-flex flex-column min-vh-100">
        {renderNavbar()}
        <div className="container mt-5 pt-4">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="alert alert-danger m-3 text-center" role="alert">
                {error}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column align-items-center min-vh-100">
      {renderNavbar()}
     
      <div className="container-fluid mt-5 pt-4" style={{ maxWidth: "1200px" }}>
        <div className="d-flex flex-column align-items-center w-100">
          <h1 className="mb-4 text-center">Dashboard Overview</h1>
          
          {/* Stats Overview */}
          <div className="row mb-4 justify-content-center w-100">
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="card bg-primary text-white h-100">
                <div className="card-body text-center">
                  <h5 className="card-title">Orders This Week</h5>
                  <h2 className="card-text">{dashboardStats.ordersThisWeek}</h2>
                  <p className={`card-text ${parseFloat(dashboardStats.orderChangePercentage) >= 0 ? 'text-success' : 'text-danger'}`}>
                    <i className={`bi ${parseFloat(dashboardStats.orderChangePercentage) >= 0 ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
                    {Math.abs(parseFloat(dashboardStats.orderChangePercentage))}% from last week
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="card bg-success text-white h-100">
                <div className="card-body text-center">
                  <h5 className="card-title">Payments This Week</h5>
                  <h2 className="card-text">${dashboardStats.paymentsThisWeek}</h2>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="card bg-info text-white h-100">
                <div className="card-body text-center">
                  <h5 className="card-title">Total Revenue</h5>
                  <h2 className="card-text">${dashboardStats.totalRevenue}</h2>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="card bg-warning text-dark h-100">
                <div className="card-body text-center">
                  <h5 className="card-title">Pending Orders</h5>
                  <h2 className="card-text">{dashboardStats.pendingOrders}</h2>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Status Breakdown */}
          <div className="row mb-4 w-100">
            <div className="col-12">
              <div className="card">
                <div className="card-header text-center">
                  <h5 className="card-title mb-0">Order Status Breakdown</h5>
                </div>
                <div className="card-body">
                  <div className="row justify-content-center">
                    <div className="col-md-4 mb-3">
                      <div className="card border-warning mb-3">
                        <div className="card-body text-center">
                          <h5 className="card-title">Pending</h5>
                          <h3 className="card-text">{dashboardStats.pendingOrders}</h3>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4 mb-3">
                      <div className="card border-primary mb-3">
                        <div className="card-body text-center">
                          <h5 className="card-title">Processing</h5>
                          <h3 className="card-text">{dashboardStats.processingOrders}</h3>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4 mb-3">
                      <div className="card border-success mb-3">
                        <div className="card-body text-center">
                          <h5 className="card-title">Delivered</h5>
                          <h3 className="card-text">{dashboardStats.deliveredOrders}</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="progress mt-3">
                    <div 
                      className="progress-bar progress-bar-striped bg-warning" 
                      role="progressbar" 
                      style={{ 
                        width: `${
                          (dashboardStats.pendingOrders + dashboardStats.processingOrders + dashboardStats.deliveredOrders) > 0 
                            ? (dashboardStats.pendingOrders / (dashboardStats.pendingOrders + dashboardStats.processingOrders + dashboardStats.deliveredOrders)) * 100 
                            : 0
                        }%` 
                      }} 
                      aria-valuenow={dashboardStats.pendingOrders} 
                      aria-valuemin="0" 
                      aria-valuemax="100"
                    >
                      Pending
                    </div>
                    <div 
                      className="progress-bar progress-bar-striped bg-primary" 
                      role="progressbar" 
                      style={{ 
                        width: `${
                          (dashboardStats.pendingOrders + dashboardStats.processingOrders + dashboardStats.deliveredOrders) > 0
                            ? (dashboardStats.processingOrders / (dashboardStats.pendingOrders + dashboardStats.processingOrders + dashboardStats.deliveredOrders)) * 100 
                            : 0
                        }%` 
                      }} 
                      aria-valuenow={dashboardStats.processingOrders} 
                      aria-valuemin="0" 
                      aria-valuemax="100"
                    >
                      Processing
                    </div>
                    <div 
                      className="progress-bar progress-bar-striped bg-success" 
                      role="progressbar" 
                      style={{ 
                        width: `${
                          (dashboardStats.pendingOrders + dashboardStats.processingOrders + dashboardStats.deliveredOrders) > 0
                            ? (dashboardStats.deliveredOrders / (dashboardStats.pendingOrders + dashboardStats.processingOrders + dashboardStats.deliveredOrders)) * 100 
                            : 0
                        }%` 
                      }} 
                      aria-valuenow={dashboardStats.deliveredOrders} 
                      aria-valuemin="0" 
                      aria-valuemax="100"
                    >
                      Delivered
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Outlet for nested routes */}
          <div className="mt-4 w-100">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;