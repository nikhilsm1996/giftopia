import express from "express";
import Product from "../models/Products.js"
import upload from "../middlewares/uploadMiddleware.js";
import { isAuthenticated, isAdmin } from "../middlewares/authMiddleware.js"; // Ensure only admins can add/edit/delete

const router = express.Router();
const DEFAULT_IMAGE = "/uploads/sample.jpg";
// Route to add a product (Only Admin)
router.post("/add", isAuthenticated, isAdmin, upload.single("image"), async (req, res) => {
  try {
    const { name, price, quantity, category, description } = req.body;

    // Validate price: should be a positive number
    if (price <= 0) {
      return res.status(400).json({ error: "Price must be a positive number" });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : DEFAULT_IMAGE;

    const product = new Product({ name, price, quantity, category, description, image });
    await product.save();
    res.status(201).json({ message: "Product added successfully", product });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Route to get all products (Both Admin and Users)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to edit a product (Only Admin)
router.put("/edit/:id", isAuthenticated, isAdmin, upload.single("image"), async (req, res) => {
  try {
    const { name, price, quantity, category, description } = req.body;

    // Validate price: should be a positive number if provided
    if (price && price <= 0) {
      return res.status(400).json({ error: "Price must be a positive number" });
    }

    // Get existing product to retain previous image if none is provided
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : existingProduct.image;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, quantity, category, description, image },
      { new: true }
    );

    res.json({ message: "Product updated successfully", updatedProduct });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to delete a product (Only Admin)
router.delete("/delete/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
