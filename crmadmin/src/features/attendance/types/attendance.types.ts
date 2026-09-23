export interface AttendanceRecord {
  id: number;
  studentId: number;
  class: string;
  section: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'HALF_DAY' | 'HALF DAY' | 'LATE' | 'HOLIDAY';
  session?: string;
  studentName?: string;
  rollNo?: string;
}

export interface MarkAttendancePayload {
  studentId: number;
  class: string;
  section: string;
  date: string;
  status: string;
}

export interface BulkMarkAttendancePayload {
  class: string;
  section: string;
  date: string;
  records: Array<{ studentId: number; status: string }>;
}
