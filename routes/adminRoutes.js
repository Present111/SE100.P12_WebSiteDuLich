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

// CREATE - Tạo mới Admin
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["Admin"]),
  [
    body("userID").notEmpty().withMessage("UserID is required"),
    body("accessLevel").notEmpty().withMessage("Access level is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newAdmin = await adminService.createAdmin(req.body);
      res
        .status(201)
        .json({ message: "Admin created successfully", data: newAdmin });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ALL - Lấy danh sách Admins
router.get("/", authMiddleware, roleMiddleware(["Admin"]), async (req, res) => {
  try {
    const admins = await adminService.getAllAdmins();
    res.status(200).json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE - Lấy thông tin chi tiết Admin
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

// UPDATE - Cập nhật Admin
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

// DELETE - Xóa Admin
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
