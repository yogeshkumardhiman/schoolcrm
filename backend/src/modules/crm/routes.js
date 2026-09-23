import express from 'express';
import controller from './controller.js';
import adminController from '../admin/admin.controller.js';
import { verifyToken, authorize } from '../../middleware/auth.middleware.js';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let type = req.query.type || req.body.type || 'documents';
    const allowedTypes = ['students', 'staff', 'gallery', 'documents', 'certificates'];
    if (!allowedTypes.includes(type)) {
      type = 'documents';
    }
    const pathDir = path.join('uploads', type);
    fs.mkdirSync(pathDir, { recursive: true });
    cb(null, pathDir);
  },
  filename: (req, file, cb) => {
    const sanitizedName = (file.originalname || '').replace(/\s+/g, '_');
    cb(null, `identity-${Date.now()}-${sanitizedName}`);
  }
});
const upload = multer({ storage });

router.get('/dashboard-summary', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT', 'ADMIN', 'MANAGEMENT', 'SUPER_ADMIN', 'TEACHER']), controller.getDashboardSummary);
router.get('/dev/seed', controller.adminStaff.seedData);

router.get('/roles', verifyToken, authorize(['SUPER_ADMIN']), controller.getAllRoles);
router.post('/roles', verifyToken, authorize(['SUPER_ADMIN']), controller.createRole);
router.put('/roles/:id', verifyToken, authorize(['SUPER_ADMIN']), controller.updateRole);
router.delete('/roles/:id', verifyToken, authorize(['SUPER_ADMIN']), controller.deleteRole);

router.get('/staff', verifyToken, authorize(['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'MANAGEMENT', 'ACCOUNTANT', 'CLERK']), controller.adminStaff.list);
router.post('/staff', verifyToken, authorize(['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'MANAGEMENT', 'ACCOUNTANT', 'CLERK']), controller.adminStaff.create);
router.get('/staff/personal-profile', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT', 'ADMIN', 'MANAGEMENT', 'SUPER_ADMIN', 'TEACHER']), controller.getStaffPersonalProfile);
router.get('/staff/:id', verifyToken, authorize(['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'MANAGEMENT', 'ACCOUNTANT', 'CLERK']), controller.adminStaff.getById);
router.put('/staff/:id', verifyToken, authorize(['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'MANAGEMENT', 'ACCOUNTANT', 'CLERK']), controller.adminStaff.update);
router.delete('/staff/:id', verifyToken, authorize(['SUPER_ADMIN', 'ADMIN']), controller.adminStaff.delete);

router.put('/staff/:id/role', verifyToken, authorize(['SUPER_ADMIN']), controller.adminStaff.updateRole);
router.put('/staff/:id/permissions', verifyToken, authorize(['SUPER_ADMIN']), controller.adminStaff.updatePermissions);

router.get('/all-grievances', verifyToken, authorize(['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']), controller.getGrievances);

router.post('/upload', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN', 'MANAGEMENT']), upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Upload failure: No file detected.' });
  const relativePath = req.file.path.replace(/\\/g, '/');
  const url = `${req.protocol}://${req.get('host')}/${relativePath}`;
  res.json({ url });
});

export default router;
