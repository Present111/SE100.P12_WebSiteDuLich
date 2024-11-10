const express = require("express");
const { body, validationResult } = require("express-validator");
const Room = require("../models/Room");
const Hotel = require("../models/Hotel");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Rooms
 *   description: API quản lý Rooms
 */

// CREATE - Thêm mới Room (Chỉ Provider)
/**
 * @swagger
 * /api/rooms:
 *   post:
 *     summary: Tạo mới một Room (Chỉ Provider)
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roomID:
 *                 type: string
 *                 example: RM001
 *               hotelID:
 *                 type: string
 *                 example: H001
 *               roomType:
 *                 type: string
 *                 example: Deluxe
 *               availableRooms:
 *                 type: number
 *                 example: 10
 *               availableDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-01
 *     responses:
 *       201:
 *         description: Room created successfully
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
    body("roomID").notEmpty().withMessage("Room ID is required"),
    body("hotelID").notEmpty().withMessage("Hotel ID is required"),
    body("roomType").notEmpty().withMessage("Room Type is required"),
    body("availableRooms")
      .isNumeric()
      .withMessage("Available Rooms must be a number"),
    body("availableDate").isISO8601().withMessage("Invalid date format"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { roomID, hotelID, roomType, availableRooms, availableDate } =
      req.body;

    try {
      // Kiểm tra Hotel ID có tồn tại và thuộc về Provider hiện tại hay không
      const hotel = await Hotel.findOne({ _id: hotelID });
      if (!hotel) {
        return res.status(400).json({ error: "Hotel ID không tồn tại." });
      }

      if (
        req.user.role === "Provider" &&
        req.user.id !== hotel.serviceID.providerID
      ) {
        return res
          .status(403)
          .json({ error: "Bạn không có quyền tạo Room cho Hotel này." });
      }

      // Tạo Room mới
      const newRoom = new Room({
        roomID,
        hotelID,
        roomType,
        availableRooms,
        availableDate,
      });

      await newRoom.save();
      res
        .status(201)
        .json({ message: "Room created successfully", data: newRoom });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ALL - Lấy danh sách Rooms (Admin hoặc Provider)
/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: Lấy danh sách tất cả Rooms
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách Rooms
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
      const rooms = await Room.find().populate(
        "hotelID",
        "hotelName serviceID"
      );
      res.status(200).json(rooms);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ONE - Lấy thông tin chi tiết Room
/**
 * @swagger
 * /api/rooms/{id}:
 *   get:
 *     summary: Lấy thông tin một Room
 *     tags: [Rooms]
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
 *         description: Thông tin Room
 *       404:
 *         description: Room not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate(
      "hotelID",
      "hotelName serviceID"
    );
    if (!room) return res.status(404).json({ error: "Room not found" });

    res.status(200).json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Xóa Room (Chỉ Admin hoặc Provider sở hữu Hotel)
/**
 * @swagger
 * /api/rooms/{id}:
 *   delete:
 *     summary: Xóa một Room
 *     tags: [Rooms]
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
 *         description: Room deleted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Room not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate("hotelID");

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Chỉ Admin hoặc Provider sở hữu Hotel được phép xóa
    if (
      req.user.role !== "Admin" &&
      req.user.id !== room.hotelID.serviceID.providerID
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    await room.remove();
    res.status(200).json({ message: "Room deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
