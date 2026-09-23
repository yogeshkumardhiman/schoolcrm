import express from 'express';
const router = express.Router();
import { verifyToken } from '../../middleware/auth.middleware.js';
import teacherController from './teacher.controller.js';
import homeworkController from './homework.controller.js';
import resultController from '../student/result.controller.js';

// Students & Grievances
router.get('/students/:class/:section', verifyToken, teacherController.getStudentsByClass);

// Grievances
router.get('/grievance/:class/:section', verifyToken, teacherController.getGrievancesByClass);
router.put('/grievance/reply/:id', verifyToken, teacherController.replyToGrievance);

// Modular Dashboard APIs
router.get('/dashboard/kpi', verifyToken, teacherController.getDashboardKPI);
router.get('/timetable/today', verifyToken, teacherController.getTodayTimetable);
router.get('/timetable/unified', verifyToken, teacherController.getUnifiedTodaySchedule);
router.get('/dashboard/students', verifyToken, teacherController.getTeacherStudents);
router.put('/students/roll-number', verifyToken, teacherController.updateStudentRollNumber);
router.put('/students/reorder', verifyToken, teacherController.reorderRollNumbers);
router.get('/homework/summary', verifyToken, teacherController.getHomeworkSummary);
router.get('/dashboard/queries', verifyToken, teacherController.getTeacherGrievances);
router.get('/substitutions', verifyToken, teacherController.getTeacherSubstitutions);
router.get('/assignments', verifyToken, teacherController.getTeacherAssignments);
router.get('/alerts', verifyToken, teacherController.getTeacherAlerts);

// Legacy (deprecated)
router.get('/dashboard-summary', verifyToken, teacherController.getTeacherDashboardSummary);

// Attendance Operations
router.post('/attendance/mark', verifyToken, teacherController.markAttendance);
router.get('/attendance/:class/:date', verifyToken, teacherController.getAttendanceByClassAndDate);
router.post('/attendance/bulk', verifyToken, teacherController.bulkMarkAttendance);

// Homework & Results Operations
router.get('/homework', verifyToken, homeworkController.getHomeworkList);
router.get('/homework/stats/:id', verifyToken, homeworkController.getHomeworkStats);
router.post('/homework', verifyToken, homeworkController.createHomework);
router.put('/homework/:id', verifyToken, homeworkController.updateHomework);
router.post('/homework/submission/status', verifyToken, homeworkController.updateStudentSubmissionStatus);

// Exam Registry Operations
router.get('/exams/:class', verifyToken, teacherController.getExamsByClass);
router.post('/exams', verifyToken, teacherController.createExam);

// Academic Marks Allocation (Dynamic Dashboard Module)
router.post('/results/bulk', verifyToken, resultController.addBulkResults);

export default router;
