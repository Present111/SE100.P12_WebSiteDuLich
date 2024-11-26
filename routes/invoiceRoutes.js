const express = require("express");
const { body, validationResult } = require("express-validator");
const invoiceService = require("../services/invoiceService");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: API quản lý hóa đơn
 */

// CREATE - Tạo mới Invoice
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
 *               serviceID:
 *                 type: string
 *                 example: S001
 *               quantity:
 *                 type: number
 *                 example: 2
 *               totalAmount:
 *                 type: number
 *                 example: 500.75
 *               issueDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-01
 *               paymentStatus:
 *                 type: string
 *                 enum: [paid, unpaid]
 *                 example: unpaid
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
    body("serviceID").notEmpty().withMessage("Service ID is required"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
    body("totalAmount")
      .isNumeric()
      .withMessage("Total amount must be a number"),
    body("issueDate").notEmpty().withMessage("Issue date is required"),
    body("paymentStatus")
      .isIn(["paid", "unpaid"])
      .withMessage("Invalid payment status"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newInvoice = await invoiceService.createInvoice(req.body);
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
    const invoices = await invoiceService.getAllInvoices();
    res.status(200).json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE - Lấy chi tiết Invoice
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
    const invoice = await invoiceService.getInvoiceById(req.params.id);
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
 *                 enum: [paid, unpaid]
 *                 example: paid
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
    const updatedInvoice = await invoiceService.updateInvoiceById(
      req.params.id,
      req.body
    );
    if (!updatedInvoice)
      return res.status(404).json({ error: "Invoice not found" });
    res
      .status(200)
      .json({ message: "Invoice updated successfully", data: updatedInvoice });
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
    await invoiceService.deleteInvoiceById(req.params.id);
    res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
