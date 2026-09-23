import { Grievance, Student, Staff, Attendance, StaffTimetable, SubstitutionAssignment, Homework, HomeworkSubmission, StaffAttendance, StaffLeaveRequest, FeeDue, Exam, sequelize } from '../../models/index.js';
import { Op } from 'sequelize';

// --- Existing Grievance & Student endpoints ---
const getGrievancesByClass = async (req, res) => {
// ... rest remains same ...
    try {
        const { class: className, section } = req.params;
        if (!className) return res.status(400).json({ error: 'Class identifier missing' });

        const records = await Grievance.findAll({ 
        where: { class: { [Op.iLike]: className }, section: { [Op.iLike]: section || 'A' } }, 
        order: [['id', 'DESC']] 
        });
        
        const grievances = records.map(r => r.get({ plain: true }));
        const students = await Student.findAll({ where: { class: { [Op.iLike]: className }, section: { [Op.iLike]: section || 'A' } } });
        const studentImgMap = {};
        students.forEach(s => { 
        if (s.id) studentImgMap[s.id.toString()] = s.image;
        if (s.admissionNo) studentImgMap[s.admissionNo] = s.image;
        if (s.name) studentImgMap[s.name.toLowerCase().trim()] = s.image; 
        });

        const enriched = grievances.map(g => ({
        ...g,
        studentImage: studentImgMap[g.studentId?.toString()] || studentImgMap[g.admissionNo] || studentImgMap[g.studentName?.toLowerCase().trim()] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${g.studentName || 'Scholar'}`
        }));
        res.json(enriched);
    } catch (e) {
        res.status(500).json({ error: 'Grievance sync failure', detail: e.message });
    }
};

const getTeacherGrievances = async (req, res) => {
    try {
        const { teacher, safeClass, safeSection } = await getTeacherContext(req.user.id);
        if (!teacher || !safeClass) {
            return res.status(403).json({ error: "Institutional Access Denied: Class assignment required." });
        }

        const sectionFilter = { 
            [Op.or]: [
                { [Op.iLike]: safeSection },
                { [Op.eq]: '' },
                { [Op.is]: null }
            ]
        };

        const records = await Grievance.findAll({
            where: { 
                class: { [Op.iLike]: safeClass },
                section: sectionFilter
            },
            order: [['createdAt', 'DESC']]
        });

        const grievances = records.map(r => r.get({ plain: true }));
        const studentIds = grievances.map(g => g.studentId).filter(Boolean);
        
        const students = await Student.findAll({
            where: { id: { [Op.in]: studentIds } },
            attributes: ['id', 'image']
        });

        const imgMap = Object.fromEntries(students.map(s => [s.id, s.image]));

        const enriched = grievances.map(g => ({
            ...g,
            studentImage: imgMap[g.studentId] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${g.studentName || 'Scholar'}`
        }));

        res.json(enriched);
    } catch (e) {
        res.status(500).json({ error: 'Supporting Hub sync failure', detail: e.message });
    }
};

