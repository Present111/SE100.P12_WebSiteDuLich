const mongoose = require("mongoose");
const CoffeeType = require("../models/CoffeeType"); // Đường dẫn đến model CoffeeType

const coffeeTypes = [
  { name: "Espresso", description: "A strong and concentrated coffee." },
  { name: "Latte", description: "A coffee drink with milk and foam." },
  { name: "Cappuccino", description: "Espresso with steamed milk and foam." },
  { name: "Americano", description: "Espresso diluted with hot water." },
  { name: "Mocha", description: "A chocolate-flavored coffee drink." },
  { name: "Macchiato", description: "Espresso with a small amount of milk." },
  {
    name: "Flat White",
    description: "Similar to a latte but with a thinner foam.",
  },
  { name: "Irish Coffee", description: "Coffee mixed with Irish whiskey." },
  {
    name: "Cold Brew",
    description: "Coffee brewed with cold water over time.",
  },
  { name: "Affogato", description: "Espresso poured over ice cream." },
];

// Kết nối tới MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/Dulich", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected!");

    // Chèn dữ liệu CoffeeType
    await CoffeeType.insertMany(coffeeTypes);
    console.log("Coffee types inserted successfully!");

    mongoose.connection.close();
  } catch (err) {
    console.error("Error inserting coffee types:", err);
    mongoose.connection.close();
  }
};

connectDB();
