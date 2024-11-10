const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  restaurantID: { type: String, required: true, unique: true },
  serviceID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  cuisineType: { type: String, required: true },
  seatingCapacity: { type: Number, required: true },
});

module.exports = mongoose.model("Restaurant", restaurantSchema);
