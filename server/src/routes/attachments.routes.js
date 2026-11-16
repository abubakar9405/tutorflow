const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const c = require('../controllers/attachments.controller');

const handleUpload = (req, res, next) =>
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });

router.use(protect);

router.get('/:id', requireRole('tutor', 'student', 'parent'), c.downloadAttachment);
router.post('/:id', requireRole('tutor'), handleUpload, c.uploadAttachment);
router.delete('/:id', requireRole('tutor'), c.removeAttachment);

module.exports = router;
