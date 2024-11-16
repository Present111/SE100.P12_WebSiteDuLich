const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Đăng ký người dùng mới
 * @param {Object} userData - Dữ liệu người dùng
 * @returns {Object} - Người dùng đã được tạo
 */
const registerUser = async (userData) => {
  const {
    userID,
    fullName,
    phoneNumber,
    email,
    userName,
    birthDate,
    password,
    role,
  } = userData;

  // Kiểm tra email hoặc username đã tồn tại
  const existingUser = await User.findOne({
    $or: [{ email }, { userName }],
  });
  if (existingUser) {
    throw new Error("Email or Username already exists");
  }

  // Hash mật khẩu
  const hashedPassword = await bcrypt.hash(password, 10);

  // Tạo người dùng mới
  const newUser = new User({
    userID,
    fullName,
    phoneNumber,
    email,
    userName,
    birthDate,
    password: hashedPassword,
    role,
  });

  return await newUser.save();
};

/**
 * Đăng nhập người dùng
 * @param {String} email - Email người dùng
 * @param {String} password - Mật khẩu người dùng
 * @returns {String} - Token JWT
 */
const loginUser = async (email, password) => {
  // Kiểm tra người dùng
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  // Kiểm tra mật khẩu
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  // Tạo token JWT
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return token;
};

module.exports = {
  registerUser,
  loginUser,
};
