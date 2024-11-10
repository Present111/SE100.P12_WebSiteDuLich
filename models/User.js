const mongoose = require("mongoose");

// User Schema
const userSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true }, // Mã định danh
  fullName: { type: String, required: true }, // Họ và Tên
  phoneNumber: { type: String, required: true }, // Số điện thoại
  email: { type: String, required: true, unique: true }, // Email
  userName: { type: String, required: true, unique: true }, // Tên đăng nhập
  birthDate: { type: Date, required: true }, // Ngày sinh
  password: { type: String, required: true }, // Mật khẩu
  role: {
    type: String,
    enum: ["Admin", "Provider", "Customer"],
    default: "Customer",
    required: true,
  }, // Vai trò
  active: { type: Boolean, default: true }, // Trạng thái
});

module.exports = mongoose.model("User", userSchema);
