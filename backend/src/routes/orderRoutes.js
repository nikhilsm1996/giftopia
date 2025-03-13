import express from "express";
const router = express.Router();
import { isAuthenticated, isAdmin } from "../middlewares/authMiddleware.js";
import Order from "../models/Orders.js";
import Coupon from "../models/Coupons.js"; // Assuming there's a Coupon model

// Create a new order (User only)
// Create a new order (User only)
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const { products, totalPrice, paymentMethod, shippingAddress, couponCode } = req.body;
    console.log("User from token:", req.user);
    const userId = req.user.id || req.user._id || req.user.userId;

    // Validate required fields
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Products are required" });
    }
    if (!totalPrice) {
      return res.status(400).json({ message: "Total price is required" });
    }
    if (!paymentMethod) {
      return res.status(400).json({ message: "Payment method is required" });
    }
    if (!shippingAddress) {
      return res.status(400).json({ message: "Shipping address is required" });
    }

    // Calculate discount
    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        discount = coupon.discountType === "PERCENTAGE"
          ? (totalPrice * coupon.discountAmount) / 100
          : coupon.discountAmount;
      }
    }

    // Ensure numeric values for calculation
    const numericTotalPrice = parseFloat(totalPrice);
    const numericDiscount = parseFloat(discount || req.body.discount || 0);
    
    // Calculate final amount and ensure it's a valid number
    const finalAmount = Math.max(0, numericTotalPrice - numericDiscount);
    
    if (isNaN(finalAmount)) {
      console.error("Invalid calculation result:", { 
        totalPrice, 
        numericTotalPrice,
        discount, 
        numericDiscount 
      });
      return res.status(400).json({ 
        message: "Invalid price or discount values", 
        debug: { totalPrice, discount } 
      });
    }

    // Create new order
    const newOrder = new Order({
      user: userId,
      products,
      totalPrice: numericTotalPrice,
      discount: numericDiscount,
      finalAmount, // Store final amount
      paymentMethod,
      shippingAddress,
      status: "Pending",
    });

    console.log("Creating new order:", newOrder);
    
    // Use proper async/await pattern without mixing with .then()
    try {
      const savedOrder = await newOrder.save();
      console.log("Order saved successfully with ID:", savedOrder._id);
      res.status(201).json({ message: "Order placed successfully", order: savedOrder });
    } catch (saveError) {
      console.error("Order save error:", saveError);
      throw saveError; // Re-throw to be caught by the outer catch block
    }
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: "Failed to place order", error: error.message });
  }
});

// Get all orders of the logged-in user (User only)
router.get("/", isAuthenticated, async (req, res) => {
  const userId = req.user.id || req.user._id || req.user.userId;
  try {
    const orders = await Order.find({ user: userId }).select("-__v");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
});

// Get a specific order by ID (User only, must own the order)
router.get("/:orderId", isAuthenticated, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id }).select("-__v");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order", error: error.message });
  }
});

// Admin: Get all orders
router.get("/admin/orders", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("products.product", "name price")
      .select("-__v");
    
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
});

// Admin: Update order status
router.patch("/admin/orders/:orderId", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.orderId, { status }, { new: true }).select("-__v");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: "Failed to update order", error: error.message });
  }
});

// Admin: Delete an order
router.delete("/admin/orders/:orderId", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete order", error: error.message });
  }
});

export default router;
