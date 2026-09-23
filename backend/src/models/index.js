import sequelize from '../config/database.js';
import Student from './Student.js';
import Staff from './Staff.js';
import Topper from './Topper.js';
import Admin from './Admin.js';
import Attendance from './Attendance.js';
import Homework from './Homework.js';
import HomeworkSubmission from './HomeworkSubmission.js';
import Notice from './Notice.js';
import Event from './Event.js';
import Testimonial from './Testimonial.js';
import ComplianceDoc from './ComplianceDoc.js';
import Grievance from './Grievance.js';
import Result from './Result.js';
import StaffLeaveRequest from './StaffLeaveRequest.js';
import SubstitutionAssignment from './SubstitutionAssignment.js';
import StaffAttendance from './StaffAttendance.js';
import StaffTimetable from './StaffTimetable.js';
import Gallery from './Gallery.js';
import SchoolInfo from './SchoolInfo.js';
import FeeHead from './FeeHead.js';
import ClassFeeStructure from './ClassFeeStructure.js';
import FeeDue from './FeeDue.js';
import FeePayment from './FeePayment.js';
import TransportRoute from './TransportRoute.js';
import TransportStop from './TransportStop.js';
import StudentFeeAssignment from './StudentFeeAssignment.js';
import SalaryStructure from './SalaryStructure.js';
import SalaryPayment from './SalaryPayment.js';
import Role from './Role.js';
import ActivityLog from './ActivityLog.js';
import Fee from './Fee.js';
import SchoolSettings from './SchoolSettings.js';
import AppBanner from './AppBanner.js';
import WebBanner from './WebBanner.js';
import Exam from './Exam.js';
import OnlineTransaction from './OnlineTransaction.js';
import FeeStructure from './FeeStructure.js';
import StudentFee from './StudentFee.js';
import Transport from './Transport.js';

// --- Associations ---

// Staff & Roles
Role.hasMany(Staff, { foreignKey: 'role', sourceKey: 'name', as: 'staffMembers' });
Staff.belongsTo(Role, { foreignKey: 'role', targetKey: 'name', as: 'dynamicRole' });

Role.hasMany(Admin, { foreignKey: 'roleId', as: 'adminMembers' });
Admin.belongsTo(Role, { foreignKey: 'roleId', as: 'dynamicRole' });

// --- Legacy Associations ---
Homework.hasMany(HomeworkSubmission, { foreignKey: 'homeworkId', as: 'submissions' });
HomeworkSubmission.belongsTo(Homework, { foreignKey: 'homeworkId', as: 'homework' });

Staff.hasMany(Homework, { foreignKey: 'teacherId', as: 'assignments' });
Homework.belongsTo(Staff, { foreignKey: 'teacherId', as: 'teacher' });

Staff.hasMany(StaffLeaveRequest, { foreignKey: 'staffId', as: 'leaveRequests' });
StaffLeaveRequest.belongsTo(Staff, { foreignKey: 'staffId', as: 'staff' });

Staff.hasMany(StaffAttendance, { foreignKey: 'staffId', as: 'attendance' });
StaffAttendance.belongsTo(Staff, { foreignKey: 'staffId', as: 'staff' });

Staff.hasMany(StaffTimetable, { foreignKey: 'staffId', as: 'timetable' });
StaffTimetable.belongsTo(Staff, { foreignKey: 'staffId', as: 'staff' });

SubstitutionAssignment.belongsTo(Staff, { foreignKey: 'absentTeacherId', as: 'absentTeacher' });
SubstitutionAssignment.belongsTo(Staff, { foreignKey: 'substituteTeacherId', as: 'substituteTeacher' });

Student.hasMany(Attendance, { foreignKey: 'studentId', as: 'attendance' });
Attendance.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

Student.hasMany(Result, { foreignKey: 'studentId', as: 'results' });
Result.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// --- Dynamic Fee Associations ---
FeeHead.hasMany(ClassFeeStructure, { foreignKey: 'feeHeadId', as: 'classStructures' });
ClassFeeStructure.belongsTo(FeeHead, { foreignKey: 'feeHeadId', as: 'feeHead' });

Student.hasMany(FeeDue, { foreignKey: 'studentId', as: 'feeDues' });
FeeDue.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

Student.hasMany(FeePayment, { foreignKey: 'studentId', as: 'payments' });
FeePayment.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

Student.hasMany(StudentFeeAssignment, { foreignKey: 'studentId', as: 'feeAssignments' });
StudentFeeAssignment.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

Student.hasMany(OnlineTransaction, { foreignKey: 'studentId', as: 'onlineTransactions' });
OnlineTransaction.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// Legacy Fee Associations
Student.hasMany(StudentFee, { foreignKey: 'studentId', as: 'feeDetails' });
StudentFee.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
StudentFee.belongsTo(FeeStructure, { foreignKey: 'class', targetKey: 'class', as: 'structure' });
FeeStructure.hasMany(StudentFee, { foreignKey: 'class', sourceKey: 'class', as: 'studentFees' });
StudentFee.belongsTo(Transport, { foreignKey: 'transportRouteId', as: 'transportRoute' });
Transport.hasMany(StudentFee, { foreignKey: 'transportRouteId', as: 'studentFees' });

FeeHead.hasMany(StudentFeeAssignment, { foreignKey: 'feeHeadId', as: 'feeAssignments' });
StudentFeeAssignment.belongsTo(FeeHead, { foreignKey: 'feeHeadId', as: 'feeHead' });

// --- Transport ---
TransportRoute.hasMany(TransportStop, { foreignKey: 'routeId', as: 'stops' });
TransportStop.belongsTo(TransportRoute, { foreignKey: 'routeId', as: 'route' });

Student.belongsTo(TransportStop, { foreignKey: 'transportStopId', as: 'transportStop' });
TransportStop.hasMany(Student, { foreignKey: 'transportStopId', as: 'students' });

Student.belongsTo(TransportRoute, { foreignKey: 'transportRouteId', as: 'transportRoute' });
TransportRoute.hasMany(Student, { foreignKey: 'transportRouteId', as: 'students' });

// --- Staff Salary ---
Staff.hasOne(SalaryStructure, { foreignKey: 'staffId', as: 'salaryStructure' });
SalaryStructure.belongsTo(Staff, { foreignKey: 'staffId', as: 'staff' });

Staff.hasMany(SalaryPayment, { foreignKey: 'staffId', as: 'salaryPayments' });
SalaryPayment.belongsTo(Staff, { foreignKey: 'staffId', as: 'staff' });

export {
  sequelize,
  Student,
  Staff,
  Topper,
  Admin,
  Attendance,
  Homework,
  HomeworkSubmission,
  Notice,
  Event,
  Testimonial,
  ComplianceDoc,
  Grievance,
  Result,
  StaffLeaveRequest,
  SubstitutionAssignment,
  StaffAttendance,
  StaffTimetable,
  Gallery,
  SchoolInfo,
  FeeHead,
  ClassFeeStructure,
  FeeDue,
  FeePayment,
  TransportRoute,
  TransportStop,
  StudentFeeAssignment,
  SalaryStructure,
  SalaryPayment,
  Role,
  ActivityLog,
  Fee,
  SchoolSettings,
  AppBanner,
  WebBanner,
  Exam,
  OnlineTransaction,
  FeeStructure,
  StudentFee,
  Transport
};

