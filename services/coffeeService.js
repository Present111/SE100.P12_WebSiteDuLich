const Coffee = require("../models/Coffee");
const Service = require("../models/Service");

/**
 * Tạo một Coffee mới
 * @param {Object} coffeeData - Dữ liệu của Coffee
 * @param {Object} user - Thông tin người dùng thực hiện
 * @param {String|null} picturePath - Đường dẫn hình ảnh (nếu có)
 * @returns {Object} - Coffee vừa tạo
 */
const createCoffee = async (coffeeData, user, picturePath) => {
  const { coffeeID, serviceID, coffeeType, averagePrice } = coffeeData;

  // Tìm Service từ Database
  const service = await Service.findById(serviceID).populate("providerID");
  if (!service) {
    throw new Error("Service ID không tồn tại.");
  }

  // Kiểm tra quyền Provider
  if (
    user.role === "Provider" &&
    user.id !== service.providerID.userID.toString()
  ) {
    throw new Error("Bạn không có quyền tạo Coffee cho Service này.");
  }

  // Tạo Coffee mới
  const newCoffee = new Coffee({
    coffeeID,
    serviceID,
    coffeeType,
    averagePrice,
    picture: picturePath,
  });

  return await newCoffee.save();
};

/**
 * Lấy danh sách Coffees
 * @returns {Array} - Danh sách Coffees
 */
const getAllCoffees = async () => {
  return await Coffee.find().populate("serviceID", "serviceName providerID");
};

/**
 * Lấy chi tiết Coffee theo ID
 * @param {String} id - ID của Coffee
 * @returns {Object|null} - Coffee hoặc null nếu không tìm thấy
 */
const getCoffeeById = async (id) => {
  return await Coffee.findById(id).populate(
    "serviceID",
    "serviceName providerID"
  );
};

/**
 * Cập nhật Coffee theo ID
 * @param {String} id - ID của Coffee
 * @param {Object} coffeeData - Dữ liệu cần cập nhật
 * @param {Object} user - Người dùng thực hiện
 * @returns {Object|null} - Coffee sau khi cập nhật hoặc null nếu không tìm thấy
 */
const updateCoffeeById = async (id, coffeeData, user) => {
  const coffee = await Coffee.findById(id).populate("serviceID");

  if (!coffee) {
    throw new Error("Coffee not found");
  }

  if (user.role !== "Admin" && user.id !== coffee.serviceID.providerID) {
    throw new Error("Access denied");
  }

  return await Coffee.findByIdAndUpdate(id, coffeeData, { new: true });
};

/**
 * Xóa Coffee theo ID
 * @param {String} id - ID của Coffee
 * @param {Object} user - Người dùng thực hiện
 * @returns {Boolean} - True nếu xóa thành công
 */
const deleteCoffeeById = async (id, user) => {
  const coffee = await Coffee.findById(id).populate("serviceID");

  if (!coffee) {
    throw new Error("Coffee not found");
  }

  if (user.role !== "Admin" && user.id !== coffee.serviceID.providerID) {
    throw new Error("Access denied");
  }

  await coffee.remove();
  return true;
};

module.exports = {
  createCoffee,
  getAllCoffees,
  getCoffeeById,
  updateCoffeeById,
  deleteCoffeeById,
};
