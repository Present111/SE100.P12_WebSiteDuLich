const HotelType = require("../models/HotelType");
const User = require("../models/User"); // Giả sử có model User cho việc kiểm tra quyền người dùng
const Service = require("../models/Service"); // Dùng để kiểm tra quyền của Provider nếu cần

/**
 * Tạo một loại khách sạn mới
 * @param {Object} hotelTypeData - Dữ liệu của loại khách sạn
 * @param {Object} user - Người dùng thực hiện yêu cầu
 * @returns {Object} - Loại khách sạn mới được tạo
 */
const createHotelType = async (hotelTypeData, user) => {
  const { type } = hotelTypeData;

  // Kiểm tra quyền của người dùng
  if (user.role !== "Admin") {
    throw new Error("Chỉ Admin mới có quyền tạo loại khách sạn.");
  }

  // Kiểm tra loại khách sạn đã tồn tại chưa
  const existingHotelType = await HotelType.findOne({ type });
  if (existingHotelType) {
    throw new Error("Loại khách sạn này đã tồn tại.");
  }

  // Tạo loại khách sạn mới
  const newHotelType = new HotelType({ type });
  return await newHotelType.save();
};

/**
 * Lấy danh sách tất cả các loại khách sạn
 * @returns {Array} - Danh sách các loại khách sạn
 */
const getAllHotelTypes = async () => {
  return await HotelType.find();
};

/**
 * Lấy thông tin chi tiết loại khách sạn theo ID
 * @param {String} id - ID của loại khách sạn
 * @returns {Object|null} - Loại khách sạn hoặc null nếu không tìm thấy
 */
const getHotelTypeById = async (id) => {
  return await HotelType.findById(id);
};

/**
 * Xóa một loại khách sạn theo ID
 * @param {String} id - ID của loại khách sạn
 * @param {Object} user - Người dùng thực hiện yêu cầu
 * @returns {Boolean} - True nếu xóa thành công, lỗi nếu không
 */
const deleteHotelTypeById = async (id, user) => {
  // Kiểm tra loại khách sạn tồn tại không
  const hotelType = await HotelType.findById(id);
  if (!hotelType) {
    throw new Error("Hotel Type không tồn tại.");
  }

  // Kiểm tra quyền xóa
  if (user.role !== "Admin") {
    throw new Error("Chỉ Admin mới có quyền xóa loại khách sạn.");
  }

  // Xóa loại khách sạn
  await hotelType.remove();
  return true;
};

module.exports = {
  createHotelType,
  getAllHotelTypes,
  getHotelTypeById,
  deleteHotelTypeById,
};
