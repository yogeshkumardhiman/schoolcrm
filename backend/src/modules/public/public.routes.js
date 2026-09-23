import express from 'express';
const router = express.Router();
import publicController from './public.controller.js';
import { getMobileSettings, getActiveBanners, getActiveWebBanners } from './settings.controller.js';

router.get('/toppers', publicController.getToppers);
router.get('/notices', publicController.getNotices);
router.get('/events', publicController.getEvents);
router.get('/testimonials', publicController.getTestimonials);
router.get('/gallery', publicController.getGallery);

router.get('/settings', getMobileSettings);
router.get('/banners', getActiveBanners);
router.get('/web-banners', getActiveWebBanners);


export default router;
