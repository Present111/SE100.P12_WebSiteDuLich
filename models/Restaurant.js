const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  restaurantID: {
    type: String,
    required: true,
    unique: true,
  }, // Mã định danh nhà hàng (PK)
  serviceID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service", // Tham chiếu đến bảng Service
    required: true,
  },
  cuisineTypeID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CuisineType", // Tham chiếu đến bảng CuisineType
    required: true,
  }, // Loại món ăn
  seatingCapacity: {
    type: Number,
    required: true,
    min: 1, // Số lượng ghế phải lớn hơn 0
  }, // Sức chứa của nhà hàng
  restaurantTypeID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RestaurantType", // Tham chiếu đến bảng RestaurantType
    required: true,
  }, // Loại nhà hàng
});

module.exports = mongoose.model("Restaurant", restaurantSchema);
