import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import productRoutes from "./src/routes/productRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import couponRoutes from "./src/routes/couponRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js"
import cartRoutes from "./src/routes/cartRoutes.js"
import paymentRoutes  from "./src/routes/paymentRoutes.js";
import path from "path";
import noteRoutes from "./src/routes/noteRoutes.js";



dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173", // Change if frontend is hosted elsewhere
  credentials: true, // Allow cookies & auth headers
}));

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(process.cwd(), "src", "uploads")));

// Routes
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/orders", orderRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/payment", paymentRoutes)
app.use("/api/notes", noteRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
