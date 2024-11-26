const mongoose = require("mongoose");
const DishType = require("../models/DishType"); // Import model DishType

// Kết nối MongoDB
mongoose
  .connect("mongodb://localhost:27017/Dulich", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Danh sách các món ăn
const dishList = [
  "Salad",
  "Fish",
  "Burger",
  "Soup",
  "Shrimp",
  "Fried",
  "Pasta",
  "Pesto",
  "Beef",
  "Salmon",
  "Cake",
  "Pork",
  "Lamb",
  "Cakes",
  "Calamari",
  "Lobster",
  "Tuna",
  "Crab",
  "Noodle",
  "Duck",
  "Toast",
  "Octopus",
  "Sausage",
  "Sandwiches",
  "Risotto",
  "Dumplings",
  "Veal",
  "Pancakes",
  "Oyster",
  "Meatballs",
  "Ribs",
  "Scallops",
  "Eggplant",
  "Tacos",
  "Cheesecake",
  "Truffle",
  "Wings",
  "Tiramisu",
  "Mussels",
  "Tartare",
  "Omelette",
  "Curry",
  "Clams",
  "Lasagne",
  "Filet Mignon",
  "French Toast",
  "Waffles",
  "Linguine",
];

// Thêm món ăn vào database
const insertDishes = async () => {
  try {
    const dishDocs = dishList.map((dish) => ({ name: dish }));
    await DishType.insertMany(dishDocs);
    console.log("Danh sách món ăn đã được thêm thành công!");
  } catch (err) {
    console.error("Lỗi khi thêm món ăn:", err);
  } finally {
    mongoose.connection.close();
  }
};

insertDishes();
