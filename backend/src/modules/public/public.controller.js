import { Topper, Notice, Event, Testimonial, Gallery, ComplianceDoc, SchoolInfo, Student, Staff } from '../../models/index.js';
import { ApiError } from '../../common/utils/logger.js';

export const getToppers = async (req, res, next) => {
  try {
    const data = await Topper.findAll({ order: [['rank', 'ASC']] });
    res.json(data);
  } catch (err) {
    next(new ApiError(500, 'Failed to retrieve toppers', err.message));
  }
};

export const getNotices = async (req, res, next) => {
  try {
    const data = await Notice.findAll({
      where: { class: null, targetRole: null }, // Public school-wide notices only
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    res.json(data);
  } catch (err) {
    next(new ApiError(500, 'Failed to retrieve notices', err.message));
  }
};

export const getEvents = async (req, res, next) => {
  try {
    const data = await Event.findAll({ order: [['date', 'ASC']] });
    res.json(data);
  } catch (err) {
    next(new ApiError(500, 'Failed to retrieve events', err.message));
  }
};

export const getTestimonials = async (req, res, next) => {
  try {
    const data = await Testimonial.findAll({ order: [['createdAt', 'DESC']] });
    res.json(data);
  } catch (err) {
    next(new ApiError(500, 'Failed to retrieve testimonials', err.message));
  }
};

export const getGallery = async (req, res, next) => {
  try {
    const data = await Gallery.findAll({ order: [['createdAt', 'DESC']] });
    res.json(data);
  } catch (err) {
    next(new ApiError(500, 'Failed to retrieve gallery images', err.message));
  }
};

export const getComplianceDocs = async (req, res, next) => {
  try {
    const data = await ComplianceDoc.findAll({ order: [['uploadDate', 'DESC']] });
    res.json(data);
  } catch (err) {
    next(new ApiError(500, 'Failed to retrieve compliance documents', err.message));
  }
};

export const getSchoolInfo = async (req, res, next) => {
  try {
    const info = await SchoolInfo.findOne();
    res.json(info || {});
  } catch (err) {
    next(new ApiError(500, 'Failed to retrieve school info', err.message));
  }
};

export const getStats = async (req, res, next) => {
  try {
    const studentsCount = await Student.count();
    const staffCount = await Staff.count();
    res.json({
      students: studentsCount || 600,
      teachers: staffCount || 30,
      experience: 15,
      labs: 4
    });
  } catch (err) {
    next(new ApiError(500, 'Failed to retrieve stats', err.message));
  }
};

export default {
  getToppers,
  getNotices,
  getEvents,
  getTestimonials,
  getGallery,
  getComplianceDocs,
  getSchoolInfo,
  getStats
};