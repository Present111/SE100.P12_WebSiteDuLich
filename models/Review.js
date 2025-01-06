const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  reviewID: { type: String, required: true, unique: true }, // ID đánh giá
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ID user
  positiveComment: { type: String, default: "" }, // Nhận xét tích cực
  negativeComment: { type: String, default: "" }, // Nhận xét tiêu cực
  stars: { type: Number, required: true, min: 1, max: 5 }, // Số sao (1-5)
  date: { type: Date, default: Date.now }, // Ngày đánh giá
  targetID: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "targetModel",
    required: true,
  }, // ID Room hoặc Table
  
});

module.exports = mongoose.model("Review", reviewSchema);
