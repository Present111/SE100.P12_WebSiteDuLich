const mongoose = require("mongoose");

const hotelTypeSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    unique: true,
    enum: [
      "Homestay",
      "Toàn bộ căn nhà",
      "Căn hộ",
      "Khách sạn",
      "Căn hộ dịch vụ",
      "Nhà khách / Nhà nghỉ B&B",
      "Nhà nghỉ ven đường",
      "Nhà nghỉ",
      "Inn",
      "Biệt thự",
      "Toàn bộ nhà trệt",
      "Khách sạn con nhộng",
      "Nông trại",
      "Khách sạn tình yêu",
    ],
  },
});

module.exports = mongoose.model("HotelType", hotelTypeSchema);
