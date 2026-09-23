import express from 'express';
import controller from './controller.js';
import { verifyToken, authorize } from '../../middleware/auth.middleware.js';
import jwt from 'jsonwebtoken';
const router = express.Router();

// Student viewing attendance
router.get('/student/:id', verifyToken, controller.getStudentAttendance);
router.get('/student/details/:studentId', controller.getAttendance);

// Teacher marking student attendance
router.post('/teacher/mark', verifyToken, controller.markAttendance);
router.post('/teacher/bulk', verifyToken, controller.bulkMarkAttendance);
router.get('/teacher/:class/:date', verifyToken, controller.getAttendanceByClassAndDate);

// Staff/Admin attendance actions
router.get('/staff', verifyToken, authorize(['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'MANAGEMENT']), controller.getStaffAttendance);
router.post('/staff', verifyToken, authorize(['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'MANAGEMENT']), controller.markStaffAttendance);
router.get('/staff/qr-token', verifyToken, authorize(['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'MANAGEMENT']), (req, res) => {
  try {
    const token = jwt.sign(
      { schoolId: 'SDM_PUBLIC_SCHOOL', purpose: 'STAFF_ATTENDANCE' },
      process.env.JWT_SECRET,
      { expiresIn: '30s' }
    );
    res.json({ token, expiresAt: Date.now() + 30000 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/staff/last-scan', verifyToken, authorize(['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'MANAGEMENT']), controller.getLastScan);

export default router;
