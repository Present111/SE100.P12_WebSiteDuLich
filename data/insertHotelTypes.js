const mongoose = require("mongoose");
const HotelType = require("../models/HotelType"); // Đường dẫn tới model HotelType

const hotelTypes = [
  { type: "Homestay" },
  { type: "Toàn bộ căn nhà" },
  { type: "Căn hộ" },
  { type: "Khách sạn" },
  { type: "Căn hộ dịch vụ" },
  { type: "Nhà khách / Nhà nghỉ B&B" },
  { type: "Nhà nghỉ ven đường" },
  { type: "Nhà nghỉ" },
  { type: "Inn" },
  { type: "Biệt thự" },
  { type: "Toàn bộ nhà trệt" },
  { type: "Khách sạn con nhộng" },
  { type: "Nông trại" },
  { type: "Khách sạn tình yêu" },
];

const insertHotelTypes = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/Dulich", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await HotelType.insertMany(hotelTypes);
    console.log("Hotel types inserted successfully!");
  } catch (error) {
    console.error("Error inserting hotel types:", error);
  } finally {
    mongoose.connection.close();
  }
};

insertHotelTypes();
