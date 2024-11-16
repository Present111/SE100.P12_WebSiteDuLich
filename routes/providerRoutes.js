const express = require("express");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const providerService = require("../services/providerService");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Providers
 *   description: API quản lý Providers (Chỉ Admin)
 */

// CREATE - Tạo mới Provider
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
 *                 example: P001
 *               userID:
 *                 type: string
 *                 example: 64f6b3c9e3a1a4321f2c1a8b
 *               providerName:
 *                 type: string
 *                 example: ABC Travels
 *               address:
 *                 type: string
 *                 example: 123 Street, City, Country
 *               serviceDescription:
 *                 type: string
 *                 example: Luxury travel services
 *     responses:
 *       201:
 *         description: Provider created successfully
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

    try {
      const newProvider = await providerService.createProvider(req.body);
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
 *       500:
 *         description: Server error
 */
router.get("/", authMiddleware, roleMiddleware(["Admin"]), async (req, res) => {
  try {
    const providers = await providerService.getAllProviders();
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
 *       500:
 *         description: Server error
 */
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      const provider = await providerService.getProviderById(req.params.id);
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
 *       500:
 *         description: Server error
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      const updatedProvider = await providerService.updateProviderById(
        req.params.id,
        req.body
      );
      if (!updatedProvider)
        return res.status(404).json({ error: "Provider not found" });
      res
        .status(200)
        .json({
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
 *     responses:
 *       200:
 *         description: Provider deleted successfully
 *       500:
 *         description: Server error
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      await providerService.deleteProviderById(req.params.id);
      res.status(200).json({ message: "Provider deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
