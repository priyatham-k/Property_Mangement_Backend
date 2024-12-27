const Locations = require('../models/Locations');

const createPredefinedLocations = async () => {
  const predefinedLocations = [
    { city: 'New York', state: 'New York', country: 'United States Of America' },
    { city: 'Los Angeles', state: 'California', country: 'United States Of America' },
    { city: 'Chicago', state: 'Illinois', country: 'United States Of America' },
    { city: 'Houston', state: 'Texas', country: 'United States Of America' },
    { city: 'Phoenix', state: 'Arizona', country: 'United States Of America' },
    { city: 'Las Vegas', state: 'Nevada', country: 'United States Of America' },
  ];
  
  try {
    const locationsCount = await Locations.countDocuments();
    
    if (locationsCount === 0) {
      await Locations.insertMany(predefinedLocations);
      console.log('Predefined locations created successfully.');
    } else {
      console.log('Locations already exist. No need to create predefined locations.');
    }
  } catch (error) {
    console.error('Error creating predefined locations:', error);
  }
};

module.exports = createPredefinedLocations;
