const Restaurant = require("../models/Restaurant");
const Service = require("../models/Service");
const RestaurantType = require("../models/RestaurantTypes");
const CuisineType = require("../models/CuisineType"); // Thêm model CuisineType
/**
 * Tạo một Restaurant mới
 * @param {Object} restaurantData - Dữ liệu của Restaurant
 * @param {Object} user - Thông tin người dùng thực hiện
 * @returns {Object} - Restaurant vừa tạo
 */
const createRestaurant = async (restaurantData, user) => {
  const {
    restaurantID,
    serviceID,
    cuisineTypeID, // Thay đổi để dùng ID từ bảng CuisineType
    seatingCapacity,
    restaurantTypeID,
  } = restaurantData;

  // Kiểm tra Service ID
  const service = await Service.findById(serviceID);
  if (!service) {
    throw new Error("Service ID không tồn tại.");
  }

  // Kiểm tra quyền của Provider
  if (user.role === "Provider" && user.id !== service.providerID.toString()) {
    throw new Error("Bạn không có quyền tạo Restaurant cho Service này.");
  }

  // Kiểm tra RestaurantType ID
  const restaurantType = await RestaurantType.findById(restaurantTypeID);
  if (!restaurantType) {
    throw new Error("Restaurant Type ID không tồn tại.");
  }

  // Kiểm tra CuisineType ID
  const cuisineType = await CuisineType.findById(cuisineTypeID);
  if (!cuisineType) {
    throw new Error("Cuisine Type ID không tồn tại.");
  }

  // Tạo Restaurant mới
  const newRestaurant = new Restaurant({
    restaurantID,
    serviceID,
    cuisineType: cuisineTypeID, // Sử dụng ID từ CuisineType
    seatingCapacity,
    restaurantTypeID, // Tham chiếu loại nhà hàng
  });

  return await newRestaurant.save();
};
/**
 * Lấy tất cả Restaurants
 * @returns {Array} - Danh sách Restaurants
 */
const getAllRestaurants = async () => {
  return await Restaurant.find()
    .populate("serviceID", "serviceName providerID")
    .populate("restaurantTypeID", "type"); // Lấy thông tin loại nhà hàng
};

/**
 * Lấy chi tiết Restaurant theo ID
 * @param {String} id - ID của Restaurant
 * @returns {Object|null} - Restaurant hoặc null nếu không tìm thấy
 */
const getRestaurantById = async (id) => {
  return await Restaurant.findById(id)
    .populate("serviceID", "serviceName providerID")
    .populate("restaurantTypeID", "type"); // Lấy thông tin loại nhà hàng
};

/**
 * Xóa một Restaurant theo ID
 * @param {String} id - ID của Restaurant
 * @param {Object} user - Người dùng thực hiện
 * @returns {Boolean} - Kết quả xóa
 */
const deleteRestaurantById = async (id, user) => {
  const restaurant = await Restaurant.findById(id).populate("serviceID");

  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  // Kiểm tra quyền xóa
  if (user.role !== "Admin" && user.id !== restaurant.serviceID.providerID) {
    throw new Error("Access denied");
  }

  await restaurant.remove();
  return true;
};

module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  deleteRestaurantById,
};
