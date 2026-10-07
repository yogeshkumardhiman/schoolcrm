import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, ILike } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { StaffEntity } from './entities/staff.entity';
import { StaffLeaveRequestEntity } from './entities/staff-leave.entity';
import { StaffAttendanceEntity } from './entities/staff-attendance.entity';
import { StaffTimetableEntity } from './entities/staff-timetable.entity';
import { SubstitutionAssignmentEntity } from './entities/substitution-assignment.entity';
import { UserEntity, UserType } from '../auth/entities/user.entity';
import { StudentEntity } from '../students/entities/student.entity';
import { AttendanceEntity } from '../attendance/entities/attendance.entity';
import { MailService } from '../mail/mail.service';
import { StorageService } from '../../core/storage/storage.service';
import { DocumentsService } from '../documents/documents.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { CreateStaffLeaveDto, UpdateStaffLeaveStatusDto } from './dto/staff-leave.dto';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(StaffEntity)
    private readonly staffRepository: Repository<StaffEntity>,
    @InjectRepository(StaffLeaveRequestEntity)
    private readonly leaveRepository: Repository<StaffLeaveRequestEntity>,
    @InjectRepository(StaffAttendanceEntity)
    private readonly staffAttendanceRepository: Repository<StaffAttendanceEntity>,
    @InjectRepository(StaffTimetableEntity)
    private readonly timetableRepository: Repository<StaffTimetableEntity>,
    @InjectRepository(SubstitutionAssignmentEntity)
    private readonly substitutionRepository: Repository<SubstitutionAssignmentEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>,
    @InjectRepository(AttendanceEntity)
    private readonly attendanceRepository: Repository<AttendanceEntity>,
    private readonly mailService: MailService,
    private readonly storageService: StorageService,
    private readonly documentsService: DocumentsService,
  ) {}

  private async enrichStaffMedia(staff: StaffEntity): Promise<StaffEntity> {
    if (!staff) return staff;
    if (staff.image) {
      staff.image = await this.storageService.getPresignedUrl(staff.image, 604800);
    }

    if (staff.userId) {
      const userDocs = await this.documentsService.findByUserId(staff.userId);
      if (userDocs && userDocs.length > 0) {
        staff.documents = userDocs;
        return staff;
      }
    }

    if (Array.isArray(staff.documents)) {
      staff.documents = await Promise.all(
        staff.documents.map(async (doc: any) => {
          if (doc && doc.url) {
            const signedUrl = await this.storageService.getPresignedUrl(doc.url, 604800);
            return { ...doc, url: signedUrl };
          }
          return doc;
        }),
      );
    }
    return staff;
  }

  async findAll(): Promise<StaffEntity[]> {
    const staffList = await this.staffRepository.find({
      relations: { dynamicRole: true },
      order: { name: 'ASC' },
    });
    return Promise.all(staffList.map((s) => this.enrichStaffMedia(s)));
  }

  async getMinimalList(role?: string): Promise<any[]> {
    const query = this.staffRepository
      .createQueryBuilder('staff')
      .select([
        'staff.id',
        'staff.name',
        'staff.role',
        'staff.subject',
        'staff.department',
        'staff.phone',
        'staff.email',
        'staff.status',
        'staff.loginId',
      ]);

    if (role) {
      query.where('UPPER(staff.role) = :role', { role: role.toUpperCase().trim() });
    }

    return query.orderBy('staff.name', 'ASC').getMany();
  }

  async findOne(id: number): Promise<StaffEntity> {
    const staff = await this.staffRepository.findOne({
      where: { id },
      relations: { dynamicRole: true },
    });
    if (!staff) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }
    return this.enrichStaffMedia(staff);
  }

  async findOneByUserIdOrEmail(userId?: number, email?: string): Promise<StaffEntity | null> {
    if (!userId && !email) return null;
    const conditions: any[] = [];
    if (userId) {
      conditions.push({ userId }, { id: userId });
    }
    if (email) {
      conditions.push({ email });
    }
    return this.staffRepository.findOne({ where: conditions });
  }

  private async generateUniqueStaffLoginId(role?: string): Promise<string> {
    const year = new Date().getFullYear();
    const rolePrefix =
      role === 'MANAGEMENT' ? 'MGT' : role === 'ACCOUNTANT' ? 'ACC' : 'TCH';
    const schoolPrefix = (
      process.env.SCHOOL_NAME?.replace(/[^a-zA-Z]/g, '').substring(0, 3) || 'EMP'
    ).toUpperCase();
    for (let i = 0; i < 10; i++) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const loginId = `${schoolPrefix}${year}${rolePrefix}${randomNum}`;
      const existing = await this.userRepository.findOne({ where: { loginId } });
      if (!existing) {
        return loginId;
      }
    }
    return `${schoolPrefix}${year}${rolePrefix}${Date.now().toString().slice(-4)}`;
  }

  async create(dto: CreateStaffDto): Promise<any> {
    const email = dto.email ? dto.email.trim().toLowerCase() : '';

    // 🛡️ Single Principal Policy: Ensure no duplicate Principal profile is created
    const isPrincipal =
      dto.role?.toUpperCase() === 'PRINCIPAL' ||
      dto.designation?.toLowerCase().includes('principal');

    if (isPrincipal) {
      const existingPrincipal = await this.staffRepository.findOne({
        where: [
          { role: 'PRINCIPAL' },
          { designation: ILike('%principal%') },
        ],
      });
      if (existingPrincipal) {
        throw new ConflictException(
          `An active Principal profile (${existingPrincipal.name}) already exists. Only 1 Principal is permitted per institution. Please edit the existing Principal profile or update their role first.`,
        );
      }
    }

    if (email) {
      const existingStaff = await this.staffRepository.findOne({
        where: { email },
      });
      if (existingStaff) {
        throw new ConflictException(`Faculty member with email "${email}" already exists.`);
      }
    }

    // 🆔 Generate unique uppercase alphanumeric Login ID
    const loginId =
      dto.loginId?.trim().toUpperCase() ||
      (await this.generateUniqueStaffLoginId(dto.role));

    // 🔐 Generate plain password and hash securely with bcrypt
    const plainPassword =
      dto.password || (dto.dob ? dto.dob.replace(/-/g, '') : 'teacher@123');
    const hashedPassword = bcrypt.hashSync(plainPassword, 10);

    const fullName =
      dto.name ||
      [dto.firstName, dto.lastName].filter(Boolean).join(' ').trim();

    const newStaff = this.staffRepository.create({
      ...dto,
      name: fullName,
      loginId,
      email,
      password: hashedPassword,
    });
    const savedStaff = await this.staffRepository.save(newStaff);

    // 🔐 Create UserEntity for authentication
    const user = this.userRepository.create({
      loginId,
      email,
      password: hashedPassword,
      userType: UserType.STAFF,
      roleId: dto.roleId ? String(dto.roleId) : undefined,
      isActive: true,
    });
    const savedUser = await this.userRepository.save(user);
    savedStaff.userId = savedUser.id;
    await this.staffRepository.save(savedStaff);

    // Save documents into relational Documents table linked by userId
    if (Array.isArray(dto.documents) && dto.documents.length > 0) {
      const docsToSave = dto.documents.map((d: any) => ({
        name: d.name || d.title || d.type || 'Staff Document',
        type: d.type || 'OTHER',
        fileKey: d.fileKey || d.url || '',
        fileName: d.fileName || '',
        mimeType: d.mimeType || (d.isPdf ? 'application/pdf' : 'image/jpeg'),
        status: d.status || 'VERIFIED',
      }));
      await this.documentsService.createBulkForUser(savedUser.id, docsToSave);
    }

    // 📧 Dispatch plain credentials ONLY to staff member's registered email
    if (email) {
      this.mailService
        .sendFacultyCredentials({
          to: email,
          loginId,
          name: fullName || 'Faculty Member',
          password: plainPassword,
          role: dto.role || 'TEACHER',
          designation: dto.designation || undefined,
        })
        .catch((err) => {
          console.error('Mail dispatch failed for staff creation:', err);
        });
    }

    // Security: Do NOT return password in response
    const { password, ...safeStaffData } = savedStaff;
    return {
      ...safeStaffData,
      loginId,
      message:
        'Faculty created successfully. Login credentials dispatched to email.',
    };
  }

  async update(id: number, dto: UpdateStaffDto): Promise<StaffEntity> {
    const existingStaff = await this.staffRepository.findOne({
      where: { id },
      relations: { dynamicRole: true },
    });
    if (!existingStaff) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }

    // Clean image / document URLs to persist base URLs
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

      if (existingStaff.userId && cleanDto.documents.length > 0) {
        const docsToSave = cleanDto.documents.map((d: any) => ({
          name: d.name || d.title || d.type || 'Staff Document',
          type: d.type || 'OTHER',
          fileKey: d.fileKey || d.url || '',
          fileName: d.fileName || '',
          mimeType: d.mimeType || (d.isPdf ? 'application/pdf' : 'image/jpeg'),
          status: d.status || 'VERIFIED',
        }));
        await this.documentsService.createBulkForUser(existingStaff.userId, docsToSave);
      }
    }

    if (cleanDto.firstName !== undefined || cleanDto.lastName !== undefined) {
      const fName =
        cleanDto.firstName !== undefined ? cleanDto.firstName : existingStaff.firstName;
      const lName =
        cleanDto.lastName !== undefined ? cleanDto.lastName : existingStaff.lastName;
      cleanDto.name = [fName, lName].filter(Boolean).join(' ').trim();
    }

    const updatedStaff = this.staffRepository.merge(existingStaff, cleanDto);
    const saved = await this.staffRepository.save(updatedStaff);

    // Sync changes to linked UserEntity if needed
    if (existingStaff.userId) {
      const userUpdates: Partial<UserEntity> = {};
      if (cleanDto.email) userUpdates.email = cleanDto.email.trim().toLowerCase();
      if (cleanDto.roleId) userUpdates.roleId = String(cleanDto.roleId);
      if (Object.keys(userUpdates).length > 0) {
        await this.userRepository.update(existingStaff.userId, userUpdates);
      }
    }

    return this.enrichStaffMedia(saved);
  }

  async remove(id: number): Promise<{ success: boolean; message: string }> {
    const staff = await this.findOne(id);
    const userId = staff.userId;

    // 1. Delete associated leaves
    await this.leaveRepository.delete({ staffId: id });

    // 2. Delete associated attendances
    await this.staffAttendanceRepository.delete({ staffId: id });

    // 3. Delete associated timetables
    await this.timetableRepository.delete({ staffId: id });

    // 4. Delete associated substitutions
    await this.substitutionRepository.delete({ absentTeacherId: id });
    await this.substitutionRepository.delete({ substituteTeacherId: id });

    // 5. Delete staff record
    await this.staffRepository.remove(staff);

    // 6. Delete associated user auth account if linked
    if (userId) {
      await this.userRepository.delete(userId);
    }

    return { success: true, message: `Staff ID ${id} deleted successfully` };
  }

  // --- LEAVE MANAGEMENT ---

  async resolveStaffIdFromUser(user?: any, requestedStaffId?: number): Promise<number> {
    if (requestedStaffId) {
      return requestedStaffId;
    }

    if (user && user.id) {
      const parsedUserId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
      const staffMember = await this.staffRepository.findOne({
        where: [{ userId: parsedUserId }, { id: parsedUserId }],
      });
      if (staffMember) {
        return staffMember.id;
      }
    }

    const anyStaff = await this.staffRepository.findOne({ order: { id: 'ASC' } });
    if (anyStaff) {
      return anyStaff.id;
    }

    throw new NotFoundException('No faculty or staff profile found to associate leave petition.');
  }

  async applyLeave(dto: CreateStaffLeaveDto, user?: any): Promise<StaffLeaveRequestEntity> {
    const resolvedStaffId = await this.resolveStaffIdFromUser(user, dto.staffId);
    const leaveRequest = this.leaveRepository.create({
      ...dto,
      staffId: resolvedStaffId,
      status: 'PENDING',
    });
    return this.leaveRepository.save(leaveRequest);
  }

  async getLeaveRequests(staffId?: number, user?: any): Promise<StaffLeaveRequestEntity[]> {
    const whereCondition: any = {};
    if (staffId) {
      whereCondition.staffId = staffId;
    } else if (user && (user.role === 'TEACHER' || user.role === 'STAFF')) {
      const parsedUserId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
      const staffMember = await this.staffRepository.findOne({
        where: [{ userId: parsedUserId }, { id: parsedUserId }],
      });
      if (staffMember) {
        whereCondition.staffId = staffMember.id;
      }
    }

    return this.leaveRepository.find({
      where: whereCondition,
      relations: { staff: true },
      order: { id: 'DESC' },
    });
  }

  async updateLeaveStatus(
    leaveId: number,
    dto: UpdateStaffLeaveStatusDto,
  ): Promise<StaffLeaveRequestEntity> {
    const leaveRequest = await this.leaveRepository.findOne({
      where: { id: leaveId },
    });
    if (!leaveRequest) {
      throw new NotFoundException(`Leave request ID ${leaveId} not found`);
    }
    leaveRequest.status = dto.status;
    return this.leaveRepository.save(leaveRequest);
  }

  async deleteLeaveRequest(id: number): Promise<{ success: boolean; message: string }> {
    const leaveRequest = await this.leaveRepository.findOne({ where: { id } });
    if (!leaveRequest) {
      throw new NotFoundException(`Leave petition #${id} not found`);
    }
    await this.leaveRepository.delete({ id });
    return { success: true, message: `Leave petition #${id} cancelled` };
  }

  // --- TIMETABLE MANAGEMENT ---

  async getTimetable(query: {
    className?: string;
    section?: string;
    staffId?: number;
  }): Promise<StaffTimetableEntity[]> {
    const where: any = {};
    if (query.className && query.className !== 'All Classes' && query.className !== 'ALL') {
      const cleanCls = query.className.toUpperCase().replace(/^(GRADE|CLASS)\s*/i, '').trim();
      where.class = ILike(`%${cleanCls}%`);
    }
    if (query.section && query.section !== 'All Sections' && query.section !== 'ALL') {
      where.section = ILike(query.section.trim());
    }
    if (query.staffId) {
      where.staffId = query.staffId;
    }

    return this.timetableRepository.find({
      where,
      relations: { staff: true },
      order: { day: 'ASC', period: 'ASC' },
    });
  }

  async assignTimetablePeriod(dto: {
    class: string;
    section?: string;
    day: string;
    period: string | number;
    subject: string;
    staffId?: number;
  }): Promise<StaffTimetableEntity> {
    const periodStr = String(dto.period);
    const sectionStr = dto.section || 'A';
    const parsedStaffId = dto.staffId ? Number(dto.staffId) : undefined;

    const existing = await this.timetableRepository.findOne({
      where: {
        class: dto.class,
        section: sectionStr,
        day: dto.day.toUpperCase(),
        period: periodStr,
      },
    });

    if (existing) {
      await this.timetableRepository.update(existing.id, {
        subject: dto.subject,
        staffId: parsedStaffId,
      });
      const updated = await this.timetableRepository.findOne({
        where: { id: existing.id },
        relations: { staff: true },
      });
      return updated as StaffTimetableEntity;
    }

    const created = this.timetableRepository.create({
      class: dto.class,
      section: sectionStr,
      day: dto.day.toUpperCase(),
      period: periodStr,
      subject: dto.subject,
      staffId: parsedStaffId,
    });
    const saved = await this.timetableRepository.save(created);
    const result = await this.timetableRepository.findOne({
      where: { id: saved.id },
      relations: { staff: true },
    });
    return result as StaffTimetableEntity;
  }

  async deleteTimetablePeriod(id: number): Promise<{ success: boolean }> {
    await this.timetableRepository.delete(id);
    return { success: true };
  }

  // --- SUBSTITUTIONS ---

  async getSubstitutions(queryDate?: string): Promise<any[]> {
    const date = queryDate || new Date().toISOString().split('T')[0];
    const day = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

    // 1. Get absent / on-leave teachers for date
    const absentAttendance = await this.staffAttendanceRepository.find({
      where: [
        { date, status: 'ABSENT' },
        { date, status: 'LEAVE' },
      ],
      relations: { staff: true },
    });

    const absentStaffIds = absentAttendance.map((a) => a.staffId).filter(Boolean);

    // 2. Get timetable periods for absent teachers today
    const vacancies =
      absentStaffIds.length > 0
        ? await this.timetableRepository.find({
            where: {
              staffId: In(absentStaffIds),
              day,
            },
            relations: { staff: true },
          })
        : [];

    // 3. Get existing assignments for today
    const assignments = await this.substitutionRepository.find({
      where: { date },
      relations: { absentTeacher: true, substituteTeacher: true },
    });

    // 4. Merge vacancies with assignments
    const result = vacancies.map((v) => {
      const assignment = assignments.find(
        (a) =>
          a.absentTeacherId === v.staffId &&
          String(a.period) === String(v.period) &&
          a.class === v.class &&
          a.section === v.section,
      );
      return {
        id: v.id,
        staffId: v.staffId,
        staff: v.staff,
        class: v.class,
        section: v.section,
        period: v.period,
        subject: v.subject,
        day: v.day,
        assignment: assignment || null,
      };
    });

    if (result.length === 0 && assignments.length > 0) {
      return assignments.map((a) => ({
        id: a.id,
        staffId: a.absentTeacherId,
        staff: a.absentTeacher,
        class: a.class,
        section: a.section,
        period: a.period,
        subject: 'SUBSTITUTION',
        assignment: a,
      }));
    }

    return result;
  }

  async assignSubstitution(dto: {
    absentTeacherId: number;
    substituteTeacherId: number;
    period: string;
    class: string;
    section: string;
    date: string;
  }): Promise<SubstitutionAssignmentEntity> {
    const existing = await this.substitutionRepository.findOne({
      where: {
        absentTeacherId: dto.absentTeacherId,
        period: String(dto.period),
        class: dto.class,
        section: dto.section || 'A',
        date: dto.date,
      },
    });

    if (existing) {
      existing.substituteTeacherId = dto.substituteTeacherId;
      return this.substitutionRepository.save(existing);
    }

    const created = this.substitutionRepository.create({
      absentTeacherId: dto.absentTeacherId,
      substituteTeacherId: dto.substituteTeacherId,
      period: String(dto.period),
      class: dto.class,
      section: dto.section || 'A',
      date: dto.date,
    });
    return this.substitutionRepository.save(created);
  }

  async getMySubstitutions(userOrStaffId: any, date?: string): Promise<SubstitutionAssignmentEntity[]> {
    const staffId = typeof userOrStaffId === 'number'
      ? userOrStaffId
      : (await this.findOneByUserIdOrEmail(
          userOrStaffId?.id ? (typeof userOrStaffId.id === 'string' ? parseInt(userOrStaffId.id, 10) : userOrStaffId.id) : 0,
          userOrStaffId?.email,
        ))?.id;

    if (!staffId) return [];
    const whereCondition: any = { substituteTeacherId: staffId };
    if (date) whereCondition.date = date;

    return this.substitutionRepository.find({
      where: whereCondition,
      relations: { absentTeacher: true },
      order: { period: 'ASC' },
    });
  }

  async getMyPersonalTimetable(user?: any): Promise<any[]> {
    const parsedUserId = user?.id ? (typeof user.id === 'string' ? parseInt(user.id, 10) : user.id) : 0;
    const staff = await this.findOneByUserIdOrEmail(parsedUserId, user?.email);
    if (!staff) return [];
    return this.getTimetable({ staffId: staff.id });
  }

  async getMyClassStudents(
    user: any,
    reqClass?: string,
    reqSection?: string,
  ): Promise<{
    assignedClass: string | null;
    assignedSection: string | null;
    isClassTeacher: boolean;
    availableClasses: string[];
    students: any[];
  }> {
    if (!user) {
      return {
        assignedClass: null,
        assignedSection: null,
        isClassTeacher: false,
        availableClasses: [],
        students: [],
      };
    }
    const parsedUserId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
    const staffMember = await this.staffRepository.findOne({
      where: [{ userId: parsedUserId }, { id: parsedUserId }],
    });

    const isTeacher = user.role === 'TEACHER' || user.type === 'STAFF';
    const teacherClass = staffMember?.class || (user as any)?.class;
    const teacherSection = staffMember?.section || (user as any)?.section;

    // Distinct classes in institution
    const allClassesInDb = await this.studentRepository
      .createQueryBuilder('student')
      .select('DISTINCT student.class', 'class')
      .where('student.class IS NOT NULL')
      .getRawMany();
    const availableClasses: string[] = allClassesInDb
      .map((c) => c.class)
      .filter(Boolean)
      .sort();

    // Default class for view:
    // If teacher: locked to their class
    // If admin and no reqClass specified: default to first available class (or '9TH')
    const fallbackClass = availableClasses.length > 0 ? availableClasses[0] : '9TH';
    const activeClass =
      isTeacher && teacherClass
        ? teacherClass
        : reqClass && reqClass !== 'All Classes' && reqClass !== 'ALL'
          ? reqClass
          : (teacherClass || fallbackClass);

    const activeSection =
      isTeacher && teacherSection
        ? teacherSection
        : reqSection && reqSection !== 'All Sections' && reqSection !== 'ALL'
          ? reqSection
          : (teacherSection || 'ALL');

    const query: any = {};
    if (activeClass && activeClass !== 'NONE' && activeClass !== 'ALL' && activeClass !== 'All Classes') {
      const cleanPrefix = activeClass.toUpperCase().replace(/[^A-Z0-9]/g, '');
      query.class = ILike(`%${cleanPrefix}%`);
    }
    if (activeSection && activeSection !== 'ALL' && activeSection !== 'All Sections') {
      query.section = ILike(activeSection.trim());
    }

    const students = await this.studentRepository.find({
      where: query,
      order: { rollNo: 'ASC', name: 'ASC' },
      take: 200,
    });

    const enriched = await Promise.all(
      students.map(async (s) => {
        const studentImg = s.image
          ? await this.storageService.getPresignedUrl(s.image, 604800).catch(() => s.image)
          : s.image;
        return {
          ...s,
          image: studentImg,
          feeStatus: 'PAID',
          dueAmount: 0,
          pendingHomework: 0,
        };
      }),
    );

    return {
      assignedClass: teacherClass || activeClass || null,
      assignedSection: teacherSection || (activeSection !== 'ALL' ? activeSection : null),
      isClassTeacher: Boolean(isTeacher && teacherClass),
      availableClasses,
      students: enriched,
    };
  }

  async getMyProfile(user?: JwtPayload): Promise<any> {
    if (!user) {
      throw new NotFoundException('User session not found');
    }

    const targetUserId = user.id ? Number(user.id) : 0;
    const staff = await this.staffRepository.findOne({
      where: [{ userId: targetUserId }, { email: user.email }],
      relations: { dynamicRole: true },
    });

    if (!staff) {
      return {
        id: user.id,
        name: user.email ? user.email.split('@')[0] : 'User',
        email: user.email || '',
        role: user.role,
        userType: user.userType,
        permissions: user.permissions || [],
      };
    }

    const enriched = await this.enrichStaffMedia(staff);
    const leaveRequests = await this.leaveRepository.find({
      where: { staffId: staff.id },
      order: { id: 'DESC' },
      take: 10,
    });

    const approvedLeaves = leaveRequests.filter((l) => l.status === 'APPROVED');
    const usedLeaves = approvedLeaves.reduce((acc, l) => {
      const from = l.startDate ? new Date(l.startDate).getTime() : Date.now();
      const to = l.endDate ? new Date(l.endDate).getTime() : from;
      const days = Math.max(1, Math.round((to - from) / (1000 * 60 * 60 * 24)) + 1);
      return acc + days;
    }, 0);

    const defaultAssigned = enriched.subject
      ? [{ class: enriched.class || 'ALL', section: enriched.section || 'A', subject: enriched.subject }]
      : [];

    return {
      ...enriched,
      assignedSubjects: Array.isArray(enriched.assignedSubjects) && enriched.assignedSubjects.length > 0
        ? enriched.assignedSubjects
        : defaultAssigned,
      leaveBalance: {
        total: 18,
        used: usedLeaves,
        available: Math.max(0, 18 - usedLeaves),
      },
      recentLeaves: leaveRequests,
    };
  }

  async getMyAssignments(user?: JwtPayload): Promise<{
    isClassTeacher: boolean;
    classIncharge: { class: string; section: string } | null;
    primarySubject: string | null;
    assignedSubjects: { class: string; section?: string; subject: string }[];
  }> {
    if (!user) {
      return {
        isClassTeacher: false,
        classIncharge: null,
        primarySubject: null,
        assignedSubjects: [],
      };
    }

    const targetUserId = user.id ? Number(user.id) : 0;
    const staff = await this.staffRepository.findOne({
      where: [{ userId: targetUserId }, { email: user.email }],
    });

    if (!staff) {
      return {
        isClassTeacher: false,
        classIncharge: null,
        primarySubject: null,
        assignedSubjects: [],
      };
    }

    const isClassTeacher = Boolean(staff.class && staff.class !== 'NONE' && staff.class !== '');
    const assignedSubjects = Array.isArray(staff.assignedSubjects) && staff.assignedSubjects.length > 0
      ? staff.assignedSubjects
      : staff.subject
        ? [{ class: staff.class || 'ALL', section: staff.section || 'A', subject: staff.subject }]
        : [];

    return {
      isClassTeacher,
      classIncharge: isClassTeacher ? { class: staff.class, section: staff.section || 'A' } : null,
      primarySubject: staff.subject || null,
      assignedSubjects,
    };
  }

  /**
   * GET /staff/me/class-stats
   * Lightweight dashboard data for Class Teacher:
   * - total students in their class
   * - today's present / absent / leave count
   * - recent 5 absent students
   */
  async getMyClassStats(user?: JwtPayload): Promise<{
    classLabel: string;
    section: string;
    totalStudents: number;
    presentToday: number;
    absentToday: number;
    leaveToday: number;
    attendanceMarked: boolean;
    attendancePercentage: string;
    recentAbsent: { name: string; rollNo: string; reason?: string }[];
    genderBreakdown: { boys: number; girls: number };
  }> {
    const fallback = {
      classLabel: '', section: 'A',
      totalStudents: 0, presentToday: 0, absentToday: 0, leaveToday: 0,
      attendanceMarked: false, attendancePercentage: '0',
      recentAbsent: [], genderBreakdown: { boys: 0, girls: 0 },
    };

    if (!user) return fallback;

    const targetUserId = user.id ? Number(user.id) : 0;
    const staff = await this.staffRepository.findOne({
      where: [{ userId: targetUserId }, { email: user.email }],
    });

    const classLabel = staff?.class || user.class || '';
    const section = staff?.section || user.section || 'A';

    if (!classLabel || classLabel === 'NONE') return fallback;

    const today = new Date().toISOString().slice(0, 10);

    const [totalStudents, todayAttendance, allStudents] = await Promise.all([
      this.studentRepository.count({
        where: { class: classLabel, section },
      }),
      this.attendanceRepository.find({
        where: { class: classLabel.toUpperCase(), section: section.toUpperCase(), date: today },
        select: { studentId: true, status: true },
      }),
      this.studentRepository.find({
        where: { class: classLabel, section },
        select: { id: true, name: true, rollNo: true, gender: true },
        take: 200,
      }),
    ]);

    const presentToday = todayAttendance.filter(a => a.status === 'PRESENT').length;
    const absentToday = todayAttendance.filter(a => a.status === 'ABSENT').length;
    const leaveToday = todayAttendance.filter(a => a.status === 'LEAVE').length;
    const attendanceMarked = todayAttendance.length > 0;

    const absentIds = todayAttendance
      .filter(a => a.status === 'ABSENT')
      .map(a => a.studentId);
    const recentAbsent = allStudents
      .filter(s => absentIds.includes(s.id))
      .slice(0, 5)
      .map(s => ({ name: s.name || 'Unknown', rollNo: s.rollNo || '' }));

    const boys = allStudents.filter(s => (s.gender || '').toUpperCase() === 'MALE' || (s.gender || '').toUpperCase() === 'BOY').length;
    const girls = allStudents.filter(s => (s.gender || '').toUpperCase() === 'FEMALE' || (s.gender || '').toUpperCase() === 'GIRL').length;

    const effectiveTotal = totalStudents > 0 ? totalStudents : 1;
    const attendancePercentage = attendanceMarked
      ? ((presentToday / effectiveTotal) * 100).toFixed(1)
      : '—';

    return {
      classLabel,
      section,
      totalStudents,
      presentToday,
      absentToday,
      leaveToday,
      attendanceMarked,
      attendancePercentage,
      recentAbsent,
      genderBreakdown: { boys, girls },
    };
  }

  async recordSelfAttendance(user: any, dto?: any): Promise<{ success: boolean; message: string; record: StaffAttendanceEntity }> {
    const parsedUserId = user?.id ? (typeof user.id === 'string' ? parseInt(user.id, 10) : user.id) : 0;
    const staff = await this.findOneByUserIdOrEmail(parsedUserId, user?.email);
    if (!staff) {
      throw new NotFoundException('Staff member profile not found for self attendance.');
    }
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('en-US', { hour12: false });
    const existing = await this.staffAttendanceRepository.findOne({
      where: { staffId: staff.id, date: today },
    });
    if (existing) {
      existing.checkOutTime = nowTime;
      const updated = await this.staffAttendanceRepository.save(existing);
      return { success: true, message: 'Clock-out recorded successfully', record: updated };
    }
    const newRecord = this.staffAttendanceRepository.create({
      staffId: staff.id,
      date: today,
      status: 'PRESENT',
      markedBy: staff.name || 'Self Check-in',
      checkInTime: nowTime,
      remark: dto?.remark || 'Mobile Self Check-in',
    });
    const saved = await this.staffAttendanceRepository.save(newRecord);
    return { success: true, message: 'Attendance marked successfully', record: saved };
  }

  async updateProfileByUserId(userId: number, payload: any): Promise<StaffEntity> {
    const staff = await this.findOneByUserIdOrEmail(userId);
    if (!staff) {
      throw new NotFoundException(`Staff profile for User ID ${userId} not found`);
    }
    return this.update(staff.id, payload);
  }

  /**
   * Reset faculty member's password and dispatch updated credentials to their registered email
   */
  async resetPasswordAndNotify(id: number, customPassword?: string) {
    const staff = await this.staffRepository.findOne({ where: { id } });
    if (!staff) {
      throw new NotFoundException(`Faculty member with ID #${id} not found.`);
    }

    if (!staff.email || !staff.email.trim()) {
      throw new BadRequestException(
        `Faculty member "${staff.name || 'Staff'}" does not have a registered email address. Please update their email first.`,
      );
    }

    // 1. Generate or use specified temporary password
    const plainPassword =
      customPassword && customPassword.trim().length >= 6
        ? customPassword.trim()
        : `Sdm@${Math.floor(100000 + Math.random() * 900000)}`;

    const hashedPassword = bcrypt.hashSync(plainPassword, 10);

    // 2. Update staff entity
    staff.password = hashedPassword;
    await this.staffRepository.save(staff);

    // 3. Update or sync corresponding UserEntity
    if (staff.userId) {
      await this.userRepository.update(staff.userId, { password: hashedPassword });
    } else {
      const existingUser = await this.userRepository.findOne({
        where: [
          ...(staff.loginId ? [{ loginId: staff.loginId }] : []),
          { email: staff.email },
        ],
      });
      if (existingUser) {
        existingUser.password = hashedPassword;
        staff.userId = existingUser.id;
        await this.staffRepository.save(staff);
        await this.userRepository.save(existingUser);
      } else {
        const newUser = this.userRepository.create({
          loginId: staff.loginId || staff.email,
          email: staff.email,
          password: hashedPassword,
          userType: UserType.STAFF,
          isActive: true,
        });
        const savedUser = await this.userRepository.save(newUser);
        staff.userId = savedUser.id;
        await this.staffRepository.save(staff);
      }
    }

    // 4. Send email dispatch
    let emailSent = false;
    try {
      emailSent = await this.mailService.sendFacultyCredentials({
        to: staff.email,
        name: staff.name || 'Faculty Member',
        loginId: staff.loginId || staff.email,
        password: plainPassword,
        role: staff.role || 'TEACHER',
        designation: staff.designation,
        isPasswordReset: true,
      });
    } catch (err) {
      console.error('Password reset email dispatch error:', err);
      emailSent = false;
    }

    return {
      success: true,
      message: emailSent
        ? `Password reset successfully. Login credentials sent to ${staff.email}.`
        : `Password reset successfully, but email dispatch failed. Please check SMTP settings. Temporary password: ${plainPassword}`,
      emailSent,
      temporaryPassword: plainPassword,
      loginId: staff.loginId || staff.email,
      email: staff.email,
      staffName: staff.name,
    };
  }
}
