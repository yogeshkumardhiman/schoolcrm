import { API_END_POINTS, APIkit } from "../utils";

class APIService {
    // 🛡️ AUTHENTICATION
    login = (payload) => {
        const endpoint = payload?.role === 'student' ? 'auth/student/login' : API_END_POINTS.login;
        return APIkit.post(endpoint, payload);
    };

    // 🎓 STUDENT PORTAL
    getStudentDashboard = (admissionNo) => {
        return APIkit.get(`${API_END_POINTS.studentDashboard}/${admissionNo}`);
    };

    getClassTeacher = (className, section) => {
        return APIkit.get(`students/class-teacher/${className}/${section}`);
    };

    getStudentAttendance = (studentId) => {
        return APIkit.get(`${API_END_POINTS.studentAttendance}/${studentId}/attendance`);
    };

    getStudentResults = (studentId) => {
        return APIkit.get(`${API_END_POINTS.studentResults}/${studentId}`);
    };

    // 💳 ONLINE FEE PAYMENTS
    createPaymentOrder = (payload) => {
        return APIkit.post('payment/create-order', payload);
    };

    verifyPayment = (payload) => {
        return APIkit.post('payment/verify', payload);
    };

    getNotices = (className, sectionName, studentId, page = null, limit = 10) => {
        let params = [];
        if (className) params.push(`class=${encodeURIComponent(className)}`);
        if (sectionName) params.push(`section=${encodeURIComponent(sectionName)}`);
        if (studentId) params.push(`studentId=${encodeURIComponent(studentId)}`);
        if (page) {
            params.push(`page=${encodeURIComponent(page)}`);
            params.push(`limit=${encodeURIComponent(limit)}`);
        }
        
        const queryString = params.length > 0 ? `?${params.join('&')}` : '';
        return APIkit.get(`${API_END_POINTS.notices}${queryString}`);
    };

    getEvents = () => {
        return APIkit.get(API_END_POINTS.events);
    };

    // 👨‍🏫 TEACHER HUB
    getClassStudents = (className, sectionName = '') => {
        const c = encodeURIComponent((className || '').trim());
        const s = encodeURIComponent((sectionName || '').trim());
        const path = s ? `${c}/${s}` : c;
        return APIkit.get(`${API_END_POINTS.teacherStudents}/${path}`);
    };

    markAttendance = (payload) => {
        return APIkit.post(API_END_POINTS.markAttendance, payload);
    };

    postBulkResults = (payload) => {
        return APIkit.post(API_END_POINTS.bulkResults, payload);
    };

    broadcastNotice = (payload) => {
        return APIkit.post('admin/broadcast', payload);
    };
    
    postHomework = (payload) => {
        return APIkit.post('admin/homework', payload);
    };

    getHomework = (className, sectionName) => {
        return APIkit.get(`${API_END_POINTS.homework}?class=${className}&section=${sectionName}`);
    };

    getTeacherHomework = () => {
        return APIkit.get('teacher/homework');
    };

    getStudentHomeworkStatus = (studentId) => {
        return APIkit.get(`${API_END_POINTS.myHomeworkStatus}?studentId=${studentId}`);
    };

    updateHomeworkStatus = (payload) => {
        return APIkit.post(API_END_POINTS.homeworkStatus, payload);
    };

    getHomeworkStats = (id) => {
        return APIkit.get(`teacher/homework/stats/${id}`);
    };

    updateStudentSubmissionStatus = (payload) => {
        return APIkit.post('teacher/homework/submission/status', payload);
    };

    getAttendance = (className, date, section = '') => {
        const c = encodeURIComponent((className || '').trim());
        const s = encodeURIComponent((section || '').trim());
        const query = s ? `?section=${s}` : '';
        return APIkit.get(`teacher/attendance/${c}/${date}${query}`);
    };

    getGrievances = (className, section) => {
        return APIkit.get(`teacher/grievance/${className}/${section}`);
    };

    putGrievanceReply = (id, payload) => {
        return APIkit.put(`teacher/grievance/reply/${id}`, payload);
    };

    // 📝 FACULTY LEAVE GOVERNANCE
    postLeaveRequest = (payload) => {
        return APIkit.post(API_END_POINTS.applyLeave, payload);
    };

    getMyLeaveRequests = () => {
        return APIkit.get(API_END_POINTS.myLeaves);
    };

    getMyAttendance = () => {
        return APIkit.get(API_END_POINTS.myAttendance);
    };

    postSelfAttendance = (payload) => {
        return APIkit.post(API_END_POINTS.selfAttendance, payload);
    };

    getMySubstitutions = () => {
        return APIkit.get('staff/my-substitutions');
    };

    // 🏫 INSTITUTIONAL DATA
    getStaffList = () => {
        return APIkit.get(API_END_POINTS.staff);
    };

    getTimetable = (id) => {
        return APIkit.get(`${API_END_POINTS.staffTimetable}/${id}`);
    };

    getStudentTimetable = (className, section) => {
        return APIkit.get(`${API_END_POINTS.studentTimetable}/${className}/${section}`);
    };

    getSchoolInfo = () => {
        return APIkit.get(API_END_POINTS.schoolInfo);
    };

    getAdminDashboardSummary = () => {
        return APIkit.get('admin/dashboard-summary');
    };

    getProfile = () => {
        return APIkit.get(API_END_POINTS.profile);
    };

    getAllGrievances = () => {
        return APIkit.get('admin/all-grievances');
    };

    reorderRolls = () => {
        return APIkit.put('teacher/students/reorder');
    };

    // 🎓 STUDENT GRIEVANCES / HELP DESK
    getStudentGrievances = (studentId) => {
        return APIkit.get(`student/grievance/${studentId}`);
    };

    postStudentGrievance = (payload) => {
        return APIkit.post('student/grievance', payload);
    };

    // 📝 TEACHER EXAMS / ASSESSMENTS
    getExamsList = (className) => {
        return APIkit.get(`teacher/exams/${className}`);
    };

    createExam = (payload) => {
        return APIkit.post('teacher/exams', payload);
    };

    // 🏫 ADMIN STUDENT HUB & TELEMETRY
    getAdminStudents = () => {
        return APIkit.get('admin/students');
    };

    getStudentDashboardDetails = (studentId) => {
        return APIkit.get(`/admin/students/dashboard/${studentId}`);
    };

    // 👤 STAFF PROFILE GOVERNANCE
    updateStaffProfile = (userId, payload) => {
        return APIkit.put(`staff/profile/${userId}`, payload);
    };
    // 🔔 PUSH NOTIFICATION - Device Token Sync
    syncDeviceToken = (deviceToken) => {
        return APIkit.put('auth/device-token', { deviceToken });
    };
}

export { APIService };