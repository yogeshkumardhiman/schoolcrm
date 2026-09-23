import express from 'express';
import authController from './auth.controller.js';
import { verifyToken } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.post('/login', authController.login);
router.get('/profile', verifyToken, authController.getProfile);
router.put('/device-token', verifyToken, authController.updateDeviceToken);

export default router;
