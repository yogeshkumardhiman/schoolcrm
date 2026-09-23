import studentController from '../student/student.controller.js';
import teacherController from '../teacher/teacher.controller.js';
import adminController from '../admin/admin.controller.js';
import staffController from '../staff/staff.controller.js';

export default {
  // Student side
  getStudentAttendance: studentController.getStudentAttendance,
  getAttendance: studentController.getAttendance,

  // Teacher side
  markAttendance: teacherController.markAttendance,
  bulkMarkAttendance: teacherController.bulkMarkAttendance,
  getAttendanceByClassAndDate: teacherController.getAttendanceByClassAndDate,

  // Staff/Admin side
  getStaffAttendance: adminController.adminStaff.getAttendance,
  markStaffAttendance: adminController.adminStaff.markAttendance,
  getLastScan: staffController.getLastScan
};
