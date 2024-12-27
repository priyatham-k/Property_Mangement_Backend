const AdminEarnings = require('../models/AdminEarnings');
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const Location = require('../models/Locations');
const PropertyType = require('../models/PropertyTypes');
const User = require('../models/User');

const locations = async (req, res) => {
    try {
        const locations = await Location.find({}, '_id city state country');
        res.json({
            success: true,
            locations
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching locations' });
    }
};

const propertyTypes = async (req, res) => {
    try {
        const propertyTypes = await PropertyType.find({}, '_id name');
        res.json({ success: true, propertyTypes });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching property types' });
    }
};

const addProperty = async (req, res) => {
    try {
        const { name, address, location, manager, propertyType, details, price } = req.body;

        const newProperty = new Property({
            name,
            address,
            location,
            manager,
            propertyType,
            details,
            price
        });

        const savedProperty = await newProperty.save();
        res.json({ success: true, savedProperty, message: 'Property added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding property, please add required fields' });
    }
};

const fetchProperties = async (req, res) => {
    try {
        const properties = await Property.find()
            .populate({
                path: 'location',
                select: 'city state country _id'
            })
            .populate({
                path: 'propertyType',
                select: 'name _id'
            })
            .exec();

        res.status(200).json({ success: true, properties });
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ message: 'Server error while fetching properties' });
    }
};

const updateProperty = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { name, address, location, manager, propertyType, details, price } = req.body;

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        property.name = name;
        property.address = address;
        property.location = location;
        property.manager = manager;
        property.propertyType = propertyType;
        property.details = details;
        property.price = price;
        await property.save();

        res.json({ success: true, property, message: 'Property updated successfully' });
    } catch (error) {
        console.log('Error updating property:', error);
        res.status(500).json({ message: 'Error updating property' });
    }
}

const deleteProperty = async (req, res) => {
    try {
        const propertyId = req.params.propertyId;
        const deletedProperty = await Property.findByIdAndDelete(propertyId);
        if (!deletedProperty) {
            return res.status(404).json({ message: 'Property not found' });
        }
        res.json({ success: true, message: 'Property deleted successfully' });
    } catch (error) {
        console.log('Error deleting property:', error);
        res.status(500).json({ message: 'Error deleting property' });
    }
};

const bookProperty = async (req, res) => {
    const { guestId, propertyId, startDate, endDate, totalPrice, guestCount, extended } = req.body;

    try {

        const newBooking = new Booking({
            guest: guestId,
            property: propertyId,
            startDate,
            endDate,
            totalPrice,
            guestCount,
            extended,
            earningsToAdd: totalPrice
        });

        const savedBooking = await newBooking.save();

        res.status(200).json({
            success: true,
            message: 'Property Booked.',
            booking: savedBooking
        });
    } catch (error) {
        console.error('Error booking property:', error);
        res.status(500).json({ message: 'Failed to book property' });
    }
};

const cancelBooking = async (req, res) => {
    const { bookingId } = req.params;

    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const property = await Property.findById(booking.property);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        if (booking.isEarningsAdded) {
            const commission = booking.totalPrice * 0.10;
            const propertyEarnings = booking.totalPrice - commission;


            property.earnings -= propertyEarnings;

            await property.save();

            const admin = await AdminEarnings.findOne();
            admin.earnings -= commission;
            await admin.save();

        }


        booking.status = 'cancelled';
        await booking.save();

        res.json({ success: true, message: 'Booking cancelled successfully' });

    } catch (error) {
        console.log('Error cancelling booking:', error);
        res.status(500).json({ message: 'Failed to cancel booking' });
    }
};

const getGuestBookings = async (req, res) => {
    try {
        const { guestId } = req.params;
        const bookings = await Booking.find({ guest: guestId, status: { $ne: 'cancelled' } })
            .populate({ path: 'property', select: 'name address price details _id', populate: [{ path: 'location', select: 'city' }, { path: 'propertyType', select: 'name _id' }] })
            .exec();
        res.json({ success: true, bookings });
    } catch (error) {
        console.error('Error fetching guest bookings:', error);
        res.status(500).json({ message: 'Failed to fetch guest bookings' });
    }
};

const getBookingsByStatusForAdmin = async (req, res) => {
    try {
        const { status } = req.params;
        const payload = {
            status,
            isEarningsAdded: false
        }

        const bookings = await Booking.find(payload)
            .populate({
                path: 'property', select: 'name address _id price', populate: [{ path: 'location', select: 'city' }, {
                    path: 'propertyType',
                    model: 'PropertyTypes',
                    select: 'name'
                }]
            })
            .exec();

        if (status === 'confirmed') {
            const bookingsWithCommission = bookings.map(booking => {
                const commission = booking.earningsToAdd * 0.10;
                const propertyEarnings = booking.earningsToAdd - commission;
                return { ...booking.toObject(), commission, propertyEarnings };
            });
            return res.json({ success: true, bookings: bookingsWithCommission });
        }
        res.json({ success: true, bookings });
    } catch (error) {
        console.error('Error fetching guest bookings:', error);
        res.status(500).json({ message: 'Failed to fetch guest bookings' });
    }
};

