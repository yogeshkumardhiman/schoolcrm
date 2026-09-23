import express from 'express';
import controller from './controller.js';
import adminController from '../crm/controller.js';
import { verifyToken, authorize } from '../../middleware/auth.middleware.js';
import { checkAbility } from '../../middleware/ability.middleware.js';
import jwt from 'jsonwebtoken';
import attendanceController from '../attendance/controller.js';

const router = express.Router();

router.get('/', adminController.adminStaff.list);

// Timetable
router.get('/timetable/:id', verifyToken, authorize(['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'MANAGEMENT', 'ACCOUNTANT', 'CLERK', 'TEACHER']), adminController.adminStaff.getTimetable);
router.post('/timetable/:id', verifyToken, authorize(['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'MANAGEMENT', 'ACCOUNTANT', 'CLERK']), adminController.adminStaff.updateTimetable);
router.post('/assign-teacher', verifyToken, authorize(['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'MANAGEMENT']), adminController.adminStaff.assignClassTeacher);

// Leaves
router.get('/leave/requests', verifyToken, authorize(['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'MANAGEMENT']), adminController.adminStaff.getLeaveRequests);
router.put('/leave/approve/:id', verifyToken, authorize(['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'MANAGEMENT']), adminController.adminStaff.approveLeave);

// Substitution
router.get('/substitution/vacancies', verifyToken, checkAbility('read', 'Substitution'), adminController.substitutionController.getVacancies);
router.get('/substitution/available', verifyToken, checkAbility('read', 'Substitution'), adminController.substitutionController.getAvailableTeachers);
router.post('/substitution/assign', verifyToken, checkAbility('manage', 'Substitution'), adminController.substitutionController.assign);

// Attendance
router.get('/attendance', verifyToken, authorize(['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'MANAGEMENT']), attendanceController.getStaffAttendance);
router.post('/attendance', verifyToken, authorize(['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'MANAGEMENT']), attendanceController.markStaffAttendance);
router.get('/attendance/qr-token', verifyToken, authorize(['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'MANAGEMENT']), (req, res) => {
  try {
    const token = jwt.sign(
      { schoolId: 'SDM_PUBLIC_SCHOOL', purpose: 'STAFF_ATTENDANCE' },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30s' }
    );
    res.json({ token, expiresAt: Date.now() + 30000 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/attendance/last-scan', verifyToken, authorize(['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'MANAGEMENT']), attendanceController.getLastScan);

// Staff-facing / Mobile application endpoints
router.get('/list', verifyToken, controller.getAllStaff);
router.get('/leave/my-requests', verifyToken, controller.getMyRequests);
router.post('/leave/apply', verifyToken, controller.applyLeave);
router.get('/my-substitutions', verifyToken, controller.getMySubstitutions);
router.get('/my-timetable', verifyToken, controller.getMyTimetable);
router.get('/my-attendance', verifyToken, controller.getMyAttendance);
router.post('/self-attendance', verifyToken, controller.selfAttendance);
router.put('/profile/:id', verifyToken, controller.updateProfile);
router.get('/:id', controller.getStaffById);

export default router;
