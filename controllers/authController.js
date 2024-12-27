const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Property = require('../models/Property');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ firstName, lastName, email, password, role });

        if (user) {
            const userDetails = {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            }
            if (user.propertyId) {
                userDetails.propertyId = user.propertyId;
            }
            res.status(201).json({ success: true, message: 'Registration successful, please login!', });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to register user' });
    }
};

const authUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
        const userDetails = {
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
            name: `${user.firstName} ${user.lastName ? user.lastName : ''}`,
        };
        if (user.role === 'Manager') {
            const property = await Property.findOne({ manager: user._id }).populate('propertyType');
            if (property) {
                userDetails.propertyId = property._id;
                userDetails.propertyName = property.name;
                userDetails.propertyType = property.propertyType.name;
            }
        }
        res.json({
            success: true,
            user: userDetails
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

const managerList = async (req, res) => {
    try {
        const managers = await User.find({ role: 'Manager' }, 'firstName lastName email _id');
        const managersCopy = managers.map(manager => {
            return {
                ...manager.toObject(),
                name: `${manager.firstName} ${manager.lastName ? manager.lastName : ''}`,
            };
        });
        res.json({ managers: managersCopy, success: true });
    } catch (error) {
        console.error('Error fetching managers:', error);
        res.status(500).json({ message: 'Failed to fetch managers' });
    }
};

module.exports = { registerUser, authUser, managerList };
