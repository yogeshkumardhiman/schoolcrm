import express from 'express';
import controller from './controller.js';
import adminController from '../admin/admin.controller.js';
import { verifyToken, canManageAppSettings, authorize } from '../../middleware/auth.middleware.js';
import {
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getAllWebBanners,
  createWebBanner,
  updateWebBanner,
  deleteWebBanner
} from '../admin/settings.controller.js';

const router = express.Router();

// Backward compatible mobile settings
router.get('/mobile', controller.getMobileSettings);
router.put('/mobile', verifyToken, canManageAppSettings, controller.updateMobileSettings);
router.get('/school-info', adminController.getSchoolInfo);
router.post('/school-info', verifyToken, authorize(['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']), adminController.updateSchoolInfo);


// New standard endpoints aligning with crmadmin service
router.get('/settings/config', verifyToken, controller.getMobileSettings);
router.put('/settings/config', verifyToken, canManageAppSettings, controller.updateMobileSettings);
router.get('/settings/school-info', adminController.getSchoolInfo);
router.post('/settings/school-info', verifyToken, authorize(['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']), adminController.updateSchoolInfo);

router.get('/settings/banners', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN', 'SUPER_ADMIN', 'MANAGEMENT']), getAllBanners);
router.post('/settings/banners', verifyToken, canManageAppSettings, createBanner);
router.put('/settings/banners/:id', verifyToken, canManageAppSettings, updateBanner);
router.delete('/settings/banners/:id', verifyToken, canManageAppSettings, deleteBanner);

router.get('/settings/web-banners', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN', 'SUPER_ADMIN', 'MANAGEMENT']), getAllWebBanners);
router.post('/settings/web-banners', verifyToken, canManageAppSettings, createWebBanner);
router.put('/settings/web-banners/:id', verifyToken, canManageAppSettings, updateWebBanner);
router.delete('/settings/web-banners/:id', verifyToken, canManageAppSettings, deleteWebBanner);

export default router;
