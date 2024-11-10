const express = require("express");
const { body, validationResult } = require("express-validator");
const Admin = require("../models/Admin");
const User = require("../models/User");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admins
 *   description: API quản lý Admins (Chỉ Admin)
 */

// CREATE - Thêm mới Admin
/**
 * @swagger
 * /api/admins:
 *   post:
 *     summary: Tạo mới một Admin (Chỉ Admin)
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userID:
 *                 type: string
 *                 example: U001
 *               accessLevel:
 *                 type: string
 *                 example: SuperAdmin
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["Admin"]), // Chỉ Admin có quyền
  [
    body("userID").notEmpty().withMessage("UserID is required"),
    body("accessLevel").notEmpty().withMessage("Access level is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userID, accessLevel } = req.body;

    try {
      // Kiểm tra UserID đã tồn tại chưa
      const existingUser = await User.findOne({ userID, role: "Admin" });
      if (!existingUser) {
        return res
          .status(400)
          .json({ error: "UserID không tồn tại hoặc không phải Admin." });
      }

      // Kiểm tra Admin đã tồn tại chưa
      const existingAdmin = await Admin.findOne({ userID });
      if (existingAdmin) {
        return res
          .status(400)
          .json({ error: "Admin với UserID này đã tồn tại." });
      }

      // Tạo Admin mới
      const newAdmin = new Admin({ userID, accessLevel });
      await newAdmin.save();

      res
        .status(201)
        .json({ message: "Admin created successfully", data: newAdmin });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ALL - Lấy danh sách Admins
/**
 * @swagger
 * /api/admins:
 *   get:
 *     summary: Lấy danh sách tất cả Admins (Chỉ Admin)
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách Admins
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
router.get("/", authMiddleware, roleMiddleware(["Admin"]), async (req, res) => {
  try {
    const admins = await Admin.find().populate("userID", "fullName email");
    res.status(200).json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE - Lấy thông tin chi tiết Admin
/**
 * @swagger
 * /api/admins/{id}:
 *   get:
 *     summary: Lấy thông tin một Admin (Chỉ Admin)
 *     tags: [Admins]
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
 *         description: Thông tin Admin
 *       403:
 *         description: Access denied
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Server error
 */
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      const admin = await Admin.findById(req.params.id).populate(
        "userID",
        "fullName email"
      );
      if (!admin) return res.status(404).json({ error: "Admin not found" });

      res.status(200).json(admin);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// UPDATE - Cập nhật Admin
/**
 * @swagger
 * /api/admins/{id}:
 *   put:
 *     summary: Cập nhật thông tin một Admin (Chỉ Admin)
 *     tags: [Admins]
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
 *               accessLevel:
 *                 type: string
 *                 example: SuperAdmin
 *     responses:
 *       200:
 *         description: Admin updated successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Server error
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      const updatedAdmin = await Admin.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updatedAdmin)
        return res.status(404).json({ error: "Admin not found" });

      res
        .status(200)
        .json({ message: "Admin updated successfully", data: updatedAdmin });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// DELETE - Xóa Admin
/**
 * @swagger
 * /api/admins/{id}:
 *   delete:
 *     summary: Xóa một Admin (Chỉ Admin)
 *     tags: [Admins]
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
 *         description: Admin deleted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      const deletedAdmin = await Admin.findByIdAndDelete(req.params.id);
      if (!deletedAdmin)
        return res.status(404).json({ error: "Admin not found" });

      res.status(200).json({ message: "Admin deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
