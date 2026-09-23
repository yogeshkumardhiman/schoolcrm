export interface Staff {
  id: number;
  userId?: number;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  designation?: string;
  department?: string;
  salary?: number;
  qualification?: string;
  experience?: string;
  joiningDate?: string;
  address?: string;
  image?: string;
  class?: string;
  section?: string;
  subject?: string;
  isActive?: boolean;
}

export interface TimetableSlot {
  id: number;
  staffId: number;
  day: string;
  periodNumber: number;
  class: string;
  section: string;
  subject: string;
  startTime?: string;
  endTime?: string;
}

export interface LeaveRequest {
  id: number;
  staffId: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}
