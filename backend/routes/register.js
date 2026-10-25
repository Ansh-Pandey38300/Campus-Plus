const express = require('express');
const router = express.Router();

const {
  register
} = require('../controllers/registerController');

router.post('/auth/register', register);

module.exports = router;