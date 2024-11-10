const express = require("express");
const { body, validationResult } = require("express-validator");
const Invoice = require("../models/Invoice");
const User = require("../models/User");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: API quản lý hóa đơn
 */

// CREATE - Thêm mới Invoice
/**
 * @swagger
 * /api/invoices:
 *   post:
 *     summary: Tạo mới một hóa đơn
 *     tags: [Invoices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               invoiceID:
 *                 type: string
 *                 example: INV001
 *               userID:
 *                 type: string
 *                 example: U001
 *               totalAmount:
 *                 type: number
 *                 example: 500.75
 *               invoiceDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-01
 *               paymentStatus:
 *                 type: string
 *                 enum: [Pending, Paid, Cancelled]
 *                 example: Paid
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  [
    body("invoiceID").notEmpty().withMessage("Invoice ID is required"),
    body("userID").notEmpty().withMessage("User ID is required"),
    body("totalAmount")
      .isNumeric()
      .withMessage("Total amount must be a number"),
    body("invoiceDate").notEmpty().withMessage("Invoice date is required"),
    body("paymentStatus")
      .isIn(["Pending", "Paid", "Cancelled"])
      .withMessage("Invalid payment status"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { invoiceID, userID, totalAmount, invoiceDate, paymentStatus } =
      req.body;

    try {
      // Kiểm tra UserID đã tồn tại
      const user = await User.findOne({ userID });
      if (!user) {
        return res.status(400).json({ error: "UserID không tồn tại." });
      }

      // Kiểm tra Invoice ID đã tồn tại
      const existingInvoice = await Invoice.findOne({ invoiceID });
      if (existingInvoice) {
        return res
          .status(400)
          .json({ error: "Invoice với ID này đã tồn tại." });
      }

      // Tạo Invoice mới
      const newInvoice = new Invoice({
        invoiceID,
        userID,
        totalAmount,
        invoiceDate,
        paymentStatus,
      });
      await newInvoice.save();

      res
        .status(201)
        .json({ message: "Invoice created successfully", data: newInvoice });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ALL - Lấy danh sách Invoices
/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: Lấy danh sách tất cả hóa đơn
 *     tags: [Invoices]
 *     responses:
 *       200:
 *         description: Danh sách hóa đơn
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res) => {
  try {
    const invoices = await Invoice.find().populate("userID", "fullName email");
    res.status(200).json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE - Lấy thông tin chi tiết Invoice
/**
 * @swagger
 * /api/invoices/{id}:
 *   get:
 *     summary: Lấy thông tin một hóa đơn
 *     tags: [Invoices]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: 64f6b3c9e3a1a4321f2c1a8b
 *     responses:
 *       200:
 *         description: Thông tin hóa đơn
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate(
      "userID",
      "fullName email"
    );
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    res.status(200).json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE - Cập nhật Invoice
/**
 * @swagger
 * /api/invoices/{id}:
 *   put:
 *     summary: Cập nhật thông tin một hóa đơn
 *     tags: [Invoices]
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
 *               paymentStatus:
 *                 type: string
 *                 enum: [Pending, Paid, Cancelled]
 *                 example: Paid
 *     responses:
 *       200:
 *         description: Invoice updated successfully
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Server error
 */
router.put("/:id", async (req, res) => {
  try {
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedInvoice)
      return res.status(404).json({ error: "Invoice not found" });

    res.status(200).json({
      message: "Invoice updated successfully",
      data: updatedInvoice,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Xóa Invoice
/**
 * @swagger
 * /api/invoices/{id}:
 *   delete:
 *     summary: Xóa một hóa đơn
 *     tags: [Invoices]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: 64f6b3c9e3a1a4321f2c1a8b
 *     responses:
 *       200:
 *         description: Invoice deleted successfully
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", async (req, res) => {
  try {
    const deletedInvoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!deletedInvoice)
      return res.status(404).json({ error: "Invoice not found" });

    res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
