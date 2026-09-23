import express from 'express';
import controller from './controller.js';
import { verifyToken } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.post('/login', controller.login);
router.post('/register', controller.register);
router.get('/profile', verifyToken, controller.getProfile);
router.post('/device-token', verifyToken, controller.updateDeviceToken);

export default router;