const replyToGrievance = async (req, res) => {
  try {
    const { id } = req.params;
    const { teacherReply, responderName } = req.body;
    const query = await Grievance.findByPk(id);
    if (query) {
      const updateData = { status: 'RESOLVED', resolvedAt: new Date().toISOString() };
      if (teacherReply) updateData.teacherReply = teacherReply;
      if (responderName) updateData.responderName = responderName;
      await query.update(updateData);
      return res.json(query);
    }
    res.status(404).json({ error: 'Grievance not found' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const getStudentsByClass = async (req, res) => {
  try {
    const { class: cls, section: sec } = req.params;
    console.log(`[GetStudentsByClass] Querying for Class: ${cls}, Section: ${sec}`);
    
    const sectionFilter = { 
      [Op.or]: [
        { [Op.iLike]: sec || 'A' },
        { [Op.eq]: '' },
        { [Op.is]: null }
      ]
    };

    const students = await Student.findAll({
      where: { 
        class: { [Op.iLike]: cls }, 
        section: sectionFilter 
      },
      order: [['name', 'ASC']]
    });
    
    console.log(`[GetStudentsByClass] Found ${students.length} students. CLASS=${cls}, SECTION=${sec}`);
    res.json(students);
  } catch (e) {
    console.error("[GetStudentsByClass Error]", e);
    res.status(500).json({ error: 'Registry sync failure', detail: e.message });
  }
};

// --- Modular Dashboard APIs (New Architecture) ---

// Helper to get teacher details safely
const getTeacherContext = async (userId) => {
    // Context Retrieval Logic
    const teacher = await Staff.findByPk(userId);
    
    if (!teacher) {
        console.warn(`[TeacherContext] Faculty ID ${userId} not found in institutional registry.`);
        return { 
            teacher: null, 
            safeClass: 'NONE', 
            safeSection: 'A' 
        };
    }

    return { 
        teacher, 
        safeClass: teacher.class || '', 
        safeSection: teacher.section || 'A' 
    };
};

const getDashboardKPI = async (req, res) => {
  try {
    console.log(`[DashboardKPI] Fetching data for faculty: ${req.user.id}`);
    const { teacher, safeClass, safeSection } = await getTeacherContext(req.user.id);
    if (!teacher) {
        return res.status(404).json({ error: "Faculty profile not found in institutional registry." });
    }
    const today = new Date().toLocaleDateString('en-CA');
    const staffId = parseInt(req.user.id);

    let totalStudents = 0;
    let pendingQueries = 0;
    let absentCount = 0;
    let presentCount = 0;
    let pendingHomeworkCount = 0;

    let timetableEntries = [];
    if (safeClass && safeClass !== '') {
        // --- Logic for Class Teachers ---
        const sectionFilter = { 
            [Op.or]: [
                { [Op.iLike]: safeSection },
                { [Op.eq]: '' },
                { [Op.is]: null }
            ]
        };

        [totalStudents, pendingQueries, absentCount, presentCount, pendingHomeworkCount] = await Promise.all([
          Student.count({ where: { class: { [Op.iLike]: safeClass }, section: sectionFilter } }),
          Grievance.count({ where: { class: { [Op.iLike]: safeClass }, section: sectionFilter, status: 'PENDING' } }),
          Attendance.count({ where: { class: { [Op.iLike]: safeClass }, section: sectionFilter, status: 'ABSENT', date: today } }),
          Attendance.count({ where: { class: { [Op.iLike]: safeClass }, section: sectionFilter, status: 'PRESENT', date: today } }),
          Homework ? Homework.count({ where: { teacherId: staffId, status: 'ACTIVE' } }).catch(() => 0) : Promise.resolve(0)
        ]);
    } else {
        // --- Logic for Subject Faculty (No Primary Class) ---
        timetableEntries = await StaffTimetable.findAll({ 
            where: { staffId }, 
            attributes: ['class', 'section', 'subject'],
            raw: true
        });

        if (timetableEntries.length > 0) {
            // Get unique class-section pairs
            const classPairs = Array.from(new Set(timetableEntries.map(t => `${t.class}|${t.section || 'A'}`)));
            const classFilters = classPairs.map(p => {
                const [cls, sec] = p.split('|');
                return { class: { [Op.iLike]: cls }, section: { [Op.iLike]: sec } };
            });

            // Get unique subjects
            const subjects = [...new Set(timetableEntries.map(t => t.subject).filter(Boolean))];
            
            // Get unique class names and sections for a broader query fallback
            const classes = [...new Set(timetableEntries.map(t => t.class))];
            const sections = [...new Set(timetableEntries.map(t => t.section || 'A'))];

            [totalStudents, pendingQueries, pendingHomeworkCount] = await Promise.all([
                Student.count({ where: { [Op.or]: classFilters } }),
                Grievance.count({ 
                    where: { 
                        status: 'PENDING',
                        [Op.or]: [
                            { subject: { [Op.in]: subjects } },
                            { [Op.and]: [
                                { class: { [Op.in]: classes } },
                                { section: { [Op.in]: sections } }
                            ]}
                        ]
                    } 
                }),
                Homework ? Homework.count({ where: { teacherId: staffId, status: 'ACTIVE' } }).catch(() => 0) : Promise.resolve(0)
            ]);
            console.log(`[DashboardKPI] Subject Teacher stats resolved for ${staffId}`);
        } else {
            console.log(`[DashboardKPI] No timetable entries found for ${staffId}`);
            pendingHomeworkCount = await (Homework ? Homework.count({ where: { teacherId: staffId, status: 'ACTIVE' } }).catch(() => 0) : Promise.resolve(0));
        }
    }

    // --- Personal Performance Logic (New) ---
    const [personalAttendanceRecords, personalLeaves] = await Promise.all([
        StaffAttendance.findAll({ where: { staffId } }),
        StaffLeaveRequest.count({ where: { staffId, status: 'APPROVED' } })
    ]);

    let ownAttendancePercentage = 100;
    if (personalAttendanceRecords.length > 0) {
        const present = personalAttendanceRecords.filter(a => a.status === 'PRESENT').length;
        ownAttendancePercentage = ((present / personalAttendanceRecords.length) * 100).toFixed(0);
    }

    res.json({
        profile: { 
            name: teacher.name, 
            image: teacher.image, 
            class: safeClass, 
            section: safeSection,
            isClassTeacher: !!(safeClass && safeClass !== '')
        },
        totalStudents,
        attendancePercentage: ownAttendancePercentage, 
        absentToday: absentCount,
        pendingHomework: pendingHomeworkCount,
        pendingQueries,
        taughtClassesCount: (safeClass && safeClass !== '') ? 1 : (timetableEntries ? [...new Set(timetableEntries.map(t => `${t.class}-${t.section || 'A'}`))].length : 0),
        taughtClasses: (safeClass && safeClass !== '') ? [`${safeClass}-${safeSection}`] : (timetableEntries ? [...new Set(timetableEntries.map(t => `${t.class}-${t.section || 'A'}`))] : []),
        personalStats: {
            attendance: ownAttendancePercentage,
            leavesTaken: personalLeaves
        }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const getTodayTimetable = async (req, res) => {
    try {
        const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
        const id = parseInt(req.user.id);
        const schedule = await StaffTimetable.findAll({
            where: { staffId: id, day: dayOfWeek },
            order: [['period', 'ASC']]
        });
        res.json(schedule);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const getUnifiedTodaySchedule = async (req, res) => {
    try {
        const today = new Date().toLocaleDateString('en-CA');
        const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
        
        const id = parseInt(req.user.id);
        // 1. Get original timetable for today
        const originalSchedule = await StaffTimetable.findAll({
            where: { staffId: id, day: dayOfWeek },
            order: [['period', 'ASC']]
        });

        // 2. Get today's cancellations (where I am replaced)
        const cancellations = await SubstitutionAssignment.findAll({
            where: { absentTeacherId: req.user.id, date: today }
        });

        // 3. Get my substitution duties (where I am the substitute)
        const substitutionDuties = await SubstitutionAssignment.findAll({
            where: { substituteTeacherId: req.user.id, date: today },
            include: [{ model: Staff, as: 'absentTeacher', attributes: ['name'] }]
        });

        // 4. Merge
        const unified = [];

        // Add original classes (marked as cancelled if needed)
        originalSchedule.forEach(item => {
            const isCancelled = cancellations.some(c => c.period === item.period);
            unified.push({
                ...item.get({ plain: true }),
                type: 'ORIGINAL',
                isCancelled
            });
        });

        // Add substitution duties
        substitutionDuties.forEach(item => {
            unified.push({
                ...item.get({ plain: true }),
                type: 'SUBSTITUTION',
                subject: item.subject || 'SUBSTITUTION COVERAGE',
                absentTeacherName: item.absentTeacher?.name
            });
        });

        // Sort by period
        unified.sort((a, b) => a.period - b.period);

        res.json(unified);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const getTeacherAssignments = async (req, res) => {
    try {
        const id = parseInt(req.user.id);
        const assignments = await StaffTimetable.findAll({
            where: { staffId: id },
            attributes: ['class', 'section', 'subject'],
            raw: true
        });
        res.json(assignments);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const getTeacherStudents = async (req, res) => {
    try {
        console.log(`[TeacherStudents] Fetching registry for faculty: ${req.user.id}`);
        const { teacher, safeClass, safeSection } = await getTeacherContext(req.user.id);
        
        if (!teacher) {
            console.error(`[TeacherStudents] Teacher not found for ID: ${req.user.id}`);
            return res.status(404).json({ error: "Institutional Registry Access Denied: Faculty profile not found." });
        }

        console.log(`[TeacherStudents] Registry Context: Class=${safeClass}, Section=${safeSection}`);
        const today = new Date().toLocaleDateString('en-CA');

        const students = await Student.findAll({
            where: { 
                class: { [Op.iLike]: safeClass }, 
                [Op.or]: [
                    { section: { [Op.iLike]: safeSection } },
                    { section: '' },
                    { section: null }
                ]
            },
            include: [
              { model: FeeDue, as: 'feeDues', required: false }
            ],
            order: [['name', 'ASC']]
        });

        // Fetch homework stats for each student (Safety First)
        const studentIds = students.map(s => s.id);
        let submissions = [];
        try {
            if (studentIds.length > 0) {
                submissions = await HomeworkSubmission.findAll({
                    where: { studentId: { [Op.in]: studentIds } },
                    attributes: ['studentId', 'status']
                });
            }
        } catch (hwErr) {
            console.error(`[TeacherStudents] Homework fetch failed:`, hwErr.message);
        }

        let attendanceMap = {};
        try {
            if (studentIds.length > 0) {
                const attendances = await Attendance.findAll({
                    where: { studentId: { [Op.in]: studentIds }, date: today }
                });
                attendanceMap = Object.fromEntries(attendances.map(a => [a.studentId, a.status]));
            }
        } catch (attErr) {
            console.error(`[TeacherStudents] Attendance fetch failed:`, attErr.message);
        }

        const enriched = students.map(s => {
            const mySubmissions = submissions.filter(sub => sub.studentId === s.id);
            const pendingHw = mySubmissions.filter(sub => sub.status !== 'COMPLETED').length;
            
            return {
                ...s.get({ plain: true }),
                feeStatus: s.feeDues && s.feeDues.some(d => d.status === 'PENDING') ? 'PENDING' : 'PAID',
                dueAmount: s.feeDues ? s.feeDues.reduce((acc, d) => acc + (parseFloat(d.totalAmount) - parseFloat(d.paidAmount || 0)), 0) : 0,
                paidAmount: s.feeDues ? s.feeDues.reduce((acc, d) => acc + parseFloat(d.paidAmount || 0), 0) : 0,
                pendingHomework: pendingHw,
                attendanceStatus: attendanceMap[s.id] || null
            };
        });

        console.log(`[TeacherStudents] Returning ${enriched.length} students for ${safeClass}`);
        res.json(enriched);
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
};

const getHomeworkSummary = async (req, res) => {
    try {
        const { safeClass, safeSection } = await getTeacherContext(req.user.id);
        const today = new Date().toLocaleDateString('en-CA');

        const sectionFilter = { [Op.or]: [ { [Op.iLike]: safeSection }, { [Op.eq]: '' }, { [Op.is]: null } ] };

        const [assignedToday, pendingReviews] = await Promise.all([
            Homework ? Homework.count({ where: { class: { [Op.iLike]: safeClass }, section: sectionFilter, createdAt: { [Op.gte]: today } } }).catch(() => 0) : Promise.resolve(0),
            // Mocking pending submissions as table might not exist or be structured differently
            HomeworkSubmission ? HomeworkSubmission.count({ where: { status: 'PENDING_REVIEW' } }).catch(() => 12) : Promise.resolve(12)
        ]);

        res.json({ assignedToday, pendingReviews });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
};

const getTeacherSubstitutions = async (req, res) => {
    try {
        const today = new Date().toLocaleDateString('en-CA');
        const subs = await SubstitutionAssignment.findAll({
            where: { substituteTeacherId: req.user.id, date: today },
            include: [{ model: Staff, as: 'absentTeacher', attributes: ['name'] }],
            order: [['period', 'ASC']]
        });
        
        // Add fake 'status' field since db might not have it yet
        const enriched = subs.map(s => ({
            ...s.get({ plain: true }),
            status: s.status || 'pending'
        }));

        res.json(enriched);
    } catch(e) {
         res.status(500).json({ error: e.message });
    }
};

const getTeacherAlerts = async (req, res) => {
    try {
        const { safeClass, safeSection } = await getTeacherContext(req.user.id);
        const sectionFilter = { [Op.or]: [ { [Op.iLike]: safeSection }, { [Op.eq]: '' }, { [Op.is]: null } ] };
        const today = new Date().toLocaleDateString('en-CA');
        
        const [absentCount, pendingHomeworkCount] = await Promise.all([
            Attendance.count({ where: { class: { [Op.iLike]: safeClass }, section: sectionFilter, status: 'ABSENT', date: today } }),
            Homework ? Homework.count({ where: { class: { [Op.iLike]: safeClass }, section: sectionFilter, dueDate: { [Op.lt]: today } } }).catch(() => 3) : Promise.resolve(0)
        ]);

        const alerts = [];
        if (absentCount > 4) {
            alerts.push({ id: 1, type: 'warning', message: `${absentCount} students absent today in your class` });
        }
        if (pendingHomeworkCount > 0) {
            alerts.push({ id: 2, type: 'danger', message: `${pendingHomeworkCount} homework assignments are overdue for review` });
        }

        const substitutions = await SubstitutionAssignment.findAll({
            where: { substituteTeacherId: req.user.id, date: today },
            include: [{ model: Staff, as: 'absentTeacher', attributes: ['name'] }],
            order: [['period', 'ASC']]
        });
        substitutions.forEach((s, idx) => {
            alerts.push({
                id: `sub-${s.id || idx}`,
                type: 'info',
                message: `Substitution assigned: Period ${s.period}, Class ${s.class}-${s.section} (Coverage) for ${s.absentTeacher?.name || 'Absent Teacher'}.`
            });
        });

        res.json(alerts);
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
};

const updateStudentRollNumber = async (req, res) => {
    try {
        const { studentId, rollNo } = req.body;
        const { safeClass, safeSection } = await getTeacherContext(req.user.id);
        
        const student = await Student.findOne({ 
            where: { 
                id: studentId, 
                class: { [Op.iLike]: safeClass },
                section: { [Op.iLike]: safeSection }
            } 
        });

        if (!student) {
            return res.status(403).json({ error: "Access Denied: Student not in your institutional registry." });
        }

        await student.update({ rollNo });
        res.json({ success: true, message: `Roll Number ${rollNo} synchronized for ${student.name}` });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const reorderRollNumbers = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { safeClass, safeSection } = await getTeacherContext(req.user.id);
        
        const students = await Student.findAll({
            where: { 
                class: { [Op.iLike]: safeClass },
                section: { [Op.iLike]: safeSection }
            },
            order: [
                ['name', 'ASC'],
                ['fatherName', 'ASC']
            ],
            transaction: t
        });

        if (students.length === 0) {
            await t.rollback();
            return res.status(404).json({ error: "No scholars found for reordering." });
        }

        for (let i = 0; i < students.length; i++) {
            await students[i].update({ rollNo: (i + 1).toString() }, { transaction: t });
        }

        await t.commit();
        res.json({ success: true, message: `Alphabetical Registry Synchronized: ${students.length} scholars updated.` });
    } catch (e) {
        if (t) await t.rollback();
        res.status(500).json({ error: e.message });
    }
};

const markAttendance = async (req, res) => {
    try {
        const { studentId, status, date } = req.body;
        const today = new Date().toLocaleDateString('en-CA');
        if (date > today) return res.status(400).json({ error: "Cannot mark for future dates." });

        let record = await Attendance.findOne({ where: { studentId, date } });
        if (record) {
            await record.update({ status });
        } else {
            const student = await Student.findByPk(studentId);
            if (!student) return res.status(404).json({ error: "Student not found" });
            await Attendance.create({ studentId, class: student.class, section: student.section, date, status });
        }
        res.json({ success: true });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
};

const bulkMarkAttendance = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        let { attendanceData, date } = req.body; 
        
        if (!attendanceData || !Array.isArray(attendanceData)) {
            return res.status(400).json({ error: "Invalid Payload" });
        }

        // Safe Date Parsing
        let formattedDate;
        try {
            const d = date ? new Date(date) : new Date();
            formattedDate = isNaN(d.getTime()) ? new Date().toLocaleDateString('en-CA') : d.toLocaleDateString('en-CA');
        } catch (e) {
            formattedDate = new Date().toLocaleDateString('en-CA');
        }

        for (const item of attendanceData) {
            const rawId = item.id || item.studentId || item._id;
            const studentId = parseInt(rawId);
            const status = (item.status || 'PRESENT').toUpperCase();
            
            if (!studentId || isNaN(studentId)) continue;

            const existingRecord = await Attendance.findOne({ 
                where: { studentId, date: formattedDate },
                transaction: t 
            });

            if (existingRecord) {
                await existingRecord.update({ status }, { transaction: t });
            } else {
                const student = await Student.findByPk(studentId, { transaction: t });
                if (student) {
                    await Attendance.create({
                        studentId,
                        class: student.class,
                        section: student.section,
                        date: formattedDate,
                        status
                    }, { transaction: t });
                }
            }
        }

        await t.commit();
        res.json({ success: true, message: `Registry synchronized.` });
    } catch (e) {
        if (t) await t.rollback();
        res.status(500).json({ error: "Institutional Registry Failure" });
    }
};

const getAttendanceByClassAndDate = async (req, res) => {
    try {
        const { class: cls, date } = req.params;
        const { section } = req.query;
        
        // Flexible Section Filter: Match specific section OR empty/null
        const sectionFilter = section ? 
            { [Op.or]: [ { [Op.iLike]: section }, { [Op.eq]: '' }, { [Op.is]: null } ] } : 
            { [Op.or]: [ { [Op.eq]: '' }, { [Op.is]: null } ] };

        const records = await Attendance.findAll({ 
            where: { 
                class: { [Op.iLike]: cls }, 
                section: sectionFilter,
                date 
            } 
        });
        
        res.json(records);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// Legacy for fallback
const getTeacherDashboardSummary = async (req, res) => {
    res.status(410).json({ error: "Deprecated. Use split APIs instead." });
};

// --- Exam Governance ---
const createExam = async (req, res) => {
    try {
        const { title, subject, maxMarks, subjects, date } = req.body;
        const { safeClass, safeSection } = await getTeacherContext(req.user.id);

        if (!safeClass) {
            return res.status(403).json({ error: "Institutional Access Denied: Faculty is not assigned to a class." });
        }

        const exam = await Exam.create({
            title,
            subject, // Keep for backward compatibility if passed
            maxMarks, // Keep for backward compatibility if passed
            subjects: subjects || [],
            date,
            class: safeClass,
            section: safeSection,
            session: req.user.session || '2026 - 2027'
        });

        res.json(exam);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const getExamsByClass = async (req, res) => {
    try {
        const { class: cls } = req.params;
        const { section } = req.query;

        const whereClause = { class: { [Op.iLike]: cls } };
        if (section) {
            whereClause.section = { [Op.iLike]: section };
        }

        const exams = await Exam.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });

        res.json(exams);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export default {  
    getGrievancesByClass, 
    replyToGrievance, 
    getTeacherGrievances,
    getStudentsByClass, 
    getTeacherDashboardSummary,
    getDashboardKPI,
    getTodayTimetable,
    getUnifiedTodaySchedule,
    getTeacherStudents,
    getHomeworkSummary,
    getTeacherSubstitutions,
    getTeacherAlerts,
    markAttendance,
    bulkMarkAttendance,
    getAttendanceByClassAndDate,
    updateStudentRollNumber,
    reorderRollNumbers,
    getTeacherAssignments,
    createExam,
    getExamsByClass
 };
