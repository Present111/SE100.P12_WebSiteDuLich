const express = require("express");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const suitabilityService = require("../services/suitabilityService");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Suitabilities
 *   description: API quản lý mục phù hợp
 */

// CREATE - Tạo mới mục phù hợp
/**
 * @swagger
 * /api/suitabilities:
 *   post:
 *     summary: Tạo mới mục phù hợp
 *     tags: [Suitabilities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               suitabilityID:
 *                 type: string
 *                 example: S001
 *               name:
 *                 type: string
 *                 example: Gia đình
 *     responses:
 *       201:
 *         description: Suitability created successfully
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
    body("suitabilityID").notEmpty().withMessage("Suitability ID is required"),
    body("name").notEmpty().withMessage("Name is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newSuitability = await suitabilityService.createSuitability(
        req.body
      );
      res.status(201).json({
        message: "Suitability created successfully",
        data: newSuitability,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ALL - Lấy danh sách mục phù hợp
/**
 * @swagger
 * /api/suitabilities:
 *   get:
 *     summary: Lấy danh sách tất cả mục phù hợp
 *     tags: [Suitabilities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách mục phù hợp
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res) => {
  try {
    const suitabilities = await suitabilityService.getAllSuitabilities();
    res.status(200).json(suitabilities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE - Lấy chi tiết mục phù hợp
/**
 * @swagger
 * /api/suitabilities/{id}:
 *   get:
 *     summary: Lấy thông tin một mục phù hợp
 *     tags: [Suitabilities]
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
 *         description: Thông tin mục phù hợp
 *       404:
 *         description: Suitability not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const suitability = await suitabilityService.getSuitabilityById(
      req.params.id
    );
    if (!suitability)
      return res.status(404).json({ error: "Suitability not found" });
    res.status(200).json(suitability);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE - Cập nhật mục phù hợp
/**
 * @swagger
 * /api/suitabilities/{id}:
 *   put:
 *     summary: Cập nhật thông tin mục phù hợp
 *     tags: [Suitabilities]
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
 *               name:
 *                 type: string
 *                 example: Cặp đôi
 *     responses:
 *       200:
 *         description: Suitability updated successfully
 *       404:
 *         description: Suitability not found
 *       500:
 *         description: Server error
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updatedSuitability = await suitabilityService.updateSuitabilityById(
      req.params.id,
      req.body
    );
    res.status(200).json({
      message: "Suitability updated successfully",
      data: updatedSuitability,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Xóa mục phù hợp
/**
 * @swagger
 * /api/suitabilities/{id}:
 *   delete:
 *     summary: Xóa một mục phù hợp
 *     tags: [Suitabilities]
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
 *         description: Suitability deleted successfully
 *       404:
 *         description: Suitability not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await suitabilityService.deleteSuitabilityById(req.params.id);
    res.status(200).json({ message: "Suitability deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
