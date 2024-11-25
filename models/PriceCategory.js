const mongoose = require("mongoose");

const priceCategorySchema = new mongoose.Schema({
  priceCategoryID: { type: String, required: true, unique: true }, // ID bảng giá
  cheap: { type: Number, required: true }, // Giá rẻ
  midRange: { type: Number, required: true }, // Giá trung bình
  luxury: { type: Number, required: true }, // Giá cao cấp
});

module.exports = mongoose.model("PriceCategory", priceCategorySchema);
