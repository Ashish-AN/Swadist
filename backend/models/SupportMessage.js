const mongoose = require("mongoose");
const user = require("./user");

const MessageSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  type: { type: String, enum: ["issue", "feedback"], required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const SupportMessage = mongoose.model("SupportMessage", MessageSchema);
module.exports = SupportMessage;
