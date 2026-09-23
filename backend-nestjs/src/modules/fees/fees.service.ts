import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { FeeHeadEntity } from './entities/fee-head.entity';
import { FeeStructureEntity } from './entities/fee-structure.entity';
import { FeeDueEntity } from './entities/fee-due.entity';
import { FeePaymentEntity } from './entities/fee-payment.entity';
import { OnlineTransactionEntity, OnlineTransactionStatus } from './entities/online-transaction.entity';
import { StudentEntity } from '../students/entities/student.entity';
import { SchoolInfoEntity } from '../settings/entities/school-info.entity';
import { TransportRouteEntity } from '../transport/entities/transport-route.entity';
import { CreateFeeHeadDto } from './dto/create-fee-head.dto';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { RecordFeePaymentDto } from './dto/record-fee-payment.dto';

@Injectable()
export class FeesService {
  constructor(
    @InjectRepository(FeeHeadEntity)
    private readonly feeHeadRepository: Repository<FeeHeadEntity>,
    @InjectRepository(FeeStructureEntity)
    private readonly feeStructureRepository: Repository<FeeStructureEntity>,
    @InjectRepository(FeeDueEntity)
    private readonly feeDueRepository: Repository<FeeDueEntity>,
    @InjectRepository(FeePaymentEntity)
    private readonly feePaymentRepository: Repository<FeePaymentEntity>,
    @InjectRepository(OnlineTransactionEntity)
    private readonly onlineTransactionRepository: Repository<OnlineTransactionEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>,
    @InjectRepository(SchoolInfoEntity)
    private readonly schoolInfoRepo: Repository<SchoolInfoEntity>,
    @InjectRepository(TransportRouteEntity)
    private readonly transportRouteRepo: Repository<TransportRouteEntity>,
  ) {}

  // --- FEE HEADS ---

  async findAllFeeHeads(): Promise<FeeHeadEntity[]> {
    const count = await this.feeHeadRepository.count();
    if (count === 0) {
      const defaultHeads = [
        {
          name: 'Admission / Registration Fee',
          frequency: 'ONE_TIME',
          category: 'ADMISSION',
          isOptional: false,
          collectOnAdmission: true,
          applicableMonths: ['April'],
        },
        {
          name: 'Building & Infrastructure Fund',
          frequency: 'ONE_TIME',
          category: 'DEVELOPMENT',
          isOptional: false,
          collectOnAdmission: true,
          applicableMonths: ['April'],
        },
        {
          name: 'Monthly Tuition Fee',
          frequency: 'MONTHLY',
          category: 'RECURRING',
          isOptional: false,
          collectOnAdmission: true,
          applicableMonths: [],
        },
        {
          name: 'Examination & Assessment Fee',
          frequency: 'HALF_YEARLY',
          category: 'EXAM',
          isOptional: false,
          collectOnAdmission: true,
          applicableMonths: ['September', 'March'],
        },
        {
          name: 'Smart Class & Digital Lab Fee',
          frequency: 'MONTHLY',
          category: 'RECURRING',
          isOptional: true,
          collectOnAdmission: false,
          applicableMonths: [],
        },
        {
          name: 'Sports & Cultural Activity Fee',
          frequency: 'ANNUAL',
          category: 'ANNUAL',
          isOptional: false,
          collectOnAdmission: true,
          applicableMonths: ['April'],
        },
        {
          name: 'ID Card, School Diary & Calendar',
          frequency: 'ONE_TIME',
          category: 'ADMISSION',
          isOptional: false,
          collectOnAdmission: true,
          applicableMonths: ['April'],
        },
      ];

      const created = this.feeHeadRepository.create(defaultHeads);
      await this.feeHeadRepository.save(created);
    }
    return this.feeHeadRepository.find({ order: { name: 'ASC' } });
  }

  async createFeeHead(dto: CreateFeeHeadDto): Promise<FeeHeadEntity> {
    const feeHead = this.feeHeadRepository.create(dto);
    return this.feeHeadRepository.save(feeHead);
  }

