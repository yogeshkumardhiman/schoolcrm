import { SchoolSettings, AppBanner, WebBanner } from '../../models/index.js';
import { ApiError } from '../../common/utils/logger.js';

export const getMobileSettings = async (req, res, next) => {
  try {
    let settings = await SchoolSettings.findOne();
    if (!settings) {
      settings = await SchoolSettings.create({});
    }
    res.json(settings);
  } catch (err) {
    next(new ApiError(500, 'Failed to retrieve settings', err.message));
  }
};

export const updateMobileSettings = async (req, res, next) => {
  try {
    let settings = await SchoolSettings.findOne();
    if (!settings) {
      settings = await SchoolSettings.create(req.body);
    } else {
      await settings.update(req.body);
    }
    res.json(settings);
  } catch (err) {
    next(new ApiError(500, 'Failed to update settings', err.message));
  }
};

export const getAllBanners = async (req, res, next) => {
  try {
    const banners = await AppBanner.findAll({ order: [['display_order', 'ASC']] });
    res.json(banners);
  } catch (err) {
    next(new ApiError(500, 'Failed to retrieve banners', err.message));
  }
};

export const createBanner = async (req, res, next) => {
  try {
    const banner = await AppBanner.create(req.body);
    res.status(201).json(banner);
  } catch (err) {
    next(new ApiError(500, 'Failed to create banner', err.message));
  }
};

export const updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = await AppBanner.findByPk(id);
    if (!banner) {
      throw new ApiError(404, 'Banner not found');
    }
    await banner.update(req.body);
    res.json(banner);
  } catch (err) {
    next(new ApiError(500, 'Failed to update banner', err.message));
  }
};

export const deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = await AppBanner.findByPk(id);
    if (!banner) {
      throw new ApiError(404, 'Banner not found');
    }
    await banner.destroy();
    res.json({ success: true, message: 'Banner deleted successfully' });
  } catch (err) {
    next(new ApiError(500, 'Failed to delete banner', err.message));
  }
};

export const getAllWebBanners = async (req, res, next) => {
  try {
    const banners = await WebBanner.findAll({ order: [['display_order', 'ASC']] });
    res.json(banners);
  } catch (err) {
    next(new ApiError(500, 'Failed to retrieve web banners', err.message));
  }
};

export const createWebBanner = async (req, res, next) => {
  try {
    const banner = await WebBanner.create(req.body);
    res.status(201).json(banner);
  } catch (err) {
    next(new ApiError(500, 'Failed to create web banner', err.message));
  }
};

export const updateWebBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = await WebBanner.findByPk(id);
    if (!banner) {
      throw new ApiError(404, 'Web banner not found');
    }
    await banner.update(req.body);
    res.json(banner);
  } catch (err) {
    next(new ApiError(500, 'Failed to update web banner', err.message));
  }
};

export const deleteWebBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = await WebBanner.findByPk(id);
    if (!banner) {
      throw new ApiError(404, 'Web banner not found');
    }
    await banner.destroy();
    res.json({ success: true, message: 'Web banner deleted successfully' });
  } catch (err) {
    next(new ApiError(500, 'Failed to delete web banner', err.message));
  }
};
