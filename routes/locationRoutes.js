const express = require("express");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const locationService = require("../services/locationService");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Locations
 *   description: API quản lý Locations
 */

// CREATE - Tạo mới Location
/**
 * @swagger
 * /api/locations:
 *   post:
 *     summary: Tạo mới một Location (Chỉ Admin và Provider)
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               locationID:
 *                 type: string
 *                 example: L001
 *               locationName:
 *                 type: string
 *                 example: Ha Noi
 *               description:
 *                 type: string
 *                 example: Capital city of Vietnam
 *               latitude:
 *                 type: number
 *                 example: 21.028511
 *               longitude:
 *                 type: number
 *                 example: 105.804817
 *     responses:
 *       201:
 *         description: Location created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["Admin", "Provider"]),
  [
    body("locationID").notEmpty().withMessage("Location ID is required"),
    body("locationName").notEmpty().withMessage("Location Name is required"),
    body("latitude").isNumeric().withMessage("Latitude must be a number"),
    body("longitude").isNumeric().withMessage("Longitude must be a number"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newLocation = await locationService.createLocation(req.body);
      res
        .status(201)
        .json({ message: "Location created successfully", data: newLocation });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ALL - Lấy danh sách Locations
/**
 * @swagger
 * /api/locations:
 *   get:
 *     summary: Lấy danh sách tất cả Locations
 *     tags: [Locations]
 *     responses:
 *       200:
 *         description: Danh sách Locations
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res) => {
  try {
    const locations = await locationService.getAllLocations();
    res.status(200).json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE - Lấy chi tiết Location
/**
 * @swagger
 * /api/locations/{id}:
 *   get:
 *     summary: Lấy thông tin một Location
 *     tags: [Locations]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: 64f6b3c9e3a1a4321f2c1a8b
 *     responses:
 *       200:
 *         description: Thông tin Location
 *       404:
 *         description: Location not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {
  try {
    const location = await locationService.getLocationById(req.params.id);
    if (!location) return res.status(404).json({ error: "Location not found" });
    res.status(200).json(location);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE - Cập nhật Location
/**
 * @swagger
 * /api/locations/{id}:
 *   put:
 *     summary: Cập nhật thông tin một Location (Chỉ Admin)
 *     tags: [Locations]
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
 *               locationName:
 *                 type: string
 *                 example: Ho Chi Minh City
 *               description:
 *                 type: string
 *                 example: Southern city of Vietnam
 *               latitude:
 *                 type: number
 *                 example: 10.8231
 *               longitude:
 *                 type: number
 *                 example: 106.6297
 *     responses:
 *       200:
 *         description: Location updated successfully
 *       404:
 *         description: Location not found
 *       500:
 *         description: Server error
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      const updatedLocation = await locationService.updateLocationById(
        req.params.id,
        req.body
      );
      if (!updatedLocation)
        return res.status(404).json({ error: "Location not found" });
      res
        .status(200)
        .json({
          message: "Location updated successfully",
          data: updatedLocation,
        });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// DELETE - Xóa Location
/**
 * @swagger
 * /api/locations/{id}:
 *   delete:
 *     summary: Xóa một Location (Chỉ Admin)
 *     tags: [Locations]
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
 *         description: Location deleted successfully
 *       404:
 *         description: Location not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      await locationService.deleteLocationById(req.params.id);
      res.status(200).json({ message: "Location deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
