const mongoose = require("mongoose");

const restaurantTypeSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    unique: true,
    enum: [
      "Restaurants",
      "Quick Bites",
      "Coffee & Tea",
      "Dessert",
      "Bakeries",
      "Bars & Pubs",
      "Delivery Only",
      "Specialty Food Market",
      "Dine With a Local Chef",
    ], // Danh sách loại nhà hàng
  },
});

module.exports = mongoose.model("RestaurantType", restaurantTypeSchema);
