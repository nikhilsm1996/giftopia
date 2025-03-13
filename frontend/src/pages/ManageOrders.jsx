import { useEffect, useState } from "react";
import { Table, Form, Pagination } from "react-bootstrap";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders/admin/orders", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      await fetch(`/api/orders/admin/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const getFinalAmount = (order) => {
    if (order.finalAmount !== undefined) {
      return order.finalAmount;
    }
    const totalPrice = parseFloat(order.totalPrice || 0);
    const discount = parseFloat(order.discount || 0);
    return Math.max(0, totalPrice - discount);
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  // Pagination logic
  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  return (
    <div className="container mt-4">
      <h2>Manage Orders</h2>

      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>#</th>
            <th>Order ID</th>
            <th>Date</th>
            <th>Original Price</th>
            <th>Discount</th>
            <th>Final Amount</th>
            <th>Payment Method</th>
            <th>Shipping Address</th>
            <th>Products</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {currentOrders.map((order, index) => (
            <tr key={order._id}>
              <td>{indexOfFirstOrder + index + 1}</td>
              <td>{order._id}</td>
              <td>{new Date(order.createdAt).toLocaleDateString("en-GB")}</td>
              <td>{formatCurrency(order.totalPrice)}</td>
              <td className="text-success">
                {parseFloat(order.discount) > 0 ? formatCurrency(order.discount) : "₹0.00"}
              </td>
              <td className="fw-bold">{formatCurrency(getFinalAmount(order))}</td>
              <td>{order.paymentMethod}</td>
              <td>
                {order.shippingAddress.fullName}, {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.pincode}, {order.shippingAddress.phone}
              </td>
              <td>
                <ul>
                  {order.products.map((item, idx) => (
                    <li key={idx}>
                      <div><strong>Product:</strong> {item.product.name}</div>
                      <div><strong>Quantity:</strong> {item.quantity}</div>
                      <div><strong>Price:</strong> ₹{item.price}</div>
                    </li>
                  ))}
                </ul>
              </td>
              <td>
                <Form.Select value={order.status} onChange={(e) => updateOrderStatus(order._id, e.target.value)}>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </Form.Select>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Page Info */}
      <div className="text-center mt-3">
        <p className="fw-bold">Page {currentPage} of {totalPages}</p>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Pagination className="justify-content-center">
          <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} />
          
          {[...Array(totalPages)].map((_, i) => (
            <Pagination.Item key={i} active={currentPage === i + 1} onClick={() => setCurrentPage(i + 1)}>
              {i + 1}
            </Pagination.Item>
          ))}

          <Pagination.Next disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} />
        </Pagination>
      )}
    </div>
  );
};

export default ManageOrders;
