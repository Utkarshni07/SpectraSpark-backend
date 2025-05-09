import mongoose from "mongoose";

const errorLogSchema = new mongoose.Schema({
  message: String,
  stack: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("ErrorLog", errorLogSchema);
