export interface AuthUser {
  id: number;
  userId?: number;
  name?: string;
  email?: string;
  userType: 'ADMIN' | 'STAFF' | 'STUDENT' | 'PARENT';
  role: string;
  permissions: string[];
  staffProfile?: any;
  studentProfile?: any;
}

export interface LoginPayload {
  loginId?: string;
  email?: string;
  password: string;
  role?: string;
  clientType?: string;
}

export interface LoginResponse {
  token: string;
  role: string;
  user: AuthUser;
}
