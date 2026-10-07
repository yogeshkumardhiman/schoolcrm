import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, IsNull } from 'typeorm';
import { ClassSectionEntity } from './entities/class-section.entity';
import { StudentEntity } from '../students/entities/student.entity';
import { StaffEntity } from '../staff/entities/staff.entity';
import { SchoolInfoEntity } from '../settings/entities/school-info.entity';
import { CreateClassSectionDto } from './dto/create-class-section.dto';
import { UpdateClassSectionDto } from './dto/update-class-section.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(ClassSectionEntity)
    private readonly sectionRepository: Repository<ClassSectionEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>,
    @InjectRepository(StaffEntity)
    private readonly staffRepository: Repository<StaffEntity>,
    @InjectRepository(SchoolInfoEntity)
    private readonly schoolInfoRepository: Repository<SchoolInfoEntity>,
  ) {}

  async getClassSummary(session?: string): Promise<any> {
    const ALL_CANONICAL_CLASSES = [
      'PLAYGROUP', 'NURSERY', 'LKG', 'UKG',
      '1ST', '2ND', '3RD', '4TH', '5TH',
      '6TH', '7TH', '8TH', '9TH', '10TH', '11TH', '12TH'
    ];

    // Fetch School Operating Range Configuration from SchoolInfo
    const schoolInfo = await this.schoolInfoRepository.findOne({ where: {} });
    const minClass = (schoolInfo?.minClass || 'NURSERY').toUpperCase().trim();
    const maxClass = (schoolInfo?.maxClass || '12TH').toUpperCase().trim();

    const minIdx = ALL_CANONICAL_CLASSES.findIndex((c) => c === minClass || c.startsWith(minClass));
    const maxIdx = ALL_CANONICAL_CLASSES.findIndex((c) => c === maxClass || c.startsWith(maxClass));

    const startIdx = minIdx !== -1 ? minIdx : 1; // Default NURSERY
    const endIdx = maxIdx !== -1 ? maxIdx : ALL_CANONICAL_CLASSES.length - 1; // Default 12TH

    const configuredClasses = ALL_CANONICAL_CLASSES.slice(startIdx, endIdx + 1);

    const getWing = (cls: string) => {
      const c = cls.toUpperCase();
      if (['PLAYGROUP', 'NURSERY', 'LKG', 'UKG', 'PRE-NURSERY', 'KG'].includes(c)) return 'PRE-PRIMARY';
      if (['1ST', '2ND', '3RD', '4TH', '5TH'].includes(c)) return 'PRIMARY';
      if (['6TH', '7TH', '8TH'].includes(c)) return 'MIDDLE';
      if (['9TH', '10TH'].includes(c)) return 'SECONDARY';
      return 'SENIOR SECONDARY';
    };

    const sessionList = session
      ? Array.from(
          new Set(
            [session, session.replace(/\s+/g, ''), session.replace('-', ' - ')].filter(
              (s): s is string => typeof s === 'string' && s.length > 0,
            ),
          ),
        )
      : [];

    // 1. Fetch aggregated student counts strictly for configured classes
    const studentCountQuery = this.studentRepository
      .createQueryBuilder('student')
      .select('UPPER(student.class)', 'className')
      .addSelect('COUNT(student.id)', 'count')
      .where('UPPER(student.class) IN (:...classes)', { classes: configuredClasses });

    if (sessionList.length > 0) {
      studentCountQuery.andWhere('(student.session IN (:...sessions) OR student.session IS NULL OR TRIM(student.session) = :emptyStr)', {
        sessions: sessionList,
        emptyStr: '',
      });
    }

    const rawStudentCounts = await studentCountQuery.groupBy('UPPER(student.class)').getRawMany();
    const studentCountMap = new Map<string, number>();
    let totalStudents = 0;
    rawStudentCounts.forEach((r) => {
      const count = parseInt(r.count, 10) || 0;
      studentCountMap.set(r.className, count);
      totalStudents += count;
    });

    // 2. Fetch all sections for configured classes with classTeacher relation
    const sectionWhere = sessionList.length > 0
      ? [
          { class: In(configuredClasses), session: In(sessionList) },
          { class: In(configuredClasses), session: IsNull() },
        ]
      : { class: In(configuredClasses) };

    const sections = await this.sectionRepository.find({
      where: sectionWhere,
      relations: { classTeacher: true },
      order: { class: 'ASC', section: 'ASC' },
    });

    // Count students per section within configured classes
    const sectionStudentQuery = this.studentRepository
      .createQueryBuilder('student')
      .select('UPPER(student.class)', 'className')
      .addSelect('UPPER(student.section)', 'sectionName')
      .addSelect('COUNT(student.id)', 'count')
      .where('UPPER(student.class) IN (:...classes)', { classes: configuredClasses });

    if (sessionList.length > 0) {
      sectionStudentQuery.andWhere('(student.session IN (:...sessions) OR student.session IS NULL OR TRIM(student.session) = :emptyStr)', {
        sessions: sessionList,
        emptyStr: '',
      });
    }

    const sectionStudentCounts = await sectionStudentQuery
      .groupBy('UPPER(student.class)')
      .addGroupBy('UPPER(student.section)')
      .getRawMany();

    const sectionCountMap = new Map<string, number>();
    sectionStudentCounts.forEach((r) => {
      sectionCountMap.set(`${r.className}_${r.sectionName}`, parseInt(r.count, 10) || 0);
    });

    // Group sections by class with full classTeacher details
    const classSectionsMap = new Map<string, any[]>();
    sections.forEach((sec) => {
      const clsKey = (sec.class || '').toUpperCase().trim();
      const secKey = (sec.section || 'A').toUpperCase().trim();
      const count = sectionCountMap.get(`${clsKey}_${secKey}`) || 0;

      const list = classSectionsMap.get(clsKey) || [];
      list.push({
        id: sec.id,
        class: sec.class,
        section: sec.section,
        roomNo: sec.roomNo,
        capacity: sec.capacity || 50,
        studentCount: count,
        classTeacherId: sec.classTeacherId,
        classTeacher: sec.classTeacher ? {
          id: sec.classTeacher.id,
          name: sec.classTeacher.name,
          phone: sec.classTeacher.phone,
          subject: sec.classTeacher.subject,
        } : null,
      });
      classSectionsMap.set(clsKey, list);
    });

    // 3. Total teachers and assigned teachers
    const [totalTeachers, assignedCount] = await Promise.all([
      this.staffRepository.count({ where: [{ role: 'TEACHER' }, { role: 'Teacher' }] }),
      this.sectionRepository.count({
        where: {
          classTeacherId: Not(IsNull()),
          class: In(configuredClasses),
        },
      }),
    ]);

    // 4. Construct dynamic class registry list
    const classes = configuredClasses.map((clsName) => {
      const studentCount = studentCountMap.get(clsName) || 0;
      const classSections = classSectionsMap.get(clsName) || [];
      return {
        class: clsName,
        wing: getWing(clsName),
        session: session || '2026-2027',
        studentCount,
        sections: classSections,
      };
    });

    return {
      summary: {
        totalClasses: configuredClasses.length,
        totalStudents,
        totalTeachers,
        availableTeachers: Math.max(0, totalTeachers - assignedCount),
        totalSections: sections.length,
        minClass,
        maxClass,
      },
      classes,
    };
  }

  async getSectionRoster(id: number): Promise<any> {
    const section = await this.sectionRepository.findOne({
      where: { id },
      relations: { classTeacher: true },
    });
    if (!section) {
      throw new NotFoundException(`Section #${id} not found`);
    }

    const students = await this.studentRepository.find({
      where: { class: section.class, section: section.section },
      select: {
        id: true,
        name: true,
        admissionNo: true,
        rollNo: true,
        class: true,
        section: true,
        fatherName: true,
        gender: true,
        phone: true,
      },
      order: { name: 'ASC' },
    });

    return {
      section,
      students,
      totalCount: students.length,
    };
  }

  async getTeachersList(): Promise<any[]> {
    return this.staffRepository.find({
      where: [{ role: 'TEACHER' }, { role: 'Teacher' }],
      select: {
        id: true,
        name: true,
        role: true,
        designation: true,
        subject: true,
        phone: true,
        email: true,
      },
      order: { name: 'ASC' },
    });
  }

  async findAllSections(className?: string, session?: string): Promise<any[]> {
    const sessionList = session
      ? Array.from(
          new Set(
            [session, session.replace(/\s+/g, ''), session.replace('-', ' - ')].filter(
              (s): s is string => typeof s === 'string' && s.length > 0,
            ),
          ),
        )
      : [];

    const baseWhere: any = {};
    if (className && className !== 'ALL') {
      baseWhere.class = className.toUpperCase().trim();
    }

    const where = sessionList.length > 0
      ? [
          { ...baseWhere, session: In(sessionList) },
          { ...baseWhere, session: IsNull() },
        ]
      : baseWhere;

    const sections = await this.sectionRepository.find({
      where,
      order: { class: 'ASC', section: 'ASC' },
      relations: { classTeacher: true },
    });

    // Enrich each section with active student count
    const enriched = await Promise.all(
      sections.map(async (sec) => {
        const studentCountQuery = this.studentRepository
          .createQueryBuilder('student')
          .where('UPPER(student.class) = :cls', { cls: (sec.class || '').toUpperCase().trim() })
          .andWhere('UPPER(student.section) = :sName', { sName: (sec.section || '').toUpperCase().trim() });

        if (sessionList.length > 0) {
          studentCountQuery.andWhere('(student.session IN (:...sessions) OR student.session IS NULL OR TRIM(student.session) = :emptyStr)', {
            sessions: sessionList,
            emptyStr: '',
          });
        }

        const studentCount = await studentCountQuery.getCount();
        return {
          ...sec,
          studentCount,
        };
      }),
    );

    return enriched;
  }

  async findOneSection(id: number): Promise<any> {
    const section = await this.sectionRepository.findOne({
      where: { id },
      relations: { classTeacher: true },
    });
    if (!section) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }

    const students = await this.studentRepository.find({
      where: { class: section.class, section: section.section },
      order: { rollNo: 'ASC', name: 'ASC' },
    });

    return {
      ...section,
      students,
      studentCount: students.length,
    };
  }

  async createSection(dto: CreateClassSectionDto): Promise<ClassSectionEntity> {
    const normalizedClass = dto.class.toUpperCase().trim();
    const normalizedSection = dto.section.toUpperCase().trim();

    const existing = await this.sectionRepository.findOne({
      where: {
        class: normalizedClass,
        section: normalizedSection,
        session: dto.session || '2026-2027',
      },
    });

    if (existing) {
      throw new ConflictException(
        `Section "${normalizedSection}" already exists for Class ${normalizedClass}`,
      );
    }

    const validTeacher = dto.classTeacherId
      ? await this.staffRepository.findOne({ where: { id: dto.classTeacherId } })
      : null;

    const newSection = this.sectionRepository.create({
      ...dto,
      class: normalizedClass,
      section: normalizedSection,
      classTeacherId: validTeacher ? validTeacher.id : undefined,
      session: dto.session || '2026-2027',
      capacity: dto.capacity || 40,
    });

    const saved = await this.sectionRepository.save(newSection as ClassSectionEntity);

    // If a class teacher is assigned, update their staff record
    if (validTeacher) {
      validTeacher.class = normalizedClass;
      validTeacher.section = normalizedSection;
      await this.staffRepository.save(validTeacher);
    }

    return saved as ClassSectionEntity;
  }

  async updateSection(id: number, dto: UpdateClassSectionDto): Promise<ClassSectionEntity> {
    const section = await this.sectionRepository.findOne({ where: { id } });
    if (!section) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }

    if (dto.classTeacherId) {
      const teacher = await this.staffRepository.findOne({
        where: { id: dto.classTeacherId },
      });
      if (teacher) {
        teacher.class = section.class;
        teacher.section = section.section;
        await this.staffRepository.save(teacher);
        section.classTeacherId = teacher.id;
      } else {
        section.classTeacherId = null as any;
      }
    }

    Object.assign(section, {
      ...dto,
      classTeacherId: section.classTeacherId,
    });
    return this.sectionRepository.save(section);
  }

  async deleteSection(id: number): Promise<{ message: string }> {
    const section = await this.sectionRepository.findOne({ where: { id } });
    if (!section) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }

    // Unassign students from this section
    const students = await this.studentRepository.find({
      where: { class: section.class, section: section.section },
    });

    await Promise.all(
      students.map(async (student) => {
        student.section = null as any;
        student.rollNo = null as any;
        return this.studentRepository.save(student);
      }),
    );

    await this.sectionRepository.remove(section);
    return { message: `Section ${section.class}-${section.section} deleted successfully` };
  }

  async assignClassTeacher(sectionId: number, teacherId: number): Promise<ClassSectionEntity> {
    const section = await this.sectionRepository.findOne({ where: { id: sectionId } });
    if (!section) {
      throw new NotFoundException(`Section with ID ${sectionId} not found`);
    }

    const teacher = await this.staffRepository.findOne({ where: { id: teacherId } });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }

    section.classTeacherId = teacherId;
    const updated = await this.sectionRepository.save(section);

    teacher.class = section.class;
    teacher.section = section.section;
    await this.staffRepository.save(teacher);

    return updated;
  }

  async autoAssignClassTeachers(): Promise<{
    message: string;
    assignedCount: number;
    assignments: { section: string; teacher: string }[];
  }> {
    // 1. Fetch all sections
    const sections = await this.sectionRepository.find({
      order: { class: 'ASC', section: 'ASC' },
      relations: { classTeacher: true },
    });

    if (sections.length === 0) {
      return { message: 'No sections available to assign teachers', assignedCount: 0, assignments: [] };
    }

    // 2. Fetch all teachers
    const teachers = await this.staffRepository.find({
      where: [{ role: 'TEACHER' }, { role: 'Teacher' }],
      order: { id: 'ASC' },
    });

    if (teachers.length === 0) {
      return { message: 'No teachers found in database', assignedCount: 0, assignments: [] };
    }

    // Filter unassigned sections
    const unassignedSections = sections.filter((s) => !s.classTeacherId);
    // Filter teachers who are not yet assigned as class teacher
    const assignedTeacherIds = new Set(sections.map((s) => s.classTeacherId).filter(Boolean));
    const availableTeachers = teachers.filter((t) => !assignedTeacherIds.has(t.id));

    const assignments: { section: string; teacher: string }[] = [];
    const pool = availableTeachers.length > 0 ? availableTeachers : teachers;

    await Promise.all(
      unassignedSections.map(async (sec, idx) => {
        const teacher = pool[idx % pool.length];
        if (teacher) {
          sec.classTeacherId = teacher.id;
          await this.sectionRepository.save(sec);

          teacher.class = sec.class;
          teacher.section = sec.section;
          await this.staffRepository.save(teacher);

          assignments.push({
            section: `Class ${sec.class} - Sec ${sec.section}`,
            teacher: `${teacher.name} (${teacher.designation || teacher.subject || 'Teacher'})`,
          });
        }
      }),
    );

    return {
      message: `Successfully assigned ${assignments.length} class teachers automatically!`,
      assignedCount: assignments.length,
      assignments,
    };
  }

  async allocateStudentsWithTeacher(dto: {
    className: string;
    sectionName: string;
    teacherId?: number;
    studentIds: number[];
    roomNo?: string;
    capacity?: number;
  }): Promise<{
    message: string;
    section: ClassSectionEntity;
    allocatedCount: number;
  }> {
    const targetClass = dto.className.toUpperCase().trim();
    const targetSection = dto.sectionName.toUpperCase().trim();

    const existingSection = await this.sectionRepository.findOne({
      where: { class: targetClass, section: targetSection, session: '2026-2027' },
    });

    const validTeacher = dto.teacherId
      ? await this.staffRepository.findOne({ where: { id: dto.teacherId } })
      : null;

    const section = existingSection
      ? await (async () => {
          if (validTeacher) {
            existingSection.classTeacherId = validTeacher.id;
            return this.sectionRepository.save(existingSection);
          }
          return existingSection;
        })()
      : await (async () => {
          const created = this.sectionRepository.create({
            class: targetClass,
            section: targetSection,
            classTeacherId: validTeacher ? validTeacher.id : undefined,
            roomNo: dto.roomNo || 'Room 101',
            capacity: dto.capacity || 40,
            session: '2026-2027',
          });
          return this.sectionRepository.save(created as ClassSectionEntity);
        })();

    if (validTeacher) {
      validTeacher.class = targetClass;
      validTeacher.section = targetSection;
      await this.staffRepository.save(validTeacher);
    }

    if (dto.studentIds && dto.studentIds.length > 0) {
      const students = await this.studentRepository.find({
        where: { id: In(dto.studentIds) },
      });
      await Promise.all(
        students.map(async (student) => {
          student.class = targetClass;
          student.section = targetSection;
          return this.studentRepository.save(student);
        }),
      );
    }

    await this.autoGenerateRollNumbers(section.id);

    return {
      message: `Successfully allocated ${dto.studentIds?.length || 0} students to Class ${targetClass} - Section ${targetSection}`,
      section,
      allocatedCount: dto.studentIds?.length || 0,
    };
  }

  async getUnassignedStudents(className: string): Promise<StudentEntity[]> {
    const targetClass = className.toUpperCase().trim();
    return this.studentRepository
      .createQueryBuilder('student')
      .where('UPPER(student.class) = :cls', { cls: targetClass })
      .andWhere('(student.section IS NULL OR student.section = :empty)', { empty: '' })
      .orderBy('student.name', 'ASC')
      .getMany();
  }

  async getAllClassStudents(className: string): Promise<StudentEntity[]> {
    const targetClass = className.toUpperCase().trim();
    return this.studentRepository
      .createQueryBuilder('student')
      .where('UPPER(student.class) = :cls', { cls: targetClass })
      .orderBy('student.name', 'ASC')
      .getMany();
  }

  async assignStudentsToSection(
    sectionId: number,
    studentIds: number[],
  ): Promise<{ assignedCount: number; message: string }> {
    const section = await this.sectionRepository.findOne({ where: { id: sectionId } });
    if (!section) {
      throw new NotFoundException(`Section with ID ${sectionId} not found`);
    }

    if (!studentIds || studentIds.length === 0) {
      return { assignedCount: 0, message: 'No student IDs provided' };
    }

    const students = await this.studentRepository.find({
      where: { id: In(studentIds) },
    });

    await Promise.all(
      students.map(async (student: StudentEntity) => {
        student.class = section.class;
        student.section = section.section;
        return this.studentRepository.save(student);
      }),
    );

    // Auto generate roll numbers for the updated section automatically
    await this.autoGenerateRollNumbers(sectionId);

    return {
      assignedCount: students.length,
      message: `${students.length} students assigned to Class ${section.class} - Section ${section.section} with auto roll numbers`,
    };
  }

  async updateStudentSectionDirect(studentId: number, sectionName: string | null): Promise<StudentEntity> {
    const student = await this.studentRepository.findOne({ where: { id: studentId } });
    if (!student) {
      throw new NotFoundException(`Student ID ${studentId} not found`);
    }

    const cleanSection = sectionName && sectionName.trim() !== '' ? sectionName.trim().toUpperCase() : null;
    student.section = cleanSection as any;
    if (!cleanSection) {
      student.rollNo = null as any;
    }
    const saved = await this.studentRepository.save(student);

    // If section exists, ensure auto roll numbers
    if (cleanSection && student.class) {
      const section = await this.sectionRepository.findOne({
        where: { class: student.class, section: cleanSection },
      });
      if (section) {
        await this.autoGenerateRollNumbers(section.id);
      }
    }

    return saved;
  }

  async smartSplitClass(className: string, sectionNames: string[]): Promise<{
    message: string;
    sectionsSummary: { section: string; assignedCount: number }[];
  }> {
    const targetClass = className.toUpperCase().trim();
    if (!sectionNames || sectionNames.length === 0) {
      throw new ConflictException('At least one section name is required');
    }

    // 1. Ensure all sections exist in database
    const sections = await Promise.all(
      sectionNames.map(async (secName) => {
        const normalizedSec = secName.toUpperCase().trim();
        const existing = await this.sectionRepository.findOne({
          where: { class: targetClass, section: normalizedSec, session: '2026-2027' },
        });
        if (existing) return existing;
        const newSec = this.sectionRepository.create({
          class: targetClass,
          section: normalizedSec,
          session: '2026-2027',
          capacity: 40,
        });
        return this.sectionRepository.save(newSec);
      }),
    );

    // 2. Fetch all unassigned students in this class
    const unassignedStudents = await this.getUnassignedStudents(targetClass);
    if (unassignedStudents.length === 0) {
      return {
        message: `All students in Class ${targetClass} are already allocated to sections`,
        sectionsSummary: sections.map((s) => ({ section: s.section, assignedCount: 0 })),
      };
    }

    // 3. Sort students alphabetically before splitting
    const sorted = [...unassignedStudents].sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    // 4. Distribute evenly across the sections
    const chunkSize = Math.ceil(sorted.length / sections.length);
    const sectionsSummary: { section: string; assignedCount: number }[] = [];

    await Promise.all(
      sections.map(async (sec, idx) => {
        const slice = sorted.slice(idx * chunkSize, (idx + 1) * chunkSize);
        await Promise.all(
          slice.map(async (student) => {
            student.class = sec.class;
            student.section = sec.section;
            return this.studentRepository.save(student);
          }),
        );
        // Auto-generate roll numbers
        await this.autoGenerateRollNumbers(sec.id);
        sectionsSummary.push({ section: sec.section, assignedCount: slice.length });
      }),
    );

    return {
      message: `Successfully divided ${unassignedStudents.length} students of Class ${targetClass} across sections ${sectionNames.join(', ')}`,
      sectionsSummary,
    };
  }

  async removeStudentFromSection(studentId: number): Promise<{ message: string }> {
    const student = await this.studentRepository.findOne({ where: { id: studentId } });
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const previousSectionName = student.section;
    const previousClass = student.class;

    student.section = null as any;
    student.rollNo = null as any;
    await this.studentRepository.save(student);

    // Re-index remaining students in previous section if exists
    if (previousSectionName && previousClass) {
      const section = await this.sectionRepository.findOne({
        where: { class: previousClass, section: previousSectionName },
      });
      if (section) {
        await this.autoGenerateRollNumbers(section.id);
      }
    }

    return { message: 'Student removed from section' };
  }

  async autoGenerateRollNumbers(sectionId: number): Promise<{
    section: string;
    class: string;
    totalUpdated: number;
    students: { id: number; name: string; rollNo: string }[];
  }> {
    const section = await this.sectionRepository.findOne({ where: { id: sectionId } });
    if (!section) {
      throw new NotFoundException(`Section with ID ${sectionId} not found`);
    }

    // Fetch all students in this class and section
    const students = await this.studentRepository.find({
      where: { class: section.class, section: section.section },
    });

    // Sort strictly alphabetically by Student Name (case-insensitive)
    const sortedStudents = [...students].sort((a, b) => {
      const nameA = (a.name || `${a.firstName || ''} ${a.lastName || ''}`).trim().toLowerCase();
      const nameB = (b.name || `${b.firstName || ''} ${b.lastName || ''}`).trim().toLowerCase();
      return nameA.localeCompare(nameB);
    });

    // Assign roll numbers 1, 2, 3...
    const updatedStudents = await Promise.all(
      sortedStudents.map(async (student: StudentEntity, index: number) => {
        const assignedRoll = String(index + 1).padStart(2, '0');
        student.rollNo = assignedRoll;
        const saved = await this.studentRepository.save(student);
        return {
          id: saved.id,
          name: saved.name,
          rollNo: assignedRoll,
        };
      }),
    );

    return {
      class: section.class,
      section: section.section,
      totalUpdated: updatedStudents.length,
      students: updatedStudents,
    };
  }
}
