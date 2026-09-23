import { Homework, HomeworkSubmission, Student, Staff, sequelize } from '../../models/index.js';
import { Op } from 'sequelize';

const checkHomeworkAccess = async (user, payloadSubject, payloadClass, payloadSection) => {
  const role = user.role?.toUpperCase();
  
  // 1. Principal, Admin, Management and Super Admin have full access
  if (['ADMIN', 'SUPER_ADMIN', 'PRINCIPAL', 'MANAGEMENT'].includes(role)) return true;
  
  // 2. Teachers have restricted access
  if (role === 'TEACHER') {
    // Subject Teacher can only modify assignments for their specific academic domain
    if (user.subject && payloadSubject && user.subject.toUpperCase() === payloadSubject.toUpperCase()) return true;
    
    return false;
  }
  
  // 3. Others (Clerks/Accountants) are strictly blocked
  return false;
};

const getHomeworkList = async (req, res) => {
  try {
    const { role, id } = req.user;
    const { className, section, teacherId, status, priority } = req.query;

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (className) where.class = className;
    if (section) where.section = section;

    // RBAC: Teachers only see their own OR their assigned class if they are a class teacher
    if (role === 'TEACHER') {
      const teacher = await Staff.findByPk(id);
      where[Op.or] = [
        { teacherId: id },
        { class: teacher.class, section: teacher.section }
      ];
    } else if (role === 'SUPER_ADMIN' && teacherId) {
      where.teacherId = teacherId;
    }

    const data = await Homework.findAll({
      where,
      order: [['id', 'DESC']],
      include: [
        { model: Staff, as: 'teacher', attributes: ['name', 'image'] },
        { model: HomeworkSubmission, as: 'submissions', attributes: ['id', 'status'] }
      ]
    });

    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const createHomework = async (req, res) => {
  try {
    const { role, id, name } = req.user;
    const { subject, class: className, section } = req.body;

    const hasAccess = await checkHomeworkAccess(req.user, subject, className, section);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Unauthorized assignment creation for this subject/class' });
    }

    const payload = { ...req.body };

    // If teacher is creating, enforce ownership
    if (role === 'TEACHER') {
      payload.teacherId = id;
      payload.teacherName = name;
    }

    const homework = await Homework.create(payload);
    res.json(homework);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const getHomeworkStats = async (req, res) => {
  try {
    const { id } = req.params;
    const homework = await Homework.findByPk(id);
    if (!homework) return res.status(404).json({ error: 'Homework not found' });

    // 1. Get all students of that class/section
    const students = await Student.findAll({
      where: { class: homework.class, section: homework.section },
      attributes: ['id', 'name', 'rollNo', 'image']
    });

    // 2. Get submissions
    const submissions = await HomeworkSubmission.findAll({ where: { homeworkId: id } });

    // 3. Merge
    const stats = students.map(student => {
      const submission = submissions.find(s => String(s.studentId) === String(student.id));
      return {
        ...student.get({ plain: true }),
        completionStatus: submission?.status || 'PENDING',
        submittedAt: submission?.submittedAt || null,
        feedback: submission?.feedback || null,
        grade: submission?.grade || null
      };
    });

    res.json(stats);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const getGlobalAnalytics = async (req, res) => {
  try {
    const [total, overdue, priority] = await Promise.all([
      Homework.count({ where: { status: 'ACTIVE' } }),
      Homework.count({ 
        where: { 
          status: 'ACTIVE',
          dueDate: { [Op.lt]: new Date().toISOString().split('T')[0] } 
        } 
      }),
      Homework.count({ where: { isUrgent: true, status: 'ACTIVE' } })
    ]);

    // Average completion rate logic (simplified)
    const submissions = await HomeworkSubmission.count({ where: { status: 'COMPLETED' } });
    const totalPossible = await Homework.count() * 30; // Assuming 30 students avg

    res.json({
      totalActive: total,
      overdueTasks: overdue,
      priorityFlagged: priority,
      globalCompletion: Math.min(100, totalPossible > 0 ? Math.round((submissions / totalPossible) * 100) : 0)
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const updateHomework = async (req, res) => {
  try {
    const { id } = req.params;
    const homework = await Homework.findByPk(id);
    if (!homework) return res.status(404).json({ error: 'Not found' });

    const hasAccess = await checkHomeworkAccess(req.user, req.body.subject || homework.subject, req.body.class || homework.class, req.body.section || homework.section);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Unauthorized assignment modification' });
    }
    
    await homework.update(req.body);
    res.json(homework);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const deleteHomework = async (req, res) => {
  try {
    const { id } = req.params;
    const homework = await Homework.findByPk(id);
    if (!homework) return res.status(404).json({ error: 'Not found' });

    const hasAccess = await checkHomeworkAccess(req.user, homework.subject, homework.class, homework.section);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Unauthorized assignment retraction' });
    }

    await homework.destroy();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const updateStudentSubmissionStatus = async (req, res) => {
  try {
    const { studentId, homeworkId, status, feedback, grade } = req.body;
    if (!studentId || !homeworkId || !status) {
      return res.status(400).json({ error: 'Missing studentId, homeworkId, or status in request body.' });
    }

    const homework = await Homework.findByPk(homeworkId);
    if (!homework) {
      return res.status(404).json({ error: 'Homework not found' });
    }

    // Verify access
    const hasAccess = await checkHomeworkAccess(req.user, homework.subject, homework.class, homework.section);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Unauthorized: Only the assigned subject teacher or administrator can update submission status.' });
    }

    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const [record, created] = await HomeworkSubmission.findOrCreate({
      where: { studentId, homeworkId },
      defaults: { 
        status, 
        studentName: student.name, 
        submittedAt: status === 'COMPLETED' ? new Date().toISOString() : null,
        feedback: feedback || null,
        grade: grade || null
      }
    });

    if (!created) {
      const updateData = { status };
      if (status === 'COMPLETED') {
        updateData.submittedAt = new Date().toISOString();
      } else {
        updateData.submittedAt = null;
      }
      if (feedback !== undefined) updateData.feedback = feedback;
      if (grade !== undefined) updateData.grade = grade;
      await record.update(updateData);
    }

    res.json({ success: true, submission: record });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export default { 
  getHomeworkList,
  createHomework,
  getHomeworkStats,
  getGlobalAnalytics,
  updateHomework,
  deleteHomework,
  updateStudentSubmissionStatus
 };
