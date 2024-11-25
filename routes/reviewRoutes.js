const express = require("express");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const reviewService = require("../services/reviewService");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: API quản lý đánh giá
 */

// CREATE - Tạo mới đánh giá
/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Tạo mới đánh giá
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reviewID:
 *                 type: string
 *                 example: R001
 *               userID:
 *                 type: string
 *                 example: 64f6b3c9e3a1a4321f2c1a8b
 *               positiveComment:
 *                 type: string
 *                 example: "Phòng sạch sẽ, tiện nghi"
 *               negativeComment:
 *                 type: string
 *                 example: "Giá hơi cao"
 *               stars:
 *                 type: number
 *                 example: 4
 *               targetID:
 *                 type: string
 *                 example: 64f6b3c9e3a1a4321f2c1a8b
 *               targetModel:
 *                 type: string
 *                 enum: [Room, Table]
 *                 example: Room
 *               serviceID:
 *                 type: string
 *                 example: 64f6b3c9e3a1a4321f2c1a8b
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  authMiddleware,
  [
    body("reviewID").notEmpty().withMessage("Review ID is required"),
    body("userID").isMongoId().withMessage("User ID must be a valid MongoID"),
    body("stars")
      .isInt({ min: 1, max: 5 })
      .withMessage("Stars must be between 1 and 5"),
    body("targetID")
      .isMongoId()
      .withMessage("Target ID must be a valid MongoID"),
    body("targetModel")
      .isIn(["Room", "Table"])
      .withMessage("Target model must be 'Room' or 'Table'"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newReview = await reviewService.createReview(req.body);
      res
        .status(201)
        .json({ message: "Review created successfully", data: newReview });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ALL - Lấy danh sách đánh giá
/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Lấy danh sách tất cả đánh giá
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách đánh giá
 *       500:
 *         description: Server error
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const reviews = await reviewService.getAllReviews();
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE - Lấy chi tiết đánh giá
/**
 * @swagger
 * /api/reviews/{id}:
 *   get:
 *     summary: Lấy thông tin một đánh giá
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: 64f6b3c9e3a1a4321f2c1a8b
 *     responses:
 *       200:
 *         description: Thông tin đánh giá
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const review = await reviewService.getReviewById(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });
    res.status(200).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE - Cập nhật đánh giá
/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     summary: Cập nhật thông tin một đánh giá
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: 64f6b3c9e3a1a4321f2c1a8b
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               positiveComment:
 *                 type: string
 *                 example: "Dịch vụ tuyệt vời"
 *               negativeComment:
 *                 type: string
 *                 example: "Thời gian chờ lâu"
 *               stars:
 *                 type: number
 *                 example: 5
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updatedReview = await reviewService.updateReviewById(
      req.params.id,
      req.body
    );
    res
      .status(200)
      .json({ message: "Review updated successfully", data: updatedReview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Xóa đánh giá
/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Xóa một đánh giá
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: 64f6b3c9e3a1a4321f2c1a8b
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await reviewService.deleteReviewById(req.params.id);
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
