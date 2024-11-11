const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  serviceID: { type: String, required: true, unique: true },
  providerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Provider",
    required: true,
  },
  locationID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  serviceName: { type: String, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  description: { type: String },
  status: {
    type: String,
    enum: ["Active", "Inactive"], // Đảm bảo đúng giá trị hợp lệ
    required: true,
  },
});

module.exports = mongoose.model("Service", serviceSchema);
