export interface Homework {
  id: number;
  class: string;
  section: string;
  subject: string;
  title: string;
  description?: string;
  dueDate: string;
  attachmentUrl?: string;
  teacherId?: number;
}

export interface HomeworkSubmission {
  id: number;
  homeworkId: number;
  studentId: number;
  submissionText?: string;
  fileUrl?: string;
  status: string;
  feedback?: string;
  marks?: string;
}

export interface Result {
  id: number;
  studentId: number;
  examName: string;
  subject: string;
  marksObtained: number;
  maxMarks: number;
  grade?: string;
  remarks?: string;
}
