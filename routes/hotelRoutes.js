const express = require("express");
const { body, validationResult } = require("express-validator");
const Hotel = require("../models/Hotel");
const Service = require("../models/Service");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Hotels
 *   description: API quản lý Hotels
 */

// CREATE - Thêm mới Hotel (Chỉ Provider)
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
 *                 example: 5
 *               roomCapacity:
 *                 type: number
 *                 example: 100
 *     responses:
 *       201:
 *         description: Hotel created successfully
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
    body("hotelID").notEmpty().withMessage("Hotel ID is required"),
    body("serviceID").notEmpty().withMessage("Service ID is required"),
    body("starRating").isNumeric().withMessage("Star Rating must be a number"),
    body("roomCapacity")
      .isNumeric()
      .withMessage("Room Capacity must be a number"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { hotelID, serviceID, starRating, roomCapacity } = req.body;

    try {
      // Kiểm tra Service ID có tồn tại và thuộc về Provider hiện tại hay không
      const service = await Service.findOne({ _id: serviceID });
      if (!service) {
        return res.status(400).json({ error: "Service ID không tồn tại." });
      }

      if (req.user.role === "Provider" && req.user.id !== service.providerID) {
        return res
          .status(403)
          .json({ error: "Bạn không có quyền tạo Hotel cho Service này." });
      }

      // Tạo Hotel mới
      const newHotel = new Hotel({
        hotelID,
        serviceID,
        starRating,
        roomCapacity,
      });

      await newHotel.save();
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
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["Admin", "Provider", "Customer"]),
  async (req, res) => {
    try {
      const hotels = await Hotel.find().populate(
        "serviceID",
        "serviceName providerID"
      );
      res.status(200).json(hotels);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ONE - Lấy thông tin chi tiết Hotel
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
    const hotel = await Hotel.findById(req.params.id).populate(
      "serviceID",
      "serviceName providerID"
    );
    if (!hotel) return res.status(404).json({ error: "Hotel not found" });

    res.status(200).json(hotel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Xóa Hotel (Chỉ Admin hoặc Provider sở hữu Service)
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
    const hotel = await Hotel.findById(req.params.id).populate("serviceID");

    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    // Chỉ Admin hoặc Provider sở hữu Service được phép xóa
    if (
      req.user.role !== "Admin" &&
      req.user.id !== hotel.serviceID.providerID
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    await hotel.remove();
    res.status(200).json({ message: "Hotel deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
