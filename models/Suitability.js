const mongoose = require("mongoose");

const suitabilitySchema = new mongoose.Schema({
  suitabilityID: { type: String, required: true, unique: true }, // ID mục phù hợp
  name: { type: String, required: true }, // Tên mục phù hợp (Gia đình, cặp đôi, bạn bè, ...)
});

module.exports = mongoose.model("Suitability", suitabilitySchema);