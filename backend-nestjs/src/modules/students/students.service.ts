import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { StudentEntity } from './entities/student.entity';
import { UserEntity, UserType } from '../auth/entities/user.entity';
import { AttendanceEntity } from '../attendance/entities/attendance.entity';
import { StorageService } from '../../core/storage/storage.service';
import { DocumentsService } from '../documents/documents.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentQueryDto } from './dto/student-query.dto';

import { SchoolInfoEntity } from '../settings/entities/school-info.entity';
import { ResultEntity } from '../academic/entities/result.entity';
import { HomeworkEntity } from '../academic/entities/homework.entity';
import { HomeworkSubmissionEntity } from '../academic/entities/homework-submission.entity';
import { FeePaymentEntity } from '../fees/entities/fee-payment.entity';
import { FeeDueEntity } from '../fees/entities/fee-due.entity';
import { StaffEntity } from '../staff/entities/staff.entity';
import { StaffTimetableEntity } from '../staff/entities/staff-timetable.entity';
import { SubstitutionAssignmentEntity } from '../staff/entities/substitution-assignment.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(AttendanceEntity)
    private readonly attendanceRepository: Repository<AttendanceEntity>,
    @InjectRepository(SchoolInfoEntity)
    private readonly schoolInfoRepo: Repository<SchoolInfoEntity>,
    @InjectRepository(ResultEntity)
    private readonly resultRepository: Repository<ResultEntity>,
    @InjectRepository(HomeworkEntity)
    private readonly homeworkRepository: Repository<HomeworkEntity>,
    @InjectRepository(HomeworkSubmissionEntity)
    private readonly homeworkSubmissionRepo: Repository<HomeworkSubmissionEntity>,
    @InjectRepository(FeePaymentEntity)
    private readonly feePaymentRepository: Repository<FeePaymentEntity>,
    @InjectRepository(FeeDueEntity)
    private readonly feeDueRepository: Repository<FeeDueEntity>,
    @InjectRepository(StaffEntity)
    private readonly staffRepository: Repository<StaffEntity>,
    @InjectRepository(StaffTimetableEntity)
    private readonly timetableRepository: Repository<StaffTimetableEntity>,
    @InjectRepository(SubstitutionAssignmentEntity)
    private readonly substitutionRepository: Repository<SubstitutionAssignmentEntity>,
    private readonly storageService: StorageService,
    private readonly documentsService: DocumentsService,
  ) {}

  private async enrichStudentMedia(student: StudentEntity): Promise<StudentEntity> {
    if (!student) return student;

    if (student.image) {
      student.image = await this.storageService.getPresignedUrl(student.image, 604800);
    }

    if (student.userId) {
      const userDocs = await this.documentsService.findByUserId(student.userId);
      if (userDocs && userDocs.length > 0) {
        student.documents = userDocs;
        return student;
      }
    }

    if (Array.isArray(student.documents)) {
      student.documents = await Promise.all(
        student.documents.map(async (doc: any) => {
          if (doc && doc.url) {
            const signedUrl = await this.storageService.getPresignedUrl(doc.url, 604800);
            return { ...doc, url: signedUrl };
          }
          return doc;
        }),
      );
    }

    return student;
  }

  async findAll(query?: StudentQueryDto): Promise<any> {
    const whereCondition = this.buildWhereCondition(query);
    const page = query?.page ? Math.max(1, Number(query.page)) : 1;
    const limit = query?.limit ? Number(query.limit) : 0;

    if (limit > 0) {
      const [students, totalItems] = await this.studentRepository.findAndCount({
        where: whereCondition,
        order: { name: 'ASC' },
        skip: (page - 1) * limit,
        take: limit,
      });
      const enriched = await Promise.all(students.map((s) => this.enrichStudentMedia(s)));
      return {
        students: enriched,
        totalItems,
        totalPages: Math.ceil(totalItems / limit) || 1,
        page,
      };
    }

    const [students, totalItems] = await this.studentRepository.findAndCount({
      where: whereCondition,
      order: { name: 'ASC' },
    });
    const enriched = await Promise.all(students.map((s) => this.enrichStudentMedia(s)));
    return {
      students: enriched,
      totalItems,
      totalPages: 1,
      page: 1,
    };
  }

  async getPromotionCandidates(className?: string, session?: string): Promise<any[]> {
    const query = this.studentRepository
      .createQueryBuilder('student')
      .select([
        'student.id',
        'student.name',
        'student.admissionNo',
        'student.rollNo',
        'student.class',
        'student.section',
        'student.session',
        'student.fatherName',
      ]);

    if (className) {
      query.andWhere('UPPER(student.class) = :cls', { cls: className.toUpperCase() });
    }
    if (session) {
      query.andWhere('student.session = :session', { session });
    }

    return query.orderBy('student.name', 'ASC').getMany();
  }

  private async assembleStudentTelemetry(student: StudentEntity): Promise<any> {
    const enriched = await this.enrichStudentMedia(student);
    const [attendanceRecords, results, homeworkList, submissions, feePayments, feeDues] = await Promise.all([
      this.attendanceRepository.find({
        where: { studentId: student.id },
        order: { date: 'DESC' },
      }),
      this.resultRepository.find({
        where: { studentId: student.id },
        order: { createdAt: 'DESC' },
      }),
      this.homeworkRepository.find({
        where: [
          { class: student.class, section: student.section },
          { class: student.class, section: 'ALL' },
          { class: student.class, section: ILike(student.section || 'A') },
        ],
        order: { createdAt: 'DESC' },
        take: 20,
      }),
      this.homeworkSubmissionRepo.find({
        where: { studentId: student.id },
      }),
      this.feePaymentRepository.find({
        where: { studentId: student.id },
        order: { paymentDate: 'DESC' },
      }),
      this.feeDueRepository.find({
        where: { studentId: student.id },
      }),
    ]);

    // Map homework with this student's submission status
    const submissionMap = new Map<number, HomeworkSubmissionEntity>();
    submissions.forEach((sub) => {
      submissionMap.set(sub.homeworkId, sub);
    });

    const enrichedHomework = homeworkList.map((hw) => {
      const sub = submissionMap.get(hw.id);
      return {
        id: hw.id,
        homework: hw,
        title: hw.title,
        subject: hw.subject,
        date: hw.date,
        dueDate: hw.dueDate,
        status: sub ? sub.status : 'PENDING',
        submission: sub || null,
        createdAt: hw.createdAt,
      };
    });

    // Calculate finance summary
    const totalPaid = feePayments.reduce((acc, p) => acc + (Number(p.amountPaid) || 0), 0);
    const totalDue = feeDues.reduce((acc, d) => acc + (Number(d.totalAmount) || 0) - (Number(d.paidAmount) || 0), 0);
    const totalAssigned = feeDues.reduce((acc, d) => acc + (Number(d.totalAmount) || 0), 0);

    const teacher = await this.staffRepository.findOne({
      where: [
        { role: 'TEACHER', class: ILike(student.class), section: ILike(student.section || 'A') },
        { designation: ILike('%teacher%'), class: ILike(student.class), section: ILike(student.section || 'A') },
        { class: ILike(student.class), section: ILike(student.section || 'A') },
      ],
    });

    const totalWorkingDays = await this.attendanceRepository
      .createQueryBuilder('att')
      .select('COUNT(DISTINCT att.date)', 'cnt')
      .where('UPPER(att.class) = UPPER(:cls)', { cls: student.class })
      .getRawOne();

    const studentData = {
      ...enriched,
      classTeacher: teacher ? teacher.name : 'Not Assigned',
    };

    return {
      student: studentData,
      ...studentData,
      finance: {
        summary: {
          dueAmount: Math.max(0, totalDue),
          paidAmount: totalPaid,
          totalAmount: totalAssigned > 0 ? totalAssigned : totalPaid,
          finalAmount: totalAssigned > 0 ? totalAssigned : totalPaid,
          discountValue: 0,
        },
        payments: feePayments,
        history: feePayments,
        dues: feeDues,
      },
      academic: results,
      homework: enrichedHomework,
      attendance: attendanceRecords || [],
      totalWorkingDays: Number(totalWorkingDays?.cnt) || attendanceRecords.length,
    };
  }

  async findOne(id: number): Promise<any> {
    const student = await this.studentRepository.findOne({ where: { id } });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return this.assembleStudentTelemetry(student);
  }

  async findByAdmissionNo(admissionNo: string): Promise<any> {
    const student = await this.studentRepository.findOne({
      where: { admissionNo },
    });
    if (!student) {
      throw new NotFoundException(`Student with Admission No ${admissionNo} not found`);
    }
    return this.assembleStudentTelemetry(student);
  }

  async create(dto: CreateStudentDto): Promise<any> {
    const rawAdmissionNo = dto.admissionNo?.trim().toUpperCase();
    const admissionNo =
      rawAdmissionNo ||
      (await this.getNextAdmissionId(dto.class)).nextId;

    // Check if admission number already registered
    const existing = await this.studentRepository.findOne({
      where: { admissionNo },
    });
    if (existing) {
      throw new ConflictException(
        `Student with Admission No "${admissionNo}" already exists.`
      );
    }

    // 2. DOB based password
    const plainPassword =
      dto.password ||
      (dto.dob ? dto.dob.replace(/-/g, '') : 'student@123');
    const hashedPassword = bcrypt.hashSync(plainPassword, 10);

    // Clean image / document URLs before persisting
    const cleanImage =
      dto.image && dto.image.includes('?X-Amz-')
        ? dto.image.split('?')[0]
        : dto.image;

    const cleanDocs = Array.isArray(dto.documents)
      ? dto.documents.map((d: any) =>
          d && d.url && d.url.includes('?X-Amz-')
            ? { ...d, url: d.url.split('?')[0] }
            : d
        )
      : dto.documents;

    const fullName =
      dto.name ||
      [dto.firstName, dto.lastName].filter(Boolean).join(' ').trim();

    const newStudent = this.studentRepository.create({
      ...dto,
      name: fullName,
      admissionNo,
      image: cleanImage,
      documents: cleanDocs,
      password: hashedPassword,
    });
    const savedStudent = await this.studentRepository.save(newStudent);

    // 3. Auto-create linked UserEntity for student auth login
    const user = this.userRepository.create({
      loginId: admissionNo,
      email: dto.email ? dto.email.trim().toLowerCase() : undefined,
      password: hashedPassword,
      userType: UserType.STUDENT,
      isActive: true,
    });
    const savedUser = await this.userRepository.save(user);

    savedStudent.userId = savedUser.id;
    await this.studentRepository.save(savedStudent);

    // Save documents into relational Documents table linked by userId
    if (Array.isArray(dto.documents) && dto.documents.length > 0) {
      const docsToSave = dto.documents.map((d: any) => ({
        name: d.name || d.title || d.type || 'Document',
        type: d.type || 'OTHER',
        fileKey: d.fileKey || d.url || '',
        fileName: d.fileName || '',
        mimeType: d.mimeType || (d.isPdf ? 'application/pdf' : 'image/jpeg'),
        status: d.status || 'VERIFIED',
      }));
      await this.documentsService.createBulkForUser(savedUser.id, docsToSave);
    }

    const enriched = await this.enrichStudentMedia(savedStudent);
    const { password, ...safeStudentData } = enriched;
    return {
      ...safeStudentData,
      admissionNo,
      message: 'Student admitted successfully.',
    };
  }

  async update(id: number, dto: UpdateStudentDto): Promise<StudentEntity> {
    const existingStudent = await this.studentRepository.findOne({ where: { id } });
    if (!existingStudent) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    const cleanDto = { ...dto };
    if (cleanDto.image && cleanDto.image.includes('?X-Amz-')) {
      cleanDto.image = cleanDto.image.split('?')[0];
    }
    if (Array.isArray(cleanDto.documents)) {
      cleanDto.documents = cleanDto.documents.map((d: any) => {
        if (d && d.url && d.url.includes('?X-Amz-')) {
          return { ...d, url: d.url.split('?')[0] };
        }
        return d;
      });

      if (existingStudent.userId && cleanDto.documents.length > 0) {
        const docsToSave = cleanDto.documents.map((d: any) => ({
          name: d.name || d.title || d.type || 'Document',
          type: d.type || 'OTHER',
          fileKey: d.fileKey || d.url || '',
          fileName: d.fileName || '',
          mimeType: d.mimeType || (d.isPdf ? 'application/pdf' : 'image/jpeg'),
          status: d.status || 'VERIFIED',
        }));
        await this.documentsService.createBulkForUser(existingStudent.userId, docsToSave);
      }
    }

    if (cleanDto.firstName !== undefined || cleanDto.lastName !== undefined) {
      const fName = cleanDto.firstName !== undefined ? cleanDto.firstName : existingStudent.firstName;
      const lName = cleanDto.lastName !== undefined ? cleanDto.lastName : existingStudent.lastName;
      cleanDto.name = [fName, lName].filter(Boolean).join(' ').trim();
    }

    const updatedStudent = this.studentRepository.merge(existingStudent, cleanDto);
    const saved = await this.studentRepository.save(updatedStudent);

    // Sync email if user auth account is linked
    if (existingStudent.userId && cleanDto.email) {
      await this.userRepository.update(existingStudent.userId, {
        email: cleanDto.email.trim().toLowerCase(),
      });
    }

    return this.enrichStudentMedia(saved);
  }

  async remove(id: number): Promise<{ success: boolean; message: string }> {
    const student = await this.studentRepository.findOne({ where: { id } });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    const userId = student.userId;
    await this.studentRepository.remove(student);

    if (userId) {
      await this.userRepository.delete(userId);
    }

    return { success: true, message: `Student ID ${id} deleted successfully` };
  }

  async getNextAdmissionId(className?: string): Promise<{ nextId: string }> {
    const year = new Date().getFullYear();
    const classCodeMap: Record<string, string> = {
      NURSERY: 'NUR',
      LKG: 'LKG',
      UKG: 'UKG',
      PREP: 'PREP',
      PLAYGROUP: 'PG',
      '1ST': '1ST',
      '2ND': '2ND',
      '3RD': '3RD',
      '4TH': '4TH',
      '5TH': '5TH',
      '6TH': '6TH',
      '7TH': '7TH',
      '8TH': '8TH',
      '9TH': '9TH',
      '10TH': '10TH',
      '11TH': '11TH',
      '12TH': '12TH',
    };

    const targetClass = (className || '1ST').trim();
    const rawInput = targetClass.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const cleanClass = classCodeMap[rawInput] || rawInput.slice(0, 4);

    // Count students enrolled specifically in this class
    const classCount = await this.studentRepository.count({
      where: [{ class: targetClass }, { class: cleanClass }, { class: rawInput }],
    });
    const sequence = String(classCount + 1).padStart(3, '0');

    const schoolInfoList = await this.schoolInfoRepo.find({ take: 1 });
    const schoolInfo = schoolInfoList.length > 0 ? schoolInfoList[0] : null;
    const schoolPrefix = (
      schoolInfo?.domainPrefix ||
      schoolInfo?.schoolName?.replace(/[^a-zA-Z]/g, '').substring(0, 3) ||
      'RPS'
    ).toUpperCase();

    const nextId = `${schoolPrefix}${year}${cleanClass}${sequence}`;

    return { nextId };
  }

  async syncAlphabeticalRollNumbers(
    className?: string,
    section?: string,
  ): Promise<{ success: boolean; updatedCount: number; message: string }> {
    const query: any = {};
    if (className && className !== 'All Classes' && className !== 'ALL') {
      const cleanClass = className.replace(/^GRADE\s+/i, '').replace(/^CLASS\s+/i, '').trim();
      query.class = ILike(`%${cleanClass}%`);
    }
    if (section && section !== 'All Sections' && section !== 'ALL') {
      const cleanSection = section.replace(/^SEC\s+/i, '').trim();
      query.section = ILike(`%${cleanSection}%`);
    }

    const students = await this.studentRepository.find({
      where: query,
      order: { class: 'ASC', section: 'ASC', name: 'ASC' },
    });

    const grouped: Record<string, StudentEntity[]> = {};
    students.forEach((s) => {
      const key = `${s.class || 'DEFAULT'}_${s.section || 'A'}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(s);
    });

    const updatePromises: Promise<any>[] = [];
    Object.values(grouped).forEach((groupStudents) => {
      groupStudents.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      groupStudents.forEach((student, index) => {
        const sequentialRoll = String(index + 1).padStart(2, '0');
        student.rollNo = sequentialRoll;
        updatePromises.push(this.studentRepository.save(student));
      });
    });

    await Promise.all(updatePromises);
    return {
      success: true,
      updatedCount: students.length,
      message: `Successfully synchronized ${students.length} roll numbers in alphabetical sequence.`,
    };
  }

  // --- IMMUTABLE HELPER METHODS ---

  private buildWhereCondition(query?: StudentQueryDto): any {
    if (!query) return {};

    const rawClass = query.class?.trim();
    const rawSection = query.section?.trim();

    if (rawClass && rawSection) {
      const cleanClass = rawClass.replace(/^GRADE\s+/i, '').replace(/^CLASS\s+/i, '').trim();
      const classVariants = [rawClass, cleanClass, `GRADE ${cleanClass}`, `CLASS ${cleanClass}`];
      
      const conditions: any[] = [];
      classVariants.forEach((cls) => {
        conditions.push({ class: ILike(cls), section: ILike(rawSection) });
        if (rawSection.toUpperCase() === 'A') {
          conditions.push({ class: ILike(cls), section: 'A' });
        }
      });

      if (query.search?.trim()) {
        const term = `%${query.search.trim()}%`;
        const searchConditions: any[] = [];
        conditions.forEach((base) => {
          searchConditions.push({ ...base, name: ILike(term) });
          searchConditions.push({ ...base, admissionNo: ILike(term) });
          searchConditions.push({ ...base, rollNo: ILike(term) });
        });
        return searchConditions;
      }
      return conditions;
    }

    const conditions: any = {};
    if (rawClass) {
      conditions.class = ILike(rawClass.replace(/^GRADE\s+/i, '').trim());
    }
    if (rawSection) {
      conditions.section = ILike(rawSection);
    }
    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`;
      return [
        { ...conditions, name: ILike(term) },
        { ...conditions, admissionNo: ILike(term) },
        { ...conditions, phone: ILike(term) },
      ];
    }

    return conditions;
  }

  async getClassTeacher(className: string, section?: string): Promise<{ name: string; teacher?: any }> {
    const cleanSection = (section || 'A').trim();
    const teacher = await this.staffRepository.findOne({
      where: [
        { role: 'TEACHER', class: ILike(className), section: ILike(cleanSection) },
        { designation: ILike('%teacher%'), class: ILike(className), section: ILike(cleanSection) },
        { class: ILike(className), section: ILike(cleanSection) },
        { role: 'TEACHER', class: ILike(className) },
      ],
    });
    return {
      name: teacher ? teacher.name : 'Not Assigned',
      teacher: teacher ? await this.enrichStaffTeacherMedia(teacher) : null,
    };
  }

  private async enrichStaffTeacherMedia(staff: StaffEntity): Promise<any> {
    if (!staff) return null;
    const imageUrl = staff.image
      ? await this.storageService.getPresignedUrl(staff.image, 604800)
      : null;
    return {
      id: staff.id,
      name: staff.name,
      role: staff.role,
      subject: staff.subject,
      email: staff.email,
      phone: staff.phone,
      image: imageUrl,
    };
  }

  async getStudentAttendance(studentId: number): Promise<AttendanceEntity[]> {
    return this.attendanceRepository.find({
      where: { studentId },
      order: { date: 'DESC' },
    });
  }

  async getStudentResults(studentId: number): Promise<ResultEntity[]> {
    return this.resultRepository.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
    });
  }

  async getClassTimetable(className: string, section?: string): Promise<any[]> {
    const cleanSection = (section || 'A').trim();
    const today = new Date().toISOString().split('T')[0];
    const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

    const timetable = await this.timetableRepository.find({
      where: {
        class: ILike(className),
        section: ILike(cleanSection),
      },
      relations: { staff: true },
      order: { period: 'ASC' },
    });

    const substitutions = await this.substitutionRepository.find({
      where: {
        class: ILike(className),
        section: ILike(cleanSection),
        date: today,
      },
      relations: { substituteTeacher: true },
    });

    const dayMapping: Record<string, string> = {
      MONDAY: 'MON',
      TUESDAY: 'TUE',
      WEDNESDAY: 'WED',
      THURSDAY: 'THU',
      FRIDAY: 'FRI',
      SATURDAY: 'SAT',
    };

    const seen = new Set<string>();
    const result: any[] = [];

    timetable.forEach((t) => {
      const cleanDay = (t.day || '').trim().toUpperCase();
      const key = `${cleanDay}-${t.period}`;
      if (seen.has(key)) return;
      seen.add(key);

      const sub = cleanDay === dayName ? substitutions.find((s) => s.period === t.period) : null;
      result.push({
        id: t.id,
        day: dayMapping[cleanDay] || cleanDay,
        period: t.period,
        subject: t.subject,
        class: t.class,
        section: t.section,
        originalTeacher: t.staff?.name,
        currentTeacher: sub?.substituteTeacher?.name || t.staff?.name,
        teacherName: sub?.substituteTeacher?.name || t.staff?.name,
        isSubstituted: Boolean(sub),
      });
    });

    return result;
  }

  async getStudentHomeworkStatus(studentId: number): Promise<HomeworkSubmissionEntity[]> {
    return this.homeworkSubmissionRepo.find({
      where: { studentId },
    });
  }

  async updateStudentHomeworkStatus(
    studentId: number,
    homeworkId: number,
    status: string,
    content?: string,
  ): Promise<{ success: boolean; submission: HomeworkSubmissionEntity }> {
    const existing = await this.homeworkSubmissionRepo.findOne({
      where: { studentId, homeworkId },
    });

    if (existing) {
      existing.status = status;
      if (content) existing.content = content;
      if (status === 'COMPLETED') existing.submittedAt = new Date().toISOString();
      const updated = await this.homeworkSubmissionRepo.save(existing);
      return { success: true, submission: updated };
    }

    const student = await this.studentRepository.findOne({ where: { id: studentId } });
    const submission = this.homeworkSubmissionRepo.create({
      studentId,
      homeworkId,
      status,
      content,
      studentName: student?.name,
      submittedAt: status === 'COMPLETED' ? new Date().toISOString() : undefined,
    });
    const saved = await this.homeworkSubmissionRepo.save(submission);
    return { success: true, submission: saved };
  }
}
