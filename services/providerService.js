const Provider = require("../models/Provider");
const User = require("../models/User");
const Service = require("../models/Service");
const mongoose = require("mongoose");

/**
 * Tạo một Provider mới
 * @param {Object} providerData - Dữ liệu của Provider
 * @returns {Object} - Provider vừa tạo
 */
const createProvider = async (providerData) => {
  const {
    providerID,
    userID,
    providerName,
    address,
    serviceDescription,
    serviceIDs, // Thêm mảng serviceIDs
  } = providerData;

  // Kiểm tra User ID
  const user = await User.findOne({ _id: userID, role: "Provider" });
  if (!user) {
    throw new Error("UserID không tồn tại hoặc không phải Provider.");
  }

  // Kiểm tra Provider ID đã tồn tại chưa
  const existingProvider = await Provider.findOne({ providerID });
  if (existingProvider) {
    throw new Error("Provider với ID này đã tồn tại.");
  }

  // Kiểm tra các Service ID trong serviceIDs
  // if (serviceIDs && Array.isArray(serviceIDs)) {
  //   for (const serviceID of serviceIDs) {
  //     const service = await Service.findById(serviceID);
  //     if (!service) {
  //       throw new Error(`Service ID không tồn tại: ${serviceID}`);
  //     }
  //   }
  // } else if (serviceIDs) {
  //   throw new Error("Service IDs phải là một mảng.");
  // }

  // Tạo Provider mới
  const newProvider = new Provider({
    providerID,
    userID: new mongoose.Types.ObjectId(userID),
    providerName,
    address,
    serviceDescription,
    serviceIDs: serviceIDs || [], // Lưu trữ danh sách serviceIDs (mảng rỗng nếu không có)
  });

  return await newProvider.save();
};

/**
 * Lấy danh sách Providers
 * @returns {Array} - Danh sách Providers
 */
const getAllProviders = async () => {
  return await Provider.find().populate("userID", "fullName email");
};

/**
 * Lấy thông tin chi tiết của một Provider theo ID
 * @param {String} id - ID của Provider
 * @returns {Object|null} - Provider hoặc null nếu không tìm thấy
 */
const getProviderById = async (id) => {
  return await Provider.findById(id).populate("userID", "fullName email");
};

/**
 * Cập nhật thông tin của một Provider
 * @param {String} id - ID của Provider
 * @param {Object} providerData - Dữ liệu cần cập nhật
 * @returns {Object|null} - Provider sau khi cập nhật hoặc null nếu không tìm thấy
 */
const updateProviderById = async (id, providerData) => {
  return await Provider.findByIdAndUpdate(id, providerData, { new: true });
};

/**
 * Xóa một Provider
 * @param {String} id - ID của Provider
 * @returns {Boolean} - True nếu xóa thành công, lỗi nếu không
 */
const deleteProviderById = async (id) => {
  const deletedProvider = await Provider.findByIdAndDelete(id);
  if (!deletedProvider) {
    throw new Error("Provider not found");
  }
  return true;
};

module.exports = {
  createProvider,
  getAllProviders,
  getProviderById,
  updateProviderById,
  deleteProviderById,
};
