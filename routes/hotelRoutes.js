const express = require("express");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const hotelService = require("../services/hotelService");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Hotels
 *   description: API quản lý Hotels
 */

// CREATE - Tạo mới Hotel
/**
 * @swagger
 * /api/hotels:
 *   post:
 *     summary: Tạo mới một Hotel (Chỉ Provider)
 *     tags: [Hotels]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hotelID:
 *                 type: string
 *                 example: H001
 *               serviceID:
 *                 type: string
 *                 example: S001
 *               starRating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4.5
 *               roomCapacity:
 *                 type: number
 *                 minimum: 1
 *                 example: 100
 *               hotelTypeID:
 *                 type: string
 *                 example: 64f6b3c9e3a1a4321f2c1a8b
 *     responses:
 *       201:
 *         description: Hotel created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["Provider"]),
  [
    body("hotelID").notEmpty().withMessage("Hotel ID is required"),
    body("serviceID").notEmpty().withMessage("Service ID is required"),
    body("starRating")
      .isNumeric()
      .withMessage("Star Rating must be a number")
      .isFloat({ min: 1, max: 5 })
      .withMessage("Star Rating must be between 1 and 5"),
    body("roomCapacity")
      .isNumeric()
      .withMessage("Room Capacity must be a number")
      .isInt({ min: 1 })
      .withMessage("Room Capacity must be at least 1"),
    body("hotelTypeID")
      .notEmpty()
      .withMessage("Hotel Type ID is required")
      .isMongoId()
      .withMessage("Hotel Type ID must be a valid Mongo ID"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { hotelID, serviceID, starRating, roomCapacity, hotelTypeID } =
        req.body;

      const newHotel = await hotelService.createHotel(
        { hotelID, serviceID, starRating, roomCapacity, hotelTypeID },
        req.user
      );
      res
        .status(201)
        .json({ message: "Hotel created successfully", data: newHotel });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ALL - Lấy danh sách Hotels
/**
 * @swagger
 * /api/hotels:
 *   get:
 *     summary: Lấy danh sách tất cả Hotels
 *     tags: [Hotels]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách Hotels
 *       500:
 *         description: Server error
 */
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["Admin", "Provider", "Customer"]),
  async (req, res) => {
    try {
      const hotels = await hotelService.getAllHotels();
      res.status(200).json(hotels);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ONE - Lấy chi tiết Hotel
/**
 * @swagger
 * /api/hotels/{id}:
 *   get:
 *     summary: Lấy thông tin một Hotel
 *     tags: [Hotels]
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
 *         description: Thông tin Hotel
 *       404:
 *         description: Hotel not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const hotel = await hotelService.getHotelById(req.params.id);
    if (!hotel) return res.status(404).json({ error: "Hotel not found" });
    res.status(200).json(hotel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Xóa Hotel
/**
 * @swagger
 * /api/hotels/{id}:
 *   delete:
 *     summary: Xóa một Hotel
 *     tags: [Hotels]
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
 *         description: Hotel deleted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Hotel not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await hotelService.deleteHotelById(req.params.id, req.user);
    res.status(200).json({ message: "Hotel deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
