// Complete implementation with error handling, validation, and user feedback
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import CouponInput from "../components/CouponInput";
import { 
    BsCheckCircleFill, 
    BsXCircleFill,
    BsShieldLock
  } from "react-icons/bs";
  import 'bootstrap/dist/css/bootstrap.min.css';
  import 'bootstrap/dist/js/bootstrap.bundle.min.js';
  import PaymentForm  from "../components/PaymentForm";
// PaymentPage component with comprehensive improvements
const PaymentPage = () => {
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState("");
    const [discount, setDiscount] = useState(0);
    const [appliedCouponCode, setAppliedCouponCode] = useState("");
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState("");
    const [loadingError, setLoadingError] = useState("");
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [orderSummary, setOrderSummary] = useState(null);
    const [couponError, setCouponError] = useState("");
    // First, add a new state for shipping address in your PaymentPage component
const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    address: "",
    city: "",
    pincode: "",
    phone: ""
  });
    
    // Enhanced coupon handler function with validation
    const handleApplyCoupon = async (couponCode) => {
        // Clear previous coupon errors
        setCouponError("");
        
        // Validate coupon code is a non-empty string
        if (!couponCode || typeof couponCode !== 'string') {
            setCouponError("Invalid coupon code");
            return false;
        }
        
        try {
            // Log the data being sent
            console.log("Sending Coupon Validation Request:", {
                couponCode, 
                totalAmount
            });
        
            // Validate coupon with backend
            const response = await fetch("http://localhost:5000/api/coupons/validate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ 
                    couponCode, 
                    totalAmount 
                })
            });
        
            // Log the raw response
            console.log("Validation Response Status:", response.status);
            
            const data = await response.json();
            
            // Log the parsed response data
            console.log("Validation Response Data:", data);
        
            // Check the success flag
            if (!data.success) {
                setCouponError(data.message || "Invalid coupon");
                return false;
            }
        
            // If coupon is valid, apply it
            const applyResponse = await fetch("http://localhost:5000/api/coupons/apply", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ 
                    couponCode, 
                    totalAmount ,
                    orderId: orderSummary?._id // Make sure you're passing the order ID
                })
            });
            console.log("Apply Coupon Raw Response:", applyResponse);
        
            const applyData = await applyResponse.json();
            console.log("Apply Coupon Response Data:", applyData);
        
            if (!applyData.success) {
                setCouponError(applyData.message || "Could not apply coupon");
                return false;
            }
            
        
            // Apply the discount
            setDiscount(applyData.discount);
            setAppliedCouponCode(couponCode);
            return true;
        
        } catch (error) {
            console.error("Coupon application error:", error);
            setCouponError("An error occurred while applying the coupon");
            return false;
        }
    };
    
    // Fetch cart items from API
    useEffect(() => {
      const fetchCartItems = async () => {
        setIsLoading(true);
        try {
          const response = await fetch("http://localhost:5000/api/cart/", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          });
          
          if (!response.ok) {
            throw new Error("Failed to fetch cart items");
          }
          
          const data = await response.json();
          setCartItems(data.items || []);
          setLoadingError("");
        } catch (error) {
          console.error("Error fetching cart:", error);
          setLoadingError("Failed to load cart. Please try again.");
          // Fallback to localStorage if API fails
          const storedCart = JSON.parse(localStorage.getItem("cartItems")) || [];
          setCartItems(storedCart);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchCartItems();
    }, []);
  
    // Calculate total amount from cart items
    const totalAmount = cartItems.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return total + (price * quantity);
    }, 0);
    
    // Ensure finalAmount is never negative
    const finalAmount = Math.max(0, totalAmount - discount);
  // Add a function to handle shipping form changes
