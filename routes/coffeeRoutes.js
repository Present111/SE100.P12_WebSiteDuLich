const express = require("express");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const coffeeService = require("../services/coffeeService");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Coffees
 *   description: API quản lý Coffees
 */

// CREATE - Tạo mới Coffee
/**
 * @swagger
 * /api/coffees:
 *   post:
 *     summary: Tạo mới một Coffee (Chỉ Provider)
 *     tags: [Coffees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               coffeeID:
 *                 type: string
 *                 example: C001
 *               serviceID:
 *                 type: string
 *                 example: 64f6b3c9e3a1a4321f2c1a8b
 *               coffeeTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["64f6b3c9e3a1a4321f2c1a8c", "64f6b3c9e3a1a4321f2c1a8d"]
 *               averagePrice:
 *                 type: number
 *                 example: 50
 *               pictures:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Coffee created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["Provider"]),
  upload.array("pictures", 5), // Hỗ trợ tải lên tối đa 5 ảnh
  [
    body("coffeeID").notEmpty().withMessage("Coffee ID is required"),
    body("serviceID").notEmpty().withMessage("Service ID is required"),
    body("coffeeTypes")
      .isArray({ min: 1 })
      .withMessage("Coffee Types must be a non-empty array"),
    body("averagePrice")
      .isNumeric()
      .withMessage("Average Price must be a valid number"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const picturePaths = req.files.map((file) => `/uploads/${file.filename}`);
      const newCoffee = await coffeeService.createCoffee(
        req.body,
        req.user,
        picturePaths
      );
      res
        .status(201)
        .json({ message: "Coffee created successfully", data: newCoffee });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ALL - Lấy danh sách Coffees
/**
 * @swagger
 * /api/coffees:
 *   get:
 *     summary: Lấy danh sách tất cả Coffees
 *     tags: [Coffees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách Coffees
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res) => {
  try {
    const coffees = await coffeeService.getAllCoffees();
    res.status(200).json(coffees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE - Lấy chi tiết Coffee
/**
 * @swagger
 * /api/coffees/{id}:
 *   get:
 *     summary: Lấy thông tin một Coffee
 *     tags: [Coffees]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: 64f6b3c9e3a1a4321f2c1a8b
 *     responses:
 *       200:
 *         description: Thông tin Coffee
 *       404:
 *         description: Coffee not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {
  try {
    const coffee = await coffeeService.getCoffeeById(req.params.id);
    if (!coffee) return res.status(404).json({ error: "Coffee not found" });
    res.status(200).json(coffee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE - Cập nhật Coffee
/**
 * @swagger
 * /api/coffees/{id}:
 *   put:
 *     summary: Cập nhật thông tin một Coffee
 *     tags: [Coffees]
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
 *               coffeeType:
 *                 type: string
 *                 example: Latte
 *               averagePrice:
 *                 type: number
 *                 example: 60
 *     responses:
 *       200:
 *         description: Coffee updated successfully
 *       404:
 *         description: Coffee not found
 *       500:
 *         description: Server error
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updatedCoffee = await coffeeService.updateCoffeeById(
      req.params.id,
      req.body,
      req.user
    );
    res
      .status(200)
      .json({ message: "Coffee updated successfully", data: updatedCoffee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Xóa Coffee
/**
 * @swagger
 * /api/coffees/{id}:
 *   delete:
 *     summary: Xóa một Coffee
 *     tags: [Coffees]
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
 *         description: Coffee deleted successfully
 *       404:
 *         description: Coffee not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await coffeeService.deleteCoffeeById(req.params.id, req.user);
    res.status(200).json({ message: "Coffee deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
