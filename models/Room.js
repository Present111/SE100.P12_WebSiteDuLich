const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomID: {
    type: String,
    required: true,
    unique: true,
  }, // PK
  hotelID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel", // FK tới collection Hotel
    required: true,
  },
  roomType: {
    type: String,
    required: true,
  }, // Loại phòng
  availableRooms: {
    type: Number,
    required: true,
  }, // Số lượng phòng trống
  availableDate: {
    type: Date,
    required: true,
  }, // Ngày có phòng
  price: {
    type: Number,
    required: true,
    min: 0,
  }, // Giá gốc
  discountPrice: {
    type: Number,
    validate: {
      validator: function (value) {
        return value === null || value < this.price;
      },
      message: "Discount price must be less than the original price.",
    },
  }, // Giá giảm
  pictures: [
    {
      type: String, // URL ảnh dưới dạng chuỗi
    },
  ], // Mảng ảnh (nhiều URL)
  active: {
    type: Boolean,
    default: true,
  }, // Trạng thái hoạt động (Yes/No)
  capacity: {
    adults: {
      type: Number,
      required: true,
      min: 1,
    }, // Số người lớn
    children: {
      type: Number,
      required: true,
      min: 0,
    }, // Số trẻ em
  },
  facilities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility", // Tham chiếu tới bảng Facility
    },
  ], // Mảng tiện ích liên quan đến Room
});

module.exports = mongoose.model("Room", roomSchema);
