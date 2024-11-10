const mongoose = require('mongoose');

const coffeeSchema = new mongoose.Schema({
  coffeeID: { type: String, required: true, unique: true },
  serviceID: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  averagePrice: { type: Number, required: true },
});

module.exports = mongoose.model('Coffee', coffeeSchema);

