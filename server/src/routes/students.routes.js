const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const c = require('../controllers/students.controller');

router.use(protect, requireRole('tutor'));

router.route('/').get(c.getStudents).post(c.createStudent);
router.route('/:id').get(c.getStudent).put(c.updateStudent).delete(c.deleteStudent);

module.exports = router;