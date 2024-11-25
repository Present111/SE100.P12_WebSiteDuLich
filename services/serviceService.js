const Service = require("../models/Service");
const FacilityType = require("../models/FacilityType");
const PriceCategory = require("../models/PriceCategory");
const Suitability = require("../models/Suitability");
const Review = require("../models/Review");

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
    reviews,
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

  // Kiểm tra đánh giá
  if (reviews) {
    for (const reviewID of reviews) {
      const review = await Review.findById(reviewID);
      if (!review) throw new Error(`Review not found: ${reviewID}`);
    }
  }

  // Tạo Service mới
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
    reviews,
  });

  return await newService.save();
};

/**
 * Lấy tất cả các Service
 * @returns {Array} - Danh sách Services
 */
const getAllServices = async () => {
  return await Service.find()
    .populate("facilities", "facilityTypeID name")
    .populate("priceCategories", "priceCategoryID cheap midRange luxury")
    .populate("suitability", "suitabilityID name")
    .populate(
      "reviews",
      "reviewID userID positiveComment negativeComment stars date"
    );
};

/**
 * Lấy thông tin chi tiết Service theo ID
 * @param {String} id - ID của Service
 * @returns {Object|null} - Service hoặc null nếu không tìm thấy
 */
const getServiceById = async (id) => {
  return await Service.findById(id)
    .populate("facilities", "facilityTypeID name")
    .populate("priceCategories", "priceCategoryID cheap midRange luxury")
    .populate("suitability", "suitabilityID name")
    .populate(
      "reviews",
      "reviewID userID positiveComment negativeComment stars date"
    );
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
  if (user.role !== "Admin" && user.id !== service.providerID.toString()) {
    throw new Error("Access denied");
  }

  await service.remove();
  return true;
};

/**
 * Kiểm tra tính hợp lệ của các Facility IDs
 * @param {Array} facilityIDs - Mảng ID tiện nghi
 * @returns {Array} - Mảng ID không hợp lệ
 */
const validateFacilityIDs = async (facilityIDs) => {
  const invalidIDs = [];
  for (const id of facilityIDs) {
    const facility = await FacilityType.findById(id);
    if (!facility) invalidIDs.push(id);
  }
  return invalidIDs;
};

/**
 * Kiểm tra tính hợp lệ của các PriceCategory IDs
 * @param {Array} priceCategoryIDs - Mảng ID bảng giá
 * @returns {Array} - Mảng ID không hợp lệ
 */
const validatePriceCategoryIDs = async (priceCategoryIDs) => {
  const invalidIDs = [];
  for (const id of priceCategoryIDs) {
    const priceCategory = await PriceCategory.findById(id);
    if (!priceCategory) invalidIDs.push(id);
  }
  return invalidIDs;
};

/**
 * Kiểm tra tính hợp lệ của các Suitability IDs
 * @param {Array} suitabilityIDs - Mảng ID mục phù hợp
 * @returns {Array} - Mảng ID không hợp lệ
 */
const validateSuitabilityIDs = async (suitabilityIDs) => {
  const invalidIDs = [];
  for (const id of suitabilityIDs) {
    const suitability = await Suitability.findById(id);
    if (!suitability) invalidIDs.push(id);
  }
  return invalidIDs;
};

/**
 * Kiểm tra tính hợp lệ của các Review IDs
 * @param {Array} reviewIDs - Mảng ID đánh giá
 * @returns {Array} - Mảng ID không hợp lệ
 */
const validateReviewIDs = async (reviewIDs) => {
  const invalidIDs = [];
  for (const id of reviewIDs) {
    const review = await Review.findById(id);
    if (!review) invalidIDs.push(id);
  }
  return invalidIDs;
};

module.exports = {
  createService,
  getAllServices,
  getServiceById,
  deleteServiceById,
  validateFacilityIDs,
  validatePriceCategoryIDs,
  validateSuitabilityIDs,
  validateReviewIDs,
};
