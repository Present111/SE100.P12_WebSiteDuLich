const express = require("express");
const { body, validationResult } = require("express-validator");
const Customer = require("../models/Customer");
const User = require("../models/User");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: API quản lý Customers (Chỉ Admin)
 */

// CREATE - Thêm mới Customer
/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Tạo mới một Customer (Chỉ Admin)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerID:
 *                 type: string
 *                 example: C001
 *               userID:
 *                 type: string
 *                 example: U001
 *               loyaltyPoints:
 *                 type: number
 *                 example: 100
 *     responses:
 *       201:
 *         description: Customer created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["Admin"]),
  [
    body("customerID").notEmpty().withMessage("Customer ID is required"),
    body("userID").notEmpty().withMessage("User ID is required"),
    body("loyaltyPoints")
      .isNumeric()
      .withMessage("Loyalty Points must be a number"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { customerID, userID, loyaltyPoints } = req.body;

    try {
      // Kiểm tra UserID đã tồn tại chưa
      const user = await User.findOne({ userID, role: "Customer" });
      if (!user) {
        return res
          .status(400)
          .json({ error: "UserID không tồn tại hoặc không phải Customer." });
      }

      // Kiểm tra Customer ID đã tồn tại chưa
      const existingCustomer = await Customer.findOne({ customerID });
      if (existingCustomer) {
        return res
          .status(400)
          .json({ error: "Customer với ID này đã tồn tại." });
      }

      // Tạo Customer mới
      const newCustomer = new Customer({ customerID, userID, loyaltyPoints });
      await newCustomer.save();

      res
        .status(201)
        .json({ message: "Customer created successfully", data: newCustomer });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ALL - Lấy danh sách Customers
/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Lấy danh sách tất cả Customers (Chỉ Admin)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách Customers
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
router.get("/", authMiddleware, roleMiddleware(["Admin"]), async (req, res) => {
  try {
    const customers = await Customer.find().populate(
      "userID",
      "fullName email"
    );
    res.status(200).json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE - Lấy thông tin chi tiết Customer
/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Lấy thông tin một Customer (Chỉ Admin)
 *     tags: [Customers]
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
 *         description: Thông tin Customer
 *       403:
 *         description: Access denied
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Server error
 */
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      const customer = await Customer.findById(req.params.id).populate(
        "userID",
        "fullName email"
      );
      if (!customer)
        return res.status(404).json({ error: "Customer not found" });

      res.status(200).json(customer);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// UPDATE - Cập nhật Customer
/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Cập nhật thông tin một Customer (Chỉ Admin)
 *     tags: [Customers]
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
 *               loyaltyPoints:
 *                 type: number
 *                 example: 200
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Server error
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      const updatedCustomer = await Customer.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updatedCustomer)
        return res.status(404).json({ error: "Customer not found" });

      res
        .status(200)
        .json({
          message: "Customer updated successfully",
          data: updatedCustomer,
        });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// DELETE - Xóa Customer
/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Xóa một Customer (Chỉ Admin)
 *     tags: [Customers]
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
 *         description: Customer deleted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
      if (!deletedCustomer)
        return res.status(404).json({ error: "Customer not found" });

      res.status(200).json({ message: "Customer deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
