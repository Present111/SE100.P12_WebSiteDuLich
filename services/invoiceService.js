const Invoice = require("../models/Invoice");
const User = require("../models/User");
const Service = require("../models/Service");

/**
 * Tạo một Invoice mới
 * @param {Object} invoiceData - Dữ liệu của Invoice
 * @returns {Object} - Invoice vừa tạo
 */
const createInvoice = async (invoiceData) => {
  const { invoiceID, userID, totalAmount, issueDate, paymentStatus, services } =
    invoiceData;

  // Kiểm tra UserID đã tồn tại
  const user = await User.findById(userID);
  if (!user) {
    throw new Error("User ID không tồn tại.");
  }

  // Kiểm tra Invoice ID đã tồn tại
  const existingInvoice = await Invoice.findOne({ invoiceID });
  if (existingInvoice) {
    throw new Error("Invoice với ID này đã tồn tại.");
  }

  // Kiểm tra danh sách dịch vụ
  for (const serviceEntry of services) {
    const { serviceID, quantity } = serviceEntry;

    // Kiểm tra serviceID hợp lệ
    const service = await Service.findById(serviceID);
    if (!service) {
      throw new Error(`Service ID ${serviceID} không tồn tại.`);
    }

    // Kiểm tra số lượng phải lớn hơn 0
    if (!quantity || quantity <= 0) {
      throw new Error(`Quantity phải lớn hơn 0 cho service ${serviceID}.`);
    }
  }

  // Tạo Invoice mới
  const newInvoice = new Invoice({
    invoiceID,
    userID,
    totalAmount,
    issueDate,
    paymentStatus,
    services, // Lưu mảng serviceID và quantity
  });

  return await newInvoice.save();
};

/**
 * Lấy tất cả Invoices
 * @returns {Array} - Danh sách Invoices
 */
const getAllInvoices = async () => {
  return await Invoice.find()
    .populate("userID", "fullName email")
    .populate("services.serviceID", "serviceName price"); // Lấy thông tin dịch vụ
};

/**
 * Lấy chi tiết Invoice theo ID
 * @param {String} id - ID của Invoice
 * @returns {Object|null} - Invoice hoặc null nếu không tìm thấy
 */
const getInvoiceById = async (id) => {
  return await Invoice.findById(id)
    .populate("userID", "fullName email")
    .populate("services.serviceID", "serviceName price"); // Lấy thông tin dịch vụ
};

/**
 * Cập nhật Invoice theo ID
 * @param {String} id - ID của Invoice
 * @param {Object} invoiceData - Dữ liệu cần cập nhật
 * @returns {Object|null} - Invoice sau khi cập nhật hoặc null nếu không tìm thấy
 */
const updateInvoiceById = async (id, invoiceData) => {
  const updatedInvoice = await Invoice.findByIdAndUpdate(id, invoiceData, {
    new: true,
  })
    .populate("userID", "fullName email")
    .populate("services.serviceID", "serviceName price"); // Lấy thông tin dịch vụ sau cập nhật
  if (!updatedInvoice) {
    throw new Error("Invoice not found");
  }
  return updatedInvoice;
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
