import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceEntity } from './entities/attendance.entity';
import { StudentEntity } from '../students/entities/student.entity';
import { StaffEntity } from '../staff/entities/staff.entity';
import { StaffAttendanceEntity } from '../staff/entities/staff-attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { AttendanceQueryDto } from './dto/attendance-query.dto';

export interface AttendanceSummary {
  studentId: number;
  totalDays: number;
  present: number;
  absent: number;
  leave: number;
  halfDay: number;
  late: number;
  percentage: number;
}

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceEntity)
    private readonly attendanceRepository: Repository<AttendanceEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>,
    @InjectRepository(StaffEntity)
    private readonly staffRepository: Repository<StaffEntity>,
    @InjectRepository(StaffAttendanceEntity)
    private readonly staffAttendanceRepository: Repository<StaffAttendanceEntity>,
  ) {}

  async getMyAttendance(user: any, month?: string, year?: string): Promise<StaffAttendanceEntity[]> {
    if (!user) return [];
    const parsedUserId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;

    const staffMember = await this.staffRepository.findOne({
      where: [{ userId: parsedUserId }, { id: parsedUserId }, { email: user?.email }],
    });
    const targetStaffId = staffMember ? staffMember.id : parsedUserId;

    const records = await this.staffAttendanceRepository.find({
      where: { staffId: targetStaffId },
      order: { date: 'DESC' },
    });

    if (month && year) {
      const prefix = `${year}-${String(month).padStart(2, '0')}`;
      return records.filter((r) => r.date?.startsWith(prefix));
    }
    return records;
  }

  async findStudentAttendance(queryId: string): Promise<AttendanceEntity[]> {
    const student = await this.resolveStudent(queryId);
    const targetId = student ? student.id : parseInt(queryId, 10) || 0;

    return this.attendanceRepository.find({
      where: { studentId: targetId },
      order: { date: 'DESC' },
    });
  }

  async findClassAttendance(query: AttendanceQueryDto): Promise<AttendanceEntity[]> {
    const whereCondition = this.buildWhereCondition(query);
    return this.attendanceRepository.find({
      where: whereCondition,
      relations: { student: true },
      order: { date: 'DESC' },
    });
  }

  async markSingleAttendance(dto: CreateAttendanceDto): Promise<AttendanceEntity> {
    const existing = await this.attendanceRepository.findOne({
      where: {
        studentId: dto.studentId,
        date: dto.date,
      },
    });

    if (existing) {
      existing.status = dto.status;
      if (dto.class) existing.class = dto.class;
      if (dto.section) existing.section = dto.section;
      if (dto.session) existing.session = dto.session;
      if (dto.departureTime !== undefined) existing.departureTime = dto.departureTime;
      if (dto.remarks !== undefined) existing.remarks = dto.remarks;
      return this.attendanceRepository.save(existing);
    }

    const newRecord = this.attendanceRepository.create(dto);
    return this.attendanceRepository.save(newRecord);
  }

  async markBulkAttendance(dto: any): Promise<{ success: boolean; count: number }> {
    const rawRecords = Array.isArray(dto?.records) ? dto.records : Array.isArray(dto) ? dto : [];
    const savePromises = rawRecords.map((record: any) =>
      this.markSingleAttendance({
        studentId: Number(record.studentId),
        class: record.class || dto.class || '',
        section: record.section || dto.section || 'A',
        date: record.date || dto.date || new Date().toISOString().split('T')[0],
        status: record.status || 'PRESENT',
        session: record.session || dto.session,
        departureTime: record.departureTime,
        remarks: record.remarks,
      }),
    );

    await Promise.all(savePromises);
    return { success: true, count: rawRecords.length };
  }

  async getAttendanceSummary(queryId: string): Promise<AttendanceSummary> {
    const records = await this.findStudentAttendance(queryId);
    const totalDays = records.length;
    const present = records.filter((r) => r.status === 'PRESENT').length;
    const absent = records.filter((r) => r.status === 'ABSENT').length;
    const leave = records.filter((r) => r.status === 'LEAVE').length;
    const halfDay = records.filter((r) => r.status === 'HALF_DAY' || r.status === 'HALF DAY').length;
    const late = records.filter((r) => r.status === 'LATE').length;
    const percentage = totalDays > 0 ? Math.round(((present + late + (halfDay * 0.5)) / totalDays) * 100) : 0;

    const student = await this.resolveStudent(queryId);
    const studentId = student ? student.id : parseInt(queryId, 10) || 0;

    return {
      studentId,
      totalDays,
      present,
      absent,
      leave,
      halfDay,
      late,
      percentage,
    };
  }

  // --- IMMUTABLE HELPER METHODS ---

  private async resolveStudent(queryId: string): Promise<StudentEntity | null> {
    const parsedInt = parseInt(queryId, 10);
    const isNum = !isNaN(parsedInt);

    if (isNum) {
      const byId = await this.studentRepository.findOne({ where: { id: parsedInt } });
      if (byId) return byId;
    }

    return this.studentRepository.findOne({
      where: [{ admissionNo: queryId }, { phone: queryId }],
    });
  }

  async getStaffAttendance(queryDate?: string): Promise<StaffAttendanceEntity[]> {
    const date = queryDate || new Date().toISOString().split('T')[0];
    return this.staffAttendanceRepository.find({
      where: { date },
      relations: { staff: true },
      order: { id: 'ASC' },
    });
  }

  async markStaffAttendance(dto: any): Promise<{ success: boolean; count: number }> {
    const today = new Date().toISOString().split('T')[0];
    const items = Array.isArray(dto.attendanceData)
      ? dto.attendanceData
      : Array.isArray(dto)
      ? dto
      : [dto];

    for (const item of items) {
      if (!item.staffId) continue;
      const targetDate = item.date || dto.date || today;
      const targetStatus = item.status || 'PRESENT';

      const existing = await this.staffAttendanceRepository.findOne({
        where: { staffId: item.staffId, date: targetDate },
      });

      if (existing) {
        existing.status = targetStatus;
        await this.staffAttendanceRepository.save(existing);
      } else {
        const record = this.staffAttendanceRepository.create({
          staffId: item.staffId,
          date: targetDate,
          status: targetStatus,
        });
        await this.staffAttendanceRepository.save(record);
      }
    }

    return { success: true, count: items.length };
  }

  async getStaffQrToken(): Promise<{ token: string; expiresAt: number }> {
    const timestamp = Date.now();
    const token = `QR_ATT_${timestamp}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    return {
      token,
      expiresAt: timestamp + 30000,
    };
  }

  async getLastScan(): Promise<{ lastScan: any }> {
    return {
      lastScan: {
        timestamp: new Date().toISOString(),
        status: 'READY',
        mode: 'KIOSK_AUTOMATIC',
      },
    };
  }

  private buildWhereCondition(query: AttendanceQueryDto): any {
    const conditions: any = {};
    if (query.class) conditions.class = query.class;
    if (query.section) conditions.section = query.section;
    if (query.date) conditions.date = query.date;
    return conditions;
  }
}
