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

    try {
      const newRestaurant = await restaurantService.createRestaurant(
        req.body,
        req.user
      );
      res
        .status(201)
        .json({
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
