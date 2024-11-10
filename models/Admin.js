const mongoose = require("mongoose");

// Admin schema
const adminSchema = new mongoose.Schema({
  adminID: { type: String, required: true, unique: true },
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  accessLevel: { type: String, required: true }, // Ví dụ: 'SuperAdmin', 'Manager'
});

module.exports = mongoose.model("Admin", adminSchema);
