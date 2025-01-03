const express = require("express");
const { body, validationResult } = require("express-validator");
const invoiceService = require("../services/invoiceService");
const Invoice = require("../models/Invoice");
const Hotel = require("../models/Hotel");
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


// CREATE - Tạo mới hóa đơn
/**
 * @swagger
 * /api/invoices:
 *   post:
 *     summary: Tạo mới hóa đơn
 *     tags: [Invoices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userID:
 *                 type: string
 *                 description: ID của người tạo hóa đơn
 *               serviceID:
 *                 type: string
 *                 description: ID của dịch vụ được đặt
 *               quantity:
 *                 type: number
 *                 description: Số lượng đặt
 *               totalAmount:
 *                 type: number
 *                 description: Tổng tiền
 *               roomID:
 *                 type: string
 *                 description: ID của phòng đã đặt
 *               checkInDate:
 *                 type: string
 *                 format: date
 *                 description: Ngày nhận phòng
 *               checkOutDate:
 *                 type: string
 *                 format: date
 *                 description: Ngày trả phòng
 *     responses:
 *       201:
 *         description: Hóa đơn được tạo thành công
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       500:
 *         description: Server error
 */
router.post("/", async (req, res) => {
  try {
    const { userID, serviceID, quantity, totalAmount, roomID, checkInDate, checkOutDate ,pictures,invoiceID} = req.body;
  
    // Tạo invoice mới
    const newInvoice = new Invoice({
      invoiceID,
      userID,
      serviceID,
      quantity,
      totalAmount,
      issueDate: new Date(), // Ngày tạo hóa đơn
      paymentStatus: "unpaid", // Mặc định trạng thái thanh toán là unpaid
      status: "chờ xác nhận", // Mặc định trạng thái là chờ xác nhận
      roomID,
      checkInDate,
      checkOutDate,
      pictures
    });

    // Lưu vào cơ sở dữ liệu
    await newInvoice.save();

    // Trả về hóa đơn mới tạo
    res.status(201).json(newInvoice);
  } catch (err) {
   
    res.status(500).json({ error: err.message });
  }
});


// API lấy hóa đơn theo userID
router.get("/user/:userID", async (req, res) => {
  try {
    const { userID } = req.params;
    console.log(userID)
    // Tìm tất cả hóa đơn theo userID và populate cả serviceID và roomID
    const invoices = await Invoice.find({ userID })
      .populate('serviceID')  // Populate serviceID
      .populate('roomID');    // Populate roomID
      //console.log("HELLO",userID)
    if (!invoices || invoices.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy hóa đơn nào cho userID này" });
    }

    // Trả về danh sách hóa đơn với thông tin serviceID và roomID đã được populate
    res.status(200).json(invoices);
  } catch (err) {
    console.log("Lỗi khi lấy hóa đơn:", err);
    res.status(500).json({ error: err.message });
  }
});



// API lấy hóa đơn theo userID
router.get("/provider/:userID", async (req, res) => {
  try {
    const { userID } = req.params;

    // Tìm tất cả hóa đơn theo userID và populate cả serviceID và roomID
    const invoices = await Invoice.find({ providerID })
      .populate('serviceID')  // Populate serviceID
      .populate('roomID');    // Populate roomID

    if (!invoices || invoices.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy hóa đơn nào cho userID này" });
    }

    for (let invoice of invoices) {
      if (invoice.serviceID) {
        const hotel = await Hotel.findOne({ serviceID: invoice.serviceID._id })
          .populate('serviceID')  // Populate thông tin serviceID trong khách sạn
          .populate('hotelTypeID');  // Populate loại hình khách sạn

        // Thêm thông tin khách sạn vào hóa đơn
        invoice.hotel = hotel;
      }
    }
    // Trả về danh sách hóa đơn với thông tin serviceID và roomID đã được populate
    res.status(200).json(invoices);
  } catch (err) {
    console.log("Lỗi khi lấy hóa đơn:", err);
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
// API lấy tất cả đơn hàng
router.get("/orders", async (req, res) => {
  console.log("HELLO")
  try {
    // Tìm tất cả các đơn hàng và populate các trường liên quan
    const orders = await Invoice.find()
  .populate('userID')     // Populate thông tin người dùng
  .populate({
    path: 'serviceID',    // Populate thông tin dịch vụ
    populate: {
      path: 'providerID', // Populate thông tin nhà cung cấp trong serviceID
    },
  })
  .populate('roomID');    // Populate thông tin phòng (nếu có)

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng nào" });
    }

    // Trả về danh sách đơn hàng đã populate thông tin
    res.status(200).json(orders);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
