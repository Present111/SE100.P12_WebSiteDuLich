const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
  tableID: { type: String, required: true, unique: true }, // PK
  restaurantID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant", // FK tới collection Restaurant
    required: true,
  },
  tableType: { type: String, required: true }, // Loại bàn
  availableDate: { type: Date, required: true }, // Ngày bàn trống
  picture: { type: String }, // Link hình ảnh
  active: { type: Boolean, default: true }, // Trạng thái hoạt động (Yes/No)
});

module.exports = mongoose.model("Table", tableSchema);
