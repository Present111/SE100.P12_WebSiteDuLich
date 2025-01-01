const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Các API liên quan đến đăng ký và đăng nhập người dùng
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký người dùng mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe123  # Dữ liệu mẫu
 *               password:
 *                 type: string
 *                 example: "Password123!"  # Dữ liệu mẫu
 *               email:
 *                 type: string
 *                 example: johndoe@example.com  # Dữ liệu mẫu
 *               phoneNumber:
 *                 type: string
 *                 example: "0123456789"  # Dữ liệu mẫu
 *               address:
 *                 type: string
 *                 example: "123 Main St, Hanoi, Vietnam"  # Dữ liệu mẫu
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *                 example: "Male"  # Dữ liệu mẫu
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"  # Dữ liệu mẫu
 *               role:
 *                 type: string
 *                 enum: [Customer, Admin, Seller, WarehouseStaff]
 *                 example: "Customer"  # Dữ liệu mẫu
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       400:
 *         description: Tên người dùng đã tồn tại
 *       500:
 *         description: Lỗi server
 */
router.post('/register', async (req, res) => {
  const { username, password, email, phoneNumber, address, gender, dateOfBirth, role } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Tên người dùng đã tồn tại!" });
    }

    const newUser = new User({
      id: new mongoose.Types.ObjectId().toString(),
      username,
      password,
      email,
      phoneNumber,
      address,
      gender,
      dateOfBirth,
      role,
    });

    await newUser.save();
    return res.status(201).json({ message: "Đăng ký thành công!" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
});


router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password)
 console.log("HELLO")
  try {
    const email = username

    const user = await User.findOne({ email});
    console.log("HELLO",user)
    if (!user) {
      return res.status(400).json({ message: "Email người dùng hoặc mật khẩu không đúng!" });
    }

    // const isMatch = await user.comparePassword(password);
    const isMatch = await User.findOne({password});
    if (!isMatch) {
      return res.status(400).json({ message: "Email người dùng hoặc mật khẩu không đúng!" });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.fullName, role: user.role,userID: user.userID },
      process.env.JWT_SECRET, // Sử dụng một khóa bảo mật trong file .env
      { expiresIn: '10h' }
    );

    return res.status(200).json({ token });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
