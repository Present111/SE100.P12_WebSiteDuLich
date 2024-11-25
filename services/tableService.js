const Table = require("../models/Table");
const Restaurant = require("../models/Restaurant");

// Tạo Table mới
const createTable = async (tableData, user, picturePath) => {
  const { tableID, restaurantID, tableType, availableDate, active } = tableData;

  const restaurant = await Restaurant.findById(restaurantID);
  if (!restaurant) throw new Error("Restaurant ID không tồn tại.");

  if (user.role === "Provider" && user.id !== restaurant.serviceID.providerID) {
    throw new Error("Bạn không có quyền tạo Table cho Restaurant này.");
  }

  const newTable = new Table({
    tableID,
    restaurantID,
    tableType,
    availableDate,
    active: active ?? true,
    picture: picturePath,
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
