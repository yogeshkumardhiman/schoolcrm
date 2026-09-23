import express from 'express';
import controller from './controller.js';
import adminController from '../admin/admin.controller.js';
import { verifyToken, authorize, canManageAppSettings } from '../../middleware/auth.middleware.js';
const router = express.Router();

router.get('/toppers', controller.getToppers);
router.get('/notices', controller.getNotices);
router.get('/events', controller.getEvents);
router.get('/testimonials', controller.getTestimonials);
router.get('/gallery', controller.getGallery);

// Admin-side website management
router.get('/admin/gallery', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN', 'SUPER_ADMIN']), adminController.adminGallery.list);
router.post('/admin/gallery', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN', 'SUPER_ADMIN']), adminController.adminGallery.create);
router.put('/admin/gallery/:id', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN', 'SUPER_ADMIN']), adminController.adminGallery.update);
router.delete('/admin/gallery/:id', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN', 'SUPER_ADMIN']), adminController.adminGallery.delete);

router.get('/admin/testimonials', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN', 'SUPER_ADMIN']), adminController.adminTestimonials.list);
router.post('/admin/testimonials', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN', 'SUPER_ADMIN']), adminController.adminTestimonials.create);
router.put('/admin/testimonials/:id', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN', 'SUPER_ADMIN']), adminController.adminTestimonials.update);
router.delete('/admin/testimonials/:id', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN', 'SUPER_ADMIN']), adminController.adminTestimonials.delete);

router.get('/admin/toppers', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN', 'SUPER_ADMIN']), adminController.adminToppers.list);
router.post('/admin/toppers', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN', 'SUPER_ADMIN']), adminController.adminToppers.create);
router.put('/admin/toppers/:id', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN', 'SUPER_ADMIN']), adminController.adminToppers.update);
router.delete('/admin/toppers/:id', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN', 'SUPER_ADMIN']), adminController.adminToppers.delete);
router.post('/admin/toppers/auto-sync', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN', 'SUPER_ADMIN']), adminController.adminToppers.autoSync);

router.get('/admin/notices', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN', 'SUPER_ADMIN']), controller.listNotices);
router.post('/admin/notices', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN', 'SUPER_ADMIN']), controller.createNotice);
router.put('/admin/notices/:id', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN', 'SUPER_ADMIN']), controller.updateNotice);
router.delete('/admin/notices/:id', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN', 'SUPER_ADMIN']), controller.deleteNotice);

router.post('/admin/events', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN', 'SUPER_ADMIN']), controller.createEvent);
router.put('/admin/events/:id', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN', 'SUPER_ADMIN']), controller.updateEvent);
router.delete('/admin/events/:id', verifyToken, authorize(['PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN', 'SUPER_ADMIN']), controller.deleteEvent);

router.get('/settings', controller.getMobileSettings);
router.get('/banners', controller.getAllBanners);
router.post('/banners', verifyToken, canManageAppSettings, controller.createBanner);
router.put('/banners/:id', verifyToken, canManageAppSettings, controller.updateBanner);
router.delete('/banners/:id', verifyToken, canManageAppSettings, controller.deleteBanner);

router.get('/web-banners', controller.getAllWebBanners);
router.post('/web-banners', verifyToken, canManageAppSettings, controller.createWebBanner);
router.put('/web-banners/:id', verifyToken, canManageAppSettings, controller.updateWebBanner);
router.delete('/web-banners/:id', verifyToken, canManageAppSettings, controller.deleteWebBanner);

export default router;
