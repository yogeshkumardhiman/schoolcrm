import { Student, Staff, Topper, ComplianceDoc, Grievance, Notice, Gallery, StaffAttendance, StaffTimetable, SubstitutionAssignment, Homework, Attendance, FeePayment, Testimonial, FeeStructure, StudentFee, Result, StaffLeaveRequest, SalaryStructure, sequelize } from '../../models/index.js';
import { Op } from 'sequelize';


const getDashboardSummary = async (session = '2026 - 2027') => {
    try {
        const today = new Date().toLocaleDateString('en-CA'); 

        const [studentCount, staffCount, teacherCount, toppersCount, grievancesCount, absentTeachersToday, activeSubstitutions] = await Promise.all([
            Student.count({ where: { session } }),
            Staff.count(),
            Staff.count({ where: { role: 'TEACHER' } }),
            Topper.count({ where: { session } }),
            Grievance.count({ where: { status: 'PENDING' } }),
            StaffAttendance.count({ where: { date: today, status: { [Op.in]: ['ABSENT', 'LEAVE'] } } }),
            SubstitutionAssignment.count({ where: { date: today } })
        ]);

        let overdueTasks = 0;
        try {
            if (Homework) {
                overdueTasks = await Homework.count({ where: { dueDate: { [Op.lt]: today } } });
            }
        } catch (err) { overdueTasks = 0; }

        const [presentStudentsToday, presentTeachersToday] = await Promise.all([
            Attendance ? Attendance.count({ where: { date: today, status: 'PRESENT' } }) : Promise.resolve(0),
            StaffAttendance.count({ where: { date: today, status: 'PRESENT' } })
        ]);

        const attendancePercentage = studentCount > 0 ? ((presentStudentsToday / studentCount) * 100).toFixed(1) : "No Data";
        const staffAttendancePercentage = teacherCount > 0 ? ((presentTeachersToday / teacherCount) * 100).toFixed(1) : 0;

        const classData = await Student.findAll({
            attributes: ['class', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            group: ['class'],
            order: [[sequelize.col('class'), 'ASC']]
        });

        const systemAlerts = [];
        if (absentTeachersToday > activeSubstitutions) {
            systemAlerts.push({ 
                id: 1, type: 'danger', message: `${absentTeachersToday - activeSubstitutions} Period vacancies need immediate coverage`, action: 'Assign Substitute', link: '/staff/substitution', urgent: true 
            });
        }
        if (overdueTasks > 0) {
            systemAlerts.push({ 
                id: 2, type: 'warning', message: `${overdueTasks} Academic assignments are past deadline`, action: 'Send Reminders', link: '/homework', urgent: false 
            });
        }

        const todaySummary = {
            teachersAbsent: absentTeachersToday,
            activeClasses: activeSubstitutions + (presentTeachersToday > 5 ? 5 : presentTeachersToday),
            attendanceLogged: presentStudentsToday > 0,
            collectionToday: 0
        };

        try {
            const collectionToday = await FeePayment.sum('amountPaid', { where: { createdAt: { [Op.gte]: today } } });
            todaySummary.collectionToday = collectionToday || 0;
        } catch (err) { todaySummary.collectionToday = 0; }

        const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
        const currentHour = new Date().getHours();
        let currentPeriodName = "Active Classes";
        if (currentHour < 9) currentPeriodName = "Morning Assembly";
        else if (currentHour < 10) currentPeriodName = "Period 1";
        else if (currentHour < 11) currentPeriodName = "Period 2";
        else if (currentHour < 12) currentPeriodName = "Period 3";
        else if (currentHour < 13) currentPeriodName = "Lunch Break";
        else currentPeriodName = "Afternoon Sessions";

        const timetables = await StaffTimetable.findAll({
            where: { day: dayOfWeek },
            include: [{ model: Staff, as: 'staff', attributes: ['name'] }],
            limit: 5
        });

        const liveOperations = {
            currentPeriod: currentPeriodName,
            classes: timetables.map(t => ({
                id: t.id,
                class: `${t.class}-${t.section}`,
                subject: t.subject,
                teacher: t.staff ? t.staff.name : "Unassigned",
                status: absentTeachersToday > 0 && !activeSubstitutions ? "danger" : "ok"
            }))
        };

        const topTeachers = await Staff.findAll({ where: { role: 'TEACHER' }, limit: 3, attributes: ['id', 'name', 'subject'] });
        const teacherPerformance = topTeachers.map(t => ({ id: t.id, name: t.name, metric: t.subject ? `Subject: ${t.subject}` : 'Teacher', status: "ok" }));

        const actionRequired = [];
        const vacancies = await StaffTimetable.findAll({
            where: { day: dayOfWeek },
            include: [{ model: Staff, as: 'staff', include: [{ model: StaffAttendance, as: 'attendance', where: { date: today, status: { [Op.in]: ['ABSENT', 'LEAVE'] } } }] }],
            limit: 2
        });

        vacancies.filter(v => v.staff?.attendance?.length > 0).forEach(v => {
            actionRequired.push({
                id: `vac-${v.id}`, priority: 'CRITICAL', title: `Uncovered: ${v.class}-${v.section} (${v.subject})`, desc: `${v.staff.name} is absent. Period ${v.period} needs a substitute.`, action: "Assign Now", link: "/staff/substitution"
            });
        });

        try {
            if (StudentFee) {
                const defaulters = await StudentFee.count({ where: { dueAmount: { [Op.gt]: 5000 } } });
                if (defaulters > 0) {
                    actionRequired.push({
                        id: 'fee-1', priority: 'HIGH', title: `Fee Defaulters: ${defaulters} Students`, desc: "Significant outstanding dues detected for the current session.", action: "Send Reminders", link: "/fees"
                    });
                }
            }
        } catch (e) {}

        if (attendancePercentage === "No Data") {
            actionRequired.push({
                id: 'att-1', priority: 'MEDIUM', title: "Morning Attendance Registry Pending", desc: "Multiple class teachers haven't synchronized today's logs.", action: "Mark All", link: "/staff"
            });
        }

        const quickActions = [
            { id: 'qa-1', label: "Mark All Attendance", icon: "CheckCircle", color: "emerald" },
            { id: 'qa-2', label: "Send Fee Reminders", icon: "Bell", color: "orange" },
            { id: 'qa-3', label: "Assign All Substitutes", icon: "Zap", color: "blue" }
        ];

        const smartInsights = [];
        if (attendancePercentage !== "No Data" && parseFloat(attendancePercentage) < 85) {
            smartInsights.push({ id: 1, text: `Critical attendance drop (${attendancePercentage}%) detected across senior classes.`, suggestion: "Analyze transport delays or seasonal illness trends.", actionLabel: "Analyze Trend" });
        }
        if (absentTeachersToday > 0 && activeSubstitutions < absentTeachersToday) {
            smartInsights.push({ id: 1, text: `${absentTeachersToday} Faculty members are offline today, leaving potential gaps in period delivery.`, suggestion: "Assign remaining substitutes to maintain academic continuity.", actionLabel: "Resolve Vacancies", link: "/staff/substitution" });
        } else if (attendancePercentage === "No Data") {
            smartInsights.push({ id: 2, text: "Student attendance registry for today has not been synchronized yet.", suggestion: "Send a reminder to class teachers to complete attendance marking.", actionLabel: "Notify Teachers", link: "/staff" });
        } else {
            smartInsights.push({ id: 3, text: "Institutional operations are running within optimal parameters today.", suggestion: "No immediate intervention required. All protocols are active.", actionLabel: "View Report" });
        }

        let recentActivities = [];
        try {
            const [recentHomework, recentGrievances, recentSubstitutions] = await Promise.all([
                Homework ? Homework.findAll({ attributes: ['id', 'class', 'section', 'subject', 'createdAt'], limit: 2, order: [['createdAt', 'DESC']] }).catch(() => []) : Promise.resolve([]),
                Grievance.findAll({ attributes: ['id', 'studentName', 'class', 'status', 'createdAt'], limit: 2, order: [['createdAt', 'DESC']] }).catch(() => []),
                SubstitutionAssignment.findAll({ attributes: ['id', 'period', 'class', 'section', 'createdAt'], limit: 2, order: [['createdAt', 'DESC']] }).catch(() => [])
            ]);

            const formatActTime = (dateStr) => {
                if(!dateStr) return "Just now";
                const d = new Date(dateStr);
                return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            };

            recentActivities = [
                ...recentHomework.map(h => ({ id: `hw-${h.id}`, title: "Assignment created", desc: `${h.class}-${h.section} ${h.subject}`, time: formatActTime(h.createdAt), rawTime: new Date(h.createdAt || new Date()).getTime(), iconType: 'BookOpen', color: 'text-blue-500', bg: 'bg-blue-50' })),
                ...recentGrievances.map(g => ({ id: `gr-${g.id}`, title: g.status === 'RESOLVED' ? "Grievance resolved" : "Grievance raised", desc: `${g.studentName || 'Student'} (${g.class || ''})`, time: formatActTime(g.createdAt), rawTime: new Date(g.createdAt || new Date()).getTime(), iconType: g.status === 'RESOLVED' ? 'CheckCircle' : 'AlertTriangle', color: g.status === 'RESOLVED' ? 'text-emerald-500' : 'text-orange-500', bg: 'bg-emerald-50' })),
                ...recentSubstitutions.map(s => ({ id: `sub-${s.id}`, title: "Substitution assigned", desc: `Period ${s.period} in ${s.class}-${s.section}`, time: formatActTime(s.createdAt), rawTime: new Date(s.createdAt || new Date()).getTime(), iconType: 'Zap', color: 'text-purple-500', bg: 'bg-purple-50' }))
            ].sort((a, b) => b.rawTime - a.rawTime).slice(0, 4);
        } catch (actErr) { console.error("Activity mapping error:", actErr); }

        const healthScores = {
            operational: Math.max(0, 100 - ((absentTeachersToday / (teacherCount || 1)) * 100)).toFixed(1),
            financial: studentCount > 0 ? 0 : 100,
            academic: attendancePercentage !== "No Data" ? parseFloat(attendancePercentage) : 95.0,
            security: 100.0
        };

        return {
            totalStudents: studentCount, totalStaff: staffCount, totalTeachers: teacherCount, activeToppers: toppersCount, pendingGrievances: grievancesCount, attendancePercentage, staffAttendancePercentage, absentTeachersToday, activeSubstitutions, overdueTasks, systemAlerts, todaySummary, actionRequired, quickActions, healthScores, liveOperations, teacherPerformance, financialSnapshot: { todayCollection: 0, pendingFees: 0, monthlyRevenue: 0, defaultersCount: 0 }, smartInsights, recentActivities,
            classDistribution: classData.map(item => ({ class: item.getDataValue('class'), count: parseInt(item.getDataValue('count')) }))
        };
    } catch (e) {
        console.error("[AdminService Error]", e);
        throw e;
    }
};

const getToppers = async () => {
    return await Topper.findAll({ order: [['rank', 'ASC']] });
};

const getTestimonials = async () => {
    return await Testimonial.findAll({ order: [['id', 'DESC']] });
};

const getGrievances = async () => {
    try {
        const grievances = await Grievance.findAll({ order: [['id', 'DESC']] });
        const plainGrievances = grievances.map(g => g.get({ plain: true }));
        const [staff, students] = await Promise.all([
            Staff.findAll({ where: { role: 'TEACHER' } }),
            Student.findAll()
        ]);

        const teacherMap = {};
        staff.forEach(s => { teacherMap[`${s.class}-${s.section}`.toUpperCase()] = { name: s.name, phone: s.phone }; });

        const studentImgMap = {};
        students.forEach(s => { 
            const sId = s.id?.toString();
            if (sId) studentImgMap[sId] = s.image;
            if (s.admissionNo) studentImgMap[s.admissionNo] = s.image;
            if (s.name) studentImgMap[s.name.toLowerCase().trim()] = s.image; 
        });

        return plainGrievances.map(g => ({
            ...g,
            studentImage: studentImgMap[g.studentId?.toString()] || studentImgMap[g.admissionNo] || studentImgMap[g.studentName?.toLowerCase().trim()] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${g.studentName || 'Scholar'}`,
            classTeacher: teacherMap[`${g.class}-${g.section}`.toUpperCase()] || { name: 'Unassigned', phone: 'N/A' }
        }));
    } catch (e) { throw e; }
};

const getStaffPersonalProfile = async (staffId) => {
    const staff = await Staff.findByPk(staffId, {
        include: [
            { model: SalaryStructure, as: 'salaryStructure' },
            { model: StaffLeaveRequest, as: 'leaveRequests' },
            { model: StaffTimetable, as: 'timetable' }
        ]
    });
    if (!staff) {
        throw new Error('Staff member not found');
    }
    return staff;
};

export default { getDashboardSummary, getToppers, getTestimonials, getGrievances, getStaffPersonalProfile };
