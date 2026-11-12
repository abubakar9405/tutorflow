const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const c = require('../controllers/fees.controller');

router.use(protect, requireRole('tutor'));

router.get('/summary', c.getSummary);
router.post('/generate', c.generateInvoices);
router.get('/', c.getInvoices);
router.route('/:id').put(c.updateInvoice).delete(c.deleteInvoice);
router.post('/:id/payments', c.addPayment);

module.exports = router;
