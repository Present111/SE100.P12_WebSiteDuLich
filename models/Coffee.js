const mongoose = require("mongoose");

const coffeeSchema = new mongoose.Schema({
  coffeeID: { type: String, required: true, unique: true },
  serviceID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  coffeeType: { type: String, required: true },
  averagePrice: { type: Number, required: true },
  picture: { type: String }, // Đường dẫn ảnh
});

module.exports = mongoose.model("Coffee", coffeeSchema);
