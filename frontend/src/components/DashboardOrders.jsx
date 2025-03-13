import React from 'react';

const Orders = () => {
  return (
    <div className="container mt-4">
      <div className="card shadow p-4">
        <h2 className="text-center mb-3">Your Orders</h2>
        <ul className="list-group">
          <li className="list-group-item d-flex justify-content-between">
            <span>Order #12345</span>
            <span>Status: Delivered</span>
          </li>
          <li className="list-group-item d-flex justify-content-between">
            <span>Order #67890</span>
            <span>Status: Pending</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Orders;
