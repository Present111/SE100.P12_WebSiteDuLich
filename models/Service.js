const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  serviceID: { type: String, required: true, unique: true },
  locationID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  serviceName: { type: String, required: true },
  discountPrice: { type: Number, required: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
});

module.exports = mongoose.model("Service", serviceSchema);
