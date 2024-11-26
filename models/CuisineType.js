const mongoose = require("mongoose");

const cuisineTypeSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    unique: true, // Đảm bảo không trùng loại món ăn
  },
});

module.exports = mongoose.model("CuisineType", cuisineTypeSchema);
