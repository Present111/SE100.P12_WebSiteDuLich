const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema({
  hotelID: { type: String, required: true, unique: true },
  serviceID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  starRating: { type: Number, required: true },
  roomCapacity: { type: Number, required: true },
});

module.exports = mongoose.model("Hotel", hotelSchema);
