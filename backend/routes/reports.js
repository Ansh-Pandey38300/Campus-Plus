const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authenticateToken');
const authorizeRole = require('../middleware/authorizeRole');
const { getReports } = require('../controllers/reportController');

// Only authenticated admins can access reports.
router.use(authenticateToken);
router.use(authorizeRole('admin'));

router.get('/admin/reports', getReports);

module.exports = router;