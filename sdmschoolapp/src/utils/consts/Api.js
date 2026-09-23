// Backend server endpoints for SDM School App
// const WEB_BASE_URL = "http://10.178.141.45:5001/";
// const WEB_BASE_URL_PROFILE = "http://10.178.141.45:5001/";
// const API_BASE_URL = "http://10.178.141.45:5001/api/";



// For Emulator and Physical Device testing on local network
// Use '10.0.2.2' for Android Emulator or your Mac IP '10.222.255.45' for physical device
const IP = '10.222.255.45';
const WEB_BASE_URL = `http://${IP}:4000/`;
const WEB_BASE_URL_PROFILE = `http://${IP}:4000/`;
const API_BASE_URL = `http://${IP}:4000/`;

const API_END_POINTS = {
    // Auth Endpoints
    login: "auth/login",
    profile: "auth/profile",

    // Admin Endpoints
    students: "admin/students",
    staff: "admin/staff",
    exams: "admin/exams",
    gallery: "admin/gallery",
    attendance: "admin/attendance",
    schoolInfo: "school-info",
    notices: "notices",
    homework: "homework",
    events: "events",
    studentDashboard: "students/dashboard",
    studentAttendance: "students",
    studentResults: "students/results",
    studentTimetable: "students/timetable",
    // Teacher Endpoints
    teacherStudents: "teacher/students",
    markAttendance: "teacher/attendance/bulk",
    bulkResults: "teacher/results/bulk",
    broadcast: "teacher/broadcast",
    stats: "stats",
    homeworkStatus: "student/homework/status",
    myHomeworkStatus: "student/homework/my-status",
    // 🏠 FACULTY LEAVE GOVERNANCE
    applyLeave: "staff/leave/apply",
    myLeaves: "staff/leave/my-requests",
    myAttendance: "staff/my-attendance",
    selfAttendance: "staff/self-attendance",
    staffTimetable: "admin/staff/timetable",
    substitutionVacancies: "admin/staff/substitution/vacancies",
    settings: "public/settings",
    banners: "public/banners",
    webBanners: "public/web-banners"
}

export {
    API_BASE_URL,
    API_END_POINTS,
    WEB_BASE_URL,
    WEB_BASE_URL_PROFILE
}