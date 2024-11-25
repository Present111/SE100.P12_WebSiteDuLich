const express = require("express");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const priceCategoryService = require("../services/priceCategoryService");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: PriceCategories
 *   description: API quản lý bảng giá
 */

// CREATE - Tạo mới bảng giá
/**
 * @swagger
 * /api/price-categories:
 *   post:
 *     summary: Tạo mới bảng giá
 *     tags: [PriceCategories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               priceCategoryID:
 *                 type: string
 *                 example: P001
 *               cheap:
 *                 type: number
 *                 example: 100
 *               midRange:
 *                 type: number
 *                 example: 200
 *               luxury:
 *                 type: number
 *                 example: 500
 *     responses:
 *       201:
 *         description: PriceCategory created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["Admin"]),
  [
    body("priceCategoryID")
      .notEmpty()
      .withMessage("PriceCategory ID is required"),
    body("cheap").isNumeric().withMessage("Cheap price must be a number"),
    body("midRange")
      .isNumeric()
      .withMessage("Mid-range price must be a number"),
    body("luxury").isNumeric().withMessage("Luxury price must be a number"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newPriceCategory = await priceCategoryService.createPriceCategory(
        req.body
      );
      res
        .status(201)
        .json({
          message: "PriceCategory created successfully",
          data: newPriceCategory,
        });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ALL - Lấy danh sách bảng giá
/**
 * @swagger
 * /api/price-categories:
 *   get:
 *     summary: Lấy danh sách tất cả bảng giá
 *     tags: [PriceCategories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách bảng giá
 *       500:
 *         description: Server error
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const priceCategories = await priceCategoryService.getAllPriceCategories();
    res.status(200).json(priceCategories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE - Lấy chi tiết bảng giá
/**
 * @swagger
 * /api/price-categories/{id}:
 *   get:
 *     summary: Lấy thông tin một bảng giá
 *     tags: [PriceCategories]
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
 *         description: Thông tin bảng giá
 *       404:
 *         description: PriceCategory not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const priceCategory = await priceCategoryService.getPriceCategoryById(
      req.params.id
    );
    if (!priceCategory)
      return res.status(404).json({ error: "PriceCategory not found" });
    res.status(200).json(priceCategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE - Cập nhật bảng giá
/**
 * @swagger
 * /api/price-categories/{id}:
 *   put:
 *     summary: Cập nhật thông tin bảng giá
 *     tags: [PriceCategories]
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
 *               cheap:
 *                 type: number
 *                 example: 150
 *               midRange:
 *                 type: number
 *                 example: 250
 *               luxury:
 *                 type: number
 *                 example: 550
 *     responses:
 *       200:
 *         description: PriceCategory updated successfully
 *       404:
 *         description: PriceCategory not found
 *       500:
 *         description: Server error
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updatedPriceCategory =
      await priceCategoryService.updatePriceCategoryById(
        req.params.id,
        req.body
      );
    res
      .status(200)
      .json({
        message: "PriceCategory updated successfully",
        data: updatedPriceCategory,
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Xóa bảng giá
/**
 * @swagger
 * /api/price-categories/{id}:
 *   delete:
 *     summary: Xóa một bảng giá
 *     tags: [PriceCategories]
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
 *         description: PriceCategory deleted successfully
 *       404:
 *         description: PriceCategory not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await priceCategoryService.deletePriceCategoryById(req.params.id);
    res.status(200).json({ message: "PriceCategory deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
