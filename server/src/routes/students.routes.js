const router = require('express').Router();
const c = require('../controllers/students.controller');

router.route('/').get(c.getStudents).post(c.createStudent);
router.route('/:id').get(c.getStudent).put(c.updateStudent).delete(c.deleteStudent);

module.exports = router;