const PropertyType = require('../models/PropertyTypes');

const createPredefinedPropertyTypes = async () => {
  const predefinedPropertyTypes = [
    { name: 'Apartment' },
    { name: 'Villa' },
    { name: 'Bunglow' }
  ];
  
  try {
    const propertyTypesCount = await PropertyType.countDocuments();
    
    if (propertyTypesCount === 0) {
      await PropertyType.insertMany(predefinedPropertyTypes);
      console.log('Predefined property types created successfully.');
    } else {
      console.log('Property types already exist. No need to create predefined types.');
    }
  } catch (error) {
    console.error('Error creating predefined property types:', error);
  }
};

module.exports = createPredefinedPropertyTypes;
