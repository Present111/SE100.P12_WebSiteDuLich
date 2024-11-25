const Review = require("../models/Review");
const Service = require("../models/Service");

// Tạo đánh giá mới
const createReview = async (reviewData) => {
  const { targetID, targetModel, serviceID } = reviewData;

  // Kiểm tra tính hợp lệ của targetModel
  if (!["Room", "Table"].includes(targetModel)) {
    throw new Error("Invalid targetModel, must be 'Room' or 'Table'");
  }

  // Tạo đánh giá
  const newReview = new Review(reviewData);
  const savedReview = await newReview.save();

  // Liên kết đánh giá với Service
  if (serviceID) {
    const service = await Service.findById(serviceID);
    if (!service) {
      throw new Error("Service not found");
    }
    service.reviews.push(savedReview._id);
    await service.save();
  }

  return savedReview;
};

// Lấy tất cả đánh giá
const getAllReviews = async () => {
  return await Review.find()
    .populate("userID", "name email")
    .populate("targetID");
};

// Lấy đánh giá theo ID
const getReviewById = async (reviewID) => {
  return await Review.findById(reviewID)
    .populate("userID", "name email")
    .populate("targetID");
};

// Cập nhật đánh giá
const updateReviewById = async (reviewID, reviewData) => {
  const review = await Review.findById(reviewID);
  if (!review) {
    throw new Error("Review not found");
  }
  Object.assign(review, reviewData);
  return await review.save();
};

// Xóa đánh giá
const deleteReviewById = async (reviewID) => {
  const review = await Review.findById(reviewID);
  if (!review) {
    throw new Error("Review not found");
  }

  // Xóa khỏi Service
  await Service.updateMany(
    { reviews: reviewID },
    { $pull: { reviews: reviewID } }
  );

  return await review.remove();
};

module.exports = {
  createReview,
  getAllReviews,
  getReviewById,
  updateReviewById,
  deleteReviewById,
};
