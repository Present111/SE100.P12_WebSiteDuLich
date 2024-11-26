const express = require("express");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const tableService = require("../services/tableService");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tables
 *   description: API quản lý Tables
 */

// CREATE - Tạo mới Table
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
 *         multipart/form-data:
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
 *               price:
 *                 type: number
 *                 example: 500
 *               discountPrice:
 *                 type: number
 *                 example: 400
 *               active:
 *                 type: boolean
 *                 example: true
 *               picture:
 *                 type: string
 *                 format: binary
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
  roleMiddleware(["Provider"]),
  upload.single("picture"),
  [
    body("tableID").notEmpty().withMessage("Table ID is required"),
    body("restaurantID").notEmpty().withMessage("Restaurant ID is required"),
    body("tableType").notEmpty().withMessage("Table Type is required"),
    body("availableDate").isISO8601().withMessage("Invalid date format"),
    body("price").isFloat({ min: 0 }).withMessage("Price must be at least 0"),
    body("discountPrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Discount Price must be at least 0"),
    body("discountPrice").custom((value, { req }) => {
      if (value && value >= req.body.price) {
        throw new Error("Discount Price must be less than Price");
      }
      return true;
    }),
    body("active")
      .optional()
      .isBoolean()
      .withMessage("Active must be a boolean"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        tableID,
        restaurantID,
        tableType,
        availableDate,
        price,
        discountPrice,
        active,
      } = req.body;

      const picturePath = req.file ? `/uploads/${req.file.filename}` : null;

      const newTable = await tableService.createTable({
        tableID,
        restaurantID,
        tableType,
        availableDate,
        price,
        discountPrice,
        active,
        picture: picturePath,
      });

      res
        .status(201)
        .json({ message: "Table created successfully", data: newTable });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ALL - Lấy danh sách Tables
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
 *       500:
 *         description: Server error
 */
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["Admin", "Provider"]),
  async (req, res) => {
    try {
      const tables = await tableService.getAllTables();
      res.status(200).json(tables);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ONE - Lấy chi tiết Table theo ID
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
    const table = await tableService.getTableById(req.params.id);
    if (!table) return res.status(404).json({ error: "Table not found" });
    res.status(200).json(table);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE - Cập nhật thông tin Table
/**
 * @swagger
 * /api/tables/{id}:
 *   put:
 *     summary: Cập nhật thông tin một Table
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tableType:
 *                 type: string
 *                 example: Indoor
 *               availableDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-15
 *               active:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Table updated successfully
 *       404:
 *         description: Table not found
 *       500:
 *         description: Server error
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updatedTable = await tableService.updateTableById(
      req.params.id,
      req.body
    );
    res
      .status(200)
      .json({ message: "Table updated successfully", data: updatedTable });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Xóa Table
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
 *       404:
 *         description: Table not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await tableService.deleteTableById(req.params.id);
    res.status(200).json({ message: "Table deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
