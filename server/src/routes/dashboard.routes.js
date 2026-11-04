const router = require('express').Router();
const c = require('../controllers/dashboard.controller');
const { protect, requireRole } = require('../middleware/auth');

router.get('/', protect, requireRole('tutor'), c.getStats);

module.exports = router;
