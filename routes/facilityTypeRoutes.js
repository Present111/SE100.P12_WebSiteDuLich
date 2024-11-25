const express = require("express");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const facilityTypeService = require("../services/facilityTypeService");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: FacilityTypes
 *   description: API quản lý loại tiện nghi
 */

// CREATE - Tạo mới loại tiện nghi
/**
 * @swagger
 * /api/facility-types:
 *   post:
 *     summary: Tạo mới loại tiện nghi
 *     tags: [FacilityTypes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               facilityTypeID:
 *                 type: string
 *                 example: F001
 *               name:
 *                 type: string
 *                 example: Wifi miễn phí
 *               serviceType:
 *                 type: string
 *                 enum: [hotel, restaurant, cafe]
 *                 example: hotel
 *     responses:
 *       201:
 *         description: FacilityType created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["Admin"]),
  [
    body("facilityTypeID")
      .notEmpty()
      .withMessage("FacilityType ID is required"),
    body("name").notEmpty().withMessage("Name is required"),
    body("serviceType")
      .isIn(["hotel", "restaurant", "cafe"])
      .withMessage("Invalid service type"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newFacilityType = await facilityTypeService.createFacilityType(
        req.body
      );
      res
        .status(201)
        .json({
          message: "FacilityType created successfully",
          data: newFacilityType,
        });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ALL - Lấy danh sách loại tiện nghi
/**
 * @swagger
 * /api/facility-types:
 *   get:
 *     summary: Lấy danh sách tất cả loại tiện nghi
 *     tags: [FacilityTypes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách loại tiện nghi
 *       500:
 *         description: Server error
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const facilityTypes = await facilityTypeService.getAllFacilityTypes();
    res.status(200).json(facilityTypes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE - Lấy chi tiết loại tiện nghi
/**
 * @swagger
 * /api/facility-types/{id}:
 *   get:
 *     summary: Lấy thông tin một loại tiện nghi
 *     tags: [FacilityTypes]
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
 *         description: Thông tin loại tiện nghi
 *       404:
 *         description: FacilityType not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const facilityType = await facilityTypeService.getFacilityTypeById(
      req.params.id
    );
    if (!facilityType)
      return res.status(404).json({ error: "FacilityType not found" });
    res.status(200).json(facilityType);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE - Cập nhật loại tiện nghi
/**
 * @swagger
 * /api/facility-types/{id}:
 *   put:
 *     summary: Cập nhật thông tin loại tiện nghi
 *     tags: [FacilityTypes]
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
 *               name:
 *                 type: string
 *                 example: Hồ bơi
 *               serviceType:
 *                 type: string
 *                 enum: [hotel, restaurant, cafe]
 *                 example: restaurant
 *     responses:
 *       200:
 *         description: FacilityType updated successfully
 *       404:
 *         description: FacilityType not found
 *       500:
 *         description: Server error
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updatedFacilityType =
      await facilityTypeService.updateFacilityTypeById(req.params.id, req.body);
    res
      .status(200)
      .json({
        message: "FacilityType updated successfully",
        data: updatedFacilityType,
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Xóa loại tiện nghi
/**
 * @swagger
 * /api/facility-types/{id}:
 *   delete:
 *     summary: Xóa một loại tiện nghi
 *     tags: [FacilityTypes]
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
 *         description: FacilityType deleted successfully
 *       404:
 *         description: FacilityType not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await facilityTypeService.deleteFacilityTypeById(req.params.id);
    res.status(200).json({ message: "FacilityType deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
