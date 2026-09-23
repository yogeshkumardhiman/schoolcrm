import express from 'express';
import controller from './controller.js';
import { verifyToken } from '../../middleware/auth.middleware.js';
import { checkAbility } from '../../middleware/ability.middleware.js';
const router = express.Router();

const superAdminOrAbility = (action, subject) => {
    return (req, res, next) => {
        const role = req.user?.role?.toUpperCase().replace(/\s+/g, '_').trim();
        if (role === 'SUPER_ADMIN' || req.user?.permissions?.isSuperAdmin) {
            return next();
        }
        return checkAbility(action, subject)(req, res, next);
    };
};

router.get('/summary', verifyToken, superAdminOrAbility('read', 'Financials'), controller.getSalarySummary);
router.get('/list', verifyToken, superAdminOrAbility('read', 'Financials'), controller.getStaffSalaryList);
router.post('/structure', verifyToken, superAdminOrAbility('manage', 'Financials'), controller.updateSalaryStructure);
router.post('/payment', verifyToken, superAdminOrAbility('manage', 'Financials'), controller.processSalaryPayment);
router.get('/payment/:id', verifyToken, superAdminOrAbility('read', 'Financials'), controller.getSalaryPaymentById);
router.get('/history/:staffId', verifyToken, controller.getStaffSalaryHistory);

export default router;
