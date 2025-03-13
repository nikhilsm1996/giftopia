import express from "express";
import Note from "../models/Notes.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();


router.post("/", isAuthenticated, async (req, res) => {
  try {
    const { orderId, content } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const note = new Note({ orderId, content });
    await note.save();

    res.status(201).json({ message: "Note added successfully", note });
  } catch (error) {
    res.status(500).json({ message: "Failed to add note", error: error.message });
  }
});


router.get("/:orderId", isAuthenticated, async (req, res) => {
  try {
    const { orderId } = req.params;
    const notes = await Note.find({ orderId });

    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve notes", error: error.message });
  }
});

router.delete("/:noteId", isAuthenticated, async (req, res) => {
  try {
    const { noteId } = req.params;
    await Note.findByIdAndDelete(noteId);

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete note", error: error.message });
  }
});

export default router;
