const Customer = require("../models/Customer");
const User = require("../models/User");

/**
 * Tạo một Customer mới
 * @param {Object} customerData - Dữ liệu của Customer
 * @returns {Object} - Customer vừa tạo
 */
const createCustomer = async (customerData) => {
  const { customerID, userID, loyaltyPoints } = customerData;

  // Kiểm tra UserID đã tồn tại
  const user = await User.findOne({ _id: userID, role: "Customer" });
  if (!user) {
    throw new Error("UserID không tồn tại hoặc không phải Customer.");
  }

  // Kiểm tra Customer ID đã tồn tại
  const existingCustomer = await Customer.findOne({ customerID });
  if (existingCustomer) {
    throw new Error("Customer với ID này đã tồn tại.");
  }

  const newCustomer = new Customer({ customerID, userID, loyaltyPoints });
  return await newCustomer.save();
};

/**
 * Lấy danh sách Customers
 * @returns {Array} - Danh sách Customers
 */
const getAllCustomers = async () => {
  return await Customer.find().populate("userID", "fullName email");
};

/**
 * Lấy chi tiết Customer theo ID
 * @param {String} id - ID của Customer
 * @returns {Object|null} - Customer hoặc null nếu không tìm thấy
 */
const getCustomerById = async (id) => {
  return await Customer.findById(id).populate("userID", "fullName email");
};

/**
 * Cập nhật Customer theo ID
 * @param {String} id - ID của Customer
 * @param {Object} customerData - Dữ liệu cần cập nhật
 * @returns {Object|null} - Customer sau khi cập nhật hoặc null nếu không tìm thấy
 */
const updateCustomerById = async (id, customerData) => {
  return await Customer.findByIdAndUpdate(id, customerData, { new: true });
};

/**
 * Xóa một Customer theo ID
 * @param {String} id - ID của Customer
 * @returns {Boolean} - True nếu xóa thành công, lỗi nếu không
 */
const deleteCustomerById = async (id) => {
  const deletedCustomer = await Customer.findByIdAndDelete(id);
  if (!deletedCustomer) {
    throw new Error("Customer not found");
  }
  return true;
};

module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomerById,
  deleteCustomerById,
};
