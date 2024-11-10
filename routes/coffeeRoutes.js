const express = require("express");
const { body, validationResult } = require("express-validator");
const Coffee = require("../models/Coffee");
const Service = require("../models/Service");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Coffees
 *   description: API quản lý Coffees
 */

// CREATE - Thêm mới Coffee (Chỉ Provider)
/**
 * @swagger
 * /api/coffees:
 *   post:
 *     summary: Tạo mới một Coffee (Chỉ Provider)
 *     tags: [Coffees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coffeeID:
 *                 type: string
 *                 example: C001
 *               serviceID:
 *                 type: string
 *                 example: S001
 *               coffeeType:
 *                 type: string
 *                 example: Espresso
 *               averagePrice:
 *                 type: number
 *                 example: 50
 *     responses:
 *       201:
 *         description: Coffee created successfully
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
    body("coffeeID").notEmpty().withMessage("Coffee ID is required"),
    body("serviceID").notEmpty().withMessage("Service ID is required"),
    body("coffeeType").notEmpty().withMessage("Coffee Type is required"),
    body("averagePrice")
      .isNumeric()
      .withMessage("Average Price must be a number"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { coffeeID, serviceID, coffeeType, averagePrice } = req.body;

    try {
      // Kiểm tra Service ID có tồn tại và thuộc về Provider hiện tại hay không
      const service = await Service.findOne({ _id: serviceID });
      if (!service) {
        return res.status(400).json({ error: "Service ID không tồn tại." });
      }

      if (req.user.role === "Provider" && req.user.id !== service.providerID) {
        return res
          .status(403)
          .json({ error: "Bạn không có quyền tạo Coffee cho Service này." });
      }

      // Tạo Coffee mới
      const newCoffee = new Coffee({
        coffeeID,
        serviceID,
        coffeeType,
        averagePrice,
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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách Coffees
 *       500:
 *         description: Server error
 */
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["Admin", "Provider", "Customer"]),
  async (req, res) => {
    try {
      const coffees = await Coffee.find().populate(
        "serviceID",
        "serviceName providerID"
      );
      res.status(200).json(coffees);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ONE - Lấy thông tin chi tiết Coffee
/**
 * @swagger
 * /api/coffees/{id}:
 *   get:
 *     summary: Lấy thông tin một Coffee
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
 *         description: Thông tin Coffee
 *       404:
 *         description: Coffee not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authMiddleware, async (req, res) => {
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

// DELETE - Xóa Coffee (Chỉ Admin hoặc Provider sở hữu Service)
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

    // Chỉ Admin hoặc Provider sở hữu Service được phép xóa
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
