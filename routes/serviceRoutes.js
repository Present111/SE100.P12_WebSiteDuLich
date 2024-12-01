const express = require("express");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const serviceService = require("../services/serviceService");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: API quản lý Services
 */

// CREATE - Tạo mới Service
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
 *         multipart/form-data:
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
 *               facilities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["64f6b3c9e3a1a4321f2c1a8b"]
 *               priceCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["64f6b3c9e3a1a4321f2c1a8b"]
 *               suitability:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["64f6b3c9e3a1a4321f2c1a8b"]
 *               reviews:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["64f6b3c9e3a1a4321f2c1a8b"]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 example: ["image1.jpg", "image2.jpg"]
 *     responses:
 *       201:
 *         description: Service created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["Provider"]),
  upload.array("images", 10), // Cho phép upload tối đa 10 ảnh
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
    body("facilities")
      .optional()
      .isArray()
      .withMessage("Facilities must be an array of IDs"),
    body("priceCategories")
      .optional()
      .isArray()
      .withMessage("Price categories must be an array of IDs"),
    body("suitability")
      .optional()
      .isArray()
      .withMessage("Suitability must be an array of IDs"),
    body("reviews")
      .optional()
      .isArray()
      .withMessage("Reviews must be an array of IDs"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        serviceID,
        providerID,
        locationID,
        serviceName,
        price,
        discountPrice,
        description,
        status,
        facilities,
        priceCategories,
        suitability,
        reviews,
      } = req.body;

      // Lấy danh sách đường dẫn ảnh từ file upload
      const images = req.files.map((file) => `/uploads/${file.filename}`);

      // Tạo Service mới
      const newService = await serviceService.createService({
        serviceID,
        providerID,
        locationID,
        serviceName,
        price,
        discountPrice,
        description,
        status,
        facilities,
        priceCategories,
        suitability,
        reviews,
        images, // Lưu mảng ảnh
      });

      res
        .status(201)
        .json({ message: "Service created successfully", data: newService });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ALL - Lấy danh sách Services
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
 *       500:
 *         description: Server error
 */
router.get(
  "/",
  // authMiddleware,
  // roleMiddleware(["Admin", "Provider"]),
  async (req, res) => {
    try {
      const services = await serviceService.getAllServices();
      res.status(200).json(services);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ONE - Lấy chi tiết Service
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
    const service = await serviceService.getServiceById(req.params.id);
    if (!service) return res.status(404).json({ error: "Service not found" });
    res.status(200).json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Xóa Service
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
    await serviceService.deleteServiceById(req.params.id, req.user);
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
