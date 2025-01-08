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
  type: {
    type: String,
    enum: ["hotel", "restaurant", "cafe"], // Chỉ chấp nhận giá trị "hotel", "restaurant" hoặc "cafe"
    required: true,
  },
  facilities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacilityType",
    },
  ],
  priceCategories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PriceCategory",
    },
  ],
  suitability: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Suitability",
    },
  ],
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  images: [
    {
      type: String, // Lưu đường dẫn tới ảnh
      required: true,
    },
  ],
  createdAt: { type: Date, default: Date.now }, // Ngày tạo
});

module.exports = mongoose.model("Service", serviceSchema);
