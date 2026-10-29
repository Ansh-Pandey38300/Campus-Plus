const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authenticateToken');
const { getDealDetails } = require('../controllers/dealDetailsController');

router.get('/deals/:id', authenticateToken, getDealDetails);

module.exports = router;
