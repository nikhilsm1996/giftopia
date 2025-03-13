import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User Model
      required: true,
    },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    discount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true }, // After applying discount
    totalPrice: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["COD", "CARD", "UPI"], required: true },
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
      phone: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    notes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Note" }], // Reference to Notes Schema
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
