const mongoose = require("mongoose");

const restaurantTypeSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    unique: true,
    
  },
});

module.exports = mongoose.model("RestaurantType", restaurantTypeSchema);
