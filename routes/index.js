const express = require('express');
const healthRoutes = require('./health.routes');
const linkRoutes = require('./link.routes');
const redirectRoutes = require('./redirect.routes');

const router = express.Router();

router.use(healthRoutes);
router.use('/api/create', linkRoutes);
router.use(redirectRoutes);

module.exports = router;
