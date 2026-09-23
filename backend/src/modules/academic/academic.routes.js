
import express from 'express';
import adminController from '../admin/admin.controller.js';
import homeworkController from '../teacher/homework.controller.js';
import resultController from '../student/result.controller.js';
import { verifyToken, authorize } from '../../middleware/auth.middleware.js';

import * as academicController from './academic.controller.js';

const router = express.Router();

// Session Migration & Promotion
router.post('/promote', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN', 'MANAGEMENT', 'SUPER_ADMIN']), academicController.handlePromotion);

// Student Management
router.get('/students', verifyToken, adminController.adminStudents.list);
router.get('/students/:id', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT', 'TEACHER', 'ADMIN', 'MANAGEMENT']), adminController.adminStudents.getById);
router.post('/students', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT']), adminController.adminStudents.create);
router.put('/students/:id', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT']), adminController.adminStudents.update);
router.put('/students/bulk/section', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL']), adminController.adminStudents.bulkSectionUpdate);
router.delete('/students/:id', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL']), adminController.adminStudents.delete);
router.get('/students/get-next-id/:className', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT']), adminController.adminStudents.getNextId);
router.get('/students/dashboard/:id', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT', 'TEACHER', 'ADMIN', 'MANAGEMENT']), adminController.adminStudents.getStudentDashboardData);

// Classes
router.get('/classes', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT', 'ADMIN', 'MANAGEMENT', 'SUPER_ADMIN', 'TEACHER']), adminController.getClasses);

// Homework Governance
router.get('/homework', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER']), homeworkController.getHomeworkList);
router.get('/homework/analytics', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL']), homeworkController.getGlobalAnalytics);
router.get('/homework/stats/:id', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER']), homeworkController.getHomeworkStats);
router.post('/homework', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER']), homeworkController.createHomework);
router.put('/homework/:id', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER']), homeworkController.updateHomework);
router.delete('/homework/:id', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER']), homeworkController.deleteHomework);
router.post('/homework/submission/status', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER']), homeworkController.updateStudentSubmissionStatus);

// Results Management
router.post('/results', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'ADMIN', 'MANAGEMENT', 'SUPER_ADMIN']), resultController.addResult);
router.put('/results/:id', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'ADMIN', 'MANAGEMENT', 'SUPER_ADMIN']), resultController.updateResult);
router.put('/results/:id/verify', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'ADMIN', 'MANAGEMENT', 'SUPER_ADMIN']), resultController.verifyResult);
router.delete('/results/:id', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'ADMIN', 'MANAGEMENT', 'SUPER_ADMIN']), resultController.deleteResult);
router.get('/results/:studentId', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'ADMIN', 'MANAGEMENT', 'SUPER_ADMIN']), resultController.getResultsByStudent);

// Toppers
router.get('/toppers', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'SUPER_ADMIN', 'ADMIN']), adminController.adminToppers.list);
router.post('/toppers/auto-sync', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'SUPER_ADMIN', 'ADMIN']), adminController.adminToppers.autoSync);
router.post('/toppers', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'SUPER_ADMIN', 'ADMIN']), adminController.adminToppers.create);
router.put('/toppers/:id', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'SUPER_ADMIN', 'ADMIN']), adminController.adminToppers.update);
router.delete('/toppers/:id', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'SUPER_ADMIN', 'ADMIN']), adminController.adminToppers.delete);

export default router;
