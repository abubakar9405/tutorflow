const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const c = require('../controllers/reports.controller');

router.use(protect, requireRole('tutor'));

router.get('/student/:id', c.getStudentReport);

module.exports = router;
