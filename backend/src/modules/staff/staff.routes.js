import express from 'express';
import staffController from './staff.controller.js';
import { verifyToken } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', staffController.getAllStaff);
router.get('/list', verifyToken, staffController.getAllStaff);
router.get('/leave/my-requests', verifyToken, staffController.getMyRequests);
router.post('/leave/apply', verifyToken, staffController.applyLeave);
router.get('/my-substitutions', verifyToken, staffController.getMySubstitutions);
router.get('/my-timetable', verifyToken, staffController.getMyTimetable);
router.get('/my-attendance', verifyToken, staffController.getMyAttendance);
router.post('/self-attendance', verifyToken, staffController.selfAttendance);
router.put('/profile/:id', verifyToken, staffController.updateProfile);
router.get('/:id', staffController.getStaffById);

export default router;
