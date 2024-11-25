const PriceCategory = require("../models/PriceCategory");

// Tạo bảng giá mới
const createPriceCategory = async (priceCategoryData) => {
  const newPriceCategory = new PriceCategory(priceCategoryData);
  return await newPriceCategory.save();
};

// Lấy tất cả bảng giá
const getAllPriceCategories = async () => {
  return await PriceCategory.find();
};

// Lấy bảng giá theo ID
const getPriceCategoryById = async (id) => {
  return await PriceCategory.findById(id);
};

// Cập nhật bảng giá theo ID
const updatePriceCategoryById = async (id, priceCategoryData) => {
  const priceCategory = await PriceCategory.findById(id);
  if (!priceCategory) throw new Error("PriceCategory not found");

  Object.assign(priceCategory, priceCategoryData);
  return await priceCategory.save();
};

// Xóa bảng giá theo ID
const deletePriceCategoryById = async (id) => {
  const priceCategory = await PriceCategory.findById(id);
  if (!priceCategory) throw new Error("PriceCategory not found");

  return await priceCategory.remove();
};

module.exports = {
  createPriceCategory,
  getAllPriceCategories,
  getPriceCategoryById,
  updatePriceCategoryById,
  deletePriceCategoryById,
};
