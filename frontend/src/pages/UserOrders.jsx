import { useEffect, useState } from "react";
import { Table, Alert, Spinner, Badge, Card } from "react-bootstrap";

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentOrder, setRecentOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        console.log("inside fetchorders")
        const response = await fetch("http://localhost:5000/api/orders/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        
        const data = await response.json();
        console.log("Fetched orders data:", data); // Add this to debug
        // Sort orders by date (newest first)
        const sortedOrders = data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        // Set the recent order if coming from payment page
        // Check URL parameters or localStorage flag
        const isFromCheckout = localStorage.getItem("orderCompleted");
        if (isFromCheckout && sortedOrders.length > 0) {
          setRecentOrder(sortedOrders[0]);
          // Clear the flag
          localStorage.removeItem("orderCompleted");
        }
        
        setOrders(sortedOrders);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "processing":
        return <Badge bg="warning">Processing</Badge>;
      case "shipped":
        return <Badge bg="info">Shipped</Badge>;
      case "delivered":
        return <Badge bg="success">Delivered</Badge>;
      case "cancelled":
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="secondary">Pending</Badge>;
    }
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  // Calculate final amount after discount
  const getFinalAmount = (order) => {
    if (order.finalAmount !== undefined) {
      return order.finalAmount;
    }
    // Fallback calculation if finalAmount isn't directly available
    const totalPrice = parseFloat(order.totalPrice || 0);
    const discount = parseFloat(order.discount || 0);
    return Math.max(0, totalPrice - discount);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading orders...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">Your Orders</h2>
      
      {recentOrder && (
        <Alert variant="success" className="mb-4">
          <Alert.Heading>Order Successfully Placed!</Alert.Heading>
          <p>
            Your order #{recentOrder._id} has been successfully placed and is being processed.
            Thank you for your purchase!
          </p>
        </Alert>
      )}
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {orders.length > 0 ? (
        <Card className="shadow-sm">
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Original Amount</th>
                  <th>Discount</th>
                  <th>Final Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <span className="text-primary fw-bold">#{order._id.substring(0, 8)}</span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}</td>
                    <td>{formatCurrency(order.totalPrice)}</td>
                    <td className="text-success">
                      {parseFloat(order.discount) > 0 ? `-${formatCurrency(order.discount)}` : '₹0.00'}
                    </td>
                    <td className="fw-bold">{formatCurrency(getFinalAmount(order))}</td>
                    <td>{order.paymentMethod}</td>
                    <td>{getStatusBadge(order.status)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      ) : (
        <div className="text-center my-5 py-5 border rounded bg-light">
          <h4 className="text-muted">No orders found</h4>
          <p>You haven't placed any orders yet.</p>
        </div>
      )}
    </div>
  );
};

export default UserOrders;