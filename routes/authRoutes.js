const express = require('express');
const router = express.Router();
const { registerUser, authUser, managerList } = require('../controllers/authController');
const { protect, admin, propertyManager } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/managers', protect, admin, managerList);

module.exports = router;