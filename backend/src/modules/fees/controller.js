import feeController from '../financial/fee.controller.js';
import * as paymentController from './payment.controller.js';

export default {
  ...feeController,
  ...paymentController
};
