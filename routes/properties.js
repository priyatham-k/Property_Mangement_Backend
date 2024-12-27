const express = require('express');
const router = express.Router();
const { locations, propertyTypes, addProperty, fetchProperties, updateProperty, deleteProperty, bookProperty, getGuestBookings, updateBookingStatus, getBookingsByStatusForAdmin, getAdminStats, transferEarnings, extendBooking, getManagerStats, cancelBooking } = require('../controllers/propertiesController');
const { protect, admin, propertyManager } = require('../middlewares/authMiddleware');

router.get('/locations', locations);
router.get('/propertyTypes', propertyTypes);
router.get('/fetchProperties', fetchProperties);
router.post('/addProperty', addProperty);
router.post('/updateProperty/:propertyId', updateProperty);
router.delete('/deleteProperty/:propertyId', deleteProperty);
router.post('/bookProperty', bookProperty);
router.get('/fetchGuestBookings/:guestId', getGuestBookings);
router.post('/updateBookingStatus/:bookingId', updateBookingStatus);
router.get('/getBookingsByStatusForAdmin/:status', getBookingsByStatusForAdmin);
router.get('/getAdminStats', protect, admin, getAdminStats);
router.post('/transferEarnings/:propertyId/:bookingId', transferEarnings);
router.post('/extendBooking/:bookingId', extendBooking);
router.get('/getManagerStats/:propertyId', protect, propertyManager, getManagerStats);
router.put('/cancelBooking/:bookingId', protect, cancelBooking);

module.exports = router;