const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  invoiceID: { type: String, required: true, unique: true },
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  totalAmount: { type: Number, required: true },
  issueDate: { type: Date, required: true },
  paymentStatus: { type: String, enum: ["paid", "unpaid"], default: "unpaid" },
});

module.exports = mongoose.model("Invoice", invoiceSchema);
