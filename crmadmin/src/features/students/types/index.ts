export interface Student {
  id: number;
  userId?: number;
  name: string;
  class: string;
  section: string;
  rollNo?: string;
  phone?: string;
  fatherName?: string;
  motherName?: string;
  dob?: string;
  gender?: string;
  address?: string;
  admissionNo?: string;
  email?: string;
  bloodGroup?: string;
  feesStatus?: string;
  image?: string;
  session?: string;
  aadharNo?: string;
  transportOpted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentFilters {
  page?: number;
  limit?: number;
  search?: string;
  class?: string;
  section?: string;
}

export interface StudentsResponse {
  students: Student[];
  totalItems: number;
  totalPages: number;
}
