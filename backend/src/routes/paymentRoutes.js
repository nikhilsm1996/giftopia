import express from "express";
import Payment from "../models/Payment.js";
import Order from "../models/Orders.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 💰 Process Payment
router.post("/process", isAuthenticated, async (req, res) => {
  try {
    const { cartItems, totalAmount, discount, paymentMethod } = req.body;
    const userId = req.user.userId;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const finalAmount = totalAmount - (discount || 0);

    const newPayment = new Payment({
      userId,
      cartItems,
      totalAmount,
      discount,
      finalAmount,
      paymentMethod,
      paymentStatus: "Pending",
    });

    await newPayment.save();

    res.status(201).json({ message: "Payment initiated", payment: newPayment });
  } catch (error) {
    res.status(500).json({ message: "Payment processing error", error: error.message });
  }
});

// 🔍 Get Payment Status
router.get("/:paymentId", isAuthenticated, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payment", error: error.message });
  }
});

// 📝 Update Payment Status
router.put("/:paymentId", isAuthenticated, async (req, res) => {
  try {
    const { paymentStatus, transactionId } = req.body;
    const payment = await Payment.findById(req.params.paymentId);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Update payment details
    payment.paymentStatus = paymentStatus;
    if (transactionId) payment.transactionId = transactionId;

    await payment.save();

    res.json({ 
      message: "Payment status updated", 
      payment 
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating payment", error: error.message });
  }
});

// 💳 Complete Payment (handles payment and order creation in one endpoint)
router.post("/complete", isAuthenticated, async (req, res) => {
  try {
    const { 
      cartItems, 
      totalAmount, 
      discount, 
      paymentMethod,
      shippingAddress 
    } = req.body;
    
    const userId = req.user.userId;
    
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const finalAmount = totalAmount - (discount || 0);
    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // 1. Create payment record
    const newPayment = new Payment({
      userId,
      cartItems,
      totalAmount,
      discount,
      finalAmount,
      paymentMethod,
      paymentStatus: "Completed",
      transactionId
    });

    const savedPayment = await newPayment.save();

    // 2. Create order record
    const newOrder = new Order({
      user: userId,
      products: cartItems.map(item => ({
        product: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      totalPrice: finalAmount,
      paymentMethod,
      shippingAddress
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({ 
      success: true, 
      message: "Payment completed and order created successfully", 
      payment: savedPayment,
      order: savedOrder
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error processing payment and creating order", 
      error: error.message 
    });
  }
});

export default router;