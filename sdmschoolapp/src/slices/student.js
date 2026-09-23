import { APIService } from "../services/APIServices";


// --- 🎓 STUDENT THUNKS ---

// Fetch Student Dashboard Data
export const getDashboardData = (admissionNo, callback) => {
    return async dispatch => {
        try {
            console.log(`📡 [AUTH HUB] Requesting Dashboard for Admission: ${admissionNo}`);
            const response = await new APIService().getStudentDashboard(admissionNo);
            console.log(`✅ [AUTH HUB] Dashboard Response Status: ${response?.status}`);
            if (response?.status === 200) {
                callback(response.data);
            } else {
                console.log(`⚠️ [AUTH HUB] Unexpected Response:`, response?.data);
                callback(null);
            }
        } catch (err) {
            console.error("💥 Dashboard Fetch Error:", err?.response?.data || err.message);
            callback(null);
        }
    };
};

// Fetch Student Attendance
export const getAttendanceRecord = (studentId, callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().getStudentAttendance(studentId);
            if (response?.status === 200) {
                callback(response.data);
            }
        } catch (err) {
            console.error("Attendance Fetch Error:", err);
            callback(null);
        }
    };
};

// Fetch Academic Results
export const getAcademicResults = (studentId, callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().getStudentResults(studentId);
            if (response?.status === 200) {
                callback(response.data);
            }
        } catch (err) {
            console.error("Results Fetch Error:", err);
            callback(null);
        }
    };
};

// Fetch School Notices
export const getInstitutionalNotices = (...args) => {
    let className = null;
    let sectionName = null;
    let studentId = null;
    let page = null;
    let limit = 10;
    let callback = () => {};

    if (args.length === 1 && typeof args[0] === 'function') {
        callback = args[0];
    } else {
        className = args[0];
        sectionName = args[1];
        studentId = args[2];
        if (typeof args[3] === 'function') {
            callback = args[3];
        } else {
            page = args[3];
            if (typeof args[4] === 'function') {
                callback = args[4];
            } else {
                limit = args[4] || 10;
                callback = args[5] || (() => {});
            }
        }
    }

    return async dispatch => {
        try {
            const response = await new APIService().getNotices(className, sectionName, studentId, page, limit);
            if (response?.status === 200) {
                callback(response.data);
            }
        } catch (err) {
            console.error("Notices Fetch Error:", err);
            callback(null);
        }
    };
};
// Fetch Class Homework
export const getHomeworkRecords = (className, sectionName, callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().getHomework(className, sectionName);
            if (response?.status === 200) {
                callback(response.data);
            }
        } catch (err) {
            console.error("Homework Fetch Error:", err);
            callback(null);
        }
    };
};

// Fetch Homework Status for Student
export const getHomeworkStatus = (studentId, callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().getStudentHomeworkStatus(studentId);
            if (response?.status === 200) {
                callback(response.data);
            }
        } catch (err) {
            console.error("Homework Status Fetch Error:", err);
            callback(null);
        }
    };
};

// Update Homework Status
export const updateHomeworkStatus = (payload, callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().updateHomeworkStatus(payload);
            if (response?.status === 200) {
                callback(true);
            } else {
                callback(false);
            }
        } catch (err) {
            console.error("Homework Status Update Error:", err);
            callback(false);
        }
    };
};

// Fetch Class Teacher
export const getClassTeacherData = (className, section, callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().getClassTeacher(className, section);
            if (response?.status === 200) {
       
                callback(response.data);
            }
        } catch (err) {
            console.error("Class Teacher Fetch Error:", err);
            callback(null);
        }
    };
  
};

export const getTimetable = (className, section, callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().getStudentTimetable(className, section);
            if (response?.status === 200) {
                callback(response.data);
            }
        } catch (err) {
            console.error("Timetable Fetch Error:", err);
            callback(null);
        }
    };
};

export const getEventsRecord = (callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().getEvents();
            if (response?.status === 200) {
                callback(response.data);
            }
        } catch (err) {
            console.error("Events Fetch Error:", err);
            callback(null);
        }
    };
};

export const getStudentQueriesList = (studentId, callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().getStudentGrievances(studentId);
            if (response?.status === 200) {
                callback(response.data);
            }
        } catch (err) {
            console.error("Student Queries Fetch Error:", err);
            callback(null);
        }
    };
};

export const submitStudentGrievance = (payload, callback) => {
    return async dispatch => {
        try {
            const response = await new APIService().postStudentGrievance(payload);
            if (response?.status === 200 || response?.status === 201) {
                callback(response.data);
            } else {
                callback(null);
            }
        } catch (err) {
            console.error("Student Query Submission Error:", err);
            callback(null);
        }
    };
};

export default {
    getDashboardData,
    getAttendanceRecord,
    getAcademicResults,
    getClassTeacherData,
    getInstitutionalNotices,
    getHomeworkRecords,
    getHomeworkStatus,
    updateHomeworkStatus,
    getTimetable,
    getEventsRecord,
    getStudentQueriesList,
    submitStudentGrievance
};