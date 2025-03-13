import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    content: {
      type: String,
      maxlength: 500, // Optional limit for note length
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

const Note = mongoose.model("Note", noteSchema);

export default Note;
