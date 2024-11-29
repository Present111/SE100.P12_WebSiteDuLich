const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swaggerConfig");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const providerRoutes = require("./routes/providerRoutes");
const customerRoutes = require("./routes/customerRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const hotelRoutes = require("./routes/hotelRoutes");
const coffeeRoutes = require("./routes/coffeeRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const roomRoutes = require("./routes/roomRoutes");
const tableRoutes = require("./routes/tableRoutes");
const locationRoutes = require("./routes/locationRoutes");
const hotelTypeRoute = require("./routes/hotelTypeRoute");
const priceCategoriesRoutes = require("./routes/priceCategoryRoutes");
const path = require("path");

// Load .env file
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully!"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Simple Route
app.get("/", (req, res) => {
  res.send("Welcome to the Node.js + MongoDB API!");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// Routes
app.use("/api/users", userRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/coffees", coffeeRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/hotelType", hotelTypeRoute);
app.use("/api/price-categories", priceCategoriesRoutes);

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
//Auth
app.use("/api/auth", authRoutes);
// Cung cấp file ảnh từ thư mục "uploads"
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
