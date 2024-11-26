const Restaurant = require("../models/Restaurant");
const Service = require("../models/Service");
const RestaurantType = require("../models/RestaurantTypes");
const CuisineType = require("../models/CuisineType");
const DishType = require("../models/DishType"); // Thêm model DishType

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
    cuisineTypeIDs, // Mảng ID loại món ăn
    dishTypeIDs, // Mảng ID loại món ăn
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

  // Kiểm tra từng CuisineType ID trong mảng
  for (const cuisineTypeID of cuisineTypeIDs) {
    const cuisineType = await CuisineType.findById(cuisineTypeID);
    if (!cuisineType) {
      throw new Error(`Cuisine Type ID không tồn tại: ${cuisineTypeID}`);
    }
  }

  // Kiểm tra từng DishType ID trong mảng
  for (const dishTypeID of dishTypeIDs) {
    const dishType = await DishType.findById(dishTypeID);
    if (!dishType) {
      throw new Error(`Dish Type ID không tồn tại: ${dishTypeID}`);
    }
  }

  // Tạo Restaurant mới
  const newRestaurant = new Restaurant({
    restaurantID,
    serviceID,
    cuisineTypeIDs, // Lưu mảng loại món ăn
    dishTypeIDs, // Lưu mảng loại DishType
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
    .populate("restaurantTypeID", "type")
    .populate("cuisineTypeIDs", "type") // Lấy thông tin loại món ăn
    .populate("dishTypeIDs", "name"); // Lấy thông tin loại DishType
};

/**
 * Lấy chi tiết Restaurant theo ID
 * @param {String} id - ID của Restaurant
 * @returns {Object|null} - Restaurant hoặc null nếu không tìm thấy
 */
const getRestaurantById = async (id) => {
  return await Restaurant.findById(id)
    .populate("serviceID", "serviceName providerID")
    .populate("restaurantTypeID", "type")
    .populate("cuisineTypeIDs", "type") // Lấy thông tin loại món ăn
    .populate("dishTypeIDs", "name"); // Lấy thông tin loại DishType
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
