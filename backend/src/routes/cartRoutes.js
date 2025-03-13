import express from "express";
const router = express.Router();
import Cart from "../models/Cart.js"
import { isAuthenticated } from "../middlewares/authMiddleware.js"

// 🛍 Add item to cart
router.post("/add",isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
  const { productId, name, price, image, quantity } = req.body;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.find(item => item.productId.toString() === productId);

    if (existingItem) {
      existingItem.quantity += quantity; // Increase quantity if item exists
    } else {
      cart.items.push({ productId, name, price, image, quantity });
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error adding to cart" });
  }
});

router.post('/sync', isAuthenticated, async (req, res) => {
    try {
      const { items } = req.body;
      const userId = req.user.id;
      
      // Replace the entire cart with the provided items
      await db.collection('carts').updateOne(
        { userId },
        { $set: { items } },
        { upsert: true }
      );
      
      res.json({ success: true, items });
    } catch (error) {
      res.status(500).json({ error: 'Failed to sync cart' });
    }
  });


// 🔄 Update cart item quantity
router.put("/update", isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;
  
    try {
      const cart = await Cart.findOne({ userId });
  
      if (!cart) return res.status(404).json({ message: "Cart not found" });
  
      const item = cart.items.find(item => item.productId.toString() === productId);
  
      if (!item) return res.status(404).json({ message: "Item not found in cart" });
  
      item.quantity = quantity; // Update quantity
      await cart.save();
      
      // Populate product data before sending response
      const populatedCart = await Cart.findOne({ userId }).populate({
        path: 'items.productId',
        model: 'Product',
        select: 'name price image'
      });
      
      // Transform data structure to match GET route
      const transformedItems = populatedCart.items.map(item => ({
        productId: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        image: item.productId.image,
        quantity: item.quantity
      }));
      
      res.json({ items: transformedItems });
    } catch (error) {
      res.status(500).json({ message: "Error updating cart" });
    }
  });

// ❌ Remove item from cart
router.delete("/remove", isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
  const {  productId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error removing item from cart" });
  }
});

router.get("/", isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    try {
      const cart = await Cart.findOne({ userId }).populate({
        path: 'items.productId',
        model: 'Product',
        select: 'name price image' // Select the fields you want
      });
      
      if (!cart) return res.status(404).json({ message: "Cart is empty" });
      
      // Transform data structure to include product details
      const transformedItems = cart.items.map(item => ({
        productId: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        image: item.productId.image,
        quantity: item.quantity
      }));
      
      res.json({ items: transformedItems });
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Error fetching cart" });
    }
  });

// 🗑 Clear entire cart
router.delete("/clear", isAuthenticated,async (req, res) => {
    const userId = req.user.userId;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = []; // Empty the cart
    await cart.save();
    res.json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ message: "Error clearing cart" });
  }
});

export default router
