const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
  tableID: { type: String, required: true, unique: true },
  restaurantID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  tableType: { type: String, required: true },
  availableDate: { type: Date, required: true },
});

module.exports = mongoose.model("Table", tableSchema);
