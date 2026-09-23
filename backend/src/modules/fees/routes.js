import express from 'express';
import controller from './controller.js';
import { verifyToken, authorize } from '../../middleware/auth.middleware.js';
const router = express.Router();

router.get('/summary', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT', 'ADMIN', 'MANAGEMENT', 'SUPER_ADMIN']), controller.getFeeSummary);
router.get('/list', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT']), controller.getFeesList);
router.post('/payment', verifyToken, authorize(['ACCOUNTANT', 'SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']), controller.payment);
router.get('/payment/:id', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT', 'SUPER_ADMIN']), controller.getPaymentById);
router.post('/send-notice', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT']), controller.sendFeeNotice);
router.get('/structures', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT']), controller.getFeeStructures);
router.get('/structures/:class', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT', 'SUPER_ADMIN', 'ADMIN']), controller.getFeeStructureByClass);
router.get('/calculate-due', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT']), controller.getCalculatedFee);
router.post('/generate-due', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT', 'SUPER_ADMIN', 'ADMIN']), controller.generateDue);
router.post('/structures/update', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT']), controller.updateFeeStructure);
router.get('/defaulters', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT']), controller.getMonthlyDefaulters);

router.get('/heads', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT', 'SUPER_ADMIN']), controller.getFeeHeads);
router.post('/heads', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'SUPER_ADMIN']), controller.createFeeHead);
router.put('/heads/:id', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'SUPER_ADMIN']), controller.updateFeeHead);
router.delete('/heads/:id', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'SUPER_ADMIN']), controller.deleteFeeHead);

router.get('/config', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT', 'SUPER_ADMIN']), controller.getFeeConfigs);
router.post('/config', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT', 'SUPER_ADMIN']), controller.createFeeConfig);
router.put('/config/:id', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT', 'SUPER_ADMIN']), controller.updateFeeConfig);
router.delete('/config/:id', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT', 'SUPER_ADMIN']), controller.deleteFeeConfig);

// Online Payment mounts
router.post('/create-order', verifyToken, authorize(['STUDENT', 'PARENT']), controller.createOrder);
router.post('/verify', verifyToken, authorize(['STUDENT', 'PARENT']), controller.verifyPayment);

export default router;
