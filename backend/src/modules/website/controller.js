import publicController from '../public/public.controller.js';
import * as eventController from '../admin/event.controller.js';
import * as noticeController from '../admin/notice.controller.js';
import { 
  getMobileSettings,
  getAllBanners, 
  createBanner, 
  updateBanner, 
  deleteBanner,
  getAllWebBanners,
  createWebBanner,
  updateWebBanner,
  deleteWebBanner 
} from '../admin/settings.controller.js';

const bannerController = {
  getMobileSettings,
  getAllBanners, 
  createBanner, 
  updateBanner, 
  deleteBanner,
  getAllWebBanners,
  createWebBanner,
  updateWebBanner,
  deleteWebBanner
};

export default {
  ...publicController,
  ...eventController,
  ...noticeController,
  ...bannerController
};
