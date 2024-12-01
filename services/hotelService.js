const Hotel = require("../models/Hotel");
const Service = require("../models/Service");
const HotelType = require("../models/HotelType");

/**
 * Tạo một Hotel mới
 * @param {Object} hotelData - Dữ liệu của Hotel
 * @param {Object} user - Người dùng thực hiện yêu cầu
 * @returns {Object} - Hotel vừa tạo
 */
const createHotel = async (hotelData, user) => {
  const { hotelID, serviceID, starRating, hotelTypeID } = hotelData;

  // Kiểm tra Service ID
  const service = await Service.findOne({ _id: serviceID });
  if (!service) {
    throw new Error("Service ID không tồn tại.");
  }

  // Kiểm tra quyền của Provider
  if (user.role === "Provider" && user.id !== service.providerID.toString()) {
    throw new Error("Bạn không có quyền tạo Hotel cho Service này.");
  }

  // Kiểm tra HotelType ID
  const hotelType = await HotelType.findById(hotelTypeID);
  if (!hotelType) {
    throw new Error("Hotel Type ID không tồn tại.");
  }

  // Tạo Hotel mới
  const newHotel = new Hotel({
    hotelID,
    serviceID,
    starRating,
    hotelTypeID, // Gắn loại Hotel
  });

  return await newHotel.save();
};

/**
 * Lấy danh sách Hotels
 * @returns {Array} - Danh sách Hotels
 */
const getAllHotels = async () => {
  return await Hotel.find().populate("serviceID", "serviceName providerID");
};

/**
 * Lấy chi tiết Hotel theo ID
 * @param {String} id - ID của Hotel
 * @returns {Object|null} - Hotel hoặc null nếu không tìm thấy
 */
const getHotelById = async (id) => {
  return await Hotel.findById(id).populate(
    "serviceID",
    "serviceName providerID"
  );
};

/**
 * Xóa một Hotel theo ID
 * @param {String} id - ID của Hotel
 * @param {Object} user - Người dùng thực hiện yêu cầu
 * @returns {Boolean} - True nếu xóa thành công, lỗi nếu không
 */
const deleteHotelById = async (id, user) => {
  const hotel = await Hotel.findById(id).populate("serviceID");

  if (!hotel) {
    throw new Error("Hotel not found");
  }

  // Kiểm tra quyền xóa
  if (user.role !== "Admin" && user.id !== hotel.serviceID.providerID) {
    throw new Error("Access denied");
  }

  await hotel.remove();
  return true;
};

const getHotelById1 = async (hotelID) => {
  try {
    // Đảm bảo rằng bạn gọi populate() sau khi thực hiện truy vấn
    const hotel = await Hotel.findOne({ hotelID }).populate({
      path: "serviceID", // Populate thông tin dịch vụ (service)
      populate: {
        path: "locationID", // Populate thông tin vị trí (location)
        model: "Location", // Model của Location
      },
    });

    if (!hotel) {
      throw new Error("Hotel not found");
    }
    return hotel;
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = {
  createHotel,
  getAllHotels,
  getHotelById,
  deleteHotelById,
  getHotelById1,
};
