import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './modules/auth/routes.js';
import studentRoutes from './modules/student/routes.js';
import teacherRoutes from './modules/teacher/routes.js';
import staffRoutes from './modules/staff/routes.js';
import attendanceRoutes from './modules/attendance/routes.js';
import feesRoutes from './modules/fees/routes.js';
import salaryRoutes from './modules/salary/routes.js';
import transportRoutes from './modules/transport/routes.js';
import crmRoutes from './modules/crm/routes.js';
import websiteRoutes from './modules/website/routes.js';
import settingsRoutes from './modules/settings/routes.js';
import reportsRoutes from './modules/reports/routes.js';
import academicRoutes from './modules/academic/routes.js';

import publicController from './modules/website/controller.js';
import staffController from './modules/staff/controller.js';
import studentController from './modules/student/controller.js';
import passport from 'passport';
import { configurePassport } from './config/passport.js';
import { ApiError } from './common/utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Passport Initialization
configurePassport(passport);
app.use(passport.initialize());

// Legacy/Top-level compatibility routes
app.get('/api/notices', publicController.getNotices);
app.get('/api/toppers', publicController.getToppers);
app.get('/api/compliance', publicController.getComplianceDocs);
app.get('/api/stats', publicController.getStats);
app.get('/api/school-info', publicController.getSchoolInfo);
app.get('/api/gallery', publicController.getGallery);
app.get('/api/events', publicController.getEvents);
app.post('/api/admissions', (req, res) => res.json({ success: true, message: 'Admission inquiry submitted successfully' }));
app.post('/api/contact', (req, res) => res.json({ success: true, message: 'Contact message submitted successfully' }));
app.get('/api/student/results/:studentId', studentController.getResultsByStudent);
app.get('/api/homework', studentController.getHomeworkByClassQuery);
app.get('/api/student/homework/my-status', studentController.getHomeworkStatus);
app.post('/api/student/homework/status', studentController.updateHomeworkStatus);

// Health check (Works even during DB sync)
app.get('/api/health', (req, res) => res.json({ status: 'live', db: 'syncing' }));

// Versioned APIs (RESTful endpoints v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/teacher', teacherRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/transport', transportRoutes);
app.use('/api/v1/fees', feesRoutes);
app.use('/api/v1/salary', salaryRoutes);
app.use('/api/v1/website', websiteRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/crm', crmRoutes);
app.use('/api/v1/academic', academicRoutes);

// Legacy/Backward Compatible API Paths
app.use('/api', websiteRoutes);
app.use('/api/public', websiteRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/payment', feesRoutes);

app.use('/api/admin/staff', staffRoutes);
app.use('/api/admin', crmRoutes);
app.use('/api/admin/fees', feesRoutes);
app.use('/api/admin/salary', salaryRoutes);
app.use('/api/admin', settingsRoutes);
app.use('/api/admin', reportsRoutes);
app.use('/api/admin', academicRoutes);
app.use('/api/admin/transport', transportRoutes);

// Basic Health Check
app.get('/', (req, res) => {
  res.json({ message: "SDM Institutional API Live", status: "OK", version: "2.0.0" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  console.error(`[Global Error Handler] ${statusCode} - ${message}`);
  if (err.stack) console.error(err.stack);

  res.status(statusCode).json({
    error: message,
    detail: err.detail || 'A system-level exception occurred. Please contact administrator.',
    status: 'FAILURE'
  });
});

export default app;
