const express = require("express");
const { body, validationResult } = require("express-validator");
const Restaurant = require("../models/Restaurant");
const Service = require("../models/Service");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Restaurants
 *   description: API quản lý Restaurants
 */

// CREATE - Thêm mới Restaurant (Chỉ Provider)
/**
 * @swagger
 * /api/restaurants:
 *   post:
 *     summary: Tạo mới một Restaurant (Chỉ Provider)
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               restaurantID:
 *                 type: string
 *                 example: R001
 *               serviceID:
 *                 type: string
 *                 example: S001
 *               cuisineType:
 *                 type: string
 *                 example: Italian
 *               seatingCapacity:
 *                 type: number
 *                 example: 50
 *     responses:
 *       201:
 *         description: Restaurant created successfully
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
    body("restaurantID").notEmpty().withMessage("Restaurant ID is required"),
    body("serviceID").notEmpty().withMessage("Service ID is required"),
    body("cuisineType").notEmpty().withMessage("Cuisine Type is required"),
    body("seatingCapacity")
      .isNumeric()
      .withMessage("Seating Capacity must be a number"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { restaurantID, serviceID, cuisineType, seatingCapacity } = req.body;

    try {
      // Kiểm tra Service ID có tồn tại và thuộc về Provider hiện tại hay không
      const service = await Service.findOne({ _id: serviceID });
      if (!service) {
        return res.status(400).json({ error: "Service ID không tồn tại." });
      }

      if (req.user.role === "Provider" && req.user.id !== service.providerID) {
        return res.status(403).json({
          error: "Bạn không có quyền tạo Restaurant cho Service này.",
        });
      }

      // Tạo Restaurant mới
      const newRestaurant = new Restaurant({
        restaurantID,
        serviceID,
        cuisineType,
        seatingCapacity,
      });

      await newRestaurant.save();
      res.status(201).json({
        message: "Restaurant created successfully",
        data: newRestaurant,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ALL - Lấy danh sách Restaurants
/**
 * @swagger
 * /api/restaurants:
 *   get:
 *     summary: Lấy danh sách tất cả Restaurants
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách Restaurants
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
      const restaurants = await Restaurant.find().populate(
        "serviceID",
        "serviceName providerID"
      );
      res.status(200).json(restaurants);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ONE - Lấy thông tin chi tiết Restaurant
/**
 * @swagger
 * /api/restaurants/{id}:
 *   get:
 *     summary: Lấy thông tin một Restaurant
 *     tags: [Restaurants]
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
 *         description: Thông tin Restaurant
 *       404:
 *         description: Restaurant not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate(
      "serviceID",
      "serviceName providerID"
    );
    if (!restaurant)
      return res.status(404).json({ error: "Restaurant not found" });

    res.status(200).json(restaurant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Xóa Restaurant (Chỉ Admin hoặc Provider sở hữu Service)
/**
 * @swagger
 * /api/restaurants/{id}:
 *   delete:
 *     summary: Xóa một Restaurant
 *     tags: [Restaurants]
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
 *         description: Restaurant deleted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Restaurant not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate(
      "serviceID"
    );

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    // Chỉ Admin hoặc Provider sở hữu Service được phép xóa
    if (
      req.user.role !== "Admin" &&
      req.user.id !== restaurant.serviceID.providerID
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    await restaurant.remove();
    res.status(200).json({ message: "Restaurant deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
