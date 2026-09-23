import teacherController from './teacher.controller.js';
import homeworkController from './homework.controller.js';

export default {
  ...teacherController,
  ...homeworkController
};
