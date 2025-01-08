const express = require("express");
const { body, validationResult } = require("express-validator");
const invoiceService = require("../services/invoiceService");

const router = express.Router();
const mongoose = require("mongoose");
const Invoice = require("../models/Invoice"); // Import model Invoice
const Room = require("../models/Room"); // Import model Room
const Hotel = require("../models/Hotel"); // Import model Hotel
const Service = require("../models/Service"); // Import model Service
const Provider = require("../models/Provider"); // Import model Provider

/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: API quản lý hóa đơn
 */

/**
 * @swagger
 * /api/invoices/revenue:
 *   get:
 *     summary: Tính doanh thu cho mỗi roomType từ userID và tháng, năm
 *     tags: [Invoices]
 *     parameters:
 *       - name: userID
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng
 *       - name: month
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Tháng cần tính doanh thu (1 - 12)
 *       - name: year
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *         description: Năm để lọc dữ liệu (mặc định là năm hiện tại nếu không nhập)
 *     responses:
 *       200:
 *         description: Danh sách doanh thu của từng roomType
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       roomType:
 *                         type: string
 *                       revenue:
 *                         type: number
 *                         example: 5000
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       500:
 *         description: Lỗi server
 */

router.get("/revenue", async (req, res) => {
  try {
    const { userID, month, year } = req.query;

    // Kiểm tra dữ liệu đầu vào
    if (!userID) {
      return res.status(400).json({ error: "userID is required" });
    }
    if (!month || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: "Month must be between 1 and 12" });
    }

    // Sử dụng năm hiện tại nếu không nhập
    const currentYear = new Date().getFullYear();
    const selectedYear = year || currentYear;

    // Xác định khoảng thời gian của tháng và năm
    const start = new Date(selectedYear, month - 1, 1);
    const end = new Date(selectedYear, month, 0, 23, 59, 59);

    // --- Lấy danh sách room từ API /by-user ---
    const rooms = await Room.find().populate({
      path: "hotelID",
      populate: {
        path: "serviceID",
        populate: {
          path: "providerID",
          match: { userID: new mongoose.Types.ObjectId(userID) },
        },
      },
    });

    // Lọc roomID thỏa mãn điều kiện
    const roomMap = {};
    rooms.forEach((room) => {
      if (room.hotelID?.serviceID?.providerID) {
        roomMap[room._id.toString()] = room.roomType; // Lưu roomID và roomType
      }
    });
    const roomIDs = Object.keys(roomMap);

    // --- Tính toán doanh thu ---
    const invoices = await Invoice.find({
      roomID: { $in: roomIDs }, // Chỉ xét roomID có trong danh sách
      issueDate: { $gte: start, $lte: end }, // Lọc theo tháng và năm
      paymentStatus: "paid", // Chỉ tính hóa đơn đã thanh toán
    });

    // Tính doanh thu theo từng roomType
    const revenueMap = {};

    // Khởi tạo doanh thu bằng 0 cho tất cả roomType
    roomIDs.forEach((id) => {
      const roomType = roomMap[id];
      if (!revenueMap[roomType]) {
        revenueMap[roomType] = 0;
      }
    });

    invoices.forEach((invoice) => {
      const roomID = invoice.roomID.toString();
      const roomType = roomMap[roomID];
      const amount = invoice.totalAmount || 0;

      if (roomType) {
        revenueMap[roomType] += amount; // Cộng dồn revenue theo roomType
      }
    });

    // Chuyển kết quả sang mảng để trả về
    const result = Object.keys(revenueMap).map((roomType) => ({
      roomType,
      revenue: revenueMap[roomType],
    }));

    // Trả về kết quả
    res.status(200).json({ data: result });
  } catch (err) {
    console.error("Lỗi khi tính doanh thu:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/invoices/revenue/yearly:
 *   get:
 *     summary: Tính doanh thu cho mỗi roomType từ userID và năm
 *     tags: [Invoices]
 *     parameters:
 *       - name: userID
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng
 *       - name: year
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *         description: Năm để lọc dữ liệu (mặc định là năm hiện tại nếu không nhập)
 *     responses:
 *       200:
 *         description: Danh sách doanh thu của từng roomType trong năm
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       roomType:
 *                         type: string
 *                       revenue:
 *                         type: number
 *                         example: 15000
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       500:
 *         description: Lỗi server
 */

router.get("/revenue/yearly", async (req, res) => {
  try {
    const { userID, year } = req.query;

    // Kiểm tra dữ liệu đầu vào
    if (!userID || !mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({ error: "Invalid or missing userID" });
    }

    // Chuyển userID thành ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userID);

    // Sử dụng năm hiện tại nếu không nhập
    const currentYear = new Date().getFullYear();
    const selectedYear = year || currentYear;

    // Xác định khoảng thời gian của năm được chọn
    const start = new Date(selectedYear, 0, 1); // Ngày đầu năm
    const end = new Date(selectedYear, 11, 31, 23, 59, 59); // Ngày cuối năm

    // --- Lấy danh sách room từ API `/by-user` ---
    const rooms = await Room.find().populate({
      path: "hotelID",
      populate: {
        path: "serviceID",
        populate: {
          path: "providerID",
          match: { userID: userObjectId },
        },
      },
    });

    // Lọc roomID và roomType từ kết quả
    const roomMap = {};
    rooms.forEach((room) => {
      if (room.hotelID?.serviceID?.providerID) {
        roomMap[room._id.toString()] = room.roomType; // Lưu roomID và roomType
      }
    });
    const roomIDs = Object.keys(roomMap);

    // --- Tính toán doanh thu ---
    const invoices = await Invoice.find({
      roomID: { $in: roomIDs }, // Chỉ xét roomID có trong danh sách
      issueDate: { $gte: start, $lte: end }, // Lọc theo năm
      paymentStatus: "paid", // Chỉ tính hóa đơn đã thanh toán
    });

    // Tính doanh thu theo từng roomType
    const revenueMap = {};

    // Khởi tạo doanh thu bằng 0 cho tất cả roomType
    roomIDs.forEach((id) => {
      const roomType = roomMap[id];
      if (!revenueMap[roomType]) {
        revenueMap[roomType] = 0;
      }
    });

    invoices.forEach((invoice) => {
      const roomID = invoice.roomID.toString();
      const roomType = roomMap[roomID];
      const amount = invoice.totalAmount || 0;

      if (roomType) {
        revenueMap[roomType] += amount; // Cộng dồn revenue theo roomType
      }
    });

    // Chuyển kết quả sang mảng để trả về
    const result = Object.keys(revenueMap).map((roomType) => ({
      roomType,
      revenue: revenueMap[roomType],
    }));

    // Trả về kết quả
    res.status(200).json({ data: result });
  } catch (err) {
    console.error("Lỗi khi tính doanh thu:", err);
    res.status(500).json({ error: err.message });
  }
});

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
    const {
      userID,
      serviceID,
      quantity,
      totalAmount,
      roomID,
      checkInDate,
      checkOutDate,
      pictures,
      invoiceID,
    } = req.body;

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
      pictures,
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
    console.log(userID);
    // Tìm tất cả hóa đơn theo userID và populate cả serviceID và roomID
    const invoices = await Invoice.find({ userID })
      .populate({
        path: "serviceID", // Populate serviceID
        populate: {
          path: "locationID", // Populate locationID trong serviceID
        },
      }) // Populate serviceID
      .populate("roomID") // Populate roomID
      .populate("review");
    //console.log("HELLO",userID)
    if (!invoices || invoices.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy hóa đơn nào cho userID này" });
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
      .populate({
        path: "serviceID", // Populate serviceID
        populate: {
          path: "locationID", // Populate locationID trong serviceID
        },
      }) // Populate serviceID
      .populate("roomID"); // Populate roomID

    if (!invoices || invoices.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy hóa đơn nào cho userID này" });
    }

    for (let invoice of invoices) {
      if (invoice.serviceID) {
        const hotel = await Hotel.findOne({ serviceID: invoice.serviceID._id })
          .populate("serviceID") // Populate thông tin serviceID trong khách sạn
          .populate("hotelTypeID")
          .populate("review"); // Populate loại hình khách sạn

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
// router.put("/:id", async (req, res) => {
//   try {
//     const updatedInvoice = await invoiceService.updateInvoiceById(
//       req.params.id,
//       req.body
//     );
//     if (!updatedInvoice)
//       return res.status(404).json({ error: "Invoice not found" });
//     res
//       .status(200)
//       .json({ message: "Invoice updated successfully", data: updatedInvoice });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

router.put("/invoices/:invoiceID/status", async (req, res) => {
  console.log("HELLO");

  const { invoiceID } = req.params;
  const { status } = req.body;

  const validStatuses = ["chờ xác nhận", "đã xác nhận", "đã hủy", "đã sử dụng"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  try {
    const updatedInvoice = await Invoice.findOneAndUpdate(
      { _id: invoiceID },
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedInvoice) {
      console.log("@");
      return res.status(404).json({ error: "Invoice not found" });
    }

    res
      .status(200)
      .json({ message: "Status updated successfully", updatedInvoice });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "An error occurred while updating status",
      details: error.message,
    });
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
  console.log("HELLO");
  try {
    // Tìm tất cả các đơn hàng và populate các trường liên quan
    const orders = await Invoice.find()
      .populate("userID") // Populate thông tin người dùng
      .populate({
        path: "serviceID", // Populate thông tin dịch vụ
        populate: {
          path: "providerID", // Populate thông tin nhà cung cấp trong serviceID
        },
      })
      .populate("roomID"); // Populate thông tin phòng (nếu có)

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
