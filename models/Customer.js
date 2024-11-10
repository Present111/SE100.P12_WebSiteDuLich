const mongoose = require("mongoose");

// Customer schema
const customerSchema = new mongoose.Schema({
  customerID: { type: String, required: true, unique: true },
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  loyaltyPoints: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
});

module.exports = mongoose.model("Customer", customerSchema);
