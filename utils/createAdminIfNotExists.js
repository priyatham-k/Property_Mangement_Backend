const AdminEarnings = require('../models/AdminEarnings');
const User = require('../models/User');

const createAdminIfNotExists = async () => {
  try {
    const adminExists = await User.findOne({ role: 'Admin' });

    if (!adminExists) {
      const defaultAdmin = new User({
        firstName: 'Admin',
        email: 'admin@gmail.com',
        password: 'admin1234',
        role: 'Admin'
      });

      await defaultAdmin.save();

      const defaultAdminEarnings = new AdminEarnings({
        earnings: 0
      });

      await defaultAdminEarnings.save();

      console.log('Admin user created with email: admin@example.com and password: admin1234');
    } else {
      console.log('Admin user already exists.');
    }
  } catch (error) {
    console.error('Error checking/creating admin user:', error);
  }
};

module.exports = createAdminIfNotExists;