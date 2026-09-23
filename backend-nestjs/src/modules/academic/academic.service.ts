import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan, ILike } from 'typeorm';
import { HomeworkEntity } from './entities/homework.entity';
import { HomeworkSubmissionEntity } from './entities/homework-submission.entity';
import { ResultEntity } from './entities/result.entity';
import { SubjectEntity } from './entities/subject.entity';
import { ExamEntity } from './entities/exam.entity';
import { StudentEntity } from '../students/entities/student.entity';
import { StaffEntity } from '../staff/entities/staff.entity';
import { StaffTimetableEntity } from '../staff/entities/staff-timetable.entity';
import { ActivityLogEntity } from '../auth/entities/activity-log.entity';
import { StorageService } from '../../core/storage/storage.service';
import { CreateHomeworkDto } from './dto/create-homework.dto';
import { SubmitHomeworkDto } from './dto/submit-homework.dto';
import { CreateResultDto } from './dto/create-result.dto';
import { CreateExamDto } from './dto/create-exam.dto';
import { PromoteStudentsDto } from './dto/promote-students.dto';
import { AddBulkResultsDto } from './dto/bulk-results.dto';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@Injectable()
export class AcademicService {
  constructor(
    @InjectRepository(HomeworkEntity)
    private readonly homeworkRepository: Repository<HomeworkEntity>,
    @InjectRepository(HomeworkSubmissionEntity)
    private readonly submissionRepository: Repository<HomeworkSubmissionEntity>,
    @InjectRepository(ResultEntity)
    private readonly resultRepository: Repository<ResultEntity>,
    @InjectRepository(SubjectEntity)
    private readonly subjectRepository: Repository<SubjectEntity>,
    @InjectRepository(ExamEntity)
    private readonly examRepository: Repository<ExamEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>,
    @InjectRepository(StaffEntity)
    private readonly staffRepository: Repository<StaffEntity>,
    @InjectRepository(StaffTimetableEntity)
    private readonly timetableRepository: Repository<StaffTimetableEntity>,
    @InjectRepository(ActivityLogEntity)
    private readonly activityLogRepository: Repository<ActivityLogEntity>,
    private readonly storageService: StorageService,
  ) {}

  // --- HOMEWORK ---

  async findAllHomework(className?: string, section?: string): Promise<HomeworkEntity[]> {
    const whereCondition: any = {};
    if (className) whereCondition.class = className;
    if (section) whereCondition.section = section;

    return this.homeworkRepository.find({
      where: whereCondition,
      relations: { teacher: true },
      order: { id: 'DESC' },
    });
  }

  async getHomeworkAnalytics(): Promise<{
    totalActive: number;
    overdueTasks: number;
    priorityFlagged: number;
    globalCompletion: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const totalActive = await this.homeworkRepository.count({ where: { status: 'ACTIVE' } });
    const overdueTasks = await this.homeworkRepository.count({
      where: {
        status: 'ACTIVE',
        dueDate: LessThan(today),
      },
    });
    const priorityFlagged = await this.homeworkRepository.count({
      where: [
        { status: 'ACTIVE', isUrgent: true },
        { status: 'ACTIVE', priority: 'HIGH' },
      ],
    });
    const totalSubmissions = await this.submissionRepository.count({
      where: { status: 'COMPLETED' },
    });
    const totalHomework = await this.homeworkRepository.count();
    const totalPossible = totalHomework * 30;
    const globalCompletion =
      totalPossible > 0 ? Math.min(100, Math.round((totalSubmissions / totalPossible) * 100)) : 0;

    return {
      totalActive,
      overdueTasks,
      priorityFlagged,
      globalCompletion,
    };
  }

