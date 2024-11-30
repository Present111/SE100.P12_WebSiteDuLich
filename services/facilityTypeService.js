const FacilityType = require("../models/FacilityType");

// Tạo loại tiện nghi mới
const createFacilityType = async (facilityTypeData) => {
  const newFacilityType = new FacilityType(facilityTypeData);
  return await newFacilityType.save();
};

// Lấy tất cả loại tiện nghi
const getAllFacilityTypes = async () => {
  return await FacilityType.find();
};

// Lấy loại tiện nghi theo ID
const getFacilityTypeById = async (id) => {
  return await FacilityType.findById(id);
};

// Lấy các tiện nghi theo `serviceType`
const getFacilityTypesByServiceType = async (serviceType) => {
  return await FacilityType.findByServiceType(serviceType);
};

// Cập nhật loại tiện nghi theo ID
const updateFacilityTypeById = async (id, facilityTypeData) => {
  const facilityType = await FacilityType.findById(id);
  if (!facilityType) throw new Error("FacilityType not found");

  Object.assign(facilityType, facilityTypeData);
  return await facilityType.save();
};

// Xóa loại tiện nghi theo ID
const deleteFacilityTypeById = async (id) => {
  const facilityType = await FacilityType.findById(id);
  if (!facilityType) throw new Error("FacilityType not found");

  return await facilityType.remove();
};

module.exports = {
  createFacilityType,
  getAllFacilityTypes,
  getFacilityTypeById,
  getFacilityTypesByServiceType, // Export chức năng mới
  updateFacilityTypeById,
  deleteFacilityTypeById,
};
