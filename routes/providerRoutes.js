const express = require("express");
const { body, validationResult } = require("express-validator");
const Provider = require("../models/Provider");
const User = require("../models/User");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const router = express.Router();
const mongoose = require("mongoose");

/**
 * @swagger
 * tags:
 *   name: Providers
 *   description: API quản lý Providers (Chỉ Admin)
 */

/**
 * @swagger
 * /api/providers:
 *   post:
 *     summary: Tạo mới một Provider (Chỉ Admin)
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               providerID:
 *                 type: string
 *                 description: ID duy nhất của Provider
 *                 example: P001
 *               userID:
 *                 type: string
 *                 description: ID của User phải tồn tại trong bảng Users và có vai trò là Provider
 *                 example: 64f6b3c9e3a1a4321f2c1a8b
 *               providerName:
 *                 type: string
 *                 description: Tên của Provider
 *                 example: ABC Travels
 *               address:
 *                 type: string
 *                 description: Địa chỉ của Provider
 *                 example: 123 Street, City, Country
 *               serviceDescription:
 *                 type: string
 *                 description: Mô tả các dịch vụ mà Provider cung cấp
 *                 example: Luxury travel services
 *     responses:
 *       201:
 *         description: Provider created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Provider created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     providerID:
 *                       type: string
 *                       example: P001
 *                     userID:
 *                       type: string
 *                       example: 64f6b3c9e3a1a4321f2c1a8b
 *                     providerName:
 *                       type: string
 *                       example: ABC Travels
 *                     address:
 *                       type: string
 *                       example: 123 Street, City, Country
 *                     serviceDescription:
 *                       type: string
 *                       example: Luxury travel services
 *                     _id:
 *                       type: string
 *                       example: 64f7b8e3e9a1a4321f2d3b4a
 *       400:
 *         description: Validation error hoặc UserID không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: UserID không tồn tại hoặc không phải Provider.
 *       403:
 *         description: Access denied (Không có quyền truy cập)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Access denied
 *       500:
 *         description: Lỗi hệ thống
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */

// CREATE - Thêm mới Provider
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["Admin"]),
  [
    body("providerID").notEmpty().withMessage("Provider ID is required"),
    body("userID").notEmpty().withMessage("User ID is required"),
    body("providerName").notEmpty().withMessage("Provider name is required"),
    body("address").notEmpty().withMessage("Address is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { providerID, userID, providerName, address, serviceDescription } =
      req.body;

    try {
      // Kiểm tra User ID
      const user = await User.findOne({ _id: userID, role: "Provider" });
      if (!user) {
        return res
          .status(400)
          .json({ error: "UserID không tồn tại hoặc không phải Provider." });
      }

      // Kiểm tra Provider ID đã tồn tại chưa
      const existingProvider = await Provider.findOne({ providerID });
      if (existingProvider) {
        return res
          .status(400)
          .json({ error: "Provider với ID này đã tồn tại." });
      }

      // Tạo Provider mới
      const newProvider = new Provider({
        providerID,
        userID: new mongoose.Types.ObjectId(userID), // Chuyển đổi đúng cách
        providerName,
        address,
        serviceDescription,
      });

      await newProvider.save();

      res
        .status(201)
        .json({ message: "Provider created successfully", data: newProvider });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ALL - Lấy danh sách Providers
/**
 * @swagger
 * /api/providers:
 *   get:
 *     summary: Lấy danh sách tất cả Providers (Chỉ Admin)
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách Providers
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
router.get("/", authMiddleware, roleMiddleware(["Admin"]), async (req, res) => {
  try {
    const providers = await Provider.find().populate(
      "userID",
      "fullName email"
    );
    res.status(200).json(providers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE - Lấy thông tin chi tiết Provider
/**
 * @swagger
 * /api/providers/{id}:
 *   get:
 *     summary: Lấy thông tin một Provider (Chỉ Admin)
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: 64f6b3c9e3a1a4321f2c1a8b
 *     responses:
 *       200:
 *         description: Thông tin Provider
 *       403:
 *         description: Access denied
 *       404:
 *         description: Provider not found
 *       500:
 *         description: Server error
 */
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      const provider = await Provider.findById(req.params.id).populate(
        "userID",
        "fullName email"
      );
      if (!provider)
        return res.status(404).json({ error: "Provider not found" });

      res.status(200).json(provider);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// UPDATE - Cập nhật Provider
/**
 * @swagger
 * /api/providers/{id}:
 *   put:
 *     summary: Cập nhật thông tin một Provider (Chỉ Admin)
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: 64f6b3c9e3a1a4321f2c1a8b
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               providerName:
 *                 type: string
 *                 example: ABC Travels Updated
 *               address:
 *                 type: string
 *                 example: 456 Street, City, Country
 *               serviceDescription:
 *                 type: string
 *                 example: Updated travel services
 *     responses:
 *       200:
 *         description: Provider updated successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Provider not found
 *       500:
 *         description: Server error
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      const updatedProvider = await Provider.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updatedProvider)
        return res.status(404).json({ error: "Provider not found" });

      res.status(200).json({
        message: "Provider updated successfully",
        data: updatedProvider,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// DELETE - Xóa Provider
/**
 * @swagger
 * /api/providers/{id}:
 *   delete:
 *     summary: Xóa một Provider (Chỉ Admin)
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: 64f6b3c9e3a1a4321f2c1a8b
 *     responses:
 *       200:
 *         description: Provider deleted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Provider not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      const deletedProvider = await Provider.findByIdAndDelete(req.params.id);
      if (!deletedProvider)
        return res.status(404).json({ error: "Provider not found" });

      res.status(200).json({ message: "Provider deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
