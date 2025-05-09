import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import Contact from "./models/Contact.js";
import ErrorLog from "./models/ErrorLog.js";



dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// POST route with validation + error logging
app.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Input Validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Save contact message
    const newContact = new Contact({ name, email, message });
    await newContact.save();

    // Send email notification
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Contact Form Submission",
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    });

    // Auto-reply to user
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thank you for contacting SpectraSpark!",
      text: `Hi ${name},\n\nThank you for reaching out. We'll get back to you shortly.\n\n- SpectraSpark Team`,
    });

    res.status(200).json({ message: "Message sent successfully." });
  } catch (err) {
    console.error("❌ Error:", err.message);

    // Save error to database
    await ErrorLog.create({ message: err.message, stack: err.stack });

    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

