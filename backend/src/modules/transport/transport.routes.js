import express from 'express';
import transportController from './transport.controller.js';
import { verifyToken, authorize } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Only SUPER_ADMIN, PRINCIPAL, and ACCOUNTANT can manage transport
const transportAuth = authorize(['SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTANT']);

router.get('/routes', verifyToken, transportAuth, transportController.getRoutes);
router.post('/routes', verifyToken, transportAuth, transportController.createRoute);
router.delete('/routes/:id', verifyToken, transportAuth, transportController.deleteRoute);

router.get('/stops', verifyToken, transportAuth, transportController.getStops);
router.post('/stops', verifyToken, transportAuth, transportController.createStop);

export default router;
