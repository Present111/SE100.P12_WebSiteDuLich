const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomID: { type: String, required: true, unique: true }, // PK
  hotelID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel", // FK tới collection Hotel
    required: true,
  },
  roomType: { type: String, required: true }, // Loại phòng
  availableRooms: { type: Number, required: true }, // Số lượng phòng trống
  availableDate: { type: Date, required: true }, // Ngày có phòng
  picture: { type: String }, // Link hình ảnh
  active: { type: Boolean, default: true }, // Trạng thái hoạt động (Yes/No)
});

module.exports = mongoose.model("Room", roomSchema);
