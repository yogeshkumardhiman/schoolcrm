export interface SalaryStructure {
  id: number;
  staffId: number;
  basicPay: number;
  allowance: number;
  deductions: number;
  netSalary: number;
}

export interface SalaryPayment {
  id: number;
  staffId: number;
  month: string;
  amountPaid: number;
  paymentMode: string;
  transactionId?: string;
  remark?: string;
  paymentDate: string;
}

export interface PaySalaryPayload {
  staffId: number;
  month: string;
  amountPaid: number;
  paymentMode: string;
  transactionId?: string;
  remark?: string;
}
