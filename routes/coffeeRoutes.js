const express = require("express");
const { body, validationResult } = require("express-validator");
const Coffee = require("../models/Coffee");
const Service = require("../models/Service");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const mongoose = require("mongoose");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Coffees
 *   description: API quản lý Coffees
 */

/**
 * @swagger
 * /api/coffees:
 *   post:
 *     summary: Tạo mới một Coffee (Chỉ Provider)
 *     tags:
 *       - Coffees
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               coffeeID:
 *                 type: string
 *                 description: Mã định danh của Coffee
 *                 example: C001
 *               serviceID:
 *                 type: string
 *                 description: ID của Service mà Coffee thuộc về
 *                 example: 64f6b3c9e3a1a4321f2c1a8b
 *               coffeeType:
 *                 type: string
 *                 description: Loại Coffee
 *                 example: Espresso
 *               averagePrice:
 *                 type: number
 *                 description: Giá trung bình của Coffee
 *                 example: 50
 *               picture:
 *                 type: string
 *                 format: binary
 *                 description: Hình ảnh mô tả Coffee
 *     responses:
 *       201:
 *         description: Coffee created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Coffee created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     coffeeID:
 *                       type: string
 *                       example: C001
 *                     serviceID:
 *                       type: string
 *                       example: 64f6b3c9e3a1a4321f2c1a8b
 *                     coffeeType:
 *                       type: string
 *                       example: Espresso
 *                     averagePrice:
 *                       type: number
 *                       example: 50
 *                     picture:
 *                       type: string
 *                       example: /uploads/coffee.jpg
 *       403:
 *         description: Access denied
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Bạn không có quyền tạo Coffee cho Service này.
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: Coffee ID is required
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["Provider"]),
  upload.single("picture"),
  async (req, res) => {
    try {
      const { coffeeID, serviceID, coffeeType, averagePrice } = req.body;

      // Tìm Service từ Database
      const service = await Service.findById(serviceID).populate("providerID");
      if (!service) {
        return res.status(400).json({ error: "Service ID không tồn tại." });
      }

      // Kiểm tra quyền Provider
      if (
        req.user.role === "Provider" &&
        req.user.id !== service.providerID.userID.toString()
      ) {
        return res
          .status(403)
          .json({ error: "Bạn không có quyền tạo Coffee cho Service này." });
      }

      // Xử lý hình ảnh nếu có
      const picturePath = req.file ? `/uploads/${req.file.filename}` : null;

      // Tạo Coffee mới
      const newCoffee = new Coffee({
        coffeeID,
        serviceID,
        coffeeType,
        averagePrice,
        picture: picturePath,
      });

      await newCoffee.save();
      res
        .status(201)
        .json({ message: "Coffee created successfully", data: newCoffee });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ALL - Lấy danh sách Coffees
/**
 * @swagger
 * /api/coffees:
 *   get:
 *     summary: Lấy danh sách tất cả Coffees
 *     tags: [Coffees]
 *     responses:
 *       200:
 *         description: Danh sách Coffees
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res) => {
  try {
    const coffees = await Coffee.find().populate(
      "serviceID",
      "serviceName providerID"
    );
    res.status(200).json(coffees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE - Lấy thông tin chi tiết Coffee
/**
 * @swagger
 * /api/coffees/{id}:
 *   get:
 *     summary: Lấy thông tin một Coffee
 *     tags: [Coffees]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: 64f6b3c9e3a1a4321f2c1a8b
 *     responses:
 *       200:
 *         description: Thông tin Coffee
 *       404:
 *         description: Coffee not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {
  try {
    const coffee = await Coffee.findById(req.params.id).populate(
      "serviceID",
      "serviceName providerID"
    );
    if (!coffee) return res.status(404).json({ error: "Coffee not found" });

    res.status(200).json(coffee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE - Cập nhật Coffee
/**
 * @swagger
 * /api/coffees/{id}:
 *   put:
 *     summary: Cập nhật thông tin một Coffee
 *     tags: [Coffees]
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
 *               coffeeType:
 *                 type: string
 *                 example: Cappuccino
 *               averagePrice:
 *                 type: number
 *                 example: 60
 *     responses:
 *       200:
 *         description: Coffee updated successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Coffee not found
 *       500:
 *         description: Server error
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const coffee = await Coffee.findById(req.params.id).populate("serviceID");

    if (!coffee) {
      return res.status(404).json({ error: "Coffee not found" });
    }

    if (
      req.user.role !== "Admin" &&
      req.user.id !== coffee.serviceID.providerID
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updatedCoffee = await Coffee.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    res
      .status(200)
      .json({ message: "Coffee updated successfully", data: updatedCoffee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Xóa Coffee
/**
 * @swagger
 * /api/coffees/{id}:
 *   delete:
 *     summary: Xóa một Coffee
 *     tags: [Coffees]
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
 *         description: Coffee deleted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Coffee not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const coffee = await Coffee.findById(req.params.id).populate("serviceID");

    if (!coffee) {
      return res.status(404).json({ error: "Coffee not found" });
    }

    if (
      req.user.role !== "Admin" &&
      req.user.id !== coffee.serviceID.providerID
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    await coffee.remove();
    res.status(200).json({ message: "Coffee deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
