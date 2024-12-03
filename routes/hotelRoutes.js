const express = require("express");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const hotelService = require("../services/hotelService");
const Hotel = require("../models/Hotel");
const Service = require("../models/Service");
const Room = require("../models/Room");
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
 *           example: 674c15f9128a1d2cc905039c
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
 *   post:
 *     summary: Lọc danh sách Hotels chỉ theo loại khách sạn (HotelType)
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
 *               priceCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: "Mảng ObjectId của PriceCategory"
 *                 example: [""]
 *               suitabilities:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: "Mảng ObjectId của Suitability"
 *                 example: [""]
 *               facilities:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: "Mảng ObjectId của Facility"
 *                 example: ["6748d61d7a0ec298a6836c75"]
 *               facilityTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: "Mảng ObjectId của FacilityType"
 *                 example: [""]
 *               hotelTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: "Mảng ObjectId của HotelType"
 *                 example: [""]
 *     responses:
 *       200:
 *         description: Danh sách Hotels phù hợp với loại khách sạn
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

router.post("/filter", async (req, res) => {
  try {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Request Body:`, req.body); 
    let { priceCategories = [], suitabilities = [], facilities = [], facilityTypes = [], hotelTypes = [] } = req.body;

    // Chuyển chuỗi thành mảng nếu cần
    const parseArray = (param) => (Array.isArray(param) ? param : param.split(","));
    priceCategories = parseArray(priceCategories);
    suitabilities = parseArray(suitabilities);
    facilities = parseArray(facilities);
    facilityTypes = parseArray(facilityTypes);
    hotelTypes = parseArray(hotelTypes);

    // Kiểm tra ObjectId hợp lệ
    const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

    // Lọc ObjectId hợp lệ
    priceCategories = priceCategories.filter(isValidObjectId);
    suitabilities = suitabilities.filter(isValidObjectId);
    facilities = facilities.filter(isValidObjectId);
    facilityTypes = facilityTypes.filter(isValidObjectId);
    hotelTypes = hotelTypes.filter(isValidObjectId);

    // Xây dựng bộ lọc cho Hotel
    const hotelFilters = {};
    if (hotelTypes.length) hotelFilters.hotelTypeID = { $in: hotelTypes };

    // Tìm Service IDs dựa trên tất cả các tiêu chí
    let serviceFilters = {};
    if (facilityTypes.length) serviceFilters.facilities = { $all: facilityTypes }; // $all: Thỏa mãn tất cả các facilityTypes
    if (priceCategories.length) serviceFilters.priceCategories = { $all: priceCategories }; // $all: Thỏa mãn tất cả các priceCategories
    if (suitabilities.length) serviceFilters.suitability = { $all: suitabilities }; // $all: Thỏa mãn tất cả các suitabilities

    if (Object.keys(serviceFilters).length) {
      const services = await Service.find(serviceFilters).select("_id");
      const serviceIDs = services.map((service) => service._id);

      // Chỉ áp dụng lọc Service nếu có kết quả
      if (serviceIDs.length) {
        hotelFilters.serviceID = { $in: serviceIDs };
      } else {
        // Không có service nào phù hợp => trả về mảng rỗng
        return res.status(200).json([]);
      }
    }

    // Thêm lọc Room dựa trên Facilities
    if (facilities.length) {
      const rooms = await Room.find({ facilities: { $all: facilities } }).select("hotelID");
      const hotelIDs = rooms.map((room) => room.hotelID);

      if (hotelIDs.length) {
        if (hotelFilters._id) {
          hotelFilters._id.$in = hotelFilters._id.$in.filter((id) => hotelIDs.includes(id));
        } else {
          hotelFilters._id = { $in: hotelIDs };
        }
      } else {
        // Không có Room nào phù hợp => trả về mảng rỗng
        return res.status(200).json([]);
      }
    }

    // Truy vấn Hotel với thông tin chi tiết
    const hotels = await Hotel.find(hotelFilters)
      .populate({
        path: "serviceID",
        populate: [
          { path: "locationID", model: "Location" }, // Populate Service -> Location
          { path: "facilities", model: "FacilityType" }, // Populate Service -> FacilityType
          { path: "priceCategories", model: "PriceCategory" }, // Populate Service -> PriceCategory
          { path: "suitability", model: "Suitability" }, // Populate Service -> Suitability
        ],
      })
      .populate("hotelTypeID", "type") // Populate HotelType
      .exec();

    res.status(200).json(hotels);
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;



