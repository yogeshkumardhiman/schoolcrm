import { Result, Student, StaffTimetable } from '../../models/index.js';
import { Op } from 'sequelize';

const getResultsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const role = req.user?.role?.toUpperCase?.() || '';
    const canViewUnverified = ['ADMIN', 'SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'MANAGEMENT', 'TEACHER'].includes(role);
    const results = await Result.findAll({ 
      where: { studentId, ...(canViewUnverified ? {} : { isVerified: true }) },
      order: [['createdAt', 'DESC']]
    });
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const getResultsByClass = async (req, res) => {
  try {
    const { className, section } = req.params;
    
    // 1. Fetch all students in the class/section
    const students = await Student.findAll({
      where: { class: className, section },
      attributes: ['id', 'name', 'admissionNo', 'rollNo', 'image', 'fatherName', 'class', 'section', 'session']
    });

    if (!students.length) return res.json([]);

    const studentIds = students.map(s => s.id);

    // 2. Fetch all results for these students
    const results = await Result.findAll({
      where: { studentId: studentIds },
      order: [['subject', 'ASC']]
    });

    // 3. Aggregate
    const bulkData = students.map(student => {
      return {
        student,
        results: results.filter(r => String(r.studentId) === String(student.id))
      };
    });

    res.json(bulkData);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const checkTeacherAccess = async (user, studentId, subject) => {
  const role = user.role?.toUpperCase();
  
  // 1. Principal, Admin, Management and Super Admin have full institutional access
  if (['ADMIN', 'SUPER_ADMIN', 'PRINCIPAL', 'MANAGEMENT'].includes(role)) return true;
  
  // 2. Teachers have restricted access
  if (role === 'TEACHER') {
    const student = await Student.findByPk(studentId);
    if (!student) throw new Error('Scholar record not found');
    
    // A. Class Teacher has full modification rights for their assigned class section
    if (user.class === student.class && user.section === student.section) return true;
    
    // B. Subject Teacher can only modify marks for their specific academic domain in that class/section
    if (subject) {
      // First, check timetable assignment for this teacher in this class-section for this subject
      const assignment = await StaffTimetable.findOne({
        where: {
          staffId: user.id,
          class: student.class,
          section: student.section,
          subject: { [Op.iLike]: subject.trim() }
        }
      });
      if (assignment) return true;

      // Fallback: Check if it is the teacher's main designated subject
      if (user.subject && user.subject.toUpperCase() === subject.toUpperCase()) return true;
    }
    
    console.warn(`[Security] Unauthorized Mark Modification Attempt: Teacher ${user.name} (ID: ${user.id}) tried to modify ${subject} for student ${studentId}`);
    return false;
  }
  
  // 3. Clerks (Accountant) and others are strictly blocked from result governance
  console.warn(`[Security] Unauthorized Role Access: ${user.name} (${role}) tried to modify results.`);
  return false;
};

const addResult = async (req, res) => {
  try {
    const hasAccess = await checkTeacherAccess(req.user, req.body.studentId, req.body.subject);
    if (!hasAccess) return res.status(403).json({ error: 'Unauthorized subject modification' });

    const role = req.user?.role?.toUpperCase?.() || '';
    const payload = { ...req.body };
    if (role === 'TEACHER') {
      // Teachers submit in draft/pending state; class teacher/admin can verify later.
      payload.isVerified = false;
    }
    const result = await Result.create(payload);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const updateResult = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Result.findByPk(id);
    if (!result) return res.status(404).json({ error: 'Result node not found' });

    const hasAccess = await checkTeacherAccess(req.user, result.studentId, req.body.subject || result.subject);
    if (!hasAccess) return res.status(403).json({ error: 'Unauthorized subject modification' });

    const role = req.user?.role?.toUpperCase?.() || '';
    const payload = { ...req.body };
    if (role === 'TEACHER') {
      payload.isVerified = false;
    }
    await result.update(payload);
    return res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const deleteResult = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Result.findByPk(id);
    if (!result) return res.status(404).json({ error: 'Result node not found' });

    const hasAccess = await checkTeacherAccess(req.user, result.studentId, result.subject);
    if (!hasAccess) return res.status(403).json({ error: 'Unauthorized subject modification' });

    await result.destroy();
    return res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const verifyResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;
    const result = await Result.findByPk(id);
    if (!result) return res.status(404).json({ error: 'Result node not found' });

    const role = req.user.role?.toUpperCase();
    let hasVerificationAccess = ['ADMIN', 'SUPER_ADMIN', 'PRINCIPAL', 'MANAGEMENT'].includes(role);
    
    if (!hasVerificationAccess && role === 'TEACHER') {
      const student = await Student.findByPk(result.studentId);
      if (student && req.user.class === student.class && req.user.section === student.section) {
        hasVerificationAccess = true;
      }
    }

    if (!hasVerificationAccess) {
      return res.status(403).json({ error: 'Only Class Teachers or Administrators can verify student results.' });
    }

    await result.update({ isVerified: isVerified !== undefined ? isVerified : true });
    return res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const addBulkResults = async (req, res) => {
  try {
    const { results } = req.body;
    if (!results || !Array.isArray(results)) {
      return res.status(400).json({ error: 'Invalid payload. Results array required.' });
    }

    const createdResults = [];
    const role = req.user?.role?.toUpperCase?.() || '';

    for (const item of results) {
      const hasAccess = await checkTeacherAccess(req.user, item.studentId, item.subject);
      if (!hasAccess) {
        return res.status(403).json({ error: `Unauthorized subject modification for student ID ${item.studentId} and subject ${item.subject}` });
      }

      const payload = { 
        studentId: item.studentId,
        subject: item.subject,
        marks: item.score !== undefined ? item.score : (item.marks !== undefined ? item.marks : 0),
        total: item.outOf || 100,
        examType: item.examType,
        class: item.class,
        section: item.section,
        session: item.session || req.user?.session || '2025-26'
      };
      
      // Teachers submit in draft/pending state unless they are the class teacher.
      let hasVerificationAccess = ['ADMIN', 'SUPER_ADMIN', 'PRINCIPAL', 'MANAGEMENT'].includes(role);
      if (!hasVerificationAccess && role === 'TEACHER') {
        const student = await Student.findByPk(item.studentId);
        if (student && req.user.class === student.class && req.user.section === student.section) {
          hasVerificationAccess = true;
        }
      }
      
      payload.isVerified = hasVerificationAccess;

      // Find if result already exists for this student, examType, and subject
      const existing = await Result.findOne({
        where: {
          studentId: item.studentId,
          examType: item.examType,
          subject: { [Op.iLike]: item.subject.trim() }
        }
      });

      if (existing) {
        await existing.update(payload);
        createdResults.push(existing);
      } else {
        const created = await Result.create(payload);
        createdResults.push(created);
      }
    }

    res.json(createdResults);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export default { 
  getResultsByStudent,
  getResultsByClass,
  addResult,
  updateResult,
  deleteResult,
  verifyResult,
  addBulkResults
 };
