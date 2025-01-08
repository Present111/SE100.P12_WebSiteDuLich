const express = require("express");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const roomService = require("../services/roomService");
const router = express.Router();

const Room = require("../models/Room");
const Hotel = require("../models/Hotel");
const Service = require("../models/Service");
const Provider = require("../models/Provider");
const mongoose = require("mongoose");

/**
 * @swagger
 * tags:
 *   name: Rooms
 *   description: API quản lý Rooms
 */

/**
 * @swagger
 * /api/rooms/by-user:
 *   get:
 *     summary: Tìm danh sách roomID dựa trên userID
 *     tags: [Rooms]
 *     parameters:
 *       - name: userID
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng
 *     responses:
 *       200:
 *         description: Danh sách các roomID
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.get("/by-user", async (req, res) => {
  try {
    const { userID } = req.query;

    // Kiểm tra userID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({ error: "Invalid userID format" });
    }

    // Chuyển userID sang ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userID);

    // Tìm provider theo userID
    const providers = await Provider.find({ userID: userObjectId }).select(
      "_id"
    );

    if (!providers.length) {
      return res.status(404).json({ error: "Không tìm thấy provider nào" });
    }

    const providerIDs = providers.map((p) => p._id);

    // Tìm service theo providerID
    const services = await Service.find({
      providerID: { $in: providerIDs },
    }).select("_id");

    if (!services.length) {
      return res.status(404).json({ error: "Không tìm thấy service nào" });
    }

    const serviceIDs = services.map((s) => s._id);

    // Tìm hotel theo serviceID
    const hotels = await Hotel.find({ serviceID: { $in: serviceIDs } }).select(
      "_id"
    );

    if (!hotels.length) {
      return res.status(404).json({ error: "Không tìm thấy hotel nào" });
    }

    const hotelIDs = hotels.map((h) => h._id);

    // Tìm room theo hotelID và trả về mảng roomID dưới dạng ObjectId
    const rooms = await Room.find({ hotelID: { $in: hotelIDs } }).select("_id");

    const roomIDs = rooms.map((r) => r._id);

    // Trả về kết quả
    res.status(200).json({ data: roomIDs });
  } catch (err) {
    console.error("Lỗi khi tìm room:", err);
    res.status(500).json({ error: err.message });
  }
});

// Route động phải đặt cuối cùng
router.get("/:id", async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }
  res.json(room);
});

/**
 * @swagger
 * /api/rooms:
 *   post:
 *     summary: Tạo một phòng mới
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
 *               hotelID:
 *                 type: string
 *                 description: ID của khách sạn
 *             required:
 *               - hotelID
 *     responses:
 *       201:
 *         description: Tạo phòng thành công
 *       400:
 *         description: Lỗi đầu vào
 *       500:
 *         description: Lỗi server
 */
router.post("/", async (req, res) => {
  try {
    const { hotelID } = req.body;

    if (!hotelID) {
      return res.status(400).json({ error: "hotelID là bắt buộc." });
    }

    // Giá trị mặc định
    const defaultRoomData = {
      roomID: `room_${Date.now()}`, // Tạo ID duy nhất
      hotelID,
      roomType: "Standard",
      price: 100,
      discountPrice: 80,
      pictures: [],
      active: false,
      capacity: {
        adults: 0,
        children: 0,
        roomNumber: 0,
      },
      facilities: [],
      roomsAvailable: [],
    };

    // Tạo phòng mới
    const newRoom = await Room.create(defaultRoomData);

    res.status(201).json(newRoom);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

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

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    console.log(req.body);
    // Cập nhật thông tin Room trực tiếp từ req.body
    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }, // Ghi đè toàn bộ các trường truyền vào
      { new: true, runValidators: true } // Tùy chọn để trả về dữ liệu đã cập nhật và kiểm tra tính hợp lệ
    );

    if (!updatedRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    res
      .status(200)
      .json({ message: "Room updated successfully", data: updatedRoom });
  } catch (err) {
    console.error(err);
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
