export interface FeeHead {
  id: number;
  name: string;
  description?: string;
  isRecurring: boolean;
}

export interface FeeStructure {
  id: number;
  class: string;
  tuitionFee: number;
  annualFee: number;
  admissionFee: number;
  examFee: number;
  transportFee: number;
}

export interface FeeDue {
  id: number;
  studentId: number;
  month: string;
  amountDue: number;
  dueDate?: string;
  status: string;
}

export interface FeePayment {
  id: number;
  studentId: number;
  amountPaid: number;
  month?: string;
  paymentMode: string;
  transactionId?: string;
  remark?: string;
  paymentDate: string;
}

export interface PayFeePayload {
  studentId: number;
  amountPaid: number;
  month?: string;
  paymentMode: string;
  transactionId?: string;
  remark?: string;
}
