const mongoose = require("mongoose");

const facilitySchema = new mongoose.Schema({
  facilityID: {
    type: String,
    required: true,
    unique: true,
  }, // ID tiện ích
  name: {
    type: String,
    required: true,
  }, // Tên tiện ích
  serviceType: {
    type: String,
    enum: ["Room", "Table"], // Phân loại dịch vụ
    required: true,
  },
});

module.exports = mongoose.model("Facility", facilitySchema);
