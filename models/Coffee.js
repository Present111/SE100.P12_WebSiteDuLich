const mongoose = require("mongoose");

const coffeeSchema = new mongoose.Schema({
  coffeeID: { type: String, required: true, unique: true },
  serviceID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  coffeeTypes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoffeeType", // Tham chiếu đến bảng CoffeeType
    },
  ], // Mảng các loại cà phê
  averagePrice: { type: Number, required: true },
  pictures: [{ type: String }], // Mảng đường dẫn ảnh
});

module.exports = mongoose.model("Coffee", coffeeSchema);
