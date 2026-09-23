export interface DashboardSummary {
  totalStudents: number;
  totalStaff: number;
  totalTeachers: number;
  activeToppers: number;
  pendingGrievances: number;
  attendancePercentage: string;
  staffAttendancePercentage: string;
  absentTeachersToday: number;
  activeSubstitutions: number;
  overdueTasks: number;
  todaySummary: {
    teachersAbsent: number;
    activeClasses: number;
    attendanceLogged: boolean;
    collectionToday: number;
  };
  actionRequired: Array<{
    id: string;
    priority: string;
    title: string;
    desc: string;
    action: string;
    link: string;
  }>;
  quickActions: Array<{
    id: string;
    label: string;
    icon: string;
    color: string;
  }>;
  healthScores: {
    operational: number;
    financial: number;
    academic: number;
    security: number;
  };
  classDistribution: Array<{
    class: string;
    count: number;
  }>;
}

export interface ComplianceDoc {
  id: number;
  title: string;
  category?: string;
  url: string;
  uploadDate: string;
}

export interface ActivityLog {
  id: number;
  action: string;
  performedBy: string;
  role: string;
  details: string;
  createdAt: string;
}
