
import ActivityLog from '../../models/ActivityLog.js';

/**
 * Logs an activity to the database asynchronously.
 * Does not block the main request flow.
 */
export const logActivity = async ({ req, action, subject, details, status = 'SUCCESS' }) => {
  try {
    const logData = {
      userId: req?.user?.id || null,
      userName: req?.user?.name || req?.user?.email || 'System',
      userRole: req?.user?.role || 'SYSTEM',
      action,
      subject,
      details,
      ipAddress: req?.ip || req?.headers?.['x-forwarded-for'] || '127.0.0.1',
      status
    };

    // Fire and forget (optional: await if you want to ensure it's logged)
    ActivityLog.create(logData).catch(err => {
      console.error("[Logger Utility] Failed to save activity log:", err.message);
    });
  } catch (err) {
    console.error("[Logger Utility] Critical Failure:", err.message);
  }
};

/**
 * Custom Error Class for API responses
 */
export class ApiError extends Error {
  constructor(statusCode, message, detail = null) {
    super(message);
    this.statusCode = statusCode;
    this.detail = detail;
    Error.captureStackTrace(this, this.constructor);
  }
}
