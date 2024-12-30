const express = require("express");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const hotelService = require("../services/hotelService");
const Hotel = require("../models/Hotel");
const Service = require("../models/Service");
const Room = require("../models/Room");
const Location = require("../models/Location");
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
    const {hotel,rooms} = await hotelService.getHotelById1(req.params.id);

    

    // Trả về thông tin chi tiết khách sạn, dịch vụ và vị trí
    res.status(200).json({
      hotel,rooms
      
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

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (degree) => (degree * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371 * c; // Earth radius in kilometers
};
router.post("/filter", async (req, res) => {
  try {
    const {
      priceCategories = [],
      suitabilities = [],
      facilities = [],
      facilityTypes = [],
      hotelTypes = [],
      latitude,
      longitude,
      distance,
      dates = [],
      capacity = null,
    } = req.body;
console.log(capacity)
    // Helper to parse parameters into arrays
    const parseArray = (param) => (Array.isArray(param) ? param : param.split(","));
    const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

    const parsedPriceCategories = parseArray(priceCategories).filter(isValidObjectId);
    const parsedSuitabilities = parseArray(suitabilities).filter(isValidObjectId);
    const parsedFacilities = parseArray(facilities).filter(isValidObjectId);
    const parsedFacilityTypes = parseArray(facilityTypes).filter(isValidObjectId);
    const parsedHotelTypes = parseArray(hotelTypes).filter(isValidObjectId);

    const hotelFilters = [];

    if (parsedHotelTypes.length) {
      hotelFilters.push({ hotelTypeID: { $in: parsedHotelTypes } });
    }

    let serviceFilters = {};
    if (parsedFacilityTypes.length) serviceFilters.facilities = { $all: parsedFacilityTypes };
    if (parsedPriceCategories.length) serviceFilters.priceCategories = { $all: parsedPriceCategories };
    if (parsedSuitabilities.length) serviceFilters.suitability = { $all: parsedSuitabilities };

    if (Object.keys(serviceFilters).length) {
      const services = await Service.find(serviceFilters).select("_id");
      const serviceIDs = services.map((service) => service._id);

      if (serviceIDs.length) {
        hotelFilters.push({ serviceID: { $in: serviceIDs } });
      } else {
        return res.status(200).json([]);
      }
    }

    if (parsedFacilities.length) {
      
      const rooms = await Room.find({ facilities: { $all: parsedFacilities } , capacity:  { $all: capacity } }).select("hotelID");
      console.log(rooms)
      const hotelIDs = rooms.map((room) => room.hotelID);

      if (hotelIDs.length) {
        hotelFilters.push({ _id: { $in: hotelIDs } });
      } else {
        return res.status(200).json([]);
      }
    }
    else{
      const rooms = await Room.find({  capacity:  capacity  }).select("hotelID");
      console.log(rooms)
      const hotelIDs = rooms.map((room) => room.hotelID);

      if (hotelIDs.length) {
        hotelFilters.push({ _id: { $in: hotelIDs } });
      } else {
        return res.status(200).json([]);
      }
    }

    

    if (latitude && longitude && distance) {
      if (
        typeof latitude !== "number" ||
        typeof longitude !== "number" ||
        typeof distance !== "number" ||
        distance <= 0
      ) {
        return res.status(400).json({ error: "Invalid latitude, longitude, or distance" });
      }

      const locations = await Location.find();
      const nearbyLocations = locations.filter((location) => {
        const distanceToCenter = haversineDistance(
          latitude,
          longitude,
          location.latitude,
          location.longitude
        );
        return distanceToCenter <= distance;
      });

      if (!nearbyLocations.length) {
        return res.status(200).json([]);
      }

      const locationIDs = nearbyLocations.map((loc) => loc._id);
      const servicesNearby = await Service.find({ locationID: { $in: locationIDs } }).select("_id");
      const serviceIDsNearby = servicesNearby.map((service) => service._id);

      if (serviceIDsNearby.length) {
        hotelFilters.push({ serviceID: { $in: serviceIDsNearby } });
      } else {
        return res.status(200).json([]);
      }
    }

    const finalFilter = hotelFilters.length > 1 ? { $and: hotelFilters } : hotelFilters[0] || {};

    const hotels = await Hotel.find(finalFilter)
      .populate({
        path: "serviceID",
        populate: [
          { path: "locationID", model: "Location" },
          { path: "facilities", model: "FacilityType" },
          { path: "priceCategories", model: "PriceCategory" },
          { path: "suitability", model: "Suitability" },
        ],
      })
      .populate("hotelTypeID", "type")
      .exec();

    const enrichedHotels = await Promise.all(
  hotels.map(async (hotel) => {
    const rooms = await Room.find({ hotelID: hotel._id });

    let lowestDiscountPrice = Infinity;
    let correspondingPrice = null;

    rooms.forEach((room) => {
      if (room.discountPrice && room.discountPrice < lowestDiscountPrice) {
        lowestDiscountPrice = room.discountPrice;
        correspondingPrice = room.price; // Giá gốc tương ứng với discount thấp nhất
      }
    });

    const distanceToHotel =
      latitude && longitude
        ? haversineDistance(latitude, longitude, hotel.serviceID.locationID.latitude, hotel.serviceID.locationID.longitude)
        : null;

    return {
      ...hotel.toObject(),
      lowestDiscountPrice: lowestDiscountPrice < Infinity ? lowestDiscountPrice : null,
      correspondingPrice: correspondingPrice, // Giá gốc tương ứng với discount thấp nhất
      distance: distanceToHotel,
      rooms: rooms 
    };
  })
);


    res.status(200).json(enrichedHotels);
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});








/**
 * @swagger
 * /api/hotels/nearby:
 *   post:
 *     summary: Tìm khách sạn trong bán kính từ một tọa độ
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
 *               latitude:
 *                 type: number
 *                 example: 10.862865
 *               longitude:
 *                 type: number
 *                 example: 106.7594136
 *               distance:
 *                 type: number
 *                 example: 3
 *     responses:
 *       200:
 *         description: Danh sách khách sạn trong bán kính
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Lỗi xác thực dữ liệu đầu vào
 *       500:
 *         description: Lỗi hệ thống
 */
router.post("/nearby", async (req, res) => {
  const { latitude, longitude, distance } = req.body;

  // Kiểm tra đầu vào
  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    typeof distance !== "number" ||
    distance <= 0
  ) {
    return res
      .status(400)
      .json({ error: "Invalid latitude, longitude, or distance" });
  }

  try {
    // Bán kính Trái Đất theo km
    const EARTH_RADIUS_KM = 6371;

    // Công thức Haversine để tính khoảng cách giữa hai điểm
    const haversineDistance = (lat1, lon1, lat2, lon2) => {
      const toRad = (degree) => (degree * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return EARTH_RADIUS_KM * c; // Trả về khoảng cách theo km
    };

    // Tìm các địa điểm trong bán kính
    const locations = await Location.find({
      locationID: { $exists: true },
    });

    // Lọc các địa điểm trong bán kính
    const nearbyLocations = locations.filter((location) => {
      const distanceToCenter = haversineDistance(latitude, longitude, location.latitude, location.longitude);
      return distanceToCenter <= distance;  // Nếu khoảng cách nhỏ hơn hoặc bằng bán kính, là địa điểm trong bán kính
    });

    if (!nearbyLocations.length) {
      return res.status(200).json([]);  // Trả về danh sách rỗng nếu không tìm thấy địa điểm
    }

    // Lấy danh sách hotel liên quan đến các location tìm thấy
    const locationIDs = nearbyLocations.map((loc) => loc._id);
    const hotels = await Hotel.find({
      serviceID: { $in: await Service.find({ locationID: { $in: locationIDs } }).select("_id") },
    }).populate({
      path: "serviceID",
      populate: {
        path: "locationID",
        model: "Location",
      },
    });

    // Tính toán khoảng cách từ tọa độ trung tâm đến mỗi khách sạn
    const hotelsWithDistance = hotels.map((hotel) => {
      const hotelLocation = hotel.serviceID.locationID;
      const distanceToHotel = haversineDistance(latitude, longitude, hotelLocation.latitude, hotelLocation.longitude);
      return {
        ...hotel.toObject(),  // Chuyển object khách sạn thành object thuần
        distanceToCenter: distanceToHotel,  // Thêm khoảng cách
      };
    });

    // Trả kết quả
    res.status(200).json(hotelsWithDistance);
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});



module.exports = router;



