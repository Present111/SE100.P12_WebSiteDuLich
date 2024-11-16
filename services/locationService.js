const Location = require("../models/Location");

/**
 * Tạo một Location mới
 * @param {Object} locationData - Dữ liệu của Location
 * @returns {Object} - Location vừa tạo
 */
const createLocation = async (locationData) => {
  const { locationID, locationName, description, latitude, longitude } =
    locationData;

  const newLocation = new Location({
    locationID,
    locationName,
    description,
    latitude,
    longitude,
  });

  return await newLocation.save();
};

/**
 * Lấy tất cả Locations
 * @returns {Array} - Danh sách Locations
 */
const getAllLocations = async () => {
  return await Location.find();
};

/**
 * Lấy chi tiết Location theo ID
 * @param {String} id - ID của Location
 * @returns {Object|null} - Location hoặc null nếu không tìm thấy
 */
const getLocationById = async (id) => {
  return await Location.findById(id);
};

/**
 * Cập nhật Location theo ID
 * @param {String} id - ID của Location
 * @param {Object} locationData - Dữ liệu cần cập nhật
 * @returns {Object|null} - Location sau khi cập nhật hoặc null nếu không tìm thấy
 */
const updateLocationById = async (id, locationData) => {
  return await Location.findByIdAndUpdate(id, locationData, { new: true });
};

/**
 * Xóa một Location theo ID
 * @param {String} id - ID của Location
 * @returns {Boolean} - True nếu xóa thành công, lỗi nếu không
 */
const deleteLocationById = async (id) => {
  const deletedLocation = await Location.findByIdAndDelete(id);
  if (!deletedLocation) {
    throw new Error("Location not found");
  }
  return true;
};

module.exports = {
  createLocation,
  getAllLocations,
  getLocationById,
  updateLocationById,
  deleteLocationById,
};
