import adminController from '../admin/admin.controller.js';
export default {
  getComplianceDocs: adminController.getComplianceDocs,
  uploadComplianceDoc: adminController.uploadComplianceDoc,
  deleteComplianceDoc: adminController.deleteComplianceDoc,
  getGrievances: adminController.getGrievances,
  getLogs: async (req, res, next) => {
    // Proxy to app.js raw logs query handler if needed, or implement directly
    const { ActivityLog } = await import('../../models/index.js');
    try {
      const logs = await ActivityLog.findAll({
        order: [['createdAt', 'DESC']],
        limit: 100
      });
      res.json(logs);
    } catch(err) {
      next(err);
    }
  }
};
