import express from 'express';
import controller from './controller.js';
import { verifyToken } from '../../middleware/auth.middleware.js';
const router = express.Router();

router.get('/', controller.getStudents);
router.get('/results/:studentId', verifyToken, controller.getResultsByStudent);
router.get('/results/bulk/:className/:section', verifyToken, controller.getResultsByClass);
router.get('/search/:admissionNo', verifyToken, controller.getStudentByAdmission);
router.get('/:id', verifyToken, controller.getStudentById);
router.get('/timetable/:class/:section', controller.getClassTimetable);
router.get('/homework/:class/:section', controller.getHomeworkByClass);
router.get('/dashboard/:admissionNo', controller.getDashboardData);
router.get('/class-teacher/:class/:section', controller.getClassTeacher);
router.get('/grievance/:studentId', verifyToken, controller.getGrievances);
router.post('/grievance', verifyToken, controller.createGrievance);

export default router;
