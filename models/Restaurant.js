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
  cuisineTypeIDs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CuisineType", // Tham chiếu đến bảng CuisineType
      required: true,
    },
  ], // Mảng loại món ăn
  dishes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DishType", // Tham chiếu đến bảng DishType
    },
  ], // Mảng món ăn
  seatingCapacity: {
    type: Number,
    required: true,
    min: 1, // Số lượng ghế phải lớn hơn 0
  }, // Sức chứa của nhà hàng
  restaurantTypeID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RestaurantType", // Tham chiếu đến bảng RestaurantType
   
  }, // Loại nhà hàng
});

module.exports = mongoose.model("Restaurant", restaurantSchema);
