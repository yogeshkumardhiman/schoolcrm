import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GrievanceEntity, GrievanceStatus } from './entities/grievance.entity';
import { CreateGrievanceDto } from './dto/create-grievance.dto';
import { ReplyGrievanceDto } from './dto/reply-grievance.dto';
import { StudentEntity } from '../students/entities/student.entity';
import { ClassSectionEntity } from '../classes/entities/class-section.entity';

@Injectable()
export class GrievancesService {
  constructor(
    @InjectRepository(GrievanceEntity)
    private readonly grievanceRepository: Repository<GrievanceEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>,
    @InjectRepository(ClassSectionEntity)
    private readonly sectionRepository: Repository<ClassSectionEntity>,
  ) {}

  async create(dto: CreateGrievanceDto): Promise<GrievanceEntity> {
    const grievance = this.grievanceRepository.create({
      ...dto,
      status: GrievanceStatus.PENDING,
    });
    return this.grievanceRepository.save(grievance);
  }

  async findAll(className?: string, section?: string, status?: string): Promise<any[]> {
    const query = this.grievanceRepository.createQueryBuilder('g');

    if (className && className !== 'ALL') {
      query.andWhere('g.class = :className', { className });
    }
    if (section && section !== 'ALL') {
      query.andWhere('g.section = :section', { section });
    }
    if (status && status !== 'ALL') {
      query.andWhere('g.status = :status', { status });
    }

    query.orderBy('g.createdAt', 'DESC');
    const list = await query.getMany();

    const sections = await this.sectionRepository.find({ relations: { classTeacher: true } });
    const teacherMap = new Map<string, string>();
    sections.forEach((sec) => {
      if (sec.class && sec.classTeacher) {
        teacherMap.set(`${sec.class.toUpperCase()}-${(sec.section || 'A').toUpperCase()}`, sec.classTeacher.name);
      }
    });

    return list.map((g) => ({
      ...g,
      classTeacher: teacherMap.get(`${(g.class || '').toUpperCase()}-${(g.section || 'A').toUpperCase()}`) || 'Unassigned',
    }));
  }

  async findByStudent(studentId: number): Promise<GrievanceEntity[]> {
    return this.grievanceRepository.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByClass(className: string, section?: string): Promise<GrievanceEntity[]> {
    const where: any = { class: className };
    if (section) {
      where.section = section;
    }
    return this.grievanceRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async reply(id: number, dto: ReplyGrievanceDto): Promise<GrievanceEntity> {
    const grievance = await this.grievanceRepository.findOne({ where: { id } });
    if (!grievance) {
      throw new NotFoundException(`Grievance with ID ${id} not found`);
    }

    grievance.teacherReply = dto.teacherReply;
    grievance.responderName = dto.responderName || 'Class Teacher';
    grievance.status = dto.status || GrievanceStatus.RESOLVED;
    grievance.resolvedAt = new Date();

    return this.grievanceRepository.save(grievance);
  }

  async delete(id: number): Promise<{ message: string }> {
    const grievance = await this.grievanceRepository.findOne({ where: { id } });
    if (!grievance) {
      throw new NotFoundException(`Grievance with ID ${id} not found`);
    }
    await this.grievanceRepository.remove(grievance);
    return { message: 'Grievance deleted successfully' };
  }
}
