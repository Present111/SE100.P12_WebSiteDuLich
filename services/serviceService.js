const Service = require("../models/Service");
const FacilityType = require("../models/FacilityType");
const PriceCategory = require("../models/PriceCategory");
const Suitability = require("../models/Suitability");

/**
 * Tạo một Service mới
 * @param {Object} serviceData - Dữ liệu từ request body
 * @returns {Object} - Service vừa tạo
 */
const createService = async (serviceData) => {
  const {
    serviceID,
    providerID,
    locationID,
    serviceName,
    price,
    discountPrice,
    description,
    status,
    facilities,
    priceCategories,
    suitability,
  } = serviceData;

  // Kiểm tra tiện nghi
  if (facilities) {
    for (const facilityID of facilities) {
      const facility = await FacilityType.findById(facilityID);
      if (!facility) throw new Error(`FacilityType not found: ${facilityID}`);
    }
  }

  // Kiểm tra bảng giá
  if (priceCategories) {
    for (const priceCategoryID of priceCategories) {
      const priceCategory = await PriceCategory.findById(priceCategoryID);
      if (!priceCategory)
        throw new Error(`PriceCategory not found: ${priceCategoryID}`);
    }
  }

  // Kiểm tra mục phù hợp
  if (suitability) {
    for (const suitabilityID of suitability) {
      const suitable = await Suitability.findById(suitabilityID);
      if (!suitable) throw new Error(`Suitability not found: ${suitabilityID}`);
    }
  }

  // Tạo service
  const newService = new Service({
    serviceID,
    providerID,
    locationID,
    serviceName,
    price,
    discountPrice,
    description,
    status,
    facilities,
    priceCategories,
    suitability,
  });

  return await newService.save();
};

/**
 * Lấy tất cả các Service
 * @returns {Array} - Danh sách Services
 */
const getAllServices = async () => {
  return await Service.find();
};

/**
 * Lấy thông tin chi tiết Service theo ID
 * @param {String} id - ID của Service
 * @returns {Object|null} - Service hoặc null nếu không tìm thấy
 */
const getServiceById = async (id) => {
  return await Service.findById(id);
};

/**
 * Xóa một Service theo ID
 * @param {String} id - ID của Service
 * @param {Object} user - Người dùng đang thực hiện
 * @returns {Boolean} - Kết quả xóa
 */
const deleteServiceById = async (id, user) => {
  const service = await Service.findById(id);

  if (!service) {
    throw new Error("Service not found");
  }

  // Chỉ Admin hoặc Provider sở hữu Service được phép xóa
  if (user.role !== "Admin" && user.id !== service.providerID) {
    throw new Error("Access denied");
  }

  await service.remove();
  return true;
};

module.exports = {
  createService,
  getAllServices,
  getServiceById,
  deleteServiceById,
};
