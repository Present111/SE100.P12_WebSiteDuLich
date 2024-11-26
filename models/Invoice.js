const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  invoiceID: { type: String, required: true, unique: true }, // Mã hóa đơn
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // Người tạo hóa đơn
  serviceID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  }, // Dịch vụ được đặt
  quantity: {
    type: Number,
    required: true,
    min: 1,
  }, // Số lượng đặt
  totalAmount: {
    type: Number,
    required: true,
  }, // Tổng tiền
  issueDate: {
    type: Date,
    required: true,
  }, // Ngày xuất hóa đơn
  paymentStatus: {
    type: String,
    enum: ["paid", "unpaid"],
    default: "unpaid",
  }, // Trạng thái thanh toán
});

module.exports = mongoose.model("Invoice", invoiceSchema);
