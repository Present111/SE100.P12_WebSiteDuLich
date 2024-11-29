const PriceCategory = require("../models/PriceCategory");

/**
 * Tạo mới một bảng giá
 * @param {Object} priceCategoryData - Dữ liệu của bảng giá
 * @returns {Object} - Bảng giá mới được tạo
 */
const createPriceCategory = async (priceCategoryData) => {
  const { type } = priceCategoryData;

  // Kiểm tra bảng giá đã tồn tại hay chưa
  const existingPriceCategory = await PriceCategory.findOne({ type });
  if (existingPriceCategory) {
    throw new Error(`Bảng giá '${type}' đã tồn tại.`);
  }

  // Tạo mới bảng giá
  const newPriceCategory = new PriceCategory({ type });
  return await newPriceCategory.save();
};

/**
 * Lấy tất cả các bảng giá
 * @returns {Array} - Danh sách bảng giá
 */
const getAllPriceCategories = async () => {
  return await PriceCategory.find();
};

/**
 * Lấy chi tiết bảng giá theo type
 * @param {String} type - Type của bảng giá (cheap, midRange, luxury)
 * @returns {Object|null} - Bảng giá hoặc null nếu không tìm thấy
 */
const getPriceCategoryByType = async (type) => {
  return await PriceCategory.findOne({ type });
};

/**
 * Xóa bảng giá theo type
 * @param {String} type - Type của bảng giá cần xóa
 * @returns {Boolean} - Trả về true nếu xóa thành công, lỗi nếu không
 */
const deletePriceCategoryByType = async (type) => {
  const priceCategory = await PriceCategory.findOne({ type });

  if (!priceCategory) {
    throw new Error(`Không tìm thấy bảng giá với type '${type}'`);
  }

  await priceCategory.remove();
  return true;
};

module.exports = {
  createPriceCategory,
  getAllPriceCategories,
  getPriceCategoryByType,
  deletePriceCategoryByType,
};
