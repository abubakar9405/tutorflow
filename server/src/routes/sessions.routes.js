const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const c = require('../controllers/sessions.controller');

router.use(protect, requireRole('tutor'));

router.route('/').get(c.getSessions).post(c.createSession);
router.route('/:id').put(c.updateSession).delete(c.deleteSession);
router.patch('/:id/cancel', c.cancelSession);
router.patch('/:id/attendance', c.markAttendance);

module.exports = router;