import express from 'express';
import controller from './controller.js';
import { verifyToken } from '../../middleware/auth.middleware.js';
import resultController from '../student/result.controller.js';
const router = express.Router();

router.get('/students/:class/:section', verifyToken, controller.getStudentsByClass);
router.get('/grievance/:class/:section', verifyToken, controller.getGrievancesByClass);
router.put('/grievance/reply/:id', verifyToken, controller.replyToGrievance);
router.get('/dashboard/kpi', verifyToken, controller.getDashboardKPI);
router.get('/timetable/today', verifyToken, controller.getTodayTimetable);
router.get('/timetable/unified', verifyToken, controller.getUnifiedTodaySchedule);
router.get('/dashboard/students', verifyToken, controller.getTeacherStudents);
router.put('/students/roll-number', verifyToken, controller.updateStudentRollNumber);
router.put('/students/reorder', verifyToken, controller.reorderRollNumbers);
router.get('/homework/summary', verifyToken, controller.getHomeworkSummary);
router.get('/dashboard/queries', verifyToken, controller.getTeacherGrievances);
router.get('/substitutions', verifyToken, controller.getTeacherSubstitutions);
router.get('/assignments', verifyToken, controller.getTeacherAssignments);
router.get('/alerts', verifyToken, controller.getTeacherAlerts);

// Attendance Operations
router.post('/attendance/mark', verifyToken, controller.markAttendance);
router.get('/attendance/:class/:date', verifyToken, controller.getAttendanceByClassAndDate);
router.post('/attendance/bulk', verifyToken, controller.bulkMarkAttendance);

router.get('/homework', verifyToken, controller.getHomeworkList);
router.get('/homework/stats/:id', verifyToken, controller.getHomeworkStats);
router.post('/homework', verifyToken, controller.createHomework);
router.put('/homework/:id', verifyToken, controller.updateHomework);
router.post('/homework/submission/status', verifyToken, controller.updateStudentSubmissionStatus);

router.get('/exams/:class', verifyToken, controller.getExamsByClass);
router.post('/exams', verifyToken, controller.createExam);

router.post('/results/bulk', verifyToken, resultController.addBulkResults);

export default router;
