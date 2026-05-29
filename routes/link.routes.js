const express = require('express');
const { createShortLink } = require('../controllers/link.controller');

const router = express.Router();

router.post('/', createShortLink);

module.exports = router;
