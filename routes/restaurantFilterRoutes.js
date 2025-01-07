const express = require("express");
const router = express.Router();
const CuisineType = require("../models/CuisineType"); // Đường dẫn tới model CuisineType
const DishType = require("../models/DishType");       // Đường dẫn tới model DishType
const RestaurantType = require("../models/RestaurantTypes"); // Đường dẫn tới model RestaurantType
const CoffeeType = require("../models/CoffeeType");

// Route để lấy dữ liệu từ cả 3 collection
router.get("/filter", async (req, res) => {
  try {
    const cuisines = await CuisineType.find(); // Lấy tất cả từ CuisineType
    const dishes = await DishType.find();     // Lấy tất cả từ DishType
    const restaurants = await RestaurantType.find(); // Lấy tất cả từ RestaurantType

    res.status(200).json({
      success: true,
      data: {
        cuisines,
        dishes,
        restaurants,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi khi lấy dữ liệu", error: err.message });
  }
});


router.get("/coffee", async (req, res) => { 
    try { 
      const coffeeTypes = await CoffeeType.find(); // Lấy tất cả từ CoffeeType
        console.log("HEEEEEEEELO")
      res.status(200).json({ 
        success: true, 
        data: coffeeTypes, // Trả về dữ liệu CoffeeType
      }); 
    } catch (err) { 
        console.log(err)
      res.status(500).json({ success: false, message: "Lỗi khi lấy dữ liệu cà phê", error: err.message }); 
    } 
  }); 
module.exports = router;
