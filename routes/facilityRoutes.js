const express = require("express");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const facilityService = require("../services/facilityService");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Facilities
 *   description: API quản lý Facilities
 */

// CREATE - Tạo mới Facility
/**
 * @swagger
 * /api/facility:
 *   post:
 *     summary: Tạo mới một Facility (Chỉ Admin)
 *     tags: [Facilities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               facilityID:
 *                 type: string
 *                 example: F001
 *               name:
 *                 type: string
 *                 example: Wifi
 *               serviceType:
 *                 type: string
 *                 enum: [Room, Table]
 *                 example: Room
 *     responses:
 *       201:
 *         description: Facility created successfully
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
    body("facilityID").notEmpty().withMessage("Facility ID is required"),
    body("name").notEmpty().withMessage("Name is required"),
    body("serviceType")
      .isIn(["Room", "Table"])
      .withMessage("ServiceType must be either 'Room' or 'Table'"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newFacility = await facilityService.createFacility(req.body);
      res
        .status(201)
        .json({ message: "Facility created successfully", data: newFacility });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ALL - Lấy danh sách Facilities
/**
 * @swagger
 * /api/facility:
 *   get:
 *     summary: Lấy danh sách tất cả Facilities
 *     tags: [Facilities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách Facilities
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res) => {
  try {
    const facilities = await facilityService.getAllFacilities();
    res.status(200).json(facilities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE - Lấy chi tiết Facility theo ID
/**
 * @swagger
 * /api/facility/{id}:
 *   get:
 *     summary: Lấy thông tin một Facility
 *     tags: [Facilities]
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
 *         description: Thông tin Facility
 *       404:
 *         description: Facility not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const facility = await facilityService.getFacilityById(req.params.id);
    if (!facility) return res.status(404).json({ error: "Facility not found" });
    res.status(200).json(facility);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE - Cập nhật Facility
/**
 * @swagger
 * /api/facility/{id}:
 *   put:
 *     summary: Cập nhật thông tin một Facility
 *     tags: [Facilities]
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
 *                 example: Free Wifi
 *               serviceType:
 *                 type: string
 *                 enum: [Room, Table]
 *                 example: Room
 *     responses:
 *       200:
 *         description: Facility updated successfully
 *       404:
 *         description: Facility not found
 *       500:
 *         description: Server error
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      const updatedFacility = await facilityService.updateFacilityById(
        req.params.id,
        req.body
      );
      res.status(200).json({
        message: "Facility updated successfully",
        data: updatedFacility,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// DELETE - Xóa Facility
/**
 * @swagger
 * /api/facility/{id}:
 *   delete:
 *     summary: Xóa một Facility
 *     tags: [Facilities]
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
 *         description: Facility deleted successfully
 *       404:
 *         description: Facility not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      await facilityService.deleteFacilityById(req.params.id);
      res.status(200).json({ message: "Facility deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);


/**
 * @swagger
 * /api/facility/service-type/{serviceType}:
 *   get:
 *     summary: Lấy danh sách Facilities theo loại dịch vụ (serviceType)
 *     tags: [Facilities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: serviceType
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Room, Table]
 *           example: Room
 *     responses:
 *       200:
 *         description: Danh sách Facilities theo loại dịch vụ
 *       404:
 *         description: Không tìm thấy Facilities
 *       500:
 *         description: Server error
 */
router.get("/service-type/:serviceType", async (req, res) => {
  try {
    const { serviceType } = req.params;
    if (!["Room", "Table"].includes(serviceType)) {
      return res
        .status(400)
        .json({ error: "Invalid serviceType. Must be 'Room' or 'Table'." });
    }

    const facilities = await facilityService.getFacilitiesByServiceType(
      serviceType
    );
    if (facilities.length === 0) {
      return res.status(404).json({ message: "No facilities found" });
    }

    res.status(200).json(facilities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


