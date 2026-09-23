import express from 'express';
const router = express.Router();
import studentController from './student.controller.js';
import { verifyToken } from '../../middleware/auth.middleware.js';

import resultController from './result.controller.js';

router.get('/', studentController.getStudents);
router.get('/results/:studentId', verifyToken, resultController.getResultsByStudent);
router.get('/results/bulk/:className/:section', verifyToken, resultController.getResultsByClass);
router.get('/search/:admissionNo', verifyToken, studentController.getStudentByAdmission);
router.get('/:id', verifyToken, studentController.getStudentById);
router.get('/:id/attendance', verifyToken, studentController.getStudentAttendance);
router.get('/timetable/:class/:section', studentController.getClassTimetable);
router.get('/homework/:class/:section', studentController.getHomeworkByClass);

router.get('/dashboard/:admissionNo', studentController.getDashboardData);
router.get('/class-teacher/:class/:section', studentController.getClassTeacher);
router.get('/attendance/:studentId', studentController.getAttendance);
router.get('/grievance/:studentId', verifyToken, studentController.getGrievances);
router.post('/grievance', verifyToken, studentController.createGrievance);

export default router;
