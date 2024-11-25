const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  serviceID: {
    type: String,
    required: true,
    unique: true,
  }, // ID dịch vụ
  providerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Provider", // Tham chiếu tới Provider
    required: true,
  },
  locationID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location", // Tham chiếu tới Location
    required: true,
  },
  serviceName: {
    type: String,
    required: true,
  }, // Tên dịch vụ
  price: {
    type: Number,
    required: true,
  }, // Giá
  discountPrice: {
    type: Number,
  }, // Giá khuyến mãi
  description: {
    type: String,
  }, // Mô tả dịch vụ
  status: {
    type: String,
    enum: ["Active", "Inactive"], // Chỉ chấp nhận giá trị "Active" hoặc "Inactive"
    required: true,
  },

  // Mảng tiện nghi liên kết
  facilities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacilityType",
    },
  ],

  // Mảng bảng giá liên kết
  priceCategories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PriceCategory",
    },
  ],

  // Mảng mục phù hợp liên kết
  suitability: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Suitability",
    },
  ],

  // Mảng đánh giá liên kết
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

module.exports = mongoose.model("Service", serviceSchema);
