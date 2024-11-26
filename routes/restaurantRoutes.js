const express = require("express");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const restaurantService = require("../services/restaurantService");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Restaurants
 *   description: API quản lý Restaurants
 */

// CREATE - Tạo mới Restaurant
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
 *                 example: 64f6b3c9e3a1a4321f2c1a8b
 *               cuisineTypeIDs:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["64f8b3c9e3a1a4321f2c1a8c", "64f8c4d9e3a1a4321f2c1a8d"]
 *               dishes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["64f9d5a9e3a1a4321f2c1a8e", "64f9e6b9e3a1a4321f2c1a8f"]
 *               seatingCapacity:
 *                 type: number
 *                 example: 100
 *               restaurantTypeID:
 *                 type: string
 *                 example: 64fae7c9e3a1a4321f2c1a90
 *     responses:
 *       201:
 *         description: Restaurant created successfully
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
    body("restaurantID").notEmpty().withMessage("Restaurant ID is required"),
    body("serviceID").isMongoId().withMessage("Service ID must be a valid ID"),
    body("cuisineTypeIDs")
      .isArray()
      .withMessage("Cuisine Type IDs must be an array")
      .notEmpty()
      .withMessage("Cuisine Type IDs cannot be empty"),
    body("dishes").optional().isArray().withMessage("Dishes must be an array"),
    body("seatingCapacity")
      .isInt({ min: 1 })
      .withMessage("Seating Capacity must be at least 1"),
    body("restaurantTypeID")
      .isMongoId()
      .withMessage("Restaurant Type ID must be a valid ID"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newRestaurant = await restaurantService.createRestaurant(
        req.body,
        req.user
      );
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
 *       500:
 *         description: Server error
 */
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["Admin", "Provider", "Customer"]),
  async (req, res) => {
    try {
      const restaurants = await restaurantService.getAllRestaurants();
      res.status(200).json(restaurants);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ONE - Lấy chi tiết Restaurant
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
    const restaurant = await restaurantService.getRestaurantById(req.params.id);
    if (!restaurant)
      return res.status(404).json({ error: "Restaurant not found" });
    res.status(200).json(restaurant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Xóa Restaurant
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
    await restaurantService.deleteRestaurantById(req.params.id, req.user);
    res.status(200).json({ message: "Restaurant deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
