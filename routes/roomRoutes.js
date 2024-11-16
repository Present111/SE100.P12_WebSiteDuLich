const express = require("express");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const roomService = require("../services/roomService");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Rooms
 *   description: API quản lý Rooms
 */

// CREATE - Tạo mới Room
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

    try {
      const newRoom = await roomService.createRoom(req.body, req.user);
      res
        .status(201)
        .json({ message: "Room created successfully", data: newRoom });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ALL - Lấy danh sách Rooms
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
 *       500:
 *         description: Server error
 */
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["Admin", "Provider"]),
  async (req, res) => {
    try {
      const rooms = await roomService.getAllRooms();
      res.status(200).json(rooms);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ONE - Lấy chi tiết Room
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
    const room = await roomService.getRoomById(req.params.id);
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.status(200).json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Xóa Room
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
    await roomService.deleteRoomById(req.params.id, req.user);
    res.status(200).json({ message: "Room deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
