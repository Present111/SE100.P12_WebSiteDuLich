const Hotel = require("../models/Hotel");
const Service = require("../models/Service");
const HotelType = require("../models/HotelType");
const Room = require("../models/Room");

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

const getHotelById1 = async (id) => {
  try {
    // Truy vấn khách sạn và populate thông tin chi tiết
    const hotel = await Hotel.findById(id)
      .populate({
        path: "serviceID", // Populate thông tin dịch vụ
        populate: [
          {
            path: "locationID", // Populate thông tin Location
            model: "Location",
          },
          {
            path: "providerID", // Populate thông tin Provider
            model: "Provider",
          },
          {
            path: "facilities", // Populate tiện ích dịch vụ
            model: "FacilityType",
          },
          {
            path: "priceCategories", // Populate bảng giá
            model: "PriceCategory",
          },
          {
            path: "suitability", // Populate phù hợp
            model: "Suitability",
          },
          {
            path: "reviews", // Populate đánh giá
            model: "Review",
          },
        ],
      })
      .populate({
        path: "hotelTypeID", // Populate loại hình khách sạn
        select: "name description", // Chọn các trường cần thiết từ loại hình khách sạn
      });

    // Kiểm tra nếu không tìm thấy khách sạn
    if (!hotel) {
      throw new Error("Hotel not found");
    }

    // Truy vấn thông tin các phòng (rooms) tham chiếu đến khách sạn này
    const rooms = await Room.find({ hotelID : id })
      .populate({
        path: "facilities", // Populate tiện ích phòng
        model: "Facility",
      })
      ;

    // Thêm thông tin phòng vào thông tin khách sạn
   

    return { hotel,rooms}; // Trả về thông tin khách sạn với tất cả các dữ liệu đã populate, bao gồm phòng
  } catch (err) {
    // Lỗi trong quá trình truy vấn hoặc populate
    throw new Error(err.message);
  }
};



const getAllHotelsWithDetails = async () => {
  return await Hotel.find()
    .populate({
      path: "serviceID",
      populate: [
        { path: "locationID", model: "Location" }, // Populate Service -> Location
        { path: "facilities", model: "FacilityType" }, // Populate Service -> FacilityType
      ],
    })
    .exec();
};
module.exports = {
  createHotel,
  getAllHotels,
  getHotelById,
  deleteHotelById,
  getHotelById1,
  getAllHotelsWithDetails
};
