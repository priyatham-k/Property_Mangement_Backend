const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  name: { type: String, required: true, maxLength: 100 },
  address: { type: String, required: true, maxLength: 100 },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  createdAt: { type: Date, default: Date.now },
  earnings: { type: Number, default: 0 }, 
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyType: { type: mongoose.Schema.Types.ObjectId, ref: 'PropertyTypes', required: true },
  details: { type: String, maxLength: 100 },
  price: { type: Number, required: true }, 
});

const Property = mongoose.model('Property', propertySchema);
module.exports = Property;