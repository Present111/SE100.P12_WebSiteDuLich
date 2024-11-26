const mongoose = require("mongoose");
const CuisineType = require("../models/CuisineType");

const cuisineTypes = [
  "American",
  "Asian",
  "Japanese",
  "Chinese",
  "Sushi",
  "Seafood",
  "Mediterranean",
  "Spanish",
  "Contemporary",
  "European",
  "Steakhouse",
  "Irish",
  "Greek",
  "Fusion",
  "Barbecue",
  "Cantonese",
  "Grill",
  "Central American",
  "Italian",
  "Pub",
  "Pizza",
  "Mexican",
  "Fast Food",
  "Latin",
  "Wine Bar",
  "Indian",
  "Korean",
  "Diner",
  "Caribbean",
  "Gastropub",
  "Dining bars",
  "Israeli",
  "African",
  "Shanghai",
  "Bar",
  "Cafe",
  "Deli",
  "French",
  "Healthy",
  "Thai",
  "Middle Eastern",
  "International",
  "South American",
  "Soups",
  "Vietnamese",
  "Turkish",
  "Lebanese",
  "Peruvian",
];

const insertCuisineTypes = async () => {
  try {
    // Kết nối tới MongoDB
    await mongoose.connect("mongodb://localhost:27017/Dulich", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Xóa các dữ liệu cũ trong collection nếu cần
    await CuisineType.deleteMany();

    // Thêm dữ liệu loại món ăn
    for (const type of cuisineTypes) {
      await CuisineType.create({ type });
    }

    console.log("Inserted all cuisine types successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error inserting cuisine types:", error);
    process.exit(1);
  }
};

insertCuisineTypes();
