const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    guest: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    startDate: Date,
    endDate: Date,
    status: { type: String, enum: ['process', 'confirmed', 'rejected', 'cancelled'], default: 'confirmed' },
    totalPrice: Number,
    guestCount: Number,
    isEarningsAdded: { type: Boolean, default: false },
    earningsToAdd: { type: Number, default: 0 },
    extended: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  });
  
  const Booking = mongoose.model('Booking', bookingSchema);
    module.exports = Booking;
  