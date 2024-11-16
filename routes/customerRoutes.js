const express = require("express");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const customerService = require("../services/customerService");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: API quản lý Customers (Chỉ Admin)
 */

// CREATE - Tạo mới Customer
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

    try {
      const newCustomer = await customerService.createCustomer(req.body);
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
 *       500:
 *         description: Server error
 */
router.get("/", authMiddleware, roleMiddleware(["Admin"]), async (req, res) => {
  try {
    const customers = await customerService.getAllCustomers();
    res.status(200).json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE - Lấy chi tiết Customer
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
      const customer = await customerService.getCustomerById(req.params.id);
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
      const updatedCustomer = await customerService.updateCustomerById(
        req.params.id,
        req.body
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
 *     responses:
 *       200:
 *         description: Customer deleted successfully
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
      await customerService.deleteCustomerById(req.params.id);
      res.status(200).json({ message: "Customer deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
