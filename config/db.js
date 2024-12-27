const mongoose = require('mongoose');
const createAdminIfNotExists = require('../utils/createAdminIfNotExists');
const createPreDefinedPropertyTypes = require('../utils/createPreDefinedPropertyTypes');
const createPredefinedLocations = require('../utils/createPreDefinedLocations');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
        createAdminIfNotExists();
        createPreDefinedPropertyTypes();
        createPredefinedLocations();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
