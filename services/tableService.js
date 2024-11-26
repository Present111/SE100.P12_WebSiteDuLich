const Table = require("../models/Table");
const Restaurant = require("../models/Restaurant");

// Tạo Table mới
const createTable = async (tableData, user, picturePath) => {
  const {
    tableID,
    restaurantID,
    tableType,
    availableDate,
    price,
    discountPrice,
    active,
    facilities,
  } = tableData;

  // Kiểm tra Restaurant có tồn tại hay không
  const restaurant = await Restaurant.findById(restaurantID);
  if (!restaurant) throw new Error("Restaurant ID không tồn tại.");

  // Kiểm tra quyền Provider (nếu người dùng không phải Admin)
  if (user.role === "Provider" && user.id !== restaurant.serviceID.providerID) {
    throw new Error("Bạn không có quyền tạo Table cho Restaurant này.");
  }

  // Kiểm tra giá
  if (price === undefined || price < 0) {
    throw new Error("Price phải là số không âm và bắt buộc.");
  }
  if (
    discountPrice !== undefined &&
    (discountPrice < 0 || discountPrice >= price)
  ) {
    throw new Error("Discount Price phải là số không âm và nhỏ hơn Price.");
  }

  // Kiểm tra danh sách tiện ích
  if (facilities) {
    for (const facilityID of facilities) {
      const facility = await Facility.findById(facilityID);
      if (!facility) {
        throw new Error(`Facility ID không tồn tại: ${facilityID}`);
      }
    }
  }

  // Tạo Table mới
  const newTable = new Table({
    tableID,
    restaurantID,
    tableType,
    availableDate,
    price,
    discountPrice,
    active: active ?? true, // Nếu không cung cấp, mặc định là true
    picture: picturePath,
    facilities, // Lưu danh sách tiện ích
  });

  return await newTable.save();
};
// Lấy tất cả Tables
const getAllTables = async () => {
  return await Table.find().populate("restaurantID", "restaurantName");
};

// Lấy Table theo ID
const getTableById = async (id) => {
  return await Table.findById(id).populate("restaurantID", "restaurantName");
};

// Cập nhật Table
const updateTableById = async (id, tableData) => {
  const table = await Table.findById(id);
  if (!table) throw new Error("Table not found");

  Object.assign(table, tableData);
  return await table.save();
};

// Xóa Table
const deleteTableById = async (id) => {
  const table = await Table.findById(id);
  if (!table) throw new Error("Table not found");

  return await table.remove();
};

module.exports = {
  createTable,
  getAllTables,
  getTableById,
  updateTableById,
  deleteTableById,
};
