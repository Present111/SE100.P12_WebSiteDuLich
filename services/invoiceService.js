const Invoice = require("../models/Invoice");
const User = require("../models/User");

/**
 * Tạo một Invoice mới
 * @param {Object} invoiceData - Dữ liệu của Invoice
 * @returns {Object} - Invoice vừa tạo
 */
const createInvoice = async (invoiceData) => {
  const { invoiceID, userID, totalAmount, invoiceDate, paymentStatus } = invoiceData;

  // Kiểm tra UserID đã tồn tại
  const user = await User.findOne({ _id: userID });
  if (!user) {
    throw new Error("UserID không tồn tại.");
  }

  // Kiểm tra Invoice ID đã tồn tại
  const existingInvoice = await Invoice.findOne({ invoiceID });
  if (existingInvoice) {
    throw new Error("Invoice với ID này đã tồn tại.");
  }

  // Tạo Invoice mới
  const newInvoice = new Invoice({
    invoiceID,
    userID,
    totalAmount,
    invoiceDate,
    paymentStatus,
  });

  return await newInvoice.save();
};

/**
 * Lấy tất cả Invoices
 * @returns {Array} - Danh sách Invoices
 */
const getAllInvoices = async () => {
  return await Invoice.find().populate("userID", "fullName email");
};

/**
 * Lấy chi tiết Invoice theo ID
 * @param {String} id - ID của Invoice
 * @returns {Object|null} - Invoice hoặc null nếu không tìm thấy
 */
const getInvoiceById = async (id) => {
  return await Invoice.findById(id).populate("userID", "fullName email");
};

/**
 * Cập nhật Invoice theo ID
 * @param {String} id - ID của Invoice
 * @param {Object} invoiceData - Dữ liệu cần cập nhật
 * @returns {Object|null} - Invoice sau khi cập nhật hoặc null nếu không tìm thấy
 */
const updateInvoiceById = async (id, invoiceData) => {
  return await Invoice.findByIdAndUpdate(id, invoiceData, { new: true });
};

/**
 * Xóa một Invoice theo ID
 * @param {String} id - ID của Invoice
 * @returns {Boolean} - True nếu xóa thành công, lỗi nếu không
 */
const deleteInvoiceById = async (id) => {
  const deletedInvoice = await Invoice.findByIdAndDelete(id);
  if (!deletedInvoice) {
    throw new Error("Invoice not found");
  }
  return true;
};

module.exports = {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoiceById,
  deleteInvoiceById,
};
