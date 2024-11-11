const express = require("express");
const { body, validationResult } = require("express-validator");
const Service = require("../models/Service");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const router = express.Router();
const mongoose = require("mongoose");

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: API quản lý Services
 */

// CREATE - Thêm mới Service (Chỉ Provider)
/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Tạo mới một Service (Chỉ Provider)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serviceID:
 *                 type: string
 *                 example: S001
 *               providerID:
 *                 type: string
 *                 example: 64f6b3c9e3a1a4321f2c1a8b
 *               locationID:
 *                 type: string
 *                 example: 64f6b3c9e3a1a4321f2c1a8b
 *               serviceName:
 *                 type: string
 *                 example: Luxury Travel
 *               price:
 *                 type: number
 *                 example: 1000
 *               discountPrice:
 *                 type: number
 *                 example: 900
 *               description:
 *                 type: string
 *                 example: "Luxury travel package with discounts"
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *                 example: Active
 *     responses:
 *       201:
 *         description: Service created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Service created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Service'
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
  roleMiddleware(["Provider"]), // Chỉ Provider được phép
  [
    body("serviceID").notEmpty().withMessage("Service ID is required"),
    body("providerID")
      .isMongoId()
      .withMessage("Provider ID must be a valid MongoID"),
    body("locationID")
      .isMongoId()
      .withMessage("Location ID must be a valid MongoID"),
    body("serviceName").notEmpty().withMessage("Service name is required"),
    body("price").isNumeric().withMessage("Price must be a number"),
    body("discountPrice")
      .optional()
      .isNumeric()
      .withMessage("Discount Price must be a number"),
    body("status").isIn(["Active", "Inactive"]).withMessage("Invalid status"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      serviceID,
      providerID,
      locationID,
      serviceName,
      price,
      discountPrice,
      description,
      status,
    } = req.body;

    try {
      // Tạo Service mới
      const newService = new Service({
        serviceID,
        providerID,
        locationID,
        serviceName,
        price,
        discountPrice,
        description,
        status,
      });

      await newService.save();
      res
        .status(201)
        .json({ message: "Service created successfully", data: newService });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);
// READ ALL - Lấy danh sách Services (Admin hoặc Provider)
/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Lấy danh sách tất cả Services
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách Services
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
      const services = await Service.find();
      res.status(200).json(services);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ONE - Lấy thông tin chi tiết Service
/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Lấy thông tin một Service
 *     tags: [Services]
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
 *         description: Thông tin Service
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: "Service not found" });

    res.status(200).json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Xóa Service (Chỉ Admin hoặc Provider sở hữu)
/**
 * @swagger
 * /api/services/{id}:
 *   delete:
 *     summary: Xóa một Service
 *     tags: [Services]
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
 *         description: Service deleted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Chỉ Admin hoặc Provider sở hữu service được phép xóa
    if (req.user.role !== "Admin" && req.user.id !== service.providerID) {
      return res.status(403).json({ error: "Access denied" });
    }

    await service.remove();
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
