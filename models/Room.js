const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomID: { type: String, required: true, unique: true },
  hotelID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel",
    required: true,
  },
  roomType: { type: String, required: true },
  availableRooms: { type: Number, required: true },
  availableDate: { type: Date, required: true },
});

module.exports = mongoose.model("Room", roomSchema);
