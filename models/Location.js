const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  locationID: { type: String, required: true, unique: true },
  locationName: { type: String, required: true },
  description: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
});

module.exports = mongoose.model("Location", locationSchema);
