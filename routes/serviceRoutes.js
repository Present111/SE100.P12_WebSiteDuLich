const express = require("express");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const serviceService = require("../services/serviceService");
const Service = require("../models/Service");
const Location = require("../models/Location");
const Hotel = require("../models/Hotel");
const Review = require("../models/Review");
const Invoice = require("../models/Invoice");
const Restaurant = require("../models/Restaurant");
const Coffee = require("../models/Coffee");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: API quản lý Services
 */

// CREATE - Tạo mới Service



router.get("/:serviceID/hotel", async (req, res) => {
  try {
    const { serviceID } = req.params;

    // Tìm Hotel dựa trên serviceID
    const hotel = await Hotel.findOne({ serviceID });

    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    res.status(200).json({ hotelID: hotel._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Tạo mới một Service (Chỉ Provider)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               serviceID:
 *                 type: string
 *                 example: S001
 *               providerID:
 *                 type: string
 *                 example: 64f6b3c9e3a1a4321f2c1a8b
 *               locationID:
 *                 type: string
 *                 example: 64f6b3c9e3a1a4321f2c1a8b
 *               serviceName:
 *                 type: string
 *                 example: Luxury Travel
 *               price:
 *                 type: number
 *                 example: 1000
 *               discountPrice:
 *                 type: number
 *                 example: 900
 *               description:
 *                 type: string
 *                 example: "Luxury travel package with discounts"
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *                 example: Active
 *               facilities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["64f6b3c9e3a1a4321f2c1a8b"]
 *               priceCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["64f6b3c9e3a1a4321f2c1a8b"]
 *               suitability:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["64f6b3c9e3a1a4321f2c1a8b"]
 *               reviews:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["64f6b3c9e3a1a4321f2c1a8b"]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 example: ["image1.jpg", "image2.jpg"]
 *     responses:
 *       201:
 *         description: Service created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
// router.post(
//   "/",
//   authMiddleware,
//   roleMiddleware(["Provider"]),
//   upload.array("images", 10), // Cho phép upload tối đa 10 ảnh
//   [
//     body("serviceID").notEmpty().withMessage("Service ID is required"),
//     body("providerID")
//       .isMongoId()
//       .withMessage("Provider ID must be a valid MongoID"),
//     body("locationID")
//       .isMongoId()
//       .withMessage("Location ID must be a valid MongoID"),
//     body("serviceName").notEmpty().withMessage("Service name is required"),
//     body("price").isNumeric().withMessage("Price must be a number"),
//     body("discountPrice")
//       .optional()
//       .isNumeric()
//       .withMessage("Discount Price must be a number"),
//     body("status").isIn(["Active", "Inactive"]).withMessage("Invalid status"),
//     body("facilities")
//       .optional()
//       .isArray()
//       .withMessage("Facilities must be an array of IDs"),
//     body("priceCategories")
//       .optional()
//       .isArray()
//       .withMessage("Price categories must be an array of IDs"),
//     body("suitability")
//       .optional()
//       .isArray()
//       .withMessage("Suitability must be an array of IDs"),
//     body("reviews")
//       .optional()
//       .isArray()
//       .withMessage("Reviews must be an array of IDs"),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     try {
//       const {
//         serviceID,
//         providerID,
//         locationID,
//         serviceName,
//         price,
//         discountPrice,
//         description,
//         status,
//         facilities,
//         priceCategories,
//         suitability,
//         reviews,
//       } = req.body;

//       // Lấy danh sách đường dẫn ảnh từ file upload
//       const images = req.files.map((file) => `/uploads/${file.filename}`);

//       // Tạo Service mới
//       const newService = await serviceService.createService({
//         serviceID,
//         providerID,
//         locationID,
//         serviceName,
//         price,
//         discountPrice,
//         description,
//         status,
//         facilities,
//         priceCategories,
//         suitability,
//         reviews,
//         images, // Lưu mảng ảnh
//       });

//       res
//         .status(201)
//         .json({ message: "Service created successfully", data: newService });
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   }
// );

// READ ALL - Lấy danh sách Services
/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Lấy danh sách tất cả Services
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách Services
 *       500:
 *         description: Server error
 */
router.get(
  "/",
  // authMiddleware,
  // roleMiddleware(["Admin", "Provider"]),
  async (req, res) => {
    try {
      const services = await serviceService.getAllServices();
      res.status(200).json(services);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.get("/:id/details", async (req, res) => {
  try {
    const { id } = req.params;

    // Find the service and populate the required fields
    const service = await Service.findById(id)
      .populate("suitability")
      .populate("facilities");

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Combine suitability and facilities into one array
    const combinedData = [
      ...service.suitability,
      ...service.facilities,
    ];

    res.json({
      service: {
        serviceID: service.serviceID,
        serviceName: service.serviceName,
        price: service.price,
        discountPrice: service.discountPrice,
        description: service.description,
        status: service.status,
        type: service.type,
        images: service.images,
      },
      combinedData, // Combined suitability and facilities
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// READ ONE - Lấy chi tiết Service
/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Lấy thông tin một Service
 *     tags: [Services]
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
 *         description: Thông tin Service
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    console.log("HELLO")
    const service = await serviceService.getServiceById(req.params.id);
    if (!service) return res.status(404).json({ error: "Service not found" });
    res.status(200).json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/restau/all", async (req, res) => {
  try {
    console.log("DIT");
    const restaurants = await Restaurant.find()
      .populate({
        path: "serviceID", // Populate the serviceID field
        populate: [
          { path: "providerID" }, // Populate provider information
          { path: "locationID" }, // Populate location information
          { path: "facilities" }, // Populate facilities for the service
          { path: "priceCategories" }, // Populate price categories
          { path: "suitability" }, // Populate suitability (if any)
        ]
      })
      .populate("cuisineTypeIDs") // Populate cuisine types
      .populate("dishes") // Populate dish types
      .populate("restaurantTypeID"); // Populate restaurant type

    console.log(restaurants); // Check the populated data here

    const coffees = await Coffee.find()
      .populate({
        path: "serviceID", // Populate the serviceID field
        populate: [
          { path: "providerID" }, // Populate provider information
          { path: "locationID" }, // Populate location information
          { path: "facilities" }, // Populate facilities for the service
          { path: "priceCategories" }, // Populate price categories
          { path: "suitability" }, // Populate suitability (if any)
        ]
      })
      .populate("coffeeTypes") // Populate cuisine types


    res.status(200).json([restaurants,coffees]);
  } catch (err) {
    console.log(err);
    console.error(err);
    res.status(500).json({ error: "Failed to fetch restaurants" });
  }
});


router.get("/cafe/all", async (req, res) => {
  try {
    console.log("DIT");
    const restaurants = await Coffee.find()
      .populate({
        path: "serviceID", // Populate the serviceID field
        populate: [
          { path: "providerID" }, // Populate provider information
          { path: "locationID" }, // Populate location information
          { path: "facilities" }, // Populate facilities for the service
          { path: "priceCategories" }, // Populate price categories
          { path: "suitability" }, // Populate suitability (if any)
        ]
      })
      .populate("coffeeTypes") // Populate cuisine types
      

    console.log(restaurants); // Check the populated data here
    res.status(200).json(restaurants);
  } catch (err) {
    console.log(err);
    console.error(err);
    res.status(500).json({ error: "Failed to fetch restaurants" });
  }
});


// DELETE - Xóa Service
/**
 * @swagger
 * /api/services/{id}:
 *   delete:
 *     summary: Xóa một Service
 *     tags: [Services]
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
 *         description: Service deleted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await serviceService.deleteServiceById(req.params.id, req.user);
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post(
  "/:id",
  authMiddleware,
  roleMiddleware(["Provider", "Admin"]),
  [
    body("serviceName").optional().notEmpty().withMessage("Service name is required"),
    body("description").optional().isString().withMessage("Description must be a string"),
    body("status").optional().isIn(["Active", "Inactive"]).withMessage("Invalid status"),
    body("facilities").optional().isArray().withMessage("Facilities must be an array of IDs"),
    body("priceCategories").optional().isArray().withMessage("Price categories must be an array of IDs"),
    body("suitability").optional().isArray().withMessage("Suitability must be an array of IDs"),
    body("images").optional().isArray().withMessage("Images must be an array of image URLs or base64 strings"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
   
    try {
      const {
        serviceName,
        description,
        status,
        facilities,
        priceCategories,
        suitability,
        images, // New images field in the body
      } = req.body;

      // Build the update object dynamically
      const updateFields = {};
      if (serviceName) updateFields.serviceName = serviceName;
      if (description) updateFields.description = description;
      if (status) updateFields.status = status;
      if (facilities) updateFields.facilities = facilities;
      if (priceCategories) updateFields.priceCategories = priceCategories;
      if (suitability) updateFields.suitability = suitability;
      if (images) updateFields.images = images; // Directly use images from body

      // Update service in the database
      const updatedService = await serviceService.updateServiceById(req.params.id, updateFields);

      if (!updatedService) {
        return res.status(404).json({ error: "Service not found" });
      }

      res.status(200).json({ message: "Service updated successfully", data: updatedService });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
);



/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Tạo một Service mới
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               providerID:
 *                 type: string
 *                 example: 64f6b3c9e3a1a4321f2c1a8b
 *     responses:
 *       201:
 *         description: Service created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */


router.post("/", async (req, res) => {
  try {
    const { providerID, type } = req.body;

    if (!providerID) {
      return res.status(400).json({ error: "ProviderID is required" });
    }

    if (!type || !["hotel", "restaurant", "cafe"].includes(type)) {
      return res.status(400).json({ error: "Invalid or missing type" });
    }

    // Tạo mới một Location với dữ liệu mặc định
    const newLocation = new Location({
      locationID: `LOC-${Date.now()}`,
      locationName: "Default Location",
      description: "This is a default location",
      latitude: 10.762622,
      longitude: 106.660172,
    });

    const savedLocation = await newLocation.save();

    // Tạo mới một Service với locationID từ Location vừa tạo
    const newService = new Service({
      serviceID: `SER-${Date.now()}`,
      providerID,
      locationID: savedLocation._id,
      serviceName: "Default Service",
      price: 100,
      discountPrice: 80,
      description: "This is a default service",
      status: "Inactive",
      type,
      facilities: [],
      priceCategories: [],
      suitability: [],
      reviews: [],
      images: ["default-image.jpg"],
    });

    const savedService = await newService.save();

    let createdEntity;
    if (type === "hotel") {
      // Tạo Hotel
      const newHotel = new Hotel({
        hotelID: `HOT-${Date.now()}`,
        serviceID: savedService._id,
        starRating: 3,
        hotelTypeID: null,
      });
      createdEntity = await newHotel.save();
    } else if (type === "restaurant") {
      // Tạo Restaurant
      const newRestaurant = new Restaurant({
        restaurantID: `RES-${Date.now()}`,
        serviceID: savedService._id,
        cuisineTypeIDs: [],
        dishes: [],
        seatingCapacity: 50,
        restaurantTypeID: null,
      });
      createdEntity = await newRestaurant.save();
    } else if (type === "cafe") {
      // Tạo Coffee
      const newCoffee = new Coffee({
        coffeeID: `CAF-${Date.now()}`,
        serviceID: savedService._id,
        coffeeTypes: [],
        averagePrice: 50,
        pictures: [],
      });
      createdEntity = await newCoffee.save();
    }

    res.status(201).json({
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} and Service created successfully`,
      service: savedService,
      entity: createdEntity,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});





router.post("/services/:id/reviews", async (req, res) => {
  const { id: serviceId } = req.params;
  const { userID, positiveComment, stars, targetID, invoiceID } = req.body;

  if (!serviceId || !userID || !stars || !targetID || !invoiceID) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Kiểm tra Service tồn tại
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Kiểm tra Invoice tồn tại
    const invoice = await Invoice.findById(invoiceID);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    // Tạo mới review
    const review = new Review({
      reviewID: Date.now().toString(36) + Math.random().toString(36).substring(2),
      userID,
      positiveComment,
      stars,
      targetID,
    });

    // Lưu review vào database
    const savedReview = await review.save();

    // Thêm review vào mảng reviews của Service
    service.reviews.push(savedReview._id);
    await service.save();

    // Cập nhật review vào hóa đơn
    invoice.review = savedReview._id;
    await invoice.save();

    return res.status(201).json({
      message: "Review added successfully and linked to invoice",
      review: savedReview,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
