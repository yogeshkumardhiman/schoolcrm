import adminController from '../admin/admin.controller.js';
import * as roleController from '../admin/role.controller.js';

export default {
  ...adminController,
  ...roleController
};
