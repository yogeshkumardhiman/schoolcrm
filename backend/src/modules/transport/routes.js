import express from 'express';
import controller from './controller.js';
import { verifyToken, authorize } from '../../middleware/auth.middleware.js';
const router = express.Router();

router.get('/routes', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN']), controller.getRoutes);
router.post('/routes', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN']), controller.createRoute);
router.delete('/routes/:id', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN']), controller.deleteRoute);
router.get('/stops', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN']), controller.getStops);
router.post('/stops', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN']), controller.createStop);

export default router;
