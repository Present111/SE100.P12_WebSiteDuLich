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
      type: String,
    },
  ], // Mảng đường dẫn ảnh
  active: {
    type: Boolean,
    default: true,
  }, // Trạng thái hoạt động (Yes/No)
  facilities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility", // Tham chiếu tới bảng Facility
    },
  ], // Mảng tiện ích liên quan đến Table
});

module.exports = mongoose.model("Table", tableSchema);
