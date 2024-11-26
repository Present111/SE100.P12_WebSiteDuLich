const mongoose = require("mongoose");
const RestaurantType = require("../models/RestaurantTypes");

// Kết nối tới MongoDB
mongoose.connect("mongodb://localhost:27017/Dulich", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const restaurantTypes = [
  { type: "Restaurants" },
  { type: "Quick Bites" },
  { type: "Coffee & Tea" },
  { type: "Dessert" },
  { type: "Bakeries" },
  { type: "Bars & Pubs" },
  { type: "Delivery Only" },
  { type: "Specialty Food Market" },
  { type: "Dine With a Local Chef" },
];

const insertRestaurantTypes = async () => {
  try {
    await RestaurantType.insertMany(restaurantTypes);
    console.log("Restaurant types inserted successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error inserting restaurant types:", error);
    mongoose.connection.close();
  }
};

insertRestaurantTypes();
