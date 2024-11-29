const mongoose = require("mongoose");

const priceCategorySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    unique: true,
    enum: ["cheap", "midRange", "luxury"], // Các giá trị cho loại bảng giá
  },
});

module.exports = mongoose.model("PriceCategory", priceCategorySchema);
