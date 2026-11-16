const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const c = require('../controllers/accounts.controller');

router.use(protect, requireRole('tutor'));

router.route('/').get(c.listAccounts).post(c.createAccount);
router.put('/:id/password', c.resetPassword);
router.delete('/:id', c.deleteAccount);

module.exports = router;