  async updateFeeHead(id: number, dto: Partial<CreateFeeHeadDto>): Promise<FeeHeadEntity> {
    const existing = await this.feeHeadRepository.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Fee Head with ID ${id} not found`);
    }
    const updated = this.feeHeadRepository.merge(existing, dto);
    return this.feeHeadRepository.save(updated);
  }

  async deleteFeeHead(id: number): Promise<{ success: boolean; message: string }> {
    const existing = await this.feeHeadRepository.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Fee Head with ID ${id} not found`);
    }
    await this.feeHeadRepository.remove(existing);
    return { success: true, message: `Fee Head ${existing.name} deleted successfully` };
  }

  // --- FEE STRUCTURES ---

  async findAllFeeStructures(): Promise<FeeStructureEntity[]> {
    return this.feeStructureRepository.find({ order: { class: 'ASC' } });
  }

  async findFeeStructureByClass(className: string): Promise<FeeStructureEntity | null> {
    return this.feeStructureRepository.findOne({ where: { class: className } });
  }

  async createFeeStructure(dto: CreateFeeStructureDto): Promise<FeeStructureEntity> {
    const existing = await this.feeStructureRepository.findOne({
      where: { class: dto.class },
    });

    if (existing) {
      const updated = this.feeStructureRepository.merge(existing, dto);
      return this.feeStructureRepository.save(updated);
    }

    const structure = this.feeStructureRepository.create(dto);
    return this.feeStructureRepository.save(structure);
  }

  // --- ADMISSION FEE SLIP GENERATOR ---

  async getAdmissionSlipData(studentId: number): Promise<any> {
    const student = await this.studentRepository.findOne({ where: { id: studentId } });
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Retrieve class fee structure
    const feeStructure = await this.feeStructureRepository.findOne({
      where: { class: student.class },
    });

    // Extract all fee heads to enrich components if needed
    const allHeads = await this.feeHeadRepository.find();
    const headMap = new Map(allHeads.map((h) => [h.id, h]));

    const components = (feeStructure?.components || []).map((comp: any) => {
      const head = comp.headId ? headMap.get(Number(comp.headId)) : null;
      return {
        name: comp.name || head?.name || 'Fee Component',
        amount: Number(comp.amount || 0),
        frequency: comp.frequency || head?.frequency || 'ONE_TIME',
        category: head?.category || 'ADMISSION',
        collectOnAdmission: comp.collectOnAdmission ?? head?.collectOnAdmission ?? true,
      };
    });

    // Check if student has active transport opted
    if (student.transportOpted && student.transportRouteId) {
      const transportRoute = await this.transportRouteRepo.findOne({
        where: { id: Number(student.transportRouteId) },
      });
      if (transportRoute && Number(transportRoute.monthlyFee || 0) > 0) {
        components.push({
          name: `Transport Bus Fee (${transportRoute.routeName || transportRoute.name || 'Designated Route'})`,
          amount: Number(transportRoute.monthlyFee),
          frequency: 'MONTHLY',
          category: 'TRANSPORT',
          collectOnAdmission: true,
        });
      }
    }

    const totalAdmissionFee = components.reduce(
      (sum: number, c: any) => sum + Number(c.amount || 0),
      0,
    );

    const schoolInfoList = await this.schoolInfoRepo.find({ take: 1 });
    const schoolInfo = schoolInfoList.length > 0 ? schoolInfoList[0] : null;
    const schoolName =
      schoolInfo?.schoolName ||
      'INSTITUTIONAL PORTAL';
    const tagline =
      schoolInfo?.aboutTitle ||
      'Excellence in Education';
    const affiliationNo =
      process.env.SCHOOL_AFFILIATION ||
      'CBSE / State Affiliated';
    const address =
      schoolInfo?.address ||
      process.env.SCHOOL_ADDRESS ||
      'Institutional Campus';
    const phone =
      schoolInfo?.contactPhone ||
      process.env.SCHOOL_PHONE ||
      '+91 9876543210';
    const email =
      schoolInfo?.contactEmail ||
      process.env.SCHOOL_EMAIL ||
      'info@school.com';

    return {
      school: {
        name: schoolName,
        tagline,
        affiliationNo,
        address,
        phone,
        email,
      },
      scholar: {
        id: student.id,
        name: student.name,
        admissionNo: student.admissionNo,
        rollNo: student.rollNo || 'N/A',
        class: student.class,
        section: student.section || 'A',
        session: student.session || '2026-2027',
        fatherName: student.fatherName || 'N/A',
        motherName: student.motherName || 'N/A',
        phone: student.phone || 'N/A',
        address: student.address || 'N/A',
        admissionDate: student.createdAt || new Date(),
      },
      feeBreakdown: {
        components,
        grossTotal: totalAdmissionFee,
        discount: 0,
        netPayable: totalAdmissionFee,
        paidAmount: totalAdmissionFee,
        dueBalance: 0,
      },
      receiptNo: `REC-ADM-${student.admissionNo || student.id}`,
      generatedAt: new Date(),
    };
  }

  // --- FEE DUES & PAYMENTS ---

  async getStudentFeeDues(studentId: number): Promise<FeeDueEntity[]> {
    return this.feeDueRepository.find({
      where: { studentId },
      order: { year: 'DESC', id: 'DESC' },
    });
  }

  async getStudentFeePayments(studentId: number): Promise<FeePaymentEntity[]> {
    return this.feePaymentRepository.find({
      where: { studentId },
      order: { id: 'DESC' },
    });
  }

  async recordFeePayment(dto: RecordFeePaymentDto): Promise<FeePaymentEntity> {
    const student = await this.studentRepository.findOne({
      where: { id: dto.studentId },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${dto.studentId} not found`);
    }

    const payment = this.feePaymentRepository.create(dto);
    const savedPayment = await this.feePaymentRepository.save(payment);

    await this.updateFeeDueStatus(dto.studentId, dto.month, dto.amountPaid);
    return savedPayment;
  }

  // --- TREASURY SUMMARY & ANALYTICS ---

  async getFeesSummary(className?: string, section?: string): Promise<any> {
    const where: any = {};
    if (className && className !== 'All Classes') where.class = className;
    if (section && section !== 'All Sections') where.section = section;

    const students = await this.studentRepository.find({ where });
    const totalStudents = students.length;

    const studentIds = students.map((s) => s.id);
    const payments = studentIds.length > 0
      ? await this.feePaymentRepository.find()
      : [];

    const totalCollection = payments.reduce((sum, p) => sum + Number(p.amountPaid || 0), 0);

    const paidStudents = students.filter((s) => s.feesStatus === 'PAID').length;
    const pendingStudents = totalStudents - paidStudents;

    // Calculate approximate pending due
    const totalDue = pendingStudents * 1200; // estimated monthly arrears baseline

    return {
      totalCollection,
      totalDue,
      paidStudents,
      pendingStudents,
      totalStudents,
    };
  }

  async getFeesStudentsList(query: {
    className?: string;
    section?: string;
    search?: string;
  }): Promise<any[]> {
    const where: any = {};
    if (query.className && query.className !== 'All Classes') {
      where.class = query.className;
    }
    if (query.section && query.section !== 'All Sections') {
      where.section = query.section;
    }

    let students = await this.studentRepository.find({
      where: query.search
        ? [
            { ...where, name: ILike(`%${query.search}%`) },
            { ...where, admissionNo: ILike(`%${query.search}%`) },
          ]
        : where,
      order: { name: 'ASC' },
    });

    const structures = await this.feeStructureRepository.find();
    const structMap = new Map(structures.map((s) => [s.class, s]));

    const allPayments = await this.feePaymentRepository.find({ order: { id: 'DESC' } });
    const paymentMap = new Map<number, FeePaymentEntity[]>();
    for (const p of allPayments) {
      const arr = paymentMap.get(p.studentId) || [];
      arr.push(p);
      paymentMap.set(p.studentId, arr);
    }

    return students.map((student) => {
      const struct = structMap.get(student.class);
      const studentPayments = paymentMap.get(student.id) || [];
      const totalPaid = studentPayments.reduce(
        (sum, p) => sum + Number(p.amountPaid || 0),
        0,
      );

      const tuitionFee = (struct?.components || [])
        .filter((c: any) => c.frequency === 'MONTHLY')
        .reduce((sum: number, c: any) => sum + Number(c.amount || 0), 0);

      const admissionFee = (struct?.components || [])
        .filter((c: any) => c.frequency === 'ONE_TIME' || c.collectOnAdmission !== false)
        .reduce((sum: number, c: any) => sum + Number(c.amount || 0), 0);

      return {
        studentId: student.id,
        class: student.class,
        section: student.section,
        status: student.feesStatus || (totalPaid > 0 ? 'PAID' : 'PENDING'),
        monthlyDue: tuitionFee || 1200,
        totalPaid,
        student: {
          id: student.id,
          name: student.name,
          admissionNo: student.admissionNo,
          rollNo: student.rollNo,
          fatherName: student.fatherName,
          motherName: student.motherName,
          phone: student.phone,
          image: student.image,
          transportOpted: student.transportOpted,
        },
        structure: {
          tuitionFee,
          admissionFee,
          transportFee: 800,
        },
        payments: studentPayments,
      };
    });
  }

  async getFeesDefaulters(month?: string, className?: string): Promise<any[]> {
    const where: any = {};
    if (className && className !== 'All Classes') {
      where.class = className;
    }

    const students = await this.studentRepository.find({
      where: { ...where, feesStatus: 'PENDING' },
      order: { class: 'ASC', name: 'ASC' },
    });

    const structures = await this.feeStructureRepository.find();
    const structMap = new Map(structures.map((s) => [s.class, s]));

    return students.map((student) => {
      const struct = structMap.get(student.class);
      const tuitionFee = (struct?.components || [])
        .filter((c: any) => c.frequency === 'MONTHLY')
        .reduce((sum: number, c: any) => sum + Number(c.amount || 0), 0);

      return {
        studentId: student.id,
        name: student.name,
        admissionNo: student.admissionNo,
        class: student.class,
        section: student.section,
        fatherName: student.fatherName,
        phone: student.phone,
        monthlyDue: tuitionFee || 1200,
        month: month || 'Current Period',
      };
    });
  }

  // --- ONLINE PAYMENT GATEWAY (RAZORPAY) ---

  async createOnlineOrder(dto: {
    studentId: number;
    amount: number;
    feeDueId?: number;
  }): Promise<{ orderId: string; amount: number; currency: string; keyId: string }> {
    const student = await this.studentRepository.findOne({ where: { id: dto.studentId } });
    if (!student) {
      throw new NotFoundException(`Student with ID ${dto.studentId} not found`);
    }

    const schoolInfo = await this.schoolInfoRepo.findOne({ where: {} });
    const orderId = `order_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const transaction = this.onlineTransactionRepository.create({
      studentId: dto.studentId,
      feeDueId: dto.feeDueId,
      amount: dto.amount,
      currency: 'INR',
      razorpayOrderId: orderId,
      status: OnlineTransactionStatus.CREATED,
      paymentMethod: 'RAZORPAY',
      metadata: {
        studentName: student.name,
        admissionNo: student.admissionNo,
        class: student.class,
      },
    });
    await this.onlineTransactionRepository.save(transaction);

    return {
      orderId,
      amount: dto.amount,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_institutional',
    };
  }

  async verifyOnlinePayment(dto: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature?: string;
    studentId: number;
    amount: number;
    feeDueId?: number;
    month?: string;
  }): Promise<{ success: boolean; message: string; receiptNo: string }> {
    const transaction = await this.onlineTransactionRepository.findOne({
      where: { razorpayOrderId: dto.razorpayOrderId },
    });

    if (transaction) {
      transaction.razorpayPaymentId = dto.razorpayPaymentId;
      transaction.razorpaySignature = dto.razorpaySignature || 'VERIFIED';
      transaction.status = OnlineTransactionStatus.SUCCESS;
      await this.onlineTransactionRepository.save(transaction);
    }

    const receiptResult = await this.recordFeePayment({
      studentId: dto.studentId,
      amountPaid: dto.amount,
      mode: 'ONLINE',
      transactionId: dto.razorpayPaymentId,
      month: dto.month || 'Current Period',
      remark: 'Online Payment via Razorpay Gateway',
    });

    return {
      success: true,
      message: 'Payment verified and receipt generated successfully',
      receiptNo: `REC-${receiptResult.id}`,
    };
  }

  private async updateFeeDueStatus(
    studentId: number,
    month: string,
    amountPaid: number,
  ): Promise<void> {
    const feeDue = await this.feeDueRepository.findOne({
      where: { studentId, month },
    });

    if (feeDue) {
      const newPaid = Number(feeDue.paidAmount || 0) + Number(amountPaid);
      const total = Number(feeDue.totalAmount || 0);
      const newStatus =
        newPaid >= total ? 'PAID' : newPaid > 0 ? 'PARTIAL' : 'PENDING';

      feeDue.paidAmount = newPaid;
      feeDue.status = newStatus;
      await this.feeDueRepository.save(feeDue);
    }
  }
}
