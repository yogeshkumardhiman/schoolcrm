import express from 'express';
import controller from './controller.js';
import { verifyToken, authorize } from '../../middleware/auth.middleware.js';
const router = express.Router();

router.get('/compliance', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN', 'SUPER_ADMIN']), controller.getComplianceDocs);
router.get('/logs', verifyToken, authorize(['SUPER_ADMIN']), controller.getLogs);

export default router;
