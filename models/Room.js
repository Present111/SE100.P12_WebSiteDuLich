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
  price: {
    type: Number,
    required: true,
    min: 0,
  }, // Giá gốc
  discountPrice: {
    type: Number,
   required: true,
    min: 0,
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
     
    }, // Số người lớn
    children: {
      type: Number,
      required: true,
      
    }, // Số trẻ em
    roomNumber: {
      type: Number,
      required: true,
     
    }, //
  },
  facilities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility", // Tham chiếu tới bảng Facility
    },
  ], // Mảng tiện ích liên quan đến Room
  roomsAvailable: [
    {
      date: {
        type: Date,
        required: true,
      }, // Ngày có phòng
      availableRooms: {
        type: Number,
        required: true,
        min: 0,
      }, // Số lượng phòng trống cho ngày này
    },
  ], // Mảng các đối tượng {date, availableRooms}
});

module.exports = mongoose.model("Room", roomSchema);
