const mongoose = require("mongoose");

const facilityTypeSchema = new mongoose.Schema({
  facilityTypeID: { type: String, required: true, unique: true }, // ID loại tiện nghi
  name: { type: String, required: true }, // Tên loại tiện nghi
  serviceType: {
    type: String,
    enum: ["hotel", "restaurant", "cafe"], // Loại dịch vụ mà tiện nghi thuộc về
    required: true,
  },
});

module.exports = mongoose.model("FacilityType", facilityTypeSchema);
