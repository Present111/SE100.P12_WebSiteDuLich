const mongoose = require("mongoose");

const coffeeTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Đảm bảo tên loại cà phê không bị trùng lặp
    trim: true,
  },
  description: {
    type: String,
    required: false, // Mô tả thêm cho loại cà phê (nếu cần)
  },
});

module.exports = mongoose.model("CoffeeType", coffeeTypeSchema);
