const express = require("express");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const hotelService = require("../services/hotelService");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Hotels
 *   description: API quản lý Hotels
 */

// CREATE - Tạo mới Hotel
/**
 * @swagger
 * /api/hotels:
 *   post:
 *     summary: Tạo mới một Hotel (Chỉ Provider)
 *     tags: [Hotels]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hotelID:
 *                 type: string
 *                 example: H001
 *               serviceID:
 *                 type: string
 *                 example: S001
 *               starRating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4.5
 *               hotelTypeID:
 *                 type: string
 *                 example: 64f6b3c9e3a1a4321f2c1a8b
 *     responses:
 *       201:
 *         description: Hotel created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["Provider"]),
  [
    body("hotelID").notEmpty().withMessage("Hotel ID is required"),
    body("serviceID").notEmpty().withMessage("Service ID is required"),
    body("starRating")
      .isNumeric()
      .withMessage("Star Rating must be a number")
      .isFloat({ min: 1, max: 5 })
      .withMessage("Star Rating must be between 1 and 5"),
    body("hotelTypeID")
      .notEmpty()
      .withMessage("Hotel Type ID is required")
      .isMongoId()
      .withMessage("Hotel Type ID must be a valid Mongo ID"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { hotelID, serviceID, starRating, hotelTypeID } = req.body;

      const newHotel = await hotelService.createHotel(
        { hotelID, serviceID, starRating, hotelTypeID },
        req.user
      );
      res
        .status(201)
        .json({ message: "Hotel created successfully", data: newHotel });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ ALL - Lấy danh sách Hotels
/**
 * @swagger
 * /api/hotels:
 *   get:
 *     summary: Lấy danh sách tất cả Hotels
 *     tags: [Hotels]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách Hotels
 *       500:
 *         description: Server error
 */
