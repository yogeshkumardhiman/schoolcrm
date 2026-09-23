export enum Permission {
  // RBAC Management
  RBAC_ROLE_MANAGE = 'rbac:role_manage',
  RBAC_PERMISSION_ASSIGN = 'rbac:permission_assign',

  // Students
  STUDENT_READ = 'student:read',
  STUDENT_CREATE = 'student:create',
  STUDENT_UPDATE = 'student:update',
  STUDENT_DELETE = 'student:delete',

  // Staff
  STAFF_READ = 'staff:read',
  STAFF_CREATE = 'staff:create',
  STAFF_UPDATE = 'staff:update',
  STAFF_DELETE = 'staff:delete',
  STAFF_ATTENDANCE_MANAGE = 'staff:attendance:manage',
  STAFF_LEAVE_MANAGE = 'staff:leave:manage',
  SUBSTITUTION_MANAGE = 'substitution:manage',

  // Attendance
  ATTENDANCE_READ = 'attendance:read',
  ATTENDANCE_MARK = 'attendance:mark',
  ATTENDANCE_REPORT = 'attendance:report',

  // Fees & Dues
  FEE_READ = 'fee:read',
  FEE_STRUCTURE_MANAGE = 'fee:structure_manage',
  FEE_ASSIGN = 'fee:assign',
  FEE_COLLECT = 'fee:collect',
  FEE_REPORT = 'fee:report',

  // Salary & Payroll
  SALARY_READ = 'salary:read',
  SALARY_STRUCTURE_MANAGE = 'salary:structure_manage',
  SALARY_PAY = 'salary:pay',

  // Transport
  TRANSPORT_READ = 'transport:read',
  TRANSPORT_MANAGE = 'transport:manage',

  // Academic & Exams
  ACADEMIC_READ = 'academic:read',
  ACADEMIC_MANAGE = 'academic:manage',
  EXAM_MANAGE = 'exam:manage',
  HOMEWORK_MANAGE = 'homework:manage',
  TIMETABLE_MANAGE = 'timetable:manage',
  CALENDAR_MANAGE = 'calendar:manage',

  // Website CMS
  WEBSITE_READ = 'website:read',
  WEBSITE_MANAGE = 'website:manage',

  // Mobile App
  APP_MANAGE = 'app:manage',

  // Reports & Analytics
  REPORT_VIEW = 'report:view',
  REPORT_EXPORT = 'report:export',
}

export enum RoleType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  PRINCIPAL = 'PRINCIPAL',
  VICE_PRINCIPAL = 'VICE_PRINCIPAL',
  ACCOUNTANT = 'ACCOUNTANT',
  CLASS_TEACHER = 'CLASS_TEACHER',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}
