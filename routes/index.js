const express = require("express");

const authRoutes = require('./authRoutes.js');
const propertiesRoutes = require('./properties.js');

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/properties", propertiesRoutes);

module.exports = router;