const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Add validation for shipping address
  const validateShippingAddress = () => {
    const errors = {};
    if (!shippingAddress.fullName.trim()) errors.fullName = "Full name is required";
    if (!shippingAddress.address.trim()) errors.address = "Address is required";
    if (!shippingAddress.city.trim()) errors.city = "City is required";
    if (!shippingAddress.pincode.trim()) errors.pincode = "PIN code is required";
    if (!shippingAddress.phone.trim()) errors.phone = "Phone number is required";
    else if (!/^[0-9]{10}$/.test(shippingAddress.phone)) errors.phone = "Invalid phone number";
    
    return errors;
  };
    // Enhanced payment processing with better error handling
    const handlePayment = async () => {
      if (!paymentMethod) {
        setPaymentError("Please select a payment method.");
        return;
      }
      
      if (cartItems.length === 0) {
        setPaymentError("Your cart is empty.");
        return;
      }

      // Validate shipping address
  const shippingErrors = validateShippingAddress();
  if (Object.keys(shippingErrors).length > 0) {
    setPaymentError("Please complete all shipping address fields correctly.");
    return;
  }
      
      // Additional validation for minimum order value and final amount
      if (finalAmount <= 0) {
        setPaymentError("Invalid order amount. Please review your order.");
        return;
      }
      
      setIsProcessing(true);
      setPaymentError("");
      
      // Map payment method to match your enum values
      const mapPaymentMethod = (method) => {
        switch(method) {
          case "credit-card":
          case "debit-card":
            return "CARD";
          case "upi":
            return "UPI";
          case "netbanking":
            return "NETBANKING";
          default:
            return "COD"; // Default fallback
        }
      };
      
      // Format cart items to match your Order schema
      const formattedProducts = cartItems.map(item => ({
        product: item.productId, // Make sure this is the MongoDB ID
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price),
        name: item.name || "Unknown Product" // Include name for better order details
      }));
      
      try {
   
        // Prepare order data with coupon information
        const orderData = {
            products: formattedProducts,
            totalPrice: finalAmount,
            originalPrice: totalAmount,
            discount: discount,
            couponCode: appliedCouponCode, // Include the applied coupon code
            paymentMethod: paymentMethod,
            paymentStatus: "COMPLETED", 
            shippingAddress: shippingAddress // Use the user input shipping address
          };
        
        console.log("SENDING newORDERDATA", orderData);
        
        // Submit order to backend
        const response = await fetch("http://localhost:5000/api/orders/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create order");
        }
        
        // Save order summary for success state
        const orderResponse = await response.json();
        console.log("Order creation response:", orderResponse); // Add this to debug
        setOrderSummary(orderResponse.data || orderResponse);
        
        // Clear the cart in backend
        const clearCartResponse = await fetch("http://localhost:5000/api/cart/clear", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({ userId: localStorage.getItem("userId") })
        });
        
        if (!clearCartResponse.ok) {
          console.error("Failed to clear cart in backend");
        }
        
        // Also clear the cart in localStorage as a fallback
        localStorage.removeItem("cartItems");
        
        // Show success state
        setPaymentSuccess(true);
        localStorage.setItem("orderCompleted", "true");
        // Redirect to orders page after a short delay
        setTimeout(() => {
          navigate("/orders");
        }, 3000);
        
      } catch (error) {
        setPaymentError(error.message || "Payment processing failed. Please try again.");
        setIsProcessing(false);
      }
    };
  
    // Helper functions for cart management remain the same
    const updateCartItemQuantity = async (productId, newQuantity) => {
      try {
        const response = await fetch("http://localhost:5000/api/cart/update", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            productId,
            quantity: newQuantity
          })
        });
        
        if (!response.ok) {
          throw new Error("Failed to update cart");
        }
        
        const data = await response.json();
        setCartItems(data.items || []);
        
        // Update localStorage as fallback
        const updatedLocalCart = cartItems.map(item => 
          item.productId === productId 
            ? { ...item, quantity: newQuantity } 
            : item
        );
        localStorage.setItem("cartItems", JSON.stringify(updatedLocalCart));
      } catch (error) {
        console.error("Error updating cart:", error);
        // Optimistically update UI even if API fails
        const updatedItems = cartItems.map(item => 
          item.productId === productId 
            ? { ...item, quantity: newQuantity } 
            : item
        );
        setCartItems(updatedItems);
      }
    };
  
    const removeCartItem = async (productId) => {
      try {
        const response = await fetch("http://localhost:5000/api/cart/remove", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({ productId })
        });
        
        if (!response.ok) {
          throw new Error("Failed to remove item from cart");
        }
        
        const data = await response.json();
        // Update cart items after removal
        setCartItems(data.items || []);
        
        // Update localStorage as fallback
        const updatedLocalCart = cartItems.filter(item => item.productId !== productId);
        localStorage.setItem("cartItems", JSON.stringify(updatedLocalCart));
      } catch (error) {
        console.error("Error removing item from cart:", error);
        // Optimistically update UI even if API fails
        const updatedItems = cartItems.filter(item => item.productId !== productId);
        setCartItems(updatedItems);
      }
    };
  
    // Show success state instead of redirecting immediately
    if (paymentSuccess) {
      return (
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card shadow">
                <div className="card-header bg-success text-white">
                  <h2 className="mb-1">Payment Successful!</h2>
                  <p className="mb-0">Your order has been placed</p>
                </div>
                <div className="card-body text-center">
                  <div className="my-4">
                    <BsCheckCircleFill className="text-success" style={{ fontSize: '5rem' }} />
                    <h3 className="mt-3">Thank you for your purchase</h3>
                    <p>Order ID: {orderSummary?.orderId || "Processing"}</p>
                    <p>You will be redirected to your orders page shortly...</p>
                  </div>
                  <button 
                    className="btn btn-primary mt-3"
                    onClick={() => navigate("/orders")}
                  >
                    View My Orders
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow">
              <div className="card-header bg-primary text-white">
                <h2 className="mb-1">Checkout</h2>
                <p className="mb-0">Complete your purchase</p>
              </div>
              <div className="card-body">
                <h3 className="mb-3">Order Summary</h3>
                
                {isLoading ? (
                  <div className="text-center my-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading your cart...</p>
                  </div>
                ) : loadingError ? (
                  <div className="alert alert-warning" role="alert">
                    {loadingError}
                  </div>
                ) : (
                    <ul className="list-group mb-3">
                    {cartItems.length > 0 ? (
                      cartItems.map((item) => (
                        <li key={item.productId} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            {item.name || "Unknown Product"}
                          </div>
                          <span>₹{(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}</span>
                        </li>
                      ))
                    ) : (
                      <li className="list-group-item text-muted">Your cart is empty</li>
                    )}
                  </ul>
                  
                )}
                
                <div className="card bg-light mb-4">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <span>Original Price:</span>
                      <span>₹{totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Discount Applied:</span>
                      <span className={discount > 0 ? "text-success" : ""}>
                        {discount > 0 ? `-₹${discount.toFixed(2)}` : "₹0.00"}
                      </span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between fw-bold">
                      <span>Final Amount:</span>
                      <span>₹{finalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                {couponError && (
                  <div className="alert alert-warning mb-3">
                    <BsXCircleFill className="me-2" />
                    {couponError}
                  </div>
                )}
                
                <CouponInput 
                  onApplyCoupon={handleApplyCoupon} 
                  cartTotal={totalAmount} 
                />
                <div className="card bg-light mb-4">
  <div className="card-body">
    <h4 className="mb-3">Shipping Address</h4>
    <div className="row g-3">
      <div className="col-12">
        <label htmlFor="fullName" className="form-label">Full Name</label>
        <input 
          type="text" 
          className="form-control" 
          id="fullName" 
          name="fullName"
          value={shippingAddress.fullName}
          onChange={handleShippingChange}
          required
        />
      </div>
      
      <div className="col-12">
        <label htmlFor="address" className="form-label">Address</label>
        <input 
          type="text" 
          className="form-control" 
          id="address" 
          name="address"
          value={shippingAddress.address}
          onChange={handleShippingChange}
          required
        />
      </div>
      
      <div className="col-md-6">
        <label htmlFor="city" className="form-label">City</label>
        <input 
          type="text" 
          className="form-control" 
          id="city" 
          name="city"
          value={shippingAddress.city}
          onChange={handleShippingChange}
          required
        />
      </div>
      
      <div className="col-md-6">
        <label htmlFor="pincode" className="form-label">PIN Code</label>
        <input 
          type="text" 
          className="form-control" 
          id="pincode" 
          name="pincode"
          value={shippingAddress.pincode}
          onChange={handleShippingChange}
          required
        />
      </div>
      
      <div className="col-12">
        <label htmlFor="phone" className="form-label">Phone Number</label>
        <input 
          type="tel" 
          className="form-control" 
          id="phone" 
          name="phone"
          value={shippingAddress.phone}
          onChange={handleShippingChange}
          required
        />
      </div>
    </div>
  </div>
</div>
                
                <PaymentForm onPaymentMethodSelect={setPaymentMethod} selectedMethod={paymentMethod} />
                
                {paymentError && (
                  <div className="alert alert-danger mt-3">
                    <BsXCircleFill className="me-2" />
                    {paymentError}
                  </div>
                )}
                
                <div className="mt-4">
                  <button 
                    onClick={handlePayment} 
                    disabled={!paymentMethod || cartItems.length === 0 || isProcessing || isLoading || finalAmount <= 0}
                    className={`btn ${paymentMethod && cartItems.length > 0 && !isLoading && finalAmount > 0 ? 'btn-primary' : 'btn-secondary'} w-100 py-3`}
                  >
                    {isProcessing ? (
                      <span>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Processing...
                      </span>
                    ) : isLoading ? 'Loading cart...' :
                       cartItems.length === 0 ? 'Your cart is empty' : 
                       finalAmount <= 0 ? 'Invalid order amount' :
                       paymentMethod ? `Pay ₹${finalAmount.toFixed(2)}` : 'Select Payment Method'}
                  </button>
                </div>
                <div className="mt-3 text-center text-muted small d-flex align-items-center justify-content-center">
                  <BsShieldLock className="me-1" />
                  Secure payment - Your data is protected
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

export default PaymentPage;