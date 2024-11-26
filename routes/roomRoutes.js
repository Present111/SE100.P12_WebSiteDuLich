const express = require("express");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploadMiddleware");
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               roomID:
 *                 type: string
 *                 example: R001
 *               hotelID:
 *                 type: string
 *                 example: H001
 *               roomType:
 *                 type: string
 *                 example: Deluxe
 *               availableRooms:
 *                 type: number
 *                 example: 5
 *               availableDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-01
 *               price:
 *                 type: number
 *                 example: 1000
 *               discountPrice:
 *                 type: number
 *                 example: 800
 *               active:
 *                 type: boolean
 *                 example: true
 *               pictures:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               capacity:
 *                 type: object
 *                 properties:
 *                   adults:
 *                     type: number
 *                     example: 2
 *                   children:
 *                     type: number
 *                     example: 1
 *               facilities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["64f6b3c9e3a1a4321f2c1a8b", "64f7c3c9e3a1a4321f2c1a8c"]
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
  roleMiddleware(["Provider"]),
  upload.array("pictures", 5), // Cho phép upload tối đa 5 ảnh
  [
    body("roomID").notEmpty().withMessage("Room ID is required"),
    body("hotelID").notEmpty().withMessage("Hotel ID is required"),
    body("roomType").notEmpty().withMessage("Room Type is required"),
    body("availableRooms")
      .isInt({ min: 1 })
      .withMessage("Available Rooms must be at least 1"),
    body("availableDate").isISO8601().withMessage("Invalid date format"),
    body("price").isFloat({ min: 0 }).withMessage("Price must be at least 0"),
    body("discountPrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Discount Price must be at least 0"),
    body("discountPrice").custom((value, { req }) => {
      if (value && value >= req.body.price) {
        throw new Error("Discount Price must be less than Price");
      }
      return true;
    }),
    body("active")
      .optional()
      .isBoolean()
      .withMessage("Active must be a boolean"),
    body("capacity.adults")
      .isInt({ min: 1 })
      .withMessage("Capacity (adults) must be at least 1"),
    body("capacity.children")
      .isInt({ min: 0 })
      .withMessage("Capacity (children) must be at least 0"),
    body("facilities")
      .optional()
      .isArray()
      .withMessage("Facilities must be an array of IDs"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        roomID,
        hotelID,
        roomType,
        availableRooms,
        availableDate,
        price,
        discountPrice,
        active,
        capacity,
        facilities,
      } = req.body;

      // Lưu đường dẫn của tất cả các ảnh đã tải lên
      const pictures = req.files.map((file) => `/uploads/${file.filename}`);

      // Gọi dịch vụ để tạo Room mới
      const newRoom = await roomService.createRoom({
        roomID,
        hotelID,
        roomType,
        availableRooms,
        availableDate,
        price,
        discountPrice,
        active,
        capacity,
        facilities,
        pictures, // Gửi danh sách đường dẫn ảnh
      });

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

// READ ONE - Lấy chi tiết Room theo ID
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

// UPDATE - Cập nhật thông tin Room
/**
 * @swagger
 * /api/rooms/{id}:
 *   put:
 *     summary: Cập nhật thông tin một Room
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roomType:
 *                 type: string
 *                 example: Standard
 *               availableRooms:
 *                 type: number
 *                 example: 10
 *               availableDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-15
 *               active:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Room updated successfully
 *       404:
 *         description: Room not found
 *       500:
 *         description: Server error
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updatedRoom = await roomService.updateRoomById(
      req.params.id,
      req.body
    );
    res
      .status(200)
      .json({ message: "Room updated successfully", data: updatedRoom });
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
 *       404:
 *         description: Room not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await roomService.deleteRoomById(req.params.id);
    res.status(200).json({ message: "Room deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
