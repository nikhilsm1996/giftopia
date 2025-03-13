import express from "express";
import Coupon from "../models/Coupons.js";
import { isAuthenticated, isAdmin } from "../middlewares/authMiddleware.js";
import Order from "../models/Orders.js";
const router = express.Router();

// Create Coupon (Admin Only)
router.post("/create", isAuthenticated, isAdmin, async (req, res) => {
  console.log("Received Data:", req.body); // Log received data

  try {
    // Ensure code is uppercase
    if (req.body.code) {
      req.body.code = req.body.code.toUpperCase();
    }
    console.log("REQ 1",req.body); // Check what the backend receives
    // Validate required fields
    const { code, discountType, discountValue, expiresAt } = req.body;
    if (!code || !discountType || discountValue === undefined || !expiresAt) {
      console.log("ED",expiresAt)
      console.log("Missing Fields Detected!");
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields" 
      });
    }
    
    // Create the coupon
    const coupon = await Coupon.create(req.body);
    console.log("Attempting to save to DB...");
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: "A coupon with this code already exists" 
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post("/validate", isAuthenticated, async (req, res) => {
  const { couponCode, totalAmount } = req.body;

  // Validate input
  if (!couponCode) {
    return res.status(400).json({ 
      success: false, 
      message: "Coupon code is missing" 
    });
  }

  if (totalAmount === undefined || totalAmount === null) {
    return res.status(400).json({ 
      success: false, 
      message: "Total amount is missing" 
    });
  }

  try {
    // Find the coupon and check its validity
    const coupon = await Coupon.findOne({ 
      code: couponCode.toUpperCase(),
      isActive: true,
      expiresAt: { $gte: new Date() }
    });

    // Coupon not found
    if (!coupon) {
      return res.status(200).json({ 
        success: false, 
        message: "Invalid coupon code" 
      });
    }

    // Check minimum cart value
    const minCartValue = coupon.minCartValue || 0;
    
    // If cart total is less than minimum, return specific message
    if (totalAmount < minCartValue) {
      return res.status(200).json({ 
        success: true,  // Coupon is fundamentally valid
        message: `Minimum order value is ₹${minCartValue}`,
        minOrderValue: minCartValue,
        cartTooLow: true,
        couponIsValid: true  // Explicitly state the coupon is valid
      });
    }

    // Coupon is valid and can be applied
    return res.status(200).json({ 
      success: true,
      message: "Coupon is valid", 
      couponIsValid: true,
      discountType: coupon.discountType, 
      discountValue: coupon.discountValue,
      minOrderValue: minCartValue,
      maxDiscount: coupon.maxDiscount
    });
  } catch (error) {
    console.error("Validate coupon error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error, please try again" 
    });
  }
});

// Apply Coupon
router.post("/apply", isAuthenticated, async (req, res) => {
  const { couponCode, totalAmount, orderId } = req.body; // Add orderId
 

  try {
    if (!couponCode) {
      return res.status(200).json({ 
        success: false, 
        message: "Coupon code is required" 
      });
    }

    const coupon = await Coupon.findOne({ 
      code: couponCode.toUpperCase(),
      isActive: true,
      expiresAt: { $gte: new Date() }
    });

    if (!coupon) {
      return res.status(200).json({ 
        success: false, 
        message: "Invalid coupon code" 
      });
    }

    const minCartValue = coupon.minCartValue || 0;
    if (totalAmount < minCartValue) {
      return res.status(200).json({ 
        success: false, 
        message: `Minimum order value is ₹${minCartValue}`,
        minimumOrderValue: minCartValue
      });
    }

    let discount = 0;

    if (coupon.discountType === "fixed") {
      discount = Math.min(coupon.discountValue, totalAmount);
    } else if (coupon.discountType === "percentage") {
      const calculatedDiscount = totalAmount * (coupon.discountValue / 100);
      discount = coupon.maxDiscount 
        ? Math.min(calculatedDiscount, coupon.maxDiscount)
        : calculatedDiscount;
    }

    discount = Math.round(discount * 100) / 100;

    // Only update the order if orderId is provided
    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      order.discount = discount;
      order.finalAmount = totalAmount - discount;
      await order.save();
    }

    return res.status(200).json({ 
      success: true,
      discount, 
      message: "Coupon applied successfully!",
      minimumOrderValue: minCartValue,
      finalAmount: totalAmount - discount
    });
  } catch (error) {
    console.error("Apply coupon error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error, please try again" 
    });
  }
});



// Get All Coupons (Admin Only)
router.get("/", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get a Specific Coupon (Admin Only)
router.get("/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    res.json({ success: true, data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update Coupon (Admin Only)
router.put("/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    // Ensure code is uppercase if provided
    if (req.body.code) {
      req.body.code = req.body.code.toUpperCase();
    }
    
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    res.json({ success: true, data: coupon });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: "A coupon with this code already exists" 
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete Coupon (Admin Only)
router.delete("/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    res.json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});




export default router;