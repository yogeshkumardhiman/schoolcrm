import feeService from '../financial/fee.service.js';
import { sendFeeReminders } from '../financial/feeReminder.service.js';

export default {
  ...feeService,
  sendFeeReminders
};
