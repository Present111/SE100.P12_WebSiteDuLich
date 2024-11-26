const mongoose = require("mongoose");

const dishTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  }, // Tên món ăn (vd: Salad, Pasta, Burger, ...)
});

module.exports = mongoose.model("DishType", dishTypeSchema);
