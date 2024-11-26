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
  picture: {
    type: String,
  }, // Link hình ảnh
  active: {
    type: Boolean,
    default: true,
  }, // Trạng thái hoạt động (Yes/No)

  // Thuộc tính sức chứa
  capacity: {
    adults: {
      type: Number,
      required: true,
      min: 1, // Số người lớn tối thiểu là 1
    },
    children: {
      type: Number,
      required: true,
      min: 0, // Số trẻ em tối thiểu là 0
    },
  },

  // Thuộc tính giá
  price: {
    type: Number,
    required: true, // Giá gốc bắt buộc phải có
    min: 0, // Giá không thể âm
  },
  discountPrice: {
    type: Number,
    validate: {
      validator: function (value) {
        // Giá discount không được lớn hơn giá gốc
        return value === null || value < this.price;
      },
      message: "Discount price must be less than the original price.",
    },
  },
});

module.exports = mongoose.model("Room", roomSchema);