  async getHomeworkStats(id: number): Promise<any[]> {
    const homework = await this.homeworkRepository.findOne({ where: { id } });
    if (!homework) throw new NotFoundException(`Homework ID ${id} not found`);

    const rawCls = homework.class.trim();
    const cleanClass = rawCls.replace(/^GRADE\s+/i, '').replace(/^CLASS\s+/i, '').trim();

    const students = await this.studentRepository.find({
      where: [
        { class: ILike(rawCls) },
        { class: ILike(cleanClass) },
        { class: ILike(`GRADE ${cleanClass}`) },
        { class: ILike(`CLASS ${cleanClass}`) },
      ],
      order: { name: 'ASC' },
    });

    const targetStudents = homework.section
      ? students.filter((s) => (s.section || 'A').toUpperCase() === homework.section.toUpperCase())
      : students;

    const submissions = await this.submissionRepository.find({
      where: { homeworkId: id },
    });

    return targetStudents.map((student) => {
      const sub = submissions.find((s) => s.studentId === student.id);
      return {
        id: student.id,
        name: student.name,
        rollNo: student.rollNo,
        image: student.image,
        class: student.class,
        section: student.section,
        completionStatus: sub?.status || 'PENDING',
        submittedAt: sub?.submittedAt || null,
        feedback: sub?.feedback || null,
        grade: sub?.grade || null,
      };
    });
  }

  async createHomework(dto: CreateHomeworkDto): Promise<HomeworkEntity> {
    const homework = this.homeworkRepository.create(dto);
    return this.homeworkRepository.save(homework);
  }

  async updateHomework(id: number, dto: Partial<CreateHomeworkDto>): Promise<HomeworkEntity> {
    const homework = await this.homeworkRepository.findOne({ where: { id } });
    if (!homework) throw new NotFoundException(`Homework ID ${id} not found`);
    Object.assign(homework, dto);
    return this.homeworkRepository.save(homework);
  }

  async deleteHomework(id: number): Promise<{ success: boolean }> {
    await this.submissionRepository.delete({ homeworkId: id });
    await this.homeworkRepository.delete(id);
    return { success: true };
  }

  async submitHomework(dto: SubmitHomeworkDto): Promise<HomeworkSubmissionEntity> {
    const homework = await this.homeworkRepository.findOne({
      where: { id: dto.homeworkId },
    });
    if (!homework) {
      throw new NotFoundException(`Homework ID ${dto.homeworkId} not found`);
    }

    const student = await this.studentRepository.findOne({
      where: { id: dto.studentId },
    });
    if (!student) {
      throw new NotFoundException(`Student ID ${dto.studentId} not found`);
    }

    const submittedAt = new Date().toISOString();
    const newStatus = dto.status || 'COMPLETED';

    const existing = await this.submissionRepository.findOne({
      where: { homeworkId: dto.homeworkId, studentId: dto.studentId },
    });

    if (existing) {
      existing.content = dto.content !== undefined ? dto.content : existing.content;
      existing.attachmentUrl = dto.attachmentUrl !== undefined ? dto.attachmentUrl : existing.attachmentUrl;
      existing.status = newStatus;
      existing.submittedAt = submittedAt;
      existing.feedback = dto.feedback !== undefined ? dto.feedback : existing.feedback;
      existing.grade = dto.grade !== undefined ? dto.grade : existing.grade;
      return this.submissionRepository.save(existing);
    }

    const submission = this.submissionRepository.create({
      ...dto,
      studentName: student.name || 'Student',
      status: newStatus,
      submittedAt,
    });
    return this.submissionRepository.save(submission);
  }

  // --- EXAMS REGISTRY ---

  async findAllExams(className?: string): Promise<ExamEntity[]> {
    const where: any = {};
    if (className && className !== 'ALL') {
      where.class = className.toUpperCase().trim();
    }
    return this.examRepository.find({
      where,
      order: { id: 'DESC' },
    });
  }

  async createExam(dto: CreateExamDto): Promise<ExamEntity> {
    const exam = this.examRepository.create({
      ...dto,
      class: dto.class.toUpperCase().trim(),
    });
    return this.examRepository.save(exam);
  }

