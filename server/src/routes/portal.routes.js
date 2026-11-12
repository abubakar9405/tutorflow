const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const c = require('../controllers/portal.controller');

const handleUpload = (req, res, next) =>
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });

router.use(protect);

router.get('/me', requireRole('student', 'parent'), c.getMe);
router.get('/students/:id/overview', requireRole('student', 'parent'), c.getOverview);
router.post('/assignments/:id/upload', requireRole('student'), handleUpload, c.uploadSubmission);
router.get('/assignments/:id/file', requireRole('tutor', 'student', 'parent'), c.downloadSubmission);

module.exports = router;