router.get(
  "/",

  async (req, res) => {
    try {
    // Tìm tất cả Hotel, populate serviceID và locationID
    const hotels = await hotelService.getAllHotelsWithDetails();

    // Trả về dữ liệu
    res.status(200).json(hotels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  }
);

// READ ONE - Lấy chi tiết Hotel
/**
 * @swagger
 * /api/hotels/{id}:
 *   get:
 *     summary: Lấy thông tin một Hotel
 *     tags: [Hotels]
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
 *         description: Thông tin Hotel
 *       404:
 *         description: Hotel not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const hotel = await hotelService.getHotelById(req.params.id);
    if (!hotel) return res.status(404).json({ error: "Hotel not found" });
    res.status(200).json(hotel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Xóa Hotel
/**
 * @swagger
 * /api/hotels/{id}:
 *   delete:
 *     summary: Xóa một Hotel
 *     tags: [Hotels]
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
 *         description: Hotel deleted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Hotel not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await hotelService.deleteHotelById(req.params.id, req.user);
    res.status(200).json({ message: "Hotel deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE - Route mới để lấy thông tin Hotel với Service và Location
/**
 * @swagger
 * /api/hotels/details/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết của một Hotel với Service và Location
 *     tags: [Hotels]
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
 *         description: Thông tin chi tiết Hotel, Service và Location
 *       404:
 *         description: Hotel not found
 *       500:
 *         description: Server error
 */
router.get("/details/:id", async (req, res) => {
  try {
    // Lấy thông tin khách sạn theo ID và nạp các thông tin liên quan
    const hotel = await hotelService.getHotelById1(req.params.id);

    // Nếu không tìm thấy khách sạn
    if (!hotel) return res.status(404).json({ error: "Hotel not found" });

    // Trả về thông tin chi tiết khách sạn, dịch vụ và vị trí
    res.status(200).json({
      hotel,
      service: hotel.serviceID, // Dịch vụ của khách sạn
      location: hotel.serviceID.locationID, // Vị trí từ dịch vụ
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// READ ALL - Lấy thông tin chi tiết của tất cả Hotel với Service và Location
/**
 * @swagger
 * /api/hotels/details:
 *   get:
 *     summary: Lấy thông tin chi tiết của tất cả Hotels kèm Service và Location
 *     tags: [Hotels]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách chi tiết Hotels, Service và Location
 *       500:
 *         description: Server error
 */
router.get("/details", async (req, res) => {
  try {
    // Tìm tất cả Hotel, populate serviceID và locationID
    const hotels = await hotelService.getAllHotelsWithDetails();

    // Trả về dữ liệu
    res.status(200).json(hotels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/hotels/filter:
 *   get:
 *     summary: Lọc danh sách Hotels theo bộ lọc đa dạng
 *     tags: [Hotels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: priceCategories
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *           example: ["64f7d9275f3a4c001c9f7293", "64f7d9275f3a4c001c9f7294"]
 *         description: Mảng ObjectId của PriceCategory
 *       - in: query
 *         name: suitabilities
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *           example: ["64f7d9275f3a4c001c9f7295", "64f7d9275f3a4c001c9f7296"]
 *         description: Mảng ObjectId của Suitability
 *       - in: query
 *         name: facilities
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *           example: ["64f7d9275f3a4c001c9f7297", "64f7d9275f3a4c001c9f7298"]
 *         description: Mảng ObjectId của Facility
 *       - in: query
 *         name: facilityTypes
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *           example: ["64f7d9275f3a4c001c9f7299", "64f7d9275f3a4c001c9f7300"]
 *         description: Mảng ObjectId của FacilityType
 *       - in: query
 *         name: hotelTypes
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *           example: ["64f7d9275f3a4c001c9f7301", "64f7d9275f3a4c001c9f7302"]
 *         description: Mảng ObjectId của HotelType
 *     responses:
 *       200:
 *         description: Danh sách Hotels phù hợp
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   hotelID:
 *                     type: string
 *                     description: ID của Hotel
 *                   serviceID:
 *                     type: object
 *                     description: Chi tiết dịch vụ của Hotel
 *                   rooms:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         roomID:
 *                           type: string
 *                           description: ID của Room
 *                         facilities:
 *                           type: array
 *                           description: Danh sách tiện ích của Room
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/filter", async (req, res) => {
  try {
    const {
      priceCategories = [],
      suitabilities = [],
      facilities = [],
      facilityTypes = [],
      hotelTypes = [],
    } = req.query;

    // Chuyển tham số chuỗi thành mảng
    const priceCategoryArray = Array.isArray(priceCategories)
      ? priceCategories
      : priceCategories.split(",");
    const suitabilityArray = Array.isArray(suitabilities)
      ? suitabilities
      : suitabilities.split(",");
    const facilityArray = Array.isArray(facilities)
      ? facilities
      : facilities.split(",");
    const facilityTypeArray = Array.isArray(facilityTypes)
      ? facilityTypes
      : facilityTypes.split(",");
    const hotelTypeArray = Array.isArray(hotelTypes)
      ? hotelTypes
      : hotelTypes.split(",");

    // Bộ lọc cho Service
    const serviceFilters = {};
    if (priceCategoryArray.length > 0) {
      serviceFilters.priceCategories = { $in: priceCategoryArray };
    }
    if (suitabilityArray.length > 0) {
      serviceFilters.suitability = { $in: suitabilityArray };
    }

    // Bộ lọc cho Hotel
    const hotelFilters = {};
    if (hotelTypeArray.length > 0) {
      hotelFilters.hotelTypeID = { $in: hotelTypeArray };
    }

    // Bộ lọc cho Room
    const roomFilters = {};
    if (facilityArray.length > 0) {
      roomFilters.facilities = { $in: facilityArray };
    }
    if (facilityTypeArray.length > 0) {
      roomFilters["facilities.serviceType"] = { $in: facilityTypeArray };
    }

    // Query danh sách Hotels
    const hotels = await Hotel.find(hotelFilters)
      .populate({
        path: "serviceID",
        match: serviceFilters,
        populate: [
          { path: "priceCategories", model: "PriceCategory" },
          { path: "suitability", model: "Suitability" },
        ],
      })
      .populate("hotelTypeID", "type")
      .exec();

    // Query Rooms phù hợp từng Hotel
    const hotelWithRooms = await Promise.all(
      hotels.map(async (hotel) => {
        const rooms = await Room.find({ hotelID: hotel._id, ...roomFilters }).populate("facilities");
        return { ...hotel.toObject(), rooms };
      })
    );

    // Chỉ trả về Hotels có Rooms phù hợp
    const filteredHotels = hotelWithRooms.filter((hotel) => hotel.rooms.length > 0);

    res.status(200).json(filteredHotels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;


