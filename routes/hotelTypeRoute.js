const express = require("express");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const hotelTypeService = require("../services/hotelTypeService");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: HotelType
 *   description: API quản lý các loại khách sạn
 */

// CREATE - Tạo mới một loại khách sạn
/**
 * @swagger
 * /api/hotel-types:
 *   post:
 *     summary: Tạo mới một loại khách sạn (Chỉ Provider)
 *     tags: [HotelType]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 example: "Biệt thự"
 *     responses:
 *       201:
 *         description: Loại khách sạn được tạo thành công
 *       400:
 *         description: Validation error
 *       500:
 *         description: Lỗi máy chủ
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["Provider"]),
  [
    body("type")
      .notEmpty()
      .withMessage("Type is required")
      .isString()
      .withMessage("Type must be a string"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { type } = req.body;

      const newHotelType = await hotelTypeService.createHotelType(type);
      res
        .status(201)
        .json({
          message: "HotelType created successfully",
          data: newHotelType,
        });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ALL - Lấy danh sách tất cả các loại khách sạn
/**
 * @swagger
 * /api/hotel-types:
 *   get:
 *     summary: Lấy danh sách tất cả loại khách sạn
 *     tags: [HotelType]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách các loại khách sạn
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/", async (req, res) => {
  try {
    const hotelTypes = await hotelTypeService.getAllHotelTypes();
    res.status(200).json(hotelTypes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE - Lấy thông tin một loại khách sạn
/**
 * @swagger
 * /api/hotel-types/{id}:
 *   get:
 *     summary: Lấy thông tin một loại khách sạn
 *     tags: [HotelType]
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
 *         description: Thông tin loại khách sạn
 *       404:
 *         description: Không tìm thấy loại khách sạn
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/:id", async (req, res) => {
  try {
    const hotelType = await hotelTypeService.getHotelTypeById(req.params.id);
    if (!hotelType)
      return res.status(404).json({ error: "HotelType not found" });
    res.status(200).json(hotelType);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Xóa loại khách sạn
/**
 * @swagger
 * /api/hotel-types/{id}:
 *   delete:
 *     summary: Xóa một loại khách sạn
 *     tags: [HotelType]
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
 *         description: Loại khách sạn bị xóa thành công
 *       404:
 *         description: Không tìm thấy loại khách sạn
 *       500:
 *         description: Lỗi máy chủ
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await hotelTypeService.deleteHotelTypeById(req.params.id);
    res.status(200).json({ message: "HotelType deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
