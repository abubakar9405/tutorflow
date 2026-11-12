const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const c = require('../controllers/assignments.controller');

router.use(protect, requireRole('tutor'));

router.route('/').get(c.getAssignments).post(c.createAssignment);
router.route('/:id').put(c.updateAssignment).delete(c.deleteAssignment);
router.patch('/:id/submit', c.submitAssignment);
router.patch('/:id/grade', c.gradeAssignment);

module.exports = router;
