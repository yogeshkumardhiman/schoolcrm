import { Student, Attendance, Homework, HomeworkSubmission, StaffTimetable, Staff, SubstitutionAssignment, Grievance, FeeDue, FeePayment, Result, SchoolInfo, sequelize } from '../../models/index.js';
import { Op } from 'sequelize';


const normalizeClassName = (cls) => {
  if (!cls) return '';
  let normalized = cls.trim().toUpperCase();
  const numOnly = normalized.replace(/(ST|ND|RD|TH)$/i, '');
  if (/^\d+$/.test(numOnly)) {
    const num = parseInt(numOnly);
    if (num === 1) return '1ST';
    if (num === 2) return '2ND';
    if (num === 3) return '3RD';
    return `${num}TH`;
  }
  const romanMap = { 'I': '1ST', 'II': '2ND', 'III': '3RD', 'IV': '4TH', 'V': '5TH', 'VI': '6TH', 'VII': '7TH', 'VIII': '8TH', 'IX': '9TH', 'X': '10TH', 'XI': '11TH', 'XII': '12TH' };
  if (romanMap[normalized]) return romanMap[normalized];
  return normalized;
};

const getStudents = async (req, res) => {
  try {
    const schoolInfo = await SchoolInfo.findOne();
    const maxClass = schoolInfo?.maxClass || '12TH';
    const classesList = ['NURSERY', 'LKG', 'UKG', '1ST', '2ND', '3RD', '4TH', '5TH', '6TH', '7TH', '8TH', '9TH', '10TH', '11TH', '12TH'];
    const maxIdx = classesList.indexOf(maxClass);
    const activeClasses = maxIdx !== -1 ? classesList.slice(0, maxIdx + 1) : classesList;

    const data = await Student.findAll({
      where: {
        class: { [Op.in]: activeClasses }
      },
      order: [['name', 'ASC']]
    });
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const getStudentById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const getStudentAttendance = async (req, res) => {
  try {
    const queryId = req.params.id;
    console.log(`[ATTENDANCE] Fetching for queryId: ${queryId}`);
    
    // Attempt to resolve the real studentId if queryId might be an admissionNo
    let actualStudentId = queryId;
    const student = await Student.findOne({ 
      where: { 
        [Op.or]: [
           // Use try-catch or safe cast if queryId isn't an integer, but admissionNo is a string
           isNaN(queryId) ? { admissionNo: queryId } : { id: queryId },
           { admissionNo: String(queryId) }
        ]
      }
    });

    if (student) {
        actualStudentId = student.id;
    }

    const data = await Attendance.findAll({ where: { studentId: actualStudentId } });
    console.log(`[ATTENDANCE] Found ${data.length} records for studentId ${actualStudentId}`);
    res.json(data);
  } catch (e) { 
    console.error(`[ATTENDANCE ERROR]`, e);
    res.status(500).json({ error: e.message }); 
  }
};

const getClassTimetable = async (req, res) => {
  try {
    const { class: cls, section: sec } = req.params;
    const today = new Date().toISOString().split('T')[0];
    const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

    // 1. Get weekly timetable for this class
    const timetable = await StaffTimetable.findAll({
      where: { class: cls, section: sec },
      include: [{ model: Staff, as: 'staff', attributes: ['name', 'id'] }],
      order: [['period', 'ASC']]
    });

    // 2. Get today's substitutions for this class
    const substitutions = await SubstitutionAssignment.findAll({
      where: { class: cls, section: sec, date: today },
      include: [{ model: Staff, as: 'substituteTeacher', attributes: ['name', 'id'] }]
    });

    const dayMapping = {
      'MONDAY': 'MON',
      'TUESDAY': 'TUE',
      'WEDNESDAY': 'WED',
      'THURSDAY': 'THU',
      'FRIDAY': 'FRI',
      'SATURDAY': 'SAT'
    };

    // Return as flat array compatible with client filter (deduplicated by day and period)
    const seen = new Set();
    const result = [];
    timetable.forEach(t => {
      const cleanDay = (t.day || '').trim().toUpperCase();
      const key = `${cleanDay}-${t.period}`;
      if (seen.has(key)) return;
      seen.add(key);

      const sub = (cleanDay === dayName) ? substitutions.find(s => s.period === t.period) : null;
      result.push({
        id: t.id,
        day: dayMapping[cleanDay] || cleanDay,
        period: t.period,
        subject: t.subject,
        class: t.class,
        section: t.section,
        originalTeacher: t.staff?.name,
        currentTeacher: sub ? sub.substituteTeacher?.name : t.staff?.name,
        teacherName: sub ? sub.substituteTeacher?.name : t.staff?.name,
        isSubstituted: !!sub
      });
    });

    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const getHomeworkByClass = async (req, res) => {
  try {
    const { class: cls, section: sec } = req.params;
    const data = await Homework.findAll({
      where: { class: cls, section: sec },
      order: [['id', 'DESC']],
      include: [{ model: Staff, as: 'teacher', attributes: ['name', 'image'] }]
    });
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const getStudentByAdmission = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { admissionNo: req.params.admissionNo } });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const getGrievances = async (req, res) => {
  try {
    const data = await Grievance.findAll({
      where: { studentId: req.params.studentId },
      order: [['id', 'DESC']]
    });
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const getDashboardData = async (req, res) => {
  try {
    const { admissionNo } = req.params;
    const student = await Student.findOne({ where: { admissionNo } });
    if (!student) return res.status(404).json({ error: 'Scholar not found in registry.' });

    const id = student.id;
    // Direct logic to avoid import/export issues
    const [feeInfo, feePayments, results, homework, attendance, classTeacher, totalWorkingDays] = await Promise.all([
      FeeDue.findAll({ where: { studentId: id } }),
      FeePayment.findAll({ where: { studentId: id }, order: [['paymentDate', 'DESC']] }),
      Result.findAll({ where: { studentId: id, isVerified: true } }),
      Homework.findAll({
        where: { class: student.class, [Op.or]: [{ section: student.section }, { section: 'ALL' }] },
        order: [['date', 'DESC']],
        limit: 10
      }),
      Attendance.findAll({ where: { studentId: id }, order: [['date', 'DESC']] }),
      Staff.findOne({
        where: {
          role: 'TEACHER',
          [Op.and]: [
            sequelize.where(sequelize.fn('UPPER', sequelize.col('class')), normalizeClassName(student.class))
          ]
        },
        attributes: ['id', 'name', 'section']
      }),
      Attendance.count({
        col: 'date',
        distinct: true,
        where: { 
          class: { [Op.iLike]: student.class }, 
          section: student.section ? 
            { [Op.or]: [ { [Op.iLike]: student.section }, { [Op.eq]: '' }, { [Op.is]: null } ] } : 
            { [Op.or]: [ { [Op.eq]: '' }, { [Op.is]: null } ] }
        }
      })
    ]);

    // Manual Section Matching for higher reliability with Fuzzy Support
    let resolvedTeacher = classTeacher;
    if (classTeacher && student.section) {
      const studentSec = (student.section || '').trim().toLowerCase();
      const teacherSec = (classTeacher.section || '').trim().toLowerCase();
      if (teacherSec && teacherSec !== studentSec) {
        resolvedTeacher = await Staff.findOne({
          where: {
            role: 'TEACHER',
            [Op.and]: [
              sequelize.where(sequelize.fn('UPPER', sequelize.col('class')), normalizeClassName(student.class)),
              sequelize.where(sequelize.fn('UPPER', sequelize.col('section')), (student.section || '').trim().toUpperCase())
            ]
          },
          attributes: ['name']
        }) || classTeacher;
      }
    }

    console.log(`\n-----------------------------------------`);
    console.log(`📡 [DASHBOARD SYNC] Scholar: ${student.name}`);
    console.log(`📍 Target Class: "${student.class}", Section: "${student.section}"`);
    console.log(`👨‍🏫 Resolved Teacher: ${resolvedTeacher ? resolvedTeacher.name : '!!! NOT FOUND !!!'}`);
    console.log(`-----------------------------------------\n`);

    const studentJson = student.toJSON();
    studentJson.classTeacher = resolvedTeacher ? resolvedTeacher.name : 'Not Assigned';

    // Calculate aggregated financial summary from feeInfo (monthly dues list)
    const totalAmount = feeInfo.reduce((acc, due) => acc + parseFloat(due.totalAmount || 0), 0);
    const paidAmount = feeInfo.reduce((acc, due) => acc + parseFloat(due.paidAmount || 0), 0);
    const dueAmount = totalAmount - paidAmount;

    const summary = {
      totalAmount,
      paidAmount,
      dueAmount
    };

    res.json({
      student: studentJson,
      finance: { summary, history: feePayments, dues: feeInfo },
      academic: results,
      homework,
      attendance,
      totalWorkingDays
    });
  } catch (e) {
    console.error("💥 Dashboard Error:", e);
    res.status(500).json({ error: e.message });
  }
};

const createGrievance = async (req, res) => {
  try {
    const data = await Grievance.create({
      ...req.body,
      date: new Date().toISOString()
    });

    try {
      const { Notice, Student } = await import('../../models/index.js');
      const student = await Student.findByPk(req.body.studentId);
      const studentName = student ? student.name : 'A student';
      await Notice.create({
        title: `Student Query: ${studentName}`,
        content: req.body.description || 'A new query/grievance has been raised.',
        tag: 'GRIEVANCE',
        color: '#3B82F6',
        targetRole: 'PRINCIPAL',
        createdByRole: 'STUDENT',
        createdById: req.body.studentId,
        date: new Date().toLocaleDateString('en-GB')
      });
    } catch (err) {
      console.error("Failed to create grievance notice:", err.message);
    }

    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const getClassTeacher = async (req, res) => {
  try {
    const { class: cls, section } = req.params;
    console.log(`\n🔍 [FACULTY DISCOVERY] Attempting lookup for Class: [${cls}], Section: [${section}]`);

    const searchClass = normalizeClassName(cls);
    const searchSection = (section || '').trim().toUpperCase();

    const teacher = await Staff.findOne({
      where: {
        role: 'TEACHER',
        [Op.and]: [
          sequelize.where(
            sequelize.fn('UPPER', sequelize.col('class')),
            searchClass
          ),
          sequelize.where(
            sequelize.fn('UPPER', sequelize.col('section')),
            searchSection
          )
        ]
      },
      attributes: ['name', 'id', 'role', 'class', 'section']
    });

    if (teacher) {
      console.log(`✅ [FACULTY DISCOVERY] Found: ${teacher.name} (Role: ${teacher.role}) for ${teacher.class}-${teacher.section}`);
    } else {
      console.warn(`⚠️ [FACULTY DISCOVERY] No matching teacher found for [${cls}]-[${section}]`);

      // DIAGNOSTIC: Log MORE teachers with class/section to see what's in DB
      const allTeachers = await Staff.findAll({
        attributes: ['name', 'class', 'section', 'role'],
        limit: 10
      });
      console.log("📋 [DIAGNOSTIC] Current Staff Registry Samples (Total Found: " + allTeachers.length + "):");
      allTeachers.forEach(t => {
        console.log(`   - Name: [${t.name}] | Class: [${t.class}] | Section: [${t.section}] | Role: [${t.role}]`);
      });
      return res.json({
        name: 'Not Assigned',
        debug: allTeachers.map(t => ({ n: t.name, c: t.class, s: t.section, r: t.role }))
      });
    }

    res.json({ name: teacher ? teacher.name : 'Not Assigned' });
  } catch (e) {
    console.error("💥 [FACULTY DISCOVERY] Critical Failure:", e.message);
    res.status(500).json({ error: e.message });
  }
};

const getHomeworkByClassQuery = async (req, res) => {
  try {
    const { class: cls, section: sec } = req.query;
    if (!cls) return res.status(400).json({ error: 'Class query parameter is required' });
    const data = await Homework.findAll({
      where: { class: cls, section: sec || 'A' },
      order: [['id', 'DESC']],
      include: [{ model: Staff, as: 'teacher', attributes: ['name', 'image'] }]
    });
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const getHomeworkStatus = async (req, res) => {
  try {
    const { studentId } = req.query;
    if (!studentId) return res.status(400).json({ error: 'Student ID required' });
    const statuses = await HomeworkSubmission.findAll({ where: { studentId } });
    res.json(statuses);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const updateHomeworkStatus = async (req, res) => {
  try {
    const { studentId, homeworkId, status } = req.body;
    if (!studentId || !homeworkId) return res.status(400).json({ error: 'Missing credentials' });

    const student = await Student.findByPk(studentId);
    const studentName = student ? student.name : '';

    const [record, created] = await HomeworkSubmission.findOrCreate({
      where: { studentId, homeworkId },
      defaults: { status, studentName, submittedAt: status === 'COMPLETED' ? new Date().toISOString() : null }
    });

    if (!created) {
      await record.update({ status, submittedAt: status === 'COMPLETED' ? new Date().toISOString() : null });
    }

    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

export default {
  getStudents,
  getStudentById,
  getStudentByAdmission,
  getAttendance: getStudentAttendance, // Alias for line 19
  getStudentAttendance,               // Direct for line 13
  getClassTimetable,
  getHomeworkByClass,
  getHomeworkByClassQuery,
  getHomeworkStatus,
  updateHomeworkStatus,
  getDashboardData,
  getGrievances,
  createGrievance,
  getClassTeacher
};
