const express = require("express");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const adminService = require("../services/adminService");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admins
 *   description: API quản lý Admins (Chỉ Admin)
 */

/**
 * @swagger
 * /api/admins:
 *   post:
 *     tags:
 *       - Admins
 *     summary: Tạo mới Admin
 *     description: API này tạo mới một Admin, chỉ có quyền Admin mới thực hiện được.
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
 *                 description: ID của người dùng.
 *                 example: "12345"
 *               accessLevel:
 *                 type: string
 *                 description: Cấp độ quyền truy cập của Admin.
 *                 example: "SuperAdmin"
 *     responses:
 *       201:
 *         description: Tạo mới Admin thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Admin created successfully"
 *                 data:
 *                   type: object
 *                   description: Thông tin chi tiết của Admin vừa được tạo.
 *       400:
 *         description: Lỗi do dữ liệu không hợp lệ.
 *       500:
 *         description: Lỗi máy chủ.
 */

// Route tạo Admin mới
router.post(
  "/",
  // authMiddleware, // Middleware xác thực người dùng (nếu cần)
  // roleMiddleware(["Admin"]), // Middleware kiểm tra quyền Admin (nếu cần)
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
      // Gọi service để tạo Admin mới
      const newAdmin = await adminService.createAdmin({ userID, accessLevel });

      // Trả về phản hồi thành công
      res.status(201).json({
        message: "Admin created successfully",
        data: newAdmin,
      });
    } catch (err) {
      // Xử lý lỗi nếu có
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
);
/**
 * @swagger
 * /api/admins:
 *   get:
 *     tags:
 *       - Admins
 *     summary: Lấy danh sách Admins
 *     description: API này trả về danh sách tất cả các Admin. Chỉ có quyền Admin mới thực hiện được.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách Admins thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID của Admin.
 *                   userID:
 *                     type: string
 *                     description: ID người dùng của Admin.
 *                   accessLevel:
 *                     type: string
 *                     description: Cấp độ quyền truy cập.
 *       500:
 *         description: Lỗi máy chủ.
 */
router.get("/", authMiddleware, roleMiddleware(["Admin"]), async (req, res) => {
  try {
    const admins = await adminService.getAllAdmins();
    res.status(200).json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/admins/{id}:
 *   get:
 *     tags:
 *       - Admins
 *     summary: Lấy thông tin chi tiết Admin
 *     description: API này trả về thông tin chi tiết của một Admin dựa trên ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của Admin cần lấy thông tin.
 *     responses:
 *       200:
 *         description: Lấy thông tin thành công.
 *       404:
 *         description: Admin không tồn tại.
 *       500:
 *         description: Lỗi máy chủ.
 */
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      const admin = await adminService.getAdminById(req.params.id);
      if (!admin) return res.status(404).json({ error: "Admin not found" });
      res.status(200).json(admin);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * @swagger
 * /api/admins/{id}:
 *   put:
 *     tags:
 *       - Admins
 *     summary: Cập nhật Admin
 *     description: API này cập nhật thông tin của một Admin dựa trên ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của Admin cần cập nhật.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Thông tin cần cập nhật.
 *     responses:
 *       200:
 *         description: Cập nhật thành công.
 *       404:
 *         description: Admin không tồn tại.
 *       500:
 *         description: Lỗi máy chủ.
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      const updatedAdmin = await adminService.updateAdminById(
        req.params.id,
        req.body
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

/**
 * @swagger
 * /api/admins/{id}:
 *   delete:
 *     tags:
 *       - Admins
 *     summary: Xóa Admin
 *     description: API này xóa một Admin dựa trên ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của Admin cần xóa.
 *     responses:
 *       200:
 *         description: Xóa thành công.
 *       500:
 *         description: Lỗi máy chủ.
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      await adminService.deleteAdminById(req.params.id);
      res.status(200).json({ message: "Admin deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
