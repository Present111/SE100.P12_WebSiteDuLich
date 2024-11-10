const express = require("express");
const { body, validationResult } = require("express-validator");
const Table = require("../models/Table");
const Restaurant = require("../models/Restaurant");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tables
 *   description: API quản lý Tables
 */

// CREATE - Thêm mới Table (Chỉ Provider)
/**
 * @swagger
 * /api/tables:
 *   post:
 *     summary: Tạo mới một Table (Chỉ Provider)
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tableID:
 *                 type: string
 *                 example: T001
 *               restaurantID:
 *                 type: string
 *                 example: R001
 *               tableType:
 *                 type: string
 *                 example: Outdoor
 *               availableDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-01
 *     responses:
 *       201:
 *         description: Table created successfully
 *       403:
 *         description: Access denied
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["Provider"]), // Chỉ Provider được phép
  [
    body("tableID").notEmpty().withMessage("Table ID is required"),
    body("restaurantID").notEmpty().withMessage("Restaurant ID is required"),
    body("tableType").notEmpty().withMessage("Table Type is required"),
    body("availableDate").isISO8601().withMessage("Invalid date format"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tableID, restaurantID, tableType, availableDate } = req.body;

    try {
      // Kiểm tra Restaurant ID có tồn tại và thuộc về Provider hiện tại hay không
      const restaurant = await Restaurant.findOne({ _id: restaurantID });
      if (!restaurant) {
        return res.status(400).json({ error: "Restaurant ID không tồn tại." });
      }

      if (
        req.user.role === "Provider" &&
        req.user.id !== restaurant.serviceID.providerID
      ) {
        return res
          .status(403)
          .json({ error: "Bạn không có quyền tạo Table cho Restaurant này." });
      }

      // Tạo Table mới
      const newTable = new Table({
        tableID,
        restaurantID,
        tableType,
        availableDate,
      });

      await newTable.save();
      res
        .status(201)
        .json({ message: "Table created successfully", data: newTable });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ALL - Lấy danh sách Tables (Admin hoặc Provider)
/**
 * @swagger
 * /api/tables:
 *   get:
 *     summary: Lấy danh sách tất cả Tables
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách Tables
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["Admin", "Provider"]),
  async (req, res) => {
    try {
      const tables = await Table.find().populate(
        "restaurantID",
        "restaurantName serviceID"
      );
      res.status(200).json(tables);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ONE - Lấy thông tin chi tiết Table
/**
 * @swagger
 * /api/tables/{id}:
 *   get:
 *     summary: Lấy thông tin một Table
 *     tags: [Tables]
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
 *         description: Thông tin Table
 *       404:
 *         description: Table not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const table = await Table.findById(req.params.id).populate(
      "restaurantID",
      "restaurantName serviceID"
    );
    if (!table) return res.status(404).json({ error: "Table not found" });

    res.status(200).json(table);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Xóa Table (Chỉ Admin hoặc Provider sở hữu Restaurant)
/**
 * @swagger
 * /api/tables/{id}:
 *   delete:
 *     summary: Xóa một Table
 *     tags: [Tables]
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
 *         description: Table deleted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Table not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const table = await Table.findById(req.params.id).populate("restaurantID");

    if (!table) {
      return res.status(404).json({ error: "Table not found" });
    }

    // Chỉ Admin hoặc Provider sở hữu Restaurant được phép xóa
    if (
      req.user.role !== "Admin" &&
      req.user.id !== table.restaurantID.serviceID.providerID
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    await table.remove();
    res.status(200).json({ message: "Table deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
