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
  roomID: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Room", 
   
  }, // Tham chiếu đến phòng đã đặt
  checkInDate: {
    type: Date,
    required: true,
  }, // Ngày nhận phòng
  checkOutDate: {
    type: Date,
    required: true,
  }, // Ngày trả phòng
  status: {
    type: String,
    enum: ["chờ xác nhận", "đã xác nhận", "đã hủy","đã sử dụng"],
    default: "chờ xác nhận",
  }, // Trạng thái của hóa đơn
  pictures: [
    {
      type: String, // URL của ảnh dưới dạng chuỗi
    },
  ], // Mảng chứa các URL ảnh
  review: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Review" 
  }, // Tham chiếu đến đánh giá của hóa đơn
  invoiceType: {
    type: String,
    enum: ["restaurant", "hotel"],
    required: true,
  }, // Loại hóa đơn
  arrivalDate: {
    type: Date,
    required: true,
  }, // Ngày đến
  arrivalTime: {
    type: String,
    required: true, // Thời gian đến (hh:mm format)
  },
  adults: {
    type: Number,
    required: true,
    min: 1, // Tối thiểu một người lớn
  }, // Số lượng người lớn
  children: {
    type: Number,
    required: true,
    min: 0, // Số lượng trẻ em (có thể không có)
  }, // Số lượng trẻ em
});

module.exports = mongoose.model("Invoice", invoiceSchema);
