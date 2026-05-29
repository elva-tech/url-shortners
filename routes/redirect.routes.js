const express = require('express');
const {
  redirectToOriginalUrl,
  redirectDltUrl,
} = require('../controllers/redirect.controller');

const router = express.Router();

router.get('/:dltHeader/:shortCode', redirectDltUrl);
router.get('/:shortCode', redirectToOriginalUrl);

module.exports = router;
