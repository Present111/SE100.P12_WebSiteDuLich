const Admin = require("../models/Admin");
const User = require("../models/User");

/**
 * Tạo một Admin mới
 * @param {Object} adminData - Dữ liệu của Admin
 * @returns {Object} - Admin vừa tạo
 */
const createAdmin = async (adminData) => {
  const { userID, accessLevel } = adminData;

  // Kiểm tra UserID đã tồn tại và có vai trò Admin
  const existingUser = await User.findOne({ _id: userID, role: "Admin" });
  if (!existingUser) {
    throw new Error("UserID không tồn tại hoặc không phải Admin.");
  }

  // Kiểm tra Admin đã tồn tại chưa
  const existingAdmin = await Admin.findOne({ userID });
  if (existingAdmin) {
    throw new Error("Admin với UserID này đã tồn tại.");
  }

  const newAdmin = new Admin({ userID, accessLevel });
  return await newAdmin.save();
};

/**
 * Lấy danh sách Admins
 * @returns {Array} - Danh sách Admins
 */
const getAllAdmins = async () => {
  return await Admin.find().populate("userID", "fullName email");
};

/**
 * Lấy chi tiết Admin theo ID
 * @param {String} id - ID của Admin
 * @returns {Object|null} - Admin hoặc null nếu không tìm thấy
 */
const getAdminById = async (id) => {
  return await Admin.findById(id).populate("userID", "fullName email");
};

/**
 * Cập nhật Admin theo ID
 * @param {String} id - ID của Admin
 * @param {Object} adminData - Dữ liệu cần cập nhật
 * @returns {Object|null} - Admin sau khi cập nhật hoặc null nếu không tìm thấy
 */
const updateAdminById = async (id, adminData) => {
  return await Admin.findByIdAndUpdate(id, adminData, { new: true });
};

/**
 * Xóa một Admin theo ID
 * @param {String} id - ID của Admin
 * @returns {Boolean} - True nếu xóa thành công, lỗi nếu không
 */
const deleteAdminById = async (id) => {
  const deletedAdmin = await Admin.findByIdAndDelete(id);
  if (!deletedAdmin) {
    throw new Error("Admin not found");
  }
  return true;
};

module.exports = {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdminById,
  deleteAdminById,
};
