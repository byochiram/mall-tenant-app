const express = require('express');
const router = express.Router();
const {
  getAllPayments,
  getPaymentsByTenant,
  createPayment,
  updatePaymentStatus,
  deletePayment,
} = require('../controllers/paymentController');

router.get('/', getAllPayments);
router.get('/tenant/:tenantId', getPaymentsByTenant);
router.post('/', createPayment);
router.patch('/:id/status', updatePaymentStatus);
router.delete('/:id', deletePayment);

module.exports = router;
