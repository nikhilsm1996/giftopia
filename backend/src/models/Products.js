import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, required: false }, // Store image URL
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
