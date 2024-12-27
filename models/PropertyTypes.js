const mongoose = require('mongoose');

const propertyTypeSchema = new mongoose.Schema({
    name: { type: String, required: true }
});

const PropertyTypes = mongoose.model('PropertyTypes', propertyTypeSchema);

module.exports = PropertyTypes;