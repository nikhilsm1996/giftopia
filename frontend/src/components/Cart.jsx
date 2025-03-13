import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import emptyCartImage from "../assets/empty-cart.jpeg"; // Ensure you have this image

const Cart = () => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const fetchCart = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in to view your cart");
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch("http://localhost:5000/api/cart", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch cart");
        return res.json();
      })
      .then((data) => {
        if (data.items && Array.isArray(data.items)) {
          setCartItems(data.items);
        } else {
          setError("Received unexpected data format from server");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load cart items");
        setLoading(false);
      });
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/cart/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });
      if (!res.ok) throw new Error("Failed to update item quantity");
      await fetchCart(); // Fetch the updated cart from the server
    } catch (error) {
      console.error("Error updating item quantity", error);
    }
  };

  const removeItem = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/cart/remove", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) throw new Error("Failed to remove item from cart");
      await fetchCart(); // Fetch the updated cart from the server
    } catch (error) {
      console.error("Error removing item from cart", error);
    }
  };

  const clearCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/cart/clear", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to clear cart");
      await fetchCart(); // Fetch the updated cart from the server
    } catch (error) {
      console.error("Error clearing cart", error);
    }
  };

  const calculateCartTotal = () => {
    return cartItems
      .reduce(
        (total, item) =>
          total + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0),
        0
      )
      .toFixed(2);
  };

  if (loading) {
    return <div className="container mt-5 text-center"><p>Loading your cart...</p></div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Shopping Cart</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      {cartItems.length === 0 ? (
        <div className="text-center mt-5">
          <img
            src={emptyCartImage}
            alt="Empty Cart"
            className="img-fluid mb-4"
            style={{ maxWidth: "250px" }}
          />
          <h4 className="text-muted">Your cart is empty</h4>
          <p className="text-muted">
            Looks like you haven't added anything yet. Start exploring now!
          </p>
          <Link to="/products">
            <button className="btn btn-primary mt-3">Browse Products</button>
          </Link>
        </div>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price (₹)</th>
                <th>Quantity</th>
                <th>Total (₹)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.productId}>
                  <td>{item.name || "Unknown Product"}</td>
                  <td>₹{parseFloat(item.price).toFixed(2)}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</button>
                    <span className="mx-2">{item.quantity}</span>
                    <button className="btn btn-secondary btn-sm" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                  </td>
                  <td>₹{(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => removeItem(item.productId)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="d-flex justify-content-between align-items-center mt-4">
            <button className="btn btn-outline-danger" onClick={clearCart}>Clear Cart</button>

            <div className="text-end">
              <h4>Total: ₹{calculateCartTotal()}</h4>
              <Link to="/payment">
                <button className="btn btn-primary mt-2">Proceed to Checkout</button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;