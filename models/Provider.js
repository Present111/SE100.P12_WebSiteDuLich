const mongoose = require("mongoose");

// Provider schema
const providerSchema = new mongoose.Schema({
  providerID: { type: String, required: true, unique: true },
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  providerName: { type: String, required: true },
  address: { type: String, required: true },
  serviceDescription: { type: String },
  active: { type: Boolean, default: true },
});

module.exports = mongoose.model("Provider", providerSchema);
