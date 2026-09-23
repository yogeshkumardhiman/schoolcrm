import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalaryStructureEntity } from './entities/salary-structure.entity';
import { SalaryPaymentEntity } from './entities/salary-payment.entity';
import { StaffEntity } from '../staff/entities/staff.entity';
import { CreateSalaryStructureDto } from './dto/create-salary-structure.dto';
import { ProcessSalaryPaymentDto } from './dto/process-salary-payment.dto';

@Injectable()
export class SalaryService {
  constructor(
    @InjectRepository(SalaryStructureEntity)
    private readonly salaryStructureRepository: Repository<SalaryStructureEntity>,
    @InjectRepository(SalaryPaymentEntity)
    private readonly salaryPaymentRepository: Repository<SalaryPaymentEntity>,
    @InjectRepository(StaffEntity)
    private readonly staffRepository: Repository<StaffEntity>,
  ) {}

  async findAllStructures(): Promise<any> {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();

    const [staffMembers, structures, payments] = await Promise.all([
      this.staffRepository.find({ order: { name: 'ASC' } }),
      this.salaryStructureRepository.find(),
      this.salaryPaymentRepository.find({
        where: { month: currentMonth, year: currentYear },
      }),
    ]);

    const structureMap = new Map<number, SalaryStructureEntity>();
    structures.forEach((s) => structureMap.set(s.staffId, s));

    const paidMap = new Map<number, SalaryPaymentEntity>();
    payments.forEach((p) => paidMap.set(p.staffId, p));

    const totalPaidThisMonth = payments.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0,
    );

    const staffWithSalary = staffMembers.map((staff) => {
      const struct = structureMap.get(staff.id);
      const paid = paidMap.get(staff.id);
      return {
        ...staff,
        salaryStructure: struct || {
          baseSalary: 25000,
          allowances: 3000,
          deductions: 1000,
          netSalary: 27000,
        },
        paymentStatus: paid ? 'PAID' : 'PENDING',
        lastPayment: paid || null,
      };
    });

    const pendingStaff = staffWithSalary.filter(
      (s) => s.paymentStatus === 'PENDING',
    ).length;

    return {
      staff: staffWithSalary,
      totalPaidThisMonth,
      pendingStaff,
      totalStaff: staffMembers.length,
    };
  }

  async findStaffStructure(staffId: number): Promise<SalaryStructureEntity> {
    const structure = await this.salaryStructureRepository.findOne({
      where: { staffId },
      relations: { staff: true },
    });
    if (!structure) {
      throw new NotFoundException(`Salary structure for staff ID ${staffId} not found`);
    }
    return structure;
  }

  async saveSalaryStructure(dto: CreateSalaryStructureDto): Promise<SalaryStructureEntity> {
    const staff = await this.staffRepository.findOne({ where: { id: dto.staffId } });
    if (!staff) {
      throw new NotFoundException(`Staff with ID ${dto.staffId} not found`);
    }

    const base = Number(dto.baseSalary || 0);
    const allow = Number(dto.allowances || 0);
    const deduct = Number(dto.deductions || 0);
    const net = base + allow - deduct;

    const existing = await this.salaryStructureRepository.findOne({
      where: { staffId: dto.staffId },
    });

    if (existing) {
      existing.baseSalary = base;
      existing.allowances = allow;
      existing.deductions = deduct;
      existing.netSalary = net;
      return this.salaryStructureRepository.save(existing);
    }

    const structure = this.salaryStructureRepository.create({
      staffId: dto.staffId,
      baseSalary: base,
      allowances: allow,
      deductions: deduct,
      netSalary: net,
    });
    return this.salaryStructureRepository.save(structure);
  }

  async getStaffPayments(staffId: number): Promise<SalaryPaymentEntity[]> {
    return this.salaryPaymentRepository.find({
      where: { staffId },
      relations: { staff: true },
      order: { year: 'DESC', id: 'DESC' },
    });
  }

  async getPaymentById(paymentId: number): Promise<SalaryPaymentEntity> {
    const payment = await this.salaryPaymentRepository.findOne({
      where: { id: paymentId },
      relations: { staff: true },
    });
    if (!payment) {
      throw new NotFoundException(`Salary payment #${paymentId} not found`);
    }
    return payment;
  }

  async processSalaryPayment(dto: ProcessSalaryPaymentDto): Promise<SalaryPaymentEntity> {
    const staff = await this.staffRepository.findOne({ where: { id: dto.staffId } });
    if (!staff) {
      throw new NotFoundException(`Staff with ID ${dto.staffId} not found`);
    }

    const paymentDate = dto.paymentDate || new Date().toISOString().split('T')[0];

    // Check if salary for this month + year was already recorded
    const existingPayment = await this.salaryPaymentRepository.findOne({
      where: {
        staffId: dto.staffId,
        month: dto.month,
        year: dto.year,
      },
    });

    if (existingPayment) {
      existingPayment.amount = dto.amount;
      existingPayment.paymentDate = paymentDate;
      existingPayment.remark = dto.remark || existingPayment.remark;
      existingPayment.status = 'PAID';
      return this.salaryPaymentRepository.save(existingPayment);
    }

    const payment = this.salaryPaymentRepository.create({
      ...dto,
      status: 'PAID',
      paymentDate,
    });
    return this.salaryPaymentRepository.save(payment);
  }
}
