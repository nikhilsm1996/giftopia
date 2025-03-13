import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false, // Regular user by default
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User; // ✅ Use `export default` instead of `module.exports`
