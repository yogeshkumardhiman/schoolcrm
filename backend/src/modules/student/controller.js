import studentController from './student.controller.js';
import resultController from './result.controller.js';

export default {
  ...studentController,
  ...resultController
};