const isPropertyAvailable = async (propertyId, startDate, endDate) => {
    const conflictingBooking = await Booking.findOne({
        property: propertyId,
        status: 'confirmed',
        $or: [
            { startDate: { $lt: endDate }, endDate: { $gt: startDate } }
        ]
    });

    return !conflictingBooking;
};

const updateBookingStatus = async (req, res) => {
    const { bookingId } = req.params;
    const { action } = req.body;

    try {
        const booking = await Booking.findById(bookingId).populate('property');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found', status: false });
        }

        if (action === 'confirm') {
            const propertyAvailable = await isPropertyAvailable(booking.property._id, booking.startDate, booking.endDate);
            if (!propertyAvailable) {
                return res.status(400).json({ message: 'Property is not available for the requested dates', success: false });
            }

            booking.status = 'confirmed';

        } else if (action === 'reject') {
            booking.status = 'rejected';
        }

        await booking.save();

        res.status(200).json({
            success: true,
            message: `Booking ${action}d successfully`,
            booking
        });
    } catch (error) {
        console.error('Error approving/rejecting booking:', error);
        res.status(500).json({ message: 'Failed to update booking status', success: false });
    }
};

const transferEarnings = async (req, res) => {
    const { propertyId, bookingId } = req.params;
    const propertyEarnings = req.body.propertyEarnings;
    const adminEarnings = req.body.adminEarnings;

    try {
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        property.earnings += propertyEarnings;
        await property.save();

        const admin = await AdminEarnings.findOne();
        admin.earnings += adminEarnings;
        await admin.save();

        const booking = await Booking.findById(bookingId);
        booking.isEarningsAdded = true;
        booking.earningsToAdd = 0;
        await booking.save();

        res.json({ success: true, message: 'Earnings transferred successfully' });
    } catch (error) {
        console.error('Error transferring earnings:', error);
        res.status(500).json({ message: 'Failed to transfer earnings' });
    }
};

const extendBooking = async (req, res) => {
    const { bookingId } = req.params;
    const { newEndDate, extraAmount } = req.body;

    try {
        const booking = await Booking.findById(bookingId).populate('property');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status !== 'confirmed') {
            return res.status(400).json({ message: 'Only confirmed bookings can be extended' });
        }

        const propertyAvailable = await isPropertyAvailable(booking.property._id, booking.endDate, newEndDate);
        if (!propertyAvailable) {
            return res.status(400).json({ message: 'Property is not available for the extended dates' });
        }

        booking.endDate = newEndDate;
        booking.extended = true;
        booking.earningsToAdd += extraAmount;
        booking.isEarningsAdded = false;
        booking.totalPrice += extraAmount;
        await booking.save();

        res.status(200).json({
            message: 'Booking extend confirmed.',
            booking
        });
    } catch (error) {
        console.error('Error extending booking:', error);
        res.status(500).json({ message: 'Failed to extend booking' });
    }

};

const getAdminStats = async (req, res) => {
    try {
        const totalEarnings = AdminEarnings.findOne({}, 'earnings');
        const totalProperties = Property.countDocuments();
        const totalBookings = Booking.countDocuments({ status: 'confirmed' });
        const totalGuests = User.countDocuments({ role: 'Guest' });
        const totalManagers = User.countDocuments({ role: 'Manager' });

        const [earnings, properties, bookings, guests, managers] = await Promise.all([totalEarnings, totalProperties, totalBookings, totalGuests, totalManagers]);

        res.json({
            success: true,
            earnings: earnings.earnings,
            properties,
            bookings,
            guests,
            managers
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Failed to fetch admin stats' });
    }
};

const getManagerStats = async (req, res) => {
    const { propertyId } = req.params;
    try {
        const totalEarnings = Property.findById(propertyId, 'earnings');
        const bookingCounts = Booking.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const [earnings, bookings] = await Promise.all([totalEarnings, bookingCounts]);
        if (!bookings.length) {
            bookings.push({ _id: 'confirmed', count: 0 });
            bookings.push({ _id: 'process', count: 0 });
            bookings.push({ _id: 'rejected', count: 0 });
            bookings.push({ _id: 'cancelled', count: 0 });

        }
        const counts = bookings.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});


        res.json({
            success: true,
            earnings: earnings.earnings,
            counts
        });
    } catch (error) {
        console.error('Error fetching manager stats:', error);
        res.status(500).json({ message: 'Failed to fetch manager stats' });
    }
};




module.exports = { locations, propertyTypes, addProperty, fetchProperties, updateProperty, deleteProperty, bookProperty, getGuestBookings, updateBookingStatus, getBookingsByStatusForAdmin, transferEarnings, getAdminStats, extendBooking, getManagerStats, cancelBooking };
