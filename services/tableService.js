const Table = require("../models/Table");
const Restaurant = require("../models/Restaurant");

/**
 * Tạo một Table mới
 * @param {Object} tableData - Dữ liệu của Table
 * @param {Object} user - Thông tin người dùng đang thực hiện
 * @returns {Object} - Table vừa tạo
 */
const createTable = async (tableData, user) => {
  const { tableID, restaurantID, tableType, availableDate } = tableData;

  // Kiểm tra nhà hàng có tồn tại không
  const restaurant = await Restaurant.findOne({ _id: restaurantID });
  if (!restaurant) {
    throw new Error("Restaurant ID không tồn tại.");
  }

  // Kiểm tra quyền của Provider
  if (user.role === "Provider" && user.id !== restaurant.serviceID.providerID) {
    throw new Error("Bạn không có quyền tạo Table cho Restaurant này.");
  }

  // Tạo mới Table
  const newTable = new Table({
    tableID,
    restaurantID,
    tableType,
    availableDate,
  });

  return await newTable.save();
};

/**
 * Lấy tất cả các Table
 * @returns {Array} Danh sách Tables
 */
const getAllTables = async () => {
  return await Table.find().populate(
    "restaurantID",
    "restaurantName serviceID"
  );
};

/**
 * Lấy chi tiết Table theo ID
 * @param {String} id - ID của Table
 * @returns {Object|null} Table hoặc null nếu không tìm thấy
 */
const getTableById = async (id) => {
  return await Table.findById(id).populate(
    "restaurantID",
    "restaurantName serviceID"
  );
};

/**
 * Xóa một Table theo ID
 * @param {String} id - ID của Table
 * @param {Object} user - Người dùng đang thực hiện
 * @returns {Boolean} Kết quả xóa
 */
const deleteTableById = async (id, user) => {
  const table = await Table.findById(id).populate("restaurantID");

  if (!table) {
    throw new Error("Table not found");
  }

  // Chỉ Admin hoặc Provider sở hữu Restaurant được phép xóa
  if (
    user.role !== "Admin" &&
    user.id !== table.restaurantID.serviceID.providerID
  ) {
    throw new Error("Access denied");
  }

  await table.remove();
  return true;
};

module.exports = {
  createTable,
  getAllTables,
  getTableById,
  deleteTableById,
};
