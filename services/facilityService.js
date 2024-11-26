const Facility = require("../models/Facility");

// Tạo Facility mới
const createFacility = async (facilityData) => {
  const newFacility = new Facility(facilityData);
  return await newFacility.save();
};

// Lấy tất cả Facilities
const getAllFacilities = async () => {
  return await Facility.find();
};

// Lấy Facility theo ID
const getFacilityById = async (id) => {
  return await Facility.findById(id);
};

// Cập nhật Facility
const updateFacilityById = async (id, facilityData) => {
  const facility = await Facility.findById(id);
  if (!facility) throw new Error("Facility not found");

  Object.assign(facility, facilityData);
  return await facility.save();
};

// Xóa Facility
const deleteFacilityById = async (id) => {
  const facility = await Facility.findById(id);
  if (!facility) throw new Error("Facility not found");

  return await facility.remove();
};

module.exports = {
  createFacility,
  getAllFacilities,
  getFacilityById,
  updateFacilityById,
  deleteFacilityById,
};
