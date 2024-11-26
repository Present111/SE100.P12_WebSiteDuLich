const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
  tableID: {
    type: String,
    required: true,
    unique: true,
  }, // PK
  restaurantID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant", // FK tới collection Restaurant
    required: true,
  },
  tableType: {
    type: String,
    required: true,
  }, // Loại bàn
  availableDate: {
    type: Date,
    required: true,
  }, // Ngày bàn trống
  picture: {
    type: String,
  }, // Link hình ảnh
  active: {
    type: Boolean,
    default: true,
  }, // Trạng thái hoạt động (Yes/No)

  // Thuộc tính giá
  price: {
    type: Number,
    required: true, // Giá gốc bắt buộc
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

module.exports = mongoose.model("Table", tableSchema);
