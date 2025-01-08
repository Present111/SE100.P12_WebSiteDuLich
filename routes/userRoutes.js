const express = require("express");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const userService = require("../services/userService");
const router = express.Router();
const nodemailer = require("nodemailer");
const User = require("../models/User");
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["Admin"]),
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("phoneNumber").notEmpty().withMessage("Phone number is required"),
    body("birthDate").notEmpty().withMessage("Birth date is required"),
    body("role")
      .isIn(["Admin", "Provider", "Customer"])
      .withMessage("Invalid role"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newUser = await userService.createUser(req.body);
      res
        .status(201)
        .json({ message: "User created successfully", data: newUser });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.get("/", async (req, res) => {
  try {
    console.log("HELLO");
    const users = await userService.getAllUsers();
    console.log(users);
    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/users/filter:
 *   get:
 *     summary: Lọc danh sách người dùng theo năm, tháng và vai trò
 *     tags: [Users]
 *     parameters:
 *       - name: year
 *         in: query
 *         required: true
 *         schema:
 *           type: number
 *         description: Năm để lọc (bắt buộc)
 *       - name: month
 *         in: query
 *         required: false
 *         schema:
 *           type: number
 *         description: Tháng để lọc (tùy chọn, 1 đến 12)
 *       - name: role
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [Admin, Provider, Customer]
 *         description: Vai trò để lọc (tùy chọn)
 *     responses:
 *       200:
 *         description: Danh sách người dùng theo bộ lọc
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 year:
 *                   type: number
 *                 month:
 *                   type: string
 *                 role:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       500:
 *         description: Lỗi máy chủ nội bộ
 */
router.get("/filter", async (req, res) => {
  try {
    // Lấy query từ request
    const { year, month, role } = req.query;

    // Kiểm tra đầu vào
    if (!year || isNaN(year)) {
      return res
        .status(400)
        .json({ error: "Year is required and must be a number" });
    }

    if (month && (isNaN(month) || month < 1 || month > 12)) {
      return res.status(400).json({ error: "Month must be between 1 and 12" });
    }

    if (role && !["Admin", "Provider", "Customer"].includes(role)) {
      return res.status(400).json({ error: "Invalid role value" });
    }

    // Tạo phạm vi thời gian
    let start, end;
    if (month) {
      start = new Date(year, month - 1, 1); // Ngày đầu tiên của tháng
      end = new Date(year, month, 0, 23, 59, 59); // Ngày cuối cùng của tháng
    } else {
      start = new Date(year, 0, 1); // Ngày đầu tiên của năm
      end = new Date(year, 11, 31, 23, 59, 59); // Ngày cuối cùng của năm
    }

    // Tạo điều kiện truy vấn
    const query = { createdAt: { $gte: start, $lte: end } };

    if (role) {
      query.role = role; // Lọc theo role
    }

    // Truy vấn cơ sở dữ liệu
    const users = await User.find(query);

    // Trả về kết quả
    res
      .status(200)
      .json({ year, month: month || "All", role: role || "All", data: users });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

router.get(
  "/userID/:userID",

  async (req, res) => {
    try {
      const user = await userService.getUserByUserID(req.params.userID);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.put("/userID/:userID/loveList", async (req, res) => {
  const { userID } = req.params;
  const { loveList } = req.body; // nhận loveList từ client

  console.log(loveList);

  try {
    let user = await User.findOne({ userID }).exec();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // console.log(user)

    // Cập nhật loveList của user
    user.loveList = loveList;
    console.log(user.loveList);

    // Lưu thay đổi vào cơ sở dữ liệu
    await user.save();

    // Populating loveList để lấy thông tin chi tiết các sản phẩm (nếu là tham chiếu đến các tài liệu khác)
    await user.populate({
      path: "loveList",
      populate: {
        path: "locationID", // Tham chiếu từ Service tới Location
        model: "Location", // Model của Location
      },
    }); // Không cần execPopulate nữa
    console.log(user);
    // Trả về kết quả
    res
      .status(200)
      .json({ message: "LoveList updated", loveList: user.loveList });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// Lấy toàn bộ loveList của một user
router.get("/userID/:userID/loveList", async (req, res) => {
  const { userID } = req.params;

  try {
    let user = await User.findOne({ userID }).exec();

    //?.populate("loveList"); // Lấy chi tiết các service trong loveList
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.populate({
      path: "loveList",
      populate: {
        path: "locationID", // Tham chiếu từ Service tới Location
        model: "Location", // Model của Location
      },
    }); // Không cần exe

    res.status(200).json(user.loveList);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

router.get(
  "/:id",

  async (req, res) => {
    try {
      const user = await userService.getUserById(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.put(
  "/:id",

  async (req, res) => {
    try {
      console.log("LOHEE");
      const { role } = req.body;

      if (role && !["Admin", "Provider", "Customer"].includes(role)) {
        return res.status(400).json({ error: "Invalid role value" });
      }

      const updatedUser = await userService.updateUserById(
        req.params.id,
        req.body
      );
      if (!updatedUser)
        return res.status(404).json({ error: "User not found" });

      res
        .status(200)
        .json({ message: "User updated successfully", data: updatedUser });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  }
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      const deletedUser = await userService.deleteUserById(req.params.id);
      if (!deletedUser)
        return res.status(404).json({ error: "User not found" });
      res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

const verificationCodes = new Map();

// Cấu hình gửi email
const transporter = nodemailer.createTransport({
  service: "Gmail", // Hoặc dịch vụ khác
  auth: {
    user: "managingagents.se@gmail.com",
    pass: "gtwdyjnrsuimdojf",
  },
});

// POST /api/users/register
router.post("/register", async (req, res) => {
  const { id, username, password, email, phoneNumber, address, gender } =
    req.body;
  console.log("HELLO");
  console.log(req.body);
  try {
    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("HELLO");
      return res.status(400).json({ message: "Email đã tồn tại." });
    }

    // Tạo mã xác thực và lưu vào bộ nhớ
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    verificationCodes.set(email, {
      verificationCode,
      userData: { id, username, password, email, phoneNumber, address, gender },
    });

    // Gửi mã xác thực qua email
    await transporter.sendMail({
      from: "your-email@gmail.com",
      to: email,
      subject: "Xác nhận tài khoản",
      text: `Mã xác thực của bạn là: ${verificationCode}`,
    });
    console.log(req.body);
    res
      .status(200)
      .json({ message: "Vui lòng kiểm tra email để xác thực tài khoản." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi khi gửi mã xác thực." });
  }
});

router.post("/addStaff", async (req, res) => {
  const { id, email, username, password, role, phone } = req.body;

  try {
    // Kiểm tra xem username đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Đã tồn tại email" });
    }
    console.log("HELLO");

    // Tạo người dùng mới
    const newUser = new User({
      id,
      username,
      password,
      role,
      email,
      phone,
      address: "",
      gender: "Male",
      dateOfBirth: new Date(0),
      isActive: true,
    });

    await newUser.save();

    res.status(201).json({
      message: "Nhân viên mới đã được thêm thành công.",
      user: newUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi khi thêm nhân viên mới." });
  }
});

// POST /api/users/verify
router.post("/verify", async (req, res) => {
  const { email, verificationCode } = req.body;

  console.log(req.body);
  try {
    // Kiểm tra mã xác thực trong bộ nhớ tạm
    const storedData = verificationCodes.get(email);
    console.log(storedData);
    if (!storedData || storedData.verificationCode !== verificationCode) {
      return res
        .status(400)
        .json({ message: "Mã xác thực không hợp lệ hoặc đã hết hạn." });
    }

    // Tạo người dùng mới từ dữ liệu lưu trữ
    const { id, username, password, phone } = storedData.userData;

    const newUser = new User({
      userID: id,
      fullName: username,
      userName: username,
      password,
      email,
      phoneNumber: phone ? phone : "0",

      birthDate: new Date(0),
      active: true, // Kích hoạt tài khoản ngay sau khi xác thực
    });

    await newUser.save();

    // Xóa mã xác thực sau khi sử dụng
    //verificationCodes.delete(email);

    res
      .status(201)
      .json({ message: "Tài khoản đã được xác thực và tạo thành công!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi khi xác thực tài khoản." });
  }
});

// POST /api/users/resend-code
router.post("/resend-code", async (req, res) => {
  const { email } = req.body;

  try {
    // Kiểm tra người dùng tồn tại và chưa kích hoạt
    const user = await User.findOne({ email });
    if (!user || user.isActive) {
      return res.status(400).json({
        message: "Email không tồn tại hoặc tài khoản đã được kích hoạt.",
      });
    }

    // Kiểm tra mã xác thực còn lưu trong bộ nhớ tạm
    const existingCode = verificationCodes.get(email);
    if (existingCode) {
      // Nếu mã xác thực vẫn còn, gửi lại mã
      await transporter.sendMail({
        from: "your-email@gmail.com",
        to: email,
        subject: "Mã xác thực mới của bạn",
        text: `Mã xác thực của bạn là: ${existingCode.verificationCode}`,
      });

      return res.status(200).json({
        message: "Mã xác thực đã được gửi lại. Vui lòng kiểm tra email.",
      });
    }

    // Tạo mã xác thực mới nếu không có mã xác thực trước đó
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Lưu mã xác thực mới vào bộ nhớ
    verificationCodes.set(email, { verificationCode, userData: { email } });

    // Gửi mã mới qua email
    await transporter.sendMail({
      from: "your-email@gmail.com",
      to: email,
      subject: "Mã xác thực mới của bạn",
      text: `Mã xác thực của bạn là: ${verificationCode}`,
    });

    res.status(200).json({
      message: "Mã xác thực mới đã được gửi. Vui lòng kiểm tra email.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi khi gửi lại mã xác thực." });
  }
});

// POST /api/users/forgot-password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // Kiểm tra xem email có tồn tại không
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Email không tồn tại trong hệ thống." });
    }

    // Tạo mã xác thực
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu mã xác thực vào bộ nhớ tạm
    verificationCodes.set(email, { resetCode, createdAt: Date.now() });

    // Gửi mã xác thực qua email
    await transporter.sendMail({
      from: "your-email@gmail.com",
      to: email,
      subject: "Mã đặt lại mật khẩu",
      text: `Mã đặt lại mật khẩu của bạn là: ${resetCode}. Mã có hiệu lực trong 10 phút.`,
    });

    res
      .status(200)
      .json({ message: "Mã đặt lại mật khẩu đã được gửi qua email." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi gửi mã đặt lại mật khẩu." });
  }
});

// POST /api/users/reset-password
router.post("/reset-password", async (req, res) => {
  const { email, resetCode, newPassword } = req.body;

  try {
    // Kiểm tra mã xác thực trong bộ nhớ
    const storedData = verificationCodes.get(email);
    if (!storedData || storedData.resetCode !== resetCode) {
      return res
        .status(400)
        .json({ message: "Mã xác thực không hợp lệ hoặc đã hết hạn." });
    }

    // Kiểm tra thời gian hết hạn (10 phút)
    const tenMinutes = 10 * 60 * 1000;
    if (Date.now() - storedData.createdAt > tenMinutes) {
      verificationCodes.delete(email);
      return res.status(400).json({ message: "Mã xác thực đã hết hạn." });
    }

    // Cập nhật mật khẩu mới
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Email không tồn tại trong hệ thống." });
    }

    user.password = newPassword; // Cần hash mật khẩu nếu cần
    await user.save();

    // Xóa mã xác thực sau khi sử dụng
    verificationCodes.delete(email);

    res.status(200).json({ message: "Mật khẩu đã được thay đổi thành công." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi đặt lại mật khẩu." });
  }
});

module.exports = router;
