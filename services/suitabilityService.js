const Suitability = require("../models/Suitability");

// Tạo mục phù hợp mới
const createSuitability = async (suitabilityData) => {
  const newSuitability = new Suitability(suitabilityData);
  return await newSuitability.save();
};

// Lấy tất cả mục phù hợp
const getAllSuitabilities = async () => {
  return await Suitability.find();
};

// Lấy mục phù hợp theo ID
const getSuitabilityById = async (id) => {
  return await Suitability.findById(id);
};

// Cập nhật mục phù hợp theo ID
const updateSuitabilityById = async (id, suitabilityData) => {
  const suitability = await Suitability.findById(id);
  if (!suitability) throw new Error("Suitability not found");

  Object.assign(suitability, suitabilityData);
  return await suitability.save();
};

// Xóa mục phù hợp theo ID
const deleteSuitabilityById = async (id) => {
  const suitability = await Suitability.findById(id);
  if (!suitability) throw new Error("Suitability not found");

  return await suitability.remove();
};

module.exports = {
  createSuitability,
  getAllSuitabilities,
  getSuitabilityById,
  updateSuitabilityById,
  deleteSuitabilityById,
};
