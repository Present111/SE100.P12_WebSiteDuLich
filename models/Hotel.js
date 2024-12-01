const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema({
  hotelID: { type: String, required: true, unique: true }, // Mã khách sạn
  serviceID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service", // FK tới bảng Service
    required: true,
  }, // ID dịch vụ
  starRating: { type: Number, required: true, min: 1, max: 5 }, // Xếp hạng sao
  hotelTypeID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HotelType", // FK tới bảng HotelType
    required: true,
  }, // Loại hình khách sạn
});

module.exports = mongoose.model("Hotel", hotelSchema);