  async updateExam(id: number, dto: Partial<CreateExamDto>): Promise<ExamEntity> {
    const existing = await this.examRepository.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }
    const updated = this.examRepository.merge(existing, {
      ...dto,
      class: dto.class ? dto.class.toUpperCase().trim() : existing.class,
    });
    return this.examRepository.save(updated);
  }

  async deleteExam(id: number): Promise<{ success: boolean; message: string }> {
    const existing = await this.examRepository.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }
    await this.examRepository.remove(existing);
    return { success: true, message: 'Exam deleted successfully' };
  }

  // --- EXAM RESULTS & BULK MARKS ---

  async getStudentResults(studentId: number): Promise<ResultEntity[]> {
    return this.resultRepository.find({
      where: { studentId },
      order: { id: 'DESC' },
    });
  }

  private async checkTeacherSubjectAccess(
    user: JwtPayload | undefined,
    targetSubject: string,
    targetClass: string,
  ): Promise<void> {
    if (!user || user.userType !== 'STAFF') return;
    if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || user.role === 'PRINCIPAL' || user.role === 'CLERK') return;

    const targetUserId = user.id ? Number(user.id) : 0;
    const staff = await this.staffRepository.findOne({
      where: [{ userId: targetUserId }, { email: user.email }],
    });

    if (!staff) return;

    // Rule 1: Class Teacher has full access across all subjects for their incharge class
    const isClassTeacher = staff.class && staff.class.toUpperCase().trim() === targetClass.toUpperCase().trim();
    if (isClassTeacher) return;

    // Rule 2: Primary subject matches (case-insensitive & substring support e.g. Math vs Advanced Math)
    const staffSub = (staff.subject || '').toLowerCase().trim();
    const targetSub = (targetSubject || '').toLowerCase().trim();
    if (staffSub && (staffSub.includes(targetSub) || targetSub.includes(staffSub) || staffSub === targetSub)) {
      return;
    }

    // Rule 3: Check assigned timetable periods
    const isTimetableAssigned = await this.timetableRepository.findOne({
      where: {
        staffId: staff.id,
      },
    });
    if (isTimetableAssigned) return;

    // Rule 4: Check assignedSubjects JSON array
    const assignedSubjects = Array.isArray(staff.assignedSubjects) ? staff.assignedSubjects : [];
    const isAssignedSubject = assignedSubjects.some(
      (as: any) =>
        as.subject?.toLowerCase().trim() === targetSub &&
        (!as.class || as.class.toUpperCase().trim() === targetClass.toUpperCase().trim()),
    );
    if (isAssignedSubject) return;

    throw new ForbiddenException(
      `Access Denied: You are only authorized to enter marks for ${staff.subject || 'your assigned subjects'}. You cannot modify ${targetSubject} marks for Class ${targetClass}.`,
    );
  }

  async createResult(dto: CreateResultDto, user?: JwtPayload): Promise<ResultEntity> {
    const student = await this.studentRepository.findOne({
      where: { id: dto.studentId },
    });
    if (!student) {
      throw new NotFoundException(`Student ID ${dto.studentId} not found`);
    }

    const className = dto.class || student.class || '';
    await this.checkTeacherSubjectAccess(user, dto.subject, className);

    const result = this.resultRepository.create({
      ...dto,
      class: className,
      section: dto.section || student.section || '',
      total: dto.total || 100,
    });
    return this.resultRepository.save(result);
  }

  async addBulkResults(dto: AddBulkResultsDto, user?: JwtPayload): Promise<{ success: boolean; count: number }> {
    await this.checkTeacherSubjectAccess(user, dto.subject, dto.class);

    const records: Partial<ResultEntity>[] = dto.results.map((item) => {
      const marks = Number(item.marksObtained) || 0;
      const total = Number(item.totalMarks) || 100;
      const pct = (marks / total) * 100;
      const grade =
        item.grade ||
        (pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : pct >= 40 ? 'D' : 'F');

      return {
        studentId: item.studentId,
        subject: dto.subject,
        class: dto.class.toUpperCase().trim(),
        section: (dto.section || 'A').toUpperCase().trim(),
        marks,
        total,
        grade,
        examId: dto.examId || 'FINAL_EXAM',
        remarks: item.remarks || '',
      };
    });

    const entities = this.resultRepository.create(records);
    await this.resultRepository.save(entities);

    return { success: true, count: entities.length };
  }

  async findMarks(query: { class?: string; section?: string; studentId?: number; examId?: string }): Promise<any[]> {
    const whereCondition: any = {};
    if (query.studentId) whereCondition.studentId = query.studentId;
    if (query.examId) whereCondition.examId = query.examId;

    const results = await this.resultRepository.find({
      where: whereCondition,
      relations: { student: true },
      order: { id: 'DESC' },
    });

    if (query.class || query.section) {
      return results.filter((r) => {
        const matchClass = !query.class || (r.class || r.student?.class || '').toUpperCase() === query.class.toUpperCase();
        const matchSection = !query.section || (r.section || r.student?.section || '').toUpperCase() === query.section.toUpperCase();
        return matchClass && matchSection;
      });
    }

    return results;
  }

  async updateResult(id: number, dto: any): Promise<ResultEntity> {
    const existing = await this.resultRepository.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Result with ID ${id} not found`);
    }

    const marks = dto.marks !== undefined ? Number(dto.marks) : existing.marks;
    const total = dto.total !== undefined ? Number(dto.total) : existing.total;
    const isVerified = dto.verified !== undefined ? Boolean(dto.verified) : (dto.isVerified !== undefined ? Boolean(dto.isVerified) : existing.isVerified);

    const updated = this.resultRepository.merge(existing, {
      ...dto,
      marks,
      total,
      isVerified,
    });
    return this.resultRepository.save(updated);
  }

  async deleteResult(id: number): Promise<{ success: boolean; message: string }> {
    const existing = await this.resultRepository.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Result with ID ${id} not found`);
    }
    await this.resultRepository.remove(existing);
    return { success: true, message: 'Result record deleted successfully' };
  }

  // --- PROMOTION & SESSION MIGRATION ENGINE ---

  async promoteStudents(dto: PromoteStudentsDto, performedBy?: string): Promise<{ success: boolean; message: string; count: number }> {
    const students = await this.studentRepository.find({
      where: {
        id: In(dto.studentIds),
        class: dto.sourceClass.toUpperCase().trim(),
      },
    });

    if (students.length === 0) {
      throw new BadRequestException('No valid scholars found for promotion matching source class');
    }

    await Promise.all(
      students.map(async (student) => {
        student.class = dto.targetClass.toUpperCase().trim();
        if (dto.targetSection) {
          student.section = dto.targetSection.toUpperCase().trim();
        }
        student.session = dto.newSession;
        student.feesStatus = 'PENDING';
        return this.studentRepository.save(student);
      }),
    );

    const log = this.activityLogRepository.create({
      action: 'UPDATE',
      performedBy: performedBy || 'ADMIN',
      role: 'ADMIN',
      details: `BULK_PROMOTION: Promoted ${students.length} scholars from ${dto.sourceClass} to ${dto.targetClass} for session ${dto.newSession}`,
    });
    await this.activityLogRepository.save(log);

    return {
      success: true,
      message: `Successfully promoted ${students.length} scholars to Class ${dto.targetClass}`,
      count: students.length,
    };
  }

  // --- SUBJECTS MANAGEMENT ---

  async findAllSubjects(className?: string): Promise<SubjectEntity[]> {
    const totalCount = await this.subjectRepository.count();
    if (totalCount === 0) {
      await this.autoSeedDefaultCurriculum();
    }

    if (className && className !== 'All Classes') {
      const normalized = className.trim().toUpperCase();
      const subjects = await this.subjectRepository.find({
        order: { type: 'ASC', name: 'ASC' },
      });
      return subjects.filter((s) => (s.class || '').trim().toUpperCase() === normalized);
    }

    return this.subjectRepository.find({
      order: { class: 'ASC', type: 'ASC', name: 'ASC' },
    });
  }

  async createSubject(dto: Partial<SubjectEntity>): Promise<SubjectEntity> {
    const subject = this.subjectRepository.create({
      ...dto,
      class: (dto.class || '1ST').trim().toUpperCase(),
    });
    return this.subjectRepository.save(subject);
  }

  async updateSubject(id: number, dto: Partial<SubjectEntity>): Promise<SubjectEntity> {
    const existing = await this.subjectRepository.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Subject ID ${id} not found`);
    }
    const updated = this.subjectRepository.merge(existing, {
      ...dto,
      class: dto.class ? dto.class.trim().toUpperCase() : existing.class,
    });
    return this.subjectRepository.save(updated);
  }

  async deleteSubject(id: number): Promise<{ success: boolean; message: string }> {
    const existing = await this.subjectRepository.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Subject ID ${id} not found`);
    }
    await this.subjectRepository.remove(existing);
    return { success: true, message: `Subject ${existing.name} deleted successfully` };
  }

  async getClassRoster(className: string, section?: string, session?: string): Promise<any[]> {
    const cleanClass = (className || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
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
        'student.image',
      ]);

    if (cleanClass && cleanClass !== 'ALL' && cleanClass !== 'ALLCLASSES') {
      query.where('UPPER(student.class) LIKE :cls', { cls: `%${cleanClass}%` });
    }

    if (section && section !== 'All Sections' && section !== 'ALL') {
      query.andWhere('UPPER(student.section) = :sec', { sec: section.toUpperCase().trim() });
    }
    if (session) {
      query.andWhere('student.session = :session', { session });
    }

    const students = await query.orderBy('student.rollNo', 'ASC').addOrderBy('student.name', 'ASC').getMany();

    const enriched = await Promise.all(
      students.map(async (s) => {
        const studentImg = s.image
          ? await this.storageService.getPresignedUrl(s.image, 604800).catch(() => s.image)
          : s.image;
        return {
          ...s,
          image: studentImg,
        };
      }),
    );

    return enriched;
  }

  private async autoSeedDefaultCurriculum(): Promise<void> {
    const defaultData: Partial<SubjectEntity>[] = [
      { name: 'English Alphabet & Phonics', code: 'ENG-NUR', class: 'NURSERY', type: 'CORE', theoryMarks: 50, practicalMarks: 50, passingMarks: 33 },
      { name: 'Hindi Varnamala', code: 'HIN-NUR', class: 'NURSERY', type: 'CORE', theoryMarks: 50, practicalMarks: 50, passingMarks: 33 },
      { name: 'Numbers & Pre-Maths', code: 'MTH-NUR', class: 'NURSERY', type: 'CORE', theoryMarks: 50, practicalMarks: 50, passingMarks: 33 },
      { name: 'Rhymes & Storytelling', code: 'RHY-NUR', class: 'NURSERY', type: 'ACTIVITY', theoryMarks: 0, practicalMarks: 50, passingMarks: 20 },
      { name: 'Drawing & Colouring', code: 'ART-NUR', class: 'NURSERY', type: 'ACTIVITY', theoryMarks: 0, practicalMarks: 50, passingMarks: 20 },

      { name: 'English Alphabet & Phonics', code: 'ENG-LKG', class: 'LKG', type: 'CORE', theoryMarks: 50, practicalMarks: 50, passingMarks: 33 },
      { name: 'Hindi Varnamala', code: 'HIN-LKG', class: 'LKG', type: 'CORE', theoryMarks: 50, practicalMarks: 50, passingMarks: 33 },
      { name: 'Numbers & Counting', code: 'MTH-LKG', class: 'LKG', type: 'CORE', theoryMarks: 50, practicalMarks: 50, passingMarks: 33 },
      { name: 'Rhymes & Action Songs', code: 'RHY-LKG', class: 'LKG', type: 'ACTIVITY', theoryMarks: 0, practicalMarks: 50, passingMarks: 20 },
      { name: 'Art & Craft', code: 'ART-LKG', class: 'LKG', type: 'ACTIVITY', theoryMarks: 0, practicalMarks: 50, passingMarks: 20 },

      { name: 'English Reader & Writing', code: 'ENG-UKG', class: 'UKG', type: 'CORE', theoryMarks: 50, practicalMarks: 50, passingMarks: 33 },
      { name: 'Hindi Vyakaran & Shabd', code: 'HIN-UKG', class: 'UKG', type: 'CORE', theoryMarks: 50, practicalMarks: 50, passingMarks: 33 },
      { name: 'Basic Arithmetic', code: 'MTH-UKG', class: 'UKG', type: 'CORE', theoryMarks: 50, practicalMarks: 50, passingMarks: 33 },
      { name: 'General Awareness (EVS)', code: 'EVS-UKG', class: 'UKG', type: 'CORE', theoryMarks: 50, practicalMarks: 50, passingMarks: 33 },
      { name: 'Creative Drawing & Art', code: 'ART-UKG', class: 'UKG', type: 'ACTIVITY', theoryMarks: 0, practicalMarks: 50, passingMarks: 20 },

      { name: 'English Language & Reader', code: 'ENG-1', class: '1ST', type: 'CORE', theoryMarks: 80, practicalMarks: 20, passingMarks: 33 },
      { name: 'Hindi Vyakaran & Sahitya', code: 'HIN-1', class: '1ST', type: 'CORE', theoryMarks: 80, practicalMarks: 20, passingMarks: 33 },
      { name: 'Mathematics & Mental Maths', code: 'MTH-1', class: '1ST', type: 'CORE', theoryMarks: 80, practicalMarks: 20, passingMarks: 33 },
      { name: 'Environmental Studies (EVS)', code: 'EVS-1', class: '1ST', type: 'CORE', theoryMarks: 80, practicalMarks: 20, passingMarks: 33 },
      { name: 'Computer Science & Coding', code: 'CS-1', class: '1ST', type: 'CORE', theoryMarks: 50, practicalMarks: 50, passingMarks: 33 },
      { name: 'General Knowledge & Moral Science', code: 'GK-1', class: '1ST', type: 'ACTIVITY', theoryMarks: 50, practicalMarks: 0, passingMarks: 20 },
      { name: 'Art, Craft & Creative Expression', code: 'ART-1', class: '1ST', type: 'ACTIVITY', theoryMarks: 0, practicalMarks: 50, passingMarks: 20 },

      { name: 'English Language & Literature (184)', code: 'ENG-10', class: '10TH', type: 'CORE', theoryMarks: 80, practicalMarks: 20, passingMarks: 33 },
      { name: 'Hindi Course A (002)', code: 'HIN-10', class: '10TH', type: 'CORE', theoryMarks: 80, practicalMarks: 20, passingMarks: 33 },
      { name: 'Mathematics Standard (041)', code: 'MTH-10', class: '10TH', type: 'CORE', theoryMarks: 80, practicalMarks: 20, passingMarks: 33 },
      { name: 'Science (Physics, Chem, Bio) (086)', code: 'SCI-10', class: '10TH', type: 'CORE', theoryMarks: 80, practicalMarks: 20, passingMarks: 33 },
      { name: 'Social Science (087)', code: 'SST-10', class: '10TH', type: 'CORE', theoryMarks: 80, practicalMarks: 20, passingMarks: 33 },
      { name: 'Information Technology (402)', code: 'IT-10', class: '10TH', type: 'ELECTIVE', theoryMarks: 50, practicalMarks: 50, passingMarks: 33 },
    ];

    const entities = this.subjectRepository.create(defaultData);
    await this.subjectRepository.save(entities);
  }
}
